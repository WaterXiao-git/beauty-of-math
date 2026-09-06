import { describe, expect, it } from 'vitest'

import { courseChapters } from '../course/courseData'
import { getKnowledgePointDemoPath } from './routing'

const points = courseChapters.flatMap((chapter) =>
  chapter.sections.flatMap((section) => section.points),
)

describe('知识点演示路由', () => {
  it('为连续概念使用新建的 Native renderer 路径', () => {
    expect(getKnowledgePointDemoPath(
      points.find((point) => point.id === 'hm-03-01')!,
    )).toBe('/demo/hm-03-01')
  })

  it('为函数极限使用显式绑定的 renderer 路径', () => {
    expect(getKnowledgePointDemoPath(
      points.find((point) => point.id === 'hm-02-02')!,
    )).toBe('/demo/hm-02-02')
  })
})
