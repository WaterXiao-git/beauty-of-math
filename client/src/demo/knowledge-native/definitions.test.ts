import { describe, expect, it } from 'vitest'
import { NATIVE_KNOWLEDGE_DEFINITIONS } from './definitions'

describe('剩余 135 个 Native 实验规格', () => {
  it('每个知识点都有唯一 ID、公式、步骤组合与场景签名', () => {
    expect(NATIVE_KNOWLEDGE_DEFINITIONS).toHaveLength(135)
    expect(new Set(NATIVE_KNOWLEDGE_DEFINITIONS.map(({ id }) => id)).size).toBe(135)
    expect(new Set(NATIVE_KNOWLEDGE_DEFINITIONS.map(({ formula }) => formula)).size).toBe(135)
    expect(new Set(NATIVE_KNOWLEDGE_DEFINITIONS.map(({ steps }) => steps.join('|'))).size).toBe(135)
    expect(new Set(NATIVE_KNOWLEDGE_DEFINITIONS.map(({ signature }) => signature)).size).toBe(135)
  })

  it('每个实验都有两个可调参数和四个教学步骤', () => {
    for (const definition of NATIVE_KNOWLEDGE_DEFINITIONS) {
      expect(definition.parameter.max).toBeGreaterThan(definition.parameter.min)
      expect(definition.secondary.max).toBeGreaterThan(definition.secondary.min)
      expect(definition.steps).toHaveLength(4)
    }
  })
})
