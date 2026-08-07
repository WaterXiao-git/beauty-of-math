## 2026-08-06 · 修复：前端 tsc 9 处错误（死代码 / 未使用变量 / 错误占位符）

**模块**：前端演示页 + 提问页

**内容**：
- RolleCanvas 删除视口网格改造后残留的 gridLines 死代码（gridLines 从未定义，运行时 ReferenceError，且旧固定范围网格已被 calcViewportGrid 取代）
- AskPage /api/generate 失败分支误写 `HTTP` 占位符 → 改为中文提示「生成失败，请稍后重试」（原为运行时 ReferenceError）
- RolleDemo 补 import STEPS（PlayerBar steps prop 所需，原本编译报 Cannot find name 'STEPS'）
- DerivativeDemo / EpsilonDeltaDemo / RolleCanvas 移除未使用的 consumeDrag 解构；DerivativeDemo 移除未用 fp 解构；EpsilonDeltaDemo 移除未用 inEps；TempExperiment 移除未用 xs

**涉及文件**：`client/src/demo/RolleCanvas.tsx`、`RolleDemo.tsx`、`DerivativeDemo.tsx`、`EpsilonDeltaDemo.tsx`、`TempExperiment.tsx`、`client/src/ask/AskPage.tsx`

**验证**：tsc -b --noEmit exit 0（此前 9 错误全清）；vite build 成功（48.4s）

---

## 2026-08-06 · 牛顿迭代法演示（shape=newton，课程 ch3-s4）

**模块**：前端演示模板 / server 配置层

**内容**：
- FunctionPlotDemo 新增 shape=newton：mathjs 符号求导 + 迭代序列（xₙ₊₁=xₙ−f(xₙ)/f′(xₙ)，最多 6 步、|Δ|<1e-10 收敛停）；画布标注迭代点（x 轴琥珀点 + 曲线上玫瑰点 + 竖虚线，随播放步进逐步显示）；面板显示 x₀~x₃ 迭代值；教学判断输出收敛根
- knowledge.ts 新增 newton-method（3 案例：x²−2 求 √2、x³−x−1、cos x − x；x₀ 滑块）；课程知识点「牛顿迭代法」挂 demoId + 注册

**涉及文件**：`client/src/demo/FunctionPlotDemo.tsx`、`server/src/data/knowledge.ts`、`client/src/course/courseData.ts`、`client/src/demo/DemoPage.tsx`

**验证**：双端 tsc 0；vite build 成功（1m1s）；/api/knowledge/newton-method 实测 200（3 案例 shape=newton）

---

## 2026-08-06 · 滑块拖动粒度细化到 0.01

**模块**：前端通用组件

**内容**：SliderRow 滑块 step 改为 Math.min(配置 step, 0.01)，拖动不再受 0.5 倍数限制，可与手动输入一致达到两位小数精度（如 0.25、1.33）

**涉及文件**：`client/src/demo/ui/SliderRow.tsx`

**验证**：tsc exit 0

---

## 2026-08-06 · 滑块数值支持点击手动输入（两位小数）

**模块**：前端通用组件

**内容**：SliderRow 数值显示改为可点击按钮，点击变输入框（type=number，step=0.01，自动聚焦），Enter/失焦提交并自动 clamp 到 [min,max]；滑块拖动保留。所有使用滑块的演示（函数家族/三角函数/圆锥曲线等）统一生效

**涉及文件**：`client/src/demo/ui/SliderRow.tsx`

**验证**：tsc exit 0；vite build 成功（57.4s）

---

## 2026-08-06 · 批量迁移第六批：函数变换 / 幂级数（纯配置）

**模块**：server 配置层 / 课程数据

**内容**（内容对齐原知识点旧页）：
- **函数变换**（/demo/function-transform）：g(x)=a·f(b(x−h))+k 参数化，a/b/h/k 四滑块，基函数 x²/sin/|x|/x³ 4 案例（基曲线 + 变换曲线双线对比，对应旧页基函数按钮与参数面板）
- **幂级数**（/demo/power-series）：精确函数 + 部分和双曲线，5 案例（几何级数 4/8 项、eˣ 4 项、ln(1+x)、arctan），tips 覆盖收敛半径（对应旧页级数选项与项数）
- courseData 新增「函数的变换」（1.1）「幂级数」（3.2 泰勒公式小节）知识点；DemoPage 注册 2 行；前端模板零改动

**涉及文件**：`server/src/data/knowledge.ts`、`client/src/course/courseData.ts`、`client/src/demo/DemoPage.tsx`

**验证**：双端 tsc 0；vite build 成功（58.9s）；两新接口实测 200（4/5 案例 + 双曲线）

---

## 2026-08-06 · 曲线曲率自适应细分（Desmos 式，极限/函数曲线更精细）

**模块**：前端演示画布

**内容**：
- viewport.ts 新增 refineCurve：对相邻点中点相对线性插值偏差超 tol 的区间插入中点（2 轮细分），弯曲剧烈处自动加密、平缓处保持稀疏
- 四个画布（ε−δ / 导数 / 罗尔 / FunctionPlotDemo）曲线采样全部改为「均匀 300 点 + 自适应细分」，极限附近与曲率大的区域（√x 拐点、泰勒多项式边缘、反比例渐近线附近）显示更贴近真实曲线；分段/渐近线断开逻辑保留

**涉及文件**：`client/src/demo/viewport.ts`、`EpsilonDeltaDemo.tsx`、`DerivativeDemo.tsx`、`RolleCanvas.tsx`、`FunctionPlotDemo.tsx`

**验证**：tsc exit 0；vite build 成功（58.5s）

---

## 2026-08-06 · 批量迁移第五批：三角函数 / 圆锥曲线 / 泰勒公式（纯配置）

**模块**：server 配置层 / 课程数据

**内容**（内容对齐原知识点旧页）：
- **三角函数**（/demo/trigonometric-function）：A·sin(f·x+φ) 与 A·cos(f·x+φ) 双曲线，A/f/φ 滑块，面板显示振幅/频率/周期/初相（对应旧页参数 amplitude/frequency/phase 与公式卡 sin²+cos²=1）
- **圆锥曲线**（/demo/conic-sections）：椭圆（横/竖）/双曲线/抛物线 4 案例，a/b/p 滑块，上下支 expr+expr2，tips 覆盖焦点/离心率/渐近线（对应旧页定义与教学步骤）
- **泰勒公式**（/demo/taylor-approximation）：原函数 + 泰勒多项式双曲线，eˣ 2/4 阶、sin x 3/5 阶 4 案例（对应旧页函数选择与阶数参数）；课程知识点「泰勒公式」挂 demoId
- courseData 新增「三角函数」「圆锥曲线」知识点；DemoPage 注册 3 行；全程零前端模板改动（验证配置驱动产能）

**涉及文件**：`server/src/data/knowledge.ts`、`client/src/course/courseData.ts`、`client/src/demo/DemoPage.tsx`

**验证**：server tsc 0；client tsc 0；vite build 成功（1m）；三个新接口实测 200（各 4 案例 + dataItems/tips）

---

## 2026-08-06 · FunctionPlotDemo 改造为纯配置驱动通用模板 + 配置指南

**模块**：前端演示模板 / 配置体系

**内容**：
- 模板全面配置化：数据面板项（dataItems：expr 基于 params 求值 / text 支持 {参数} 插值）、观察提示（tips 插值）、图例（legend）、概念公式（formula）均**配置优先**，原 shape 判断降级为兜底（向后兼容全部 11 个演示）
- 新增 docs/CONFIG_GUIDE.md：配置编写指南（最小模板/内置 shape 表/注册三步）
- function-plot 配置改为配置驱动示例（dataItems=4/tips=3/legend=3/formula），验证链路
- 后续新增演示只需填配置（knowledge.ts + courseData + registry 一行），前端零改动

**涉及文件**：`client/src/demo/FunctionPlotDemo.tsx`、`server/src/data/knowledge.ts`、`docs/CONFIG_GUIDE.md`（新增）

**验证**：client tsc 0；server tsc 0；vite build 成功（1m2s）；/api/knowledge/function-plot 实测返回 formula/dataItems(4)/tips(3)/legend(3)

---

## 2026-08-06 · 批量迁移第四批：分段函数 + 复合函数

**模块**：前端演示模板 / server 配置层

**内容**：
- FunctionPlotDemo 新增 shape：piecewise（KnowledgeCase 扩展 pieces 字段，分段逐段采样、段间断开）、composite（单曲线复合结构，面板显示 f(g(x)) 求值顺序）
- knowledge.ts：新增 piecewise-function（4 案例：符号函数/绝对值分段/x² 接 2x−1/阶梯）与 composite-function（4 案例：sin2x/cos(x²)/√(1−x²)/2^(x²)）
- courseData 新增两知识点 + DemoPage 注册

**涉及文件**：`client/src/demo/FunctionPlotDemo.tsx`、`DemoPage.tsx`、`server/src/data/knowledge.ts`、`client/src/course/courseData.ts`

**验证**：client tsc 0；server tsc 0；vite build 成功（1m2s）；/api/knowledge/piecewise-function（4 案例 2 段）与 /composite-function（4 案例）实测 200

---

## 2026-08-06 · 网格刻度改贴坐标轴显示

**模块**：前端演示画布

**内容**：GridTicks 刻度标签由固定底边/左边改为贴坐标轴：x 刻度沿 x 轴（y=0）下方、y 刻度沿 y 轴（x=0）左侧；轴不在画布内时回退底边/左边

**涉及文件**：`client/src/demo/ui/GridTicks.tsx`

**验证**：tsc -b --noEmit exit 0

---

## 2026-08-06 · 正方形格子 + 自适应刻度 + 反比例断开修复 + 反函数对称

**模块**：前端演示画布（坐标系级）

**内容**：
- **正方形格子**：新增 buildWorldMap 等比例世界映射（x/y 单位像素一致，居中），四个演示页 sx/sy/coord 全部切换；calcViewportGrid 内部改用等比例映射
- **自适应刻度**：网格线带 label（1/2/5×10ⁿ niceStep），新增 GridTicks 组件贴底边/左边渲染刻度数字（缩小显示 5/10/15、放大显示 1/2/3），各页接入
- **反比例函数**：采样跨垂直渐近线（x=h）断开 + 超限点断开（y 限幅提高到 40×+100），修复「正负无穷点连起来」「贴近坐标轴不显示」
- **反函数**：等比例映射下 y=x 对称轴恢复 45°；inverse x³ 案例 yRange 调 [-4,4] 适配等比
- 案例等比适配：inverse-cube yRange [-8,8]→[-4,4]

**涉及文件**：`client/src/demo/viewport.ts`、`ui/GridTicks.tsx`（新增）、`EpsilonDeltaDemo.tsx`、`DerivativeDemo.tsx`、`RolleCanvas.tsx`、`FunctionPlotDemo.tsx`、`server/src/data/knowledge.ts`

**验证**：client tsc 0；server tsc 0；vite build 成功（1m1s）

---

## 2026-08-06 · 批量迁移第三批：反比例函数（渐近线）+ 反函数（y=x 对称）

**模块**：前端演示模板 / server 配置层

**内容**：
- FunctionPlotDemo 新增 shape：rational（反比例 y=a/(x−h)+k：垂直/水平渐近线贯穿虚线 + 中心点可拖改 h/k）、inverse-pair（复用双曲线机制：函数靛蓝 + 反函数粉 + y=x 虚线）；采样加 y 限幅（防渐近线处大值连线）
- knowledge.ts：新增 rational-function（4 案例：1/x、1/(x−1)、1/(x−1)+1、−2/(x+1)+2）与 inverse-function（3 案例：x²↔√x、x³↔x^(1/3)、2ˣ↔log₂x）
- courseData 新增两知识点 + DemoPage 注册

**涉及文件**：`client/src/demo/FunctionPlotDemo.tsx`、`DemoPage.tsx`、`server/src/data/knowledge.ts`、`client/src/course/courseData.ts`

**验证**：client tsc 0；server tsc 0；vite build 成功（1m3s）；/api/knowledge/rational-function 与 /inverse-function 实测 200

---

## 2026-08-06 · 顶点可拖 + 画布点色规范 + 批量迁移第二批（指数与对数函数）

**模块**：前端演示模板 / 设计文档 / server 配置层

**内容**：
- **顶点可拖**：二次函数顶点（拖拽反解 b/c，保持 a，曲线实时跟随）；绝对值函数顶点（拖拽改 h/k）；均用 GeoPoint free 约束
- **点色统一**：linear y 截距点 绿→紫 #c084fc、absolute 顶点→玫瑰 #fb7185、零点→绿 #34d399；规范写入 docs/UNIFIED_LAYOUT.md「五、画布点色规范」（曲线亮蓝/顶点玫瑰/零点绿/y 截距紫/x 截距琥珀/目标点蓝/P 蓝 Q 琥珀/ξ 紫/割线天蓝切线粉/辅助线灰虚线）
- **批量迁移第二批：指数与对数函数**（/demo/exponential-log-function）：shape=exp-log 双曲线（指数靛蓝 + 对数粉 + y=x 对称虚线），KnowledgeCase 扩展 expr2；4 案例（底数 2/e/10/0.5）；courseData 新增知识点 + DemoPage 注册

**涉及文件**：`client/src/demo/FunctionPlotDemo.tsx`、`DemoPage.tsx`、`server/src/data/knowledge.ts`、`client/src/course/courseData.ts`、`docs/UNIFIED_LAYOUT.md`

**验证**：client tsc 0；server tsc 0；vite build 成功（58.9s）；/api/knowledge/exponential-log-function 实测 200（4 案例 shape=exp-log）

---

## 2026-08-06 · 修复：二次对称轴虚线不贯穿 + 绝对值零点公式错误

**模块**：前端演示模板

**内容**：
- 二次函数对称轴竖线 y 范围从 0..H 改为可视映射范围（visYMapMin/Max），pan/zoom 后无限贯穿
- 绝对值函数零点公式修正：|x−h| = r 的解为 x = h ± r（原误用 h ± √r，导致 −|x|+3 的零点显示 ±√3≈1.73 而实际 ±3）；验证全部案例 f(零点)=0

**涉及文件**：`client/src/demo/FunctionPlotDemo.tsx`

**验证**：tsc exit 0；零点公式 node 实测（|x−2|→2、−|x|+3→±3 等 f=0）；vite build 成功（57.9s）

---

## 2026-08-06 · 修复：二次函数/绝对值函数演示注册缺失（误显示建设中）

**模块**：前端演示入口

**内容**：DemoPage demoRegistry 补注册 quadratic-function / absolute-value-function → FunctionPlotDemo（组件内按 pointId 加载配置），两演示可正常打开

**涉及文件**：`client/src/demo/DemoPage.tsx`

**验证**：tsc -b --noEmit exit 0

---

## 2026-08-06 · 批量迁移第一批：FunctionPlotDemo 泛化 + 二次函数/绝对值函数

**模块**：前端演示模板 + server 配置层

**内容**：
- FunctionPlotDemo 泛化为「参数化函数画布」：参数滑块由 case.params + paramRanges 自动生成；shape 支持 linear（截距点/斜率三角形可拖）/ quadratic（顶点/对称轴/根/判别式）/ absolute（顶点/零点）；按知识点 id 加载配置（useParams）
- knowledge.ts：KnowledgeCase 扩展 paramRanges/shape/markers；新增 quadratic-function（5 案例：x²/−x²/(x−1)²/x²−4/x²+1）与 absolute-value-function（5 案例：|x|/|x−2|/|x|+1/2|x|/−|x|+3）
- courseData：1.1 函数小节新增「二次函数」「绝对值函数」知识点，挂 demoId
- 效果：新增函数类演示只加配置不碰代码（迁移产能验证）

**涉及文件**：`client/src/demo/FunctionPlotDemo.tsx`、`server/src/data/knowledge.ts`、`client/src/course/courseData.ts`

**验证**：client tsc 0；server tsc 0；vite build 成功（59.8s）；/api/knowledge/quadratic-function 与 /absolute-value-function 实测 200（各 5 案例 + shape）

---

## 2026-08-06 · AI 助教清空预设消息，改空状态引导

**模块**：前端 AI 助教

**内容**：移除打开时的预设示例对话（原固定讲 ε−δ，与其他演示上下文不符）；打开时显示空状态引导（星光图标 + 「我是 AI 数学助教」+ 3 条快捷提问，点击直接发送）；send 支持可选文本参数

**涉及文件**：`client/src/demo/AiCopilot.tsx`

**验证**：tsc -b --noEmit exit 0

---

## 2026-08-06 · 概念要点卡塌陷根因修复（flex 子项被压缩）

**模块**：前端演示页布局

**内容**：
- 根因：aside 为 overflow-y-auto 的 flex 容器时，flex 子项 min-height:auto 归零，内容超高时卡片被 flex-shrink 压成一行、其余内容被裁（正文可选不可见、accent 条一行高）；四页 aside 加 [&>*]:shrink-0 修复
- ConceptCard 重构为纯自然流：absolute 紫色条 → border-l-4、去掉 overflow-hidden、公式卡 flex → text-center（消除所有可疑裁剪 CSS）

**涉及文件**：`client/src/demo/ui/ConceptCard.tsx`、`EpsilonDeltaDemo.tsx`、`DerivativeDemo.tsx`、`FunctionPlotDemo.tsx`、`RolleControl.tsx`

**验证**：tsc -b --noEmit exit 0

---

## 2026-08-06 · 概念要点卡内容不可见排查：公式改 \lt + 去 backdrop-blur

**模块**：前端演示页

**内容**：ε−δ 概念要点公式中的裸 < 改为 \lt（TeX 规范写法）；ConceptCard 去掉 backdrop-blur-sm（嵌套滚动容器内 backdrop-filter 偶发渲染异常），白底 + shadow-md

**涉及文件**：`client/src/demo/EpsilonDeltaDemo.tsx`、`client/src/demo/ui/ConceptCard.tsx`

**验证**：tsc -b --noEmit exit 0

---

## 2026-08-06 · ε−δ 页概念要点卡文案与公式

**模块**：前端演示页

**内容**：概念要点卡正文改为「无论给定多小的 ε，都能找到一个 δ，使得当 x 足够接近 a 点时，f(x) 必定落入 L 附近。」，公式块改为 ε−δ 定义式：0 < |x−a| < δ ⇒ |f(x)−L| < ε（LaTeX 渲染）

**涉及文件**：`client/src/demo/EpsilonDeltaDemo.tsx`

**验证**：tsc -b --noEmit exit 0

---

## 2026-08-06 · 当前步骤卡遮挡根因修复（底部行 pb-4 吃掉行高）

**模块**：前端演示页布局

**内容**：底部行 div 的 pb-4 使 h-20 内子元素实际仅 64px 高，步骤卡三行溢出；去掉 pb-4（行高完整 80px）并微压步骤卡内边距 py-2，三行内容完全容纳

**涉及文件**：`client/src/demo/ui/StepStatusCard.tsx`、`EpsilonDeltaDemo.tsx`、`DerivativeDemo.tsx`、`FunctionPlotDemo.tsx`、`RolleDemo.tsx`

**验证**：tsc -b --noEmit exit 0

---

## 2026-08-06 · 当前步骤卡行距修复（三行不再遮挡）

**模块**：前端演示页布局

**内容**：StepStatusCard 改为统一 gap-1.5 垂直间距 + 描述单行 truncate（悬停 title 显示全文）+ 放大行距（标题 leading-snug、描述 leading-relaxed），三行内容在 h-20 内不再溢出遮挡

**涉及文件**：`client/src/demo/ui/StepStatusCard.tsx`

**验证**：tsc -b --noEmit exit 0

---

## 2026-08-06 · 当前步骤卡与播放条同处底部一行（修正对齐）

**模块**：前端演示页布局

**内容**：
- 「当前步骤」卡从右侧三卡列底部移到**页面底部行**：底部行 = 左播放条（flex-1，控制+四阶段进度条）+ 右当前步骤卡（w-80 xl:w-96 与三卡同宽，h-20 与播放条同高）——两者同一水平线
- StepStatusCard 改为 h-full + 宽度类；PlayerBar footer 改为 flex-1 min-w-0
- 四页统一：ε−δ / 导数 / function-plot / 罗尔（RolleDemo 层接 stepDescription，RolleControl 移除 step prop）

**涉及文件**：`client/src/demo/ui/StepStatusCard.tsx`、`PlayerBar.tsx`、`EpsilonDeltaDemo.tsx`、`DerivativeDemo.tsx`、`FunctionPlotDemo.tsx`、`RolleControl.tsx`、`RolleDemo.tsx`

**验证**：tsc -b --noEmit exit 0；vite build 成功（59.1s）

---

## 2026-08-06 · 当前步骤说明移入右侧列底部(与三卡竖直对齐、与播放条同高)

**模块**：前端演示页布局

**内容**：
- PlayerBar 移除右侧「步骤说明」区块（播放条只保留 播放控制 + 四阶段进度条）
- 新增 StepStatusCard（h-20 与播放条同高、白卡圆角、当前步骤标题紫色 + 描述）
- 四个演示页右侧列改为「三卡可滚动区 + 底部固定步骤卡」结构：步骤说明与右侧三卡同列竖直对齐，与底部四阶段进度条同一水平线；RolleControl 新增 step prop（由 RolleDemo 传入）

**涉及文件**：`client/src/demo/ui/StepStatusCard.tsx`（新增）、`PlayerBar.tsx`、`EpsilonDeltaDemo.tsx`、`DerivativeDemo.tsx`、`FunctionPlotDemo.tsx`、`RolleControl.tsx`、`RolleDemo.tsx`

**验证**：tsc -b --noEmit exit 0；vite build 成功（58.8s）

---

## 2026-08-06 · AI 助教接真实 DeepSeek + 演示页 UI 升级（Apple/Linear 风格三卡布局）

**模块**：前端演示页 / AI 助教

**内容**：
- **AI 助教接真实问答**：发送走 POST /api/answer（DeepSeek 主 + Qwen 备），携带当前知识点上下文；新增「思考中」加载气泡与错误降级；keyPoints 换行渲染
- **共享 UI 组件集**（client/src/demo/ui/）：ConceptCard（白毛玻璃+左侧紫 accent 条+圆角 22px+「概念要点/严格定义」标题左右分布+淡紫 #F5F3FF 公式块）、SegmentedControl（iOS 分段胶囊，选中紫色渐变）、SliderRow（标题左+数值右+紫色滑块）、SwitchRow（iOS Switch，标题+说明左）、ObserveTipCard（淡蓝气泡 ✨+文字，16px 圆角）
- **右侧面板统一三卡**：概念要点 / 实验控制 / 观察提示，四个演示页全部接入；ε−δ 页新增「显示辅助线」「突出有效曲线段」开关，导数页新增「显示辅助线(Δx/Δy)」开关，function-plot 新增「显示斜率三角形」开关
- **PlayerBar**：播放按钮紫色渐变、步进连线（完成绿/当前段绿→紫渐变/未完成灰）、当前节点紫色渐变
- **AI 助教入口改右下角 FAB**：「✨ 问 AI 助教」紫色渐变胶囊（原右侧竖条按钮）
- 罗尔页 RolleControl 重构为三卡（定理条件概念卡+实验控制 Segmented+条件 Switch+观察提示），移除旧「向 AI 助教提问」冗余按钮

**涉及文件**：`client/src/demo/ui/`（ConceptCard/SegmentedControl/SliderRow/SwitchRow/ObserveTipCard，新增）、`AiCopilot.tsx`、`PlayerBar.tsx`、`DemoPage.tsx`、`EpsilonDeltaDemo.tsx`、`DerivativeDemo.tsx`、`RolleControl.tsx`、`FunctionPlotDemo.tsx`

**验证**：tsc -b --noEmit exit 0；vite build 成功（1m15s）

---

## 2026-08-06 · 演示页接入 AI 数学助教侧边栏（右侧悬浮/可收起）

**模块**：前端演示页

**内容**：
- 新增 AiCopilot 组件（AI Copilot Sidebar，按 UI 描述实现）：fixed right-0 top-16 bottom-0 纯白抽屉（border-l + shadow-lg），头部（星光图标 + 「AI 数学助教」+ 关闭）、当前上下文卡（「当前上下文」可收起/展开；知识点/公式/当前项/极限值 4 项，灰底圆角）、对话消息列表（用户右侧灰气泡 + AI 左侧蓝紫气泡，支持 MathFormula 渲染 LaTeX，AI 气泡底部 复制/点赞/点踩 工具栏）、底部胶囊输入框 + 圆形蓝色发送按钮（本地模拟回复，后续接 /api/answer）
- DemoPage 统一接入：右侧悬浮「✦」入口按钮（收起态），展开/收起动画；上下文数据按当前演示模板映射（ε−δ/导数/罗尔/function-plot 各自提供公式与当前值），4 个演示页 + 占位页全部生效

**涉及文件**：`client/src/demo/AiCopilot.tsx`（新增）、`DemoPage.tsx`

**验证**：tsc -b --noEmit exit 0；vite build 成功（55.4s）

---

## 2026-08-06 · 阶段2试点：一次函数图像（function-plot 模板，配置驱动 + 统一排版）

**模块**：前端演示模板 + server 配置层

**内容**：
- 新增 FunctionPlotDemo 模板（第 4 个统一演示）：参数化表达式 y = k*x + b（mathjs 多变量求值），深色画布（无限网格/曲线/斜率三角形）+ 可拖拽截距点（y 截距点沿 y 轴改 b、x 截距点沿 x 轴改斜率）+ 数据面板（斜率/截距/单调性）+ 控制面板（案例 Tab/k、b 滑块/教学判断）+ 播放条
- knowledge.ts：KnowledgeCase 增加 params 字段（参数化表达式默认值），template 枚举增加 'function-plot'，新增 linear-function 配置（4 案例：y=x / y=2x+1 / y=−x+3 / 常函数）
- courseData：知识点「函数」挂 demoId: 'function-plot'（/demo/function 进入统一演示）；DemoPage 注册模板
- 验证「配置驱动 + 统一排版」链路：新增知识点只改数据不碰代码

**涉及文件**：`client/src/demo/FunctionPlotDemo.tsx`（新增）、`DemoPage.tsx`、`client/src/course/courseData.ts`、`server/src/data/knowledge.ts`

**验证**：client tsc exit 0；server tsc exit 0；vite build 成功（1m15s）；/api/knowledge/function-plot 实测 200 返回 4 案例 + params

---

## 2026-08-06 · 修复：演示页「报告Bug」与步骤说明右下角冲突 + 统一排版方案文档

**模块**：前端布局 / 设计文档

**内容**：
- BugReportButton（fixed bottom-4 right-4 橙色胶囊）与 PlayerBar 右侧步骤说明重叠：改为仅旧实验页显示（isLegacyExperiment），演示页/提问页不再显示，步骤说明独占右下角
- 新增 docs/UNIFIED_LAYOUT.md：知识点/新演示/旧实验元素盘点 + 统一排版骨架 + 技术栈统一路线（全部知识点最终迁移到「SVG 画布+控制面板+播放条」统一配置渲染，淘汰 canvas2D/Plotly 双轨；外壳化仅作过渡兜底）

**涉及文件**：`client/src/components/Layout/Layout.tsx`、`docs/UNIFIED_LAYOUT.md`（新增）

**验证**：tsc -b --noEmit exit 0

---

## 2026-08-06 · 旧实验页外壳化（300+ 页统一 DemoHeader + 抽屉触角）

**模块**：前端布局

**内容**：
- 新增 ExperimentShell：旧实验页（/linear-function 等 300+ 独立路由）统一外壳 = DemoHeader（面包屑「首页 / 交互实验 / 实验名」+ 提问跳转）+ 内容区（滚动 + 原内边距）+ 左侧触角 + 章节抽屉（选中跳 /demo/:pointId）；实验名从 experiments/catalog.ts 映射
- 提取公共 DrawerTab 组件（fixed 定位，滚动内容下仍贴屏幕左缘），DemoPage 改共用
- Layout：新增 isLegacyExperiment 分支（非课程平台且非 /admin、/valentine 的路由），旧实验页不再渲染移动端 header / 全局深色侧栏，改由外壳接管；Bug 报告按钮与讲解控制条保留

**涉及文件**：`client/src/demo/ExperimentShell.tsx`、`DrawerTab.tsx`（新增）、`client/src/demo/DemoPage.tsx`、`client/src/components/Layout/Layout.tsx`

**验证**：tsc -b --noEmit exit 0；vite build 成功（1m14s）

---

## 2026-08-06 · 演示页拖拽边界统一为可视范围 + 修罗尔页背景拉伸 / 导数页曲线不完整

**模块**：前端演示画布

**内容**：
- 统一交互模型：拖拽边界与曲线采样范围 = 可视世界范围（Desmos 风格，边界 = 屏幕边缘），三页一致
- ε−δ 页：目标点 a 拖拽边界从 domain 改为可视范围（原 domain 视觉不明显导致「边界小」）；可行 δ 搜索边界外扩 domain 50% 且按函数定义域（NaN）判定；a 拖到无定义处（√x 的 x<0）显示「函数无定义」友好提示而非 NaN
- 导数页：曲线采样从固定 [xMin,xMax] 改为可视范围（修复 pan 后「函数只显示一部分」）；P/Q 拖拽边界改为可视范围
- 罗尔页：坐标系映射固定为案例默认 domain（修复拖 A/B 时「背景拉宽」——此前 sx 用可拖动的 [a,b] 映射，拖端点导致整图拉伸）；曲线采样固定 viewDomain，A/B 只在固定坐标系上滑动区间

**涉及文件**：`client/src/demo/EpsilonDeltaDemo.tsx`、`DerivativeDemo.tsx`、`RolleCanvas.tsx`

**验证**：tsc -b --noEmit exit 0；vite build 成功（55.7s）

---

## 2026-08-06 · 演示页拖拽体系完善：修复 Q 点「微动即飞」+ 全部预设接入可拖拽点

**模块**：前端演示画布

**内容**：
- **修复根因**：svg 用 preserveAspectRatio="xMidYMid meet"，容器宽高比 ≠ viewBox(720×400) 时存在 letterbox 留白，旧换算把 clientX−rect.left 直接当 viewBox 坐标 → 拖拽点/缩放中心偏移，导数页 Q 点「微动即飞」；新增 svgViewBox.ts（clientToViewBox 按 viewBox+实际渲染尺寸换算），useDraggablePoint 拖拽换算与 usePanZoom 滚轮缩放中心同步修正
- 导数页：Q 点 h 加上界 clamp（拖不出 domain，f(x₀+h) 不再爆炸）
- ε−δ 页：目标点 a 改为可拖拽（沿曲线约束，拖动联动 L / ε 带 / δ 邻域 / 可行 δ；切案例重置）
- 罗尔页：A/B 端点改为可拖拽（沿曲线约束，拖动改变区间 [a,b]，ξ 越界自动隐藏；切案例重置 domain）

**涉及文件**：`client/src/demo/svgViewBox.ts`（新增）、`usePanZoom.ts`、`geoboard/useDraggablePoint.ts`、`DerivativeDemo.tsx`、`EpsilonDeltaDemo.tsx`、`RolleCanvas.tsx`、`RolleDemo.tsx`

**验证**：tsc -b --noEmit exit 0；vite build 成功（53.4s）

---

## 2026-08-06 · 演示页抽屉触角调宽

**模块**：前端演示页

**内容**：收起态左侧「目录」触角按钮加宽（h-14 w-6 → h-16 w-8）、图标放大（w-3.5 → w-4）、hover 滑出幅度加大（0.5 → 1），消除局促感

**涉及文件**：`client/src/demo/DemoPage.tsx`

**验证**：tsc -b --noEmit exit 0

---

## 2026-08-06 · 演示页接入抽屉式侧边栏（收起态左侧触角）

**模块**：前端演示页

**内容**：
- DemoPage 接入此前设计的 DrawerSidebar（off-canvas 抽屉：章节分组/搜索/选中高亮），仅演示页面（/demo/:pointId）生效，主界面不受影响
- 收起态在页面左侧垂直居中留「目录」触角小标志（半圆胶囊 + 汉堡图标，hover 变紫+微滑出），点击弹出抽屉
- 抽屉选中知识点 → 跳转 /demo/:pointId（含未实现知识点的「建设中」占位页）；当前演示知识点自动高亮，选中后自动收起
- 覆盖全部 /demo/:pointId 页面：罗尔 / ε−δ / 导数 / 未实现占位页

**涉及文件**：`client/src/demo/DemoPage.tsx`

**验证**：tsc -b --noEmit exit 0；vite build 成功（53.8s）

---

## 2026-08-06 · 修复：demo 页「提问」按钮不可用

**模块**：前端演示页

**内容**：DemoHeader 右侧「提问」按钮为纯 button 无任何点击行为；改为 `<Link to="/ask">`（与主界面 CourseHeader 智能提问一致），点击跳转 AI 提问页。四个演示页（ε−δ/导数/罗尔/临时实验）共用该 Header，一处修复全部生效

**涉及文件**：`client/src/demo/DemoHeader.tsx`

**验证**：tsc -b --noEmit exit 0

---

## 2026-08-06 · 演示页面包屑可点击

**模块**：前端演示页

**内容**：DemoHeader 面包屑非末项可点击（hover 变紫+下划线）；四个演示页接入：ε−δ/导数/罗尔非末项点击回主界面，临时实验页「临时实验」点击回提问页

**涉及文件**：`client/src/demo/DemoHeader.tsx`、`EpsilonDeltaDemo.tsx`、`DerivativeDemo.tsx`、`RolleDemo.tsx`、`TempExperiment.tsx`

**验证**：tsc exit 0；vite 编译 5 模块 200

---
## 2026-08-06 · 修复：ε−δ 页 √x 案例曲线不显示

**模块**：前端演示画布

**内容**：无限延伸改造后曲线采样从可视范围开始，√x 在 x<0 为 NaN 被跳过，首点非 i=0 导致 path 以 L 开头被 SVG 判为无效 → 整条曲线消失；改为 started 标志让首个有效点用 M 起笔（sin/x² 不受影响）

**涉及文件**：`client/src/demo/EpsilonDeltaDemo.tsx`

**验证**：tsc exit 0；vite 编译 200

---
## 2026-08-06 · geoboard 几何画板内核（GeoGebra 式预留框架）+ 导数页拖拽示例

**模块**：前端演示画布

**内容**：
- 新增 geoboard 内核：types.ts（CoordSystem 坐标映射/PointConstraint 约束/visibleRect/clipLineToRect 无限线裁剪）、useDraggablePoint（命中+拖拽+约束 free/xAxis/yAxis/curve）、GeoPoint（可拖拽点：命中区/拖拽态/标签，stopPropagation 与画布平移互斥）、GeoLine（两点定线自动贯穿可视区域）
- 导数页接入示例：P 点沿曲线拖动（更新 x0，滑块同步）、Q 点沿曲线拖动（更新 h），割线/切线改 GeoLine 贯穿并随点实时联动，Δx/Δy/斜率数值面板同步
- 预留能力清单见 geoboard/types.ts 注释（衍生对象/测量/约束系统/对象面板）

**涉及文件**：
- `client/src/demo/geoboard/`（types.ts、useDraggablePoint.ts、GeoPoint.tsx、GeoLine.tsx，新增）
- `client/src/demo/DerivativeDemo.tsx`（接入）

**验证**：tsc exit 0；vite 编译 5 模块 200

---
## 2026-08-06 · ε−δ 演示页曲线与虚线无限延伸

**模块**：前端演示画布

**内容**：ε−δ 页（默认案例 x²）：曲线采样范围从固定 domain 改为可视世界范围（铺满视图）；ε 蓝虚线（L±ε）与 L 线、δ 黄虚线改为贯穿全屏（可视映射坐标），ε/δ 带区域同步扩展；pan/zoom 时跟随世界坐标但始终贯穿

**涉及文件**：`client/src/demo/EpsilonDeltaDemo.tsx`

**验证**：tsc exit 0；vite 编译 200

---
## 2026-08-06 · 修复：Cannot access 'dMin' before initialization

**模块**：前端演示画布

**内容**：视口网格 grid 计算被插入到 domain 变量（dMin/dMax、xMin/xMax、a/b）定义之前，触发 TDZ 报错；三个画布的 grid 计算统一移到 sx/sy 定义之后

**涉及文件**：`client/src/demo/RolleCanvas.tsx`、`EpsilonDeltaDemo.tsx`、`DerivativeDemo.tsx`

**验证**：顺序断言 grid@>domain@ 正确；tsc exit 0；vite 编译 200

---
## 2026-08-06 · 坐标轴/网格无限延伸（Desmos 风格）

**模块**：前端演示画布

**内容**：
- 新增 viewport.ts：calcViewportGrid 按当前 pan/zoom 变换计算铺满屏幕的网格线（间距自适应 niceStep 1/2/5×10^n）与贯穿坐标轴（世界 0 的屏幕位置）
- 三个演示画布（罗尔/ε−δ/导数）的网格与坐标轴从"固定数据范围"改为"视口坐标系"（g 外屏幕坐标）；曲线/节点/ε−δ 带等数据内容保持世界坐标
- 效果：任意缩放/平移后网格始终铺满画布、坐标轴贯穿全屏

**涉及文件**：`client/src/demo/viewport.ts`（新增）、`RolleCanvas.tsx`、`EpsilonDeltaDemo.tsx`、`DerivativeDemo.tsx`

**验证**：tsc exit 0；vite 编译 4 模块 200

---
## 2026-08-06 · 修复：演示页 usePanZoom is not defined

**模块**：前端演示页

**内容**：EpsilonDeltaDemo / DerivativeDemo 调用 usePanZoom 但 import 缺失（此前 patch 的 import 锚点依赖 MathFormula import，这两个文件没有）；补上 import

**涉及文件**：`client/src/demo/EpsilonDeltaDemo.tsx`、`DerivativeDemo.tsx`

**验证**：tsc exit 0；vite 编译 200 且模块包含 usePanZoom

---
## 2026-08-06 · 演示画布滚轮缩放 + 拖拽平移（修复）

**模块**：前端演示页

**内容**：
- 新增 usePanZoom hook：滚轮以鼠标为中心缩放（0.5-12x）+ 拖拽平移 + 区分点击/拖拽（consumeDrag）
- 应用于三个演示画布（罗尔/ε−δ/导数），SVG 内容以 <g transform> 包裹
- 修复：含图标 <svg> 的文件 gClose 曾误插到图标闭合前（lastIndexOf 误匹配），改为插入主画布第一个 </svg> 前

**涉及文件**：`client/src/demo/usePanZoom.ts`（新增）、`RolleCanvas.tsx`、`EpsilonDeltaDemo.tsx`、`DerivativeDemo.tsx`

**验证**：tsc exit 0；vite 编译 4 模块全 200

---
## 2026-08-06 · 演示画布滚轮缩放 + 拖拽平移

**模块**：前端演示页

**内容**：新增 usePanZoom hook（滚轮以鼠标为中心缩放 0.5-12x + 拖拽平移，区分点击/拖拽），应用于三个演示画布（罗尔定理/ε−δ/导数）；SVG 内容以 <g transform> 包裹，光标 grab 样式

**涉及文件**：`client/src/demo/usePanZoom.ts`（新增）、`RolleCanvas.tsx`、`EpsilonDeltaDemo.tsx`、`DerivativeDemo.tsx`

**验证**：tsc exit 0；vite 编译 4 模块 200

---
## 2026-08-06 · 主界面面包屑可点击回退层级

**模块**：前端主界面

**内容**：CourseHeader 面包屑非末项可点击（> 连接，代表子章节层级）；CourseHome 实现层级跳转：首页/课程→默认知识点、章节→该章第一个知识点、小节→该小节第一个知识点；AskPage 不受影响

**涉及文件**：`client/src/course/CourseHeader.tsx`、`CourseHome.tsx`

**验证**：tsc exit 0；vite 编译 200

---
## 2026-08-06 · 清理被遗弃的前端残留

**模块**：前端清理

**内容**：
- askData.ts 删除 6 个废弃模拟数据导出（VISUAL_TEMPLATES/ESTIMATED_TIME/DIFFICULTY/RELATED_MATCHES/TOP_MATCHES/RECOMMENDED_GOALS/VISUAL_PREVIEW_NOTE），保留 PROMPT_POOL/LEARNING_PATH/RelatedMatch
- 删除 NarrationOutline 组件（原项目遗留孤儿，0 引用）

**涉及文件**：`client/src/ask/askData.ts`、`client/src/components/NarrationOutline/`（删除）

**验证**：node 递归扫描确认 7 个目标无残留；tsc --noEmit exit 0

---
## 2026-08-06 · 分支 C：确认后生成临时交互实验（/api/generate + iframe 隔离）

**模块**：server 生成服务 + 前端临时实验页

**内容**：
- 新增 DynamicExperimentSpec schema + 本地模板库（直角坐标/极坐标/四则运算，模板优先）
- 新增 generateService：规则模板选择（极坐标/计算关键词）→ DeepSeek 生成配置 → Qwen 复核/故障接管 → Schema 校验（formula mathjs 可解析 + domain 合法，不合规退化本地默认模板）→ 服务端预采样
- 新增 POST /api/generate
- 新增 /temp/:specId 页面：SessionStorage 读 spec + iframe srcDoc 渲染自包含 SVG（sandbox 隔离，仅会话预览，不写源码/不注册永久路由）
- AskPage ai 分支「确认生成」接真实接口

**涉及文件**：
- `server/src/data/tempSpecSchema.ts`、`services/generateService.ts`、`routes/generate.ts`（新增）
- `server/src/services/llmService.ts`（导出 chat/配置）、`index.ts`（挂载）、`package.json`（+mathjs）
- `client/src/demo/TempExperiment.tsx`（新增）、`client/src/ask/AskPage.tsx`、`GenerateConfirm.tsx`、`App.tsx`、`Layout.tsx`

**验证**：server/client tsc 通过；/api/generate 实测 3 类问题（x²→cartesian、三叶玫瑰→polar、求和→arithmetic）返回完整 spec（含 161 采样点）；vite 编译 200

---
## 2026-08-06 · 配置 DeepSeek Key 并验证真实解释生成

**模块**：server LLM

**内容**：server/.env 写入 DEEPSEEK_API_KEY（已确认被 .gitignore 忽略，不提交泄露）；真实调用实测成功：POST /api/answer 返回完整解释卡片（标题/摘要/4 条关键点/数学示例：lim x→2 (3x-1)=5 的 ε-δ 证明）

**涉及文件**：`server/.env`（新建，git 忽略）

**验证**：真实 DeepSeek 调用 200，返回结构化 JSON 解释；answer 分支端到端链路（前端 → /api/route → /api/answer → DeepSeek → 卡片）打通。

---
## 2026-08-06 · 分支 B：双模型概念解释（/api/answer）

**模块**：server LLM + 前端 answer 分支

**内容**：
- 新增 llmService：DeepSeek 主模型 + Qwen 备用模型（故障接管），OpenAI 兼容协议 + 30s 超时 + JSON 解析容错
- 新增 POST /api/answer：生成结构化解释卡片（标题/摘要/关键点/示例），密钥仅存服务端 .env（dotenv）
- AnswerCard 改为真实调用（三态：加载/成功/失败降级占位）
- 提供 server/.env.example 模板

**涉及文件**：
- `server/src/services/llmService.ts`、`server/src/prompts/explain.ts`、`server/src/routes/answer.ts`（新增）
- `server/src/index.ts`（dotenv + 挂载）、`server/.env.example`（新增）、`server/package.json`（+dotenv）
- `client/src/ask/AnswerCard.tsx`（重写）、`AskPage.tsx`（适配）

**验证**：server/client tsc 通过；无 Key 时 500 返回明确错误（前端降级占位）；真实生成需用户配置 .env 后验证。

---
## 2026-08-06 · 修复：极限类问题误路由到「反函数」

**模块**：server 规则优先路由

**内容**：
- 问题「什么是函数在一点的极限？」此前核心词「函数在一点的极限」无法匹配知识点短语「函数的极限」，误落 Manifest 评分（反函数 63% suggest）
- 知识点匹配改为短关键词包含 + 最长匹配优先（极限→ε−δ、导数/微分→导数、罗尔→罗尔）

**涉及文件**：`server/src/services/routeService.ts`

**验证**：tsc 通过；7 组极限/导数/罗尔相关问题全部 direct 命中正确知识点（@1/knowledge）。

---
## 2026-08-06 · 前端 AskPage 接入真实规则优先路由

**模块**：前端 AI 提问页

**内容**：
- AskPage「智能解析」改为真实调用 POST /api/route（不再使用模拟数据）
- 按五分支渲染结果：direct/suggest → 匹配卡片（进入演示跳 top.path）；answer → 解释卡片（占位，待接大模型）；ai → 生成确认卡；no-match → 说明卡
- AnalysisPanel 改为路由解析面板（意图/分支/置信度/原因/Top 匹配）
- 新增 AnswerCard / GenerateConfirm / NoMatchCard 组件
- MatchResults 关联卡支持无公式（后端 matches 无 summary/formula）

**涉及文件**：
- `client/src/ask/AskPage.tsx`（重写）
- `client/src/ask/AnswerCard.tsx`、`GenerateConfirm.tsx`（新增）
- `client/src/ask/AnalysisPanel.tsx`、`MatchResults.tsx`（改造）

**验证**：tsc 通过；vite 编译 5 模块 200；后端 /api/route 实测五分支正确。

---
# MathViz 改动存档（Change Log）

> 工作约定：每次代码改动后，在本文件追加一条记录（日期 / 模块 / 内容 / 涉及文件 / 验证）。
> 按时间倒序排列，最新改动在最上方。

---

## 2026-08-06 · 规则优先路由核心（架构图第 3 层）

**模块**：server 后端

**内容**：
- 新增 300 实验 Manifest（从 client catalog.ts 同步）
- 新增规则优先路由：意图识别（draw/calculate/explain/demo/find）+ 核心词提取 + 英文术语映射 + 知识点优先路由 + 自研规则评分 + 参数提取
- 新增 POST /api/route 接口，返回五分支决策（direct/suggest/answer/ai/no-match）
- 弃用 Fuse.js 7.5（实测中文/拉丁串 score 恒为 1.0），改自研评分

**涉及文件**：
- `server/src/data/experimentManifest.ts`（新增，300 条）
- `server/src/services/routeService.ts`（新增）
- `server/src/routes/route.ts`（新增）
- `server/src/index.ts`（挂载 /api/route）
- `server/package.json`（+pinyin-pro）

**验证**：tsc 通过；15 组真实问题实测五分支全部正确。

---

## 2026-08-06 · Vite 代理修复

**模块**：前端构建

**内容**：vite.config.ts 新增 server.proxy，/api 代理到后端 http://localhost:3001（此前前端 fetch /api 拿到 index.html 导致 JSON 解析失败）

**涉及文件**：`client/vite.config.ts`

**验证**：代理链路实测 200 + JSON。

---

## 2026-08-06 · ε−δ 极限定义 / 导数几何意义演示页

**模块**：前端演示

**内容**：
- 新增 EpsilonDeltaDemo：ε 误差带 + δ 邻域可视化、可行 δ 数值搜索（标注不唯一）、ε 滑块联动、四步播放教学
- 新增 DerivativeDemo：P/Q 双点、割线/切线、Δx/Δy 标注、x₀/h 滑块、h 播放递减逼近、教学判断
- 两个页面配置来自统一接口 /api/knowledge/:id（mathjs 动态解析）
- PlayerBar 泛化支持 steps prop

**涉及文件**：
- `client/src/demo/EpsilonDeltaDemo.tsx`（新增）
- `client/src/demo/DerivativeDemo.tsx`（新增）
- `client/src/demo/PlayerBar.tsx`（steps prop）
- `client/src/demo/RolleDemo.tsx`（适配）
- `client/src/demo/DemoPage.tsx`（注册模板）
- `client/src/course/courseData.ts`（demoId：functions limit→epsilon-delta、derivative→derivative）

**验证**：tsc 通过；vite 编译 6 模块 200；后端 epsilon-delta/derivative 配置接口 200。

---

## 2026-08-06 · 统一演示路由 /demo/:pointId

**模块**：前端演示入口

**内容**：
- 新增 DemoPage 统一演示容器：按知识点 demoId 渲染模板；未实现模板显示"建设中"占位 + 替代学习路径（符合需求 2.2）
- 主界面/AI 提问页「进入演示」全部改为 /demo/:pointId，不再直接跳老 UI 实验页
- Layout isCourseShell 支持 /demo/ 前缀（演示页全屏）

**涉及文件**：
- `client/src/demo/DemoPage.tsx`（新增）
- `client/src/course/KnowledgeDetail.tsx`、`client/src/ask/AskPage.tsx`（链接改造）
- `client/src/course/courseData.ts`（demoId 字段 + 微分中值定理→rolle）
- `client/src/App.tsx`（/demo/:pointId 路由）
- `client/src/components/Layout/Layout.tsx`（isCourseShell 前缀）

**验证**：tsc + vite + 6 项链接断言全部通过。

---

## 2026-08-06 · 罗尔定理交互演示页

**模块**：前端演示

**内容**：
- 新增 RolleDemo：深色画板（SVG 曲线/端点/ξ/水平切线/条件破坏可视化）+ 右侧控制面板（定理条件/案例 Tabs/3 条件开关/教学判断/AI 助教）+ 底部播放控制条（4 步进）
- 默认案例「双谷曲线」f(x)=x⁴−x²（数学自洽：a=-1/b=1/f(a)=f(b)=0/ξ=0）
- 注册 /rolle 路由

**涉及文件**：
- `client/src/demo/rolleData.ts`、`DemoHeader.tsx`、`RolleCanvas.tsx`、`RolleControl.tsx`、`PlayerBar.tsx`、`RolleDemo.tsx`（新增）
- `client/src/App.tsx`、`client/src/components/Layout/Layout.tsx`

**验证**：tsc + vite 8 模块 200。

---

## 2026-08-06 · AI 智能提问页

**模块**：前端页面

**内容**：
- 新增 AskPage（三栏）：多模态提问输入区（textarea/工具栏/推荐问题）+ AI 理解与匹配结果（主卡片/学习路径/关联卡）+ 右侧提问解析面板（复述/识别章节/Top3/目标/可视化预览/CTA）
- 新增 askData 示例数据；Header 增加「智能提问」按钮与激活态
- 注册 /ask 路由；Layout isCourseShell 加入 /ask

**涉及文件**：
- `client/src/ask/`（askData.ts、QuestionInput.tsx、MatchResults.tsx、AnalysisPanel.tsx、AskPage.tsx，新增）
- `client/src/course/CourseHeader.tsx`、`client/src/App.tsx`、`client/src/components/Layout/Layout.tsx`

**验证**：tsc + vite 7 模块 200。

---

## 2026-08-06 · 抽屉式侧边栏组件

**模块**：前端组件

**内容**：新增 DrawerSidebar（off-canvas 可折叠抽屉：章节与知识点标题/关闭按钮/搜索栏/章节分组列表/选中态高亮），独立可复用

**涉及文件**：`client/src/course/DrawerSidebar.tsx`（新增）

**验证**：tsc + vite 200。

---

## 2026-08-06 · 主界面改造（课程学习平台三栏布局）

**模块**：前端主界面

**内容**：
- 首页改为课程平台：顶部 Header（Logo「数韵之美」/面包屑/智能提问/头像）+ 左章节树 + 中（知识地图 SVG + 知识点导航卡片网格）+ 右知识点详情（简介/ε−δ 图/学习目标/CTA）
- 新增 courseData（高等数学（上册）4 章示例课程 + 状态/等级 token）
- Layout 首页全屏分支；/ask 与 /rolle 亦全屏

**涉及文件**：
- `client/src/course/`（courseData.ts、CourseHome.tsx、CourseHeader.tsx、ChapterSidebar.tsx、KnowledgeMap.tsx、KnowledgeCards.tsx、KnowledgeDetail.tsx，新增）
- `client/src/experiments/Home.tsx`（转发 CourseHome）
- `client/src/components/Layout/Layout.tsx`

**验证**：tsc + vite 全模块 200。

---

## 2026-08-06 · 环境与构建修复

**模块**：开发环境

**内容**：
- npm 12 allow-remote 配置（registry 换淘宝镜像 + allow-remote=all），解决 EALLOWREMOTE
- 修复 vite.config.ts 的 Windows 路径 bug（new URL().pathname → fileURLToPath），解决 D:\D:\ 双盘符
- esbuild/es5-ext install-scripts 警告确认无害

**涉及文件**：`client/vite.config.ts`、用户级 `~/.npmrc`

**验证**：npm install 全通；vite dev 正常；tsc 通过。