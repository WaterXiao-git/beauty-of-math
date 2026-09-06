import type {
  ExperimentRouteDefinition,
} from '../experimentRegistry.js'

import type { TextEmbedder } from './qwenEmbeddingClient.js'
import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export interface SemanticExperimentMatch {
  id: string
  similarity: number
}

export interface ExperimentSemanticRetriever {
  retrieve(
    question: string,
    limit?: number,
  ): Promise<SemanticExperimentMatch[]>
}

interface RetrieverOptions {
  minimumSimilarity?: number
  batchSize?: number
  cache?: {
    directory: string
    model: string
    baseURL: string
    dimensions: number
  }
}

interface IndexedExperiment {
  id: string
  documentHash: string
  vector: number[]
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function validVector(value: unknown, dimensions: number): value is number[] {
  return Array.isArray(value) && value.length === dimensions &&
    value.every((item) => typeof item === 'number' && Number.isFinite(item)) &&
    value.some((item) => item !== 0)
}

export function createExperimentSemanticDocument(
  definition: ExperimentRouteDefinition,
): string {
  return [
    `实验：${definition.title}`,
    `所属模块：${definition.topics.join('、')}`,
    `内容：${definition.description}`,
  ].join('\n')
}

function cosineSimilarity(
  left: readonly number[],
  right: readonly number[],
): number {
  if (left.length === 0 || left.length !== right.length) {
    return 0
  }

  let dotProduct = 0
  let leftNorm = 0
  let rightNorm = 0

  for (let index = 0; index < left.length; index += 1) {
    dotProduct += left[index] * right[index]
    leftNorm += left[index] ** 2
    rightNorm += right[index] ** 2
  }

  if (leftNorm === 0 || rightNorm === 0) {
    return 0
  }

  return dotProduct / Math.sqrt(leftNorm * rightNorm)
}

export class EmbeddingExperimentRetriever
implements ExperimentSemanticRetriever {
  private readonly embedder: TextEmbedder
  private readonly registry: readonly ExperimentRouteDefinition[]
  private readonly minimumSimilarity: number
  private readonly batchSize: number
  private indexPromise: Promise<IndexedExperiment[]> | null = null
  private readonly cache: RetrieverOptions['cache']
  private readonly cacheFile: string | null
  private state: 'idle' | 'building' | 'ready' | 'failed' = 'idle'
  private indexedCount = 0
  private reusedCount = 0
  private cacheAvailable = false

  constructor(
    embedder: TextEmbedder,
    registry: readonly ExperimentRouteDefinition[],
    options: RetrieverOptions = {},
  ) {
    this.embedder = embedder
    this.registry = registry
    this.minimumSimilarity =
      options.minimumSimilarity ?? 0.48
    this.batchSize = Math.max(
      1,
      Math.floor(options.batchSize ?? 10),
    )
    this.cache = options.cache
    this.cacheFile = options.cache ? join(options.cache.directory, `${hash(JSON.stringify([
      1, options.cache.baseURL, options.cache.model, options.cache.dimensions,
    ]))}.json`) : null
  }

  getStatus() {
    return {
      state: this.state,
      indexedCount: this.indexedCount,
      totalCount: this.registry.length,
      reusedCount: this.reusedCount,
      persistent: this.cacheAvailable,
    }
  }

  async warmup(): Promise<void> {
    await this.getIndex()
  }

  private async readCache(): Promise<Map<string, IndexedExperiment>> {
    const result = new Map<string, IndexedExperiment>()
    if (!this.cacheFile || !this.cache) return result
    try {
      const saved = JSON.parse(await readFile(this.cacheFile, 'utf8'))
      if (saved?.version !== 1 || saved.model !== this.cache.model ||
        saved.baseURL !== this.cache.baseURL || saved.dimensions !== this.cache.dimensions ||
        !Array.isArray(saved.entries)) return result
      for (const entry of saved.entries) {
        if (entry && typeof entry.id === 'string' && typeof entry.documentHash === 'string' &&
          validVector(entry.vector, this.cache.dimensions)) result.set(entry.id, entry)
      }
      this.cacheAvailable = true
    } catch {
      // 首次启动或缓存损坏时重新生成；缓存不包含密钥。
    }
    return result
  }

  private async writeCache(entries: IndexedExperiment[]): Promise<void> {
    if (!this.cacheFile || !this.cache) return
    const temporaryFile = `${this.cacheFile}.${randomUUID()}.tmp`
    try {
      await mkdir(this.cache.directory, { recursive: true })
      await writeFile(temporaryFile, JSON.stringify({
        version: 1,
        model: this.cache.model,
        baseURL: this.cache.baseURL,
        dimensions: this.cache.dimensions,
        entries,
      }), { flag: 'wx' })
      await rename(temporaryFile, this.cacheFile)
      this.cacheAvailable = true
    } catch {
      this.cacheAvailable = false
      // 只读磁盘不阻断内存检索，清理本次写入的临时文件。
      await unlink(temporaryFile).catch(() => undefined)
    }
  }

  private async buildIndex(): Promise<IndexedExperiment[]> {
    this.state = 'building'
    this.reusedCount = 0
    const saved = await this.readCache()
    const indexed: IndexedExperiment[] = []
    const pending = this.registry.map((definition) => ({
      definition,
      document: createExperimentSemanticDocument(definition),
    })).filter(({ definition, document }) => {
      const cached = saved.get(definition.id)
      if (cached?.documentHash !== hash(document)) return true
      indexed.push(cached)
      this.reusedCount += 1
      return false
    })

    for (
      let offset = 0;
      offset < pending.length;
      offset += this.batchSize
    ) {
      const definitions = pending.slice(
        offset,
        offset + this.batchSize,
      )
      const vectors = await this.embedder.embed(
        definitions.map(({ document }) => document),
      )

      definitions.forEach(({ definition, document }, index) => {
        const dimensions = this.cache?.dimensions ?? vectors[0]?.length ?? 0
        if (!validVector(vectors[index], dimensions)) {
          throw new Error('实验索引包含非法向量')
        }
        indexed.push({
          id: definition.id,
          documentHash: hash(document),
          vector: vectors[index],
        })
      })
    }

    if (pending.length > 0 || saved.size !== this.registry.length) await this.writeCache(indexed)
    this.indexedCount = indexed.length
    this.state = 'ready'
    return indexed
  }

  private getIndex(): Promise<IndexedExperiment[]> {
    if (!this.indexPromise) {
      this.indexPromise = this.buildIndex().catch((error) => {
        this.indexPromise = null
        this.state = 'failed'
        throw error
      })
    }

    return this.indexPromise
  }

  async retrieve(
    question: string,
    limit = 6,
  ): Promise<SemanticExperimentMatch[]> {
    const normalizedQuestion = question.trim()

    if (!normalizedQuestion) {
      return []
    }

    const [[queryVector], index] = await Promise.all([
      this.embedder.embed([normalizedQuestion]),
      this.getIndex(),
    ])
    if (!validVector(queryVector, this.cache?.dimensions ?? index[0]?.vector.length ?? 0)) {
      throw new Error('查询向量无效')
    }

    return index
      .map(({ id, vector }) => ({
        id,
        similarity: cosineSimilarity(queryVector, vector),
      }))
      .filter(
        ({ similarity }) =>
          similarity >= this.minimumSimilarity,
      )
      .sort(
        (left, right) =>
          right.similarity - left.similarity ||
          left.id.localeCompare(right.id),
      )
      .slice(0, Math.max(1, Math.floor(limit)))
  }
}
