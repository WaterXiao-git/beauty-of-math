import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { listPublishedExperiments } from './experimentCatalogService.js'

describe('experimentCatalogService', () => {
  it('returns the complete catalog with pagination metadata', () => {
    const result = listPublishedExperiments({ limit: 12 })

    assert.equal(result.total, 300)
    assert.equal(result.items.length, 12)
    assert.equal(result.hasMore, true)
    assert.equal(
      Object.values(result.facets.difficulties).reduce((sum, count) => sum + count, 0),
      300,
    )
  })

  it('searches titles, descriptions, paths and topics', () => {
    const result = listPublishedExperiments({ q: '分数' })

    assert.ok(result.total >= 1)
    assert.ok(result.items.some((item) => item.path === '/fractions'))
  })

  it('filters by difficulty and topic together', () => {
    const result = listPublishedExperiments({
      difficulty: 'beginner',
      topic: 'algebra',
      limit: 60,
    })

    assert.ok(result.total > 0)
    assert.ok(
      result.items.every(
        (item) => item.difficulty === 'beginner' && item.topics.includes('algebra'),
      ),
    )
  })

  it('caps the page size and normalizes invalid offsets', () => {
    const result = listPublishedExperiments({ limit: 999, offset: -10 })

    assert.equal(result.limit, 300)
    assert.equal(result.offset, 0)
    assert.equal(result.items.length, 300)
  })

  it('assigns every real experiment to the course hierarchy', () => {
    const result = listPublishedExperiments({ limit: 300 })
    const courseTotal = result.facets.taxonomy.courses.reduce(
      (sum, course) => sum + course.count,
      0,
    )

    assert.equal(courseTotal, 300)
    assert.equal(result.facets.taxonomy.unclassifiedCount, 0)
    assert.ok(result.facets.taxonomy.courses.length >= 6)
    assert.ok(
      result.items.every(
        (item) =>
          item.courseId &&
          item.chapterId &&
          item.knowledgePointIds.length > 0,
      ),
    )
  })

  it('searches knowledge metadata and filters the hierarchy', () => {
    const matrixSearch = listPublishedExperiments({ q: '矩阵', limit: 300 })
    const probabilitySearch = listPublishedExperiments({ q: '概率', limit: 300 })
    const calculus = listPublishedExperiments({ courseId: 'calculus', limit: 300 })

    assert.ok(matrixSearch.total > 0)
    assert.ok(probabilitySearch.total > 0)
    assert.ok(calculus.total > 0)
    assert.ok(calculus.items.every((item) => item.courseId === 'calculus'))
  })
})
