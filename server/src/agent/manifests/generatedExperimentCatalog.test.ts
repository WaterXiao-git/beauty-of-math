import test from 'node:test'
import assert from 'node:assert/strict'

import {
  GENERATED_EXPERIMENT_CATALOG,
} from './generatedExperimentCatalog.js'

import {
  CORE_EXPERIMENT_MANIFESTS,
} from './coreExperimentManifests.js'

import {
  ALL_EXPERIMENT_MANIFESTS,
} from './allExperimentManifests.js'

import {
  EXPERIMENT_REGISTRY,
} from '../experimentRegistry.js'

test('自动生成了 300 个实验', () => {
  assert.equal(
    GENERATED_EXPERIMENT_CATALOG.length,
    300,
  )
})

test('实验 ID 不重复', () => {
  const ids =
    GENERATED_EXPERIMENT_CATALOG.map(
      (experiment) => experiment.id,
    )

  assert.equal(
    new Set(ids).size,
    ids.length,
  )
})

test('实验路径不重复', () => {
  const paths =
    GENERATED_EXPERIMENT_CATALOG.map(
      (experiment) => experiment.path,
    )

  assert.equal(
    new Set(paths).size,
    paths.length,
  )
})

test('所有基础实验都有必要字段', () => {
  for (
    const experiment
    of GENERATED_EXPERIMENT_CATALOG
  ) {
    assert.ok(
      experiment.id,
      '实验 ID 不能为空',
    )

    assert.ok(
      experiment.path.startsWith('/'),
      `${experiment.id} 的路径格式错误`,
    )

    assert.ok(
      experiment.title,
      `${experiment.id} 缺少标题`,
    )

    assert.ok(
      experiment.description,
      `${experiment.id} 缺少描述`,
    )

    assert.ok(
      Array.isArray(experiment.topics),
      `${experiment.id} 的 topics 不是数组`,
    )
  }
})

test('完整 Manifest 数量保持为 300', () => {
  assert.equal(
    ALL_EXPERIMENT_MANIFESTS.length,
    GENERATED_EXPERIMENT_CATALOG.length,
  )
})

test('核心实验成功覆盖自动生成条目', () => {
  for (
    const coreManifest
    of CORE_EXPERIMENT_MANIFESTS
  ) {
    const mergedManifest =
      ALL_EXPERIMENT_MANIFESTS.find(
        (manifest) =>
          manifest.path === coreManifest.path,
      )

    assert.ok(
      mergedManifest,
      `${coreManifest.path} 未进入完整 Manifest`,
    )

    assert.equal(
      mergedManifest.id,
      coreManifest.id,
    )

    assert.equal(
      mergedManifest.agent.enabled,
      true,
    )
  }
})

test(
  '非核心实验中同时存在启用和关闭的自动推断结果',
  () => {
    const corePaths = new Set(
      CORE_EXPERIMENT_MANIFESTS.map(
        (manifest) =>
          manifest.path,
      ),
    )

    const inferredManifests =
      ALL_EXPERIMENT_MANIFESTS.filter(
        (manifest) =>
          !corePaths.has(
            manifest.path,
          ),
      )

    assert.equal(
      inferredManifests.length,
      GENERATED_EXPERIMENT_CATALOG.length -
        CORE_EXPERIMENT_MANIFESTS.length,
    )

    const enabledInferred =
      inferredManifests.filter(
        (manifest) =>
          manifest.agent.enabled,
      )

    const disabledInferred =
      inferredManifests.filter(
        (manifest) =>
          !manifest.agent.enabled,
      )

    assert.ok(
      enabledInferred.length > 0,
      '应有高置信度自动推断实验被启用',
    )

    assert.ok(
      disabledInferred.length > 0,
      '低置信度实验应继续保持关闭',
    )
  },
)

test(
  'Registry 数量等于已启用 Manifest 数量',
  () => {
    const enabledManifests =
      ALL_EXPERIMENT_MANIFESTS.filter(
        (manifest) =>
          manifest.agent.enabled,
      )

    assert.equal(
      EXPERIMENT_REGISTRY.length,
      enabledManifests.length,
    )
  },
)