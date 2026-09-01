# 类型化数学模型实验运行时设计

日期：2026-09-01

## 1. 背景与审查结论

当前正式目录包含 150 个高等数学实验：15 个函数基础独立实验，以及 135 个由 `knowledge-native` 配置批量生成的实验。

全量静态审查确认，问题不是个别页面事件失效，而是现有 135 个实验的数据流存在结构性缺陷：

- 135 个实验只使用 11 个大型场景组件，主要依靠 `module + point` 分支切换画面。
- 135 个实验共用完全相同的两组参数范围，数学语义不同但参数约束没有变化。
- 31 个名称明确表示项数、阶数、次数、密度等离散量的参数，没有整数类型约束。
- 参数没有单位、数学含义、影响目标或非法值说明。
- 公式来自 `definitions.ts`，图像计算来自 `scenes.tsx`，两者没有共享数学对象。
- 当前观察只拼接步骤文案和参数值，没有输出模型计算所得的数学结论。
- 配置中没有成立条件、验证规则、失败原因、结论、反例和预测任务。
- 现有测试只检查 ID、公式字符串、步骤字符串和组件入口是否唯一，没有验证数学行为。

对 135 个场景执行无文本 SVG 差异扫描后，发现主参数变化但图形不变的实验有 25 个，次参数变化但图形不变的实验有 73 个，两个参数都不改变图形的实验有 17 个。该扫描是保守检查，只能证明这些无效交互确实存在，不能证明其余交互的数学含义正确。

## 2. 目标

本次改造建立“公共实验框架 + 分类数学模型 + 实验配置”的统一架构，并覆盖正式目录中的全部 150 个实验。

完成后必须满足：

1. 公式、图像数据、参数、观测值、条件判定、预测答案和结论来自同一次数学模型计算。
2. 每个可控参数都有类型、范围或选项、步长、单位、数学含义、初始值和影响目标。
3. 学生必须先提交结构化预测，之后才能调整变量并查看实际结果。
4. 实验过程统一为：提出问题、学生预测、调整变量、观察结果、检查条件、输出结论、切换反例。
5. “当前观察”展示实时数学结果，不再展示通用占位句。
6. 验证区逐项展示条件是否满足、实际证据和失败原因。
7. 自动测试能够发现无效参数、配置缺项、重复换皮、奇点连线和数据不一致。
8. 保留现有 `ExperimentShell`、卡片、主画布、侧栏和底部 `PlayerBar` 的整体视觉风格。

## 3. 非目标

- 不修改当前课程目录框架、章节结构、知识点顺序、导航栏、课程首页或实验库入口。
- 不重新设计网站导航、课程目录或 AI 提问页面。
- 不修改服务端、AI 路由、课程发布数据和其它非实验业务。
- 不引入让 LLM 在浏览器中即时生成实验代码的机制。
- 不建立通用计算机代数系统，也不实现任意数学表达式 DSL。
- 不通过逐页修改 SVG 坐标来掩盖公共数据流问题。
- 不改变正式目录的 150 个知识点 ID 和 `/demo/:id` 路由。

## 4. 方案选择

采用“类型化数学模型注册表”。页面配置只描述一个具体实验实例；计算函数归属于数学模型族；公共运行时负责教学状态和 UI；分类 renderer 只消费模型产出的绘图数据。

不采用以下方案：

- 150 个页面分别持有计算逻辑：会重新产生重复实现和不一致状态。
- 完全由字符串表达式驱动的通用 DSL：范围过大，也难以安全覆盖空间曲面、向量场和定理条件。

## 5. 目录与职责

新增核心目录建议如下：

```text
client/src/experiment-core/
├── schema.ts                 # 参数、预测、条件、结果和配置类型
├── registry.ts               # 150 个实验 ID 到模型与配置的注册关系
├── runtime.ts                # 参数归一化、计算、预测判定和阶段转换
├── validateConfig.ts         # 配置静态校验
├── fingerprint.ts            # 图像、文案和行为指纹
├── sampling/
│   ├── curve.ts              # 一维曲线分段采样和奇点处理
│   ├── sequence.ts           # 数列、级数离散采样
│   ├── surface.ts            # 曲面和等高线采样
│   └── field.ts              # 向量场、路径和曲面积分采样
├── models/
│   ├── function1d/
│   ├── limit/
│   ├── continuity/
│   ├── derivative/
│   ├── theoremApplication/
│   ├── integral/
│   ├── ode/
│   ├── space/
│   ├── multivariable/
│   ├── multipleIntegral/
│   ├── fieldIntegral/
│   └── series/
└── renderers/
    ├── CartesianRenderer.tsx
    ├── SequenceRenderer.tsx
    ├── SurfaceRenderer.tsx
    ├── SpaceRenderer.tsx
    └── FieldRenderer.tsx
```

现有 `FunctionExperimentLayout` 将演进为公共 `ExperimentRuntimePage`。现有 1597 行 `knowledge-native/scenes.tsx` 在全部模型迁移完成后删除，不再继续增加 `point` 分支。

## 6. 核心类型

### 6.1 参数 schema

参数使用可辨识联合类型。连续量、整数、枚举和布尔量分别拥有合法字段，避免把“项数 n”表示成任意小数。

```ts
type ParameterValue = number | string | boolean

interface ParameterBase<Key extends string> {
  key: Key
  label: string
  unit: string | null
  meaning: string
  initial: ParameterValue
  affects: readonly (
    | 'formula'
    | 'plot'
    | 'observation'
    | 'condition'
    | 'conclusion'
  )[]
}

interface ContinuousParameter<Key extends string> extends ParameterBase<Key> {
  type: 'continuous'
  initial: number
  min: number
  max: number
  step: number
}

interface IntegerParameter<Key extends string> extends ParameterBase<Key> {
  type: 'integer'
  initial: number
  min: number
  max: number
  step: number
}

interface ChoiceParameter<Key extends string> extends ParameterBase<Key> {
  type: 'choice'
  initial: string
  options: readonly { value: string; label: string }[]
}

interface BooleanParameter<Key extends string> extends ParameterBase<Key> {
  type: 'boolean'
  initial: boolean
}
```

运行时必须先调用统一的参数归一化函数。整数参数使用整数步长并拒绝非整数；连续参数拒绝 `NaN`、无穷值、越界值和不符合步长的值；枚举值必须存在于选项中。

### 6.2 数学模型接口

```ts
interface MathModel<Config, Params, SceneData> {
  family: MathModelFamily
  parameters(config: Config): readonly ParameterSpec<keyof Params & string>[]
  initialParams(config: Config): Params
  compute(input: ModelInput<Config, Params>): ExperimentComputation<SceneData>
  buildPrediction(input: PredictionContext<Config, Params>): PredictionTask
  counterexamples(config: Config): readonly CounterexampleSpec<Params>[]
}
```

模型是唯一允许执行数学计算的层。页面、控件、配置和 renderer 都不能另行计算结论。

`compute` 接收经过校验的参数、当前普通/反例模式和教学阶段，返回完整计算快照：

```ts
interface ExperimentComputation<SceneData> {
  formula: FormulaPresentation
  scene: SceneData
  observations: readonly Observation[]
  conditions: readonly ConditionResult[]
  verification: VerificationResult
  conclusion: ConclusionResult
  actualPredictionAnswer: PredictionAnswer
  explanation: string
}
```

`FormulaPresentation` 由模型根据当前数学对象和参数生成。实验配置不得另存一份与计算脱节的展示公式。

### 6.3 实验配置

每个实验必须注册：

```ts
interface ExperimentConfig<Config> {
  id: OwnedExperimentId
  family: MathModelFamily
  modelId: string
  title: string
  question: string
  mathematicalObject: string
  modelConfig: Config
  observationKeys: readonly string[]
  learningGoals: readonly string[]
}
```

`modelConfig` 只包含构造数学对象所需的数据，例如函数族、区间、边界条件、定理版本或取样策略。它不能包含提前写好的通用观察结果和真假结论。

### 6.4 条件、验证、结论和反例

```ts
interface ConditionResult {
  id: string
  label: string
  satisfied: boolean
  evidence: string
  failureReason: string | null
}

interface VerificationResult {
  passed: boolean
  rule: string
  evidence: readonly string[]
  failureReasons: readonly string[]
}

interface ConclusionResult {
  status: 'confirmed' | 'refuted' | 'inconclusive'
  statement: string
  reason: string
}

interface CounterexampleSpec<Params> {
  id: string
  label: string
  explanation: string
  params: Partial<Params>
  expectedFailureConditionIds: readonly string[]
}
```

反例不是覆盖在原图上的固定装饰。切换反例后，模型使用反例参数重新执行同一个 `compute`，条件区必须指出具体哪项条件失败以及为什么失败。

## 7. 结构化预测 schema

预测类型采用用户确认的四种形式：

```ts
type PredictionResponse =
  | { type: 'trend'; value: 'increase' | 'decrease' | 'unchanged' }
  | { type: 'boolean'; value: boolean }
  | { type: 'numeric'; value: number }
  | { type: 'choice'; value: string | readonly string[] }

type PredictionSpec =
  | TrendPredictionSpec
  | BooleanPredictionSpec
  | NumericPredictionSpec
  | ChoicePredictionSpec

interface PredictionTask {
  spec: PredictionSpec
  judge(response: PredictionResponse): PredictionJudgement
}
```

四种题型约束如下：

- `trend`：答案只能是增大、减小或不变。
- `boolean`：答案只能是成立或不成立。
- `numeric`：必须指定 `absoluteTolerance` 或 `relativeTolerance`，至少一个大于零；输入必须为有限数。
- `choice`：支持单选、多选和排序。多选按集合比较，排序按数组顺序比较。

预测问题、标准答案和 `judge` 均由分类数学模型根据当前配置和预测情景生成。页面只渲染 `PredictionSpec` 并提交 `PredictionResponse`，不得硬编码答案。

预测结果使用以下结构：

```ts
interface PredictionJudgement {
  correct: boolean
  expected: PredictionAnswer
  received: PredictionAnswer
  summary: string
}
```

学生可以附加 `reason?: string`。理由保存在当前页面状态中并随对比展示，但不参与自动评分。

## 8. 实验阶段与交互闭环

公共运行时维护以下阶段：

```text
question
  → prediction
  → explore
  → observe
  → validate
  → conclude
  → counterexample
```

行为规则：

1. 页面打开时展示问题和预测题，参数控件只读。
2. 学生提交有效预测后进入 `explore`，参数控件开放。
3. 任一参数变化时，运行时先校验参数，再调用模型 `compute`。
4. 图像、公式、观测值和条件区同步消费新的计算快照。
5. `validate` 展示逐项条件、证据和失败原因。
6. `conclude` 展示“预测—实际结果—原因解释”三栏对比。
7. `counterexample` 允许选择模型提供的反例，并重新计算整个快照。
8. 底部 `PlayerBar` 继续承担阶段导航和播放，但阶段节点由公共运行时定义，不由各页面拼接通用文案。

## 9. 分类数学模型

150 个实验按以下模型族迁移：

| 模型族 | 实验数 | 当前知识范围 |
|---|---:|---|
| `function-1d` | 15 | 函数、图像、表示、性质与变换 |
| `limit` | 11 | 数列极限、函数极限与极限运算 |
| `continuity` | 11 | 连续、间断点与闭区间性质 |
| `derivative` | 14 | 导数、微分、求导规则与线性近似 |
| `theorem-application` | 14 | 中值定理、洛必达、单调凹凸与优化 |
| `integral` | 27 | 原函数、不定积分、定积分及应用 |
| `ode` | 10 | 常微分方程及模型 |
| `space` | 11 | 空间向量、直线、平面和曲面 |
| `multivariable` | 12 | 多元极限、偏导、梯度和极值 |
| `multiple-integral` | 7 | 二重、三重积分及应用 |
| `field-integral` | 9 | 曲线积分、曲面积分和三大公式 |
| `series` | 9 | 数项级数、幂级数、泰勒和傅里叶 |

合计 150 个。

模型族可以共享采样和坐标工具，但每个知识点必须拥有独立 `ExperimentConfig`。两个实验只有在数学对象、变量、观测量、成立条件、验证规则、结论和反例都一致时才允许共享同一具体模型配置；仅替换标题不能通过配置校验。

## 10. 绘图数据与 renderer

renderer 不读取原始滑块状态，也不根据知识点 ID 选择公式。它只接收 `ExperimentComputation.scene`。

一维曲线使用显式分段数据：

```ts
interface CurveSeries {
  id: string
  label: string
  segments: readonly (readonly Point2D[])[]
  style: SeriesStyle
}
```

奇点、定义域断点和超过安全数值范围的位置必须结束当前 segment。renderer 禁止把两个 segment 自动连接。

数列与级数使用离散点和部分和数据；曲面使用网格或等高线数据；向量场使用采样向量和路径数据。所有 renderer 均从数据自动生成刻度范围、图例和数值格式，不使用与模型无关的固定标签。

## 11. 当前观察与验证区

“当前观察”渲染模型返回的 `Observation[]`：

```ts
interface Observation {
  key: string
  label: string
  value: number | string | boolean
  formattedValue: string
  meaning: string
}
```

例如定积分实验应展示当前分割数、黎曼和、精确积分值和误差；导数实验应展示割线斜率、导数值及二者差；不能只显示“当前参数 n=10”。

验证区展示每个 `ConditionResult`。条件不满足时必须显示实际证据和 `failureReason`，不能只显示红色状态。

## 12. 配置校验

`validateExperimentConfig` 在测试和开发构建中执行，至少检查：

- 150 个目录 ID 全部注册且没有额外 ID。
- `modelId` 存在且与 `family` 一致。
- 参数 key 唯一，初值合法，范围有限，`min < max`，`step > 0`。
- 整数参数的初值、边界和步长均为整数。
- 枚举参数至少有两个唯一选项，初值属于选项。
- 单位字段明确使用字符串或 `null`，数学含义非空。
- 每个参数至少影响公式、图像、观测、条件或结论中的一项。
- 每个实验拥有问题、数学对象、观测量、条件、验证、结论和至少一个反例。
- 数值预测误差配置合法，多选与排序答案没有重复项。
- 归一化后的问题、数学对象、观测、结论和反例组合不能与另一个实验完全重复。

## 13. 自动测试

### 13.1 Schema 测试

为每种参数和预测类型提供合法、越界、非整数、`NaN`、无穷值、空选项和错误答案用例。

### 13.2 参数响应测试

对每个声明 `affects: ['plot']` 的参数，在初值附近移动一个合法步长，重新计算场景数据并比较稳定指纹。指纹不变则测试失败，并打印实验 ID 与参数 key。

对于不影响图像但影响条件或观测的参数，测试对应结果字段必须变化。不存在“任何输出均不变化”的可控参数。

### 13.3 数学一致性测试

- 公式展示和数值计算从同一模型对象生成，不允许配置另存公式字符串。
- 观测值通过模型公开的数值函数重新抽样核对。
- 条件判定的证据值必须与观测值或场景数据一致。
- 预测标准答案必须与模型在预测情景下的实际结果一致。

### 13.4 奇点与采样测试

- 非有限值不会进入绘图点集。
- 定义域断点产生多个 segment。
- 相邻点跨越奇点、跳跃阈值或排除区间时强制断线。
- 一维曲线测试覆盖 `1/x`、`tan x`、`ln x` 和分段跳跃函数。

### 13.5 重复与覆盖测试

- 检查配置文本组合指纹，拒绝完整换皮。
- 检查模型输出场景指纹，拒绝不同实验在基准参数和扰动参数下全部相同。
- 检查 150 个目录项、配置项、模型和 renderer 全链路覆盖。

### 13.6 运行时交互测试

- 提交预测前控件禁用。
- 无效预测输入不能进入实验阶段。
- 提交后控件开放。
- 调参后公式、图像、观测和条件同步更新。
- 结论页展示预测、实际结果和解释。
- 切换反例后指定条件失败并显示原因。

## 14. 迁移策略

迁移不是逐页修补现有 SVG，而是按模型族替换数据源：

1. 先建立 schema、参数归一化、预测判定、统一计算结果、采样工具和校验器，并用失败测试锁定接口。
2. 建立公共运行时页面和结构化预测面板，保持现有 `ExperimentShell` 视觉结构。
3. 将 15 个已有函数基础实验迁入 `function-1d` 模型族，保留其现有数学特色，但移除页面内独立结论计算。
4. 按表中其余 11 个模型族逐类迁移 135 个实验；每完成一个模型族，同时补齐该族的模型测试、配置测试和参数响应测试。
5. 只有当 150 个实验全部通过注册、数学一致性和交互测试后，正式 renderer 注册表才整体切换到新运行时。
6. 切换完成后删除 `knowledge-native/scenes.tsx`、旧 `NativeKnowledgeExperiment` 和仅为旧结构服务的类型与测试。

采用整体切换可以避免正式目录长期处于新旧规则混用状态。迁移期间旧实现只作为工作区内部对照，不继续扩展。

## 15. 错误处理

- 配置错误：开发和测试环境直接抛出带实验 ID、字段路径和原因的错误，阻止静默降级。
- 用户输入错误：控件附近显示具体原因，保留上一个合法计算快照。
- 模型计算出现非有限值：记录为定义域断点或条件失败，不把 `NaN`/`Infinity` 传入 SVG。
- renderer 不支持场景数据：显示明确的开发错误卡片，不回退到通用抛物线。
- 预测响应类型与题型不匹配：拒绝提交并提示应输入的类型。

## 16. UI 保持与必要调整

保留当前目录框架、页面顶栏、面包屑、实验标题、主画布、右侧卡片和底部播放器。所有改动限定在 `/demo/:id` 实验内容内部，只进行以下影响数学理解的调整：

- 在参数标签中增加单位和数学含义。
- 按参数类型选择滑块、整数步进、开关或选项控件。
- 提交预测前禁用实验控件。
- 增加预测卡片、条件验证卡片和预测结果对比。
- 坐标刻度、图例和有效数字由模型数据决定。
- 当前观察改为结构化实时数学量。
- 反例通过统一按钮或步骤切换，并明确展示失败条件。

## 17. 完成标准

本次公共架构改造只有在以下条件全部满足时才算完成：

- 正式目录仍为 150 个实验，路由 ID 不变。
- 150 个实验均由类型化模型注册表提供计算结果。
- 150 个配置均包含数学对象、可控变量、关键观测量、成立条件、验证规则、结论和反例。
- 四种预测类型均有实际实验使用并通过自动判定测试。
- 所有可控参数都能改变其声明影响的数学输出，死参数数量为零。
- 通用观察占位文案数量为零。
- 非法整数、越界值、奇点连线、重复配置和公式脱节均能被测试发现。
- 旧 135 实验公共场景分支和旧运行时被删除。
- 现有整体 UI 风格和 150 个正式路由保持可用。
