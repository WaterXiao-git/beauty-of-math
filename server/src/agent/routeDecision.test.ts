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

  return decideRoute(
    intent,
    experimentResult.candidates,
  )
}

test('意图和实验明确时直接路由', () => {
  const result = decide(
    '动态演示黎曼和的逼近过程',
  )

  assert.equal(result.decision, 'direct')
  assert.equal(result.reason, 'clear-route')
  assert.equal(result.target?.id, 'riemann-sum')
})

test('查找实验意图明确时直接路由', () => {
  const result = decide(
    '打开函数图像平移实验页面',
  )

  assert.equal(result.decision, 'direct')
  assert.equal(
    result.target?.id,
    'function-transform',
  )
})

test('只有知识点名称时展示建议', () => {
  const result = decide('黎曼和')

  assert.equal(result.decision, 'suggest')

  assert.equal(
    result.reason,
    'clear-experiment-unclear-intent',
  )

  assert.equal(result.target?.id, 'riemann-sum')
})

test('复合意图进入 AI 判断', () => {
  const result = decide(
    '画出黎曼和并解释为什么它能逼近定积分',
  )

  assert.equal(result.decision, 'ai')
  assert.equal(result.reason, 'mixed-intent')
  assert.equal(result.target?.id, 'riemann-sum')
})

test('有操作意图但没有实验时进入 AI', () => {
  const result = decide(
    '请绘制并动态展示一下',
  )

  assert.equal(result.decision, 'ai')

  assert.equal(
    result.reason,
    'intent-without-experiment',
  )

  assert.equal(result.target, null)
})

test('无关问题返回 no-match', () => {
  const result = decide(
    '今天天气怎么样',
  )

  assert.equal(result.decision, 'no-match')

  assert.equal(
    result.reason,
    'no-experiment-candidate',
  )

  assert.equal(result.target, null)
})