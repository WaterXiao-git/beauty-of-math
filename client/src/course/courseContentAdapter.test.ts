import { describe, expect, it } from 'vitest'

import type { PublishedCourseTree } from '../services/contentCatalog'
import { chapters } from './courseData'
import { mergePublishedCourseTree } from './courseContentAdapter'

const tree: PublishedCourseTree = {
  course: {
    id: 'higher-mathematics-volume-1',
    code: 'higher-mathematics-1',
    title: '高等数学（上册）',
    description: '测试课程',
  },
  chapters: [
    {
      id: 'chapter-functions-limits',
      code: 'functions-limits-continuity',
      title: '函数、极限与连续',
      description: '',
      sortOrder: 1,
      knowledgePoints: [],
      children: [
        {
          id: 'section-function-limit',
          code: 'function-limit',
          title: '函数的极限',
          description: '',
          sortOrder: 1,
          children: [],
          knowledgePoints: [
            {
              id: 'epsilon-delta',
              code: 'epsilon-delta-definition',
              title: 'ε−δ 极限定义（已发布）',
              summary: '来自后端的正式摘要',
              aliases: [],
              tags: ['极限'],
              contentVersion: '1.0.0',
              demoPath: '/demo/epsilon-delta',
              templateKey: 'epsilon-delta',
            },
          ],
        },
      ],
    },
  ],
}

describe('mergePublishedCourseTree', () => {
  it('overlays migrated points and keeps local points as fallback', () => {
    const result = mergePublishedCourseTree(chapters, tree)
    const points = result.chapters.flatMap((chapter) =>
      chapter.sections.flatMap((section) => section.points),
    )
    const limitPoint = points.find((point) => point.id === 'limit-of-function')

    expect(points).toHaveLength(18)
    expect(limitPoint?.title).toBe('函数的极限')
    expect(limitPoint?.summary).toBe('来自后端的正式摘要')
    expect(limitPoint?.source).toBe('published')
    expect(result.syncedPointIds.has('limit-of-function')).toBe(true)
    expect(points.find((point) => point.id === 'function')?.source).toBeUndefined()
  })
})
