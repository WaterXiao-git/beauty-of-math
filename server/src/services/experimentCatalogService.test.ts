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

    assert.equal(result.limit, 60)
    assert.equal(result.offset, 0)
    assert.equal(result.items.length, 60)
  })
})
