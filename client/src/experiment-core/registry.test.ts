import { describe, expect, it } from 'vitest'

import { NATIVE_KNOWLEDGE_DEFINITIONS } from '../demo/knowledge-native/definitions'
import { sceneFingerprint, textFingerprint } from './fingerprint'
import { EXPERIMENT_REGISTRY, getExperimentRegistration } from './registry'
import { computeExperiment, createInitialParameterValues } from './runtime'
import { validateExperimentRegistration } from './validateConfig'

describe('分类数学模型注册表', () => {
  it('覆盖当前 135 个批量实验且 ID 完全一致', () => {
    expect(Object.keys(EXPERIMENT_REGISTRY).sort()).toEqual(
      NATIVE_KNOWLEDGE_DEFINITIONS.map(({ id }) => id).sort(),
    )
  })

  it('所有配置通过参数响应、条件和反例校验', () => {
    const errors = Object.values(EXPERIMENT_REGISTRY)
      .flatMap((registration) => validateExperimentRegistration(registration))

    expect(errors).toEqual([])
  })

  it('四种预测类型均由模型实际生成', () => {
    const types = new Set(Object.values(EXPERIMENT_REGISTRY).map(({ config, model }) => {
      const params = Object.fromEntries(model.parameters(config.modelConfig).map((spec) => [spec.key, spec.initial]))
      return model.buildPrediction(config.modelConfig, params).type
    }))

    expect(types).toEqual(new Set(['trend', 'boolean', 'numeric', 'choice']))
  })

  it('每个知识点的配置与基准数学输出组合均唯一', () => {
    const fingerprints = Object.values(EXPERIMENT_REGISTRY).map((registration) => {
      const result = computeExperiment(registration, createInitialParameterValues(registration))
      return textFingerprint([
        registration.config.mathematicalObject,
        registration.config.question,
        result.formula.text,
        result.observations.map(({ label, meaning }) => `${label}:${meaning}`).join('|'),
        result.conditions.map(({ label }) => label).join('|'),
        result.conclusion.statement,
        sceneFingerprint(result.scene),
      ].join('|'))
    })

    expect(new Set(fingerprints).size).toBe(fingerprints.length)
  })

  it('按 ID 返回同一注册并拒绝未知 ID', () => {
    expect(getExperimentRegistration('hm-02-01')?.config.id).toBe('hm-02-01')
    expect(getExperimentRegistration('unknown')).toBeNull()
  })
})
