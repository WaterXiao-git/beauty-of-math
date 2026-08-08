import assert from 'node:assert/strict'
import test from 'node:test'

import { validateExperimentAlignment } from './alignment.js'
import type { DynamicExperimentSpec } from './types.js'

function spec(
  title: string,
  renderer: DynamicExperimentSpec['renderer'],
): DynamicExperimentSpec {
  return {
    version: 1,
    title,
    description: `用于观察${title}。`,
    gradeLevel: '高中',
    formulaLatex: '',
    parameters: [],
    renderer,
    steps: [{ title: '观察', description: `观察${title}的变化。`, parameterValues: {} }],
    knowledgePoints: [`${title}的基本知识。`],
  }
}

const cartesian = {
  type: 'cartesian-2d' as const,
  expression: 'x^2',
  xMin: -5,
  xMax: 5,
  yMin: -5,
  yMax: 10,
  samples: 300,
}

const sandbox = {
  type: 'sandboxed-html' as const,
  document: '<canvas></canvas>',
  height: 560,
}

test('拒绝用二维函数曲线冒充三维或高维实验', () => {
  for (const question of [
    '画一个四维超立方体的三维投影',
    '展示三维曲面的旋转过程',
    '观察矩阵变换如何作用于平面网格',
  ]) {
    assert.equal(
      validateExperimentAlignment(question, spec('二次函数', cartesian)).valid,
      false,
    )
  }
})

test('拒绝用函数曲线冒充算法、随机模拟和分形实验', () => {
  for (const question of [
    '动态演示冒泡排序算法',
    '模拟抛硬币并统计正面概率',
    '画出曼德勃罗分形并缩放观察',
  ]) {
    assert.equal(
      validateExperimentAlignment(question, spec('正弦函数', cartesian)).valid,
      false,
    )
  }
})

test('接受主题和渲染能力一致的通用交互画布', () => {
  assert.equal(
    validateExperimentAlignment(
      '动态演示冒泡排序算法',
      spec('冒泡排序算法', sandbox),
    ).valid,
    true,
  )
})

test('极坐标与显式函数必须使用各自的结构化渲染器', () => {
  assert.equal(
    validateExperimentAlignment('画出极坐标心形线', spec('心形线', cartesian)).valid,
    false,
  )
  assert.equal(
    validateExperimentAlignment('画出 y=x^2', spec('二次函数', cartesian)).valid,
    true,
  )
})
