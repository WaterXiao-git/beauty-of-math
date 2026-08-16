import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import {
  DefiniteIntegralDemo,
  IndefiniteIntegralDemo,
  NewtonMethodDemo,
} from './RemainingCalculusNativeDemos'

function renderExperiment(component: React.ReactNode) {
  return renderToStaticMarkup(<MemoryRouter>{component}</MemoryRouter>)
}

describe('补齐的高数 Native 实验', () => {
  it('牛顿迭代法展示切线迭代与初值控制', () => {
    const html = renderExperiment(<NewtonMethodDemo />)

    expect(html).toContain('牛顿迭代法')
    expect(html).toContain('初始值 x₀')
    expect(html).toContain('xₙ₊₁ = xₙ − f(xₙ) / f′(xₙ)')
  })

  it('不定积分联动被积函数、原函数族和积分常数', () => {
    const html = renderExperiment(<IndefiniteIntegralDemo />)

    expect(html).toContain('不定积分')
    expect(html).toContain('积分常数 C')
    expect(html).toContain('F′(x) = f(x)')
  })

  it('定积分展示黎曼和分割与面积近似', () => {
    const html = renderExperiment(<DefiniteIntegralDemo />)

    expect(html).toContain('定积分')
    expect(html).toContain('分割份数 n')
    expect(html).toContain('黎曼和')
  })
})
