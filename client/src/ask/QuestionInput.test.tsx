import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import QuestionInput from './QuestionInput'

describe('QuestionInput', () => {
  it('只提供文本输入，不渲染多模态入口', () => {
    const html = renderToStaticMarkup(
      <QuestionInput
        question=""
        onQuestionChange={vi.fn()}
        onSubmit={vi.fn()}
        prompts={[]}
        onFillPrompt={vi.fn()}
        onShuffle={vi.fn()}
        mode="auto"
        onModeChange={vi.fn()}
      />,
    )

    expect(html).toContain('<textarea')
    expect(html).toContain('0/500')
    expect(html).not.toContain('图片上传')
    expect(html).not.toContain('语音输入')
    expect(html).not.toContain('公式输入')
    expect(html).not.toContain('type="file"')
  })
})
