import { describe, expect, it } from 'vitest'

import type { PublishedCourseTree } from '../services/contentCatalog'
import { courseChapters } from './courseData'
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
              id: 'hm-01-01',
              code: 'function-domain-range',
              title: '函数的定义域和值域',
              summary: '来自后端目录的函数摘要',
              aliases: ['函数'],
              tags: ['函数'],
              availability: 'cataloged',
              contentVersion: null,
              demoPath: null,
              templateKey: null,
            },
            {
              id: 'hm-02-02',
              code: 'epsilon-delta-definition',
              title: 'ε−δ 极限定义（已发布）',
              summary: '来自后端的正式摘要',
              aliases: [],
              tags: ['极限'],
              availability: 'published',
              contentVersion: '1.0.0',
              demoPath: '/demo/hm-02-02',
              templateKey: '函数极限交互可视化',
            },
          ],
        },
      ],
    },
  ],
}

describe('mergePublishedCourseTree', () => {
  it('通过知识点 id 合并发布内容且保留不同的本地 rendererId', () => {
    const result = mergePublishedCourseTree(courseChapters, tree)
    const points = result.chapters.flatMap((chapter) =>
      chapter.sections.flatMap((section) => section.points),
    )
    const limitPoint = points.find((point) => point.id === 'hm-02-02')

    expect(points).toHaveLength(150)
    expect(limitPoint?.title).toBe('函数在某一点的极限')
    expect(limitPoint?.summary).toBe('来自后端的正式摘要')
    expect(limitPoint?.source).toBe('published')
    expect(limitPoint?.rendererId).toBe('hm-02-02')
    expect(limitPoint?.backendId).toBe('hm-02-02')
    expect(result.syncedPointIds.has('hm-02-02')).toBe(true)
    expect(points.find((point) => point.id === 'hm-01-01')?.source).toBe('catalog')
    expect(points.find((point) => point.id === 'hm-01-01')?.rendererId).toBe('hm-01-01')
    expect(points.find((point) => point.id === 'hm-01-02')?.source).toBe('catalog')
  })
})
