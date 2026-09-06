import test from 'node:test'
import assert from 'node:assert/strict'

import {
  classifyIntent,
} from './intentClassifier.js'

import {
  matchExperiments,
} from './experimentMatcher.js'

const OWNED_EXPERIMENT_ID_PATTERN = /^hm-\d{2}-\d{2}$/

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

  assert.equal(result.candidates[0]?.id, 'hm-04-05')
})

test('极限定义的自然语言表达能够匹配自研实验', () => {
  const result = classifyAndMatch(
    '为什么 ε 邻域和 δ 邻域可以定义函数极限',
  )

  assert.equal(result.candidates[0]?.id, 'hm-02-02')
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
      ({ id }) => OWNED_EXPERIMENT_ID_PATTERN.test(id),
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

  assert.ok(candidateIds.includes('hm-04-05'))
  assert.ok(candidateIds.includes('hm-04-12'))
})

test('比较数列极限和函数极限时不会误命中极限四则运算', () => {
  const result = classifyAndMatch(
    '比较数列极限和函数极限',
  )
  const candidateIds = result.candidates.map(
    (candidate) => candidate.id,
  )

  assert.deepEqual(
    candidateIds.slice(0, 2),
    ['hm-02-01', 'hm-02-02'],
  )
  assert.equal(candidateIds.includes('hm-02-07'), false)
})

test('泰勒展开自然语言能够召回泰勒级数实验', () => {
  const result = classifyAndMatch(
    '泰勒展开到五阶会怎样',
  )

  assert.equal(result.candidates[0]?.id, 'hm-14-08')
})

test('定积分面积表达优先召回平面图形面积实验', () => {
  const result = classifyAndMatch(
    '用图像解释定积分怎么计算面积',
  )

  assert.equal(result.candidates[0]?.id, 'hm-08-01')
})

test('轻微错字仍可匹配自研实验标题', () => {
  const result = classifyAndMatch('罗尔定里')

  assert.equal(result.candidates[0]?.id, 'hm-05-01')
  assert.equal(result.candidates[0]?.matchQuality, 'related')
})

test('拼音输入只作为低权重召回实验候选', () => {
  const result = classifyAndMatch('luo er ding li')

  assert.equal(result.candidates[0]?.id, 'hm-05-01')
  assert.equal(result.candidates[0]?.matchQuality, 'related')
})
