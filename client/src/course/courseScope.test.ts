import { describe, expect, it } from 'vitest'

import { OWNED_EXPERIMENT_CATALOG } from '../owned-experiments/catalog.generated'
import { HIGHER_MATHEMATICS_COURSE, courses } from './courseCatalog'
import { courseChapters } from './courseData'

const expectedRendererBindings = {
  function: 'function',
  'function-representation': 'function-representation',
  'function-properties': 'function-properties',
  'limit-of-sequence': 'limit-of-sequence',
  'limit-of-function': 'epsilon-delta',
  'limit-laws': 'limit-laws',
  'two-important-limits': 'two-important-limits',
  infinitesimal: 'infinitesimal',
  continuity: 'continuity',
  'continuity-properties': 'continuity-properties',
  derivative: 'derivative',
  differential: 'differential',
  'mean-value-theorem': 'rolle',
  taylor: 'taylor',
  graphing: 'graphing',
  'newton-method': 'newton-method',
  'indefinite-integral': 'indefinite-integral',
  'definite-integral': 'definite-integral',
} as const

describe('当前正式课程范围', () => {
  it('只发布高等数学上册的四章', () => {
    expect(courses.map(({ id }) => id)).toEqual(['higher-mathematics-1'])
    expect(courseChapters.map(({ title }) => title)).toEqual([
      '函数、极限与连续',
      '导数与微分',
      '微分中值定理与导数的应用',
      '不定积分与定积分',
    ])
  })

  it('运行时冻结正式课程和章节范围', () => {
    expect(Object.isFrozen(courseChapters)).toBe(true)
    expect(courseChapters.every((chapter) => Object.isFrozen(chapter))).toBe(true)
    expect(Object.isFrozen(HIGHER_MATHEMATICS_COURSE)).toBe(true)
    expect(Object.isFrozen(courses)).toBe(true)

    const originalTitle = courseChapters[0].title
    expect(Reflect.set(courseChapters[0], 'title', '未批准章节')).toBe(false)
    expect(courseChapters[0].title).toBe(originalTitle)
  })

  it('将十八个指定知识点绑定到自研 renderer', () => {
    const points = courseChapters.flatMap((chapter) =>
      chapter.sections.flatMap((section) => section.points),
    )
    const bindings = Object.fromEntries(
      points
        .filter((point) => point.rendererId)
        .map((point) => [point.id, point.rendererId]),
    )

    expect(bindings).toEqual(expectedRendererBindings)
    expect(Object.values(bindings).every((id) =>
      OWNED_EXPERIMENT_CATALOG.some((experiment) => experiment.id === id),
    )).toBe(true)
  })
})
