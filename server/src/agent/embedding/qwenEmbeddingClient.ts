import type { EmbeddingConfig } from './config.js'

export interface TextEmbedder {
  embed(input: readonly string[]): Promise<number[][]>
}

interface EmbeddingResponse {
  data?: Array<{
    index?: unknown
    embedding?: unknown
  }>
}

function validVector(
  value: unknown,
  dimensions: number,
): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === dimensions &&
    value.every(
      (item) =>
        typeof item === 'number' &&
        Number.isFinite(item),
    )
  )
}

export class QwenEmbeddingClient implements TextEmbedder {
  private readonly config: EmbeddingConfig
  private readonly request: typeof fetch

  constructor(
    config: EmbeddingConfig,
    request: typeof fetch = fetch,
  ) {
    this.config = config
    this.request = request
  }

  async embed(input: readonly string[]): Promise<number[][]> {
    if (input.length === 0) {
      return []
    }

    const controller = new AbortController()
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.timeoutMs,
    )

    try {
      const response = await this.request(
        `${this.config.baseURL}/embeddings`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.config.model,
            input,
            dimensions: this.config.dimensions,
            encoding_format: 'float',
          }),
          signal: controller.signal,
        },
      )

      if (!response.ok) {
        throw new Error(
          `千问 Embedding 请求失败（HTTP ${response.status}）`,
        )
      }

      const body = await response.json() as EmbeddingResponse
      const ordered = [...(body.data ?? [])].sort(
        (left, right) =>
          Number(left.index) - Number(right.index),
      )

      if (
        ordered.length !== input.length ||
        ordered.some(
          (item, index) =>
            item.index !== index ||
            !validVector(
              item.embedding,
              this.config.dimensions,
            ),
        )
      ) {
        throw new Error('千问 Embedding 返回非法向量响应')
      }

      return ordered.map(
        (item) => item.embedding as number[],
      )
    } finally {
      clearTimeout(timeout)
    }
  }
}
