import { describe, expect, it } from 'vitest'

import { getKnowledgePointDemoPath } from '../experiment-v2/routing'
import { courseChapters } from './courseData'
import { getKnowledgeExperimentAction } from './KnowledgeDetail'

const continuityPoint = courseChapters
  .flatMap((chapter) => chapter.sections.flatMap((section) => section.points))
  .find((point) => point.id === 'hm-03-01')!

describe('知识点实验入口', () => {
  it('对已绑定 renderer 的连续知识点显示演示入口', () => {
    expect(getKnowledgePointDemoPath(continuityPoint)).toBe('/demo/hm-03-01')
    expect(getKnowledgeExperimentAction(continuityPoint)).toEqual({
      kind: 'demo',
      label: '进入演示',
      path: '/demo/hm-03-01',
    })
  })
})
