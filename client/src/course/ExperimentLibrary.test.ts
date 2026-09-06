import { describe, expect, it } from 'vitest'

import { getHighMathExperimentCards } from './ExperimentLibrary'

describe('浏览全部实验入口', () => {
  it('只展示150个高等数学自研知识点实验，不混入旧实验', () => {
    const cards = getHighMathExperimentCards()

    expect(cards).toHaveLength(150)
    expect(cards.every(({ path }) => path.startsWith('/demo/'))).toBe(true)
    expect(new Set(cards.map(({ id }) => id)).size).toBe(150)
  })
})
