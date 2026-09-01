import { describe, expect, it } from 'vitest'

import { sampleCurve } from './curve'

describe('安全曲线采样', () => {
  it('在 1/x 的奇点两侧生成两个分段', () => {
    const segments = sampleCurve({ fn: (x) => 1 / x, from: -1, to: 1, count: 40, yMin: -10, yMax: 10 })

    expect(segments).toHaveLength(2)
    expect(segments[0]?.every((point) => point.x < 0)).toBe(true)
    expect(segments[1]?.every((point) => point.x > 0)).toBe(true)
  })

  it('不把 tan(x) 的渐近线两侧连接起来', () => {
    const segments = sampleCurve({
      fn: Math.tan,
      from: 0,
      to: Math.PI,
      count: 80,
      yMin: -8,
      yMax: 8,
      jumpThreshold: 2,
    })

    expect(segments.length).toBeGreaterThanOrEqual(2)
    expect(segments.flat().every(({ y }) => Number.isFinite(y) && Math.abs(y) <= 8)).toBe(true)
  })

  it('排除 ln(x) 定义域外的采样点', () => {
    const points = sampleCurve({ fn: Math.log, from: -1, to: 2, count: 60, yMin: -8, yMax: 8 }).flat()

    expect(points.length).toBeGreaterThan(0)
    expect(points.every(({ x, y }) => x > 0 && Number.isFinite(y))).toBe(true)
  })

  it('在跳跃函数断点处主动断线', () => {
    const segments = sampleCurve({
      fn: (x) => x < 0 ? -1 : 1,
      from: -1,
      to: 1,
      count: 20,
      yMin: -2,
      yMax: 2,
      jumpThreshold: 1,
    })

    expect(segments).toHaveLength(2)
  })
})
