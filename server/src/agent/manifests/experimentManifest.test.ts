import test from 'node:test'
import assert from 'node:assert/strict'

import {
  EXPERIMENT_REGISTRY,
  SEMANTIC_EXPERIMENT_REGISTRY,
} from '../experimentRegistry.js'

import {
  ALL_EXPERIMENT_MANIFESTS,
} from './allExperimentManifests.js'

import {
  CORE_EXPERIMENT_MANIFESTS,
} from './coreExperimentManifests.js'

import {
  EXPERIMENT_KINDS,
  PARAMETER_SCHEMA_IDS,
} from './experimentManifest.js'

test(
  'Manifest 的实验 ID 不重复',
  () => {
    const ids =
      ALL_EXPERIMENT_MANIFESTS.map(
        (manifest) => manifest.id,
      )

    const uniqueIds =
      new Set(ids)

    assert.equal(
      uniqueIds.size,
      ids.length,
      '完整 Manifest 中存在重复实验 ID',
    )
  },
)

test(
  'Manifest 的实验路径不重复',
  () => {
    const paths =
      ALL_EXPERIMENT_MANIFESTS.map(
        (manifest) => manifest.path,
      )

    const uniquePaths =
      new Set(paths)

    assert.equal(
      uniquePaths.size,
      paths.length,
      '完整 Manifest 中存在重复实验路径',
    )
  },
)

test(
  '启用的实验具有必要的 Agent 配置',
  () => {
    const enabledManifests =
      ALL_EXPERIMENT_MANIFESTS.filter(
        (manifest) =>
          manifest.agent.enabled,
      )

    assert.ok(
      enabledManifests.length > 0,
      '至少应该存在一个启用的实验',
    )

    for (
      const manifest
      of enabledManifests
    ) {
      assert.ok(
        manifest.id.trim().length > 0,
        '启用实验必须具有 ID',
      )

      assert.ok(
        manifest.path.startsWith('/'),
        `${manifest.id} 的路径必须以 / 开头`,
      )

      assert.ok(
        manifest.title.trim().length > 0,
        `${manifest.id} 必须具有标题`,
      )

      assert.ok(
        manifest.description.trim().length > 0,
        `${manifest.id} 必须具有描述`,
      )

      assert.ok(
        Array.isArray(
          manifest.topics,
        ),
        `${manifest.id} 的 topics 必须是数组`,
      )

      assert.ok(
        EXPERIMENT_KINDS.includes(
          manifest.agent.kind,
        ),
        `${manifest.id} 的 kind 无效：${manifest.agent.kind}`,
      )

      assert.ok(
        PARAMETER_SCHEMA_IDS.includes(
          manifest.agent.parameterSchema,
        ),
        `${manifest.id} 的 parameterSchema 无效：${manifest.agent.parameterSchema}`,
      )

      assert.ok(
        Array.isArray(
          manifest.agent.aliases,
        ),
        `${manifest.id} 的 aliases 必须是数组`,
      )

      assert.ok(
        Array.isArray(
          manifest.agent.strongPhrases,
        ),
        `${manifest.id} 的 strongPhrases 必须是数组`,
      )

      assert.ok(
        Array.isArray(
          manifest.agent.keywords,
        ),
        `${manifest.id} 的 keywords 必须是数组`,
      )

      assert.ok(
        Array.isArray(
          manifest.agent.capabilities,
        ),
        `${manifest.id} 的 capabilities 必须是数组`,
      )

      assert.ok(
        manifest.agent.capabilities.length >
          0,
        `${manifest.id} 至少需要一个 Agent capability`,
      )
    }
  },
)

test(
  '基础 Registry 覆盖全部 Manifest，语义 Registry 只包含可信配置',
  () => {
    const enabledManifests =
      ALL_EXPERIMENT_MANIFESTS.filter(
        (manifest) =>
          manifest.agent.enabled,
      )

    assert.equal(
      EXPERIMENT_REGISTRY.length,
      ALL_EXPERIMENT_MANIFESTS.length,
    )

    assert.equal(
      SEMANTIC_EXPERIMENT_REGISTRY.length,
      enabledManifests.length,
    )

    assert.ok(
      SEMANTIC_EXPERIMENT_REGISTRY.length >
        CORE_EXPERIMENT_MANIFESTS.length,
      '语义 Registry 应包含核心实验和高置信度自动启用实验',
    )

    const allPaths =
      new Set(
        ALL_EXPERIMENT_MANIFESTS.map(
          (manifest) =>
            manifest.path,
        ),
      )

    for (
      const registryItem
      of EXPERIMENT_REGISTRY
    ) {
      assert.ok(
        allPaths.has(
          registryItem.path,
        ),
        `${registryItem.id} 不在完整 Manifest 中`,
      )
    }

    const semanticPaths =
      new Set(
        SEMANTIC_EXPERIMENT_REGISTRY.map(
          (item) =>
            item.path,
        ),
      )

    for (
      const manifest
      of enabledManifests
    ) {
      assert.ok(
        semanticPaths.has(
          manifest.path,
        ),
        `${manifest.id} 已启用但没有进入语义 Registry`,
      )
    }
  },
)
