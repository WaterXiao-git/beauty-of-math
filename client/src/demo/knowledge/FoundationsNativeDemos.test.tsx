import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import {
  ContinuityDemo,
  ContinuityPropertiesDemo,
  FunctionRepresentationDemo,
} from './FoundationsNativeDemos'

function renderExperiment(component: React.ReactNode) {
  return renderToStaticMarkup(<MemoryRouter>{component}</MemoryRouter>)
}

describe('高数基础 Native 实验的教学步骤', () => {
  it('函数表示法初始步骤只展示解析式，等待生成数值表', () => {
    const html = renderExperiment(<FunctionRepresentationDemo />)

    expect(html).toContain('下一步生成数值表')
    expect(html).not.toContain('<tbody>')
  })

  it('连续性实验在完成比较前不提前给出结论', () => {
    const html = renderExperiment(<ContinuityDemo />)

    expect(html).toContain('完成左右逼近和函数值比较后')
    expect(html).not.toContain('极限存在，但不等于函数值')
  })

  it('连续函数性质实验在定位特殊点前不提前给出定理结论', () => {
    const html = renderExperiment(<ContinuityPropertiesDemo />)

    expect(html).toContain('下一步检查定理前提')
    expect(html).toContain('定位图像中的特殊点后')
    expect(html).not.toContain('区间内部至少存在一个零点')
  })
})
