import { EXPERIMENT_MANIFEST } from '../data/experimentManifest.js'

const DEFAULT_LIMIT = 24
const MAX_LIMIT = 60

export interface ExperimentCatalogQuery {
  q?: string
  difficulty?: string
  topic?: string
  offset?: number
  limit?: number
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('zh-CN')
}

function toSafeInteger(
  value: number | undefined,
  fallback: number,
  maximum = Number.MAX_SAFE_INTEGER,
): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(Math.max(Math.trunc(value ?? fallback), 0), maximum)
}

export function listPublishedExperiments(query: ExperimentCatalogQuery = {}) {
  const keyword = normalize(query.q ?? '')
  const difficulty = normalize(query.difficulty ?? '')
  const topic = normalize(query.topic ?? '')
  const offset = toSafeInteger(query.offset, 0)
  const limit = toSafeInteger(query.limit, DEFAULT_LIMIT, MAX_LIMIT) || DEFAULT_LIMIT

  const filtered = EXPERIMENT_MANIFEST.filter((experiment) => {
    if (difficulty && normalize(experiment.difficulty) !== difficulty) {
      return false
    }

    if (topic && !experiment.topics.some((item) => normalize(item) === topic)) {
      return false
    }

    if (!keyword) return true

    const searchableText = normalize(
      [
        experiment.title,
        experiment.description,
        experiment.path,
        ...experiment.topics,
      ].join(' '),
    )

    return searchableText.includes(keyword)
  })

  const difficultyCounts = Object.fromEntries(
    [...new Set(EXPERIMENT_MANIFEST.map((item) => item.difficulty))]
      .sort()
      .map((item) => [
        item,
        EXPERIMENT_MANIFEST.filter((experiment) => experiment.difficulty === item).length,
      ]),
  )

  const topicCounts = Object.fromEntries(
    [...new Set(EXPERIMENT_MANIFEST.flatMap((item) => item.topics))]
      .sort()
      .map((item) => [
        item,
        EXPERIMENT_MANIFEST.filter((experiment) => experiment.topics.includes(item)).length,
      ]),
  )

  return {
    total: filtered.length,
    offset,
    limit,
    hasMore: offset + limit < filtered.length,
    items: filtered.slice(offset, offset + limit),
    facets: {
      difficulties: difficultyCounts,
      topics: topicCounts,
    },
  }
}
