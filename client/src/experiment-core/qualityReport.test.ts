import { describe, expect, it } from 'vitest'

import { createExperimentQualityReport } from './qualityReport'

describe('实验公共架构质量报告', () => {
  it('覆盖现有 150 个实验且批量实验没有无效参数、重复配置或校验错误', () => {
    const report = createExperimentQualityReport()

    expect(report.catalogCount).toBe(150)
    expect(report.typedRuntimeCount).toBe(135)
    expect(report.standaloneNativeCount).toBe(15)
    expect(report.deadControlCount).toBe(0)
    expect(report.duplicateFingerprintCount).toBe(0)
    expect(report.validationErrorCount).toBe(0)
    expect(report.nonFinitePlotPointCount).toBe(0)
    expect(Object.values(report.predictionTypeCounts).every((count) => count > 0)).toBe(true)
  })
})
