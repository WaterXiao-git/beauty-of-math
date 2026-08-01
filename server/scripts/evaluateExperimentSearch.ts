import {
  ALL_EXPERIMENT_MANIFESTS,
} from '../src/agent/manifests/allExperimentManifests.js'

import {
  CORE_EXPERIMENT_MANIFESTS,
} from '../src/agent/manifests/coreExperimentManifests.js'

import {
  routeQuestion,
} from '../src/agent/questionRouter.js'

interface QueryTemplate {
  name: string
  build: (title: string) => string
  expectedDecision: 'direct' | 'suggest'
}

interface EvaluationRow {
  source: 'core' | 'semantic' | 'catalog'

  experimentId: string
  experimentTitle: string
  expectedPath: string

  queryType: string
  query: string

  intent: string
  decision: string
  expectedDecision: string
  decisionPassed: boolean

  rank: number | null
  top1: boolean
  top3: boolean

  actualId: string | null
  actualTitle: string | null
  actualPath: string | null

  candidateCount: number
  candidateSummary: string
}

/**
 * 第一阶段使用明确包含实验标题的自然语言模板。
 *
 * 这一步测试：
 * 1. 实验是否成功进入 Registry
 * 2. 包含实验名称时是否能正确匹配
 * 3. 不同用户表达是否影响排序
 */
const QUERY_TEMPLATES:
  readonly QueryTemplate[] = [
    {
      name: '打开',
      build: (title) =>
        `打开${title}实验`,
      expectedDecision: 'direct',
    },

    {
      name: '展示',
      build: (title) =>
        `展示${title}`,
      expectedDecision: 'direct',
    },

    {
      name: '学习',
      build: (title) =>
        `我想学习${title}`,
      expectedDecision: 'suggest',
    },

    {
      name: '查找',
      build: (title) =>
        `有没有${title}相关实验`,
      expectedDecision: 'direct',
    },
  ]

const corePaths = new Set(
  CORE_EXPERIMENT_MANIFESTS.map(
    (manifest) =>
      manifest.path,
  ),
)

const semanticPaths = new Set(
  ALL_EXPERIMENT_MANIFESTS
    .filter(
      (manifest) =>
        manifest.agent.enabled,
    )
    .map(
      (manifest) =>
        manifest.path,
    ),
)

const routableManifests =
  ALL_EXPERIMENT_MANIFESTS

/**
 * 统计重复标题。
 *
 * 两个实验标题相同时，仅通过标题无法唯一确定路径，
 * 此类情况需要从普通准确率中单独观察。
 */
const titleCounts =
  new Map<string, number>()

for (
  const manifest
  of routableManifests
) {
  titleCounts.set(
    manifest.title,
    (
      titleCounts.get(
        manifest.title,
      ) ?? 0
    ) + 1,
  )
}

const rows: EvaluationRow[] = []

for (
  const manifest
  of routableManifests
) {
  for (
    const template
    of QUERY_TEMPLATES
  ) {
    const query =
      template.build(
        manifest.title,
      )

    const result =
      routeQuestion(query)

    const candidates =
      result.experiments

    const candidateIndex =
      candidates.findIndex(
        (candidate) =>
          candidate.id ===
            manifest.id ||
          candidate.path ===
            manifest.path,
      )

    const rank =
      candidateIndex >= 0
        ? candidateIndex + 1
        : null

    const firstCandidate =
      candidates[0] ?? null

    rows.push({
      source:
        corePaths.has(
          manifest.path,
        )
          ? 'core'
          : semanticPaths.has(
                manifest.path,
              )
            ? 'semantic'
            : 'catalog',

      experimentId:
        manifest.id,

      experimentTitle:
        manifest.title,

      expectedPath:
        manifest.path,

      queryType:
        template.name,

      query,

      intent:
        result.intent.primaryIntent,

      decision:
        result.routeDecision.decision,

      expectedDecision:
        template.expectedDecision,

      decisionPassed:
        result.routeDecision.decision ===
          template.expectedDecision,

      rank,

      top1:
        rank === 1,

      top3:
        rank !== null &&
        rank <= 3,

      actualId:
        firstCandidate?.id ??
        null,

      actualTitle:
        firstCandidate?.title ??
        null,

      actualPath:
        firstCandidate?.path ??
        null,

      candidateCount:
        candidates.length,

      candidateSummary:
        candidates
          .map(
            (candidate) =>
              `${candidate.id}:${candidate.score}`,
          )
          .join(' | '),
    })
  }
}

function countPassed(
  targetRows:
    readonly EvaluationRow[],
  field:
    'top1' |
    'top3' |
    'decisionPassed',
): number {
  return targetRows.filter(
    (row) =>
      row[field],
  ).length
}

function percentage(
  passed: number,
  total: number,
): string {
  if (total === 0) {
    return '0.00%'
  }

  return `${
    (
      passed /
      total *
      100
    ).toFixed(2)
  }%`
}

function createAccuracySummary(
  targetRows:
    readonly EvaluationRow[],
) {
  const top1Passed =
    countPassed(
      targetRows,
      'top1',
    )

  const top3Passed =
    countPassed(
      targetRows,
      'top3',
    )

  const decisionPassed =
    countPassed(
      targetRows,
      'decisionPassed',
    )

  return {
    queries:
      targetRows.length,

    top1Passed,

    top1Accuracy:
      percentage(
        top1Passed,
        targetRows.length,
      ),

    top3Passed,

    top3Recall:
      percentage(
        top3Passed,
        targetRows.length,
      ),

    decisionPassed,

    routeDecisionAccuracy:
      percentage(
        decisionPassed,
        targetRows.length,
      ),

    noCandidate:
      targetRows.filter(
        (row) =>
          row.candidateCount === 0,
      ).length,
  }
}

const coreRows =
  rows.filter(
    (row) =>
      row.source === 'core',
  )

const semanticRows =
  rows.filter(
    (row) =>
      row.source === 'semantic',
  )

const catalogRows =
  rows.filter(
    (row) =>
      row.source === 'catalog',
  )

const uniqueTitleRows =
  rows.filter(
    (row) =>
      titleCounts.get(
        row.experimentTitle,
      ) === 1,
  )

const duplicateTitleRows =
  rows.filter(
    (row) =>
      (
        titleCounts.get(
          row.experimentTitle,
        ) ?? 0
      ) > 1,
  )

console.log(
  '\n=== Agent 实验搜索评估 ===',
)

console.log({
  totalManifests:
    ALL_EXPERIMENT_MANIFESTS.length,

  registryExperiments:
    routableManifests.length,

  coreExperiments:
    CORE_EXPERIMENT_MANIFESTS.length,

  inferredEnabled:
    semanticPaths.size -
    CORE_EXPERIMENT_MANIFESTS.length,

  catalogFallback:
    catalogRows.length /
    QUERY_TEMPLATES.length,

  queryTemplates:
    QUERY_TEMPLATES.length,

  totalQueries:
    rows.length,
})

console.log(
  '\n=== 全部查询准确率 ===',
)

console.log(
  createAccuracySummary(rows),
)

console.log(
  '\n=== 核心实验准确率 ===',
)

console.log(
  createAccuracySummary(
    coreRows,
  ),
)

console.log(
  '\n=== 高置信度自动启用实验准确率 ===',
)

console.log(
  createAccuracySummary(
    semanticRows,
  ),
)

console.log(
  '\n=== 基础目录标题召回准确率 ===',
)

console.log(
  createAccuracySummary(
    catalogRows,
  ),
)

console.log(
  '\n=== 唯一标题实验准确率 ===',
)

console.log(
  createAccuracySummary(
    uniqueTitleRows,
  ),
)

console.log(
  '\n=== 重复标题查询统计 ===',
)

console.log({
  duplicateTitles:
    Array.from(
      titleCounts.entries(),
    ).filter(
      ([, count]) =>
        count > 1,
    ).length,

  duplicateTitleQueries:
    duplicateTitleRows.length,
})

const failures =
  rows
    .filter(
      (row) =>
        !row.top1,
    )
    .sort((a, b) => {
      /**
       * 核心实验失败优先显示。
       */
      if (
        a.source !==
        b.source
      ) {
        return a.source === 'core'
          ? -1
          : 1
      }

      /**
       * 完全没有进入 Top 3 的失败优先。
       */
      if (
        a.top3 !==
        b.top3
      ) {
        return a.top3
          ? 1
          : -1
      }

      return a.experimentTitle.localeCompare(
        b.experimentTitle,
        'zh-CN',
      )
    })

console.log(
  '\n=== Top 1 未命中的前 50 条 ===',
)

console.table(
  failures
    .slice(0, 50)
    .map((row) => ({
      source:
        row.source,

      expected:
        row.experimentId,

      title:
        row.experimentTitle,

      queryType:
        row.queryType,

      query:
        row.query,

      actual:
        row.actualId,

      rank:
        row.rank,

      top3:
        row.top3,

      intent:
        row.intent,

      decision:
        row.decision,

      candidates:
        row.candidateSummary,
    })),
)

const decisionFailures =
  rows.filter(
    (row) =>
      !row.decisionPassed,
  )

console.log(
  '\n=== 路由决策未达预期 ===',
)

console.table(
  decisionFailures
    .slice(0, 50)
    .map((row) => ({
      expected:
        row.experimentId,

      title:
        row.experimentTitle,

      queryType:
        row.queryType,

      query:
        row.query,

      expectedDecision:
        row.expectedDecision,

      actualDecision:
        row.decision,

      intent:
        row.intent,

      candidates:
        row.candidateSummary,
    })),
)

const missingTop3 =
  rows.filter(
    (row) =>
      !row.top3,
  )

console.log(
  '\n=== 完全未进入 Top 3 ===',
)

console.log({
  count:
    missingTop3.length,

  percentage:
    percentage(
      missingTop3.length,
      rows.length,
    ),
})

console.table(
  missingTop3
    .slice(0, 30)
    .map((row) => ({
      expected:
        row.experimentId,

      title:
        row.experimentTitle,

      query:
        row.query,

      actual:
        row.actualId,

      intent:
        row.intent,

      candidates:
        row.candidateSummary,
    })),
)

if (
  failures.length > 0 ||
  decisionFailures.length > 0
) {
  process.exitCode = 1
}
