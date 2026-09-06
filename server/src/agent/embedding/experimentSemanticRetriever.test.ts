import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { EmbeddingExperimentRetriever } from './experimentSemanticRetriever.js'

import type { ExperimentRouteDefinition } from '../experimentRegistry.js'

const registry: ExperimentRouteDefinition[] = [
  {
    id: 'hm-test-01',
    path: '/demo/hm-test-01',
    title: '函数连续性',
    description: '观察函数在一点附近是否连续。',
    topics: ['连续与间断'],
    semanticEnabled: true,
    aliases: [],
    strongPhrases: [],
    keywords: [],
    supportedIntents: ['explain', 'visualize'],
  },
  {
    id: 'hm-test-02',
    path: '/demo/hm-test-02',
    title: '函数可导性',
    description: '研究左右导数以及切线是否存在。',
    topics: ['导数与微分'],
    semanticEnabled: true,
    aliases: [],
    strongPhrases: [],
    keywords: [],
    supportedIntents: ['explain', 'visualize'],
  },
  {
    id: 'hm-test-03',
    path: '/demo/hm-test-03',
    title: '黎曼和',
    description: '用小矩形逼近曲线下的面积。',
    topics: ['定积分'],
    semanticEnabled: true,
    aliases: [],
    strongPhrases: [],
    keywords: [],
    supportedIntents: ['explain', 'visualize'],
  },
]

test('重建检索器复用磁盘索引，修改描述只重新生成变化的实验', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'mathviz-embedding-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const documents: string[] = []
  const embedder = {
    async embed(input: readonly string[]) {
      documents.push(...input.filter((text) => text.startsWith('实验：')))
      return input.map(() => [1, 0, 0])
    },
  }
  const cache = { directory, model: 'test-model', baseURL: 'https://example.test/v1', dimensions: 3 }
  const first = new EmbeddingExperimentRetriever(embedder, registry, { cache })
  assert.equal((await first.retrieve('查询')).length, 3)
  assert.equal(documents.length, 3)
  documents.length = 0
  const restarted = new EmbeddingExperimentRetriever(embedder, registry, { cache })
  assert.equal((await restarted.retrieve('查询')).length, 3)
  assert.equal(documents.length, 0, '重启不应再次付费生成已有文档向量')
  const changed = registry.map((item, index) => index === 1
    ? { ...item, description: '比较尖点两侧的变化率，判断切线是否唯一。' }
    : item)
  await new EmbeddingExperimentRetriever(embedder, changed, { cache }).retrieve('查询')
  assert.equal(documents.length, 1)
  assert.match(documents[0], /比较尖点两侧/)
})

test('模型、地址或维度变化时不混用旧索引', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'mathviz-embedding-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  let documentCount = 0
  const cache = { directory, model: 'model-a', baseURL: 'https://example.test/v1', dimensions: 3 }
  for (const current of [cache, { ...cache, model: 'model-b' },
    { ...cache, baseURL: 'https://other.test/v1' }, { ...cache, dimensions: 2 }]) {
    const embedder = {
      async embed(input: readonly string[]) {
        documentCount += input.filter((text) => text.startsWith('实验：')).length
        return input.map(() => Array.from({ length: current.dimensions }, () => 1))
      },
    }
    await new EmbeddingExperimentRetriever(embedder, registry, { cache: current }).retrieve('查询')
  }
  assert.equal(documentCount, 12)
})

test('磁盘缓存损坏后自动重建，非法向量不参与匹配', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'mathviz-embedding-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  let documentCount = 0
  const embedder = { async embed(input: readonly string[]) {
    documentCount += input.filter((text) => text.startsWith('实验：')).length
    return input.map(() => [1, 0, 0])
  } }
  const cache = { directory, model: 'test-model', baseURL: 'https://example.test/v1', dimensions: 3 }
  await new EmbeddingExperimentRetriever(embedder, registry, { cache }).retrieve('查询')
  const [name] = await readdir(directory)
  assert.ok(name, '索引应写入缓存目录')
  const file = join(directory, name)
  const saved = JSON.parse(await readFile(file, 'utf8'))
  saved.entries[0].vector = [0, 0, 0]
  await writeFile(file, JSON.stringify(saved))
  documentCount = 0
  assert.equal((await new EmbeddingExperimentRetriever(embedder, registry, { cache }).retrieve('查询')).length, 3)
  assert.equal(documentCount, 1)
  await writeFile(file, 'broken json')
  documentCount = 0
  assert.equal((await new EmbeddingExperimentRetriever(embedder, registry, { cache }).retrieve('查询')).length, 3)
  assert.equal(documentCount, 3)
})

test('不依赖关键词也能按向量相似度召回实验', async () => {
  const module = await import('./experimentSemanticRetriever.js')
    .catch(() => null)

  assert.ok(module, '缺少实验语义召回器')

  const embedder = {
    async embed(input: readonly string[]) {
      if (input.length === registry.length) {
        return [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
        ]
      }

      return [[0.1, 0.95, 0]]
    },
  }
  const retriever = new module.EmbeddingExperimentRetriever(
    embedder,
    registry,
    { minimumSimilarity: 0.4, batchSize: 10 },
  )

  const matches = await retriever.retrieve(
    '连续为什么不能保证存在切线',
    2,
  )

  assert.deepEqual(
    matches.map(({ id }: { id: string }) => id),
    ['hm-test-02'],
  )
  assert.ok(matches[0].similarity > 0.9)
})

test('自动生成的语义文档包含数学标题、模块和实验说明', async () => {
  const module = await import('./experimentSemanticRetriever.js')
    .catch(() => null)

  assert.ok(module, '缺少实验语义召回器')
  assert.equal(
    module.createExperimentSemanticDocument(registry[2]),
    '实验：黎曼和\n所属模块：定积分\n内容：用小矩形逼近曲线下的面积。',
  )
})
