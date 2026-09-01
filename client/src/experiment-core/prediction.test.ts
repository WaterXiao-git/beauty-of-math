import { describe, expect, it } from 'vitest'

import { judgePrediction, PredictionValidationError } from './prediction'
import type { PredictionSpec } from './schema'

describe('结构化预测判定', () => {
  it('判定趋势预测', () => {
    const spec = {
      id: 'trend-1',
      type: 'trend',
      prompt: '参数增大时误差如何变化？',
      answer: 'decrease',
    } satisfies PredictionSpec

    expect(judgePrediction(spec, { type: 'trend', value: 'decrease' }).correct).toBe(true)
    expect(judgePrediction(spec, { type: 'trend', value: 'increase' }).correct).toBe(false)
  })

  it('判定成立与否', () => {
    const spec = {
      id: 'boolean-1',
      type: 'boolean',
      prompt: '当前条件下定理是否成立？',
      answer: true,
    } satisfies PredictionSpec

    expect(judgePrediction(spec, { type: 'boolean', value: true }).correct).toBe(true)
  })

  it('分别支持绝对误差和相对误差', () => {
    const absolute = {
      id: 'numeric-absolute',
      type: 'numeric',
      prompt: '预测极限值',
      answer: 2,
      absoluteTolerance: 0.05,
    } satisfies PredictionSpec
    const relative = {
      id: 'numeric-relative',
      type: 'numeric',
      prompt: '预测面积',
      answer: 100,
      relativeTolerance: 0.02,
    } satisfies PredictionSpec

    expect(judgePrediction(absolute, { type: 'numeric', value: 2.04 }).correct).toBe(true)
    expect(judgePrediction(absolute, { type: 'numeric', value: 2.08 }).correct).toBe(false)
    expect(judgePrediction(relative, { type: 'numeric', value: 101.5 }).correct).toBe(true)
    expect(judgePrediction(relative, { type: 'numeric', value: 103 }).correct).toBe(false)
  })

  it('将多选按集合判定、排序按顺序判定', () => {
    const multiple = {
      id: 'choice-multiple',
      type: 'choice',
      mode: 'multiple',
      prompt: '选择满足条件的函数',
      options: [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
        { value: 'c', label: 'C' },
      ],
      answer: ['a', 'c'],
    } satisfies PredictionSpec
    const ordered = { ...multiple, id: 'choice-order', mode: 'order', answer: ['a', 'c'] } satisfies PredictionSpec

    expect(judgePrediction(multiple, { type: 'choice', value: ['c', 'a'] }).correct).toBe(true)
    expect(judgePrediction(ordered, { type: 'choice', value: ['c', 'a'] }).correct).toBe(false)
  })

  it('拒绝题型不匹配及非有限数值', () => {
    const spec = {
      id: 'numeric-invalid',
      type: 'numeric',
      prompt: '预测数值',
      answer: 1,
      absoluteTolerance: 0.1,
    } satisfies PredictionSpec

    expect(() => judgePrediction(spec, { type: 'boolean', value: true })).toThrow(PredictionValidationError)
    expect(() => judgePrediction(spec, { type: 'numeric', value: Number.NaN })).toThrow(/有限/)
  })
})
