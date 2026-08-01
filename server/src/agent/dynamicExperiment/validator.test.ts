import test from 'node:test'
import assert from 'node:assert/strict'

import {
  isSafeMathExpression,
  parseDynamicExperimentSpec,
} from './validator.js'

function validSpec() {
  return {
    version: 1,
    title: '心形线参数实验',
    description: '观察参数改变时心形线的形状。',
    gradeLevel: '高中',
    formulaLatex: 'r=a(1-\\cos\\theta)',
    parameters: [
      {
        id: 'a',
        label: '缩放参数 a',
        min: 0.5,
        max: 3,
        step: 0.1,
        defaultValue: 1,
        unit: '',
      },
    ],
    renderer: {
      type: 'polar-2d',
      expression: 'a * (1 - cos(theta))',
      thetaMin: 0,
      thetaMax: 6.283185307,
      radiusMax: 6,
      samples: 500,
    },
    steps: [
      {
        title: '观察基本曲线',
        description: '先观察 a=1 时的心形线。',
        parameterValues: { a: 1 },
      },
    ],
    knowledgePoints: [
      '心形线是一类特殊的极坐标曲线。',
    ],
  }
}

test('接受受限的动态实验配置', () => {
  const parsed = parseDynamicExperimentSpec(
    validSpec(),
  )

  assert.equal(parsed?.renderer.type, 'polar-2d')
  assert.equal(parsed?.parameters[0]?.id, 'a')
})

test('拒绝包含未授权标识符的表达式', () => {
  assert.equal(
    isSafeMathExpression(
      'import("fs")',
      new Set(['x']),
    ),
    false,
  )

  const spec = validSpec()
  spec.renderer.expression = 'dangerous(theta)'

  assert.equal(
    parseDynamicExperimentSpec(spec),
    null,
  )
})

test('拒绝越界参数和除以零的运算配置', () => {
  const spec = validSpec()
  spec.parameters[0]!.defaultValue = 99

  assert.equal(
    parseDynamicExperimentSpec(spec),
    null,
  )

  const arithmeticSpec = {
    ...validSpec(),
    parameters: [],
    renderer: {
      type: 'arithmetic-blocks',
      operation: 'division',
      left: 12,
      right: 0,
    },
  }

  assert.equal(
    parseDynamicExperimentSpec(arithmeticSpec),
    null,
  )
})
