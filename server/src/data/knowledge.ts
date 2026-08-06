// ============================================================================
// 知识点内容配置层（统一知识点接口的数据源）
// 对应《数韵之美》需求 3.3「统一知识点交互页面」与 5.2「内容与配置层」：
// 知识点差异收敛为内容配置（案例/参数/步骤/模板绑定），而非各自一套接口。
// 首期提供三个示例：ε−δ 极限定义 / 导数几何意义 / 罗尔定理。
// ============================================================================

/** 案例配置：默认案例 + 可探索案例 */
export interface KnowledgeCase {
  id: string
  /** 展示名称，如「双谷曲线」 */
  name: string
  /** 数学表达式（mathjs 可解析），如 "x^4 - x^2" */
  expr: string
  /** 定义域 [a, b] */
  domain: [number, number]
  /** 视图 y 范围 [min, max] */
  yRange: [number, number]
  /** 该函数是否天然满足端点等高（定理类模板用） */
  naturallyEqual?: boolean
  /** 预设中值点/目标点（条件满足时） */
  anchor?: number | null
  /** 案例说明 */
  desc: string
}

/** 教学步骤（播放条步进） */
export interface KnowledgeStep {
  id: string
  title: string
  desc: string
}

/** 条件开关定义（定理类模板用） */
export interface KnowledgeCondition {
  key: string
  label: string
  desc: string
  default: boolean
}

/** 知识点内容配置（统一 schema） */
export interface KnowledgeConfig {
  id: string
  title: string
  course: string
  chapter: string
  section?: string
  /** 渲染模板绑定：决定前端用哪个统一容器渲染 */
  template: 'epsilon-delta' | 'derivative' | 'theorem-demo'
  /** 知识点简介 */
  summary: string
  /** 学习目标 */
  goals: string[]
  /** 审核后的默认案例 id（需求 1.3：首次进入先显示审核默认案例） */
  defaultCase: string
  cases: KnowledgeCase[]
  steps: KnowledgeStep[]
  conditions?: KnowledgeCondition[]
  meta: {
    difficulty: string
    duration: string
    /** 适合的可视化模板 */
    templates: string[]
  }
  /** 内容版本：同一版本稳定复现、可回退（需求 1.2 状态与复现） */
  version: number
}

// ---------- 三个示例知识点 ----------

export const knowledgePoints: KnowledgeConfig[] = [
  // 1. ε−δ 极限定义（需求 4.1）
  {
    id: 'epsilon-delta',
    title: 'ε−δ 极限定义',
    course: '高等数学（上册）',
    chapter: '函数、极限与连续',
    section: '函数的极限',
    template: 'epsilon-delta',
    summary:
      '把「x 趋近 a 时 f(x) 趋近 L」转换为纵向 ε 误差带和横向 δ 邻域，观察 ε 收紧时可行 δ 如何变化。',
    goals: [
      '理解函数极限的 ε−δ 语言描述',
      '观察 ε 收紧时可行 δ 的变化',
      '验证 δ 邻域内的曲线全部落入 ε 带',
    ],
    defaultCase: 'x2',
    cases: [
      {
        id: 'x2',
        name: 'f(x) = x²',
        expr: 'x^2',
        domain: [0.4, 1.6],
        yRange: [0, 2.8],
        anchor: 1,
        desc: '默认案例：f(x)=x²、a=1、L=1、ε=0.60',
      },
      {
        id: 'sin',
        name: 'sin x',
        expr: 'sin(x)',
        domain: [0.2, 1.8],
        yRange: [0, 1.2],
        anchor: 1,
        desc: '可切换案例：sin x 在 a=1 附近',
      },
      {
        id: 'sqrt',
        name: '√x',
        expr: 'sqrt(x)',
        domain: [0.1, 2.0],
        yRange: [0, 1.6],
        anchor: 1,
        desc: '可切换案例：√x 在 a=1 附近（注意定义域边界）',
      },
    ],
    steps: [
      { id: 'target', title: '观察目标点', desc: '先看函数在 x→a 时的目标值 L' },
      { id: 'eps', title: '给定 ε', desc: '指定纵向误差带 L±ε' },
      { id: 'delta', title: '寻找 δ', desc: '找出使 x∈(a−δ,a+δ) 时曲线落入 ε 带的可行 δ' },
      { id: 'verify', title: '验证定义', desc: 'δ 范围内的有效曲线全部落入 ε 带，定义成立' },
    ],
    meta: {
      difficulty: '中等难度',
      duration: '约 30 分钟',
      templates: ['极限定义动态演示', 'ε−δ 可视化'],
    },
    version: 1,
  },

  // 2. 导数几何意义（需求 4.2）
  {
    id: 'derivative',
    title: '导数的几何意义',
    course: '高等数学（上册）',
    chapter: '导数与微分',
    section: '导数的概念',
    template: 'derivative',
    summary:
      '通过固定点 P 和移动点 Q，观察 h 趋近 0 时割线斜率趋近切线斜率，理解差商极限与导数。',
    goals: [
      '理解割线与切线的几何关系',
      '观察 h→0 时差商趋近导数',
      '理解导数的极限定义',
    ],
    defaultCase: 'x2',
    cases: [
      {
        id: 'x2',
        name: 'f(x) = x²',
        expr: 'x^2',
        domain: [-2, 2],
        yRange: [-0.5, 4.5],
        anchor: 0,
        desc: '默认案例：在 x₀ 处观察割线趋近切线',
      },
      {
        id: 'sin',
        name: 'sin x',
        expr: 'sin(x)',
        domain: [-2, 2],
        yRange: [-1.5, 1.5],
        anchor: 0,
        desc: '可切换案例：sin x',
      },
    ],
    steps: [
      { id: 'two-points', title: '选取两点', desc: '取固定点 P(x₀) 与移动点 Q(x₀+h)' },
      { id: 'secant', title: '显示割线与差商', desc: '连接 PQ 得割线，差商 (f(x₀+h)−f(x₀))/h' },
      { id: 'shrink', title: '减小 h', desc: 'Q 沿曲线靠近 P，割线逼近切线' },
      { id: 'limit', title: '割线趋近切线', desc: 'h→0 时割线斜率趋近导数 f′(x₀)' },
    ],
    meta: {
      difficulty: '中等难度',
      duration: '约 25 分钟',
      templates: ['切线斜率动画', '差商可视化'],
    },
    version: 1,
  },

  // 3. 罗尔定理（需求 4.3）
  {
    id: 'rolle',
    title: '罗尔定理',
    course: '高等数学（上册）',
    chapter: '微分中值定理',
    section: '微分中值定理',
    template: 'theorem-demo',
    summary:
      '不只展示水平切线，还通过条件开关说明连续、可导、端点等高三个前提与结论之间的关系。',
    goals: [
      '理解罗尔定理的三个前提条件',
      '观察条件缺失时结论不再由定理保证',
      '理解 ξ 位于开区间 (a,b) 内',
    ],
    defaultCase: 'double-valley',
    cases: [
      {
        id: 'x3-1',
        name: 'x³−1',
        expr: 'x^3 - 1',
        domain: [-1, 1],
        yRange: [-2.4, 0.8],
        naturallyEqual: false,
        anchor: null,
        desc: '单调函数端点值不相等，作为反例演示',
      },
      {
        id: 'sin',
        name: 'sin x',
        expr: 'sin(x)',
        domain: [0, 3.141592653589793],
        yRange: [-0.3, 1.4],
        naturallyEqual: true,
        anchor: 1.5707963267948966,
        desc: '在 [0, π] 上两端等高，内部存在水平切线',
      },
      {
        id: 'double-valley',
        name: '双谷曲线',
        expr: 'x^4 - x^2',
        domain: [-1, 1],
        yRange: [-0.7, 1.0],
        naturallyEqual: true,
        anchor: 0,
        desc: '当满足三条件时，曲线内部至少出现一条水平切线',
      },
    ],
    steps: [
      { id: 'cont', title: '检查连续性', desc: '验证函数在闭区间 [a, b] 上连续' },
      { id: 'endpoints', title: '比较端点', desc: '确认端点函数值相等：f(a) = f(b)' },
      { id: 'scan', title: '扫描内部', desc: '在开区间 (a, b) 内寻找水平切线的位置' },
      { id: 'conclude', title: '结论成立', desc: '存在 ξ ∈ (a, b)，使得 f′(ξ) = 0' },
    ],
    conditions: [
      { key: 'continuous', label: '闭区间连续', desc: '关闭后将破坏连续性', default: true },
      { key: 'differentiable', label: '开区间可导', desc: '关闭后将破坏可导性', default: true },
      { key: 'equalEndpoints', label: '端点函数值相等', desc: '关闭后将破坏等高条件', default: true },
    ],
    meta: {
      difficulty: '中等难度',
      duration: '约 35 分钟',
      templates: ['极限定义动态演示', 'ε−δ 可视化', '函数逼近动画'],
    },
    version: 1,
  },
]