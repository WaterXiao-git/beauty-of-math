# MathViz - 数学之美

一个基于 React 19 与 Node.js 20+ 构建的现代化数学教学可视化系统。本项目致力于通过动态图表、地理信息映射与 AI 辅助生成，将抽象的数学概念转化为直观的交互式实验项目。

![TypeScript](https://img.shields.io/badge/TypeScript-55.6%25-blue)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?logo=tailwind-css)
![License](https://img.shields.io/badge/License-PolyForm%20Noncommercial%201.0.0-333)

## 技术栈架构图

![数学教学可视化系统-技术栈架构图](D:\蓝山工作室\数学教学可视化展示系统建设方案\数学教学可视化系统-技术栈架构图.png)

##  核心特性

基于最新 `feat` 分支的代码结构，本项目具备以下核心能力：

- **全栈 TypeScript 架构**：前后端均采用 TypeScript 编写，类型覆盖率约 55.6%，确保大型项目的可维护性与代码健壮性。
- **现代化前端体验**：使用 **React 19** 配合 **Vite** 构建，结合 **Tailwind CSS** 实现极速的热更新与响应式 UI 设计。
- **多维数学可视化**：
    - **Mapbox GL**：支持地理空间数据的数学建模与展示。
    - **Plotly.js & D3.js**：提供高精度的函数绘图与数据可视化能力。
    - **KaTeX**：实现毫秒级的数学公式渲染。
- **AI 驱动的实验生成**：集成自定义 AI Agent 模块，支持根据自然语言指令动态生成数学实验配置。
- **技能增强型开发流**：内置 `.claude/skills` 模块，通过结构化的技能库管理开发规范与业务逻辑。

##  技术栈概览

| 领域 | 核心技术 | 说明 |
| :--- | :--- | :--- |
| **前端框架** | React 19, Vite | 下一代 UI 库与高性能构建工具 |
| **样式方案** | Tailwind CSS | 原子化 CSS，快速构建响应式界面 |
| **后端运行时** | Node.js 20+ | 支持现代 ES Module 与异步编程模型 |
| **语言基础** | TypeScript (55.6%) | 强类型约束，提升代码可维护性 |
| **可视化引擎** | Mapbox GL, Plotly.js, D3.js, KaTeX | 覆盖地理、函数、数据、公式四大维度 |
| **AI 模块** | agent/ai, agent/dynamicExperiment | 支持自然语言驱动的动态实验生成 |
| **数据存储** | LowDB | 轻量级本地 JSON 数据库，适合原型与小型项目 |
| **开发工具** | .claude/skills | 结构化技能库，用于规范开发与业务逻辑 |

##  项目结构

```
.
├── .claude/skills/          # AI 技能库，包含开发规范与业务逻辑模板
├── client/                  # 前端代码目录（React + Vite）
│   ├── src/                 # 前端源码
│   └── package.json         # 前端依赖配置
├── src/                     # 后端源码（Express + tsx）
│   ├── routes/              # API 路由定义
│   ├── models/              # 数据模型（LowDB）
│   └── server.ts            # 后端入口文件
├── package.json             # 项目根依赖配置
└── README.md                # 本文档
```

##  快速开始

### 环境要求

- Node.js >= 20
- npm >= 8

### 安装依赖

```bash
# 安装根目录依赖（后端）
npm install

# 安装前端依赖
cd client && npm install
```

### 启动开发服务器

```bash
# 启动后端服务（tsx 运行）
npm run dev:server

# 启动前端服务（Vite）
cd client && npm run dev
```

### AI Agent 配置

在 `.claude/skills/` 目录下配置你的 AI 模型参数，支持主流大模型接入。具体配置项请参考 `skills/ai-config.ts`。

##  许可协议

