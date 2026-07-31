import {
  normalizeQuestion,
  type MathIntent,
} from './intentClassifier.js'

import {
  EXPERIMENT_REGISTRY,
  type ExperimentRouteDefinition,
  type RoutableMathIntent,
} from './experimentRegistry.js'

export interface ExperimentMatchCandidate {
  id: string
  path: string
  title: string
  score: number
  confidence: number
  matchedSignals: string[]
  intentSupported: boolean
}

export interface ExperimentMatchResult {
  originalText: string
  normalizedText: string
  intent: MathIntent
  candidates: ExperimentMatchCandidate[]
}

interface RawExperimentScore {
  score: number
  matchedSignals: string[]
  intentSupported: boolean
}

/**
 * 当前的 confidence 是规则分数映射值，
 * 不是统计学意义上的真实概率。
 */
function scoreToConfidence(score: number): number {
  if (score >= 80) {
    return 0.95
  }

  if (score >= 55) {
    return 0.85
  }

  if (score >= 35) {
    return 0.72
  }

  if (score >= 20) {
    return 0.55
  }

  return 0.4
}

function supportsIntent(
  definition: ExperimentRouteDefinition,
  intent: MathIntent,
): boolean {
  if (intent === 'unknown') {
    return true
  }

  return definition.supportedIntents.includes(
    intent as RoutableMathIntent,
  )
}

function scoreExperiment(
  text: string,
  intent: MathIntent,
  definition: ExperimentRouteDefinition,
): RawExperimentScore {
  let score = 0
  const matchedSignals = new Set<string>()

  /**
   * 标题属于高可信信号。
   */
  if (text.includes(definition.title.toLowerCase())) {
    score += 50
    matchedSignals.add(`标题:${definition.title}`)
  }

  /**
   * 强短语通常包含较完整的数学教学表达。
   */
  for (const phrase of definition.strongPhrases) {
    if (text.includes(phrase.toLowerCase())) {
      score += 35
      matchedSignals.add(`强短语:${phrase}`)
    }
  }

  /**
   * 别名比普通关键词更可靠。
   */
  for (const alias of definition.aliases) {
    if (text.includes(alias.toLowerCase())) {
      score += 25
      matchedSignals.add(`别名:${alias}`)
    }
  }

  /**
   * 关键词只作为辅助依据。
   */
  for (const keyword of definition.keywords) {
    if (text.includes(keyword.toLowerCase())) {
      score += 6
      matchedSignals.add(`关键词:${keyword}`)
    }
  }

  const intentSupported = supportsIntent(
    definition,
    intent,
  )

  /**
   * unknown 代表第一层没有识别出操作意图，
   * 但用户可能直接输入了知识点名称。
   */
  if (intent !== 'unknown') {
    if (intentSupported) {
      score += 10
      matchedSignals.add(`支持意图:${intent}`)
    } else {
      score -= 15
      matchedSignals.add(`不支持意图:${intent}`)
    }
  }

  return {
    score: Math.max(score, 0),
    matchedSignals: Array.from(matchedSignals),
    intentSupported,
  }
}

/**
 * 根据用户问题匹配已有实验。
 *
 * 当前只返回候选，不自动跳转，也不调用 AI。
 */
export function matchExperiments(
  question: string,
  intent: MathIntent,
  limit = 3,
): ExperimentMatchResult {
  const normalizedText = normalizeQuestion(question)

  if (!normalizedText) {
    return {
      originalText: question,
      normalizedText,
      intent,
      candidates: [],
    }
  }

  const safeLimit = Math.max(1, limit)

  const candidates = EXPERIMENT_REGISTRY
    .map((definition): ExperimentMatchCandidate => {
      const result = scoreExperiment(
        normalizedText,
        intent,
        definition,
      )

      return {
        id: definition.id,
        path: definition.path,
        title: definition.title,
        score: result.score,
        confidence: scoreToConfidence(result.score),
        matchedSignals: result.matchedSignals,
        intentSupported: result.intentSupported,
      }
    })

    /**
     * 低于 12 分通常只命中了一个普通关键词，
     * 噪声较大，暂时不作为候选返回。
     */
    .filter((candidate) => candidate.score >= 12)

    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }

      return a.id.localeCompare(b.id)
    })

    .slice(0, safeLimit)

  return {
    originalText: question,
    normalizedText,
    intent,
    candidates,
  }
}