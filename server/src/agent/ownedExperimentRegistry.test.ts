import assert from 'node:assert/strict'
import test from 'node:test'

import { OWNED_EXPERIMENT_REGISTRY } from './ownedExperimentRegistry.generated.js'

const EXPECTED_IDS = [
  'continuity',
  'continuity-properties',
  'definite-integral',
  'derivative',
  'differential',
  'epsilon-delta',
  'function',
  'function-properties',
  'function-representation',
  'graphing',
  'indefinite-integral',
  'infinitesimal',
  'limit-laws',
  'limit-of-sequence',
  'newton-method',
  'rolle',
  'taylor',
  'two-important-limits',
]

test('正式实验注册表只包含 18 个自研高数实验', () => {
  assert.deepEqual(
    OWNED_EXPERIMENT_REGISTRY.map(({ id }) => id).sort(),
    EXPECTED_IDS,
  )
  assert.equal(
    OWNED_EXPERIMENT_REGISTRY.every(({ ownership }) => ownership === 'self-developed'),
    true,
  )
})
