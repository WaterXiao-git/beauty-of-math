import { describe, expect, it } from 'vitest'

import {
  normalizeParameterValue,
  normalizeParameterValues,
  ParameterValidationError,
} from './parameters'
import type { ParameterSpec } from './schema'

const continuous = {
  key: 'x',
  label: '横坐标',
  type: 'continuous',
  min: -2,
  max: 2,
  step: 0.1,
  initial: 0,
  unit: null,
  meaning: '函数的输入值',
  affects: ['plot', 'observation'],
} satisfies ParameterSpec

const integer = {
  key: 'n',
  label: '项数',
  type: 'integer',
  min: 1,
  max: 20,
  step: 1,
  initial: 4,
  unit: '项',
  meaning: '参与计算的离散项数',
  affects: ['plot', 'observation'],
} satisfies ParameterSpec

describe('实验参数归一化', () => {
  it('接受合法连续量并消除浮点步长噪声', () => {
    expect(normalizeParameterValue(continuous, 0.30000000000000004)).toBeCloseTo(0.3)
  })

  it('拒绝非整数的离散量', () => {
    expect(() => normalizeParameterValue(integer, 2.5)).toThrow(/整数/)
  })

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -2.1, 2.1])(
    '拒绝非法连续值 %s',
    (value) => {
      expect(() => normalizeParameterValue(continuous, value)).toThrow(ParameterValidationError)
    },
  )

  it('拒绝不属于枚举选项的值', () => {
    const spec = {
      key: 'method',
      label: '取样方法',
      type: 'choice',
      initial: 'left',
      options: [
        { value: 'left', label: '左端点' },
        { value: 'mid', label: '中点' },
      ],
      unit: null,
      meaning: '黎曼和的取样位置',
      affects: ['plot', 'observation'],
    } satisfies ParameterSpec

    expect(() => normalizeParameterValue(spec, 'right')).toThrow(/选项/)
  })

  it('拒绝布尔参数以字符串冒充布尔值', () => {
    const spec = {
      key: 'compare',
      label: '显示对照',
      type: 'boolean',
      initial: false,
      unit: null,
      meaning: '是否显示反例对照',
      affects: ['plot'],
    } satisfies ParameterSpec

    expect(() => normalizeParameterValue(spec, 'true')).toThrow(/布尔/)
  })

  it('一次归一化完整参数记录并拒绝缺失值', () => {
    expect(normalizeParameterValues([continuous, integer], { x: 1.2, n: 8 })).toEqual({ x: 1.2, n: 8 })
    expect(() => normalizeParameterValues([continuous, integer], { x: 1.2 })).toThrow(/n/)
  })
})
