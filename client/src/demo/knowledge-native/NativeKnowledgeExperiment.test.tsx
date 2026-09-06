import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import NativeKnowledgeExperiment from './NativeKnowledgeExperiment'

describe('NativeKnowledgeExperiment', () => {
  it('由公共学习闭环承载原有实验路由', () => {
    const html = renderToStaticMarkup(<MemoryRouter><NativeKnowledgeExperiment pointId="hm-02-01" /></MemoryRouter>)

    expect(html).toContain('先提交预测')
    expect(html).toContain('学生预测')
    expect(html).toContain('提出问题')
  })

  it('未知实验编号返回空内容而不是崩溃', () => {
    expect(renderToStaticMarkup(<NativeKnowledgeExperiment pointId="missing" />)).toBe('')
  })
})
