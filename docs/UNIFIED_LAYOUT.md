# 统一排版方案：知识点 / 新演示 / 旧实验元素盘点与统一骨架

> 目的：把 16 个课程知识点、3 个新演示页、300+ 旧实验页统一到同一套排版与元素模型。
> 原则：**知识点的差异收敛为「配置 + 模板绑定」，排版骨架全局统一**（对应需求 3.3 / 5.2）。

---

## 一、现状盘点

### 1. 课程知识点（client/src/course/courseData.ts，4 章 15 小节 16 个知识点）

字段：`id / title / status(已掌握·学习中·未学习) / previewLevel(A·B·C) / template(推荐模板) / summary / goals / related / experimentPath? / demoId?`

| 类型 | 数量 | 知识点 |
|---|---|---|
| 有 demoId（新演示） | 3 | 函数的极限(ε−δ)、导数、微分中值定理(罗尔) |
| 仅有 experimentPath（旧实验入口） | 8 | 函数→/linear-function、函数的极限/连续函数/导数/不定积分/定积分→/calculus、泰勒→/taylor、牛顿迭代→/newton-method |
| 无任何演示入口 | 5 | 数列的极限、无穷小与无穷大、极限的运算法则、两个重要极限、微分、函数图形描绘 |

### 2. 统一演示配置（server/src/data/knowledge.ts · KnowledgeConfig）

`id/title/course/chapter/section/template('epsilon-delta'|'derivative'|'theorem-demo')/summary/goals/defaultCase/cases(expr·domain·yRange·naturallyEqual·anchor·desc)/steps/conditions?/meta(难度·时长·模板)/version`

### 3. 新演示页元素（3 页共性，已是目标排版）

| 区域 | 元素 |
|---|---|
| 头部 | DemoHeader（Logo·面包屑可回退·提问·帮助·头像）+ 左侧触角 + 章节抽屉 |
| 画布区（左，深色） | 无限网格/坐标轴（viewport）· 函数曲线 · 可拖拽点(GeoPoint)·贯穿线(GeoLine)·ε/δ 带·Δx/Δy 标注 · 左下实时数据面板 · 公式浮层 · 锁定按钮 |
| 控制面板（右，白卡） | 概念说明 · 案例切换 Tab · 参数滑块/开关 · 教学判断 |
| 播放条（底） | 播放/暂停/步进进度条/当前步骤说明（PlayerBar） |

### 4. 旧实验页（experiments/catalog.ts 300 个；抽样 6 页归纳）

catalog 字段：`path/title/description/icon/difficulty/ageRange/topics/hasAnimation/hasSteps`

内部布局**已统一骨架**（一代/二代视觉差异）：

```
NarrationPresenter(全屏讲解) + 页头(h1+副标题+讲解按钮) + grid-cols-1 lg:grid-cols-3
  ├─ 左栏 lg:col-span-2：图表/画布卡片堆叠（canvas2D 或 Plotly）
  └─ 右栏：控制/信息卡片堆叠（ParameterPanel 或手写 slider + 步骤控制 + 知识点）
```

差异：一代(linear/pythagorean/set-theory/taylor：手写控件、canvas2D、部分有步骤系统) vs 二代(fourier/calculus：ParameterPanel、Plotly、仅播放按钮)。全部自带 `useNarrationOptional + NarrationPresenter` 讲解系统。

---

## 二、统一排版骨架（目标形态）

```
┌────────────────────────────────────────────────────────────┐
│ DemoHeader：Logo | 面包屑(课程▸章节▸小节▸知识点)  提问 帮助 头像 │  ← h-16
├────────────────────────────────────────────────────────────┤
│ 画布区(左, flex-1, 深色画板)      │ 控制面板(右, w-80~96, 白卡) │
│  · 无限网格/坐标轴                │  · 概念说明卡              │
│  · 曲线/几何对象(可拖拽点/贯穿线)   │  · 案例切换 Tab            │
│  · 模板专属标注(带/切线/断口…)     │  · 参数控件(滑块/开关/输入)  │
│  · 左下数据面板(实时数值)          │  · 教学判断卡              │
├────────────────────────────────────────────────────────────┤
│ PlayerBar：⏮ ⏯ ⏭ 重置 | 步进 1-4 进度条 | 当前步骤说明       │  ← h-20
└────────────────────────────────────────────────────────────┘
（左侧触角 + 章节抽屉常驻；讲解系统 NarrationPresenter 全屏叠加）
```

**视觉规范**（对齐新演示页）：
- 页面：`flex flex-col h-full bg-[#f5f7fa]`；Header h-16 白底；主区 `flex-1 min-h-0 flex gap-4 p-4 md:p-5`
- 画板卡：`flex-1 min-w-0 bg-slate-900 rounded-2xl p-4 md:p-6`；SVG 画布 `bg-slate-950/60 rounded-xl`
- 控制卡：`bg-white rounded-2xl shadow-sm border border-gray-100`（p-5）
- 播放条：`h-20 bg-white border-t`（仅配置了 steps 时显示）
- 抽屉/触角/提问：沿用现组件（DrawerSidebar/DrawerTab/DemoHeader）

---

## 三、元素模型（统一注册表）

```ts
// 模板类型（扩展 knowledge.ts 的 template 枚举）——统一渲染架构的模板，不是旧技术栈兼容层
// 目标：所有知识点最终都渲染为同一套「SVG 画布 + 控制面板 + 播放条」
type TemplateType = 'epsilon-delta' | 'derivative' | 'theorem-demo' | 'function-plot' | 'geometry' | 'series' | 'canvas-generic'

// 统一页面 = 骨架 + 模板化内容区 + 配置（全部配置驱动，无硬编码组件）
{
  header:   { breadcrumb 由 chapter/section/point 推导 }
  canvas:   { 坐标系(domain/yRange) · 曲线(expr) · 对象(点/线/带) · 标注 }   // SVG/geoboard 统一渲染
  control:  { 概念说明 · cases[] · params(滑块/开关/输入) · judgment(教学判断) } // 控件声明式配置
  player:   { steps[] | 无 }                                                  // PlayerBar
  shell:    { 触角 · 抽屉 · 讲解入口 }
}

// 旧页迁移 = 把原 canvas2D/Plotly 的逻辑重写进对应模板（数学表达式 → expr + 参数），
// 逐步淘汰 canvas2D / react-plotly / 手写控件，最终只保留一套技术栈
```

旧页归类建议（catalog topics 已具备分类依据）：
- **function-plot**：linear-function / quadratic-function / absolute-value / exponential-log …
- **geometry**：pythagorean / geometry-shapes / triangle-centers …
- **series**：taylor / fourier / power-series …
- **canvas-generic**：无法配置化的页（保留原组件，仅套外壳）

---

## 四、落地路径（三阶段，可讨论调整）

| 阶段 | 内容 | 产出 |
|---|---|---|
| 1 | 扩展 TemplateType + 通用控件组件（ParameterPanel/数值卡/公式卡已有）+ 骨架组件（统一画布容器/统一控制面板容器） | 排版骨架可复用 |
| 2 | 试点重写 1 个代表页（建议 linear-function → function-plot 模板，数据只加 knowledge.ts 一条） | 验证「配置驱动 + 统一排版」链路 |
| 3 | 按归类批量迁移：**全部重写进统一模板**（优先高频页；Plotly/canvas2D 逻辑收敛为 expr+参数），不再保留原技术栈 | 300 页技术栈统一 |

> 注：
> - 已完成的旧实验页外壳化（ExperimentShell）是**过渡兜底**——配置化完成前所有页已有统一 Header/触角/抽屉；
> - **最终形态：全部知识点走统一配置渲染，淘汰 canvas2D / react-plotly / 手写控件双轨**；
> - 讲解系统（NarrationPresenter）为全局能力，两套形态共用，不受迁移影响。
