import test from 'node:test'
import assert from 'node:assert/strict'

import {
  loadAgentAIConfig,
} from './config.js'

test('默认选择 DeepSeek V4 Flash 和千问 3.7 Plus', () => {
  const config = loadAgentAIConfig({
    DEEPSEEK_API_KEY: 'deepseek-test-key',
    QWEN_API_KEY: 'qwen-test-key',
  })

  assert.equal(config.enabled, true)
  assert.equal(
    config.primary?.model,
    'deepseek-v4-flash',
  )
  assert.equal(
    config.reviewer?.model,
    'qwen3.7-plus',
  )
})
test('可以显式关闭 AI 且不在配置结果中复制额外字段', () => {
  const config = loadAgentAIConfig({
    AGENT_AI_ENABLED: 'false',
    DEEPSEEK_API_KEY: 'deepseek-test-key',
    UNRELATED_SECRET: 'do-not-copy',
  })

  assert.equal(config.enabled, false)
  assert.equal(
    'UNRELATED_SECRET' in config,
    false,
  )
})
