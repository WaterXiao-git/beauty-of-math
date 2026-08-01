import test from 'node:test'
import assert from 'node:assert/strict'

import {
  parseAgentAIProposal,
  routeQuestionWithAI,
} from './agentCoordinator.js'

import type {
  AgentModelProvider,
  AgentModelRequest,
} from './types.js'

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
    model: string,
    response:
      | unknown
      | Error
      | ((request: AgentModelRequest) => unknown),
  ) {
    this.provider = provider
    this.model = model
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

function proposal(
  overrides: Record<string, unknown> = {},
) {
  return {
    action: 'suggest',
    candidateIds: ['fractions'],
    rewrittenQuery: null,
    confidence: 0.92,
    reason: '分数实验与问题含义最接近。',
    clarifyingQuestion: null,
    toolRequest: null,
    ...overrides,
  }
}

test('明确规则路由不调用模型', async () => {
  const primary = new FakeProvider(
    'deepseek',
    'deepseek-v4-flash',
    proposal(),
  )

  const result = await routeQuestionWithAI(
    '动态演示黎曼和的逼近过程',
    {
      enabled: true,
      primary,
      reviewer: null,
    },
  )

  assert.equal(result.ai.status, 'skipped')
  assert.equal(primary.calls, 0)
  assert.equal(
    result.routeDecision.decision,
    'direct',
  )
})

test('主模型只能重排白名单中的候选实验', async () => {
  const primary = new FakeProvider(
    'deepseek',
    'deepseek-v4-flash',
    proposal({
      candidateIds: [
        'invented-experiment',
        'fractions',
      ],
    }),
  )

  const result = await routeQuestionWithAI(
    '分数',
    {
      enabled: true,
      primary,
      reviewer: null,
    },
  )

  assert.equal(result.ai.status, 'enhanced')
  assert.equal(
    result.routeDecision.decision,
    'suggest',
  )
  assert.equal(
    result.routeDecision.target?.id,
    'fractions',
  )
  assert.equal(
    result.experiments.some(
      (candidate) =>
        candidate.id === 'invented-experiment',
    ),
    false,
  )
})

test('主模型失败时由千问接管', async () => {
  const primary = new FakeProvider(
    'deepseek',
    'deepseek-v4-flash',
    new Error('timeout'),
  )

  const reviewer = new FakeProvider(
    'qwen',
    'qwen3.7-plus',
    proposal(),
  )

  const result = await routeQuestionWithAI(
    '分数',
    {
      enabled: true,
      primary,
      reviewer,
    },
  )

  assert.equal(result.ai.status, 'fallback')
  assert.equal(primary.calls, 1)
  assert.equal(reviewer.calls, 1)
  assert.deepEqual(result.ai.models, [
    'qwen/qwen3.7-plus',
  ])
})

test('改写查询后由千问复核新增候选', async () => {
  const primary = new FakeProvider(
    'deepseek',
    'deepseek-v4-flash',
    proposal({
      candidateIds: [],
      rewrittenQuery: '黎曼和',
      confidence: 0.78,
      reason: '先改写为标准知识点名称。',
    }),
  )

  const reviewer = new FakeProvider(
    'qwen',
    'qwen3.7-plus',
    proposal({
      candidateIds: ['riemann-sum'],
      rewrittenQuery: null,
      confidence: 0.94,
      reason: '改写后可安全推荐黎曼和实验。',
    }),
  )

  const result = await routeQuestionWithAI(
    '请展示我说的那个知识点',
    {
      enabled: true,
      primary,
      reviewer,
    },
  )

  assert.equal(result.ai.reviewed, true)
  assert.equal(
    result.routeDecision.target?.id,
    'riemann-sum',
  )
  assert.equal(
    result.routeDecision.decision,
    'suggest',
  )
})

test('创建实验请求只进入人工确认，不执行工具', async () => {
  const primary = new FakeProvider(
    'deepseek',
    'deepseek-v4-flash',
    proposal({
      action: 'request-tool',
      candidateIds: [],
      confidence: 0.95,
      reason: '现有实验未覆盖该内容。',
      clarifyingQuestion: null,
      toolRequest: {
        name: 'create-experiment',
        input: {
          topic: '新知识点',
        },
      },
    }),
  )

  const result = await routeQuestionWithAI(
    '请展示我说的那个知识点',
    {
      enabled: true,
      primary,
      reviewer: null,
    },
  )

  assert.equal(
    result.routeDecision.decision,
    'ai',
  )
  assert.equal(
    result.ai.toolRequest?.name,
    'create-experiment',
  )
})

test('结构校验会删除模型编造的候选 ID', () => {
  const parsed = parseAgentAIProposal(
    proposal({
      candidateIds: ['fractions', 'invented'],
    }),
    new Set(['fractions']),
  )

  assert.deepEqual(
    parsed?.candidateIds,
    ['fractions'],
  )
})
