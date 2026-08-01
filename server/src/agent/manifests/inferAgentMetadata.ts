import type {
  AgentCapability,
  ExperimentAgentMetadata,
  ExperimentCatalogMetadata,
  ExperimentKind,
  ParameterSchemaId,
} from './experimentManifest.js'

export interface ExperimentInferenceCandidate {
  kind: ExperimentKind
  parameterSchema: ParameterSchemaId

  score: number
  textScore: number
  topicScore: number

  matchedSignals: string[]
}

export interface ExperimentAgentInferenceResult {
  agent: ExperimentAgentMetadata
  confidence: number
  candidates: ExperimentInferenceCandidate[]

  selectedCandidate:
    ExperimentInferenceCandidate | null
}

interface InferenceRule {
  kind: ExperimentKind
  parameterSchema: ParameterSchemaId

  terms: readonly string[]
  topics: readonly string[]
  capabilities: readonly AgentCapability[]

  priority: number
}

/**
 * 自动推断实验进入 Registry 的最低置信度。
 *
 * 当前阶段 enabled 只代表：
 * 1. 可以参与 Agent 实验搜索
 * 2. 可以被推荐
 * 3. 可以跳转到对应页面
 *
 * 不代表已经支持参数自动注入。
 */
export const AUTO_ENABLE_CONFIDENCE_THRESHOLD =
  0.85
const DEFAULT_CAPABILITIES:
  readonly AgentCapability[] = [
    'visualize',
    'explain',
    'find-experiment',
  ]

const CALCULABLE_CAPABILITIES:
  readonly AgentCapability[] = [
    'visualize',
    'explain',
    'calculate',
    'compare',
    'find-experiment',
  ]

const VISUAL_CAPABILITIES:
  readonly AgentCapability[] = [
    'visualize',
    'explain',
    'compare',
    'find-experiment',
  ]

/**
 * 规则顺序不会直接决定分类。
 *
 * priority 只在分数完全相同时参与稳定排序。
 */
const INFERENCE_RULES:
  readonly InferenceRule[] = [
    {
      kind: 'cryptography',
      parameterSchema: 'cryptography',

      terms: [
        '密码学',
        '密码系统',
        '加密算法',
        '解密算法',
        '公钥密码',
        '对称加密',
        '非对称加密',
        '数字签名',
        '密钥交换',
        '哈希函数',
        '椭圆曲线密码',
        'rsa',
        'aes',
        'diffie hellman',
        'cryptography',
      ],

      topics: [
        'cryptography',
        'security',
      ],

      capabilities:
        VISUAL_CAPABILITIES,

      priority: 145,
    },

    {
      kind: 'differential-equation',
      parameterSchema:
        'differential-equation',

      terms: [
        '微分方程',
        '常微分方程',
        '偏微分方程',
        '波动方程',
        '热传导方程',
        '拉普拉斯方程',
        '泊松方程',
        '方向场',
        '初值问题',
        '边值问题',
        'ode',
        'pde',
        'wave equation',
        'heat equation',
      ],

      topics: [
        'differential-equation',
        'ode',
        'pde',
      ],

      capabilities:
        CALCULABLE_CAPABILITIES,

      priority: 140,
    },

    {
      kind: 'integral-estimation',
      parameterSchema:
        'integral-estimation',

      terms: [
        '黎曼和',
        '数值积分',
        '定积分逼近',
        '积分近似',
        '矩形法',
        '梯形法',
        '辛普森法',
        'simpson',
        '中点法',
        '左端点法',
        '右端点法',
        'numerical integration',
        'riemann sum',
      ],

      topics: [
        'integration',
        'numerical-integration',
      ],

      capabilities:
        CALCULABLE_CAPABILITIES,

      priority: 135,
    },

    {
      kind: 'signal-processing',
      parameterSchema: 'signal',

      terms: [
        '信号处理',
        '傅里叶变换',
        '拉普拉斯变换',
        '小波变换',
        '频域分析',
        '频谱分析',
        '滤波器',
        '卡尔曼滤波',
        '卷积',
        '采样定理',
        '波的叠加',
        '正弦叠加',
        'fourier transform',
        'laplace transform',
        'wavelet',
        'signal processing',
        'kalman filter',
      ],

      topics: [
        'signal-processing',
      ],

      capabilities:
        CALCULABLE_CAPABILITIES,

      priority: 132,
    },

    {
      kind: 'numerical-method',
      parameterSchema:
        'numerical-method',

      terms: [
        '数值分析',
        '数值方法',
        '插值方法',
        '插值',
        '数值求根',
        '多项式求根',
        '求根方法',
        '牛顿法',
        '二分法',
        '割线法',
        '迭代法',
        '差分法',
        '有限差分',
        '有限元',
        '误差分析',
        '数值解',
        'interpolation',
        'numerical analysis',
        'secant method',
        'newton method',
        'bisection',
        'polynomial roots',
      ],

      topics: [
        'numerical-method',
        'numerical-analysis',
      ],

      capabilities:
        CALCULABLE_CAPABILITIES,

      priority: 130,
    },

    {
      kind: 'optimization',
      parameterSchema: 'optimization',

      terms: [
        '优化方法',
        '最优化',
        '约束优化',
        '梯度下降',
        '模拟退火',
        '线性规划',
        '整数规划',
        '单纯形法',
        '遗传算法',
        '粒子群',
        '拉格朗日乘子',
        'simulated annealing',
        'gradient descent',
        'optimization',
      ],

      topics: [
        'optimization',
      ],

      capabilities:
        CALCULABLE_CAPABILITIES,

      priority: 128,
    },

    {
      kind: 'dynamical-system',
      parameterSchema:
        'dynamical-system',

      terms: [
        '动力系统',
        '洛伦兹吸引子',
        '洛伦兹系统',
        '吸引子',
        '分岔图',
        '分岔',
        '相空间',
        '混沌系统',
        '逻辑斯蒂映射',
        '传染病模型',
        'sir模型',
        'lorenz attractor',
        'bifurcation',
        'dynamical system',
      ],

      topics: [
        'dynamical-system',
      ],

      capabilities:
        VISUAL_CAPABILITIES,

      priority: 126,
    },

    {
      kind: 'topology',
      parameterSchema: 'topology',

      terms: [
        '拓扑学',
        '拓扑空间',
        '纽结理论',
        '莫比乌斯带',
        '欧拉示性数',
        '同伦',
        '同胚',
        '基本群',
        'knot theory',
        'topology',
        'mobius',
      ],

      topics: [
        'topology',
      ],

      capabilities:
        VISUAL_CAPABILITIES,

      priority: 124,
    },

    {
      kind: 'linear-algebra',
      parameterSchema: 'matrix',

      terms: [
        '线性代数',
        '矩阵',
        '向量空间',
        '特征值',
        '特征向量',
        '矩阵分解',
        '奇异值',
        '行列式',
        '主成分分析',
        'lu分解',
        'qr分解',
        'svd',
        'pca',
      ],

      topics: [
        'linear-algebra',
      ],

      capabilities:
        CALCULABLE_CAPABILITIES,

      priority: 120,
    },

    {
      kind: 'probability-statistics',
      parameterSchema:
        'probability-distribution',

      terms: [
        '概率',
        '统计',
        '概率分布',
        '正态分布',
        '二项分布',
        '泊松分布',
        '随机变量',
        '期望',
        '方差',
        '标准差',
        '回归分析',
        '贝叶斯',
        '置信区间',
        '假设检验',
        '马尔可夫链',
        '渗流模型',
        'markov chain',
        'probability',
        'statistics',
        'percolation',
      ],

      topics: [
        'probability',
        'statistics',
      ],

      capabilities:
        CALCULABLE_CAPABILITIES,

      priority: 115,
    },

    {
      kind: 'number-theory',
      parameterSchema:
        'number-theory',

      terms: [
        '数论',
        '素数',
        '素数与合数',
        '质数与合数',
        '合数判定',
        '合数分解',
        '质数',
        '奇偶数',
        '整除',
        '同余',
        '模运算',
        '进制转换',
        '罗马数字',
        '完全数',
        '亲和数',
        '考拉兹猜想',
        '欧几里得算法',
        '最大公约数',
        '最小公倍数',
        '质因数分解',
        'prime number',
        'modular arithmetic',
        'collatz',
        'number bases',
      ],

      topics: [
        'number-theory',
      ],

      capabilities:
        CALCULABLE_CAPABILITIES,

      priority: 112,
    },

    {
      kind: 'discrete-math',
      parameterSchema:
        'combinatorics',

      terms: [
        '离散数学',
        '集合论',
        '集合运算',
        '命题逻辑',
        '布尔代数',
        '排列组合',
        '组合数学',
        '图论',
        '鸽巢原理',
        '汉诺塔',
        '幻方',
        '博弈论',
        '真值表',
        '递归问题',
        'tower of hanoi',
        'pigeonhole',
        'magic square',
        'game theory',
        'graph theory',
      ],

      topics: [
        'discrete',
        'combinatorics',
        'logic',
      ],

      capabilities:
        CALCULABLE_CAPABILITIES,

      priority: 110,
    },

    {
      kind: 'algebra',
      parameterSchema:
        'algebra-equation',

      terms: [
        '一元一次方程',
        '二元一次方程',
        '方程组',
        '不等式',
        '代数式',
        '因式分解',
        '恒等式',
        '指数与对数',
        '指数方程',
        '对数方程',
        '多项式运算',
        '复数运算',
        'linear system',
        'inequalities',
        'exponential log',
      ],

      topics: [
        'algebra',
      ],

      capabilities:
        CALCULABLE_CAPABILITIES,

      priority: 108,
    },

    {
      kind: 'sequence-series',
      parameterSchema:
        'sequence-series',

      terms: [
        '数列',
        '级数',
        '泰勒级数',
        '傅里叶级数',
        '幂级数',
        '部分和',
        '级数收敛',
        '级数发散',
        '斐波那契数列',
        '递推数列',
        'power series',
        'taylor series',
        'fourier series',
        'fibonacci',
      ],

      topics: [
        'sequence',
        'series',
      ],

      capabilities:
        CALCULABLE_CAPABILITIES,

      priority: 105,
    },

    {
      kind: 'simulation',
      parameterSchema: 'simulation',

      terms: [
        '蒙特卡洛',
        '随机模拟',
        '随机投点',
        '模拟实验',
        '元胞自动机',
        '粒子模拟',
        '随机游走',
        '布朗运动',
        '分形',
        '曼德博',
        '朱利亚集',
        'n体引力仿真',
        '计算机仿真',
        'monte carlo',
        'cellular automata',
        'random walk',
        'brownian motion',
        'mandelbrot',
        'julia set',
        'nbody simulation',
      ],

      topics: [
        'simulation',
      ],

      capabilities:
        CALCULABLE_CAPABILITIES,

      priority: 100,
    },

    {
      kind: 'transformation',
      parameterSchema:
        'transformation',

      terms: [
        '图像变换',
        '函数变换',
        '矩阵变换',
        '几何变换',
        '平移变换',
        '旋转变换',
        '缩放变换',
        '伸缩变换',
        '翻折变换',
        '仿射变换',
        '投影变换',
      ],

      topics: [
        'transformation',
      ],

      capabilities:
        VISUAL_CAPABILITIES,

      priority: 95,
    },

    {
      kind: 'calculus-concept',
      parameterSchema: 'function',

      terms: [
        '微积分',
        '导数',
        '偏导数',
        '方向导数',
        '梯度',
        '极限',
        '连续性',
        '切线',
        '变化率',
        '中值定理',
        '罗尔定理',
        '定积分',
        '散度',
        '旋度',
        '曲线积分',
        'tangent',
        'derivative',
        'limit',
        'divergence',
        'curl',
      ],

      topics: [
        'calculus',
        'analysis',
      ],

      capabilities:
        CALCULABLE_CAPABILITIES,

      priority: 90,
    },

    {
      kind: 'function-graph',
      parameterSchema: 'function',

      terms: [
        '一次函数',
        '二次函数',
        '三角函数',
        '指数函数',
        '对数函数',
        '幂函数',
        '函数图像',
        '参数方程',
        '参数曲线',
        '极坐标',
        '利萨茹',
        '玫瑰线',
        '曲线绘制',
        'linear function',
        'quadratic function',
        'trigonometric function',
        'parametric',
        'polar',
        'lissajous',
      ],

      topics: [
        'function',
      ],

      capabilities:
        CALCULABLE_CAPABILITIES,

      priority: 85,
    },

    {
      kind: 'geometry',
      parameterSchema: 'geometry',

      terms: [
        '基础几何',
        '三角形',
        '四边形',
        '多边形',
        '圆锥曲线',
        '椭圆',
        '双曲线',
        '勾股定理',
        '几何面积',
        '几何周长',
        '立体几何',
        '曲面',
        '球面几何',
        '对称之美',
        '时钟与角度',
        '黄金分割',
        '三角剖分',
        'delaunay',
        'geometry',
        'polygon',
        'conic sections',
        'golden ratio',
        'clock angles',
        'symmetry',
      ],

      topics: [
        'geometry',
      ],

      capabilities:
        CALCULABLE_CAPABILITIES,

      priority: 80,
    },

    {
      kind: 'concept',
      parameterSchema: 'none',

      terms: [
        '加减乘除',
        '基础算术',
        '分数可视化',
        '数学概念',
        '公式推导',
        '定理证明',
      ],

      topics: [],

      capabilities:
        DEFAULT_CAPABILITIES,

      priority: 50,
    },
  ]

function normalizeText(
  value: string,
): string {
  return value
    .toLowerCase()
    .replace(
      /[-_/，。！？；：、,.!?;:()[\]{}]/g,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 英文缩写或英文短语使用完整单词匹配，
 * 防止 ode 错误命中 model。
 */
function containsNormalizedTerm(
  text: string,
  term: string,
): boolean {
  if (!term) {
    return false
  }

  const isAsciiTerm =
    /^[a-z0-9 ]+$/.test(term)

  if (isAsciiTerm) {
    return (
      ` ${text} `.includes(
        ` ${term} `,
      )
    )
  }

  return text.includes(term)
}

function scoreRule(
  metadata: ExperimentCatalogMetadata,
  rule: InferenceRule,
): ExperimentInferenceCandidate {
  const title =
    normalizeText(metadata.title)

  const description =
    normalizeText(
      metadata.description,
    )

  const path =
    normalizeText(metadata.path)

  const normalizedTopics =
    metadata.topics.map(
      (topic) =>
        normalizeText(topic),
    )

  let textScore = 0
  let topicScore = 0

  const matchedSignals =
    new Set<string>()

  for (const term of rule.terms) {
    const normalizedTerm =
      normalizeText(term)

    if (!normalizedTerm) {
      continue
    }

    if (
      containsNormalizedTerm(
        title,
        normalizedTerm,
      )
    ) {
      textScore += 12

      matchedSignals.add(
        `标题:${term}`,
      )
    }

    if (
      containsNormalizedTerm(
        path,
        normalizedTerm,
      )
    ) {
      textScore += 7

      matchedSignals.add(
        `路径:${term}`,
      )
    }

    if (
      containsNormalizedTerm(
        description,
        normalizedTerm,
      )
    ) {
      textScore += 4

      matchedSignals.add(
        `描述:${term}`,
      )
    }
  }

  for (const topic of rule.topics) {
    const normalizedTopic =
      normalizeText(topic)

    if (
      normalizedTopics.includes(
        normalizedTopic,
      )
    ) {
      topicScore += 2

      matchedSignals.add(
        `主题:${topic}`,
      )
    }
  }

  return {
    kind: rule.kind,

    parameterSchema:
      rule.parameterSchema,

    score:
      textScore + topicScore,

    textScore,
    topicScore,

    matchedSignals:
      Array.from(matchedSignals),
  }
}

function calculateInferenceConfidence(
  topScore: number,
  secondScore: number,
): number {
  const scoreGap =
    topScore - secondScore

  if (
    topScore >= 18 &&
    scoreGap >= 6
  ) {
    return 0.95
  }

  if (
    topScore >= 12 &&
    scoreGap >= 4
  ) {
    return 0.85
  }

  if (
    topScore >= 8 &&
    scoreGap >= 2
  ) {
    return 0.72
  }

  if (topScore >= 4) {
    return 0.55
  }

  return 0.3
}

function getRuleByKind(
  kind: ExperimentKind,
): InferenceRule | undefined {
  return INFERENCE_RULES.find(
    (rule) =>
      rule.kind === kind,
  )
}

function extractMatchedKeywords(
  metadata: ExperimentCatalogMetadata,
  candidate: ExperimentInferenceCandidate,
): string[] {
  const keywords: string[] = []

  for (
    const signal
    of candidate.matchedSignals
  ) {
    /**
     * topics 不直接作为自然语言关键词。
     */
    if (
      signal.startsWith('主题:')
    ) {
      continue
    }

    const separatorIndex =
      signal.indexOf(':')

    const value =
      separatorIndex >= 0
        ? signal.slice(
            separatorIndex + 1,
          )
        : signal

    if (value.length <= 1) {
      continue
    }

    if (
      normalizeText(value) ===
      normalizeText(metadata.title)
    ) {
      continue
    }

    if (!keywords.includes(value)) {
      keywords.push(value)
    }

    if (keywords.length >= 12) {
      break
    }
  }

  return keywords
}

export function inferExperimentAgentMetadata(
  metadata: ExperimentCatalogMetadata,
): ExperimentAgentInferenceResult {
  const candidates =
    INFERENCE_RULES
      .map((rule) => ({
        candidate:
          scoreRule(
            metadata,
            rule,
          ),

        priority:
          rule.priority,
      }))
      .filter(
        (item) =>
          item.candidate.score > 0,
      )
      .sort((a, b) => {
        if (
          b.candidate.score !==
          a.candidate.score
        ) {
          return (
            b.candidate.score -
            a.candidate.score
          )
        }

        if (
          b.candidate.textScore !==
          a.candidate.textScore
        ) {
          return (
            b.candidate.textScore -
            a.candidate.textScore
          )
        }

        return (
          b.priority -
          a.priority
        )
      })
      .map(
        (item) =>
          item.candidate,
      )

  /**
   * topics 只能辅助评分。
   * 没有文本信号时不自动确定类别。
   */
  const qualifiedCandidates =
    candidates.filter(
      (candidate) =>
        candidate.textScore > 0,
    )

  const topCandidate =
    qualifiedCandidates[0]

  if (!topCandidate) {
    return {
      agent: {
        enabled: false,
        kind: 'concept',

        aliases: [],
        strongPhrases: [],
        keywords: [],

        capabilities:
          DEFAULT_CAPABILITIES,

        parameterSchema: 'none',
      },

      confidence: 0.3,
      candidates,
      selectedCandidate: null,
    }
  }

  const secondScore =
    qualifiedCandidates[1]
      ?.score ?? 0

  const confidence =
    calculateInferenceConfidence(
      topCandidate.score,
      secondScore,
    )
  /**
   * 只有具备文本匹配依据，
   * 并且推断置信度达到阈值的实验，
   * 才自动进入 Registry。
   */
  const enabled =
    topCandidate.textScore > 0 &&
    confidence >=
      AUTO_ENABLE_CONFIDENCE_THRESHOLD

  const selectedRule =
    getRuleByKind(
      topCandidate.kind,
    )

  return {
    agent: {
      enabled,

      kind:
        topCandidate.kind,

      aliases: [],
      strongPhrases: [],

      keywords:
        extractMatchedKeywords(
          metadata,
          topCandidate,
        ),

      capabilities:
        selectedRule
          ?.capabilities ??
        DEFAULT_CAPABILITIES,

      parameterSchema:
        topCandidate
          .parameterSchema,
    },

    confidence,
    candidates,

    selectedCandidate:
      topCandidate,
  }
}