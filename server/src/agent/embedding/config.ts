import '../../config/environment.js'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

export function loadEmbeddingCacheDirectory(environment: NodeJS.ProcessEnv = process.env): string {
  const serverDirectory = fileURLToPath(new URL('../../../', import.meta.url))
  return resolve(serverDirectory, environment.QWEN_EMBEDDING_CACHE_DIR?.trim() || '.cache/embeddings')
}

export interface EmbeddingConfig {
  enabled: boolean
  apiKey: string
  baseURL: string
  model: string
  dimensions: number
  timeoutMs: number
}

function positiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : fallback
}

function explicitlyDisabled(value: string | undefined): boolean {
  return ['0', 'false', 'off', 'no'].includes(
    value?.trim().toLowerCase() ?? '',
  )
}

function firstNonblank(
  ...values: Array<string | undefined>
): string {
  return values
    .map((value) => value?.trim() ?? '')
    .find(Boolean) ?? ''
}

export function loadEmbeddingConfig(
  environment: NodeJS.ProcessEnv = process.env,
): EmbeddingConfig {
  const apiKey = firstNonblank(
    environment.QWEN_EMBEDDING_API_KEY,
    environment.QWEN_API_KEY,
    environment.DASHSCOPE_API_KEY,
  )

  return {
    enabled:
      apiKey.length > 0 &&
      !explicitlyDisabled(
        environment.QWEN_EMBEDDING_ENABLED,
      ),
    apiKey,
    baseURL: firstNonblank(
      environment.QWEN_EMBEDDING_BASE_URL,
      environment.QWEN_BASE_URL,
      'https://dashscope.aliyuncs.com/compatible-mode/v1',
    ).replace(/\/$/, ''),
    model:
      environment.QWEN_EMBEDDING_MODEL?.trim() ||
      'qwen3.7-text-embedding-flash',
    dimensions: positiveInteger(
      environment.QWEN_EMBEDDING_DIMENSIONS,
      1024,
    ),
    timeoutMs: positiveInteger(
      environment.QWEN_EMBEDDING_TIMEOUT_MS,
      8_000,
    ),
  }
}
