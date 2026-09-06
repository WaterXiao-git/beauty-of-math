import { describe, expect, it } from 'vitest'

import { getOwnedRenderer } from '../demo/DemoPage'
import { OWNED_EXPERIMENT_CATALOG } from './catalog.generated'
import { OWNED_EXPERIMENT_RENDERERS } from './renderers'

describe('自研实验 renderer', () => {
  it('为白名单中的每个实验提供 Native V2 renderer', () => {
    expect(Object.keys(OWNED_EXPERIMENT_RENDERERS).sort()).toEqual(
      OWNED_EXPERIMENT_CATALOG.map(({ id }) => id).sort(),
    )
  })

  it('不把原型键解析为自研 renderer，以进入已下线语义', () => {
    expect(getOwnedRenderer('constructor')).toBeNull()
    expect(getOwnedRenderer('toString')).toBeNull()
  })

  it('150 个实验使用 150 个不同的组件入口', () => {
    expect(new Set(Object.values(OWNED_EXPERIMENT_RENDERERS)).size).toBe(150)
  })
})
