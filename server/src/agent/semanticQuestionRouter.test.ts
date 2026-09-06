import test from 'node:test'
import assert from 'node:assert/strict'
import { routeQuestion } from './questionRouter.js'

test('不含数学关键词的口语表达仍进入语义检索', async () => {
  const { routeQuestionWithSemanticSearch } = await import('./semanticQuestionRouter.js')
  const result = await routeQuestionWithSemanticSearch(
    '我想看看越走越靠近一个数的过程',
    { async retrieve() { return [{ id: 'hm-02-01', similarity: 0.91 }] } },
  )
  assert.equal(result.routeDecision.decision, 'suggest')
  assert.equal(result.routeDecision.target?.id, 'hm-02-01')
})

test('语义召回补充规则未命中的实验并保持人工确认', async () => {
  const module = await import('./semanticQuestionRouter.js')
    .catch(() => null)

  assert.ok(module, '缺少语义路由组合层')

  const result = await module.routeQuestionWithSemanticSearch(
    '把曲线切成越来越细的小片，再把它们累加起来',
    {
      async retrieve() {
        return [{ id: 'hm-07-02', similarity: 0.91 }]
      },
    },
  )

  assert.equal(result.experiments[0]?.id, 'hm-07-02')
  assert.equal(result.experiments[0]?.matchQuality, 'related')
  assert.ok(
    result.experiments[0]?.matchedSignals.includes(
      '语义向量:0.910',
    ),
  )
  assert.equal(result.routeDecision.decision, 'suggest')
})

test('精确规则匹配不会被语义候选覆盖', async () => {
  const module = await import('./semanticQuestionRouter.js')
    .catch(() => null)

  assert.ok(module, '缺少语义路由组合层')

  const result = await module.routeQuestionWithSemanticSearch(
    '打开罗尔定理实验',
    {
      async retrieve() {
        return [{ id: 'hm-07-02', similarity: 0.99 }]
      },
    },
  )

  assert.equal(result.experiments[0]?.id, 'hm-05-01')
  assert.equal(result.routeDecision.decision, 'direct')
})

test('Embedding 服务失败时完整回退规则路由', async () => {
  const module = await import('./semanticQuestionRouter.js')
    .catch(() => null)

  assert.ok(module, '缺少语义路由组合层')

  let calls = 0
  const question = '把曲线切成越来越细的小片，再把它们累加起来'
  const result = await module.routeQuestionWithSemanticSearch(
    question,
    {
      async retrieve() {
        calls += 1
        throw new Error('timeout')
      },
    },
  )

  assert.equal(calls, 1)
  assert.deepEqual(result, routeQuestion(question))
})
