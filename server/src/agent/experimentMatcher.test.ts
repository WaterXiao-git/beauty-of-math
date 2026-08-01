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

test('核心标题可以匹配带可视化后缀的实验', () => {
  const result = classifyAndMatch('分数')

  assert.equal(
    result.candidates[0]?.id,
    'fractions',
  )

  assert.ok(
    result.candidates[0]
      ?.matchedSignals.some((signal) =>
        signal === '别名:分数' ||
        signal === '核心标题:分数可视化',
      ),
  )
})

test('分数的自然语言说法可以匹配分数实验', () => {
  const questions = [
    '怎么理解分子和分母',
    '用饼图表示几分之几',
    '两个分数谁更大',
  ]

  for (const question of questions) {
    const result = classifyAndMatch(question)

    assert.equal(
      result.candidates[0]?.id,
      'fractions',
      question,
    )
  }
})

test('核心词不完整时仍然返回相近候选', () => {
  const result = classifyAndMatch('偏微分')

  assert.equal(
    result.candidates[0]?.id,
    'pde',
  )

  assert.ok(
    result.candidates[0]
      ?.matchedSignals.includes(
        '核心标题:偏微分方程',
      ),
  )
})

test('优先匹配更长的完整实验标题', () => {
  const pdeResult = classifyAndMatch(
    '打开偏微分方程实验',
  )

  assert.equal(
    pdeResult.candidates[0]?.id,
    'pde',
  )

  assert.ok(
    !pdeResult.candidates.some(
      (candidate) =>
        candidate.id === 'ode',
    ),
  )

  const fftResult = classifyAndMatch(
    '打开快速傅里叶变换实验',
  )

  assert.equal(
    fftResult.candidates[0]?.id,
    'fft',
  )

  assert.ok(
    !fftResult.candidates.some(
      (candidate) =>
        candidate.id === 'fourier',
    ),
  )
})

test('语义短语允许常见量词插入', () => {
  const result = classifyAndMatch(
    '用有限个点补出一条连续曲线',
  )

  assert.equal(
    result.candidates[0]?.id,
    'interpolation',
  )

  assert.ok(
    result.candidates[0]
      ?.matchedSignals.includes(
        '强短语:有限个点补出连续曲线',
      ),
  )
})
