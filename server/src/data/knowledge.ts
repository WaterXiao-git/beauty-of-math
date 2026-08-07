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
  /** 第二条曲线表达式（参数化，如对数 log(x, base)） */
  expr2?: string
  /** 分段函数定义（shape=piecewise；每段表达式与区间，参数化） */
  pieces?: { expr: string; from?: number | null; to?: number | null }[]
  /** 概念要点公式（KaTeX） */
  formula?: string
  /** 画布图例 */
  legend?: { color: string; label: string }[]
  /** 数据面板项（expr 用 mathjs 基于 params 求值；text 静态，支持 {参数名} 插值） */
  dataItems?: { label: string; expr?: string; text?: string }[]
  /** 观察提示（text 支持 {参数名} 插值） */
  tips?: { icon?: string; text: string }[]
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
  /** 画布形状（function-plot 模板：linear / quadratic / absolute / exp-log） */
  shape?: 'linear' | 'quadratic' | 'absolute' | 'exp-log' | 'rational' | 'inverse-pair' | 'piecewise' | 'composite' | 'newton' | 'sequence' | 'riemann'
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
  /** 概念要点公式（KaTeX，case 未指定时用） */
  formula?: string
  /** 画布图例 */
  legend?: { color: string; label: string }[]
  /** 数据面板项（expr 用 mathjs 基于 params 求值；text 静态，支持 {参数名} 插值） */
  dataItems?: { label: string; expr?: string; text?: string }[]
  /** 观察提示（text 支持 {参数名} 插值） */
  tips?: { icon?: string; text: string }[]
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
    formula: 'y = kx + b',
    legend: [
      { color: '#60a5fa', label: '直线' },
      { color: '#c084fc', label: 'y 截距' },
      { color: '#fbbf24', label: 'x 截距' },
    ],
    dataItems: [
      { label: '斜率 k', expr: 'k' },
      { label: 'y 截距', expr: 'b' },
      { label: 'x 截距', expr: '-b/k' },
      { label: '截距点', text: '(0, {b})' },
    ],
    tips: [
      { icon: '📈', text: '斜率 {k}，y 截距 {b}：直线由这两者完全确定。' },
      { icon: '🖱️', text: '拖 y 截距点改 b，拖 x 截距点改斜率；或拖动背景平移 / 滚轮缩放。' },
      { icon: '🎯', text: 'x 截距 = −b/k：拖动 x 截距点可直观验证该关系。' },
    ],
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
  // 7. 指数与对数函数（function-plot 模板：shape=exp-log，双曲线互为反函数）
  {
    id: 'exponential-log-function',
    title: '指数与对数函数',
    course: '高等数学（上册）',
    chapter: '函数与极限',
    section: '函数',
    template: 'function-plot',
    summary:
      'y = aˣ 与 y = logₐ(x)（a>0 且 a≠1）互为反函数，图像关于直线 y=x 对称：a>1 时两函数都递增，0<a<1 时都递减。',
    goals: [
      '理解指数函数与对数函数互为反函数',
      '掌握底数 a 对增减性的影响',
      '认识两曲线关于 y=x 对称',
    ],
    defaultCase: 'base2',
    cases: [
      {
        id: 'base2',
        name: '底数 2',
        expr: 'pow(base, x)',
        expr2: 'log(x, base)',
        domain: [-3, 3],
        yRange: [-3, 3],
        params: { base: 2 },
        paramRanges: { base: { label: '底数 a', min: 0.2, max: 4, step: 0.1 } },
        shape: 'exp-log',
        desc: '底数 2：指数递增，对数 log₂x 定义域 x>0',
      },
      {
        id: 'base-e',
        name: '自然底数 e',
        expr: 'pow(base, x)',
        expr2: 'log(x, base)',
        domain: [-3, 3],
        yRange: [-3, 3],
        params: { base: 2.718281828459045 },
        paramRanges: { base: { label: '底数 a', min: 0.2, max: 4, step: 0.1 } },
        shape: 'exp-log',
        desc: '自然底数 e≈2.718，微积分中最常用的底',
      },
      {
        id: 'base-10',
        name: '底数 10',
        expr: 'pow(base, x)',
        expr2: 'log(x, base)',
        domain: [-1.5, 1.5],
        yRange: [-2, 2],
        params: { base: 10 },
        paramRanges: { base: { label: '底数 a', min: 0.2, max: 4, step: 0.1 } },
        shape: 'exp-log',
        desc: '常用对数 log₁₀x（lg x）；指数增长极快',
      },
      {
        id: 'base-05',
        name: '底数 0.5',
        expr: 'pow(base, x)',
        expr2: 'log(x, base)',
        domain: [-3, 3],
        yRange: [-3, 3],
        params: { base: 0.5 },
        paramRanges: { base: { label: '底数 a', min: 0.2, max: 4, step: 0.1 } },
        shape: 'exp-log',
        desc: '0<a<1：指数与对数都递减',
      },
    ],
    steps: [
      { id: 'identify', title: '识别反函数', desc: 'y = aˣ 与 y = logₐx 互为反函数（a>0, a≠1）' },
      { id: 'base', title: '底数影响', desc: 'a>1 两函数递增，0<a<1 两函数递减' },
      { id: 'mirror', title: '关于 y=x 对称', desc: '反函数图像关于直线 y=x 对称' },
      { id: 'apply', title: '换底公式', desc: 'logₐx = ln x / ln a，任意底可化为自然对数' },
    ],
    meta: {
      difficulty: '入门难度',
      duration: '约 20 分钟',
      templates: ['指数对数可视化', '反函数对称演示'],
    },
    version: 1,
  },
  // 8. 反比例函数（function-plot 模板：shape=rational，渐近线）
  {
    id: 'rational-function',
    title: '反比例函数',
    course: '高等数学（上册）',
    chapter: '函数与极限',
    section: '函数',
    template: 'function-plot',
    summary:
      '反比例函数 y = a/(x−h) + k 的图像是双曲线：直线 x=h 为垂直渐近线（x→h 时 |y|→∞），直线 y=k 为水平渐近线（x→∞ 时 y→k），点 (h,k) 是两条渐近线的交点。',
    goals: [
      '理解反比例函数图像为双曲线',
      '掌握垂直/水平渐近线的意义',
      '理解 h/k 对图像平移的影响',
    ],
    defaultCase: 'recip-1',
    cases: [
      {
        id: 'recip-1',
        name: 'y = 1/x',
        expr: 'a/(x-h)+k',
        domain: [-5, 5],
        yRange: [-5, 5],
        params: { a: 1, h: 0, k: 0 },
        paramRanges: { a: { label: '系数 a', min: -3, max: 3, step: 0.1 }, h: { label: '平移 h', min: -5, max: 5, step: 0.1 }, k: { label: '平移 k', min: -5, max: 5, step: 0.1 } },
        shape: 'rational',
        desc: '标准反比例：渐近线为坐标轴',
      },
      {
        id: 'recip-h',
        name: 'y = 1/(x−1)',
        expr: 'a/(x-h)+k',
        domain: [-5, 5],
        yRange: [-5, 5],
        params: { a: 1, h: 1, k: 0 },
        paramRanges: { a: { label: '系数 a', min: -3, max: 3, step: 0.1 }, h: { label: '平移 h', min: -5, max: 5, step: 0.1 }, k: { label: '平移 k', min: -5, max: 5, step: 0.1 } },
        shape: 'rational',
        desc: '垂直渐近线右移至 x=1',
      },
      {
        id: 'recip-hk',
        name: 'y = 1/(x−1)+1',
        expr: 'a/(x-h)+k',
        domain: [-5, 5],
        yRange: [-5, 5],
        params: { a: 1, h: 1, k: 1 },
        paramRanges: { a: { label: '系数 a', min: -3, max: 3, step: 0.1 }, h: { label: '平移 h', min: -5, max: 5, step: 0.1 }, k: { label: '平移 k', min: -5, max: 5, step: 0.1 } },
        shape: 'rational',
        desc: '中心移至 (1,1)',
      },
      {
        id: 'recip-neg',
        name: 'y = −2/(x+1)+2',
        expr: 'a/(x-h)+k',
        domain: [-5, 5],
        yRange: [-5, 5],
        params: { a: -2, h: -1, k: 2 },
        paramRanges: { a: { label: '系数 a', min: -3, max: 3, step: 0.1 }, h: { label: '平移 h', min: -5, max: 5, step: 0.1 }, k: { label: '平移 k', min: -5, max: 5, step: 0.1 } },
        shape: 'rational',
        desc: 'a<0 开口方向相反，中心 (−1,2)',
      },
    ],
    steps: [
      { id: 'identify', title: '识别函数', desc: 'y = a/(x−h) + k 为反比例函数，图像是双曲线' },
      { id: 'va', title: '垂直渐近线', desc: 'x→h 时 |y|→∞，直线 x=h 为垂直渐近线' },
      { id: 'ha', title: '水平渐近线', desc: 'x→∞ 时 y→k，直线 y=k 为水平渐近线' },
      { id: 'shift', title: '平移变换', desc: '拖动中心点 (h,k) 或调滑块，观察渐近线跟随' },
    ],
    meta: {
      difficulty: '入门难度',
      duration: '约 15 分钟',
      templates: ['反比例函数可视化', '渐近线动态演示'],
    },
    version: 1,
  },
  // 9. 反函数（function-plot 模板：shape=inverse-pair，关于 y=x 对称）
  {
    id: 'inverse-function',
    title: '反函数',
    course: '高等数学（上册）',
    chapter: '函数与极限',
    section: '函数',
    template: 'function-plot',
    summary:
      '若 y=f(x) 与 y=f⁻¹(x) 互为反函数，则它们的图像关于直线 y=x 对称，且复合 f(f⁻¹(x)) = x、f⁻¹(f(x)) = x。',
    goals: [
      '理解反函数的概念与存在条件（一一对应）',
      '认识反函数图像关于 y=x 对称',
      '掌握复合还原性质 f(f⁻¹(x)) = x',
    ],
    defaultCase: 'inv-square',
    cases: [
      {
        id: 'inv-square',
        name: 'y = x² 与 y = √x',
        expr: 'x^2',
        expr2: 'sqrt(x)',
        domain: [0, 4],
        yRange: [0, 4],
        shape: 'inverse-pair',
        desc: 'x≥0 上一一对应，互为反函数',
      },
      {
        id: 'inv-cube',
        name: 'y = x³ 与 y = x^(1/3)',
        expr: 'x^3',
        expr2: 'x^(1/3)',
        domain: [-2, 2],
        yRange: [-4, 4],
        shape: 'inverse-pair',
        desc: '三次函数在全实数域一一对应',
      },
      {
        id: 'inv-exp',
        name: 'y = 2ˣ 与 y = log₂x',
        expr: 'pow(2, x)',
        expr2: 'log(x, 2)',
        domain: [-3, 3],
        yRange: [-3, 3],
        shape: 'inverse-pair',
        desc: '指数与对数互为反函数',
      },
    ],
    steps: [
      { id: 'identify', title: '识别反函数', desc: 'f 与 f⁻¹ 满足 f(f⁻¹(x)) = x' },
      { id: 'mirror', title: '关于 y=x 对称', desc: '反函数图像是原函数关于 y=x 的镜像' },
      { id: 'domain', title: '定义域与值域', desc: 'f⁻¹ 的定义域 = f 的值域，互相对换' },
      { id: 'apply', title: '复合还原', desc: 'f(f⁻¹(x)) = x 与 f⁻¹(f(x)) = x' },
    ],
    meta: {
      difficulty: '入门难度',
      duration: '约 15 分钟',
      templates: ['反函数对称可视化', '复合还原演示'],
    },
    version: 1,
  },
  // 10. 分段函数（function-plot 模板：shape=piecewise）
  {
    id: 'piecewise-function',
    title: '分段函数',
    course: '高等数学（上册）',
    chapter: '函数与极限',
    section: '函数',
    template: 'function-plot',
    summary:
      '分段函数在不同区间上用不同表达式定义：y = fᵢ(x)（x ∈ Dᵢ）。关注分段点处的取值与连续性——左右极限相等且等于函数值则连续。',
    goals: [
      '理解分段函数的定义方式',
      '会求分段点处的函数值与极限',
      '判断分段点处的连续性',
    ],
    defaultCase: 'sign',
    cases: [
      {
        id: 'sign',
        name: '符号函数 sign(x)',
        expr: '0',
        pieces: [{ expr: '-1', to: 0 }, { expr: '1', from: 0 }],
        domain: [-5, 5],
        yRange: [-3, 3],
        shape: 'piecewise',
        desc: 'x<0 取 −1、x>0 取 1，x=0 处跳跃间断',
      },
      {
        id: 'abs-pw',
        name: '绝对值分段',
        expr: '0',
        pieces: [{ expr: '-x', to: 0 }, { expr: 'x', from: 0 }],
        domain: [-5, 5],
        yRange: [-3, 5],
        shape: 'piecewise',
        desc: 'x<0 为 −x、x≥0 为 x，即 y=|x|，连续',
      },
      {
        id: 'pw-quad',
        name: 'x² 接 2x−1',
        expr: '0',
        pieces: [{ expr: 'x^2', to: 1 }, { expr: '2*x-1', from: 1 }],
        domain: [-3, 3],
        yRange: [-3, 5],
        shape: 'piecewise',
        desc: 'x=1 处两段取值相等（1），连续衔接',
      },
      {
        id: 'step',
        name: '阶梯函数',
        expr: '0',
        pieces: [{ expr: '1', to: 1 }, { expr: '2', from: 1, to: 2 }, { expr: '3', from: 2 }],
        domain: [-5, 5],
        yRange: [-1, 5],
        shape: 'piecewise',
        desc: '台阶式取值，分段点处跳跃间断',
      },
    ],
    steps: [
      { id: 'identify', title: '识别分段', desc: '不同区间用不同表达式定义同一函数' },
      { id: 'points', title: '分段点', desc: '分段点 x₀ 处需分别考虑左右两段' },
      { id: 'continuous', title: '连续性', desc: '左右极限相等且等于 f(x₀) 则连续' },
      { id: 'apply', title: '综合应用', desc: '求分段函数值：先判断 x 属于哪一段' },
    ],
    meta: {
      difficulty: '入门难度',
      duration: '约 15 分钟',
      templates: ['分段函数可视化', '间断点演示'],
    },
    version: 1,
  },
  // 11. 复合函数（function-plot 模板：shape=composite）
  {
    id: 'composite-function',
    title: '复合函数',
    course: '高等数学（上册）',
    chapter: '函数与极限',
    section: '函数',
    template: 'function-plot',
    summary:
      '复合函数 y = f(g(x))：先对 x 施以内层函数 g，再将结果代入外层函数 f。内层值域需落在外层定义域内。',
    goals: [
      '理解复合函数的结构 f(g(x))',
      '掌握复合函数的求值顺序',
      '会求复合函数的定义域',
    ],
    defaultCase: 'compose-sin2x',
    cases: [
      {
        id: 'compose-sin2x',
        name: 'y = sin(2x)',
        expr: 'sin(2*x)',
        domain: [-4, 4],
        yRange: [-1.5, 1.5],
        shape: 'composite',
        desc: '内层 g(x)=2x 压缩周期，外层 f(u)=sin u',
      },
      {
        id: 'compose-cosx2',
        name: 'y = cos(x²)',
        expr: 'cos(x^2)',
        domain: [-3, 3],
        yRange: [-1.5, 1.5],
        shape: 'composite',
        desc: '内层 g(x)=x² 使振荡频率随 |x| 增大而加快',
      },
      {
        id: 'compose-sqrt',
        name: 'y = √(1−x²)',
        expr: 'sqrt(1-x^2)',
        domain: [-1.2, 1.2],
        yRange: [-0.3, 1.5],
        shape: 'composite',
        desc: '单位圆上半部分：g(x)=1−x² 需非负',
      },
      {
        id: 'compose-2x2',
        name: 'y = 2^(x²)',
        expr: 'pow(2, x^2)',
        domain: [-2, 2],
        yRange: [0.5, 8],
        shape: 'composite',
        desc: '内层 x² 恒非负，复合后为偶函数',
      },
    ],
    steps: [
      { id: 'identify', title: '识别结构', desc: 'y = f(g(x))：外层 f、内层 g' },
      { id: 'inner', title: '内层 g', desc: '先计算 g(x)，其值域是外层的输入' },
      { id: 'outer', title: '外层 f', desc: '再把 u = g(x) 代入 f(u)' },
      { id: 'domain', title: '定义域', desc: 'g(x) 的值域必须落在外层定义域内' },
    ],
    meta: {
      difficulty: '入门难度',
      duration: '约 15 分钟',
      templates: ['复合函数可视化', '内层外层演示'],
    },
    version: 1,
  },
  // 12. 三角函数图像（通用模板：A·sin(f·x+φ) 与 A·cos(f·x+φ) 双曲线）
  {
    id: 'trigonometric-function',
    title: '三角函数图像',
    course: '高等数学（上册）',
    chapter: '函数与极限',
    section: '函数',
    template: 'function-plot',
    summary:
      '正弦函数 y = A·sin(f·x + φ) 与余弦函数 y = A·cos(f·x + φ) 是周期函数：A 为振幅，f 为频率（周期 T = 2π/f），φ 为初相。二者同频时相差 π/2 相位。',
    formula: 'y = A \\sin(fx + \\varphi)',
    goals: ['理解正弦/余弦函数图像与参数', '掌握振幅/频率/相移的几何意义', '会由参数写出函数表达式'],
    legend: [
      { color: '#6366f1', label: 'sin' },
      { color: '#ec4899', label: 'cos' },
    ],
    dataItems: [
      { label: '振幅 A', expr: 'A' },
      { label: '频率 f', expr: 'f' },
      { label: '周期 T', expr: '6.283185307179586/f' },
      { label: '初相 φ', expr: 'p' },
    ],
    tips: [
      { icon: '🌊', text: 'sin²θ + cos²θ = 1；tanθ = sinθ/cosθ。' },
      { icon: '🔁', text: '周期 T = 2π/f：频率 f 增大时波形压缩、周期缩短。' },
      { icon: '📐', text: '相移 φ 使波形左右平移：sin(x + π/2) 与 cos x 重合。' },
    ],
    defaultCase: 'sin-basic',
    cases: [
      {
        id: 'sin-basic',
        name: 'y = sin x 与 cos x',
        expr: 'A*sin(f*x+p)',
        expr2: 'A*cos(f*x+p)',
        domain: [-7, 7],
        yRange: [-3, 3],
        params: { A: 1, f: 1, p: 0 },
        paramRanges: { A: { label: '振幅 A', min: 0.1, max: 2, step: 0.1 }, f: { label: '频率 f', min: 0.5, max: 5, step: 0.5 }, p: { label: '初相 φ', min: -3.14, max: 3.14, step: 0.15 } },
        desc: '基本正弦与余弦：同频、相差 π/2',
      },
      {
        id: 'sin-amp',
        name: 'y = 2sin x',
        expr: 'A*sin(f*x+p)',
        expr2: 'A*cos(f*x+p)',
        domain: [-7, 7],
        yRange: [-3, 3],
        params: { A: 2, f: 1, p: 0 },
        paramRanges: { A: { label: '振幅 A', min: 0.1, max: 2, step: 0.1 }, f: { label: '频率 f', min: 0.5, max: 5, step: 0.5 }, p: { label: '初相 φ', min: -3.14, max: 3.14, step: 0.15 } },
        desc: '振幅 2：波形纵向拉伸',
      },
      {
        id: 'sin-freq',
        name: 'y = sin(2x)',
        expr: 'A*sin(f*x+p)',
        expr2: 'A*cos(f*x+p)',
        domain: [-7, 7],
        yRange: [-3, 3],
        params: { A: 1, f: 2, p: 0 },
        paramRanges: { A: { label: '振幅 A', min: 0.1, max: 2, step: 0.1 }, f: { label: '频率 f', min: 0.5, max: 5, step: 0.5 }, p: { label: '初相 φ', min: -3.14, max: 3.14, step: 0.15 } },
        desc: '频率 2：周期减半为 π',
      },
      {
        id: 'sin-phase',
        name: 'y = sin(x + π/2)',
        expr: 'A*sin(f*x+p)',
        expr2: 'A*cos(f*x+p)',
        domain: [-7, 7],
        yRange: [-3, 3],
        params: { A: 1, f: 1, p: 1.57 },
        paramRanges: { A: { label: '振幅 A', min: 0.1, max: 2, step: 0.1 }, f: { label: '频率 f', min: 0.5, max: 5, step: 0.5 }, p: { label: '初相 φ', min: -3.14, max: 3.14, step: 0.15 } },
        desc: '相移 π/2：sin 左移后与 cos 重合',
      },
    ],
    steps: [
      { id: 'identify', title: '识别函数', desc: 'y = A·sin(f·x + φ)：A 振幅、f 频率、φ 初相' },
      { id: 'amp', title: '振幅 A', desc: '波形纵向范围 [-A, A]' },
      { id: 'period', title: '周期 T', desc: 'T = 2π/f：频率越高周期越短' },
      { id: 'phase', title: '相移 φ', desc: '波形水平平移 φ/f 个单位' },
    ],
    meta: {
      difficulty: '入门难度',
      duration: '约 20 分钟',
      templates: ['三角函数波形', '振幅频率相位联动'],
    },
    version: 1,
  },
  // 13. 圆锥曲线（通用模板：椭圆/双曲线双分支、抛物线）
  {
    id: 'conic-sections',
    title: '圆锥曲线',
    course: '高等数学（上册）',
    chapter: '函数与极限',
    section: '函数',
    template: 'function-plot',
    summary:
      '圆锥曲线包括椭圆（到两焦点距离之和为常数）、双曲线（距离之差绝对值为常数）与抛物线（到焦点与准线距离相等）。离心率 e=c/a：椭圆 0<e<1、抛物线 e=1、双曲线 e>1。',
    formula: '\\frac{x^2}{a^2} \\pm \\frac{y^2}{b^2} = 1,\\quad y^2 = 4px',
    goals: ['识别椭圆/双曲线/抛物线的标准方程', '掌握离心率 e 的分类', '理解焦点与准线的几何意义'],
    legend: [
      { color: '#60a5fa', label: '曲线' },
    ],
    dataItems: [
      { label: 'a', expr: 'a' },
      { label: 'b', expr: 'b' },
      { label: 'p', expr: 'p' },
    ],
    tips: [
      { icon: '🥚', text: '椭圆：c = √|a²−b²|，离心率 e = c/a ∈ (0,1)，焦点 (±c, 0)。' },
      { icon: '🌀', text: '双曲线：c = √(a²+b²)，e = c/a > 1，渐近线 y = ±(b/a)x。' },
      { icon: '📡', text: '抛物线：e = 1 恒成立，焦点 (p,0)、准线 x = −p。' },
    ],
    defaultCase: 'ellipse-h',
    cases: [
      {
        id: 'ellipse-h',
        name: '椭圆 (横)',
        expr: 'b*sqrt(1-x^2/a^2)',
        expr2: '-b*sqrt(1-x^2/a^2)',
        domain: [-6, 6],
        yRange: [-4, 4],
        params: { a: 5, b: 3 },
        paramRanges: { a: { label: '长轴 a', min: 1, max: 8, step: 0.5 }, b: { label: '短轴 b', min: 1, max: 8, step: 0.5 } },
        desc: '标准横椭圆：x²/25 + y²/9 = 1',
      },
      {
        id: 'ellipse-v',
        name: '椭圆 (竖)',
        expr: 'b*sqrt(1-x^2/a^2)',
        expr2: '-b*sqrt(1-x^2/a^2)',
        domain: [-4, 4],
        yRange: [-6, 6],
        params: { a: 3, b: 5 },
        paramRanges: { a: { label: '长轴 a', min: 1, max: 8, step: 0.5 }, b: { label: '短轴 b', min: 1, max: 8, step: 0.5 } },
        desc: '竖椭圆：b > a 时长轴在 y 方向',
      },
      {
        id: 'hyperbola',
        name: '双曲线',
        expr: 'b*sqrt(x^2/a^2-1)',
        expr2: '-b*sqrt(x^2/a^2-1)',
        domain: [-8, 8],
        yRange: [-6, 6],
        params: { a: 5, b: 3 },
        paramRanges: { a: { label: '实轴 a', min: 1, max: 8, step: 0.5 }, b: { label: '虚轴 b', min: 1, max: 8, step: 0.5 } },
        desc: '双曲线两支：|x| ≥ a，渐近线 y = ±(b/a)x',
      },
      {
        id: 'parabola',
        name: '抛物线',
        expr: 'sqrt(4*p*x)',
        expr2: '-sqrt(4*p*x)',
        domain: [-1, 5],
        yRange: [-4, 4],
        params: { p: 2 },
        paramRanges: { p: { label: '焦准距 p', min: 0.5, max: 5, step: 0.5 } },
        desc: 'y² = 4px：焦点 (p,0)、准线 x = −p',
      },
    ],
    steps: [
      { id: 'identify', title: '识别曲线', desc: '由标准方程判断类型：椭圆 ±、双曲线 −、抛物线 y²' },
      { id: 'a-b', title: '参数 a/b', desc: 'a 为长（实）半轴，b 为短（虚）半轴' },
      { id: 'focus', title: '焦点与离心率', desc: 'e = c/a：椭圆 (0,1)、抛物线 1、双曲线 >1' },
      { id: 'apply', title: '综合应用', desc: '调节 a/b/p 观察曲线形状与离心率变化' },
    ],
    meta: {
      difficulty: '入门难度',
      duration: '约 25 分钟',
      templates: ['圆锥曲线可视化', '离心率联动'],
    },
    version: 1,
  },
  // 14. 泰勒公式（通用模板：原函数 + 泰勒多项式逼近）
  {
    id: 'taylor-approximation',
    title: '泰勒公式逼近',
    course: '高等数学（上册）',
    chapter: '微分中值定理与导数的应用',
    section: '泰勒公式',
    template: 'function-plot',
    summary:
      '泰勒公式用多项式逼近函数：f(x) ≈ Σ f⁽ᵏ⁾(x₀)(x−x₀)ᵏ/k!。阶数越高、越靠近展开点 x₀，逼近越精确。',
    formula: 'f(x) = \\sum_{k=0}^{n} \\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k',
    goals: ['理解泰勒公式用多项式逼近函数的思想', '观察阶数对逼近精度的影响', '掌握麦克劳林展开（x₀=0）'],
    legend: [
      { color: '#60a5fa', label: '原函数' },
      { color: '#f472b6', label: '泰勒多项式' },
    ],
    tips: [
      { icon: '🎯', text: '展开点 x₀ = 0（麦克劳林展开）：x 越接近 0，逼近误差越小。' },
      { icon: '📈', text: '阶数越高，多项式在更大区间上贴合原函数。' },
      { icon: '♾️', text: 'eˣ 的泰勒级数在全实数域收敛；sin x 的级数同样全域收敛。' },
    ],
    defaultCase: 'taylor-exp-2',
    cases: [
      {
        id: 'taylor-exp-2',
        name: 'eˣ 与 2 阶',
        expr: 'exp(x)',
        expr2: '1+x+x^2/2',
        domain: [-2.5, 2.5],
        yRange: [-2, 4],
        desc: 'eˣ 的 2 阶麦克劳林逼近：1 + x + x²/2',
      },
      {
        id: 'taylor-exp-4',
        name: 'eˣ 与 4 阶',
        expr: 'exp(x)',
        expr2: '1+x+x^2/2+x^3/6+x^4/24',
        domain: [-2.5, 2.5],
        yRange: [-2, 4],
        desc: 'eˣ 的 4 阶逼近：加 x³/6 与 x⁴/24',
      },
      {
        id: 'taylor-sin-3',
        name: 'sin x 与 3 阶',
        expr: 'sin(x)',
        expr2: 'x-x^3/6',
        domain: [-4, 4],
        yRange: [-1.8, 1.8],
        desc: 'sin x 的 3 阶逼近：x − x³/6',
      },
      {
        id: 'taylor-sin-5',
        name: 'sin x 与 5 阶',
        expr: 'sin(x)',
        expr2: 'x-x^3/6+x^5/120',
        domain: [-4, 4],
        yRange: [-1.8, 1.8],
        desc: 'sin x 的 5 阶逼近：加 x⁵/120，贴合区间扩大',
      },
    ],
    steps: [
      { id: 'identify', title: '识别逼近', desc: '蓝色为原函数，粉色为泰勒多项式' },
      { id: 'order', title: '阶数影响', desc: '阶数越高，在更大区间逼近越准' },
      { id: 'point', title: '展开点', desc: 'x₀ = 0 附近误差最小，越远误差越大' },
      { id: 'apply', title: '综合应用', desc: '切换案例观察不同函数与阶数的逼近效果' },
    ],
    meta: {
      difficulty: '中等难度',
      duration: '约 25 分钟',
      templates: ['泰勒逼近可视化', '阶数对比'],
    },
    version: 1,
  },
  // 15. 函数图象变换（通用模板：g(x) = a·f(b(x−h)) + k，基函数对比）
  {
    id: 'function-transform',
    title: '函数图象变换',
    course: '高等数学（上册）',
    chapter: '函数与极限',
    section: '函数',
    template: 'function-plot',
    summary:
      '函数变换 g(x) = a·f(b(x−h)) + k：h 水平平移、k 竖直平移、a 竖直伸缩/翻折、b 水平伸缩/翻折。平移不改变形状，负号带来镜像。',
    formula: 'g(x) = a\\, f(b(x-h)) + k',
    goals: ['掌握平移/伸缩/翻折的参数语义', '理解 h/k 管平移、a/b 管伸缩', '会用变换式描述图像变化'],
    legend: [
      { color: '#60a5fa', label: '变换曲线' },
      { color: '#ec4899', label: '基函数' },
    ],
    dataItems: [
      { label: 'a', expr: 'a' },
      { label: 'b', expr: 'b' },
      { label: 'h', expr: 'h' },
      { label: 'k', expr: 'k' },
    ],
    tips: [
      { icon: '↔️', text: 'h 管水平平移（右正左负），k 管竖直平移（上正下负）。' },
      { icon: '↕️', text: 'a>1 竖直拉伸、0<|a|<1 压缩；a<0 沿 x 轴翻折。' },
      { icon: '🪞', text: 'b>1 水平压缩、0<|b|<1 拉伸；b<0 沿 y 轴翻折。' },
    ],
    defaultCase: 'tf-square',
    cases: [
      {
        id: 'tf-square',
        name: '基函数 x²',
        expr: 'a*(b*(x-h))^2+k',
        expr2: 'x^2',
        domain: [-6, 6],
        yRange: [-5, 5],
        params: { a: 1, b: 1, h: 0, k: 0 },
        paramRanges: { a: { label: '竖直 a', min: -2, max: 2, step: 0.5 }, b: { label: '水平 b', min: -2, max: 2, step: 0.5 }, h: { label: '平移 h', min: -3, max: 3, step: 0.5 }, k: { label: '平移 k', min: -3, max: 3, step: 0.5 } },
        desc: '抛物线基准：调 a/h/k 观察变换',
      },
      {
        id: 'tf-sin',
        name: '基函数 sin x',
        expr: 'a*sin(b*(x-h))+k',
        expr2: 'sin(x)',
        domain: [-6, 6],
        yRange: [-3, 3],
        params: { a: 1, b: 1, h: 0, k: 0 },
        paramRanges: { a: { label: '竖直 a', min: -2, max: 2, step: 0.5 }, b: { label: '水平 b', min: -2, max: 2, step: 0.5 }, h: { label: '平移 h', min: -3, max: 3, step: 0.5 }, k: { label: '平移 k', min: -3, max: 3, step: 0.5 } },
        desc: '正弦波：b 改变频率、a 改变振幅',
      },
      {
        id: 'tf-abs',
        name: '基函数 |x|',
        expr: 'a*abs(b*(x-h))+k',
        expr2: 'abs(x)',
        domain: [-6, 6],
        yRange: [-5, 5],
        params: { a: 1, b: 1, h: 0, k: 0 },
        paramRanges: { a: { label: '竖直 a', min: -2, max: 2, step: 0.5 }, b: { label: '水平 b', min: -2, max: 2, step: 0.5 }, h: { label: '平移 h', min: -3, max: 3, step: 0.5 }, k: { label: '平移 k', min: -3, max: 3, step: 0.5 } },
        desc: 'V 形：a<0 向下翻折',
      },
      {
        id: 'tf-cube',
        name: '基函数 x³',
        expr: 'a*(b*(x-h))^3+k',
        expr2: 'x^3',
        domain: [-6, 6],
        yRange: [-5, 5],
        params: { a: 1, b: 1, h: 0, k: 0 },
        paramRanges: { a: { label: '竖直 a', min: -2, max: 2, step: 0.5 }, b: { label: '水平 b', min: -2, max: 2, step: 0.5 }, h: { label: '平移 h', min: -3, max: 3, step: 0.5 }, k: { label: '平移 k', min: -3, max: 3, step: 0.5 } },
        desc: '三次曲线：中心对称',
      },
    ],
    steps: [
      { id: 'identify', title: '识别变换', desc: 'g(x) = a·f(b(x−h)) + k：四个参数各管一种变换' },
      { id: 'translate', title: '平移 h/k', desc: 'h 右正左负、k 上正下负，不改变形状' },
      { id: 'scale', title: '伸缩 a/b', desc: '|a|、|b| 越大越「瘦高/紧凑」，越小越「矮宽」' },
      { id: 'flip', title: '翻折', desc: 'a<0 沿 x 轴翻折，b<0 沿 y 轴翻折' },
    ],
    meta: {
      difficulty: '入门难度',
      duration: '约 20 分钟',
      templates: ['函数图象变换', '平移伸缩翻折'],
    },
    version: 1,
  },
  // 16. 幂级数（通用模板：精确函数 + 部分和逼近，收敛半径）
  {
    id: 'power-series',
    title: '幂级数收敛',
    course: '高等数学（上册）',
    chapter: '微分中值定理与导数的应用',
    section: '泰勒公式',
    template: 'function-plot',
    summary:
      '幂级数 Σ aₙxⁿ 的部分和在收敛半径 |x| < R 内逼近精确函数，区间外发散：几何级数 R=1、eˣ 的级数 R=∞、ln(1+x) 与 arctan x 的级数 R=1。',
    formula: '\\sum_{n=0}^{\\infty} a_n x^n',
    goals: ['理解幂级数部分和逼近', '掌握收敛半径的概念', '对比几何级数与指数级数'],
    legend: [
      { color: '#60a5fa', label: '精确函数' },
      { color: '#f472b6', label: '部分和' },
    ],
    tips: [
      { icon: '🎯', text: '部分和项数越多，在收敛区间内越贴近精确函数。' },
      { icon: '📏', text: '收敛半径 R 内收外散：几何级数 R=1，eˣ 的级数 R=∞。' },
      { icon: '⚠️', text: '几何级数在 |x|≥1 发散，1/(1−x) 仅当 |x|<1 成立。' },
    ],
    defaultCase: 'ps-geo-4',
    cases: [
      {
        id: 'ps-geo-4',
        name: '几何级数 4 项',
        expr: '1/(1-x)',
        expr2: '1+x+x^2+x^3',
        domain: [-1.6, 1.6],
        yRange: [-3, 6],
        desc: 'Σxⁿ 前 4 项：收敛半径 R=1',
      },
      {
        id: 'ps-geo-8',
        name: '几何级数 8 项',
        expr: '1/(1-x)',
        expr2: '1+x+x^2+x^3+x^4+x^5+x^6+x^7',
        domain: [-1.6, 1.6],
        yRange: [-3, 6],
        desc: '8 项：|x|<1 内更贴近，区间边缘误差仍大',
      },
      {
        id: 'ps-exp-4',
        name: 'eˣ 级数 4 项',
        expr: 'exp(x)',
        expr2: '1+x+x^2/2+x^3/6',
        domain: [-2.5, 2.5],
        yRange: [-1, 6],
        desc: 'Σxⁿ/n! 前 4 项：R=∞，全域收敛',
      },
      {
        id: 'ps-ln-4',
        name: 'ln(1+x) 级数 4 项',
        expr: 'log(1+x)',
        expr2: 'x-x^2/2+x^3/3-x^4/4',
        domain: [-0.95, 1.4],
        yRange: [-2.5, 2.5],
        desc: '交错级数：R=1，收敛慢于几何级数',
      },
      {
        id: 'ps-atan-4',
        name: 'arctan x 级数 4 项',
        expr: 'atan(x)',
        expr2: 'x-x^3/3+x^5/5-x^7/7',
        domain: [-1.6, 1.6],
        yRange: [-2, 2],
        desc: 'R=1：|x|>1 时部分和振荡发散',
      },
    ],
    steps: [
      { id: 'identify', title: '识别级数', desc: '蓝线精确函数、粉线部分和逼近' },
      { id: 'order', title: '项数影响', desc: '项数越多，收敛区间内贴合越好' },
      { id: 'radius', title: '收敛半径 R', desc: '|x|<R 收敛、|x|>R 发散；eˣ 级数 R=∞' },
      { id: 'apply', title: '综合应用', desc: '切换级数对比几何级数（R=1）与指数级数（R=∞）' },
    ],
    meta: {
      difficulty: '中等难度',
      duration: '约 25 分钟',
      templates: ['幂级数部分和逼近', '收敛半径演示'],
    },
    version: 1,
  },
  // 17. 牛顿迭代法（shape=newton：切线逼近 + 迭代序列）
  {
    id: 'newton-method',
    title: '牛顿迭代法',
    course: '高等数学（上册）',
    chapter: '微分中值定理与导数的应用',
    section: '牛顿迭代法',
    template: 'function-plot',
    summary:
      '牛顿迭代法用切线逼近函数零点：xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ)。从初始值 x₀ 出发，反复作切线与 x 轴交点，序列快速收敛到根（二阶收敛）。',
    formula: 'x_{n+1} = x_n - \\frac{f(x_n)}{f\'(x_n)}',
    goals: ['理解牛顿迭代的切线逼近原理', '掌握迭代公式与收敛性', '会分析初值对收敛的影响'],
    legend: [
      { color: '#60a5fa', label: '曲线' },
      { color: '#fbbf24', label: '迭代点 xₙ' },
    ],
    tips: [
      { icon: '📐', text: '几何意义：过 (xₙ, f(xₙ)) 作切线，切线与 x 轴交点即 xₙ₊₁。' },
      { icon: '⚡', text: '牛顿迭代二阶收敛：每步有效数字约翻倍。' },
      { icon: '⚠️', text: '初值 x₀ 需接近根，否则可能发散或收敛到其他根。' },
    ],
    defaultCase: 'newton-sqrt2',
    cases: [
      {
        id: 'newton-sqrt2',
        name: 'x²−2（求 √2）',
        expr: 'x^2-2',
        domain: [-1.5, 2.5],
        yRange: [-3, 3],
        params: { x0: 2 },
        paramRanges: { x0: { label: '初始值 x₀', min: -5, max: 5, step: 0.1 } },
        shape: 'newton',
        desc: '从 x₀=2 出发快速收敛到 √2 ≈ 1.4142',
      },
      {
        id: 'newton-cubic',
        name: 'x³−x−1',
        expr: 'x^3-x-1',
        domain: [-2, 2],
        yRange: [-3, 3],
        params: { x0: 1.5 },
        paramRanges: { x0: { label: '初始值 x₀', min: -5, max: 5, step: 0.1 } },
        shape: 'newton',
        desc: '唯一实根 ≈ 1.3247',
      },
      {
        id: 'newton-cosx',
        name: 'cos x − x',
        expr: 'cos(x)-x',
        domain: [-0.5, 1.5],
        yRange: [-1.5, 1.5],
        params: { x0: 1 },
        paramRanges: { x0: { label: '初始值 x₀', min: -5, max: 5, step: 0.1 } },
        shape: 'newton',
        desc: '求 cos x = x 的不动点 ≈ 0.7391',
      },
    ],
    steps: [
      { id: 'identify', title: '识别零点', desc: '求 f(x)=0 的根：曲线与 x 轴交点' },
      { id: 'tangent', title: '作切线', desc: '过 (x₀, f(x₀)) 作切线，斜率 f′(x₀)' },
      { id: 'iterate', title: '迭代', desc: '切线与 x 轴交点 x₁ = x₀ − f(x₀)/f′(x₀)，重复' },
      { id: 'converge', title: '收敛', desc: '序列快速逼近根；播放查看迭代过程' },
    ],
    meta: {
      difficulty: '中等难度',
      duration: '约 25 分钟',
      templates: ['牛顿迭代可视化', '切线逼近零点'],
    },
    version: 1,
  },
  // 18. 数列的极限（shape=sequence 散点）
  {
    id: 'limit-of-sequence',
    title: '数列的极限',
    course: '高等数学（上册）',
    chapter: '函数与极限',
    section: '数列的极限',
    template: 'function-plot',
    summary:
      '当项数 n 无限增大时，数列 {aₙ} 的项无限趋近常数 A，则称 A 为数列极限（ε−N 语言）。黄色散点为数列项，随 n 增大观察收敛或发散。',
    formula: '\\lim_{n \\to \\infty} a_n = A',
    goals: ['理解数列极限的 ε−N 定义', '能判断数列收敛或发散', '观察收敛趋势'],
    legend: [
      { color: '#fbbf24', label: '数列点 (n, aₙ)' },
      { color: '#60a5fa', label: '连续趋势线' },
    ],
    tips: [
      { icon: '🔍', text: '黄色点为数列项：点播放或推进步骤，逐批揭示更多项观察趋势。' },
      { icon: '📏', text: '收敛：aₙ 趋于常数 A；发散：不趋于任何常数。' },
      { icon: '🎯', text: 'ε−N 语言：对任意 ε>0，存在 N 使 n>N 时 |aₙ−A|<ε。' },
    ],
    defaultCase: 'seq-1n',
    cases: [
      { id: 'seq-1n', name: 'aₙ = 1/n', expr: '1/x', domain: [0.5, 21], yRange: [-0.3, 1.3], shape: 'sequence', desc: '收敛到 0：aₙ = 1/n' },
      { id: 'seq-1p', name: 'aₙ = 1 + 1/n', expr: '1+1/x', domain: [0.5, 21], yRange: [0.6, 2.4], shape: 'sequence', desc: '收敛到 1' },
      { id: 'seq-ratio', name: 'aₙ = n/(n+1)', expr: 'x/(x+1)', domain: [0.5, 21], yRange: [0.2, 1.15], shape: 'sequence', desc: '收敛到 1（从下方逼近）' },
      { id: 'seq-div', name: 'aₙ = n（发散）', expr: 'x', domain: [0.5, 21], yRange: [-2, 22], shape: 'sequence', desc: '无界发散：不收敛' },
    ],
    steps: [
      { id: 'identify', title: '识别数列', desc: 'aₙ = f(n)：n 取正整数，黄色点为数列项' },
      { id: 'more', title: '观察更多项', desc: '点播放逐批显示 5→20 项，看趋势' },
      { id: 'limit', title: '判断收敛', desc: 'aₙ 趋于常数 A 则收敛，否则发散' },
      { id: 'eps', title: 'ε−N 验证', desc: '|aₙ−A|<ε 对足够大的 n 恒成立' },
    ],
    meta: { difficulty: '入门难度', duration: '约 20 分钟', templates: ['数列散点', '收敛趋势'] },
    version: 1,
  },
  // 19. 无穷小与无穷大
  {
    id: 'infinitesimal',
    title: '无穷小与无穷大',
    course: '高等数学（上册）',
    chapter: '函数与极限',
    section: '无穷小与无穷大',
    template: 'function-plot',
    summary:
      '极限为 0 的变量称为无穷小量；绝对值无限增大的变量称为无穷大量。1/x 在 x→∞ 时为无穷小，x 本身为无穷大。',
    formula: '\\lim_{x \\to \\infty} \\frac{1}{x} = 0',
    goals: ['理解无穷小与无穷大的概念', '掌握无穷小的阶的比较', '会用等价无穷小代换'],
    legend: [{ color: '#60a5fa', label: '曲线' }],
    dataItems: [
      { label: 'f(2)', expr: '1/x', text: '—' },
    ],
    tips: [
      { icon: '🌱', text: '无穷小：极限为 0 的变量（如 1/x、1/x² 当 x→∞）。' },
      { icon: '🌋', text: '无穷大：绝对值无限增大（如 x、x² 当 x→∞），其倒数为无穷小。' },
      { icon: '🧮', text: '等价无穷小代换是求极限的常用技巧（sin x ~ x，x→0）。' },
    ],
    defaultCase: 'inf-1x',
    cases: [
      { id: 'inf-1x', name: '1/x（无穷小）', expr: '1/x', domain: [0.5, 10], yRange: [-0.3, 2], desc: 'x→∞ 时趋于 0' },
      { id: 'inf-1x2', name: '1/x²（无穷小）', expr: '1/x^2', domain: [0.5, 10], yRange: [-0.3, 2], desc: '更快趋于 0' },
      { id: 'inf-x', name: 'x（无穷大）', expr: 'x', domain: [0.5, 10], yRange: [-1, 12], desc: 'x→∞ 时无限增大' },
      { id: 'inf-x2', name: 'x²（无穷大）', expr: 'x^2', domain: [0.5, 10], yRange: [-2, 30], desc: '更快增大' },
    ],
    steps: [
      { id: 'identify', title: '识别类型', desc: '曲线趋于 0 为无穷小，趋于 ∞ 为无穷大' },
      { id: 'compare', title: '阶的比较', desc: '1/x² 比 1/x 更快趋于 0（高阶无穷小）' },
      { id: 'reciprocal', title: '互为倒数', desc: '无穷小的倒数是无穷大，反之亦然' },
      { id: 'apply', title: '等价代换', desc: 'x→0 时 sin x ~ x、tan x ~ x' },
    ],
    meta: { difficulty: '入门难度', duration: '约 15 分钟', templates: ['无穷小曲线', '阶比较'] },
    version: 1,
  },
  // 20. 极限的运算法则
  {
    id: 'limit-laws',
    title: '极限的运算法则',
    course: '高等数学（上册）',
    chapter: '函数与极限',
    section: '极限的运算法则',
    template: 'function-plot',
    summary:
      '极限满足四则运算：和的极限 = 极限的和，积的极限 = 极限的积，商的极限（分母不为 0）= 极限的商。示例曲线展示各类极限过程。',
    formula: '\\lim(f+g) = \\lim f + \\lim g',
    goals: ['掌握极限四则运算法则', '会求 0/0、∞/∞ 未定式', '理解法则的适用条件'],
    legend: [{ color: '#60a5fa', label: '曲线' }],
    tips: [
      { icon: '➕', text: '和的极限：lim(f+g) = lim f + lim g。' },
      { icon: '✖️', text: '积的极限：lim(f·g) = lim f · lim g；常数因子可提出。' },
      { icon: '➗', text: '商的极限：lim(f/g) = lim f / lim g（lim g ≠ 0）。' },
    ],
    defaultCase: 'law-sum',
    cases: [
      { id: 'law-sum', name: '1 + 1/x → 1', expr: '1+1/x', domain: [0.5, 10], yRange: [0.8, 2.2], desc: '和的极限：1 + 0 = 1' },
      { id: 'law-diff', name: '2 − 1/x → 2', expr: '2-1/x', domain: [0.5, 10], yRange: [1.2, 2.2], desc: '差的极限' },
      { id: 'law-prod', name: '(1+1/x)² → 1', expr: '(1+1/x)^2', domain: [0.5, 10], yRange: [1, 2.6], desc: '积的极限：1·1 = 1' },
      { id: 'law-quot', name: '1/(1+1/x) → 1', expr: '1/(1+1/x)', domain: [0.5, 10], yRange: [0.5, 1.1], desc: '商的极限：分母极限 ≠ 0' },
    ],
    steps: [
      { id: 'identify', title: '识别法则', desc: '先求各部分极限，再按法则组合' },
      { id: 'sum', title: '和差法则', desc: 'lim(f±g) = lim f ± lim g' },
      { id: 'prod', title: '乘积法则', desc: 'lim(f·g) = lim f · lim g' },
      { id: 'quot', title: '商法则', desc: '分母极限非零才可用' },
    ],
    meta: { difficulty: '入门难度', duration: '约 15 分钟', templates: ['极限运算', '四则法则'] },
    version: 1,
  },
  // 21. 两个重要极限
  {
    id: 'two-important-limits',
    title: '两个重要极限',
    course: '高等数学（上册）',
    chapter: '函数与极限',
    section: '两个重要极限',
    template: 'function-plot',
    summary:
      '两个重要极限：lim(x→0) sin x / x = 1 与 lim(x→∞) (1 + 1/x)ˣ = e。前者在 x=0 处为可去间断点，后者曲线趋近 e ≈ 2.718。',
    formula: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1,\\quad \\lim_{x \\to \\infty} (1+\\frac{1}{x})^x = e',
    goals: ['牢记两个重要极限的形式', '理解其几何与数值意义', '会凑型用重要极限求极限'],
    legend: [{ color: '#60a5fa', label: '曲线' }],
    tips: [
      { icon: '🎯', text: 'sin x / x 在 x=0 无定义但极限为 1（可去间断点）。' },
      { icon: '💹', text: '(1 + 1/x)ˣ 随 x→∞ 趋近 e ≈ 2.718。' },
      { icon: '🧩', text: '凑型：lim sin(3x)/(3x) = 1 等变形技巧。' },
    ],
    defaultCase: 'lim-sinx',
    cases: [
      { id: 'lim-sinx', name: 'sin x / x', expr: 'sin(x)/x', domain: [-4, 4], yRange: [-0.5, 1.2], desc: 'x→0 极限 1（0 处无定义断开）' },
      { id: 'lim-tanx', name: 'tan x / x', expr: 'tan(x)/x', domain: [-2.5, 2.5], yRange: [-0.5, 2.5], desc: 'x→0 极限 1' },
      { id: 'lim-e', name: '(1+1/x)ˣ', expr: '(1+1/x)^x', domain: [0.5, 20], yRange: [1.5, 3.2], desc: 'x→∞ 趋近 e ≈ 2.718' },
      { id: 'lim-e2', name: '(1+2/x)ˣ', expr: '(1+2/x)^x', domain: [0.5, 20], yRange: [1.5, 8], desc: '趋近 e² ≈ 7.389' },
    ],
    steps: [
      { id: 'identify', title: '识别极限', desc: '第一重要极限 sin x / x → 1（x→0）' },
      { id: 'second', title: '第二重要极限', desc: '(1 + 1/x)ˣ → e（x→∞）' },
      { id: 'shape', title: '凑型技巧', desc: '把式子凑成重要极限的标准形式' },
      { id: 'apply', title: '综合应用', desc: 'lim(1+a/x)ˣ = eᵃ 等推广' },
    ],
    meta: { difficulty: '入门难度', duration: '约 20 分钟', templates: ['重要极限曲线', 'e 的逼近'] },
    version: 1,
  },
  // 22. 连续函数
  {
    id: 'continuity',
    title: '连续函数',
    course: '高等数学（上册）',
    chapter: '函数与极限',
    section: '函数的连续性',
    template: 'function-plot',
    summary:
      '函数在 x₀ 连续：lim(x→x₀) f(x) = f(x₀)，即极限存在且等于函数值。连续函数具有介值性与最值性。',
    formula: '\\lim_{x \\to x_0} f(x) = f(x_0)',
    goals: ['理解连续的定义（极限=函数值）', '掌握间断点分类', '会用闭区间连续函数性质'],
    legend: [{ color: '#60a5fa', label: '曲线' }],
    tips: [
      { icon: '🖊️', text: '连续：曲线可一笔画过；间断：在某点断开或跳变。' },
      { icon: '🔍', text: '1/x 在 x=0 无定义（无穷间断）；sin x / x 在 0 为可去间断。' },
      { icon: '🎯', text: '闭区间连续函数有介值性：f(a) 与 f(b) 之间的值都能取到。' },
    ],
    defaultCase: 'cont-square',
    cases: [
      { id: 'cont-square', name: 'x²（连续）', expr: 'x^2', domain: [-3, 3], yRange: [-1, 10], desc: '处处连续' },
      { id: 'cont-abs', name: '|x|（连续）', expr: 'abs(x)', domain: [-3, 3], yRange: [-1, 3.5], desc: '连续但 x=0 处不可导' },
      { id: 'cont-1x', name: '1/x（间断）', expr: '1/x', domain: [-3, 3], yRange: [-4, 4], shape: 'rational', markers: { xIntercept: false, yIntercept: false }, desc: 'x=0 无穷间断' },
      { id: 'cont-sinx', name: 'sin x / x（可去间断）', expr: 'sin(x)/x', domain: [-4, 4], yRange: [-0.5, 1.2], desc: 'x=0 无定义但极限存在' },
    ],
    steps: [
      { id: 'identify', title: '识别连续', desc: '曲线无断开即连续' },
      { id: 'def', title: '极限=函数值', desc: 'lim f(x) = f(x₀) 三条件缺一不可' },
      { id: 'type', title: '间断点分类', desc: '可去/跳跃/无穷间断' },
      { id: 'apply', title: '闭区间性质', desc: '介值性、最值性（闭区间连续函数）' },
    ],
    meta: { difficulty: '入门难度', duration: '约 20 分钟', templates: ['连续性可视化', '间断点分类'] },
    version: 1,
  },
  // 23. 微分（Δy ≈ dy 线性主部）
  {
    id: 'differential',
    title: '微分',
    course: '高等数学（上册）',
    chapter: '导数与微分',
    section: '微分的概念',
    template: 'function-plot',
    summary:
      '微分是函数增量的线性主部：Δy = f(x₀+Δx) − f(x₀) ≈ dy = f′(x₀)·Δx。Δx 越小时近似越精确，误差为 Δx 的高阶无穷小。',
    formula: 'dy = f\'(x_0)\\, dx',
    goals: ['理解微分是增量的线性主部', '掌握 Δy 与 dy 的关系', '会用微分做近似计算'],
    legend: [{ color: '#60a5fa', label: 'y = x²' }],
    dataItems: [
      { label: 'x₀', expr: 'x0' },
      { label: 'Δx', expr: 'dx' },
      { label: 'dy = 2x₀·Δx', expr: '2*x0*dx' },
      { label: 'Δy', expr: '(x0+dx)^2-x0^2' },
      { label: '误差 |Δy−dy|', expr: 'abs((x0+dx)^2-x0^2-2*x0*dx)' },
    ],
    tips: [
      { icon: '📐', text: 'dy = f′(x₀)·Δx 是切线纵坐标增量；Δy 是曲线实际增量。' },
      { icon: '🎯', text: 'Δx 越小，dy 越接近 Δy（误差是 Δx 的高阶无穷小）。' },
      { icon: '🧮', text: '一阶微分形式不变性：dy = f′(u)·du 对中间变量也成立。' },
    ],
    defaultCase: 'diff-x1',
    cases: [
      { id: 'diff-x1', name: 'x₀ = 1', expr: 'x^2', domain: [-1, 3], yRange: [-1, 9], params: { x0: 1, dx: 0.5 }, paramRanges: { x0: { label: 'x₀', min: 0.2, max: 2.5, step: 0.1 }, dx: { label: 'Δx', min: 0.05, max: 1.5, step: 0.05 } }, desc: 'f(x)=x² 在 x₀=1 处：dy=1.0, Δy=1.25' },
      { id: 'diff-x2', name: 'x₀ = 2', expr: 'x^2', domain: [-1, 3.5], yRange: [-1, 12], params: { x0: 2, dx: 0.5 }, paramRanges: { x0: { label: 'x₀', min: 0.2, max: 3, step: 0.1 }, dx: { label: 'Δx', min: 0.05, max: 1.5, step: 0.05 } }, desc: 'x₀=2：dy=2.0, Δy=2.25' },
      { id: 'diff-x3', name: 'x₀ = 3', expr: 'x^2', domain: [-1, 4.5], yRange: [-1, 20], params: { x0: 3, dx: 0.3 }, paramRanges: { x0: { label: 'x₀', min: 0.2, max: 4, step: 0.1 }, dx: { label: 'Δx', min: 0.05, max: 1.5, step: 0.05 } }, desc: 'x₀=3 小 Δx：dy 与 Δy 更接近' },
    ],
    steps: [
      { id: 'identify', title: '认识微分', desc: 'dy = f′(x₀)·Δx：线性主部' },
      { id: 'compare', title: 'Δy 与 dy', desc: 'Δy 是实际增量，dy 是切线近似' },
      { id: 'error', title: '误差', desc: '|Δy−dy| 随 Δx 减小而更快减小' },
      { id: 'apply', title: '近似计算', desc: 'f(x₀+Δx) ≈ f(x₀) + f′(x₀)·Δx' },
    ],
    meta: { difficulty: '中等难度', duration: '约 20 分钟', templates: ['微分线性主部', 'Δy 与 dy 对比'] },
    version: 1,
  },
  // 24. 函数图形的描绘
  {
    id: 'graphing',
    title: '函数图形描绘',
    course: '高等数学（上册）',
    chapter: '微分中值定理与导数的应用',
    section: '函数图形的描绘',
    template: 'function-plot',
    summary:
      '借助导数描绘函数图形：f′(x) 定单调性（>0 递增、<0 递减），f″(x) 定凹凸性（>0 凹向上、<0 凸向下），极值点与拐点处一阶/二阶导为零。',
    formula: 'f\'(x) > 0 \\Rightarrow \\uparrow,\\quad f\'\'(x) > 0 \\Rightarrow \\cup',
    goals: ['掌握用导数判断单调性与凹凸性', '会求极值与拐点', '能综合描绘函数图形'],
    legend: [{ color: '#60a5fa', label: '曲线' }],
    tips: [
      { icon: '📈', text: 'f′(x)>0 递增、f′(x)<0 递减；f′(x)=0 可能为极值点。' },
      { icon: '🍵', text: 'f″(x)>0 凹向上（∪）、f″(x)<0 凸向下（∩）；f″=0 可能为拐点。' },
      { icon: '🧭', text: 'x³−3x 在 x=±1 有极值，x³ 单调递增无极值。' },
    ],
    defaultCase: 'graph-cube',
    cases: [
      { id: 'graph-cube', name: 'x³（单调）', expr: 'x^3', domain: [-2.5, 2.5], yRange: [-16, 16], desc: '全域递增，拐点 (0,0)' },
      { id: 'graph-extrema', name: 'x³−3x（极值）', expr: 'x^3-3*x', domain: [-2.5, 2.5], yRange: [-4, 4], desc: 'x=±1 极值，(-1,2) 极大、(1,−2) 极小' },
      { id: 'graph-bounded', name: '1/(1+x²)（有界）', expr: '1/(1+x^2)', domain: [-4, 4], yRange: [-0.5, 1.3], desc: '有界连续，x=0 取最大值 1' },
      { id: 'graph-sin', name: 'sin x（周期）', expr: 'sin(x)', domain: [-7, 7], yRange: [-1.5, 1.5], desc: '极值点 x=π/2+2kπ' },
    ],
    steps: [
      { id: 'identify', title: '定义域', desc: '先确定定义域、奇偶性、周期性' },
      { id: 'deriv', title: '一阶导', desc: 'f′ 定单调区间与极值点' },
      { id: 'second', title: '二阶导', desc: 'f″ 定凹凸性与拐点' },
      { id: 'sketch', title: '综合描绘', desc: '结合渐近线与关键点画出图形' },
    ],
    meta: { difficulty: '中等难度', duration: '约 25 分钟', templates: ['导数与图形', '极值凹凸'] },
    version: 1,
  },
  // 25. 不定积分（原函数族）
  {
    id: 'indefinite-integral',
    title: '不定积分',
    course: '高等数学（上册）',
    chapter: '不定积分与定积分',
    section: '不定积分',
    template: 'function-plot',
    summary:
      '不定积分是导数的逆运算：∫f(x)dx = F(x) + C，其中 F′(x) = f(x)。粉色为被积函数 f，蓝色为原函数 F（一组平行曲线，差一个常数 C）。',
    formula: '\\int f(x)\\, dx = F(x) + C',
    goals: ['理解原函数与不定积分', '掌握换元与分部积分法', '理解积分常数 C'],
    legend: [
      { color: '#60a5fa', label: '原函数 F(x)' },
      { color: '#ec4899', label: '被积函数 f(x)' },
    ],
    tips: [
      { icon: '🔄', text: 'F′(x) = f(x)：原函数求导回到被积函数。' },
      { icon: '➕', text: '不定积分是一族曲线：F(x) + C 相差任意常数。' },
      { icon: '🧮', text: '换元积分法与分部积分法是两大核心方法。' },
    ],
    defaultCase: 'int-square',
    cases: [
      { id: 'int-square', name: '∫x²dx = x³/3', expr: 'x^3/3', expr2: 'x^2', domain: [-3, 3], yRange: [-9, 9], desc: 'F(x)=x³/3，f(x)=x²' },
      { id: 'int-sin', name: '∫sin x dx = −cos x', expr: '-cos(x)', expr2: 'sin(x)', domain: [-4, 4], yRange: [-2, 2], desc: 'F=−cos x，f=sin x' },
      { id: 'int-ln', name: '∫1/x dx = ln|x|', expr: 'log(abs(x))', expr2: '1/x', domain: [0.3, 4], yRange: [-3, 3], desc: 'F=ln|x|，f=1/x' },
    ],
    steps: [
      { id: 'identify', title: '认识原函数', desc: 'F′(x) = f(x)，蓝线为 F、粉线为 f' },
      { id: 'family', title: '积分常数', desc: 'F(x)+C 是一族平行曲线' },
      { id: 'method', title: '基本方法', desc: '直接积分、换元、分部' },
      { id: 'apply', title: '应用', desc: '不定积分是求定积分的基础' },
    ],
    meta: { difficulty: '中等难度', duration: '约 20 分钟', templates: ['原函数族', '积分与导数互逆'] },
    version: 1,
  },
  // 26. 定积分（shape=riemann 面积逼近）
  {
    id: 'definite-integral',
    title: '定积分',
    course: '高等数学（上册）',
    chapter: '不定积分与定积分',
    section: '定积分',
    template: 'function-plot',
    summary:
      '定积分是函数在区间上的累加极限：∫ₐᵇ f(x) dx = lim Σ f(xᵢ)Δx。紫色矩形为黎曼和，分割数 n 越大，梯形和越逼近真实面积（牛顿—莱布尼茨公式）。',
    formula: '\\int_a^b f(x)\\, dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_i)\\Delta x',
    goals: ['理解定积分的分割—求和—取极限定义', '掌握牛顿—莱布尼茨公式', '会用定积分求面积'],
    legend: [
      { color: '#a78bfa', label: '黎曼矩形' },
      { color: '#60a5fa', label: '曲线 f(x)' },
    ],
    dataItems: [
      { label: '分割数 n', expr: 'n' },
    ],
    tips: [
      { icon: '⬛', text: '紫色矩形为黎曼和：调大分割数 n，总面积逼近定积分。' },
      { icon: '📏', text: '梯形和 ≈ 左和与右和的平均，收敛更快。' },
      { icon: '⚡', text: '牛顿—莱布尼茨公式：∫ₐᵇ f(x)dx = F(b) − F(a)。' },
    ],
    defaultCase: 'riemann-square',
    cases: [
      {
        id: 'riemann-square', name: '∫₀¹ x²dx', expr: 'x^2', domain: [-0.2, 1.3], yRange: [-0.3, 1.4],
        params: { a: 0, b: 1, n: 20 }, paramRanges: { n: { label: '分割数 n', min: 4, max: 100, step: 2 } },
        shape: 'riemann', desc: '精确值 1/3 ≈ 0.3333',
      },
      {
        id: 'riemann-sin', name: '∫₀^π sin x dx', expr: 'sin(x)', domain: [-0.3, 3.5], yRange: [-0.3, 1.4],
        params: { a: 0, b: 3.141592653589793, n: 20 }, paramRanges: { n: { label: '分割数 n', min: 4, max: 100, step: 2 } },
        shape: 'riemann', desc: '精确值 2',
      },
      {
        id: 'riemann-ln', name: '∫₁² (1/x)dx', expr: '1/x', domain: [0.9, 2.2], yRange: [-0.3, 1.3],
        params: { a: 1, b: 2, n: 20 }, paramRanges: { n: { label: '分割数 n', min: 4, max: 100, step: 2 } },
        shape: 'riemann', desc: '精确值 ln 2 ≈ 0.6931',
      },
    ],
    steps: [
      { id: 'identify', title: '分割', desc: '把 [a,b] 分成 n 等份，Δx = (b−a)/n' },
      { id: 'rect', title: '作矩形', desc: '紫色矩形高度取 f(xᵢ)' },
      { id: 'sum', title: '求和取极限', desc: 'n→∞ 时黎曼和趋于定积分' },
      { id: 'nlb', title: '牛顿—莱布尼茨', desc: '∫ₐᵇ f(x)dx = F(b) − F(a)' },
    ],
    meta: { difficulty: '中等难度', duration: '约 30 分钟', templates: ['黎曼和逼近', '定积分面积'] },
    version: 1,
  },
]