import {
  OWNED_EXPERIMENT_REGISTRY,
} from './ownedExperimentRegistry.generated.js'

export type RoutableMathIntent =
  | 'visualize'
  | 'explain'
  | 'compare'
  | 'find-experiment'

export interface ExperimentRouteDefinition {
  id: string
  path: string
  title: string
  description: string
  topics: readonly string[]
  semanticEnabled: boolean
  aliases: readonly string[]
  strongPhrases: readonly string[]
  keywords: readonly string[]
  supportedIntents: readonly RoutableMathIntent[]
}

/**
 * 正式实验路由只使用已生成的自研高数白名单。
 */
export const EXPERIMENT_REGISTRY:
  readonly ExperimentRouteDefinition[] =
    OWNED_EXPERIMENT_REGISTRY

/**
 * 8 项正式实验均具有确定性语义元数据，因而语义表与正式表同源。
 */
export const SEMANTIC_EXPERIMENT_REGISTRY:
  readonly ExperimentRouteDefinition[] =
    EXPERIMENT_REGISTRY
