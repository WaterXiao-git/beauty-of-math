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
  /** 参数化表达式的默认参数（如 { k: 1, b: 0 } 用于 y = k*x + b） */
  params?: Record<string, number>
  /** 参数范围（滑块自动生成；key 对应 params） */
  paramRanges?: Record<string, { label?: string; min: number; max: number; step: number }>
  /** 画布形状（function-plot 模板：linear / quadratic / absolute） */
  shape?: 'linear' | 'quadratic' | 'absolute'
  /** 画布标注开关（function-plot 模板） */
  markers?: {
    xIntercept?: boolean
    yIntercept?: boolean
    slopeTriangle?: boolean
    vertex?: boolean
    axis?: boolean
    roots?: boolean
  }
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
  template: 'epsilon-delta' | 'derivative' | 'theorem-demo' | 'function-plot'
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
  // 4. 一次函数图像（function-plot 模板试点：参数化表达式 k*x+b）
  {
    id: 'function-plot',
    title: '一次函数图像',
    course: '高等数学（上册）',
    chapter: '函数与极限',
    section: '函数',
    template: 'function-plot',
    summary:
      '一次函数 y = kx + b 的图像是一条直线：k 决定斜率（k>0 上升、k<0 下降、|k| 越大越陡），b 决定与 y 轴的交点 (0, b)。',
    goals: [
      '理解一次函数 y = kx + b 的图像是直线',
      '掌握斜率 k 与截距 b 的几何意义',
      '会由 k、b 判断单调性并求出与坐标轴的交点',
    ],
    defaultCase: 'k1b0',
    cases: [
      {
        id: 'k1b0',
        name: 'y = x',
        expr: 'k*x + b',
        domain: [-5, 5],
        yRange: [-5, 5],
        params: { k: 1, b: 0 },
        desc: '默认案例：过原点的平分线 y = x',
      },
      {
        id: 'k2b1',
        name: 'y = 2x + 1',
        expr: 'k*x + b',
        domain: [-5, 5],
        yRange: [-5, 5],
        params: { k: 2, b: 1 },
        desc: 'k>0 上升，b=1 与 y 轴交于 (0,1)',
      },
      {
        id: 'kneg',
        name: 'y = −x + 3',
        expr: 'k*x + b',
        domain: [-5, 5],
        yRange: [-5, 5],
        params: { k: -1, b: 3 },
        desc: 'k<0 下降，x 截距 = 3',
      },
      {
        id: 'k0',
        name: 'y = 2（常函数）',
        expr: 'k*x + b',
        domain: [-5, 5],
        yRange: [-5, 5],
        params: { k: 0, b: 2 },
        desc: 'k=0 时为水平直线，无 x 截距',
      },
    ],
    steps: [
      { id: 'identify', title: '识别函数', desc: 'y = kx + b 是一次函数，图像为一条直线' },
      { id: 'slope', title: '观察斜率 k', desc: 'k>0 上升、k<0 下降，|k| 越大越陡；斜率三角形 Δy/Δx = k' },
      { id: 'intercept', title: '观察截距 b', desc: '直线与 y 轴交于 (0, b)；与 x 轴交于 (−b/k, 0)（k≠0）' },
      { id: 'apply', title: '综合应用', desc: '拖动 y 截距点改 b，拖动 x 截距点改斜率，观察直线变化' },
    ],
    meta: {
      difficulty: '入门难度',
      duration: '约 15 分钟',
      templates: ['函数图像可视化', '斜率与截距动态演示'],
    },
    version: 1,
  },
  // 5. 二次函数图像（function-plot 模板：shape=quadratic）
  {
    id: 'quadratic-function',
    title: '二次函数图像',
    course: '高等数学（上册）',
    chapter: '函数与极限',
    section: '函数',
    template: 'function-plot',
    summary:
      '二次函数 y = ax² + bx + c（a≠0）的图像是一条抛物线：a 决定开口方向与陡缓，顶点 (-b/2a, f(-b/2a)) 是极值点，判别式 Δ=b²-4ac 决定与 x 轴的交点个数。',
    goals: [
      '理解二次函数图像为抛物线，掌握开口方向与 a 的关系',
      '会求顶点坐标与对称轴',
      '会用判别式 Δ 判断实根个数',
    ],
    defaultCase: 'y-x2',
    cases: [
      {
        id: 'y-x2',
        name: 'y = x²',
        expr: 'a*x^2 + b*x + c',
        domain: [-5, 5],
        yRange: [-6, 6],
        params: { a: 1, b: 0, c: 0 },
        paramRanges: { a: { label: '开口 a', min: -3, max: 3, step: 0.1 }, b: { label: '一次项 b', min: -5, max: 5, step: 0.5 }, c: { label: '常数 c', min: -5, max: 5, step: 0.5 } },
        shape: 'quadratic',
        markers: { vertex: true, axis: true, roots: true, yIntercept: true },
        desc: '默认案例：过原点的标准抛物线',
      },
      {
        id: 'y-neg-x2',
        name: 'y = −x²',
        expr: 'a*x^2 + b*x + c',
        domain: [-5, 5],
        yRange: [-6, 6],
        params: { a: -1, b: 0, c: 0 },
        paramRanges: { a: { label: '开口 a', min: -3, max: 3, step: 0.1 }, b: { label: '一次项 b', min: -5, max: 5, step: 0.5 }, c: { label: '常数 c', min: -5, max: 5, step: 0.5 } },
        shape: 'quadratic',
        markers: { vertex: true, axis: true, roots: true, yIntercept: true },
        desc: 'a<0 开口向下',
      },
      {
        id: 'y-vertex',
        name: 'y = (x−1)²',
        expr: 'a*x^2 + b*x + c',
        domain: [-5, 5],
        yRange: [-6, 6],
        params: { a: 1, b: -2, c: 1 },
        paramRanges: { a: { label: '开口 a', min: -3, max: 3, step: 0.1 }, b: { label: '一次项 b', min: -5, max: 5, step: 0.5 }, c: { label: '常数 c', min: -5, max: 5, step: 0.5 } },
        shape: 'quadratic',
        markers: { vertex: true, axis: true, roots: true, yIntercept: true },
        desc: '顶点式 (x−1)²：顶点 (1,0)，重根',
      },
      {
        id: 'y-two-roots',
        name: 'y = x²−4',
        expr: 'a*x^2 + b*x + c',
        domain: [-5, 5],
        yRange: [-6, 6],
        params: { a: 1, b: 0, c: -4 },
        paramRanges: { a: { label: '开口 a', min: -3, max: 3, step: 0.1 }, b: { label: '一次项 b', min: -5, max: 5, step: 0.5 }, c: { label: '常数 c', min: -5, max: 5, step: 0.5 } },
        shape: 'quadratic',
        markers: { vertex: true, axis: true, roots: true, yIntercept: true },
        desc: 'Δ>0：与 x 轴交于 ±2',
      },
      {
        id: 'y-no-roots',
        name: 'y = x²+1',
        expr: 'a*x^2 + b*x + c',
        domain: [-5, 5],
        yRange: [-6, 6],
        params: { a: 1, b: 0, c: 1 },
        paramRanges: { a: { label: '开口 a', min: -3, max: 3, step: 0.1 }, b: { label: '一次项 b', min: -5, max: 5, step: 0.5 }, c: { label: '常数 c', min: -5, max: 5, step: 0.5 } },
        shape: 'quadratic',
        markers: { vertex: true, axis: true, roots: true, yIntercept: true },
        desc: 'Δ<0：与 x 轴无交点',
      },
    ],
    steps: [
      { id: 'identify', title: '识别函数', desc: 'y = ax² + bx + c 是二次函数，图像为抛物线' },
      { id: 'open', title: '观察开口', desc: 'a>0 开口向上，a<0 开口向下，|a| 越大越陡' },
      { id: 'vertex', title: '顶点与对称轴', desc: '顶点 x = −b/2a，对称轴为竖直线 x = −b/2a' },
      { id: 'roots', title: '根与判别式', desc: 'Δ = b²−4ac：大于 0 两实根、等于 0 重根、小于 0 无实根' },
    ],
    meta: {
      difficulty: '入门难度',
      duration: '约 20 分钟',
      templates: ['二次函数图像可视化', '抛物线参数联动'],
    },
    version: 1,
  },
  // 6. 绝对值函数图像（function-plot 模板：shape=absolute）
  {
    id: 'absolute-value-function',
    title: '绝对值函数图像',
    course: '高等数学（上册）',
    chapter: '函数与极限',
    section: '函数',
    template: 'function-plot',
    summary:
      '绝对值函数 y = a|x−h| + k 的图像是 V 形折线：顶点 (h, k)，a 决定开口方向与陡缓，h/k 控制左右与上下平移，零点为 a|x−h|+k=0 的解。',
    goals: [
      '理解绝对值函数的 V 形图像与顶点',
      '掌握 a、h、k 对图像的影响',
      '会求绝对值函数的零点',
    ],
    defaultCase: 'abs-x',
    cases: [
      {
        id: 'abs-x',
        name: 'y = |x|',
        expr: 'a*abs(x-h)+k',
        domain: [-6, 6],
        yRange: [-6, 6],
        params: { a: 1, h: 0, k: 0 },
        paramRanges: { a: { label: '系数 a', min: -3, max: 3, step: 0.1 }, h: { label: '平移 h', min: -6, max: 6, step: 0.1 }, k: { label: '平移 k', min: -6, max: 6, step: 0.1 } },
        shape: 'absolute',
        markers: { vertex: true, roots: true },
        desc: '标准 V 形，顶点在原点',
      },
      {
        id: 'abs-h',
        name: 'y = |x−2|',
        expr: 'a*abs(x-h)+k',
        domain: [-6, 6],
        yRange: [-6, 6],
        params: { a: 1, h: 2, k: 0 },
        paramRanges: { a: { label: '系数 a', min: -3, max: 3, step: 0.1 }, h: { label: '平移 h', min: -6, max: 6, step: 0.1 }, k: { label: '平移 k', min: -6, max: 6, step: 0.1 } },
        shape: 'absolute',
        markers: { vertex: true, roots: true },
        desc: '向右平移 2：顶点 (2,0)',
      },
      {
        id: 'abs-k',
        name: 'y = |x|+1',
        expr: 'a*abs(x-h)+k',
        domain: [-6, 6],
        yRange: [-6, 6],
        params: { a: 1, h: 0, k: 1 },
        paramRanges: { a: { label: '系数 a', min: -3, max: 3, step: 0.1 }, h: { label: '平移 h', min: -6, max: 6, step: 0.1 }, k: { label: '平移 k', min: -6, max: 6, step: 0.1 } },
        shape: 'absolute',
        markers: { vertex: true, roots: true },
        desc: '向上平移 1：无零点',
      },
      {
        id: 'abs-2',
        name: 'y = 2|x|',
        expr: 'a*abs(x-h)+k',
        domain: [-6, 6],
        yRange: [-6, 6],
        params: { a: 2, h: 0, k: 0 },
        paramRanges: { a: { label: '系数 a', min: -3, max: 3, step: 0.1 }, h: { label: '平移 h', min: -6, max: 6, step: 0.1 }, k: { label: '平移 k', min: -6, max: 6, step: 0.1 } },
        shape: 'absolute',
        markers: { vertex: true, roots: true },
        desc: '|a|>1 更陡',
      },
      {
        id: 'abs-down',
        name: 'y = −|x|+3',
        expr: 'a*abs(x-h)+k',
        domain: [-6, 6],
        yRange: [-6, 6],
        params: { a: -1, h: 0, k: 3 },
        paramRanges: { a: { label: '系数 a', min: -3, max: 3, step: 0.1 }, h: { label: '平移 h', min: -6, max: 6, step: 0.1 }, k: { label: '平移 k', min: -6, max: 6, step: 0.1 } },
        shape: 'absolute',
        markers: { vertex: true, roots: true },
        desc: '开口向下，零点 ±3',
      },
    ],
    steps: [
      { id: 'identify', title: '识别函数', desc: 'y = a|x−h| + k 是绝对值函数，图像为 V 形折线' },
      { id: 'vertex', title: '顶点 (h, k)', desc: 'V 形最低（或最高）点即顶点，由 h/k 决定位置' },
      { id: 'open', title: '开口与陡缓', desc: 'a>0 开口向上、a<0 开口向下，|a| 越大越陡' },
      { id: 'roots', title: '零点', desc: '解 a|x−h|+k=0：x = h ± √(−k/a)（存在时）' },
    ],
    meta: {
      difficulty: '入门难度',
      duration: '约 15 分钟',
      templates: ['绝对值函数可视化', 'V 形折线参数联动'],
    },
    version: 1,
  },
]