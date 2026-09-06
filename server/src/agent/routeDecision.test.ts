import test from 'node:test'
import assert from 'node:assert/strict'

import {
  classifyIntent,
} from './intentClassifier.js'

import {
  matchExperiments,
} from './experimentMatcher.js'

import {
  decideRoute,
} from './routeDecision.js'

function decide(question: string) {
  const intent = classifyIntent(question)

  const experimentResult = matchExperiments(
    question,
    intent.primaryIntent,
  )

  return decideRoute(intent, experimentResult.candidates)
}

test('意图和实验明确时直接路由', () => {
  const result = decide('动态演示割线逼近切线的过程')

  assert.equal(result.decision, 'direct')
  assert.equal(result.reason, 'clear-route')
  assert.equal(result.target?.id, 'hm-04-05')
})

test('查找实验意图明确时直接路由', () => {
  const result = decide('打开两个重要极限实验页面')

  assert.equal(result.decision, 'direct')
  assert.equal(result.target?.id, 'hm-02-08')
})

test('打开并展示同一实验不是需要拆分的复合意图', () => {
  const result = decide(
    '打开微分实验，展示函数增量和线性近似',
  )

  assert.equal(result.decision, 'direct')
  assert.equal(result.reason, 'clear-route')
  assert.equal(result.target?.id, 'hm-04-14')
})

test('实验标题中的意图词不会制造复合意图', () => {
  const questions = [
    '打开导数的几何意义实验',
    '打开函数图形描绘实验',
    '打开极限运算法则实验',
  ]

  for (const question of questions) {
    const result = decide(question)

    assert.equal(result.decision, 'direct', question)
  }
})

test('完整标题优先于宽泛关键词', () => {
  const result = decide('打开两个重要极限实验')

  assert.equal(result.decision, 'direct')
  assert.equal(result.target?.id, 'hm-02-08')
})

test('标题之外的真实复合意图仍然进入 AI', () => {
  const result = decide(
    '打开导数的几何意义实验并解释为什么',
  )

  assert.equal(result.decision, 'ai')
  assert.equal(result.reason, 'mixed-intent')
})

test('只有知识点名称时展示建议', () => {
  const result = decide('罗尔定理')

  assert.equal(result.decision, 'suggest')
  assert.equal(result.reason, 'clear-experiment-unclear-intent')
  assert.equal(result.target?.id, 'hm-05-01')
})

test('复合意图进入 AI 判断', () => {
  const result = decide(
    '画出导数的割线并解释为什么逼近切线',
  )

  assert.equal(result.decision, 'ai')
  assert.equal(result.reason, 'mixed-intent')
  assert.equal(result.target?.id, 'hm-04-05')
})

test('有操作意图但没有实验时进入 AI', () => {
  const result = decide('请绘制并动态展示一下')

  assert.equal(result.decision, 'ai')
  assert.equal(result.reason, 'intent-without-experiment')
  assert.equal(result.target, null)
})

test('无关问题返回 no-match', () => {
  const result = decide('今天天气怎么样')

  assert.equal(result.decision, 'no-match')
  assert.equal(result.reason, 'no-experiment-candidate')
  assert.equal(result.target, null)
})

test('相近但不唯一的实验候选也作为建议返回', () => {
  const result = decide('打开函数图')

  assert.equal(result.decision, 'suggest')
  assert.equal(
    result.reason,
    'ambiguous-experiment',
  )
  assert.ok(result.target)
})

test('完整标题仍允许直接路由', () => {
  const result = decide('打开函数在某一点的极限实验')

  assert.equal(result.decision, 'direct')
  assert.equal(result.target?.id, 'hm-02-02')
  assert.equal(result.target?.matchQuality, 'exact')
})

test('只有相近文本命中时禁止自动跳转', () => {
  const result = decide('打开函数图')

  assert.equal(result.decision, 'suggest')
  assert.equal(
    result.reason,
    'ambiguous-experiment',
  )
  assert.equal(result.target?.matchQuality, 'related')
})

test('计算请求进入回答分支并保留相关实验', () => {
  const result = decide('求 x^2 从 0 到 1 的定积分')

  assert.equal(result.decision, 'answer')
  assert.equal(result.reason, 'calculation-request')
  assert.equal(result.target?.id, 'hm-07-01')
})
