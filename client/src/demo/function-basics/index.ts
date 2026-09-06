import type { ComponentType } from 'react'
import DomainRangeExperiment from './DomainRangeExperiment'
import FunctionGraphExperiment from './FunctionGraphExperiment'
import MonotonicityExperiment from './MonotonicityExperiment'
import ParityExperiment from './ParityExperiment'
import PeriodicityExperiment from './PeriodicityExperiment'
import InverseFunctionExperiment from './InverseFunctionExperiment'
import CompositeFunctionExperiment from './CompositeFunctionExperiment'
import PiecewiseFunctionExperiment from './PiecewiseFunctionExperiment'
import ParametricEquationExperiment from './ParametricEquationExperiment'
import PolarEquationExperiment from './PolarEquationExperiment'
import ElementaryFunctionsExperiment from './ElementaryFunctionsExperiment'
import TranslationExperiment from './TranslationExperiment'
import ScalingExperiment from './ScalingExperiment'
import ReflectionExperiment from './ReflectionExperiment'
import ParameterInfluenceExperiment from './ParameterInfluenceExperiment'

export const FUNCTION_BASICS_RENDERERS = {
  'hm-01-01': DomainRangeExperiment,
  'hm-01-02': FunctionGraphExperiment,
  'hm-01-03': MonotonicityExperiment,
  'hm-01-04': ParityExperiment,
  'hm-01-05': PeriodicityExperiment,
  'hm-01-06': InverseFunctionExperiment,
  'hm-01-07': CompositeFunctionExperiment,
  'hm-01-08': PiecewiseFunctionExperiment,
  'hm-01-09': ParametricEquationExperiment,
  'hm-01-10': PolarEquationExperiment,
  'hm-01-11': ElementaryFunctionsExperiment,
  'hm-01-12': TranslationExperiment,
  'hm-01-13': ScalingExperiment,
  'hm-01-14': ReflectionExperiment,
  'hm-01-15': ParameterInfluenceExperiment,
} satisfies Record<`hm-01-${string}`, ComponentType>
