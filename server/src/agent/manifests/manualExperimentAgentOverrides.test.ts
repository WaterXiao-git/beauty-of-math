import test from 'node:test'
import assert from 'node:assert/strict'

import {
  ALL_EXPERIMENT_MANIFESTS,
} from './allExperimentManifests.js'

import {
  GENERATED_EXPERIMENT_CATALOG,
} from './generatedExperimentCatalog.js'

import {
  MANUAL_EXPERIMENT_AGENT_OVERRIDES,
} from './manualExperimentAgentOverrides.js'

test(
  '所有人工补丁路径都对应真实实验',
  () => {
    const catalogPaths =
      new Set<string>(
        GENERATED_EXPERIMENT_CATALOG.map(
          (experiment) =>
            experiment.path,
        ),
      )

    for (
      const path
      of Object.keys(
        MANUAL_EXPERIMENT_AGENT_OVERRIDES,
      )
    ) {
      assert.ok(
        catalogPaths.has(path),
        `人工 Agent 补丁对应的实验不存在：${path}`,
      )
    }
  },
)

test(
  '人工补丁没有空白搜索词',
  () => {
    for (
      const [path, override]
      of Object.entries(
        MANUAL_EXPERIMENT_AGENT_OVERRIDES,
      )
    ) {
      const searchTerms = [
        ...(override.aliases ?? []),
        ...(override.strongPhrases ?? []),
        ...(override.keywords ?? []),
      ]

      assert.ok(
        searchTerms.length > 0,
        `${path} 没有提供任何语义搜索词`,
      )

      for (const term of searchTerms) {
        assert.ok(
          term.trim().length > 0,
          `${path} 包含空白语义搜索词`,
        )
      }
    }
  },
)

test(
  '人工搜索词已合并到完整 Manifest',
  () => {
    const manifestByPath =
      new Map(
        ALL_EXPERIMENT_MANIFESTS.map(
          (manifest) => [
            manifest.path,
            manifest,
          ],
        ),
      )

    for (
      const [path, override]
      of Object.entries(
        MANUAL_EXPERIMENT_AGENT_OVERRIDES,
      )
    ) {
      const manifest =
        manifestByPath.get(path)

      assert.ok(
        manifest,
        `没有找到完整 Manifest：${path}`,
      )

      for (
        const alias
        of override.aliases ?? []
      ) {
        assert.ok(
          manifest.agent.aliases.includes(
            alias,
          ),
          `${path} 未合并 alias：${alias}`,
        )
      }

      for (
        const phrase
        of override.strongPhrases ?? []
      ) {
        assert.ok(
          manifest.agent
            .strongPhrases
            .includes(phrase),
          `${path} 未合并 strongPhrase：${phrase}`,
        )
      }

      for (
        const keyword
        of override.keywords ?? []
      ) {
        assert.ok(
          manifest.agent.keywords.includes(
            keyword,
          ),
          `${path} 未合并 keyword：${keyword}`,
        )
      }
    }
  },
)