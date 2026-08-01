import {
  GENERATED_EXPERIMENT_CATALOG,
} from '../src/agent/manifests/generatedExperimentCatalog.js'

import {
  CORE_EXPERIMENT_MANIFESTS,
} from '../src/agent/manifests/coreExperimentManifests.js'

import {
  inferExperimentAgentMetadata,
} from '../src/agent/manifests/inferAgentMetadata.js'

import type {
  ExperimentInferenceCandidate,
} from '../src/agent/manifests/inferAgentMetadata.js'

/**
 * 已经由人工配置覆盖的核心实验路径。
 */
const corePaths = new Set(
  CORE_EXPERIMENT_MANIFESTS.map(
    (manifest) =>
      manifest.path,
  ),
)

/**
 * 从所有候选中取得第二个有效文本候选。
 */
function findSecondQualifiedCandidate(
  candidates:
    readonly ExperimentInferenceCandidate[],
  selected:
    ExperimentInferenceCandidate | null,
): ExperimentInferenceCandidate | null {
  const qualifiedCandidates =
    candidates.filter(
      (candidate) =>
        candidate.textScore > 0 &&
        candidate !== selected,
    )

  return (
    qualifiedCandidates[0] ??
    null
  )
}

const inferredRows =
  GENERATED_EXPERIMENT_CATALOG
    .filter(
      (experiment) =>
        !corePaths.has(
          experiment.path,
        ),
    )
    .map((experiment) => {
      const result =
        inferExperimentAgentMetadata(
          experiment,
        )

      const selected =
        result.selectedCandidate

      const secondCandidate =
        findSecondQualifiedCandidate(
          result.candidates,
          selected,
        )

      const topScore =
        selected?.score ?? 0

      const secondScore =
        secondCandidate?.score ?? 0

      const scoreGap =
        selected
          ? topScore - secondScore
          : 0

      return {
        id:
          experiment.id,

        title:
          experiment.title,

        path:
          experiment.path,

        kind:
          result.agent.kind,

        schema:
          result.agent
            .parameterSchema,

        confidence:
          result.confidence,

        selected:
          selected !== null,

        topScore,

        textScore:
          selected?.textScore ?? 0,

        topicScore:
          selected?.topicScore ?? 0,

        secondScore,

        scoreGap,

        needsReview:
          !selected ||
          result.confidence < 0.72 ||
          scoreGap < 3,
      }
    })

/**
 * 统计每个 ExperimentKind 的数量。
 */
const kindCounts =
  new Map<string, number>()

for (const row of inferredRows) {
  kindCounts.set(
    row.kind,
    (
      kindCounts.get(
        row.kind,
      ) ?? 0
    ) + 1,
  )
}

/**
 * 统计置信度分布。
 */
const confidenceCounts = {
  high:
    inferredRows.filter(
      (row) =>
        row.confidence >= 0.85,
    ).length,

  medium:
    inferredRows.filter(
      (row) =>
        row.confidence >= 0.72 &&
        row.confidence < 0.85,
    ).length,

  low:
    inferredRows.filter(
      (row) =>
        row.confidence < 0.72,
    ).length,
}

const selectedCount =
  inferredRows.filter(
    (row) => row.selected,
  ).length

const unresolvedCount =
  inferredRows.filter(
    (row) => !row.selected,
  ).length

const reviewCount =
  inferredRows.filter(
    (row) => row.needsReview,
  ).length

console.log(
  '\n=== Manifest 自动分类统计 ===',
)

console.log({
  total:
    GENERATED_EXPERIMENT_CATALOG
      .length,

  coreEnabled:
    CORE_EXPERIMENT_MANIFESTS
      .length,

  automaticallyInferred:
    inferredRows.length,

  selected:
    selectedCount,

  unresolved:
    unresolvedCount,

  needsReview:
    reviewCount,

  ...confidenceCounts,
})

console.log(
  '\n=== 各 ExperimentKind 数量 ===',
)

console.table(
  Array.from(
    kindCounts.entries(),
  )
    .map(
      ([kind, count]) => ({
        kind,
        count,
      }),
    )
    .sort(
      (a, b) =>
        b.count - a.count,
    ),
)

/**
 * 优先检查：
 *
 * 1. 没有文本分类依据
 * 2. 置信度低
 * 3. 第一名和第二名差距过小
 */
const ambiguousRows =
  inferredRows
    .filter(
      (row) =>
        row.needsReview,
    )
    .sort((a, b) => {
      /**
       * 未选中类别的实验排在最前面。
       */
      if (
        a.selected !== b.selected
      ) {
        return a.selected
          ? 1
          : -1
      }

      /**
       * 然后按置信度从低到高。
       */
      if (
        a.confidence !==
        b.confidence
      ) {
        return (
          a.confidence -
          b.confidence
        )
      }

      /**
       * 最后按分差从小到大。
       */
      return (
        a.scoreGap -
        b.scoreGap
      )
    })
    .slice(0, 30)

console.log(
  '\n=== 优先人工检查的前 30 个实验 ===',
)

console.table(
  ambiguousRows,
)

/**
 * 额外输出高置信度候选，
 * 方便后续选择首批可以启用的实验。
 */
const highConfidenceRows =
  inferredRows
    .filter(
      (row) =>
        row.selected &&
        row.confidence >= 0.85 &&
        row.scoreGap >= 4,
    )
    .sort((a, b) => {
      if (
        a.confidence !==
        b.confidence
      ) {
        return (
          b.confidence -
          a.confidence
        )
      }

      return (
        b.scoreGap -
        a.scoreGap
      )
    })
    .slice(0, 30)

console.log(
  '\n=== 高置信度分类前 30 个实验 ===',
)

console.table(
  highConfidenceRows,
)