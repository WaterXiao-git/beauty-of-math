export type NativeSceneModule =
  | 'limit' | 'continuity' | 'derivative' | 'application' | 'antiderivative'
  | 'integral' | 'integral-application' | 'ode' | 'space' | 'multivariable'
  | 'multiple-integral' | 'field-integral' | 'series'

export interface NativeExperimentDefinition {
  id: string
  module: NativeSceneModule
  point: number
  formula: string
  parameter: { label: string; min: number; max: number; initial: number; step?: number }
  secondary: { label: string; min: number; max: number; initial: number; step?: number }
  steps: readonly [string, string, string, string]
  signature: string
}
