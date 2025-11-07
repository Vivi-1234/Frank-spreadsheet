# Frank-Spreadsheet - Vue 3 版本

基于 Vue 3 + Vite 的产品管理和展示系统。

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制 `.env.example` 为 `.env.local`，并填入您的 Supabase 配置：
```bash
cp .env.example .env.local
```

编辑 `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 启动开发服务器
```bash
npm run dev
```

访问 `http://localhost:5174`

### 4. 构建生产版本
```bash
npm run build
```

## 📁 项目结构

```
src/
├── views/              # 页面组件
│   ├── HomePage.vue
│   ├── ProductsPage.vue
│   ├── HowToBuyPage.vue
│   └── admin/          # 管理后台
├── components/         # 共享组件
├── composables/        # 组合式函数
├── config/             # 配置
├── utils/              # 工具函数
└── router/             # 路由配置
```

## 🎯 主要功能

### 前端
- 🏠 Landing Page（渐变风格）
- 📦 产品展示页（筛选、搜索、无限滚动）
- 📚 购买教程页

### 后台管理
- 📊 Dashboard（数据分析）
- 📦 产品管理（CRUD、批量操作、Excel 导入导出）
- 🏷️ 品牌/标签/分类管理
- ⚙️ 站点设置
- 🔗 社交链接管理
- 📚 教程页管理

## 🛠️ 技术栈

- Vue 3 (Composition API)
- Vite
- Vue Router 4
- Tailwind CSS
- Supabase (Database + Storage + Auth)
- Chart.js
- Flatpickr
- SortableJS
- SheetJS (xlsx)

## 📝 详细文档

查看 [MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md) 了解完整的迁移详情和功能说明。

## 🔐 管理后台

访问 `/admin` 进入管理后台，使用 Supabase Auth 登录。

