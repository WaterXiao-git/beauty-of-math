import test from 'node:test'
import assert from 'node:assert/strict'

import {
  classifyIntent,
} from './intentClassifier.js'

import {
  matchExperiments,
} from './experimentMatcher.js'

function classifyAndMatch(question: string) {
  const intentResult = classifyIntent(question)

  return matchExperiments(
    question,
    intentResult.primaryIntent,
  )
}

test('匹配黎曼和实验', () => {
  const result = classifyAndMatch(
    '动态演示黎曼和的逼近过程',
  )

  assert.equal(
    result.candidates[0]?.id,
    'riemann-sum',
  )

  assert.ok(
    result.candidates[0].confidence >= 0.7,
  )
})

test('匹配 epsilon-delta 极限实验', () => {
  const result = classifyAndMatch(
    '为什么ε邻域和δ邻域可以定义函数极限',
  )

  assert.equal(
    result.candidates[0]?.id,
    'epsilon-delta',
  )
})

test('匹配函数图像变换实验', () => {
  const result = classifyAndMatch(
    '打开函数图像平移实验页面',
  )

  assert.equal(
    result.candidates[0]?.id,
    'function-transform',
  )
})

test('匹配导数定义与切线实验', () => {
  const result = classifyAndMatch(
    '比较割线和切线斜率的变化',
  )

  assert.equal(
    result.candidates[0]?.id,
    'derivative-definition',
  )
})

test('匹配旋转体体积实验', () => {
  const result = classifyAndMatch(
    '展示曲线绕x轴旋转形成的立体体积',
  )

  assert.equal(
    result.candidates[0]?.id,
    'solid-of-revolution',
  )
})

test('只有知识点名称也可以匹配实验', () => {
  const intentResult = classifyIntent('黎曼和')

  assert.equal(
    intentResult.primaryIntent,
    'unknown',
  )

  const result = matchExperiments(
    '黎曼和',
    intentResult.primaryIntent,
  )

  assert.equal(
    result.candidates[0]?.id,
    'riemann-sum',
  )
})

test('无关问题不返回实验候选', () => {
  const result = classifyAndMatch(
    '今天天气怎么样',
  )

  assert.equal(
    result.candidates.length,
    0,
  )
})

test('默认只返回最多三个候选', () => {
  const result = classifyAndMatch(
    '展示函数积分面积和变化过程',
  )

  assert.ok(
    result.candidates.length <= 3,
  )
})