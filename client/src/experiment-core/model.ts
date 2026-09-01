import type {
  ParameterSpec,
  ParameterValue,
  ParameterValues,
  PredictionAnswer,
  PredictionSpec,
} from './schema'

export type MathModelFamily =
  | 'function-1d'
  | 'limit'
  | 'continuity'
  | 'derivative'
  | 'theorem-application'
  | 'integral'
  | 'ode'
  | 'space'
  | 'multivariable'
  | 'multiple-integral'
  | 'field-integral'
  | 'series'

export interface FormulaPresentation {
  text: string
  latex?: string
}

export interface Observation {
  key: string
  label: string
  value: number | string | boolean
  formattedValue: string
  meaning: string
}

export interface ConditionResult {
  id: string
  label: string
  satisfied: boolean
  evidence: string
  failureReason: string | null
}

export interface VerificationResult {
  passed: boolean
  rule: string
  evidence: readonly string[]
  failureReasons: readonly string[]
}

export interface ConclusionResult {
  status: 'confirmed' | 'refuted' | 'inconclusive'
  statement: string
  reason: string
}

export interface ExperimentComputation<SceneData = unknown> {
  formula: FormulaPresentation
  scene: SceneData
  observations: readonly Observation[]
  conditions: readonly ConditionResult[]
  verification: VerificationResult
  conclusion: ConclusionResult
  actualPredictionAnswer: PredictionAnswer
  explanation: string
}

export interface CounterexampleSpec {
  id: string
  label: string
  explanation: string
  parameterOverrides: Readonly<Record<string, ParameterValue>>
  expectedFailureConditionIds: readonly string[]
}

export interface ExperimentConfig<Config = unknown> {
  id: string
  family: MathModelFamily
  modelId: string
  title: string
  question: string
  mathematicalObject: string
  modelConfig: Config
  observationKeys: readonly string[]
  learningGoals: readonly string[]
}

export interface ModelComputeInput<Config> {
  config: Config
  params: ParameterValues
  counterexampleId?: string
}

export interface MathModel<Config = unknown, SceneData = unknown> {
  id: string
  family: MathModelFamily
  parameters: (config: Config) => readonly ParameterSpec[]
  buildPrediction: (config: Config, params: ParameterValues) => PredictionSpec
  counterexamples: (config: Config) => readonly CounterexampleSpec[]
  compute: (input: ModelComputeInput<Config>) => ExperimentComputation<SceneData>
}

export interface ExperimentRegistration<Config = unknown, SceneData = unknown> {
  config: ExperimentConfig<Config>
  model: MathModel<Config, SceneData>
}
