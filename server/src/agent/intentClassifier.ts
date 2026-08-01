export const MATH_INTENTS = [
  'visualize',
  'explain',
  'calculate',
  'compare',
  'find-experiment',
  'unknown',
] as const

export type MathIntent = (typeof MATH_INTENTS)[number]

type KnownMathIntent = Exclude<MathIntent, 'unknown'>

interface StrongPattern {
  label: string
  pattern: RegExp
}

interface IntentRule {
  intent: KnownMathIntent
  strongPatterns: StrongPattern[]
  keywords: string[]
}

export interface IntentCandidate {
  intent: KnownMathIntent
  score: number
  matchedSignals: string[]
}

export interface IntentClassificationResult {
  originalText: string
  normalizedText: string
  primaryIntent: MathIntent
  confidence: number
  needsAI: boolean
  candidates: IntentCandidate[]
}

/**
 * 各类用户意图的规则。
 *
 * strongPatterns：
 * 明确表达用户意图的短语，每命中一个计 4 分。
 *
 * keywords：
 * 辅助判断的普通关键词，每命中一个计 1 分。
 */
const INTENT_RULES: IntentRule[] = [
  {
    intent: 'visualize',
    strongPatterns: [
      {
        label: '可视化',
        pattern: /可视化/,
      },
      {
        label: '动态演示',
        pattern: /动态(?:演示|展示)/,
      },
      {
        label: '画出',
        pattern: /画出/,
      },
      {
        label: '绘制',
        pattern: /绘制/,
      },
      {
        label: '作图',
        pattern: /作图/,
      },
      {
        label: '演示',
        pattern: /演示(?:一下)?/,
      },
      {
        label: '展示',
        pattern: /展示(?:一下)?/,
      },
      {
        label: '模拟',
        pattern: /模拟(?:一下)?/,
      },
      {
        label: '展示图像',
        pattern: /展示.{0,8}(?:图像|图形|曲线|曲面|变化过程)/,
      },
      {
        label: '观察变化',
        pattern: /观察.{0,24}(?:变化|过程|趋势|逼近|接近)/,
      },
    ],
    keywords: [
      '图像',
      '图形',
      '曲线',
      '曲面',
      '动画',
      '画图',
      '坐标系',
      '动态图',
    ],
  },

  {
    intent: 'explain',
    strongPatterns: [
      {
        label: '为什么',
        pattern: /为什么/,
      },
      {
        label: '什么是',
        pattern: /什么是/,
      },
      {
        label: '怎么理解',
        pattern: /怎么理解/,
      },
      {
        label: '如何理解',
        pattern: /如何理解/,
      },
      {
        label: '请解释',
        pattern: /(?:请|帮我)?解释(?:一下)?/,
      },
      {
        label: '原理是什么',
        pattern: /原理(?:是什么|是怎样的)?/,
      },
      {
        label: '几何意义',
        pattern: /几何意义/,
      },
      {
        label: '物理意义',
        pattern: /物理意义/,
      },
      {
        label: '推导',
        pattern: /推导(?:一下|过程)?/,
      },
      {
        label: '证明',
        pattern: /证明(?:一下|过程)?/,
      },
    ],
    keywords: [
      '原理',
      '意义',
      '概念',
      '定义',
      '原因',
      '理解',
      '本质',
    ],
  },

  {
    intent: 'calculate',
    strongPatterns: [
      {
        label: '计算一下',
        pattern: /计算(?:一下)?/,
      },
      {
        label: '求出',
        pattern: /求出/,
      },
      {
        label: '求解',
        pattern: /求解/,
      },
      {
        label: '结果是多少',
        pattern: /结果(?:是|为)?多少/,
      },
      {
        label: '等于多少',
        pattern: /等于多少/,
      },
      {
        label: '算一下',
        pattern: /(?:^|[^计运])算(?:一下)?(?!法)/,
      },
      {
        label: '求导',
        pattern: /求导/,
      },
      {
        label: '求积分',
        pattern: /求(?:定|不定)?积分/,
      },
      {
        label: '解方程',
        pattern: /解.{0,8}方程/,
      },
    ],
    keywords: [
      '计算',
      '求值',
      '结果',
      '答案',
      '数值',
    ],
  },

  {
    intent: 'compare',
    strongPatterns: [
      {
        label: '有什么区别',
        pattern: /有(?:什么|何)区别/,
      },
      {
        label: '比较一下',
        pattern: /比较(?:一下)?/,
      },
      {
        label: '对比一下',
        pattern: /对比(?:一下)?/,
      },
      {
        label: '异同',
        pattern: /异同/,
      },
      {
        label: '哪个更',
        pattern: /哪个更/,
      },
      {
        label: '分别有什么',
        pattern: /分别有(?:什么|何)/,
      },
    ],
    keywords: [
      '比较',
      '对比',
      '区别',
      '差异',
      '不同',
    ],
  },

  {
    intent: 'find-experiment',
    strongPatterns: [
      {
        label: '打开实验',
        pattern: /打开.{0,12}(?:实验|模块|页面)/,
      },
      {
        label: '进入实验',
        pattern: /进入.{0,12}(?:实验|模块|页面)/,
      },
      {
        label: '跳转到实验',
        pattern: /跳转到?.{0,12}(?:实验|模块|页面)/,
      },
      {
        label: '查找实验',
        pattern: /(?:找到|查找|搜索).{0,12}(?:实验|模块|页面)/,
      },
      {
        label: '哪个实验',
        pattern: /哪个.{0,8}(?:实验|模块|页面)/,
      },
      {
        label: '有没有实验',
        pattern: /有没有.{0,12}(?:实验|模块|页面)/,
      },
      {
        label: '推荐实验',
        pattern: /推荐.{0,12}(?:实验|模块|页面)/,
      },
    ],
    keywords: [
      '打开',
      '进入',
      '跳转',
      '实验页面',
      '模块页面',
      '实验模块',
    ],
  },
]

/**
 * 多个意图分数相同时的排序优先级。
 *
 * 这只是平分时的兜底规则，不会覆盖实际得分。
 */
const INTENT_PRIORITY: Record<KnownMathIntent, number> = {
  compare: 5,
  visualize: 4,
  calculate: 3,
  explain: 2,
  'find-experiment': 1,
}

/**
 * 对用户问题执行轻量文本规范化。
 *
 * 保留：
 * - 数字
 * - 数学表达式
 * - + - * / ^ =
 * - 括号
 *
 * 删除或替换：
 * - 常见中英文标点
 * - 多余空格
 */
export function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .replace(/[，。！？；：、,.!?;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 根据规则计算一个意图的分数。
 *
 * 明确短语命中：4 分
 * 普通关键词命中：1 分
 */
function scoreIntent(
  text: string,
  rule: IntentRule,
): IntentCandidate {
  let score = 0
  const matchedSignals = new Set<string>()

  for (const item of rule.strongPatterns) {
    if (item.pattern.test(text)) {
      score += 4
      matchedSignals.add(item.label)
    }
  }

  for (const keyword of rule.keywords) {
    if (text.includes(keyword)) {
      score += 1
      matchedSignals.add(keyword)
    }
  }

  return {
    intent: rule.intent,
    score,
    matchedSignals: Array.from(matchedSignals),
  }
}

/**
 * 根据最高分和第二名分数计算基础置信度。
 */
function calculateConfidence(
  topScore: number,
  secondScore: number,
): number {
  const margin = topScore - secondScore

  if (topScore >= 8 && margin >= 3) {
    return 0.95
  }

  if (topScore >= 5 && margin >= 2) {
    return 0.85
  }

  if (topScore >= 3 && margin >= 1) {
    return 0.72
  }

  if (topScore > 0 && margin === 0) {
    return 0.45
  }

  if (topScore > 0) {
    return 0.55
  }

  return 0
}

/**
 * 第一阶段数学问题意图识别器。
 *
 * 当前负责：
 * 1. 文本规范化
 * 2. 规则匹配
 * 3. 意图评分
 * 4. 主意图选择
 * 5. 混合意图检测
 * 6. 标记是否需要 AI 再判断
 *
 * 当前不负责：
 * 1. 具体实验模块匹配
 * 2. 数学知识点提取
 * 3. 函数、区间等参数提取
 * 4. 实际调用 AI
 */
export function classifyIntent(
  question: string,
): IntentClassificationResult {
  const originalText = question
  const normalizedText = normalizeQuestion(question)

  if (!normalizedText) {
    return {
      originalText,
      normalizedText,
      primaryIntent: 'unknown',
      confidence: 0,
      needsAI: true,
      candidates: [],
    }
  }

  const candidates = INTENT_RULES
    .map((rule) => scoreIntent(normalizedText, rule))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }

      return (
        INTENT_PRIORITY[b.intent] -
        INTENT_PRIORITY[a.intent]
      )
    })

  if (candidates.length === 0) {
    return {
      originalText,
      normalizedText,
      primaryIntent: 'unknown',
      confidence: 0,
      needsAI: true,
      candidates: [],
    }
  }

  const topCandidate = candidates[0]
  const secondCandidate = candidates[1]
  const secondScore = secondCandidate?.score ?? 0

  const rawConfidence = calculateConfidence(
    topCandidate.score,
    secondScore,
  )

  /**
   * 得分达到 4，说明至少命中了一个明确的强意图表达。
   *
   * 例如：
   * “画出这个函数并解释为什么它连续”
   *
   * 会同时命中：
   * - visualize
   * - explain
   *
   * 此时不应该把问题当作普通单意图高置信度问题。
   */
  const strongCandidates = candidates.filter(
    (candidate) => candidate.score >= 4,
  )

  const isMultiIntent = strongCandidates.length >= 2

  /**
   * 复合意图情况下限制单一主意图置信度。
   */
  const confidence = isMultiIntent
    ? Math.min(rawConfidence, 0.65)
    : rawConfidence

  return {
    originalText,
    normalizedText,
    primaryIntent: topCandidate.intent,
    confidence,
    needsAI: isMultiIntent || confidence < 0.7,
    candidates,
  }
}
