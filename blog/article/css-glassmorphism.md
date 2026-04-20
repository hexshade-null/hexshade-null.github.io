---
title: CSS Glassmorphism 完全指南
date: 2024-01-10
category: 设计
tags: [CSS, UI设计]
---

# CSS Glassmorphism 完全指南

Glassmorphism（毛玻璃效果）是一种流行的 UI 设计风格。

## 核心属性

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### 关键点

1. **backdrop-filter**: 创建模糊效果
2. **rgba 背景**: 半透明背景
3. **边框**: 添加层次感

## 适用场景

- 模态框
- 卡片
- 侧边栏

试试看，你会喜欢的！