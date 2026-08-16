import assert from 'node:assert/strict'
import test from 'node:test'

import { promoteGeneratableNoMatch } from './generationOffer.js'
import type { RouteDecisionResult } from './routeDecision.js'

const noMatch: RouteDecisionResult = {
  decision: 'no-match',
  reason: 'ai-confirmed-no-match',
  message: '没有预设实验。',
  target: null,
  alternatives: [],
  scoreGap: 0,
}

test('可生成的数学可视化不会被模型降级成无操作死路', () => {
  const result = promoteGeneratableNoMatch(noMatch, true)
  assert.equal(result.decision, 'ai')
  assert.match(result.message, /确认生成/)
})

test('非数学请求和已有路由决策保持不变', () => {
  assert.equal(promoteGeneratableNoMatch(noMatch, false), noMatch)

  const direct = { ...noMatch, decision: 'direct' as const }
  assert.equal(promoteGeneratableNoMatch(direct, true), direct)
})
