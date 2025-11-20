# Frank-spreadsheet 网站性能优化建议

基于对当前代码库的分析，以下是针对提升网站加载速度、降低流量消耗及优化用户体验的建议清单。

## 🚀 1. 资源加载优化 (最高优先级)

### 图片加载策略
- **强制懒加载**: 确保所有产品列表卡片 (`ProductCard`) 的图片标签 `<img>` 都显式包含 `loading="lazy"` 属性。
- **首屏关键图片**: 首页 Banner 或第一屏可见的图片（LCP 元素），**不应**使用懒加载，而应添加 `fetchpriority="high"` 以提升 Largest Contentful Paint (LCP) 指标。
- **背景图优化**: `ProductsPage` 中的 Hero 背景图目前通过内联 CSS 加载。建议改为 `<img>` 标签配合 `object-fit: cover`，以便浏览器预加载扫描器能更早发现它。

### 字体优化
- **预连接**: 在 `index.html` 中添加 `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` 以加速 Google Fonts 连接建立。
- **字体加载策略**: 在 CSS `@font-face` 中添加 `font-display: swap;`，确保字体未加载完成时文字依然可见（避免空白）。

## 📦 2. JavaScript 包体积优化

### 依赖检查
- **XLSX 库隔离**: 检查 `xlsx` 库是否**严格**仅在 Admin 相关的 chunk 中打包。此库体积巨大，绝对不能出现在主包 (`index.js` 或 `vendor.js`) 中，否则会严重拖慢首页加载。
- **Chart.js 隔离**: 同上，图表库仅应在 Admin Dashboard 中加载。

### 代码分割
- **路由懒加载**: 现有的路由配置已经使用了 `() => import(...)`，这是很好的实践，请保持。
- **组件懒加载**: 对于非首屏的重型组件（如复杂的 Filter 面板、弹窗），也可以使用 `defineAsyncComponent` 进行异步加载。

## ⚡ 3. 渲染性能优化

### 虚拟滚动 (Virtual Scrolling)
- **问题**: 随着用户不断下拉加载更多产品，DOM 节点数会无限增加，导致页面越来越卡，内存占用飙升。
- **建议**: 在 `ProductsPage` 的产品网格中引入 **虚拟滚动** 技术。只渲染屏幕可视区域内（及上下缓冲区）的产品卡片 DOM，回收不可见的节点。这对于移动端体验提升巨大。

### 骨架屏 (Skeleton Screens)
- **现状**: 已有骨架屏，很好。
- **建议**: 确保骨架屏的布局尺寸与真实内容尽可能一致，以减少 **累积布局偏移 (CLS)**。

## 🌐 4. 网络与数据优化

### 预加载 (Prefetching)
- **Link Prefetching**: 当用户鼠标悬停在产品卡片上时，可以尝试预取该产品的目标链接（如果是站内链接）或相关资源。
- **DNS Prefetch**: 对于 Supabase (`xqlzhvfqibkgdgcycnel.supabase.co`) 和图片 CDN (`wsrv.nl`) 域名，在 `index.html` 中添加 `dns-prefetch`。

### 避免串行请求
- 检查是否有 `await` 调用导致的“瀑布流”请求。例如，先请求 User，再请求 Profile，再请求 Products。应尽可能使用 `Promise.all` 并发请求，或在数据库层面通过 Join 查询一次性获取。

## 🛠 5. 其它微调

- **404 页面**: 添加一个轻量级的自定义 404 页面，避免用户请求不存在路径时加载完整的应用逻辑（虽然 SPA 路由会处理，但体验更好）。
- **PWA 支持**: 考虑添加简单的 `manifest.json` 和 Service Worker，缓存核心 App Shell，实现离线访问能力或秒开体验。

