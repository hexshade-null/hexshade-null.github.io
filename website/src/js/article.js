function initTheme() {
  const saved = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
  updateHljsTheme(saved);
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme");
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateHljsTheme(next);
  updateThemeIcon();
}

function updateHljsTheme(theme) {
  const lightLink = document.getElementById("hljs-light");
  const darkLink = document.getElementById("hljs-dark");
  if (lightLink && darkLink) {
    lightLink.disabled = theme === "dark";
    darkLink.disabled = theme === "light";
  }
}

function updateThemeIcon() {
  const icon = document.getElementById("themeIcon");
  if (!icon) return;
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  if (isDark) {
    icon.innerHTML =
      '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  } else {
    icon.innerHTML = `
      <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" fill="none"/>
      <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    `;
  }
}

function parseFrontmatter(md) {
  const match = md.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { meta: {}, body: md };
  const meta = {};
  match[1].split("\n").forEach((line) => {
    const i = line.indexOf(":");
    if (i > -1) {
      const key = line.slice(0, i).trim();
      let val = line.slice(i + 1).trim();
      if (val.startsWith("[") && val.endsWith("]")) {
        val = val
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim());
      }
      meta[key] = val;
    }
  });
  return { meta, body: md.slice(match[0].length) };
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
    .replace(/^-|-$/g, "");
}

function wrapCodeBlocks() {
  document.querySelectorAll(".markdown-body pre code").forEach((block) => {
    const pre = block.parentElement;
    if (pre.parentElement.classList.contains("code-block-wrapper")) return;

    const langClass = [...block.classList].find((c) => c.startsWith("language-"));
    const lang = langClass ? langClass.replace("language-", "") : "";

    hljs.highlightElement(block);

    const lines = block.innerHTML.split("\n");
    if (lines.length > 0 && lines[lines.length - 1].trim() === "") {
      lines.pop();
    }
    block.innerHTML = lines.map((l) => `<span class="line">${l}</span>`).join("\n");

    const wrapper = document.createElement("div");
    wrapper.className = "code-block-wrapper";

    const header = document.createElement("div");
    header.className = "code-block-header";
    header.innerHTML = `<span>${lang || "code"}</span>`;

    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(header);
    wrapper.appendChild(pre);
  });
}

function buildOutline() {
  const nav = document.getElementById("outlineNav");
  if (!nav) return;
  nav.innerHTML = "";

  const headings = document.querySelectorAll(
    ".markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4"
  );

  headings.forEach((h) => {
    const id = h.id || slugify(h.textContent);
    h.id = id;
    const a = document.createElement("a");
    a.className = "outline-link";
    a.href = `#${id}`;
    a.textContent = h.textContent;
    a.dataset.depth = h.tagName.slice(1);
    a.addEventListener("click", (e) => {
      e.preventDefault();
      h.scrollIntoView({ behavior: "smooth" });
    });
    nav.appendChild(a);
  });

  setupScrollSpy(headings);
}

function setupScrollSpy(headings) {
  if (!headings.length) return;

  const links = document.querySelectorAll(".outline-link");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"));
          const active = document.querySelector(
            `.outline-link[href="#${entry.target.id}"]`
          );
          if (active) active.classList.add("active");
        }
      });
    },
    { rootMargin: "-80px 0px -60% 0px" }
  );

  headings.forEach((h) => observer.observe(h));
}

async function loadArticle() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug") || "silicon-dawn";

  try {
    const resp = await fetch(`/posts/${slug}.md`);
    if (!resp.ok) throw new Error("Not found");
    const md = await resp.text();

    const { meta, body } = parseFrontmatter(md);

    marked.use({
      gfm: true,
      renderer: {
        heading({ text, depth }) {
          const id = slugify(text);
          return `<h${depth} id="${id}">${text}</h${depth}>`;
        },
      },
    });

    const html = marked.parse(body);

    const headerEl = document.getElementById("articleHeader");
    if (meta.title) {
      const tags = Array.isArray(meta.tags)
        ? meta.tags
        : meta.tags
          ? [meta.tags]
          : [];
      headerEl.innerHTML = `
        <div class="article-header-inner">
          <h1 class="article-title">${meta.title}</h1>
          <div class="article-meta">
            ${meta.date ? `<span><i class="far fa-calendar"></i> ${meta.date}</span>` : ""}
            ${meta.category ? `<span><i class="far fa-folder"></i> ${meta.category}</span>` : ""}
            ${tags.map((t) => `<span class="post-tag">${t}</span>`).join("")}
          </div>
        </div>
      `;
      document.title = meta.title + " - hexshade's Blog";
    }

    document.getElementById("markdownBody").innerHTML = html;

    wrapCodeBlocks();
    buildOutline();
  } catch (err) {
    console.error("Article load error:", err);
    document.querySelector(".article-content").innerHTML = `
      <div class="article-error">
        <i class="fas fa-file-circle-xmark"></i>
        <p>文章不存在或加载失败</p>
        <a href="../index.html" class="home-link" style="margin-top:12px;font-size:14px;">
          <i class="fas fa-arrow-left"></i> 返回首页
        </a>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  updateThemeIcon();

  document.getElementById("themeToggle").addEventListener("click", toggleTheme);

  loadArticle();
});
