(function initSplash() {
  const screen = document.getElementById("splash-screen");
  if (!screen) return;
  if (sessionStorage.getItem("splashShown")) {
    screen.remove();
    return;
  }
  const el = document.getElementById("splash-content");
  if (!el) return;
  screen.style.display = "flex";
  const text = "Hello, Blog!";
  let i = 0;
  const type = setInterval(() => {
    if (i < text.length) {
      el.textContent += text[i];
      i++;
    } else {
      clearInterval(type);
      setTimeout(() => {
        screen.style.opacity = "0";
        setTimeout(() => {
          screen.remove();
          sessionStorage.setItem("splashShown", "true");
        }, 400);
      }, 500);
    }
  }, 120);
})();

const postsData = [
  {
    id: 1,
    slug: "silicon-dawn",
    title: "硅基曙光",
    excerpt: "凌晨三点十七分，上海浦东华为研发中心的地下实验室里，警报声尖锐地撕裂了寂静。",
    date: "2026-05-05",
    category: "娱乐",
    tags: ["科幻", "短篇小说"]
  }
];

const categories = [
  { name: "娱乐", count: 1 }
];

const allTags = [
  { name: "科幻", count: 1 },
  { name: "短篇小说", count: 1 }
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
      <a href="#article/${post.slug}" class="post-card" onclick="window.location.href='blog/article.html?slug=${post.slug}'; return false;">
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
    <p class="subtitle">关于 hexshade</p>
  </div>
  <div class="about-content">
    <img src="https://cdn.luogu.com.cn/upload/image_hosting/5tfkf7co.png" alt="hexshade" class="about-avatar">
    <div class="about-name">hexshade</div>
    <div class="about-bio">
      Stay hungry, stay foolish.
      <br>热爱技术与算法，欢迎来到我的个人博客，一起交流学习！
    </div>
    <div class="about-contact">
      <a href="https://github.com/hexshade-null" target="_blank" class="social-icon"><i class="fab fa-github"></i></a>
      <a href="mailto:liujq.wibo@gmail.com" class="social-icon"><i class="fas fa-envelope"></i></a>
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
      <a href="#article/${post.slug}" class="post-card" onclick="window.location.href='blog/article.html?slug=${post.slug}'; return false;">
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
      <a href="#article/${post.slug}" class="post-card" onclick="window.location.href='blog/article.html?slug=${post.slug}'; return false;">
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

function updateThemeIcon() {
  const icon = document.getElementById("themeIcon");
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";

  if (isDark) {
    icon.innerHTML = `
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  } else {
    icon.innerHTML = `
      <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" fill="none"/>
      <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    `;
  }
}

function initEventListeners() {
  document.getElementById("themeToggle").addEventListener("click", () => {
    toggleTheme();
    updateThemeIcon();
  });

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const section = item.getAttribute("data-section");
      navigateTo(section);
    });
  });

  document.querySelector(".logo").addEventListener("click", () => {
    document.querySelector(".sidebar-left").classList.toggle("collapsed");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  updateThemeIcon();
  navigateTo("home");
  renderRecentPosts();
  renderTrendingTags();
  initEventListeners();
});

window.filterByCategory = filterByCategory;
window.filterByTag = filterByTag;