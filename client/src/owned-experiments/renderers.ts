import type { ComponentType } from 'react'

import type { OwnedExperimentId } from './catalog.generated'
import DerivativeDemo from '../demo/DerivativeDemo'
import EpsilonDeltaDemo from '../demo/EpsilonDeltaDemo'
import RolleDemo from '../demo/RolleDemo'
import {
  DifferentialDemo,
  GraphingDemo,
  InfinitesimalDemo,
  LimitLawsDemo,
  TwoImportantLimitsDemo,
} from '../demo/knowledge/CoreCalculusSupplementDemos'
import {
  ContinuityDemo,
  ContinuityPropertiesDemo,
  FunctionConceptDemo,
  FunctionPropertiesDemo,
  FunctionRepresentationDemo,
  SequenceLimitDemo,
  TaylorDemo,
} from '../demo/knowledge/FoundationsNativeDemos'
import {
  DefiniteIntegralDemo,
  IndefiniteIntegralDemo,
  NewtonMethodDemo,
} from '../demo/knowledge/RemainingCalculusNativeDemos'

export const OWNED_EXPERIMENT_RENDERERS = {
  continuity: ContinuityDemo,
  'continuity-properties': ContinuityPropertiesDemo,
  'definite-integral': DefiniteIntegralDemo,
  derivative: DerivativeDemo,
  differential: DifferentialDemo,
  'epsilon-delta': EpsilonDeltaDemo,
  function: FunctionConceptDemo,
  'function-properties': FunctionPropertiesDemo,
  'function-representation': FunctionRepresentationDemo,
  graphing: GraphingDemo,
  'indefinite-integral': IndefiniteIntegralDemo,
  infinitesimal: InfinitesimalDemo,
  'limit-of-sequence': SequenceLimitDemo,
  'limit-laws': LimitLawsDemo,
  'newton-method': NewtonMethodDemo,
  rolle: RolleDemo,
  taylor: TaylorDemo,
  'two-important-limits': TwoImportantLimitsDemo,
} satisfies Record<OwnedExperimentId, ComponentType>
