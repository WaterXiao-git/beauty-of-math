import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildLocalExplanation } from './llmService.js'

describe('buildLocalExplanation', () => {
  it('explains the current Rolle theorem visualization', () => {
    const result = buildLocalExplanation('结合当前图像说明条件', '罗尔定理')

    assert.match(result.title, /罗尔定理/)
    assert.match(result.summary, /x²−1/)
    assert.ok(result.keyPoints.some((point) => point.includes('端点等高')))
  })

  it('distinguishes left and right derivative approaches', () => {
    const result = buildLocalExplanation('h 是什么意思', '导数的几何意义')

    assert.match(result.summary, /h 趋近 0/)
    assert.ok(result.keyPoints.some((point) => point.includes('h>0')))
    assert.ok(result.keyPoints.some((point) => point.includes('h<0')))
  })

  it('returns a useful generic fallback for another lesson', () => {
    const result = buildLocalExplanation('怎么理解？', '矩阵变换')

    assert.match(result.title, /矩阵变换/)
    assert.equal(result.keyPoints.length, 3)
    assert.match(result.example, /当前“矩阵变换”演示/)
    assert.doesNotMatch(result.summary, /模型.*不可用/)
    assert.doesNotMatch(result.example, /模型.*恢复/)
  })
})
