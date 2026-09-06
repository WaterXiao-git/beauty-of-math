import test from 'node:test'
import assert from 'node:assert/strict'

test('千问向量配置优先使用独立变量并允许复用千问密钥', async () => {
  const module = await import('./config.js').catch(() => null)

  assert.ok(module, '缺少千问向量配置模块')

  const config = module.loadEmbeddingConfig({
    QWEN_API_KEY: 'shared-key',
    QWEN_EMBEDDING_BASE_URL: 'https://example.test/compatible-mode/v1/',
    QWEN_EMBEDDING_MODEL: 'qwen3.7-text-embedding-flash',
    QWEN_EMBEDDING_DIMENSIONS: '768',
    QWEN_EMBEDDING_TIMEOUT_MS: '4500',
  })

  assert.deepEqual(config, {
    enabled: true,
    apiKey: 'shared-key',
    baseURL: 'https://example.test/compatible-mode/v1',
    model: 'qwen3.7-text-embedding-flash',
    dimensions: 768,
    timeoutMs: 4500,
  })
})

test('未配置密钥时关闭语义向量路由', async () => {
  const module = await import('./config.js').catch(() => null)

  assert.ok(module, '缺少千问向量配置模块')
  assert.equal(module.loadEmbeddingConfig({}).enabled, false)
})

test('独立密钥留空时继续复用千问聊天密钥', async () => {
  const module = await import('./config.js').catch(() => null)

  assert.ok(module, '缺少千问向量配置模块')
  assert.equal(
    module.loadEmbeddingConfig({
      QWEN_EMBEDDING_API_KEY: '   ',
      QWEN_API_KEY: 'shared-key',
    }).apiKey,
    'shared-key',
  )
})
