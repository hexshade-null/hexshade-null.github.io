# AGENTS.md

## Project: Liquid Blog

一个使用 Vite + GitHub Pages 搭建的极简个人博客。

### 技术栈

- **框架**: Vite
- **样式**: 纯 CSS + CSS 变量
- **图标**: Font Awesome 6
- **Markdown**: marked.js（浏览器端渲染）
- **部署**: GitHub Actions

### 目录结构

```
hexshade-blog/               ← 本地 git 根目录
├── .gitignore
└── website/                 ← 网站文件（通过 git subtree 推送）
    ├── index.html           # 主页面
    ├── blog/
    │   ├── article.html     # 文章详情页模板
    │   └── article/         # Markdown 文章源文件
    ├── src/
    │   ├── css/style.css    # 样式
    │   └── js/main.js       # 主逻辑
    ├── .github/workflows/   # 自动部署
    └── package.json
```

### 开发命令

```bash
cd website
npm run dev      # 开发服务器 (localhost:5173)
npm run build    # 构建到 dist/
npm run preview  # 预览构建结果
```

### 博客文章

- 放在 `blog/article/` 目录
- 使用 JavaScript 对象存储文章内容（便于演示）
- 生产环境可改为从 JSON 文件加载

### 部署

使用 git subtree 推送 website/ 目录到远程：
```bash
git subtree push --prefix=website origin main
```

远程仓库根目录即为 website/ 的内容，GitHub Actions 自动构建部署到 GitHub Pages。

### 添加新文章

1. 在 `src/js/main.js` 的 `postsData` 数组添加文章
2. 在 `blog/article.html` 的 `articles` 对象添加文章内容（支持 Markdown）
