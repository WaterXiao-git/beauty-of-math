import { describe, expect, it } from 'vitest'

import { OWNED_EXPERIMENT_CATALOG } from '../owned-experiments/catalog.generated'
import { HIGHER_MATHEMATICS_COURSE, collectCoursePoints, courses } from './courseCatalog'
import { courseChapters } from './courseData'

const EXPECTED_MODULES = [
  '函数与基本图像',
  '数列极限与函数极限',
  '连续与间断',
  '导数与微分',
  '微分中值定理与导数应用',
  '不定积分',
  '定积分',
  '定积分的应用',
  '微分方程',
  '空间解析几何与向量代数',
  '多元函数微分学',
  '重积分',
  '曲线积分与曲面积分',
  '无穷级数',
] as const

describe('当前正式课程范围', () => {
  it('只发布高等数学的十四个客户模块', () => {
    expect(courses.map(({ id }) => id)).toEqual(['higher-mathematics'])
    expect(courseChapters.map(({ title }) => title)).toEqual(EXPECTED_MODULES)
  })

  it('发布150个唯一知识点且每点绑定独立renderer', () => {
    const points = collectCoursePoints(HIGHER_MATHEMATICS_COURSE)
    const pointIds = points.map(({ id }) => id)
    const rendererIds = points.map(({ rendererId }) => rendererId)

    expect(points).toHaveLength(150)
    expect(new Set(pointIds).size).toBe(150)
    expect(new Set(rendererIds).size).toBe(150)
    expect(rendererIds.every(Boolean)).toBe(true)
    expect(OWNED_EXPERIMENT_CATALOG).toHaveLength(150)
    expect(new Set(OWNED_EXPERIMENT_CATALOG.map(({ knowledgePointId }) => knowledgePointId)))
      .toEqual(new Set(pointIds))
  })

  it('运行时冻结正式课程和模块范围', () => {
    expect(Object.isFrozen(courseChapters)).toBe(true)
    expect(courseChapters.every((chapter) => Object.isFrozen(chapter))).toBe(true)
    expect(Object.isFrozen(HIGHER_MATHEMATICS_COURSE)).toBe(true)
    expect(Object.isFrozen(courses)).toBe(true)
  })
})
