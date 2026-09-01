import { describe, expect, it } from 'vitest'

import { computeExperiment, createInitialParameterValues } from './runtime'
import type { ExperimentConfig, MathModel } from './model'

const config: ExperimentConfig<{ base: number }> = {
  id: 'test-quadratic',
  family: 'function-1d',
  modelId: 'quadratic',
  title: '二次函数参数实验',
  question: '系数增大时函数值如何变化？',
  mathematicalObject: '二次函数 y=ax²',
  modelConfig: { base: 1 },
  observationKeys: ['valueAtOne'],
  learningGoals: ['理解系数对函数值的影响'],
}

const model: MathModel<{ base: number }, { kind: 'cartesian'; points: readonly { x: number; y: number }[] }> = {
  id: 'quadratic',
  family: 'function-1d',
  parameters: () => [{
    key: 'a', label: '二次项系数', type: 'continuous', min: 0.5, max: 3, step: 0.1,
    initial: 1, unit: null, meaning: '控制抛物线开口伸缩',
    affects: ['formula', 'plot', 'observation', 'conclusion'],
  }],
  buildPrediction: () => ({
    id: 'quadratic-trend', type: 'trend', prompt: 'a 墦大时 f(1) 如何变化？', answer: 'increase',
  }),
  counterexamples: () => [{
    id: 'negative-a', label: '负系数', explanation: '符号改变后趋势反转', parameterOverrides: { a: -1 },
    expectedFailureConditionIds: ['positive-a'],
  }],
  compute: ({ params }) => {
    const a = params.a as number
    return {
      formula: { text: `y=${a.toFixed(1)}x²` },
      scene: { kind: 'cartesian', points: [{ x: 0, y: 0 }, { x: 1, y: a }] },
      observations: [{ key: 'valueAtOne', label: 'f(1)', value: a, formattedValue: a.toFixed(2), meaning: 'x=1 时的函数值' }],
      conditions: [{ id: 'positive-a', label: 'a>0', satisfied: a > 0, evidence: `a=${a}`, failureReason: a > 0 ? null : 'a 不是正数' }],
      verification: { passed: a > 0, rule: 'a>0', evidence: [`a=${a}`], failureReasons: a > 0 ? [] : ['a 不是正数'] },
      conclusion: { status: a > 0 ? 'confirmed' : 'refuted', statement: `f(1)=${a}`, reason: '代入 x=1 直接计算' },
      actualPredictionAnswer: a > 0 ? 'increase' : 'decrease',
      explanation: '系数 a 直接乘在 x² 前面。',
    }
  },
}

describe('分类数学模型运行时', () => {
  it('从参数 schema 建立初值', () => {
    expect(createInitialParameterValues({ config, model })).toEqual({ a: 1 })
  })

  it('同一次计算返回公式、图像、观测、条件和结论', () => {
    const result = computeExperiment({ config, model }, { a: 2 })

    expect(result.formula.text).toBe('y=2.0x²')
    expect(result.scene.points[1]).toEqual({ x: 1, y: 2 })
    expect(result.observations[0]?.formattedValue).toBe('2.00')
    expect(result.conditions[0]?.satisfied).toBe(true)
    expect(result.verification.passed).toBe(true)
    expect(result.conclusion.status).toBe('confirmed')
    expect(result.actualPredictionAnswer).toBe('increase')
  })

  it('计算前拒绝越界参数', () => {
    expect(() => computeExperiment({ config, model }, { a: 9 })).toThrow(/a/)
  })
})

export { config as quadraticTestConfig, model as quadraticTestModel }
