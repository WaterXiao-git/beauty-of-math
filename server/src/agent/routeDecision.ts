import {
  classifyIntent,
  type IntentClassificationResult,
} from './intentClassifier.js'

import type {
  ExperimentMatchCandidate,
} from './experimentMatcher.js'

export const ROUTE_DECISIONS = [
  'direct',
  'suggest',
  'ai',
  'no-match',
] as const

export type RouteDecision =
  (typeof ROUTE_DECISIONS)[number]

export const ROUTE_DECISION_REASONS = [
  'clear-route',
  'clear-experiment-unclear-intent',
  'mixed-intent',
  'ambiguous-experiment',
  'intent-without-experiment',
  'no-experiment-candidate',
  'ai-enhanced-suggestion',
  'ai-clarification',
  'ai-confirmed-no-match',
] as const

export type RouteDecisionReason =
  (typeof ROUTE_DECISION_REASONS)[number]

export interface RouteDecisionResult {
  decision: RouteDecision
  reason: RouteDecisionReason
  message: string

  /**
   * 当前得分最高的实验。
   *
   * no-match 时为 null。
   */
  target: ExperimentMatchCandidate | null

  /**
   * 除第一名之外的候选实验。
   */
  alternatives: ExperimentMatchCandidate[]

  /**
   * 第一名与第二名的分数差。
   * 用于判断实验候选是否足够明确。
   */
  scoreGap: number
}

const MIN_CLEAR_INTENT_CONFIDENCE = 0.7
const MIN_CLEAR_EXPERIMENT_CONFIDENCE = 0.72
const MIN_CLEAR_EXPERIMENT_SCORE_GAP = 15

function escapeRegularExpression(
  value: string,
): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  )
}

/**
 * 实验标题描述的是知识点，
 * 不应该被当作用户额外提出的操作意图。
 *
 * 仅在匹配器明确命中完整标题时移除标题，
 * 用户在标题之外写出的“解释”“比较”等意图仍会保留。
 */
export function refineIntentForMatchedExperiment(
  intent: IntentClassificationResult,
  target: ExperimentMatchCandidate | null,
): IntentClassificationResult {
  if (
    !target ||
    !target.matchedSignals.includes(
      `标题:${target.title}`,
    )
  ) {
    return intent
  }

  const titlePattern = new RegExp(
    escapeRegularExpression(
      target.title,
    ),
    'gi',
  )

  const textWithoutTitle =
    intent.originalText.replace(
      titlePattern,
      ' ',
    )

  const refinedIntent = classifyIntent(
    textWithoutTitle,
  )

  return {
    ...refinedIntent,
    originalText: intent.originalText,
    normalizedText: intent.normalizedText,
  }
}

/**
 * 判断第一层是否检测到了复合意图。
 *
 * score >= 4 代表至少命中了一个强意图表达。
 */
function hasMixedIntent(
  intent: IntentClassificationResult,
): boolean {
  const strongIntentCandidates =
    intent.candidates.filter(
      (candidate) => candidate.score >= 4,
    )

  return strongIntentCandidates.length >= 2
}

/**
 * 判断操作意图是否足够明确。
 */
function isIntentClear(
  intent: IntentClassificationResult,
): boolean {
  return (
    intent.primaryIntent !== 'unknown' &&
    !intent.needsAI &&
    intent.confidence >= MIN_CLEAR_INTENT_CONFIDENCE
  )
}

/**
 * 路由决策层。
 *
 * 决策顺序：
 *
 * 1. 没有实验候选
 * 2. 是否为复合意图
 * 3. 实验候选是否明确
 * 4. 操作意图是否明确
 */
export function decideRoute(
  intent: IntentClassificationResult,
  experiments: ExperimentMatchCandidate[],
): RouteDecisionResult {
  const target = experiments[0] ?? null
  const alternatives = experiments.slice(1)
  const effectiveIntent =
    refineIntentForMatchedExperiment(
      intent,
      target,
    )

  /**
   * 完全没有实验候选。
   */
  if (!target) {
    /**
     * 已经识别出操作意图，但不知道要操作哪个实验。
     *
     * 例如：
     * “请动态展示一下”
     *
     * 此时可以交给 AI 或追问用户。
     */
    if (
      effectiveIntent.primaryIntent !==
      'unknown'
    ) {
      return {
        decision: 'ai',
        reason: 'intent-without-experiment',
        message: '已识别用户意图，但未确定对应实验。',
        target: null,
        alternatives: [],
        scoreGap: 0,
      }
    }

    /**
     * 操作意图和实验模块都无法识别。
     *
     * 例如：
     * “今天天气怎么样”
     */
    return {
      decision: 'no-match',
      reason: 'no-experiment-candidate',
      message: '未匹配到相关数学实验。',
      target: null,
      alternatives: [],
      scoreGap: 0,
    }
  }

  const secondScore = experiments[1]?.score ?? 0
  const scoreGap = target.score - secondScore

  /**
   * 用户同时提出两个强操作意图。
   *
   * 例如：
   * “画出函数并解释为什么它连续”
   */
  if (hasMixedIntent(effectiveIntent)) {
    return {
      decision: 'ai',
      reason: 'mixed-intent',
      message: '检测到多个操作意图，需要进一步拆分。',
      target,
      alternatives,
      scoreGap,
    }
  }

  const experimentIsClear =
    target.confidence >=
      MIN_CLEAR_EXPERIMENT_CONFIDENCE &&
    scoreGap >= MIN_CLEAR_EXPERIMENT_SCORE_GAP

  /**
   * 存在实验候选，但是第一名不够明确。
   */
  if (!experimentIsClear) {
    return {
      decision: 'suggest',
      reason: 'ambiguous-experiment',
      message: '未找到完全一致的实验，已按相近含义为你推荐候选。',
      target,
      alternatives,
      scoreGap,
    }
  }

  /**
   * 核心词和文本相似度只用于推荐候选。
   * 只有完整标题、强短语或明确别名命中才允许自动跳转。
   */
  if (target.matchQuality === 'related') {
    return {
      decision: 'suggest',
      reason: 'ambiguous-experiment',
      message: '已找到含义相近的实验，请确认后再进入。',
      target,
      alternatives,
      scoreGap,
    }
  }

  /**
   * 实验明确，操作意图也明确。
   *
   * 可以直接执行页面路由。
   */
  if (isIntentClear(effectiveIntent)) {
    return {
      decision: 'direct',
      reason: 'clear-route',
      message: '操作意图和实验模块均已明确。',
      target,
      alternatives,
      scoreGap,
    }
  }

  /**
   * 实验明确，但是用户没有说明具体操作。
   *
   * 例如只输入：
   * “黎曼和”
   *
   * 此时应展示实验卡片，而不是直接调用 AI。
   */
  return {
    decision: 'suggest',
    reason: 'clear-experiment-unclear-intent',
    message: '实验模块已确定，但用户操作意图尚不明确。',
    target,
    alternatives,
    scoreGap,
  }
}
