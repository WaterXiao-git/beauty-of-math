import test from 'node:test'
import assert from 'node:assert/strict'

import {
  classifyIntent,
} from './intentClassifier.js'

import {
  matchExperiments,
} from './experimentMatcher.js'

const OWNED_EXPERIMENT_IDS = new Set([
  'continuity',
  'continuity-properties',
  'function',
  'function-properties',
  'function-representation',
  'limit-of-sequence',
  'taylor',
  'epsilon-delta',
  'limit-laws',
  'two-important-limits',
  'infinitesimal',
  'derivative',
  'differential',
  'rolle',
  'graphing',
])

function classifyAndMatch(question: string) {
  const intentResult = classifyIntent(question)

  return matchExperiments(
    question,
    intentResult.primaryIntent,
  )
}

test('不会返回白名单之外的旧实验', () => {
  const result = matchExperiments(
    '打开傅里叶变换实验',
    'observe' as never,
  )

  assert.deepEqual(result.candidates, [])
})

test('能够匹配自研高数实验', () => {
  const result = matchExperiments(
    '用割线逼近切线解释导数',
    'observe' as never,
  )

  assert.equal(result.candidates[0]?.id, 'derivative')
})

test('极限定义的自然语言表达能够匹配自研实验', () => {
  const result = classifyAndMatch(
    '为什么 ε 邻域和 δ 邻域可以定义函数极限',
  )

  assert.equal(result.candidates[0]?.id, 'epsilon-delta')
})

test('无关问题不返回实验候选', () => {
  const result = classifyAndMatch(
    '今天天气怎么样',
  )

  assert.deepEqual(result.candidates, [])
})

test('所有候选都属于自研高数白名单', () => {
  const result = classifyAndMatch(
    '比较函数的单调性、极值和凹凸性来作图',
  )

  assert.ok(result.candidates.length > 0)
  assert.equal(
    result.candidates.every(
      ({ id }) => OWNED_EXPERIMENT_IDS.has(id),
    ),
    true,
  )
})

test('默认只返回最多三个候选', () => {
  const result = classifyAndMatch('极限')

  assert.ok(result.candidates.length <= 3)
})

test('比较问题可以同时召回两个自研知识点', () => {
  const result = classifyAndMatch('比较导数和微分')
  const candidateIds = result.candidates.map(
    (candidate) => candidate.id,
  )

  assert.ok(candidateIds.includes('derivative'))
  assert.ok(candidateIds.includes('differential'))
})

test('轻微错字仍可匹配自研实验标题', () => {
  const result = classifyAndMatch('罗尔定里')

  assert.equal(result.candidates[0]?.id, 'rolle')
  assert.equal(result.candidates[0]?.matchQuality, 'related')
})
