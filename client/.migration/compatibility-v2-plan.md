# Compatibility → Experiment V2 Migration Plan

Generated: 2026-08-08T15:37:26.900Z

## Summary

- Total experiments: 300
- Native V2: 257
- Compatibility: 43
- Safe: 0
- Review: 10
- Manual: 33

## Renderer

- Canvas: 15
- Plotly: 22
- Hybrid: 6
- Other: 0

## Experiments

### three-body

- Group: **review**
- Score: 4
- Renderer: canvas
- Lines: 169
- Standard three column: false
- White cards: 4
- Canvas: 1
- Plot: 0
- Meaningful SVG: 0
- State hooks: 4
- Effect hooks: 2
- Buttons: 4
- Inputs: 1
- Custom components: 4

**Reasons**

- 不是标准旧三栏结构，需要人工确认页面边界。

**Recommendation:** 适合 3~5 个一批迁移，每批执行 npm run build 和页面检查。

### newton-method

- Group: **review**
- Score: 6
- Renderer: plotly
- Lines: 438
- Standard three column: true
- White cards: 8
- Canvas: 0
- Plot: 1
- Meaningful SVG: 0
- State hooks: 6
- Effect hooks: 2
- Buttons: 5
- Inputs: 3
- Custom components: 2

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 检测到条件 JSX 布局，自动切割风险较高。

**Recommendation:** 适合 3~5 个一批迁移，每批执行 npm run build 和页面检查。

### fourier-drawing

- Group: **review**
- Score: 7
- Renderer: canvas
- Lines: 411
- Standard three column: true
- White cards: 8
- Canvas: 1
- Plot: 0
- Meaningful SVG: 0
- State hooks: 6
- Effect hooks: 3
- Buttons: 4
- Inputs: 4
- Custom components: 3

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 适合 3~5 个一批迁移，每批执行 npm run build 和页面检查。

### fractal

- Group: **review**
- Score: 7
- Renderer: canvas
- Lines: 389
- Standard three column: true
- White cards: 8
- Canvas: 1
- Plot: 0
- Meaningful SVG: 0
- State hooks: 6
- Effect hooks: 3
- Buttons: 6
- Inputs: 3
- Custom components: 4

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 适合 3~5 个一批迁移，每批执行 npm run build 和页面检查。

### game-of-life

- Group: **review**
- Score: 7
- Renderer: canvas
- Lines: 165
- Standard three column: false
- White cards: 4
- Canvas: 1
- Plot: 0
- Meaningful SVG: 0
- State hooks: 4
- Effect hooks: 3
- Buttons: 6
- Inputs: 1
- Custom components: 4

**Reasons**

- 不是标准旧三栏结构，需要人工确认页面边界。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 适合 3~5 个一批迁移，每批执行 npm run build 和页面检查。

### set-theory

- Group: **review**
- Score: 7
- Renderer: canvas
- Lines: 458
- Standard three column: true
- White cards: 7
- Canvas: 1
- Plot: 0
- Meaningful SVG: 0
- State hooks: 7
- Effect hooks: 3
- Buttons: 5
- Inputs: 2
- Custom components: 4

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 适合 3~5 个一批迁移，每批执行 npm run build 和页面检查。

### vector-field

- Group: **review**
- Score: 7
- Renderer: canvas
- Lines: 467
- Standard three column: true
- White cards: 7
- Canvas: 1
- Plot: 0
- Meaningful SVG: 0
- State hooks: 6
- Effect hooks: 3
- Buttons: 3
- Inputs: 3
- Custom components: 3

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 适合 3~5 个一批迁移，每批执行 npm run build 和页面检查。

### wave-equation

- Group: **review**
- Score: 7
- Renderer: canvas
- Lines: 395
- Standard three column: true
- White cards: 8
- Canvas: 1
- Plot: 0
- Meaningful SVG: 0
- State hooks: 7
- Effect hooks: 3
- Buttons: 4
- Inputs: 4
- Custom components: 4

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 适合 3~5 个一批迁移，每批执行 npm run build 和页面检查。

### matrix-decomposition

- Group: **review**
- Score: 8
- Renderer: plotly
- Lines: 491
- Standard three column: true
- White cards: 10
- Canvas: 0
- Plot: 1
- Meaningful SVG: 0
- State hooks: 4
- Effect hooks: 2
- Buttons: 7
- Inputs: 1
- Custom components: 3

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 适合 3~5 个一批迁移，每批执行 npm run build 和页面检查。

### probability

- Group: **review**
- Score: 8
- Renderer: plotly
- Lines: 374
- Standard three column: true
- White cards: 5
- Canvas: 0
- Plot: 1
- Meaningful SVG: 0
- State hooks: 3
- Effect hooks: 2
- Buttons: 3
- Inputs: 0
- Custom components: 4

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 适合 3~5 个一批迁移，每批执行 npm run build 和页面检查。

### linear-function

- Group: **manual**
- Score: 9
- Renderer: canvas
- Lines: 574
- Standard three column: true
- White cards: 7
- Canvas: 1
- Plot: 0
- Meaningful SVG: 0
- State hooks: 8
- Effect hooks: 3
- Buttons: 10
- Inputs: 5
- Custom components: 4

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- 文件偏大：574 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### pythagorean

- Group: **manual**
- Score: 9
- Renderer: canvas
- Lines: 578
- Standard three column: true
- White cards: 7
- Canvas: 1
- Plot: 0
- Meaningful SVG: 0
- State hooks: 8
- Effect hooks: 3
- Buttons: 11
- Inputs: 4
- Custom components: 5

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- 文件偏大：578 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### differential-geometry

- Group: **manual**
- Score: 10
- Renderer: plotly
- Lines: 466
- Standard three column: true
- White cards: 8
- Canvas: 0
- Plot: 2
- Meaningful SVG: 0
- State hooks: 4
- Effect hooks: 1
- Buttons: 3
- Inputs: 2
- Custom components: 4

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 同一实验包含多个可视化区域。
- 检测到条件 JSX 布局，自动切割风险较高。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### gradient-descent

- Group: **manual**
- Score: 10
- Renderer: plotly
- Lines: 452
- Standard three column: true
- White cards: 8
- Canvas: 0
- Plot: 2
- Meaningful SVG: 0
- State hooks: 7
- Effect hooks: 2
- Buttons: 5
- Inputs: 5
- Custom components: 3

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 同一实验包含多个可视化区域。
- 检测到条件 JSX 布局，自动切割风险较高。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### ode

- Group: **manual**
- Score: 10
- Renderer: plotly
- Lines: 356
- Standard three column: true
- White cards: 6
- Canvas: 0
- Plot: 2
- Meaningful SVG: 0
- State hooks: 4
- Effect hooks: 2
- Buttons: 3
- Inputs: 0
- Custom components: 4

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 同一实验包含多个可视化区域。
- 检测到条件 JSX 布局，自动切割风险较高。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### quadratic-function

- Group: **manual**
- Score: 10
- Renderer: canvas
- Lines: 586
- Standard three column: true
- White cards: 6
- Canvas: 1
- Plot: 0
- Meaningful SVG: 0
- State hooks: 9
- Effect hooks: 3
- Buttons: 8
- Inputs: 7
- Custom components: 4

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- 文件偏大：586 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### taylor

- Group: **manual**
- Score: 10
- Renderer: plotly
- Lines: 395
- Standard three column: true
- White cards: 6
- Canvas: 0
- Plot: 3
- Meaningful SVG: 0
- State hooks: 3
- Effect hooks: 2
- Buttons: 3
- Inputs: 0
- Custom components: 4

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 同一实验包含多个可视化区域。
- 检测到条件 JSX 布局，自动切割风险较高。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### basic-arithmetic

- Group: **manual**
- Score: 11
- Renderer: canvas
- Lines: 703
- Standard three column: true
- White cards: 7
- Canvas: 1
- Plot: 0
- Meaningful SVG: 0
- State hooks: 6
- Effect hooks: 3
- Buttons: 6
- Inputs: 3
- Custom components: 5

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- 文件较大：703 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### geometry-shapes

- Group: **manual**
- Score: 11
- Renderer: canvas
- Lines: 749
- Standard three column: true
- White cards: 7
- Canvas: 1
- Plot: 0
- Meaningful SVG: 0
- State hooks: 8
- Effect hooks: 3
- Buttons: 6
- Inputs: 5
- Custom components: 5

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- 文件较大：749 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### calculus

- Group: **manual**
- Score: 12
- Renderer: plotly
- Lines: 353
- Standard three column: true
- White cards: 5
- Canvas: 0
- Plot: 3
- Meaningful SVG: 0
- State hooks: 3
- Effect hooks: 2
- Buttons: 3
- Inputs: 0
- Custom components: 5

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 同一实验包含多个可视化区域。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### conic-sections

- Group: **manual**
- Score: 12
- Renderer: canvas
- Lines: 751
- Standard three column: true
- White cards: 7
- Canvas: 1
- Plot: 0
- Meaningful SVG: 0
- State hooks: 11
- Effect hooks: 3
- Buttons: 5
- Inputs: 7
- Custom components: 5

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- 文件较大：751 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### fractions

- Group: **manual**
- Score: 12
- Renderer: canvas
- Lines: 639
- Standard three column: true
- White cards: 7
- Canvas: 1
- Plot: 0
- Meaningful SVG: 0
- State hooks: 8
- Effect hooks: 3
- Buttons: 7
- Inputs: 4
- Custom components: 6

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- 文件偏大：639 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。
- 自定义组件较多：6。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### numerical-analysis

- Group: **manual**
- Score: 12
- Renderer: plotly
- Lines: 531
- Standard three column: true
- White cards: 10
- Canvas: 0
- Plot: 3
- Meaningful SVG: 0
- State hooks: 5
- Effect hooks: 1
- Buttons: 2
- Inputs: 3
- Custom components: 3

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 同一实验包含多个可视化区域。
- 文件偏大：531 行。
- 检测到条件 JSX 布局，自动切割风险较高。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### random-walk

- Group: **manual**
- Score: 12
- Renderer: plotly
- Lines: 441
- Standard three column: true
- White cards: 8
- Canvas: 0
- Plot: 3
- Meaningful SVG: 0
- State hooks: 6
- Effect hooks: 2
- Buttons: 5
- Inputs: 3
- Custom components: 3

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 同一实验包含多个可视化区域。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### graph-theory

- Group: **manual**
- Score: 13
- Renderer: canvas
- Lines: 553
- Standard three column: true
- White cards: 10
- Canvas: 1
- Plot: 0
- Meaningful SVG: 0
- State hooks: 9
- Effect hooks: 4
- Buttons: 7
- Inputs: 1
- Custom components: 6

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- 文件偏大：553 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。
- 自定义组件较多：6。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### pde

- Group: **manual**
- Score: 13
- Renderer: plotly
- Lines: 512
- Standard three column: true
- White cards: 8
- Canvas: 0
- Plot: 2
- Meaningful SVG: 0
- State hooks: 7
- Effect hooks: 3
- Buttons: 5
- Inputs: 1
- Custom components: 4

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 同一实验包含多个可视化区域。
- 文件偏大：512 行。
- 检测到条件 JSX 布局，自动切割风险较高。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### game-theory

- Group: **manual**
- Score: 14
- Renderer: plotly
- Lines: 583
- Standard three column: true
- White cards: 10
- Canvas: 0
- Plot: 2
- Meaningful SVG: 0
- State hooks: 8
- Effect hooks: 2
- Buttons: 4
- Inputs: 5
- Custom components: 3

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 同一实验包含多个可视化区域。
- 文件偏大：583 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### heat-equation

- Group: **manual**
- Score: 14
- Renderer: plotly
- Lines: 458
- Standard three column: true
- White cards: 8
- Canvas: 0
- Plot: 2
- Meaningful SVG: 0
- State hooks: 9
- Effect hooks: 4
- Buttons: 5
- Inputs: 2
- Custom components: 4

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 同一实验包含多个可视化区域。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### interpolation

- Group: **manual**
- Score: 14
- Renderer: plotly
- Lines: 580
- Standard three column: true
- White cards: 9
- Canvas: 0
- Plot: 2
- Meaningful SVG: 0
- State hooks: 5
- Effect hooks: 2
- Buttons: 5
- Inputs: 4
- Custom components: 3

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 同一实验包含多个可视化区域。
- 文件偏大：580 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### laplace

- Group: **manual**
- Score: 14
- Renderer: plotly
- Lines: 585
- Standard three column: true
- White cards: 7
- Canvas: 0
- Plot: 4
- Meaningful SVG: 0
- State hooks: 4
- Effect hooks: 1
- Buttons: 4
- Inputs: 5
- Custom components: 3

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 同一实验包含多个可视化区域。
- 文件偏大：585 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### numerical-integration

- Group: **manual**
- Score: 14
- Renderer: plotly
- Lines: 541
- Standard three column: true
- White cards: 9
- Canvas: 0
- Plot: 2
- Meaningful SVG: 0
- State hooks: 7
- Effect hooks: 2
- Buttons: 4
- Inputs: 3
- Custom components: 4

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 同一实验包含多个可视化区域。
- 文件偏大：541 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### pca

- Group: **manual**
- Score: 14
- Renderer: plotly
- Lines: 530
- Standard three column: true
- White cards: 9
- Canvas: 0
- Plot: 3
- Meaningful SVG: 0
- State hooks: 7
- Effect hooks: 2
- Buttons: 5
- Inputs: 3
- Custom components: 3

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 同一实验包含多个可视化区域。
- 文件偏大：530 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### permutation-combination

- Group: **manual**
- Score: 14
- Renderer: plotly
- Lines: 564
- Standard three column: true
- White cards: 10
- Canvas: 0
- Plot: 3
- Meaningful SVG: 0
- State hooks: 3
- Effect hooks: 2
- Buttons: 3
- Inputs: 0
- Custom components: 4

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 同一实验包含多个可视化区域。
- 文件偏大：564 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### regression

- Group: **manual**
- Score: 14
- Renderer: plotly
- Lines: 655
- Standard three column: true
- White cards: 10
- Canvas: 0
- Plot: 3
- Meaningful SVG: 0
- State hooks: 7
- Effect hooks: 2
- Buttons: 6
- Inputs: 3
- Custom components: 3

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 同一实验包含多个可视化区域。
- 文件偏大：655 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### cryptography

- Group: **manual**
- Score: 15
- Renderer: plotly
- Lines: 666
- Standard three column: true
- White cards: 10
- Canvas: 0
- Plot: 3
- Meaningful SVG: 0
- State hooks: 11
- Effect hooks: 2
- Buttons: 2
- Inputs: 6
- Custom components: 3

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 同一实验包含多个可视化区域。
- 文件偏大：666 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### optimization

- Group: **manual**
- Score: 15
- Renderer: plotly
- Lines: 515
- Standard three column: true
- White cards: 8
- Canvas: 0
- Plot: 2
- Meaningful SVG: 0
- State hooks: 9
- Effect hooks: 2
- Buttons: 5
- Inputs: 5
- Custom components: 4

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 同一实验包含多个可视化区域。
- 文件偏大：515 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### signal-processing

- Group: **manual**
- Score: 15
- Renderer: plotly
- Lines: 563
- Standard three column: true
- White cards: 10
- Canvas: 0
- Plot: 4
- Meaningful SVG: 0
- State hooks: 10
- Effect hooks: 2
- Buttons: 4
- Inputs: 4
- Custom components: 4

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- Plotly 需要同时处理 layout/theme。
- 同一实验包含多个可视化区域。
- 文件偏大：563 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### bayes

- Group: **manual**
- Score: 17
- Renderer: hybrid
- Lines: 427
- Standard three column: true
- White cards: 8
- Canvas: 0
- Plot: 1
- Meaningful SVG: 1
- State hooks: 6
- Effect hooks: 2
- Buttons: 3
- Inputs: 3
- Custom components: 3

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- 存在多个 Renderer 类型，不能使用普通单 Renderer 迁移。
- 同一实验包含多个可视化区域。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### bezier

- Group: **manual**
- Score: 18
- Renderer: hybrid
- Lines: 503
- Standard three column: true
- White cards: 7
- Canvas: 1
- Plot: 0
- Meaningful SVG: 1
- State hooks: 5
- Effect hooks: 3
- Buttons: 4
- Inputs: 2
- Custom components: 4

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- 存在多个 Renderer 类型，不能使用普通单 Renderer 迁移。
- 同一实验包含多个可视化区域。
- 文件偏大：503 行。
- 检测到条件 JSX 布局，自动切割风险较高。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### chaos

- Group: **manual**
- Score: 20
- Renderer: hybrid
- Lines: 510
- Standard three column: true
- White cards: 11
- Canvas: 1
- Plot: 3
- Meaningful SVG: 0
- State hooks: 8
- Effect hooks: 3
- Buttons: 6
- Inputs: 5
- Custom components: 5

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- 存在多个 Renderer 类型，不能使用普通单 Renderer 迁移。
- 同一实验包含多个可视化区域。
- 文件偏大：510 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### fourier-series

- Group: **manual**
- Score: 20
- Renderer: hybrid
- Lines: 502
- Standard three column: true
- White cards: 9
- Canvas: 1
- Plot: 2
- Meaningful SVG: 0
- State hooks: 6
- Effect hooks: 3
- Buttons: 4
- Inputs: 3
- Custom components: 5

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- 存在多个 Renderer 类型，不能使用普通单 Renderer 迁移。
- 同一实验包含多个可视化区域。
- 文件偏大：502 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### markov-chain

- Group: **manual**
- Score: 20
- Renderer: hybrid
- Lines: 554
- Standard three column: true
- White cards: 9
- Canvas: 1
- Plot: 2
- Meaningful SVG: 0
- State hooks: 8
- Effect hooks: 4
- Buttons: 4
- Inputs: 2
- Custom components: 4

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- 存在多个 Renderer 类型，不能使用普通单 Renderer 迁移。
- 同一实验包含多个可视化区域。
- 文件偏大：554 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。

### number-theory

- Group: **manual**
- Score: 20
- Renderer: hybrid
- Lines: 526
- Standard three column: true
- White cards: 13
- Canvas: 1
- Plot: 3
- Meaningful SVG: 0
- State hooks: 6
- Effect hooks: 3
- Buttons: 7
- Inputs: 3
- Custom components: 4

**Reasons**

- 标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。
- 存在多个 Renderer 类型，不能使用普通单 Renderer 迁移。
- 同一实验包含多个可视化区域。
- 文件偏大：526 行。
- 检测到条件 JSX 布局，自动切割风险较高。
- 除旧三栏外还存在复杂 Grid。

**Recommendation:** 不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。
