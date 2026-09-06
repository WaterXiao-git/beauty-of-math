# Function Basics 15 Native Experiments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the first module's shared placeholder visualization with 15 mathematically distinct Native Experiment V2 pages whose dedicated teaching steps control real experiment state.

**Architecture:** Each `hm-01-XX` route receives a dedicated React component. Components share only coordinate/SVG utilities, controls, a Native shell wrapper, and a deterministic teaching-player hook; every experiment owns its mathematical state, visualization, controls, step names, and step actions.

**Tech Stack:** React 19, TypeScript, SVG, Tailwind CSS, Vitest, ExperimentShell, ExperimentCard, PlayerBar.

**Spec:** `docs/superpowers/specs/2026-08-31-function-basics-15-native-experiments-design.md`

## Global Constraints

- Keep the current Native Experiment V2 page shell and navigation.
- Reuse only business-neutral primitives; do not reuse a knowledge-point visualization.
- Bind `hm-01-01` through `hm-01-15` to 15 dedicated components.
- Every experiment has four dedicated step names and deterministic step actions.
- Step click, previous, next, play, pause, and reset must update actual experiment state.
- Do not change the remaining 135 experiment routes in this phase.
- Do not change AI question scope or add multimodal input.

---

### Task 1: Make PlayerBar steps interactive

**Files:**
- Modify: `client/src/demo/PlayerBar.tsx`
- Modify: `client/src/experiment-v2/ExperimentShell.tsx`
- Create: `client/src/demo/PlayerBar.test.tsx`

**Interfaces:**
- Consumes: existing `StepItem`, `ExperimentPlayerConfig`.
- Produces: optional `onStepSelect(step: number): void` on both player interfaces.

- [ ] **Step 1: Write the failing interaction test**

Render `PlayerBar` with four named steps, click the third step button, and assert `onStepSelect(3)` was called. Assert each node has an accessible label such as `切换到步骤 3：描出坐标点`.

- [ ] **Step 2: Run the test and observe failure**

Run: `npm --prefix client exec vitest run src/demo/PlayerBar.test.tsx`

- [ ] **Step 3: Implement clickable step nodes**

Add `onStepSelect?: (step: number) => void` and render each progress node as a real `<button type="button">`. Disable only when no callback is supplied; keep connector lines outside the button.

- [ ] **Step 4: Pass the callback through ExperimentShell**

Add the callback to `ExperimentPlayerConfig` and forward it to `PlayerBar`.

- [ ] **Step 5: Run the focused test**

Run: `npm --prefix client exec vitest run src/demo/PlayerBar.test.tsx`

### Task 2: Add shared neutral experiment infrastructure

**Files:**
- Create: `client/src/demo/function-basics/shared/CartesianPlane.tsx`
- Create: `client/src/demo/function-basics/shared/FunctionExperimentLayout.tsx`
- Create: `client/src/demo/function-basics/shared/useTeachingPlayer.ts`
- Create: `client/src/demo/function-basics/shared/math.ts`
- Create: `client/src/demo/function-basics/shared/useTeachingPlayer.test.tsx`

**Interfaces:**
- Produces: `CartesianPlane`, `plotPath`, `toScreenX`, `toScreenY`.
- Produces: `FunctionExperimentLayout({ pointId, legend, canvas, controls, observation, steps, player })`.
- Produces: `useTeachingPlayer<TState>({ initialState, steps, applyStep })` returning `{ state, setState, step, playing, player }`.

- [ ] **Step 1: Write the failing player-hook test**

Use a small state `{ value: number }`. Select step 3 and assert the state patch is applied; advance, play, pause, and reset and assert step/state consistency.

- [ ] **Step 2: Run the test and observe failure**

Run: `npm --prefix client exec vitest run src/demo/function-basics/shared/useTeachingPlayer.test.tsx`

- [ ] **Step 3: Implement deterministic player state**

`selectStep(three)` must call `applyStep(three, currentState)`, update the current step, and stop playback when selected manually. Playback advances at a fixed interval and stops after the fourth step. Reset restores the component's own `initialState`.

- [ ] **Step 4: Implement the neutral SVG plane and layout**

The SVG primitive only renders axes, grid, labels, and children. The layout resolves title, summary, goals, Native shell, sidebar cards, current observation, and the provided player; it contains no function-specific curve.

- [ ] **Step 5: Run the focused test**

Run: `npm --prefix client exec vitest run src/demo/function-basics/shared/useTeachingPlayer.test.tsx`

### Task 3: Implement domain, graph, monotonicity, parity, and periodicity experiments

**Files:**
- Create: `client/src/demo/function-basics/DomainRangeExperiment.tsx`
- Create: `client/src/demo/function-basics/FunctionGraphExperiment.tsx`
- Create: `client/src/demo/function-basics/MonotonicityExperiment.tsx`
- Create: `client/src/demo/function-basics/ParityExperiment.tsx`
- Create: `client/src/demo/function-basics/PeriodicityExperiment.tsx`
- Create: `client/src/demo/function-basics/functionBasicsExperiments.test.tsx`

**Interfaces:**
- Each file exports one default React component with no props.
- Each component uses its own state type and four dedicated steps.

- [ ] **Step 1: Write failing structural tests for the five components**

Render each component and assert its dedicated title, control labels, four unique step names, and a unique SVG test id (`domain-range-canvas`, `function-graph-canvas`, `monotonicity-canvas`, `parity-canvas`, `periodicity-canvas`). Click a step and assert the component-specific observation or canvas marker changes.

- [ ] **Step 2: Run the tests and observe failure**

Run: `npm --prefix client exec vitest run src/demo/function-basics/functionBasicsExperiments.test.tsx`

- [ ] **Step 3: Implement DomainRangeExperiment**

Use adjustable left/right domain endpoints, open/closed boundary controls, x-axis domain shading, y-axis range projection, endpoint markers, and steps `选择函数 / 限定定义域 / 扫描函数值 / 确认值域`.

- [ ] **Step 4: Implement FunctionGraphExperiment**

Use function selection, current x, sample count, an x/y value table, progressive point plotting, and steps `读取解析式 / 计算数值表 / 描出坐标点 / 连接函数图像`.

- [ ] **Step 5: Implement MonotonicityExperiment**

Use interval endpoints, a curve with increasing/decreasing regions, a secant line, derivative sign strip, and steps `选择研究区间 / 比较函数值 / 观察变化率 / 判断单调性`.

- [ ] **Step 6: Implement ParityExperiment**

Use function-case selection, x and -x points, reflected curve, equality residual, and steps `选择对称点 / 计算 f(-x) / 执行对称映射 / 判断奇偶性`.

- [ ] **Step 7: Implement PeriodicityExperiment**

Use periodic-function selection, candidate T, shifted overlay, mismatch metric, and steps `选择参考点 / 平移候选周期 / 比较函数值 / 确认最小正周期`.

- [ ] **Step 8: Run the five-component tests**

Run: `npm --prefix client exec vitest run src/demo/function-basics/functionBasicsExperiments.test.tsx`

### Task 4: Implement inverse, composition, piecewise, parametric, and polar experiments

**Files:**
- Create: `client/src/demo/function-basics/InverseFunctionExperiment.tsx`
- Create: `client/src/demo/function-basics/CompositeFunctionExperiment.tsx`
- Create: `client/src/demo/function-basics/PiecewiseFunctionExperiment.tsx`
- Create: `client/src/demo/function-basics/ParametricEquationExperiment.tsx`
- Create: `client/src/demo/function-basics/PolarEquationExperiment.tsx`
- Modify: `client/src/demo/function-basics/functionBasicsExperiments.test.tsx`

**Interfaces:** Each component exports a no-prop default component and owns four dedicated step actions.

- [ ] **Step 1: Extend the failing structural tests**

Assert unique SVG IDs, controls, step names, and state changes for all five components.

- [ ] **Step 2: Implement InverseFunctionExperiment**

Render `y=x`, original/inverse curves, paired points, a one-to-one case switch, and steps `选择原函数点 / 交换坐标 / 关于 y=x 对称 / 验证反函数`.

- [ ] **Step 3: Implement CompositeFunctionExperiment**

Render a three-stage mapping pipeline plus f/g/composition curves and steps `输入 x / 经过内层函数 / 进入外层函数 / 生成复合图像`.

- [ ] **Step 4: Implement PiecewiseFunctionExperiment**

Render independently colored pieces, breakpoint slider, endpoint inclusion controls, left/right values, and steps `划分区间 / 设置分段规则 / 处理端点 / 检查拼接结果`.

- [ ] **Step 5: Implement ParametricEquationExperiment**

Render case-specific x(t)/y(t), a trace controlled by t, a moving point, tangent vector, and steps `确定参数 / 分别计算坐标 / 描出运动点 / 形成参数曲线`.

- [ ] **Step 6: Implement PolarEquationExperiment**

Render a polar grid, radial segment, moving θ point, case-specific polar trace, and steps `确定极角 / 计算极径 / 定位极坐标点 / 扫描完整曲线`.

- [ ] **Step 7: Run the ten-component tests**

Run: `npm --prefix client exec vitest run src/demo/function-basics/functionBasicsExperiments.test.tsx`

### Task 5: Implement elementary-functions and four transformation experiments

**Files:**
- Create: `client/src/demo/function-basics/ElementaryFunctionsExperiment.tsx`
- Create: `client/src/demo/function-basics/TranslationExperiment.tsx`
- Create: `client/src/demo/function-basics/ScalingExperiment.tsx`
- Create: `client/src/demo/function-basics/ReflectionExperiment.tsx`
- Create: `client/src/demo/function-basics/ParameterInfluenceExperiment.tsx`
- Modify: `client/src/demo/function-basics/functionBasicsExperiments.test.tsx`

**Interfaces:** Each component exports a no-prop default component and owns four dedicated step actions.

- [ ] **Step 1: Extend the failing structural tests to all 15 components**

Assert unique SVG IDs, dedicated controls, unique steps, and observable step effects.

- [ ] **Step 2: Implement ElementaryFunctionsExperiment**

Render a function-family selector, expression/domain/range cards, key features and comparison overlay with steps `选择函数族 / 观察定义域 / 标记关键特征 / 比较函数类型`.

- [ ] **Step 3: Implement TranslationExperiment**

Render original/translated curves, h/k controls, movement arrow, paired points, and steps `选择原图关键点 / 执行水平平移 / 执行竖直平移 / 写出新表达式`.

- [ ] **Step 4: Implement ScalingExperiment**

Render original/scaled curves, horizontal/vertical factors, mapped grid/key points, and steps `选择关键点 / 竖直伸缩 / 水平伸缩 / 比较表达式与坐标`.

- [ ] **Step 5: Implement ReflectionExperiment**

Render reflection-mode controls, original/reflected curves, paired points, expression labels, and steps `选择翻折方式 / 映射坐标点 / 生成翻折图像 / 验证表达式`.

- [ ] **Step 6: Implement ParameterInfluenceExperiment**

Render `ax²+bx+c`, a/b/c controls, vertex, symmetry axis, discriminant and roots, and steps `调节 a 观察开口 / 调节 b 观察对称轴 / 调节 c 观察竖直位置 / 综合判断根与图像`.

- [ ] **Step 7: Run all 15 component tests**

Run: `npm --prefix client exec vitest run src/demo/function-basics/functionBasicsExperiments.test.tsx`

### Task 6: Register, audit, and document the 15 dedicated experiments

**Files:**
- Create: `client/src/demo/function-basics/index.ts`
- Modify: `client/src/owned-experiments/renderers.ts`
- Modify: `client/src/owned-experiments/renderers.test.ts`
- Modify: `docs/CHANGELOG.md`

**Interfaces:**
- Produces: `FUNCTION_BASICS_RENDERERS: Record<FunctionBasicsExperimentId, ComponentType>`.
- Renderer fallback remains `KnowledgeExperiment` for `hm-02-01` through `hm-14-09`.

- [ ] **Step 1: Write a failing registry identity test**

Assert the 15 IDs map to 15 distinct component references and none equals the generic renderer used by `hm-02-01`.

- [ ] **Step 2: Register the dedicated components**

Merge the explicit `FUNCTION_BASICS_RENDERERS` map over the generated fallback renderer map.

- [ ] **Step 3: Update the changelog**

Add a top entry stating that only the first module's 15 experiments were replaced and the remaining 135 await the next approved phase.

- [ ] **Step 4: Run focused and complete checks**

Run:

```powershell
npm --prefix client exec vitest run src/demo/PlayerBar.test.tsx src/demo/function-basics/shared/useTeachingPlayer.test.tsx src/demo/function-basics/functionBasicsExperiments.test.tsx src/owned-experiments/renderers.test.ts
npm --prefix client run build
```

Expected: all focused tests pass; TypeScript and Vite build exit with code 0; scope checker still reports 14 modules and 150 routes.
