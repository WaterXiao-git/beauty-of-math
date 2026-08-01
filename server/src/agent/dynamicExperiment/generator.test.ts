import test from 'node:test'
import assert from 'node:assert/strict'

import {
  generateDynamicExperiment,
} from './generator.js'

import type {
  AgentModelProvider,
  AgentModelRequest,
} from '../ai/types.js'

function validSpec() {
  return {
    version: 1,
    title: '二次函数参数实验',
    description: '观察参数改变时抛物线的变化。',
    gradeLevel: '初中',
    formulaLatex: 'y=ax^2',
    parameters: [
      {
        id: 'a',
        label: '二次项系数 a',
        min: -3,
        max: 3,
        step: 0.1,
        defaultValue: 1,
        unit: '',
      },
    ],
    renderer: {
      type: 'cartesian-2d',
      expression: 'a*x^2',
      xMin: -5,
      xMax: 5,
      yMin: -10,
      yMax: 10,
      samples: 400,
    },
    steps: [
      {
        title: '观察开口',
        description: '改变 a 的正负并观察开口方向。',
        parameterValues: { a: 1 },
      },
    ],
    knowledgePoints: ['a 的符号决定抛物线开口方向。'],
  }
}

class FakeProvider
implements AgentModelProvider {
  readonly provider: 'deepseek' | 'qwen'
  readonly model: string
  calls = 0

  private readonly response:
    | unknown
    | Error
    | ((request: AgentModelRequest) => unknown)

  constructor(
    provider: 'deepseek' | 'qwen',
    response:
      | unknown
      | Error
      | ((request: AgentModelRequest) => unknown),
  ) {
    this.provider = provider
    this.model = provider === 'deepseek'
      ? 'deepseek-v4-flash'
      : 'qwen3.7-plus'
    this.response = response
  }

  async completeJSON(
    request: AgentModelRequest,
  ): Promise<unknown> {
    this.calls += 1

    if (this.response instanceof Error) {
      throw this.response
    }

    return typeof this.response === 'function'
      ? this.response(request)
      : this.response
  }
}

test('DeepSeek 生成并由千问复核实验配置', async () => {
  const primary = new FakeProvider(
    'deepseek',
    validSpec(),
  )
  const reviewer = new FakeProvider(
    'qwen',
    ({ userPrompt }: AgentModelRequest) => {
      assert.match(userPrompt, /审核并修正/)
      return validSpec()
    },
  )

  const result = await generateDynamicExperiment(
    '展示参数 a 对抛物线的影响',
    { primary, reviewer },
  )

  assert.equal(result.spec.renderer.type, 'cartesian-2d')
  assert.equal(result.generation.reviewed, true)
  assert.equal(primary.calls, 1)
  assert.equal(reviewer.calls, 1)
})

test('完整实验生成与复核使用更大的输出预算', async () => {
  const budgets: number[] = []
  const primary = new FakeProvider(
    'deepseek',
    (request: AgentModelRequest) => {
      budgets.push(request.maxTokens ?? 0)
      return validSpec()
    },
  )
  const reviewer = new FakeProvider(
    'qwen',
    (request: AgentModelRequest) => {
      budgets.push(request.maxTokens ?? 0)
      return validSpec()
    },
  )

  await generateDynamicExperiment(
    '展示二次函数',
    { primary, reviewer },
  )

  assert.deepEqual(budgets, [4_500, 4_500])
})

test('四维超立方体使用通用画布模板直接生成', async () => {
  const primary = new FakeProvider(
    'deepseek',
    new Error('不应调用模型'),
  )
  const reviewer = new FakeProvider(
    'qwen',
    new Error('不应调用模型'),
  )

  const result = await generateDynamicExperiment(
    '画一个四维超立方体的三维投影',
    { primary, reviewer },
  )

  assert.equal(
    result.spec.renderer.type,
    'sandboxed-html',
  )
  assert.equal(result.spec.parameters[0]?.id, 'dimension')
  assert.equal(primary.calls, 0)
  assert.equal(reviewer.calls, 0)
})

test('二次项系数可取零时补充退化情况', async () => {
  const primary = new FakeProvider(
    'deepseek',
    validSpec(),
  )

  const result = await generateDynamicExperiment(
    '展示二次函数',
    { primary, reviewer: null },
  )

  assert.ok(
    result.spec.steps.some((step) =>
      step.description.includes('不再是抛物线'),
    ),
  )
  assert.ok(
    result.spec.knowledgePoints.some((point) =>
      point.includes('不能再称为二次函数'),
    ),
  )
})

test('主模型失败时由千问生成配置', async () => {
  const primary = new FakeProvider(
    'deepseek',
    new Error('timeout'),
  )
  const reviewer = new FakeProvider(
    'qwen',
    validSpec(),
  )

  const result = await generateDynamicExperiment(
    '展示二次函数',
    { primary, reviewer },
  )

  assert.equal(result.generation.fallback, true)
  assert.deepEqual(result.generation.models, [
    'qwen/qwen3.7-plus',
  ])
})

test('拒绝两个模型返回的非法配置', async () => {
  const primary = new FakeProvider(
    'deepseek',
    { renderer: { type: 'html' } },
  )
  const reviewer = new FakeProvider(
    'qwen',
    { renderer: { type: 'javascript' } },
  )

  await assert.rejects(
    generateDynamicExperiment(
      '生成任意网页代码',
      { primary, reviewer },
    ),
    /可安全渲染/,
  )
})
