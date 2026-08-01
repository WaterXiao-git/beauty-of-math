import type {
  MathIntent,
} from './intentClassifier.js'

import {
  ALL_EXPERIMENT_MANIFESTS,
} from './manifests/allExperimentManifests.js'

import type {
  ExperimentManifest,
} from './manifests/experimentManifest.js'

export type RoutableMathIntent = Exclude<
  MathIntent,
  'unknown'
>

/**
 * experimentMatcher 使用的精简实验结构。
 *
 * 此结构由统一 ExperimentManifest 自动转换，
 * 不再手工重复维护全部实验信息。
 */
export interface ExperimentRouteDefinition {
  id: string
  path: string
  title: string
  aliases: readonly string[]
  strongPhrases: readonly string[]
  keywords: readonly string[]
  supportedIntents: readonly RoutableMathIntent[]
}

/**
 * 将统一 Manifest 转换为匹配器需要的结构。
 */
export function manifestToRouteDefinition(
  manifest: ExperimentManifest,
): ExperimentRouteDefinition {
  return {
    id: manifest.id,
    path: manifest.path,
    title: manifest.title,

    aliases: manifest.agent.aliases,
    strongPhrases: manifest.agent.strongPhrases,
    keywords: manifest.agent.keywords,

    supportedIntents:
      manifest.agent.capabilities,
  }
}

/**
 * Agent 当前可参与匹配的实验注册表。
 *
 * 全部 300 个实验都存在于 ALL_EXPERIMENT_MANIFESTS，
 * 但这里只选择 enabled: true 的实验。
 */
export const EXPERIMENT_REGISTRY:
  readonly ExperimentRouteDefinition[] =
    ALL_EXPERIMENT_MANIFESTS
      .filter(
        (manifest) =>
          manifest.agent.enabled,
      )
      .map(
        manifestToRouteDefinition,
      )