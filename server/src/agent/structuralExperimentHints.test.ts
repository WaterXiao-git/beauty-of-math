import assert from 'node:assert/strict'
import test from 'node:test'

import {
  inferStructuralExperimentHints,
} from './structuralExperimentHints.js'

const cases = [
  ['用方块演示 23 - 8', 'basic-arithmetic'],
  ['演示 7+5', 'basic-arithmetic'],
  ['在数轴上算 12-4', 'basic-arithmetic'],
  ['帮我看看 3 乘 4', 'basic-arithmetic'],
  ['20 除以 5 怎么表示', 'basic-arithmetic'],
  ['把 3/4 画成饼图', 'fractions'],
  ['比较 1/2 和 2/3 谁更大', 'fractions'],
  ['画一个三角形并观察面积变化', 'geometry-shapes'],
  ['展示椭圆 a=5、b=3 和焦点', 'conic-sections'],
  ['观察抛物线的焦点和准线', 'conic-sections'],
  ['画出 y=2*x+1 的图像', 'linear-function'],
  ['画出 y=x^2-4*x+3', 'quadratic-function'],
  ['画出心形线 r=1-cos(theta)', 'polar'],
  ['演示最短路径算法', 'dijkstra'],
  ['模拟抛硬币并统计正面概率', 'law-large-numbers'],
  ['随机投点估计 pi', 'monte-carlo'],
  ['画出一个莫比乌斯带并控制扭转次数', 'mobius'],
  ['展示克莱因瓶的结构', 'torus-klein'],
  ['展示洛伦兹吸引子的蝴蝶效应', 'lorenz-attractor'],
  ['展示混沌系统对初始条件的敏感性', 'chaos'],
  ['画一个分形树', 'pythagoras-tree'],
  ['演示 RSA 加密过程', 'rsa-cipher'],
  ['观察复数乘法在复平面上的旋转', 'complex'],
  ['给图做广度优先搜索', 'bfs-dfs'],
  ['展示向量点积和夹角', 'dot-cross-product'],
  ['观察 logistic regression 分类边界', 'logistic-regression'],
  ['展示球面上的三角形', 'spherical-geometry'],
  ['用傅里叶级数画一个图形', 'fourier-drawing'],
  ['模拟排队等待时间', 'poisson-process'],
] as const

for (const [question, expectedId] of cases) {
  test(`识别数学结构：${question}`, () => {
    const hints = inferStructuralExperimentHints(question)

    assert.equal(hints.has(expectedId), true)
  })
}

test('分数饼图不误判成除法算术', () => {
  const hints = inferStructuralExperimentHints(
    '把 3/4 画成饼图',
  )

  assert.equal(hints.has('fractions'), true)
  assert.equal(hints.has('basic-arithmetic'), false)
})

test('椭圆曲线不误判成圆锥曲线', () => {
  const hints = inferStructuralExperimentHints(
    '展示椭圆曲线上的点加法',
  )

  assert.equal(hints.has('conic-sections'), false)
})

test('莫比乌斯函数不误判成莫比乌斯环', () => {
  const hints = inferStructuralExperimentHints(
    '解释莫比乌斯函数的取值',
  )

  assert.equal(hints.has('mobius'), false)
})

test('非数学绘画不产生实验结构提示', () => {
  const hints = inferStructuralExperimentHints(
    '帮我画一只小猫',
  )

  assert.equal(hints.size, 0)
})

test('函数公式里的减号不误判成基础算术', () => {
  const hints = inferStructuralExperimentHints(
    '画出 y=x^2-4*x+3',
  )

  assert.equal(hints.has('quadratic-function'), true)
  assert.equal(hints.has('basic-arithmetic'), false)
})
