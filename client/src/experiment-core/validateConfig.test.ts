import { describe, expect, it } from 'vitest'

import { quadraticTestConfig, quadraticTestModel } from './runtime.test'
import { validateExperimentRegistration } from './validateConfig'

describe('实验注册校验', () => {
  it('接受计算结果完整且参数有效的注册', () => {
    expect(validateExperimentRegistration({ config: quadraticTestConfig, model: quadraticTestModel })).toEqual([])
  })

  it('识别模型 ID 不一致和缺少数学语义', () => {
    const errors = validateExperimentRegistration({
      config: { ...quadraticTestConfig, modelId: 'wrong' },
      model: {
        ...quadraticTestModel,
        parameters: () => [{
          ...quadraticTestModel.parameters(quadraticTestConfig.modelConfig)[0]!,
          meaning: '',
          unit: '',
        }],
      },
    })

    expect(errors.join('|')).toMatch(/modelId/)
    expect(errors.join('|')).toMatch(/数学含义/)
    expect(errors.join('|')).toMatch(/单位/)
  })

  it('识别不会改变任何声明输出的死参数', () => {
    const errors = validateExperimentRegistration({
      config: quadraticTestConfig,
      model: {
        ...quadraticTestModel,
        compute: (input) => quadraticTestModel.compute({ ...input, params: { a: 1 } }),
      },
    })

    expect(errors.join('|')).toMatch(/a.*plot/)
    expect(errors.join('|')).toMatch(/a.*formula/)
  })

  it('识别缺少条件和反例的实验', () => {
    const errors = validateExperimentRegistration({
      config: quadraticTestConfig,
      model: {
        ...quadraticTestModel,
        counterexamples: () => [],
        compute: (input) => ({ ...quadraticTestModel.compute(input), conditions: [] }),
      },
    })

    expect(errors.join('|')).toMatch(/成立条件/)
    expect(errors.join('|')).toMatch(/反例/)
  })

  it('识别非法整数步长', () => {
    const errors = validateExperimentRegistration({
      config: quadraticTestConfig,
      model: {
        ...quadraticTestModel,
        parameters: () => [{
          key: 'a', label: '项数', type: 'integer', min: 1, max: 10, step: 0.5,
          initial: 2, unit: '项', meaning: '离散项数', affects: ['plot'],
        }],
      },
    })

    expect(errors.join('|')).toMatch(/整数步长/)
  })
})
