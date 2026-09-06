import {
  EXPERIMENT_REGISTRY,
  type RoutableMathIntent,
} from './experimentRegistry.js'

import type {
  ExperimentMatchCandidate,
  ExperimentMatchQuality,
} from './experimentMatcher.js'

import {
  routeQuestion,
  type QuestionRouteResult,
} from './questionRouter.js'

import { decideRoute } from './routeDecision.js'

import { loadEmbeddingConfig, loadEmbeddingCacheDirectory } from './embedding/config.js'

import {
  EmbeddingExperimentRetriever,
  type ExperimentSemanticRetriever,
  type SemanticExperimentMatch,
} from './embedding/experimentSemanticRetriever.js'

import { QwenEmbeddingClient } from './embedding/qwenEmbeddingClient.js'

let defaultRetriever: EmbeddingExperimentRetriever | null = null

function getDefaultRetriever(): EmbeddingExperimentRetriever | null {
  const config = loadEmbeddingConfig()
  if (!config.enabled) {
    defaultRetriever = null
    return null
  }
  if (!defaultRetriever) {
    defaultRetriever = new EmbeddingExperimentRetriever(
      new QwenEmbeddingClient(config),
      EXPERIMENT_REGISTRY,
      {
        cache: {
          directory: loadEmbeddingCacheDirectory(),
          model: config.model,
          baseURL: config.baseURL,
          dimensions: config.dimensions,
        },
      },
    )
  }

  return defaultRetriever
}

export async function warmSemanticIndex(): Promise<void> {
  await getDefaultRetriever()?.warmup()
}

export function getSemanticIndexStatus() {
  return getDefaultRetriever()?.getStatus() ?? {
    state: 'disabled', indexedCount: 0, totalCount: EXPERIMENT_REGISTRY.length,
    reusedCount: 0, persistent: false,
  }
}

function semanticScore(similarity: number): number {
  return Math.round(14 + similarity * 24)
}

function semanticConfidence(similarity: number): number {
  return Math.min(0.78, 0.45 + similarity * 0.35)
}

function mergeCandidates(
  base: QuestionRouteResult,
  semanticMatches: readonly SemanticExperimentMatch[],
): ExperimentMatchCandidate[] {
  const definitions = new Map(
    EXPERIMENT_REGISTRY.map(
      (definition) => [definition.id, definition],
    ),
  )
  const candidates = new Map(
    base.experiments.map(
      (candidate) => [candidate.id, candidate],
    ),
  )

  for (const match of semanticMatches) {
    const definition = definitions.get(match.id)

    if (!definition) {
      continue
    }

    const signal = `语义向量:${match.similarity.toFixed(3)}`
    const existing = candidates.get(match.id)

    if (existing) {
      candidates.set(match.id, {
        ...existing,
        score:
          existing.score +
          Math.round(match.similarity * 12),
        confidence: Math.max(
          existing.confidence,
          semanticConfidence(match.similarity),
        ),
        matchedSignals: Array.from(
          new Set([...existing.matchedSignals, signal]),
        ),
      })
      continue
    }

    const intentSupported =
      base.intent.primaryIntent === 'unknown' ||
      definition.supportedIntents.includes(
        base.intent.primaryIntent as RoutableMathIntent,
      )

    candidates.set(match.id, {
      id: definition.id,
      path: definition.path,
      title: definition.title,
      score: semanticScore(match.similarity),
      confidence: semanticConfidence(match.similarity),
      matchedSignals: [signal],
      intentSupported,
      matchQuality: 'related',
      initialParameters: {},
    })
  }

  const qualityPriority:
    Record<ExperimentMatchQuality, number> = {
      exact: 3,
      strong: 2,
      related: 1,
    }

  return Array.from(candidates.values())
    .sort((left, right) =>
      right.score - left.score ||
      qualityPriority[right.matchQuality] -
        qualityPriority[left.matchQuality] ||
      left.id.localeCompare(right.id),
    )
    .slice(0, 3)
}

/**
 * 在现有规则路由之后补充语义候选。
 * 向量结果永远标记为 related，只能推荐或交给 AI 复核，不能自动跳转。
 */
export async function routeQuestionWithSemanticSearch(
  question: string,
  retriever:
    ExperimentSemanticRetriever | null = getDefaultRetriever(),
): Promise<QuestionRouteResult> {
  const base = routeQuestion(question)

  if (
    !retriever ||
    !question.trim() ||
    (
      base.routeDecision.decision === 'direct' &&
      base.routeDecision.target?.matchQuality !== 'related'
    )
  ) {
    return base
  }

  try {
    const semanticMatches = await retriever.retrieve(question, 6)
    const experiments = mergeCandidates(base, semanticMatches)

    return {
      ...base,
      experiments,
      routeDecision: decideRoute(
        base.intent,
        experiments,
      ),
    }
  } catch {
    return base
  }
}
