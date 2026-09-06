import {
  normalizeQuestion,
  type MathIntent,
} from './intentClassifier.js'

import {
  EXPERIMENT_REGISTRY,
  type ExperimentRouteDefinition,
  type RoutableMathIntent,
} from './experimentRegistry.js'

import {
  analyzeQuestion,
  type QuestionAnalysisResult,
} from './questionAnalyzer.js'

import type {
  ExperimentInitialParameters,
} from './parameterExtractor.js'

import {
  inferStructuralExperimentHints,
  type StructuralExperimentHint,
} from './structuralExperimentHints.js'

import { pinyin } from 'pinyin-pro'

export const EXPERIMENT_MATCH_QUALITIES = [
  'exact',
  'strong',
  'related',
] as const

export type ExperimentMatchQuality =
  (typeof EXPERIMENT_MATCH_QUALITIES)[number]

export interface ExperimentMatchCandidate {
  id: string
  path: string
  title: string
  score: number
  confidence: number
  matchedSignals: string[]
  intentSupported: boolean
  matchQuality: ExperimentMatchQuality
  initialParameters: ExperimentInitialParameters
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
  matchQuality: ExperimentMatchQuality
}

const OPTIONAL_SEMANTIC_WORDS =
  /(?:相关的|对应的|其中的|一下|一个|一种|一条|一组|一些|这个|这种|这条|这些|那些|请|帮我|的)/g

/**
 * 这些词主要描述页面形态或用户操作，
 * 不是实验知识点本身。
 *
 * 去掉它们后，“分数”和“分数可视化”
 * 会得到相同的核心搜索词“分数”。
 */
const GENERIC_SEARCH_WORDS =
  /(?:数学|知识点|相关内容|相关|内容|概念|原理|实验页面|实验|页面|模块|可视化|动态图|动画|动态|演示|展示|模拟|打开|查找|搜索|推荐|学习|介绍|讲解|解释|计算|比较|观察|看看|想学|想看|我想|如何|怎么|怎样|什么是|请|帮我|一下)/g

const MIN_SEMANTIC_TERM_LENGTH = 2

const PINYIN_TERM_CACHE = new Map<string, string>()

function compactPinyin(value: string): string {
  const cached = PINYIN_TERM_CACHE.get(value)

  if (cached !== undefined) {
    return cached
  }

  const result = normalizeQuestion(
    pinyin(value, {
      toneType: 'none',
      separator: '',
    }),
  ).replace(/[^a-z0-9]/g, '')

  PINYIN_TERM_CACHE.set(value, result)
  return result
}

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

function compactSemanticText(
  value: string,
): string {
  return normalizeQuestion(value)
    .replace(/\s+/g, '')
    .replace(OPTIONAL_SEMANTIC_WORDS, '')
    .replace(GENERIC_SEARCH_WORDS, '')
}

function createCharacterBigrams(
  value: string,
): string[] {
  const bigrams: string[] = []

  for (let index = 0; index < value.length - 1; index += 1) {
    bigrams.push(value.slice(index, index + 2))
  }

  return bigrams
}

/**
 * 使用字符二元组 Dice 系数处理轻微错字、漏字和近似表达。
 *
 * 这里只做低权重兜底；完整标题、别名和关键词仍然拥有更高优先级。
 */
function calculateTextSimilarity(
  left: string,
  right: string,
): number {
  if (left === right) {
    return 1
  }

  if (
    left.length < MIN_SEMANTIC_TERM_LENGTH ||
    right.length < MIN_SEMANTIC_TERM_LENGTH
  ) {
    return 0
  }

  const leftBigrams = createCharacterBigrams(left)
  const rightBigrams = createCharacterBigrams(right)

  if (leftBigrams.length === 0 || rightBigrams.length === 0) {
    return 0
  }

  const remainingRightBigrams = [...rightBigrams]
  let intersections = 0

  for (const bigram of leftBigrams) {
    const matchedIndex = remainingRightBigrams.indexOf(bigram)

    if (matchedIndex < 0) {
      continue
    }

    intersections += 1
    remainingRightBigrams.splice(matchedIndex, 1)
  }

  return (
    (2 * intersections) /
    (leftBigrams.length + rightBigrams.length)
  )
}

interface SemanticTermScore {
  score: number
  signal: string | null
}

/**
 * 当规则没有完整命中时，比较用户问题与实验名称、别名和关键词的
 * 核心文本，为“意思接近但写法不完全一致”的输入提供候选。
 */
function scoreSemanticTerms(
  queryTexts: readonly string[],
  originalText: string,
  definition: ExperimentRouteDefinition,
): SemanticTermScore {
  const queryCores = Array.from(
    new Set(
      queryTexts
        .map(compactSemanticText)
        .filter(
          (queryCore) =>
            queryCore.length >=
              MIN_SEMANTIC_TERM_LENGTH,
        ),
    ),
  )

  if (
    queryCores.length === 0 ||
    isShadowedByLongerTitle(
      originalText,
      definition,
    )
  ) {
    return { score: 0, signal: null }
  }

  const semanticTerms = definition.semanticEnabled
    ? [
        ...definition.aliases.map((value) => ({
          label: '相近别名',
          value,
          exactScore: 28,
        })),
        ...definition.keywords.map((value) => ({
          label: '相近关键词',
          value,
          exactScore: 18,
        })),
      ]
    : []

  const terms = [
    {
      label: '核心标题',
      value: definition.title,
      exactScore: 35,
    },
    ...semanticTerms,
  ]

  let best: SemanticTermScore = {
    score: 0,
    signal: null,
  }

  for (const term of terms) {
    const termCore = compactSemanticText(term.value)

    if (termCore.length < MIN_SEMANTIC_TERM_LENGTH) {
      continue
    }

    for (const queryCore of queryCores) {
      let score = 0

      const asciiQuery = /^[a-z0-9]+$/.test(queryCore)
      const termPinyin = asciiQuery
        ? compactPinyin(term.value)
        : ''

      if (
        asciiQuery &&
        queryCore.length >= 4 &&
        queryCore === termPinyin
      ) {
        // 拼音只负责召回候选，不获得标题/别名的高置信分。
        score = 16
      } else if (queryCore === termCore) {
        score = term.exactScore
      } else if (queryCore.includes(termCore)) {
        const containmentRatio =
          termCore.length / queryCore.length

        score = Math.round(14 + containmentRatio * 12)
      } else if (
        termCore.includes(queryCore) &&
        (
          term.label === '核心标题' ||
          queryCore.length >= 3
        )
      ) {
        const containmentRatio =
          queryCore.length / termCore.length

        if (containmentRatio >= 0.5) {
          score = Math.round(14 + containmentRatio * 12)
        }
      } else {
        const similarity = calculateTextSimilarity(
          queryCore,
          termCore,
        )

        if (
          Math.min(queryCore.length, termCore.length) >= 3 &&
          similarity >= 0.58
        ) {
          score = Math.round(8 + similarity * 12)
        }
      }

      if (score > best.score) {
        best = {
          score,
          signal: `${term.label}:${term.value}`,
        }
      }
    }
  }

  return best
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
 * “偏微分方程”已经完整命中时，不再把其中的“微分方程”
 * 作为独立的相近候选；快速傅里叶变换与傅里叶变换同理。
 */
function isShadowedByLongerTitle(
  text: string,
  definition: ExperimentRouteDefinition,
): boolean {
  const title = normalizeQuestion(
    definition.title,
  )

  if (!title || !text.includes(title)) {
    return false
  }

  return !hasIndependentTitleMatch(
    text,
    definition,
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
  semanticTexts: readonly string[],
  intent: MathIntent,
  definition: ExperimentRouteDefinition,
  titleMatched: boolean,
  structuralHint: StructuralExperimentHint | undefined,
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

  if (definition.semanticEnabled) {
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
  }

  if (structuralHint) {
    score += structuralHint.score
    matchedSignals.add(structuralHint.signal)
  }

  /**
   * 已有高精度信号时不再叠加相似度分，
   * 避免标题或别名被重复计分。
   */
  const highPrecisionMatched =
    titleMatched ||
    structuralHint !== undefined ||
    Array.from(matchedSignals).some(
      (signal) =>
        signal.startsWith('强短语:') ||
        signal.startsWith('别名:'),
    )

  const semanticTermScore = highPrecisionMatched
    ? { score: 0, signal: null }
    : scoreSemanticTerms(
        semanticTexts,
        text,
        definition,
      )

  if (
    semanticTermScore.score > 0 &&
    semanticTermScore.signal
  ) {
    score += semanticTermScore.score
    matchedSignals.add(semanticTermScore.signal)
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
    matchQuality:
      titleMatched
        ? 'exact'
        : highPrecisionMatched
          ? 'strong'
          : 'related',
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
  questionAnalysis:
    QuestionAnalysisResult =
      analyzeQuestion(question),
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

  const semanticTexts = [
    questionAnalysis.knowledgeText,
    ...questionAnalysis.knowledgeTerms,
  ].filter(Boolean)

  const structuralHints =
    inferStructuralExperimentHints(question)

  const candidates = EXPERIMENT_REGISTRY
    .map((definition): ExperimentMatchCandidate => {
      const titleMatched =
        hasIndependentTitleMatch(
          normalizedText,
          definition,
        )

      const result = scoreExperiment(
        normalizedText,
        semanticTexts,
        intent,
        definition,
        titleMatched,
        structuralHints.get(definition.id),
      )

      return {
        id: definition.id,
        path: definition.path,
        title: definition.title,
        score: result.score,
        confidence: scoreToConfidence(result.score),
        matchedSignals: result.matchedSignals,
        intentSupported: result.intentSupported,
        matchQuality: result.matchQuality,
        initialParameters: {},
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

      const qualityPriority:
        Record<ExperimentMatchQuality, number> = {
          exact: 3,
          strong: 2,
          related: 1,
        }

      if (
        qualityPriority[b.matchQuality] !==
        qualityPriority[a.matchQuality]
      ) {
        return (
          qualityPriority[b.matchQuality] -
          qualityPriority[a.matchQuality]
        )
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
