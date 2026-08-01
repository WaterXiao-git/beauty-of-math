import test from 'node:test'
import assert from 'node:assert/strict'

import {
  routeQuestion,
} from './questionRouter.js'

test('组合识别解释意图和黎曼和模块', () => {
  const result = routeQuestion(
    '为什么矩形数量越多，黎曼和越接近定积分',
  )

  assert.equal(
    result.intent.primaryIntent,
    'explain',
  )

  assert.equal(
    result.experiments[0]?.id,
    'riemann-sum',
  )
})

test('组合识别可视化意图和旋转体模块', () => {
  const result = routeQuestion(
    '动态展示曲线绕x轴旋转形成的立体',
  )

  assert.equal(
    result.intent.primaryIntent,
    'visualize',
  )

  assert.equal(
    result.experiments[0]?.id,
    'solid-of-revolution',
  )
})

test('只有知识点名称时仍然可以匹配实验', () => {
  const result = routeQuestion('黎曼和')

  assert.equal(
    result.intent.primaryIntent,
    'unknown',
  )

  assert.equal(
    result.intent.needsAI,
    true,
  )

  assert.equal(
    result.experiments[0]?.id,
    'riemann-sum',
  )
})

test('无关问题没有实验候选', () => {
  const result = routeQuestion(
    '今天天气怎么样',
  )

  assert.equal(
    result.experiments.length,
    0,
  )
})

test('混合意图保留 needsAI 标记', () => {
  const result = routeQuestion(
    '画出函数图像并解释为什么它连续',
  )

  assert.equal(
    result.intent.needsAI,
    true,
  )

  const intents = result.intent.candidates.map(
    (candidate) => candidate.intent,
  )

  assert.ok(intents.includes('visualize'))
  assert.ok(intents.includes('explain'))
})

test('明确问题产生 direct 决策', () => {
  const result = routeQuestion(
    '动态演示黎曼和的逼近过程',
  )

  assert.equal(
    result.routeDecision.decision,
    'direct',
  )

  assert.equal(
    result.routeDecision.target?.id,
    'riemann-sum',
  )
})

test('返回去除实验标题干扰后的操作意图', () => {
  const result = routeQuestion(
    '打开加减乘除可视化实验',
  )

  assert.equal(
    result.intent.primaryIntent,
    'find-experiment',
  )

  assert.equal(result.intent.needsAI, false)

  assert.equal(
    result.routeDecision.decision,
    'direct',
  )
})

test('只有知识点时产生 suggest 决策', () => {
  const result = routeQuestion('黎曼和')

  assert.equal(
    result.routeDecision.decision,
    'suggest',
  )
})

test('无关问题产生 no-match 决策', () => {
  const result = routeQuestion(
    '今天天气怎么样',
  )

  assert.equal(
    result.routeDecision.decision,
    'no-match',
  )
})

test('分数核心词产生分数实验建议', () => {
  const result = routeQuestion('分数')

  assert.equal(
    result.experiments[0]?.id,
    'fractions',
  )
  assert.equal(
    result.routeDecision.decision,
    'suggest',
  )
})
