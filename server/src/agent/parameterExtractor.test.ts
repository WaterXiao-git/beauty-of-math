import test from 'node:test'
import assert from 'node:assert/strict'

import {
  extractExperimentInitialParameters,
} from './parameterExtractor.js'

test('提取基础运算和方块参数', () => {
  assert.deepEqual(
    extractExperimentInitialParameters(
      '用方块演示 23 - 8',
      'basic-arithmetic',
    ),
    {
      operation: 'subtraction',
      num1: 23,
      num2: 8,
      showBlocks: true,
    },
  )
})

test('提取圆锥曲线类型、参数和展示意图', () => {
  assert.deepEqual(
    extractExperimentInitialParameters(
      '展示椭圆 a=6、b=2，并观察焦点动态变化',
      'conic-sections',
    ),
    {
      conicType: 'ellipse',
      a: 6,
      b: 2,
      showFoci: true,
      autoPlay: true,
    },
  )
})

test('未知实验不生成参数', () => {
  assert.deepEqual(
    extractExperimentInitialParameters(
      '任意问题',
      'unknown-experiment',
    ),
    {},
  )
})
