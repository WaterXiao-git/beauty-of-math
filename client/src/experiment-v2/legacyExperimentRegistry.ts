import type {
  ComponentType,
} from 'react'

import {
  normalizeExperimentId,
} from './routing'

export interface ExperimentModule {
  default: ComponentType
  experimentV2?: boolean
}

export type ExperimentModuleLoader = () => Promise<ExperimentModule>

const experimentModules =
  import.meta.glob<ExperimentModule>(
    '../experiments/*/*Experiment.tsx',
  )

const experimentModuleLoaders =
  Object.entries(
    experimentModules,
  ).reduce<Record<string, ExperimentModuleLoader>>(
    (
      registry,
      [
        modulePath,
        loader,
      ],
    ) => {
      const match =
        modulePath.match(
          /^\.\.\/experiments\/([^/]+)\/[^/]+Experiment\.tsx$/,
        )

      if (!match) return registry

      registry[
        normalizeExperimentId(
          match[1],
        )
      ] = loader

      return registry
    },
    {},
  )

export function getLegacyExperimentLoader(
  experimentId: string,
): ExperimentModuleLoader | undefined {
  return experimentModuleLoaders[
    normalizeExperimentId(
      experimentId,
    )
  ]
}

export function hasLegacyExperiment(
  experimentId: string,
): boolean {
  return Boolean(
    getLegacyExperimentLoader(
      experimentId,
    ),
  )
}

export function getLegacyExperimentIds(): string[] {
  return Object.keys(
    experimentModuleLoaders,
  ).sort()
}
