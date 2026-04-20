const postsData = [
  {
    id: 1,
    title: "从零开始构建现代个人博客",
    excerpt: "本文将详细介绍如何使用 Vite 和 GitHub Pages 搭建一个美观实用的个人博客，包含 Liquid Glass 界面设计与实现。",
    date: "2024-01-15",
    category: "技术",
    tags: ["前端", "Vite", "GitHub"],
    views: 1234
  },
  {
    id: 2,
    title: "CSS Glass morphism 完全指南",
    excerpt: "深入探索 Glassmorphism 设计风格，从基础概念到实际应用，包含大量实例代码和设计技巧。",
    date: "2024-01-10",
    category: "设计",
    tags: ["CSS", "UI设计", "Glassmorphism"],
    views: 2567
  },
  {
    id: 3,
    title: "算法竞赛入门：从青铜到王者",
    excerpt: "分享我在算法竞赛中的学习历程，推荐实用的刷题路线和资源，帮助初学者快速入门。",
    date: "2024-01-05",
    category: "算法",
    tags: ["算法", "竞赛", "学习"],
    views: 3421
  },
  {
    id: 4,
    title: "浅谈 React Hooks 最佳实践",
    excerpt: "结合实际项目经验，探讨 React Hooks 的使用技巧与常见误区，提升代码质量和开发效率。",
    date: "2023-12-28",
    category: "前端",
    tags: ["React", "Hooks", "最佳实践"],
    views: 1890
  },
  {
    id: 5,
    title: "我的 2023 年度总结",
    excerpt: "回顾过去一年的学习与成长，记录那些重要的时刻和收获，以及对新年的展望。",
    date: "2023-12-25",
    category: "生活",
    tags: ["年度总结", "复盘"],
    views: 987
  }
];

const allTags = [
  { name: "前端", count: 45 },
  { name: "算法", count: 38 },
  { name: "React", count: 28 },
  { name: "CSS", count: 24 },
  { name: "Vite", count: 18 },
  { name: "JavaScript", count: 32 },
  { name: "UI设计", count: 15 },
  { name: "GitHub", count: 12 },
  { name: "生活", count: 20 },
  { name: "学习", count: 25 }
];

function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

function renderPosts() {
  const container = document.getElementById("postsContainer");
  container.innerHTML = postsData
    .map(
      (post) => `
    <article class="post-card">
      <div class="post-meta">
        <span><i class="far fa-calendar"></i> ${formatDate(post.date)}</span>
        <span><i class="far fa-folder"></i> ${post.category}</span>
        <span><i class="far fa-eye"></i> ${post.views}</span>
      </div>
      <h2 class="post-title">${post.title}</h2>
      <p class="post-excerpt">${post.excerpt}</p>
      <div class="post-tags">
        ${post.tags.map((tag) => `<span class="post-tag">${tag}</span>`).join("")}
      </div>
    </article>
  `
    )
    .join("");
}

function renderRecentPosts() {
  const container = document.getElementById("recentPosts");
  const recentPosts = [...postsData].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  container.innerHTML = recentPosts
    .map(
      (post) => `
    <li class="recent-post-item">
      <div class="recent-post-title">${post.title}</div>
      <div class="recent-post-date">${formatDate(post.date)}</div>
    </li>
  `
    )
    .join("");
}

function renderTrendingTags() {
  const container = document.getElementById("tagsCloud");
  const sortedTags = [...allTags].sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...sortedTags.map((t) => t.count));

  container.innerHTML = sortedTags
    .map((tag) => {
      const size = tag.count === maxCount ? "size-lg" : tag.count > maxCount * 0.6 ? "size-md" : "";
      return `<span class="cloud-tag ${size}">${tag.name}</span>`;
    })
    .join("");
}

function initEventListeners() {
  document.getElementById("themeToggle").addEventListener("click", toggleTheme);

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".nav-item").forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderPosts();
  renderRecentPosts();
  renderTrendingTags();
  initEventListeners();
});