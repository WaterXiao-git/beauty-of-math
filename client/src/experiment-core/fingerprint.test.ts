import { describe, expect, it } from 'vitest'

import { sceneFingerprint, textFingerprint } from './fingerprint'

describe('实验质量指纹', () => {
  it('对象键顺序不影响场景指纹', () => {
    expect(sceneFingerprint({ b: 2, a: [1, 3] })).toBe(sceneFingerprint({ a: [1, 3], b: 2 }))
  })

  it('绘图数值变化会改变场景指纹', () => {
    expect(sceneFingerprint({ points: [{ x: 0, y: 1 }] })).not.toBe(
      sceneFingerprint({ points: [{ x: 0, y: 2 }] }),
    )
  })

  it('文案指纹忽略空白和常见标点差异', () => {
    expect(textFingerprint('验证 极限，观察误差。')).toBe(textFingerprint('验证极限观察误差'))
  })
})
