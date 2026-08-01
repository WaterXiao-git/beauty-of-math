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
  description: string
  topics: readonly string[]

  /**
   * 是否允许使用自动推断的别名、关键词和语义信息。
   * 所有实验都允许按标题召回，只有高置信度实验参与扩展语义匹配。
   */
  semanticEnabled: boolean

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
    description: manifest.description,
    topics: manifest.topics,
    semanticEnabled: manifest.agent.enabled,

    aliases: manifest.agent.aliases,
    strongPhrases: manifest.agent.strongPhrases,
    keywords: manifest.agent.keywords,

    supportedIntents:
      manifest.agent.capabilities,
  }
}

/**
 * 具有高置信度语义配置的实验注册表。
 *
 * 用于统计和维护语义搜索覆盖率，不限制标题召回。
 */
export const SEMANTIC_EXPERIMENT_REGISTRY:
  readonly ExperimentRouteDefinition[] =
    ALL_EXPERIMENT_MANIFESTS
      .filter(
        (manifest) =>
          manifest.agent.enabled,
      )
      .map(
        manifestToRouteDefinition,
      )

/**
 * 全部已有页面都进入基础路由注册表。
 *
 * 低置信度 Manifest 仍然可以通过完整标题和核心标题被找到，
 * 但不会使用未经确认的自动别名与关键词进行扩展匹配。
 */
export const EXPERIMENT_REGISTRY:
  readonly ExperimentRouteDefinition[] =
    ALL_EXPERIMENT_MANIFESTS.map(
      manifestToRouteDefinition,
    )
