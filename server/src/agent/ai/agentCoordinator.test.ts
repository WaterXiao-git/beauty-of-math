import test from 'node:test'
import assert from 'node:assert/strict'

import {
  parseAgentAIProposal,
  parseMathExplanation,
  routeQuestionWithAI as routeQuestionWithAIProduction,
} from './agentCoordinator.js'

import type {
  AgentModelProvider,
  AgentModelRequest,
} from './types.js'

function routeQuestionWithAI(
  question: string,
  options: NonNullable<
    Parameters<typeof routeQuestionWithAIProduction>[1]
  >,
) {
  return routeQuestionWithAIProduction(question, {
    semanticRetriever: null,
    ...options,
  })
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
    candidateIds: ['hm-04-05'],
    rewrittenQuery: null,
    confidence: 0.92,
    reason: '导数实验与问题含义最接近。',
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
    '用割线逼近切线解释导数',
    { enabled: true, primary, reviewer: null },
  )

  assert.equal(result.ai.status, 'skipped')
  assert.equal(primary.calls, 0)
  assert.equal(result.routeDecision.target?.id, 'hm-04-05')
})

test('模型改写查询只在自研白名单内重新检索', async () => {
  const primary = new FakeProvider(
    'deepseek',
    'deepseek-v4-flash',
    proposal({
      candidateIds: [],
      rewrittenQuery: '用割线逼近切线解释导数',
    }),
  )

  const result = await routeQuestionWithAI(
    '画出四维超立方体的三维投影',
    { enabled: true, primary, reviewer: null },
  )

  assert.equal(result.ai.status, 'enhanced')
  assert.equal(result.routeDecision.decision, 'suggest')
  assert.equal(result.routeDecision.target?.id, 'hm-04-05')
})

test('无候选时拒绝模型改写产生的弱相关实验', async () => {
  const primary = new FakeProvider(
    'deepseek',
    'deepseek-v4-flash',
    proposal({
      candidateIds: [],
      rewrittenQuery: '函数图',
      confidence: 0.93,
    }),
  )

  const result = await routeQuestionWithAI(
    '画出四维超立方体的三维投影',
    { enabled: true, primary, reviewer: null },
  )

  assert.equal(result.routeDecision.decision, 'no-match')
  assert.deepEqual(result.experiments, [])
})

test('主模型失败时由 reviewer 接管', async () => {
  const primary = new FakeProvider(
    'deepseek',
    'deepseek-v4-flash',
    new Error('timeout'),
  )
  const reviewer = new FakeProvider(
    'qwen',
    'qwen3.7-plus',
    proposal({ candidateIds: [] }),
  )

  const result = await routeQuestionWithAI(
    '画出四维超立方体的三维投影',
    { enabled: true, primary, reviewer },
  )

  assert.equal(result.ai.status, 'fallback')
  assert.equal(primary.calls, 1)
  assert.equal(reviewer.calls, 1)
  assert.deepEqual(result.ai.models, ['qwen/qwen3.7-plus'])
})

test('可靠候选上的低置信度方案由 reviewer 复核', async () => {
  const primary = new FakeProvider(
    'deepseek',
    'deepseek-v4-flash',
    proposal({
      confidence: 0.65,
      reason: '需要复核混合意图。',
    }),
  )
  const reviewer = new FakeProvider(
    'qwen',
    'qwen3.7-plus',
    proposal({
      confidence: 0.94,
      reason: '导数实验可以同时承载展示与解释。',
    }),
  )

  const result = await routeQuestionWithAI(
    '动态展示割线逼近切线并解释导数',
    { enabled: true, primary, reviewer },
  )

  assert.equal(result.ai.reviewed, true)
  assert.equal(result.routeDecision.target?.id, 'hm-04-05')
  assert.equal(result.routeDecision.decision, 'suggest')
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
      toolRequest: {
        name: 'create-experiment',
        input: { topic: '四维超立方体投影' },
      },
    }),
  )

  const result = await routeQuestionWithAI(
    '画出四维超立方体的三维投影',
    { enabled: true, primary, reviewer: null },
  )

  assert.equal(result.routeDecision.decision, 'ai')
  assert.equal(result.ai.toolRequest?.name, 'create-experiment')
})

test('模型伪造的候选 ID 会被过滤', () => {
  const parsed = parseAgentAIProposal(
    proposal({
      candidateIds: ['four' + 'ier', 'hm-04-05'],
    }),
    new Set(['hm-04-05']),
  )

  assert.deepEqual(parsed?.candidateIds, ['hm-04-05'])
})

test('未列入策略的工具请求会被拒绝', () => {
  const parsed = parseAgentAIProposal(
    proposal({
      action: 'request-tool',
      toolRequest: {
        name: 'unknown-tool',
        input: {},
      },
    }),
    new Set(['hm-04-05']),
  )

  assert.equal(parsed?.toolRequest, null)
})

test('没有实验候选的数学定义问题由 Agent 直接解释', async () => {
  const primary = new FakeProvider(
    'deepseek',
    'deepseek-v4-flash',
    {
      title: '群',
      summary: '群是一组对象及其上的一个运算，满足四条基本公理。',
      keyPoints: [
        '运算结果仍在这个集合中。',
        '运算满足结合律，并存在单位元和逆元。',
      ],
      example: '整数集合在加法下构成群。',
    },
  )

  const result = await routeQuestionWithAI(
    '什么是群论中的群',
    { enabled: true, primary, reviewer: null },
  )

  assert.equal(result.routeDecision.decision, 'answer')
  assert.equal(result.explanation?.title, '群')
  assert.equal(primary.calls, 1)
  assert.deepEqual(result.experiments, [])
})

test('非数学问题直接跳过两个模型', async () => {
  const primary = new FakeProvider(
    'deepseek',
    'deepseek-v4-flash',
    proposal(),
  )
  const reviewer = new FakeProvider(
    'qwen',
    'qwen3.7-plus',
    proposal(),
  )

  const result = await routeQuestionWithAI(
    '今天天气怎么样',
    { enabled: true, primary, reviewer },
  )

  assert.equal(result.ai.status, 'skipped')
  assert.equal(primary.calls, 0)
  assert.equal(reviewer.calls, 0)
})

test('AI 认可原问题的语义候选后仍保留推荐实验', async () => {
  const primary = new FakeProvider('deepseek', 'test-model', proposal({
    action: 'suggest',
    candidateIds: ['hm-07-02'],
    rewrittenQuery: null,
    confidence: 0.99,
  }))
  const result = await routeQuestionWithAI(
    '把曲线切成越来越细的小片，再把它们累加起来',
    {
      enabled: true, primary, reviewer: null,
      semanticRetriever: {
        async retrieve() { return [{ id: 'hm-07-02', similarity: 0.91 }] },
      },
    },
  )
  assert.equal(result.ai.status, 'enhanced')
  assert.equal(result.routeDecision.decision, 'suggest')
  assert.equal(result.routeDecision.target?.id, 'hm-07-02')
  assert.equal(result.routeDecision.target?.matchQuality, 'related')
})

test('AI 路由入口先使用 Embedding 补充语义候选', async () => {
  const result = await routeQuestionWithAI(
    '把曲线切成越来越细的小片，再把它们累加起来',
    {
      enabled: false,
      primary: null,
      reviewer: null,
      semanticRetriever: {
        async retrieve() {
          return [{ id: 'hm-07-02', similarity: 0.91 }]
        },
      },
    } as never,
  )

  assert.equal(result.experiments[0]?.id, 'hm-07-02')
  assert.equal(result.routeDecision.decision, 'suggest')
})

test('数学解释主模型失败时由 reviewer 回答', async () => {
  const primary = new FakeProvider(
    'deepseek',
    'deepseek-v4-flash',
    new Error('timeout'),
  )
  const reviewer = new FakeProvider(
    'qwen',
    'qwen3.7-plus',
    {
      title: '测度',
      summary: '测度用于给集合赋予大小。',
      keyPoints: [
        '空集的测度为零。',
        '对两两不交集合满足可列可加性。',
      ],
      example: '区间长度是勒贝格测度的基本例子。',
    },
  )

  const result = await routeQuestionWithAI(
    '测度的定义和含义是什么',
    { enabled: true, primary, reviewer },
  )

  assert.equal(result.ai.status, 'fallback')
  assert.equal(result.explanation?.title, '测度')
  assert.equal(primary.calls, 1)
  assert.equal(reviewer.calls, 1)
})

test('数学解释至少需要两个有效关键点', () => {
  assert.equal(
    parseMathExplanation({
      title: '群',
      summary: '一个代数结构。',
      keyPoints: ['只有一个关键点'],
      example: null,
    }),
    null,
  )
})
