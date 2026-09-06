import { OWNED_EXPERIMENT_CATALOG } from '../owned-experiments/catalog.generated'
import { sceneFingerprint, textFingerprint } from './fingerprint'
import type { MathModelFamily } from './model'
import type { KnowledgeSceneData } from './models/knowledgeFamilyModel'
import { EXPERIMENT_REGISTRY } from './registry'
import { computeExperiment, createInitialParameterValues } from './runtime'
import type { PredictionSpec } from './schema'
import { validateExperimentRegistration } from './validateConfig'

export interface ExperimentQualityReport {
  catalogCount: number
  typedRuntimeCount: number
  standaloneNativeCount: number
  familyCounts: Partial<Record<MathModelFamily, number>>
  predictionTypeCounts: Record<PredictionSpec['type'], number>
  deadControlCount: number
  duplicateFingerprintCount: number
  validationErrorCount: number
  nonFinitePlotPointCount: number
  errors: readonly string[]
}

export function createExperimentQualityReport(): ExperimentQualityReport {
  const registrations = Object.values(EXPERIMENT_REGISTRY)
  const familyCounts: Partial<Record<MathModelFamily, number>> = {}
  const predictionTypeCounts: Record<PredictionSpec['type'], number> = {
    trend: 0,
    boolean: 0,
    numeric: 0,
    choice: 0,
  }
  const errors: string[] = []
  const fingerprints: string[] = []
  let nonFinitePlotPointCount = 0

  for (const registration of registrations) {
    familyCounts[registration.config.family] = (familyCounts[registration.config.family] ?? 0) + 1
    errors.push(...validateExperimentRegistration(registration))
    const params = createInitialParameterValues(registration)
    const prediction = registration.model.buildPrediction(registration.config.modelConfig, params)
    predictionTypeCounts[prediction.type] += 1
    const result = computeExperiment(registration, params)
    const scene = result.scene as KnowledgeSceneData
    nonFinitePlotPointCount += scene.series.reduce((count, series) => count + series.segments.reduce(
      (segmentCount, segment) => segmentCount + segment.filter(({ x, y }) => !Number.isFinite(x) || !Number.isFinite(y)).length,
      0,
    ), 0)
    fingerprints.push(textFingerprint([
      registration.config.mathematicalObject,
      result.formula.text,
      result.observations.map(({ label, meaning }) => `${label}:${meaning}`).join('|'),
      result.conditions.map(({ label }) => label).join('|'),
      result.conclusion.statement,
      sceneFingerprint(result.scene),
    ].join('|')))
  }

  return {
    catalogCount: OWNED_EXPERIMENT_CATALOG.length,
    typedRuntimeCount: registrations.length,
    standaloneNativeCount: OWNED_EXPERIMENT_CATALOG.length - registrations.length,
    familyCounts,
    predictionTypeCounts,
    deadControlCount: errors.filter((error) => error.includes('未改变声明')).length,
    duplicateFingerprintCount: fingerprints.length - new Set(fingerprints).size,
    validationErrorCount: errors.length,
    nonFinitePlotPointCount,
    errors,
  }
}
