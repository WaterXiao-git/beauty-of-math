import { describe, expect, it } from 'vitest'

import {
  createLearningSession,
  selectLearningStep,
  submitLearningPrediction,
  updateLearningParameter,
} from './learningSession'
import { quadraticTestConfig, quadraticTestModel } from './runtime.test'

const registration = { config: quadraticTestConfig, model: quadraticTestModel }

describe('实验学习闭环状态', () => {
  it('初始停留在预测阶段并禁止越过预测', () => {
    const session = createLearningSession(registration)

    expect(session.step).toBe(2)
    expect(session.prediction.type).toBe('trend')
    expect(() => selectLearningStep(session, 3)).toThrow(/先提交预测/)
    expect(() => updateLearningParameter(registration, session, 'a', 1.2)).toThrow(/先提交预测/)
  })

  it('提交预测后开放参数并同步重算全部数学结果', () => {
    const predicted = submitLearningPrediction(
      createLearningSession(registration),
      { type: 'trend', value: 'increase' },
      '因为系数直接放大函数值',
    )
    const updated = updateLearningParameter(registration, predicted, 'a', 1.2)

    expect(predicted.judgement?.correct).toBe(true)
    expect(predicted.reason).toBe('因为系数直接放大函数值')
    expect(updated.params.a).toBe(1.2)
    expect(updated.computation.formula.text).toBe('y=1.2x²')
    expect(updated.computation.scene.points[1]).toEqual({ x: 1, y: 1.2 })
    expect(updated.computation.observations[0]?.formattedValue).toBe('1.20')
  })

  it('提交错误预测也允许实验并保留对比结果', () => {
    const session = submitLearningPrediction(
      createLearningSession(registration),
      { type: 'trend', value: 'decrease' },
    )

    expect(session.step).toBe(3)
    expect(session.judgement?.correct).toBe(false)
    expect(selectLearningStep(session, 6).step).toBe(6)
  })
})
