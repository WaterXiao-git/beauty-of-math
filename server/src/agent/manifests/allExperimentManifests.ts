import {
  CORE_EXPERIMENT_MANIFESTS,
} from './coreExperimentManifests.js'

import {
  GENERATED_EXPERIMENT_CATALOG,
} from './generatedExperimentCatalog.js'

import {
  inferExperimentAgentMetadata,
} from './inferAgentMetadata.js'

import {
  MANUAL_EXPERIMENT_AGENT_OVERRIDES,
} from './manualExperimentAgentOverrides.js'

import type {
  ExperimentAgentMetadata,
  ExperimentCatalogMetadata,
  ExperimentManifest,
} from './experimentManifest.js'

import type {
  ExperimentAgentOverride,
} from './manualExperimentAgentOverrides.js'

const coreManifestByPath =
  new Map<
    string,
    ExperimentManifest
  >(
    CORE_EXPERIMENT_MANIFESTS.map(
      (manifest) => [
        manifest.path,
        manifest,
      ],
    ),
  )

/**
 * 合并字符串数组并去重。
 *
 * 自动配置排在前面，
 * 人工补丁添加在后面。
 */
function mergeUniqueStrings(
  ...groups:
    readonly (
      readonly string[]
    )[]
): string[] {
  const result: string[] = []
  const seen = new Set<string>()

  for (const group of groups) {
    for (const value of group) {
      const normalizedValue =
        value.trim()

      if (!normalizedValue) {
        continue
      }

      const comparisonKey =
        normalizedValue.toLowerCase()

      if (seen.has(comparisonKey)) {
        continue
      }

      seen.add(comparisonKey)
      result.push(normalizedValue)
    }
  }

  return result
}

/**
 * 将人工语义搜索补丁合并到 Agent 元数据。
 *
 * 人工值可以覆盖：
 * enabled、kind、parameterSchema、capabilities
 *
 * aliases、strongPhrases、keywords 使用追加合并，
 * 不会删除自动生成或核心 Manifest 中已有的内容。
 */
function applyAgentOverride(
  agent:
    ExperimentAgentMetadata,

  override:
    ExperimentAgentOverride | undefined,
): ExperimentAgentMetadata {
  if (!override) {
    return agent
  }

  return {
    ...agent,

    enabled:
      override.enabled ??
      agent.enabled,

    kind:
      override.kind ??
      agent.kind,

    parameterSchema:
      override.parameterSchema ??
      agent.parameterSchema,

    capabilities:
      override.capabilities ??
      agent.capabilities,

    aliases:
      mergeUniqueStrings(
        agent.aliases,
        override.aliases ?? [],
      ),

    strongPhrases:
      mergeUniqueStrings(
        agent.strongPhrases,
        override.strongPhrases ?? [],
      ),

    keywords:
      mergeUniqueStrings(
        agent.keywords,
        override.keywords ?? [],
      ),
  }
}

/**
 * 为非核心实验创建自动推断 Manifest。
 */
function createInferredManifest(
  metadata:
    ExperimentCatalogMetadata,
): ExperimentManifest {
  const inference =
    inferExperimentAgentMetadata(
      metadata,
    )

  return {
    ...metadata,
    agent:
      inference.agent,
  }
}

/**
 * 先取得核心或自动推断 Manifest，
 * 再应用人工语义搜索补丁。
 */
function createCompleteManifest(
  metadata:
    ExperimentCatalogMetadata,
): ExperimentManifest {
  const baseManifest =
    coreManifestByPath.get(
      metadata.path,
    ) ??
    createInferredManifest(
      metadata,
    )

  const override =
    MANUAL_EXPERIMENT_AGENT_OVERRIDES[
      metadata.path
    ]

  return {
    ...baseManifest,

    agent:
      applyAgentOverride(
        baseManifest.agent,
        override,
      ),
  }
}

export const ALL_EXPERIMENT_MANIFESTS:
  readonly ExperimentManifest[] =
    GENERATED_EXPERIMENT_CATALOG.map(
      createCompleteManifest,
    )