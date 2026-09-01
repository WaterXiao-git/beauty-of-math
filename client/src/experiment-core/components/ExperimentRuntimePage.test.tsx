import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { quadraticTestConfig, quadraticTestModel } from '../runtime.test'
import ExperimentRuntimePage from './ExperimentRuntimePage'

describe('公共实验运行时页面', () => {
  it('初始要求先预测并锁定实验参数', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ExperimentRuntimePage
          registration={{ config: quadraticTestConfig, model: quadraticTestModel }}
          renderScene={() => <svg data-testid="quadratic-scene" />}
        />
      </MemoryRouter>,
    )

    expect(html).toContain('提出问题')
    expect(html).toContain('先提交预测')
    expect(html).toContain('增大')
    expect(html).toContain('disabled')
    expect(html).not.toContain('预测—实际结果—原因解释')
  })
})
