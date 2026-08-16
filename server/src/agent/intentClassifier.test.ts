import test from 'node:test'
import assert from 'node:assert/strict'
import {
  classifyIntent,
  normalizeQuestion,
} from './intentClassifier.js'

test('规范化问题文本，但保留数学符号', () => {
  const result = normalizeQuestion(
    '  请画出：y = x^2！  ',
  )

  assert.equal(result, '请画出 y = x^2')
})

test('识别可视化意图', () => {
  const result = classifyIntent(
    '请动态演示 x^2 在 0 到 1 上的黎曼和',
  )

  assert.equal(result.primaryIntent, 'visualize')
  assert.equal(result.needsAI, false)
  assert.ok(result.confidence >= 0.7)
})

test('识别普通展示表达', () => {
  const result = classifyIntent(
    '展示偏微分方程',
  )

  assert.equal(result.primaryIntent, 'visualize')
  assert.equal(result.needsAI, false)
})

test('识别较长自然语言中的观察变化意图', () => {
  const result = classifyIntent(
    '我想观察矩形不断增加时，黎曼和怎样逐渐接近定积分',
  )

  assert.equal(result.primaryIntent, 'visualize')
  assert.equal(result.needsAI, false)
})

test('识别解释意图', () => {
  const result = classifyIntent(
    '为什么矩形数量越多，黎曼和越接近定积分？',
  )

  assert.equal(result.primaryIntent, 'explain')
  assert.equal(result.needsAI, false)
})

test('识别计算意图', () => {
  const result = classifyIntent(
    '计算 x^2 在 0 到 1 上的定积分',
  )

  assert.equal(result.primaryIntent, 'calculate')
})

test('识别比较意图', () => {
  const result = classifyIntent(
    '比较左端点和中点黎曼和的误差',
  )

  assert.equal(result.primaryIntent, 'compare')
})

test('识别查找实验意图', () => {
  const result = classifyIntent(
    '帮我打开黎曼和实验页面',
  )

  assert.equal(result.primaryIntent, 'find-experiment')
})

test('只有知识点名称时返回 unknown', () => {
  const result = classifyIntent('黎曼和')

  assert.equal(result.primaryIntent, 'unknown')
  assert.equal(result.needsAI, true)
})

test('混合意图时保留候选并降低置信度', () => {
  const result = classifyIntent(
    '画出这个函数并解释为什么它连续',
  )

  assert.ok(result.candidates.length >= 2)
  assert.equal(result.needsAI, true)

  const intents = result.candidates.map(
    (candidate) => candidate.intent,
  )

  assert.ok(intents.includes('visualize'))
  assert.ok(intents.includes('explain'))
})

test('空输入返回 unknown', () => {
  const result = classifyIntent('   ')

  assert.equal(result.primaryIntent, 'unknown')
  assert.equal(result.confidence, 0)
  assert.equal(result.needsAI, true)
})

test('算法一词不被误识别为计算意图', () => {
  const result = classifyIntent('演示最短路径算法')

  assert.equal(result.primaryIntent, 'visualize')
  assert.equal(
    result.candidates.some(
      (candidate) => candidate.intent === 'calculate',
    ),
    false,
  )
})
