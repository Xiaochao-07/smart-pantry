# SmartPantry 智能冰箱食材管理系统

> 一个基于 **Vue 3 + TypeScript** 开发的 PWA 应用，专为厨房场景设计的食材管理与菜谱推荐系统。

[在线 Demo](https://cool-swan-577b2a.netlify.app/)

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API + `<script setup>`) |
| 构建 | Vite 6 + TypeScript 5 |
| 状态管理 | Pinia (5 个领域 Store) |
| 路由 | Vue Router 4 (Hash 模式 + 路由守卫) |
| 样式 | Tailwind CSS 4 |
| 持久化 | IndexedDB (via idb) + localStorage |
| PWA | vite-plugin-pwa (离线访问 + 可安装) |
| 拖拽 | vue-draggable-plus |
| 图表 | Chart.js |
| 图标 | Lucide |

## 功能模块

### 🧊 冰箱库存管理
- 食材入库（名称/数量/存放位置）
- 三种存放位置：冷藏、冷冻、橱柜
- 数量增减与删除
- 过期提醒（红色=已过期，橙色=3天内过期）
- IndexedDB 持久化存储
- 从预设食材库快速添加

### ✨ 智能推荐
- **食材-菜谱匹配算法**：基于库存食材与菜谱配料自动评分
- 匹配度 0-100 分，按得分排序
- 标签筛选（家常、快手、下饭等）
- 缺少食材自动提示
- 即将过期食材高亮提醒

### 📋 周餐食规划
- 7 天 × 3 餐（早/午/晚）规划视图
- 一键随机生成整周菜单
- 手动拖拽/点击分配菜谱
- 已安排餐位计数

### 🍳 菜谱管理
- 菜谱列表 + 搜索
- 展开查看食材清单与烹饪步骤
- 删除菜谱
- **网页菜谱导入**：输入 URL 自动提取 JSON-LD 结构化数据（支持下厨房、Allrecipes 等）
- **文字菜谱导入**：粘贴小红书/抖音文字，NLP 解析自动识别菜名、食材、步骤

### ❤️ 健康追踪
- 个性化健康档案设置（引导式向导）
- BMR/TDEE 基础代谢计算（Mifflin-St Jeor 公式）
- 根据目标（减重/健身/保持/增重）自动计算每日热量、蛋白质、碳水、脂肪目标
- 食物热量记录（支持搜索食物数据库 + 拍照识别）
- 每日摄入进度条 + 近 7 天摄入柱状图
- 智能饮食建议（基于当日摄入数据）

### 👤 个人中心
- 用户档案卡片
- 冰箱数据概览
- 快捷跳转到各功能模块
- 健康数据摘要

## 架构设计

### 状态管理 (Pinia)

采用领域驱动 Store 拆分，每个 Store 管理独立的数据领域：

- `useInventoryStore` — 冰箱食材库存（增/删/改数量 + IndexedDB 持久化）
- `useRecipeStore` — 菜谱管理 + 库存匹配算法
- `useMealPlanStore` — 周餐食规划（自动生成/重置）
- `useProfileStore` — 用户档案 + BMR/TDEE 计算
- `useCalorieStore` — 热量追踪（饮食记录 + 周统计）
- `useToastStore` — 全局通知系统

### 组件设计

- **页面组件** (`pages/`) — 6 个主页面 + 登录/健康向导
- **通用组件** (`components/`) — BottomNav、ErrorBoundary、Skeleton、Toast
- **自定义 Composable** (`hooks/`) — `useExpiry` 食材过期追踪
- **工具函数** (`utils/`) — BMR 计算、食谱解析、食材匹配算法、UUID 生成

### 亮点

- **食材-菜谱匹配算法** (`recipeMatch.ts`)：基于库存的匹配评分系统，考虑必需食材、可选食材、烹饪时间
- **自然语言菜谱解析** (`textParser.ts`)：小红书/抖音格式文本提取
- **JSON-LD 网页解析**：自动提取食谱网站的标准化数据
- **PWA 支持**：离线访问、可安装到桌面
- **骨架屏**：自定义 Skeleton 组件提升加载体验
- **错误边界**：Vue 错误捕获与优雅降级

## 快速开始

```bash
npm install
npm run dev     # 开发服务器
npm run build   # 生产构建
npm run preview # 预览构建结果
```

## 项目结构

```
src/
├── components/     # 通用组件 (BottomNav, Toast, Skeleton, ErrorBoundary)
├── data/           # 静态数据 (食材库、菜谱、营养数据)
├── hooks/          # 自定义 Composable
├── pages/          # 页面组件 (7 个页面)
├── router/         # Vue Router 路由配置 + 守卫
├── stores/         # Pinia 状态管理 (6 个 Store)
├── types/          # TypeScript 类型定义
└── utils/          # 工具函数 (算法、DB、解析器)
```

## 开发说明

本项目由 AI 辅助（Vibe Coding）完成：
- 整体架构设计由开发者完成
- 核心算法（recipeMatch、calorieUtils）由开发者实现
- UI 组件和页面逻辑由 AI 辅助生成 + 开发者重构优化
- 所有代码已通读，每个模块的功能和原理开发者均可独立解释
