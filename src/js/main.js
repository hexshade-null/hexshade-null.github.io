const postsData = [
  {
    id: 1,
    slug: "build-modern-blog",
    title: "从零开始构建现代个人博客",
    excerpt: "本文将详细介绍如何使用 Vite 和 GitHub Pages 搭建一个美观实用的个人博客，包含 Liquid Glass 界面设计与实现。",
    date: "2024-01-15",
    category: "技术",
    tags: ["前端", "Vite", "GitHub"]
  },
  {
    id: 2,
    slug: "css-glassmorphism",
    title: "CSS Glassmorphism 完全指南",
    excerpt: "深入探索 Glassmorphism 设计风格，从基础概念到实际应用，包含大量实例代码和设计技巧。",
    date: "2024-01-10",
    category: "设计",
    tags: ["CSS", "UI设计", "Glassmorphism"]
  },
  {
    id: 3,
    slug: "algorithm-intro",
    title: "算法竞赛入门：从青铜到王者",
    excerpt: "分享我在算法竞赛中的学习历程，推荐实用的刷题路线和资源，帮助初学者快速入门。",
    date: "2024-01-05",
    category: "算法",
    tags: ["算法", "竞赛", "学习"]
  },
  {
    id: 4,
    slug: "react-hooks-best-practice",
    title: "浅谈 React Hooks 最佳实践",
    excerpt: "结合实际项目经验，探讨 React Hooks 的使用技巧与常见误区，提升代码质量和开发效率。",
    date: "2023-12-28",
    category: "技术",
    tags: ["React", "Hooks", "最佳实践"]
  },
  {
    id: 5,
    slug: "2023-summary",
    title: "我的 2023 年度总结",
    excerpt: "回顾过去一年的学习与成长，记录那些重要的时刻和收获，以及对新年的展望。",
    date: "2023-12-25",
    category: "生活",
    tags: ["年度总结", "复盘"]
  },
  {
    id: 6,
    slug: "vim-tutorial",
    title: "Vim 从入门到精通",
    excerpt: "一份完整的 Vim 学习指南，包含常用命令、插件配置和高效工作流。",
    date: "2023-12-20",
    category: "技术",
    tags: ["Vim", "编辑器", "效率"]
  },
  {
    id: 7,
    slug: "dp-intro",
    title: "动态规划入门",
    excerpt: "通过经典例题讲解动态规划的基本思想和解题方法，帮助初学者掌握这一重要算法思想。",
    date: "2023-12-15",
    category: "算法",
    tags: ["算法", "动态规划", "DP"]
  }
];

const categories = [
  { name: "技术", count: 3 },
  { name: "算法", count: 2 },
  { name: "设计", count: 1 },
  { name: "生活", count: 1 }
];

const allTags = [
  { name: "前端", count: 2 },
  { name: "算法", count: 2 },
  { name: "React", count: 1 },
  { name: "CSS", count: 1 },
  { name: "Vite", count: 1 },
  { name: "GitHub", count: 1 },
  { name: "生活", count: 1 },
  { name: "Vim", count: 1 },
  { name: "动态规划", count: 1 }
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
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function navigateTo(section) {
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
  document.querySelector(`[data-section="${section}"]`).classList.add("active");

  const container = document.getElementById("postsContainer");

  switch (section) {
    case "home":
      renderHome(container);
      break;
    case "categories":
      renderCategories(container);
      break;
    case "tags":
      renderTags(container);
      break;
    case "archives":
      renderArchives(container);
      break;
    case "about":
      renderAbout(container);
      break;
  }
}

function renderHome(container) {
  container.innerHTML = `<div class="posts-container">
    ${postsData
      .map(
        (post) => `
      <a href="#article/${post.slug}" class="post-card" onclick="alert('文章: ${post.slug}'); return false;">
        <div class="post-meta">
          <span><i class="far fa-calendar"></i> ${formatDate(post.date)}</span>
          <span><i class="far fa-folder"></i> ${post.category}</span>
        </div>
        <h3 class="post-title">${post.title}</h3>
        <p class="post-excerpt">${post.excerpt}</p>
        <div class="post-tags">
          ${post.tags.map((tag) => `<span class="post-tag">${tag}</span>`).join("")}
        </div>
      </a>
    `
      )
      .join("")}
  </div>`;
}

function renderCategories(container) {
  container.innerHTML = `<div class="content-header">
    <h1>Categories</h1>
    <p class="subtitle">按分类浏览文章</p>
  </div>
  <div class="categories-grid">
    ${categories
      .map(
        (cat) => `
      <div class="category-card" onclick="filterByCategory('${cat.name}')">
        <div class="category-name">${cat.name}</div>
        <div class="category-count">${cat.count} 篇</div>
      </div>
    `
      )
      .join("")}
  </div>`;
}

function renderTags(container) {
  container.innerHTML = `<div class="content-header">
    <h1>Tags</h1>
    <p class="subtitle">按标签筛选文章</p>
  </div>
  <div class="tags-page-cloud">
    ${allTags
      .map(
        (tag) => `
      <span class="cloud-tag" onclick="filterByTag('${tag.name}')">${tag.name} <small>(${tag.count})</small></span>
    `
      )
      .join("")}
  </div>`;
}

function renderArchives(container) {
  const postsByYear = {};
  postsData.forEach((post) => {
    const year = new Date(post.date).getFullYear();
    if (!postsByYear[year]) postsByYear[year] = [];
    postsByYear[year].push(post);
  });

  const years = Object.keys(postsByYear).sort((a, b) => b - a);

  container.innerHTML = `<div class="content-header">
    <h1>Archives</h1>
    <p class="subtitle">文章归档</p>
  </div>
  <div class="timeline">
    ${years
      .map(
        (year) => `
      <div class="timeline-year">
        <div class="timeline-year-title">${year}</div>
        ${postsByYear[year]
          .map(
            (post) => `
          <div class="timeline-post">
            <div class="timeline-post-title">${post.title}</div>
            <div class="timeline-post-date">${formatDate(post.date)}</div>
          </div>
        `
          )
          .join("")}
      </div>
    `
      )
      .join("")}
  </div>`;
}

function renderAbout(container) {
  container.innerHTML = `<div class="content-header">
    <h1>About</h1>
    <p class="subtitle">关于我</p>
  </div>
  <div class="about-content">
    <div class="about-avatar"><i class="fas fa-user"></i></div>
    <div class="about-name">博主</div>
    <div class="about-bio">
      热爱技术与算法，专注于前端开发与算法竞赛。
      <br>欢迎来到我的个人博客，一起交流学习！
    </div>
    <div class="about-contact">
      <a href="#" class="social-icon"><i class="fab fa-github"></i></a>
      <a href="#" class="social-icon"><i class="fab fa-twitter"></i></a>
      <a href="#" class="social-icon"><i class="fas fa-envelope"></i></a>
    </div>
  </div>`;
}

function filterByCategory(category) {
  const container = document.getElementById("postsContainer");
  const filteredPosts = postsData.filter((p) => p.category === category);

  container.innerHTML = `<div class="content-header">
    <h1>${category}</h1>
    <p class="subtitle">${filteredPosts.length} 篇文章</p>
  </div>
  <div class="posts-container">
    ${filteredPosts
      .map(
        (post) => `
      <a href="#article/${post.slug}" class="post-card" onclick="alert('文章: ${post.slug}'); return false;">
        <div class="post-meta">
          <span><i class="far fa-calendar"></i> ${formatDate(post.date)}</span>
          <span><i class="far fa-folder"></i> ${post.category}</span>
        </div>
        <h3 class="post-title">${post.title}</h3>
        <p class="post-excerpt">${post.excerpt}</p>
        <div class="post-tags">
          ${post.tags.map((tag) => `<span class="post-tag">${tag}</span>`).join("")}
        </div>
      </a>
    `
      )
      .join("")}
  </div>`;
}

function filterByTag(tag) {
  const container = document.getElementById("postsContainer");
  const filteredPosts = postsData.filter((p) => p.tags.includes(tag));

  container.innerHTML = `<div class="content-header">
    <h1>#${tag}</h1>
    <p class="subtitle">${filteredPosts.length} 篇文章</p>
  </div>
  <div class="posts-container">
    ${filteredPosts
      .map(
        (post) => `
      <a href="#article/${post.slug}" class="post-card" onclick="alert('文章: ${post.slug}'); return false;">
        <div class="post-meta">
          <span><i class="far fa-calendar"></i> ${formatDate(post.date)}</span>
          <span><i class="far fa-folder"></i> ${post.category}</span>
        </div>
        <h3 class="post-title">${post.title}</h3>
        <p class="post-excerpt">${post.excerpt}</p>
        <div class="post-tags">
          ${post.tags.map((t) => `<span class="post-tag">${t}</span>`).join("")}
        </div>
      </a>
    `
      )
      .join("")}
  </div>`;
}

function renderRecentPosts() {
  const container = document.getElementById("recentPosts");
  const recentPosts = [...postsData].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  container.innerHTML = recentPosts
    .map(
      (post) => `
    <li class="recent-post-item" onclick="filterByCategory('${post.category}')">
      <div class="recent-post-title">${post.title}</div>
      <div class="recent-post-date">${formatDate(post.date)}</div>
    </li>
  `
    )
    .join("");
}

function renderTrendingTags() {
  const container = document.getElementById("tagsCloud");
  container.innerHTML = allTags
    .slice(0, 8)
    .map(
      (tag) => `
    <span class="cloud-tag" onclick="filterByTag('${tag.name}')">${tag.name}</span>
  `
    )
    .join("");
}

function initEventListeners() {
  document.getElementById("themeToggle").addEventListener("click", toggleTheme);

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const section = item.getAttribute("data-section");
      navigateTo(section);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  navigateTo("home");
  renderRecentPosts();
  renderTrendingTags();
  initEventListeners();
});

window.filterByCategory = filterByCategory;
window.filterByTag = filterByTag;