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

const OPTIONAL_SEMANTIC_WORDS =
  /(?:相关的|对应的|其中的|一下|一个|一种|一条|一组|一些|这个|这种|这条|这些|那些|请|帮我|的)/g

function escapeRegularExpression(
  value: string,
): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  )
}

/**
 * 搜索词允许忽略空格、常见量词和助词。
 *
 * 例如：
 * “有限个点补出连续曲线”
 * 可以命中：
 * “用有限个点补出一条连续曲线”。
 */
function includesSearchTerm(
  text: string,
  searchTerm: string,
): boolean {
  const normalizedTerm =
    normalizeQuestion(searchTerm)

  if (!normalizedTerm) {
    return false
  }

  const isAsciiTerm =
    /^[a-z0-9 -]+$/.test(
      normalizedTerm,
    )

  if (isAsciiTerm) {
    const termPattern =
      escapeRegularExpression(
        normalizedTerm,
      ).replace(/\s+/g, '\\s+')

    return new RegExp(
      `(?:^|[^a-z0-9])${termPattern}(?=$|[^a-z0-9])`,
    ).test(text)
  }

  const compactText =
    text.replace(/\s+/g, '')

  const compactTerm =
    normalizedTerm.replace(/\s+/g, '')

  if (compactText.includes(compactTerm)) {
    return true
  }

  const simplifiedText =
    compactText.replace(
      OPTIONAL_SEMANTIC_WORDS,
      '',
    )

  const simplifiedTerm =
    compactTerm.replace(
      OPTIONAL_SEMANTIC_WORDS,
      '',
    )

  return (
    simplifiedTerm.length >= 4 &&
    simplifiedText.includes(
      simplifiedTerm,
    )
  )
}

/**
 * 如果一个短标题只作为更长标题的一部分出现，
 * 不把短标题视为独立标题命中。
 *
 * 用户同时明确写出两个标题时，
 * 两个标题仍然都会保留。
 */
function hasIndependentTitleMatch(
  text: string,
  definition: ExperimentRouteDefinition,
): boolean {
  const title = normalizeQuestion(
    definition.title,
  )

  if (!title || !text.includes(title)) {
    return false
  }

  const longerMatchedTitles =
    EXPERIMENT_REGISTRY
      .filter(
        (candidate) =>
          candidate.id !== definition.id,
      )
      .map((candidate) =>
        normalizeQuestion(
          candidate.title,
        ),
      )
      .filter(
        (candidateTitle) =>
          candidateTitle.length >
            title.length &&
          candidateTitle.includes(title) &&
          text.includes(candidateTitle),
      )
      .sort(
        (a, b) =>
          b.length - a.length,
      )

  if (longerMatchedTitles.length === 0) {
    return true
  }

  let textWithoutLongerTitles = text

  for (
    const longerTitle
    of longerMatchedTitles
  ) {
    textWithoutLongerTitles =
      textWithoutLongerTitles.replaceAll(
        longerTitle,
        ' ',
      )
  }

  return textWithoutLongerTitles.includes(
    title,
  )
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
  titleMatched: boolean,
): RawExperimentScore {
  let score = 0
  const matchedSignals = new Set<string>()

  /**
   * 标题属于高可信信号。
   */
  if (titleMatched) {
    score += 50
    matchedSignals.add(`标题:${definition.title}`)
  }

  /**
   * 强短语通常包含较完整的数学教学表达。
   */
  for (const phrase of definition.strongPhrases) {
    if (includesSearchTerm(text, phrase)) {
      score += 35
      matchedSignals.add(`强短语:${phrase}`)
    }
  }

  /**
   * 别名比普通关键词更可靠。
   */
  for (const alias of definition.aliases) {
    if (includesSearchTerm(text, alias)) {
      score += 25
      matchedSignals.add(`别名:${alias}`)
    }
  }

  /**
   * 关键词只作为辅助依据。
   */
  for (const keyword of definition.keywords) {
    if (includesSearchTerm(text, keyword)) {
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
      const titleMatched =
        hasIndependentTitleMatch(
          normalizedText,
          definition,
        )

      const result = scoreExperiment(
        normalizedText,
        intent,
        definition,
        titleMatched,
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
