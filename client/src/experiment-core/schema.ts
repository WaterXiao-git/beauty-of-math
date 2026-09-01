export type ParameterValue = number | string | boolean
export type ParameterValues = Readonly<Record<string, ParameterValue>>

export type ParameterEffect =
  | 'formula'
  | 'plot'
  | 'observation'
  | 'condition'
  | 'conclusion'

interface ParameterBase {
  key: string
  label: string
  unit: string | null
  meaning: string
  affects: readonly ParameterEffect[]
}

export interface ContinuousParameterSpec extends ParameterBase {
  type: 'continuous'
  initial: number
  min: number
  max: number
  step: number
}

export interface IntegerParameterSpec extends ParameterBase {
  type: 'integer'
  initial: number
  min: number
  max: number
  step: number
}

export interface ChoiceParameterSpec extends ParameterBase {
  type: 'choice'
  initial: string
  options: readonly { value: string; label: string }[]
}

export interface BooleanParameterSpec extends ParameterBase {
  type: 'boolean'
  initial: boolean
}

export type ParameterSpec =
  | ContinuousParameterSpec
  | IntegerParameterSpec
  | ChoiceParameterSpec
  | BooleanParameterSpec

export type TrendValue = 'increase' | 'decrease' | 'unchanged'

interface PredictionBase {
  id: string
  prompt: string
}

export interface TrendPredictionSpec extends PredictionBase {
  type: 'trend'
  answer: TrendValue
}

export interface BooleanPredictionSpec extends PredictionBase {
  type: 'boolean'
  answer: boolean
}

export interface NumericPredictionSpec extends PredictionBase {
  type: 'numeric'
  answer: number
  absoluteTolerance?: number
  relativeTolerance?: number
  unit?: string | null
}

export interface StructuredChoicePredictionSpec extends PredictionBase {
  type: 'choice'
  mode: 'single' | 'multiple' | 'order'
  options: readonly { value: string; label: string }[]
  answer: string | readonly string[]
}

export type PredictionSpec =
  | TrendPredictionSpec
  | BooleanPredictionSpec
  | NumericPredictionSpec
  | StructuredChoicePredictionSpec

export type PredictionResponse =
  | { type: 'trend'; value: TrendValue }
  | { type: 'boolean'; value: boolean }
  | { type: 'numeric'; value: number }
  | { type: 'choice'; value: string | readonly string[] }

export type PredictionAnswer = TrendValue | boolean | number | string | readonly string[]

export interface PredictionJudgement {
  correct: boolean
  expected: PredictionAnswer
  received: PredictionAnswer
  summary: string
}
