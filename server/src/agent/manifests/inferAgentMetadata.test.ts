import test from 'node:test'
import assert from 'node:assert/strict'

import {
  GENERATED_EXPERIMENT_CATALOG,
} from './generatedExperimentCatalog.js'

import {
  AUTO_ENABLE_CONFIDENCE_THRESHOLD,
  inferExperimentAgentMetadata,
} from './inferAgentMetadata.js'

import type {
  ExperimentCatalogMetadata,
  ExperimentKind,
  ParameterSchemaId,
} from './experimentManifest.js'

function findExperiment(
  path: string,
): ExperimentCatalogMetadata {
  const experiment =
    GENERATED_EXPERIMENT_CATALOG.find(
      (item) =>
        item.path === path,
    )

  if (!experiment) {
    throw new Error(
      `没有找到实验：${path}`,
    )
  }

  return experiment
}

function assertExperimentKind(
  path: string,
  expectedKind: ExperimentKind,
  expectedSchema: ParameterSchemaId,
): void {
  const result =
    inferExperimentAgentMetadata(
      findExperiment(path),
    )

  assert.equal(
    result.agent.kind,
    expectedKind,
    `${path} 的 kind 错误`,
  )

  assert.equal(
    result.agent.parameterSchema,
    expectedSchema,
    `${path} 的 parameterSchema 错误`,
  )

  const shouldEnable =
    result.selectedCandidate !== null &&
    result.selectedCandidate.textScore > 0 &&
    result.confidence >=
      AUTO_ENABLE_CONFIDENCE_THRESHOLD

  assert.equal(
    result.agent.enabled,
    shouldEnable,
    `${path} 的 enabled 状态错误`,
  )

  assert.ok(
    result.selectedCandidate,
    `${path} 应该存在有效分类候选`,
  )

  assert.ok(
    result.selectedCandidate.textScore > 0,
  )
}

test(
  '一次函数识别为函数图像类',
  () => {
    assertExperimentKind(
      '/linear-function',
      'function-graph',
      'function',
    )
  },
)

test(
  '数值积分识别为积分估计类',
  () => {
    assertExperimentKind(
      '/numerical-integration',
      'integral-estimation',
      'integral-estimation',
    )
  },
)

test(
  '矩阵分解识别为线性代数类',
  () => {
    assertExperimentKind(
      '/matrix-decomposition',
      'linear-algebra',
      'matrix',
    )
  },
)

test(
  '微分方程识别为微分方程类',
  () => {
    assertExperimentKind(
      '/ode',
      'differential-equation',
      'differential-equation',
    )
  },
)

test(
  '蒙特卡洛识别为模拟类',
  () => {
    assertExperimentKind(
      '/monte-carlo',
      'simulation',
      'simulation',
    )
  },
)

test(
  '集合论识别为离散数学类',
  () => {
    assertExperimentKind(
      '/set-theory',
      'discrete-math',
      'combinatorics',
    )
  },
)

test(
  '插值方法识别为数值方法类',
  () => {
    assertExperimentKind(
      '/interpolation',
      'numerical-method',
      'numerical-method',
    )
  },
)

test(
  '二元一次方程组识别为代数类',
  () => {
    assertExperimentKind(
      '/linear-system',
      'algebra',
      'algebra-equation',
    )
  },
)

test(
  '模运算与同余识别为数论类',
  () => {
    assertExperimentKind(
      '/modular-arithmetic',
      'number-theory',
      'number-theory',
    )
  },
)

test(
  '汉诺塔识别为离散数学类',
  () => {
    assertExperimentKind(
      '/tower-of-hanoi',
      'discrete-math',
      'combinatorics',
    )
  },
)

test(
  '模拟退火识别为优化类',
  () => {
    assertExperimentKind(
      '/simulated-annealing',
      'optimization',
      'optimization',
    )
  },
)

test(
  '小波变换识别为信号处理类',
  () => {
    assertExperimentKind(
      '/wavelet',
      'signal-processing',
      'signal',
    )
  },
)

test(
  '洛伦兹吸引子识别为动力系统类',
  () => {
    assertExperimentKind(
      '/lorenz-attractor',
      'dynamical-system',
      'dynamical-system',
    )
  },
)

test(
  '纽结理论识别为拓扑类',
  () => {
    assertExperimentKind(
      '/knot-theory',
      'topology',
      'topology',
    )
  },
)

test(
  '密码学基础识别为密码学类',
  () => {
    assertExperimentKind(
      '/cryptography',
      'cryptography',
      'cryptography',
    )
  },
)

test(
  '波动方程识别为微分方程类',
  () => {
    assertExperimentKind(
      '/wave-equation',
      'differential-equation',
      'differential-equation',
    )
  },
)

test(
  '马尔可夫链识别为概率统计类',
  () => {
    assertExperimentKind(
      '/markov-chain',
      'probability-statistics',
      'probability-distribution',
    )
  },
)

test(
  'Delaunay 三角剖分识别为几何类',
  () => {
    assertExperimentKind(
      '/delaunay-triangulation',
      'geometry',
      'geometry',
    )
  },
)

test(
  '多项式求根识别为数值方法类而不是代数类',
  () => {
    assertExperimentKind(
      '/polynomial-roots',
      'numerical-method',
      'numerical-method',
    )
  },
)

test(
  '割线法识别为数值方法类而不是微积分概念类',
  () => {
    assertExperimentKind(
      '/secant-method',
      'numerical-method',
      'numerical-method',
    )
  },
)

test(
  '傅里叶级数仍识别为级数类',
  () => {
    assertExperimentKind(
      '/fourier-series',
      'sequence-series',
      'sequence-series',
    )
  },
)

test(
  '傅里叶变换识别为信号处理类',
  () => {
    assertExperimentKind(
      '/fourier',
      'signal-processing',
      'signal',
    )
  },
)

test(
  '自动推断实验按照置信度决定是否启用',
  () => {
    for (
      const experiment
      of GENERATED_EXPERIMENT_CATALOG
    ) {
      const result =
        inferExperimentAgentMetadata(
          experiment,
        )

      const shouldEnable =
        result.selectedCandidate !== null &&
        result.selectedCandidate.textScore > 0 &&
        result.confidence >=
          AUTO_ENABLE_CONFIDENCE_THRESHOLD

      assert.equal(
        result.agent.enabled,
        shouldEnable,
        `${experiment.id} 的 enabled 状态错误`,
      )
    }
  },
)

test(
  '只有宽泛 topic 时不自动确定类别',
  () => {
    const result =
      inferExperimentAgentMetadata({
        id:
          'generic-applied-example',

        path:
          '/generic-applied-example',

        title:
          '综合方法展示',

        description:
          '展示一种综合数学处理方法。',

        topics: [
          'algebra',
          'applied',
        ],
      })

    assert.equal(
      result.agent.kind,
      'concept',
    )

    assert.equal(
      result.agent.parameterSchema,
      'none',
    )

    assert.equal(
      result.confidence,
      0.3,
    )

    assert.equal(
      result.selectedCandidate,
      null,
    )
    assert.equal(
      result.agent.enabled,
      false,
    )
  },
)

test(
  'topic 候选会保留但不会直接选中',
  () => {
    const result =
      inferExperimentAgentMetadata({
        id:
          'topic-only-example',

        path:
          '/topic-only-example',

        title:
          '综合知识展示',

        description:
          '展示相关数学知识。',

        topics: [
          'probability',
        ],
      })

    assert.equal(
      result.selectedCandidate,
      null,
    )

    assert.equal(
      result.agent.kind,
      'concept',
    )

    const probabilityCandidate =
      result.candidates.find(
        (candidate) =>
          candidate.kind ===
          'probability-statistics',
      )

    assert.ok(
      probabilityCandidate,
    )

    assert.equal(
      probabilityCandidate.textScore,
      0,
    )

    assert.ok(
      probabilityCandidate.topicScore > 0,
    )
  },
)

test(
  '英文 ode 不会错误命中 model',
  () => {
    const result =
      inferExperimentAgentMetadata({
        id:
          'generic-model',

        path:
          '/generic-model',

        title:
          '综合模型',

        description:
          '展示一种普通数学模型。',

        topics: [],
      })

    assert.notEqual(
      result.agent.kind,
      'differential-equation',
    )
  },
)

test(
  '标题信号优先于宽泛 topic',
  () => {
    const result =
      inferExperimentAgentMetadata({
        id:
          'geometry-title-example',

        path:
          '/geometry-title-example',

        title:
          '三角形面积实验',

        description:
          '展示图形的变化。',

        topics: [
          'applied',
          'probability',
        ],
      })

    assert.equal(
      result.agent.kind,
      'geometry',
    )

    assert.ok(
      result.selectedCandidate,
    )

    assert.ok(
      result.selectedCandidate.textScore >
      result.selectedCandidate.topicScore,
    )
  },
)

test(
  '高置信度分类实验会自动启用',
  () => {
    const result =
      inferExperimentAgentMetadata(
        findExperiment(
          '/matrix-decomposition',
        ),
      )

    assert.ok(
      result.selectedCandidate,
    )

    assert.ok(
      result.confidence >=
        AUTO_ENABLE_CONFIDENCE_THRESHOLD,
    )

    assert.equal(
      result.agent.enabled,
      true,
    )
  },
)

test(
  '未识别实验继续保持关闭',
  () => {
    const result =
      inferExperimentAgentMetadata({
        id: 'unclear-example',
        path: '/unclear-example',
        title: '综合展示',
        description:
          '展示一些相关数学内容。',
        topics: [
          'applied',
        ],
      })

    assert.equal(
      result.selectedCandidate,
      null,
    )

    assert.equal(
      result.confidence,
      0.3,
    )

    assert.equal(
      result.agent.enabled,
      false,
    )
  },
)