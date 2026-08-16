import test from 'node:test'
import assert from 'node:assert/strict'

import {
  extractExperimentInitialParameters,
} from './parameterExtractor.js'

test('自研实验暂不从路由注入初始参数', () => {
  assert.deepEqual(
    extractExperimentInitialParameters(
      '用割线逼近切线，令 h=0.1',
      'derivative',
    ),
    {},
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
