use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use chrono::Local;
use clap::Parser;
use notify::{Config, Event, RecommendedWatcher, RecursiveMode, Watcher};
use serde::Serialize;

// ── CLI ──────────────────────────────────────────────────────────────

#[derive(Parser)]
#[command(name = "hexshade", about = "Blog publish tool — one command to rule them all")]
struct Cli {
    /// One-shot: rebuild index.json then exit
    #[arg(long)]
    index: bool,

    /// One-shot: rebuild index + git add/commit/push then exit
    #[arg(long)]
    publish: bool,

    /// Path to the website directory (default: auto-detect)
    #[arg(long, short)]
    dir: Option<PathBuf>,
}

// ── types ────────────────────────────────────────────────────────────

#[derive(Serialize, Clone)]
struct PostEntry {
    slug: String,
    title: String,
    excerpt: String,
    date: String,
    category: String,
    tags: Vec<String>,
}

#[derive(Serialize)]
struct Index {
    posts: Vec<PostEntry>,
    generated_at: String,
}

// ── frontmatter ──────────────────────────────────────────────────────

fn parse_frontmatter(content: &str) -> (HashMap<String, String>, &str) {
    let trimmed = content.trim_start();
    if !trimmed.starts_with("---") {
        return (HashMap::new(), content);
    }

    let rest = &trimmed[3..];
    let Some(end) = rest.find("\n---") else {
        return (HashMap::new(), content);
    };

    let fm_text = &rest[..end];
    let body = &rest[end + 4..].trim_start();

    let mut meta = HashMap::new();
    for line in fm_text.lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        if let Some((k, v)) = line.split_once(':') {
            meta.insert(k.trim().to_string(), v.trim().to_string());
        }
    }

    (meta, body)
}

fn parse_tags(raw: &str) -> Vec<String> {
    let s = raw.trim();
    if s.starts_with('[') && s.ends_with(']') {
        s[1..s.len() - 1]
            .split(',')
            .map(|t| t.trim().trim_matches('\'').trim_matches('"').to_string())
            .filter(|t| !t.is_empty())
            .collect()
    } else if s.is_empty() {
        vec![]
    } else {
        vec![s.to_string()]
    }
}

fn make_excerpt(body: &str, max_len: usize) -> String {
    let text = body
        .lines()
        .filter(|l| !l.starts_with('#'))
        .collect::<Vec<_>>()
        .join(" ")
        .replace("![", "")
        .split_inclusive(')')
        .map(|s| {
            if s.contains("](") {
                s.split("](").next().unwrap_or(s).to_string()
            } else {
                s.to_string()
            }
        })
        .collect::<String>()
        .replace('`', "")
        .replace('<', "");
    let clean = text
        .chars()
        .take(max_len + 3)
        .collect::<String>();
    if clean.chars().count() > max_len {
        let s: String = clean.chars().take(max_len).collect();
        format!("{}…", s)
    } else {
        clean.trim().to_string()
    }
}

// ── index ────────────────────────────────────────────────────────────

fn build_index(posts_dir: &Path) -> Vec<PostEntry> {
    let mut posts: Vec<PostEntry> = vec![];

    let Ok(entries) = fs::read_dir(posts_dir) else {
        eprintln!("  cannot read {}", posts_dir.display());
        return posts;
    };

    let mut md_files: Vec<PathBuf> = entries
        .filter_map(|e| e.ok())
        .map(|e| e.path())
        .filter(|p| p.extension().is_some_and(|ext| ext == "md"))
        .collect();
    md_files.sort();

    for path in md_files {
        let slug = path
            .file_stem()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        let Ok(content) = fs::read_to_string(&path) else {
            eprintln!("  cannot read {}", path.display());
            continue;
        };

        let (meta, body) = parse_frontmatter(&content);

        posts.push(PostEntry {
            slug: slug.clone(),
            title: meta.get("title").cloned().unwrap_or(slug),
            excerpt: meta
                .get("excerpt")
                .cloned()
                .unwrap_or_else(|| make_excerpt(body, 120)),
            date: meta
                .get("date")
                .cloned()
                .unwrap_or_else(|| Local::now().format("%Y-%m-%d").to_string()),
            category: meta.get("category").cloned().unwrap_or("未分类".into()),
            tags: parse_tags(meta.get("tags").map(|s| s.as_str()).unwrap_or("")),
        });
    }

    posts.sort_by(|a, b| b.date.cmp(&a.date));

    let index = Index {
        posts: posts.clone(),
        generated_at: Local::now().to_rfc3339(),
    };

    let index_path = posts_dir.join("index.json");
    let json = serde_json::to_string_pretty(&index).unwrap();
    fs::write(&index_path, format!("{}\n", json)).unwrap();

    println!("✓ index.json rebuilt ({} posts)", posts.len());
    for p in &posts {
        println!("  {}  {}", p.date, p.title);
    }
    posts
}

// ── git ──────────────────────────────────────────────────────────────

fn git_push(root: &Path) {
    let run = |args: &[&str]| -> bool {
        let status = Command::new("git")
            .args(args)
            .current_dir(root)
            .stdin(std::process::Stdio::null())
            .status()
            .expect("git not found");
        status.success()
    };

    let _ = run(&[
        "add",
        "public/posts/",
        "src/",
        "blog/",
        "index.html",
        "vite.config.js",
        "package.json",
        "scripts/",
        "cli/",
    ]);

    // check if anything staged
    let output = Command::new("git")
        .args(["status", "--porcelain"])
        .current_dir(root)
        .output()
        .expect("git not found");
    let stdout = String::from_utf8_lossy(&output.stdout);
    if stdout.trim().is_empty() {
        println!("  nothing to commit");
        return;
    }

    let msg = format!("blog: publish ({})", Local::now().format("%Y-%m-%d"));
    if !run(&["commit", "-m", &msg]) {
        println!("  commit failed (maybe nothing changed)");
        return;
    }
    println!("✓ committed: {}", msg);

    if run(&["push"]) {
        println!("✓ pushed to GitHub");
    }
}

// ── detect website root ──────────────────────────────────────────────

fn find_website_dir(hint: Option<&PathBuf>) -> PathBuf {
    if let Some(d) = hint {
        let p = d.join("public").join("posts");
        if p.is_dir() {
            return d.clone();
        }
    }

    // CWD or CWD/website
    for candidate in [std::env::current_dir().unwrap_or_default()].iter() {
        if candidate.join("public").join("posts").is_dir() {
            return candidate.clone();
        }
        let sub = candidate.join("website");
        if sub.join("public").join("posts").is_dir() {
            return sub;
        }
    }

    // cli/../website
    let exe = std::env::current_exe().unwrap_or_default();
    if let Some((parent, _)) = exe.parent().and_then(|p| {
        let grandparent = p.parent()?;
        let website = grandparent.join("website");
        if website.join("public").join("posts").is_dir() {
            Some((grandparent.to_path_buf(), ()))
        } else {
            None
        }
    }) {
        return parent.join("website");
    }

    eprintln!("Error: cannot find website directory (expected public/posts/ inside)");
    std::process::exit(1);
}

// ── watch ────────────────────────────────────────────────────────────

fn start_watch(website_dir: &Path, posts_dir: &Path) {
    let root = website_dir.to_path_buf();
    let pdir = posts_dir.to_path_buf();
    let pending = Arc::new(Mutex::new(false));

    let pending_clone = pending.clone();
    let mut watcher = RecommendedWatcher::new(
        move |res: Result<Event, notify::Error>| {
            let Ok(event) = res else { return };
            let relevant = event.paths.iter().any(|p| {
                p.extension().is_some_and(|ext| ext == "md")
                    || p.extension().is_some_and(|ext| ext == "json")
            });
            if !relevant {
                return;
            }
            let mut lock = pending_clone.lock().unwrap();
            *lock = true;
        },
        Config::default().with_poll_interval(Duration::from_secs(1)),
    )
    .expect("failed to create watcher");

    watcher
        .watch(posts_dir, RecursiveMode::Recursive)
        .expect("failed to watch posts directory");

    println!(" Watching public/posts/ — drop .md files to auto-publish\n");
    println!(" Press Ctrl+C to stop.\n");

    loop {
        std::thread::sleep(Duration::from_secs(2));
        let should_run = {
            let mut lock = pending.lock().unwrap();
            let v = *lock;
            *lock = false;
            v
        };
        if should_run {
            let stamp = Local::now().format("%H:%M:%S");
            println!("\n[{}] change detected", stamp);
            build_index(&pdir);
            git_push(&root);
        }
    }
}

// ── main ─────────────────────────────────────────────────────────────

fn main() {
    let cli = Cli::parse();

    let website_dir = find_website_dir(cli.dir.as_ref());
    let posts_dir = website_dir.join("public").join("posts");

    if !posts_dir.is_dir() {
        eprintln!("Error: {} not found", posts_dir.display());
        std::process::exit(1);
    }

    if cli.index {
        build_index(&posts_dir);
        return;
    }

    if cli.publish {
        build_index(&posts_dir);
        git_push(&website_dir);
        return;
    }

    // default: watch mode
    build_index(&posts_dir);
    start_watch(&website_dir, &posts_dir);
}
