import type { ExperimentRegistration } from './model'
import { normalizeParameterValues } from './parameters'
import type { ParameterValue, ParameterValues } from './schema'

export function createInitialParameterValues<Config, SceneData>(
  registration: ExperimentRegistration<Config, SceneData>,
): ParameterValues {
  return Object.fromEntries(
    registration.model.parameters(registration.config.modelConfig)
      .map((spec) => [spec.key, spec.initial]),
  )
}

export function computeExperiment<Config, SceneData>(
  registration: ExperimentRegistration<Config, SceneData>,
  values: Readonly<Record<string, ParameterValue>>,
  counterexampleId?: string,
) {
  const specs = registration.model.parameters(registration.config.modelConfig)
  const params = normalizeParameterValues(specs, values)
  return registration.model.compute({
    config: registration.config.modelConfig,
    params,
    ...(counterexampleId ? { counterexampleId } : {}),
  })
}
