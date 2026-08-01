export const DYNAMIC_RENDERER_TYPES = [
  'cartesian-2d',
  'polar-2d',
  'arithmetic-blocks',
] as const

export type DynamicRendererType =
  (typeof DYNAMIC_RENDERER_TYPES)[number]

export interface DynamicSliderParameter {
  id: string
  label: string
  min: number
  max: number
  step: number
  defaultValue: number
  unit: string
}

export interface CartesianRendererSpec {
  type: 'cartesian-2d'
  expression: string
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  samples: number
}

export interface PolarRendererSpec {
  type: 'polar-2d'
  expression: string
  thetaMin: number
  thetaMax: number
  radiusMax: number
  samples: number
}

export type ArithmeticOperation =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'

export interface ArithmeticBlocksRendererSpec {
  type: 'arithmetic-blocks'
  operation: ArithmeticOperation
  left: number
  right: number
}

export type DynamicRendererSpec =
  | CartesianRendererSpec
  | PolarRendererSpec
  | ArithmeticBlocksRendererSpec

export interface DynamicExperimentStep {
  title: string
  description: string
  parameterValues: Record<string, number>
}

export interface DynamicExperimentSpec {
  version: 1
  title: string
  description: string
  gradeLevel: string
  formulaLatex: string
  parameters: DynamicSliderParameter[]
  renderer: DynamicRendererSpec
  steps: DynamicExperimentStep[]
  knowledgePoints: string[]
}

export interface DynamicExperimentGeneration {
  models: string[]
  reviewed: boolean
  fallback: boolean
  temporary: true
}

export interface DynamicExperimentResponse {
  question: string
  spec: DynamicExperimentSpec
  generation: DynamicExperimentGeneration
}
