# ✦ 神秘星语 | Mystic Star Tales

<div align="center">

A Cozy Mythic Story PWA Web Application. Built with Vanilla JS & Canvas Physics.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version: 1.4.0](https://img.shields.io/badge/version-1.4.0-green.svg)](CHANGELOG.md)
[![PWA Ready](https://img.shields.io/badge/PWA-ready-orange.svg)](#)
[![IndexedDB Support](https://img.shields.io/badge/IndexedDB-active-blue.svg)](#)

[Demo](https://14sword.github.io/mystic-star-tales/) · [Changelog](CHANGELOG.md) · [Contributing](CONTRIBUTING.md)

</div>

### 🖥️ Desktop UI / 电脑端界面

| 🌌 主页预览 (Home) | 🔍 统一控制面板 (Controls Panel) | 📖 故事板阅读 (Storyboard) |
| :---: | :---: | :---: |
| <img src="screenshots/desktop_home.png" width="100%" alt="Desktop Home" /> | <img src="screenshots/desktop_filtered.png" width="100%" alt="Desktop Controls" /> | <img src="screenshots/desktop_modal.png" width="100%" alt="Desktop Storyboard" /> |

### 📱 Mobile UI / 移动端界面

| 🌌 移动端主页 (Mobile Home) | 📖 移动端故事板 (Mobile Storyboard) |
| :---: | :---: |
| <img src="screenshots/mobile_home.png" width="100%" alt="Mobile Home" /> | <img src="screenshots/mobile_modal.png" width="100%" alt="Mobile Storyboard" /> |

---

## ✨ Features / 核心特性

### 📖 故事内容与阅读体验 (Content & Experience)
- **15 个世界神话与经典传说**：涵盖中国生肖、希腊星座、北欧极光、埃及审判、爱神考验、时间执念等十五个精心绘制的故事板叙事。
- **一体化控制面板（Unified Controls Panel）**：重构并统一了“分类筛选”与“智能搜索”，打造浑然一体的玻璃拟物态控制条。PC 端极致舒展，移动端横向流式滑动，极致优雅。
- **沉浸式弹窗阅读（Immersive Storyboard）**：故事内容弹窗设计了绝佳的排版与卷轴式的阅读进度条指示，图文并茂，搭配“预估阅读时间”功能，使阅读体验如丝般顺滑。

### 🎨 视听与动态特效 (Visuals & Audio)
- **3D 卡片偏转动效**：鼠标悬停于塔罗牌式的故事卡片时，卡片会随指针位置在三维空间中产生细腻的偏转，配合多层阴影营造物理质感。
- **高性能星空背景（Starfield Canvas）**：采用轻量级原生 Canvas 物理引擎绘制多层星轨旋转背景。经过极致优化，摒弃了高负载的鼠标跟随粒子，保障全平台 60FPS 顺畅运行。
- **环境氛围音效（Web Audio）**：利用 Web Audio API 实时生成静谧的宇宙深空环境白噪音，搭配空灵清脆的交互反馈音效，带来多维度的视听盛宴。

### ⚡ 性能与无障碍 (Performance & A11y)
- **零依赖原生架构**：百分百使用 Vanilla JS 与原生 CSS 构建，无需任何第三方框架，实现极致的加载速度和极低的内存占用。
- **非关键模块延迟加载（Idle-Time Loading）**：首屏极速加载，搜索、音效、过滤等非关键体验模块在 `requestIdleCallback` 闲置期间无感加载。
- **全键盘访问支持**：支持 `←` / `→` 方向键翻阅故事，`Enter` 确认，`Esc` 退出。带有专门的快捷键速查面板（按 `?` 开启）。

### 🛰️ PWA 与本地离线存储 (Offline-First)
- **Service Worker 资源预缓存**：配置完善的 PWA 清单和缓存策略，不仅支持一键添加到桌面或手机主屏，在完全离线的环境下依然可以无缝访问。
- **IndexedDB 无感持久化**：阅读记录、收藏列表等个性化偏好均在本地 IndexedDB 高效存储和实时同步，无需注册登录即可享受完整的个人化服务。

---

## 📂 Project Structure / 项目结构

```text
mystic-star-tales/
├── index.html                       # 主页面结构（语义化与无障碍优化）
├── offline.html                     # PWA 离线降级页面
├── sw.js                            # Service Worker 资源控制与离线策略
├── manifest.json                    # PWA 应用清单
├── css/                             # 模块化层叠样式表 (原生 CSS 变量 + 毛玻璃设计)
│   ├── clean-ui.css                 # 核心控制面板、滑动手势及响应式样式
│   └── styles.min.css               # 生产环境合并压缩最终产物
├── js/                              # 原生 JavaScript 业务模块
│   ├── deferred-loader.js           # 空闲时间非阻塞模块加载器 (核心性能优化点)
│   ├── cards-data.js                # 静态故事数据
│   ├── cards-render-optimized.js    # 3D 故事卡片网格渲染器
│   ├── modal-optimized.js           # 沉浸式阅读器模态弹窗与手势逻辑
│   ├── effects.js                   # 触控与涟漪轻量级物理动效引擎
│   ├── story-search.js              # 拼音与模糊搜索引擎
│   ├── story-filter.js              # 故事分类过滤器
│   └── audio.js                     # 氛围与交互音效控制器
├── assets/                          # 高清封面、音效与 SVG 图标资源
├── tools/                           # 自动化构建脚本 (CSS 打包压缩等)
└── supabase/                        # 可选的云端数据同步配置与 Edge Functions
```

---

## 🛠 Tech Stack / 技术栈

- **前端界面**：Vanilla HTML5 / CSS3 / ES6+ JavaScript（全原生编写，极致轻量）
- **渲染与动效**：HTML5 Canvas / `requestAnimationFrame` / CSS 3D Transforms / Backdrop Filter
- **多媒体与存储**：Web Audio API / IndexedDB / LocalStorage
- **应用化架构**：PWA (Progressive Web App) / Service Worker

---

## 🚀 Installation & Usage / 安装与运行

### 1. 获取代码
```bash
git clone https://github.com/your-username/mystic-star-tales.git
cd mystic-star-tales
```

### 2. 本地服务器启动
本项目为纯前端静态 Web 应用，请使用任何本地 HTTP 服务器运行以完整体验 PWA 离线特性：

#### 使用 Node.js (推荐)
```bash
npx http-server -p 8000
```

#### 使用 Python
```bash
python3 -m http.server 8000
```

在浏览器中打开 `http://localhost:8000` 即可开启探索之旅。

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
