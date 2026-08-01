import assert from 'node:assert/strict'

import {
  ALL_EXPERIMENT_MANIFESTS,
} from '../src/agent/manifests/allExperimentManifests.js'

import {
  routeQuestion,
} from '../src/agent/questionRouter.js'

interface SemanticSearchCase {
  id: string
  expectedPath: string
  query: string
}

interface EvaluationRow {
  caseId: string
  query: string

  expectedId: string
  expectedTitle: string
  expectedPath: string

  actualId: string | null
  actualTitle: string | null
  actualPath: string | null

  rank: number | null
  top1: boolean
  top3: boolean

  intent: string
  decision: string

  candidateCount: number
  candidates: string
}

/**
 * 语义检索测试集。
 *
 * 这些问题刻意不直接包含完整实验标题，
 * 用于测试关键词、别名和语义描述的匹配能力。
 */
const SEMANTIC_SEARCH_CASES:
  readonly SemanticSearchCase[] = [
    {
      id: 'fractions-core-title',
      expectedPath: '/fractions',
      query: '分数',
    },
    {
      id: 'fractions-numerator-denominator',
      expectedPath: '/fractions',
      query: '怎么理解分子和分母',
    },
    {
      id: 'fractions-pie',
      expectedPath: '/fractions',
      query: '用饼图表示几分之几',
    },

    {
      id: 'matrix-decomposition-meaning',
      expectedPath:
        '/matrix-decomposition',
      query:
        '把矩阵拆成更容易计算的几个部分',
    },
    {
      id: 'matrix-decomposition-methods',
      expectedPath:
        '/matrix-decomposition',
      query:
        '想比较 LU、QR 和 SVD 的基本思路',
    },

    {
      id: 'interpolation-middle-value',
      expectedPath:
        '/interpolation',
      query:
        '已知几个离散采样点，怎样估计中间位置的函数值',
    },
    {
      id: 'interpolation-curve',
      expectedPath:
        '/interpolation',
      query:
        '用有限个点补出一条连续曲线',
    },

    {
      id: 'modular-clock',
      expectedPath:
        '/modular-arithmetic',
      query:
        '演示钟表算术为什么会循环',
    },
    {
      id: 'modular-remainder',
      expectedPath:
        '/modular-arithmetic',
      query:
        '两个整数除以同一个数后，余数关系应该怎么表示',
    },

    {
      id: 'lorenz-butterfly',
      expectedPath:
        '/lorenz-attractor',
      query:
        '展示经典蝴蝶形混沌轨迹',
    },
    {
      id: 'lorenz-three-variables',
      expectedPath:
        '/lorenz-attractor',
      query:
        '三个变量相互作用形成的混沌系统',
    },

    {
      id: 'signal-time-frequency',
      expectedPath:
        '/signal-processing',
      query:
        '把时域波形转换到频域观察',
    },
    {
      id: 'signal-filter-spectrum',
      expectedPath:
        '/signal-processing',
      query:
        '看看滤波前后频谱有什么变化',
    },

    {
      id: 'markov-current-state',
      expectedPath:
        '/markov-chain',
      query:
        '下一状态只依赖当前状态的随机过程',
    },
    {
      id: 'markov-transition-matrix',
      expectedPath:
        '/markov-chain',
      query:
        '用状态转移矩阵展示随机跳转',
    },

    {
      id: 'numerical-integration-methods',
      expectedPath:
        '/numerical-integration',
      query:
        '用梯形法和辛普森法估算曲线下面积',
    },
    {
      id: 'riemann-sum-segments',
      expectedPath:
        '/riemann-sum',
      query:
        '把积分区间切成很多小块近似求面积',
    },
    {
      id: 'linear-system-intersection',
      expectedPath:
        '/linear-system',
      query:
        '画出两条直线并找到它们的交点',
    },
    {
      id: 'linear-system-solving',
      expectedPath:
        '/linear-system',
      query:
        '演示两个一次方程联立求解',
    },

    {
      id: 'wave-equation-string',
      expectedPath:
        '/wave-equation',
      query:
        '观察绳子上的波怎样随时间传播',
    },
    {
      id: 'wave-equation-pde',
      expectedPath:
        '/wave-equation',
      query:
        '展示振动传播对应的偏微分模型',
    },

    {
      id: 'fourier-components',
      expectedPath:
        '/fourier',
      query:
        '把复杂波形拆成不同频率的正弦成分',
    },
    {
      id: 'fourier-basis',
      expectedPath:
        '/fourier',
      query:
        '用不同频率的正弦基函数表示一个信号',
    },
    {
      id: 'hanoi-recursion',
      expectedPath:
        '/tower-of-hanoi',
      query:
        '三个柱子移动圆盘的递归问题',
    },
    {
      id: 'hanoi-move-rule',
      expectedPath:
        '/tower-of-hanoi',
      query:
        '每次只能移动一个圆盘，怎样完成全部搬运',
    },

    {
      id: 'knot-equivalence',
      expectedPath:
        '/knot-theory',
      query:
        '研究绳结在连续变形下是否等价',
    },
    {
      id: 'knot-topology',
      expectedPath:
        '/knot-theory',
      query:
        '展示不同绳结的拓扑性质',
    },
  ]

const manifestByPath =
  new Map(
    ALL_EXPERIMENT_MANIFESTS.map(
      (manifest) => [
        manifest.path,
        manifest,
      ],
    ),
  )

/**
 * 在运行评估前确认：
 *
 * 1. 测试目标真实存在
 * 2. 测试目标已经启用
 */
for (
  const testCase
  of SEMANTIC_SEARCH_CASES
) {
  const manifest =
    manifestByPath.get(
      testCase.expectedPath,
    )

  assert.ok(
    manifest,
    `测试目标不存在：${testCase.expectedPath}`,
  )

  assert.equal(
    manifest.agent.enabled,
    true,
    `测试目标尚未进入 Registry：${testCase.expectedPath}`,
  )

  /**
   * 防止测试语句意外直接包含完整标题。
   */
  assert.equal(
    testCase.query.includes(
      manifest.title,
    ),
    false,
    `语义测试不应直接包含完整标题：${testCase.id}`,
  )
}

const rows: EvaluationRow[] =
  SEMANTIC_SEARCH_CASES.map(
    (testCase) => {
      const expectedManifest =
        manifestByPath.get(
          testCase.expectedPath,
        )

      assert.ok(expectedManifest)

      const result =
        routeQuestion(
          testCase.query,
        )

      const candidates =
        result.experiments

      const candidateIndex =
        candidates.findIndex(
          (candidate) =>
            candidate.path ===
              testCase.expectedPath ||
            candidate.id ===
              expectedManifest.id,
        )

      const rank =
        candidateIndex >= 0
          ? candidateIndex + 1
          : null

      const firstCandidate =
        candidates[0] ?? null

      return {
        caseId:
          testCase.id,

        query:
          testCase.query,

        expectedId:
          expectedManifest.id,

        expectedTitle:
          expectedManifest.title,

        expectedPath:
          expectedManifest.path,

        actualId:
          firstCandidate?.id ??
          null,

        actualTitle:
          firstCandidate?.title ??
          null,

        actualPath:
          firstCandidate?.path ??
          null,

        rank,

        top1:
          rank === 1,

        top3:
          rank !== null &&
          rank <= 3,

        intent:
          result.intent
            .primaryIntent,

        decision:
          result.routeDecision
            .decision,

        candidateCount:
          candidates.length,

        candidates:
          candidates
            .map(
              (candidate) =>
                `${candidate.id}:${candidate.score}`,
            )
            .join(' | '),
      }
    },
  )

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

const top1Passed =
  rows.filter(
    (row) => row.top1,
  ).length

const top3Passed =
  rows.filter(
    (row) => row.top3,
  ).length

const noCandidate =
  rows.filter(
    (row) =>
      row.candidateCount === 0,
  ).length

console.log(
  '\n=== Agent 语义搜索评估 ===',
)

console.log({
  cases:
    rows.length,

  expectedExperiments:
    new Set(
      rows.map(
        (row) =>
          row.expectedPath,
      ),
    ).size,

  top1Passed,

  top1Accuracy:
    percentage(
      top1Passed,
      rows.length,
    ),

  top3Passed,

  top3Recall:
    percentage(
      top3Passed,
      rows.length,
    ),

  noCandidate,

  noCandidateRate:
    percentage(
      noCandidate,
      rows.length,
    ),
})

/**
 * 按实验汇总。
 */
const experimentPaths =
  Array.from(
    new Set(
      rows.map(
        (row) =>
          row.expectedPath,
      ),
    ),
  )

const experimentSummary =
  experimentPaths.map(
    (path) => {
      const targetRows =
        rows.filter(
          (row) =>
            row.expectedPath ===
            path,
        )

      const first =
        targetRows[0]

      assert.ok(first)

      return {
        expected:
          first.expectedId,

        title:
          first.expectedTitle,

        queries:
          targetRows.length,

        top1:
          targetRows.filter(
            (row) =>
              row.top1,
          ).length,

        top3:
          targetRows.filter(
            (row) =>
              row.top3,
          ).length,

        noCandidate:
          targetRows.filter(
            (row) =>
              row.candidateCount ===
              0,
          ).length,
      }
    },
  )

console.log(
  '\n=== 按实验统计 ===',
)

console.table(
  experimentSummary,
)

const failures =
  rows.filter(
    (row) =>
      !row.top1,
  )

console.log(
  '\n=== Top 1 未命中详情 ===',
)

console.table(
  failures.map(
    (row) => ({
      caseId:
        row.caseId,

      query:
        row.query,

      expected:
        row.expectedId,

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
        row.candidates,
    }),
  ),
)

const successfulRows =
  rows.filter(
    (row) =>
      row.top1,
  )

console.log(
  '\n=== Top 1 命中详情 ===',
)

console.table(
  successfulRows.map(
    (row) => ({
      caseId:
        row.caseId,

      query:
        row.query,

      expected:
        row.expectedId,

      intent:
        row.intent,

      decision:
        row.decision,

      candidates:
        row.candidates,
    }),
  ),
)

if (failures.length > 0) {
  process.exitCode = 1
}
