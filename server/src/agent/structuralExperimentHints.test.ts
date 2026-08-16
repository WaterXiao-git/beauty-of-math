import assert from 'node:assert/strict'
import test from 'node:test'

import {
  inferStructuralExperimentHints,
} from './structuralExperimentHints.js'

const cases = [
  ['用 ε 和 δ 的误差带解释函数极限', 'epsilon-delta'],
  ['比较极限的和差积商', 'limit-laws'],
  ['观察两个重要极限的收敛过程', 'two-important-limits'],
  ['无穷小量如何趋近于零', 'infinitesimal'],
  ['用割线逼近切线理解导数', 'derivative'],
  ['用线性近似比较函数增量和微分', 'differential'],
  ['验证罗尔定理的水平切线', 'rolle'],
  ['根据单调性、极值和凹凸性描绘函数图形', 'graphing'],
] as const

for (const [question, expectedId] of cases) {
  test(`识别高数结构：${question}`, () => {
    const hints = inferStructuralExperimentHints(question)

    assert.equal(hints.has(expectedId), true)
  })
}

test('旧课程结构不产生正式实验提示', () => {
  const hints = inferStructuralExperimentHints(
    '用傅里叶级数画一个图形',
  )

  assert.equal(hints.size, 0)
})
