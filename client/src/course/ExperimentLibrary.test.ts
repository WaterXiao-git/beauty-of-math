import { describe, expect, it } from 'vitest'

import { getHighMathExperimentCards } from './ExperimentLibrary'

describe('浏览全部实验入口', () => {
  it('只展示 18 个自研实验，不混入旧实验', () => {
    const cards = getHighMathExperimentCards()

    expect(cards).toHaveLength(18)
    expect(cards.every(({ path }) => path.startsWith('/demo/'))).toBe(true)
  })
})
