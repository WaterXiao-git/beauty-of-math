import assert from 'node:assert/strict'
import test from 'node:test'

import { OWNED_EXPERIMENT_REGISTRY } from './ownedExperimentRegistry.generated.js'

test('正式实验注册表只包含 150 个自研高数实验', () => {
  assert.equal(OWNED_EXPERIMENT_REGISTRY.length, 150)
  assert.equal(new Set(OWNED_EXPERIMENT_REGISTRY.map(({ id }) => id)).size, 150)
  assert.equal(
    OWNED_EXPERIMENT_REGISTRY.every(({ id }) => /^hm-\d{2}-\d{2}$/.test(id)),
    true,
  )
  assert.equal(
    OWNED_EXPERIMENT_REGISTRY.every(({ ownership }) => ownership === 'self-developed'),
    true,
  )
})
