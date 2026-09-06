import test from 'node:test'
import assert from 'node:assert/strict'

test('通过 OpenAI 兼容 embeddings 接口批量获取有序向量', async () => {
  const module = await import('./qwenEmbeddingClient.js').catch(() => null)

  assert.ok(module, '缺少千问 Embedding 客户端')

  let requestURL = ''
  let requestInit: RequestInit | undefined
  const client = new module.QwenEmbeddingClient(
    {
      enabled: true,
      apiKey: 'test-key',
      baseURL: 'https://example.test/compatible-mode/v1',
      model: 'qwen3.7-text-embedding-flash',
      dimensions: 3,
      timeoutMs: 1000,
    },
    async (input: string | URL | Request, init?: RequestInit) => {
      requestURL = String(input)
      requestInit = init

      return new Response(JSON.stringify({
        data: [
          { index: 1, embedding: [0, 1, 0] },
          { index: 0, embedding: [1, 0, 0] },
        ],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    },
  )

  const vectors = await client.embed(['导数', '积分'])

  assert.deepEqual(vectors, [[1, 0, 0], [0, 1, 0]])
  assert.equal(
    requestURL,
    'https://example.test/compatible-mode/v1/embeddings',
  )
  assert.equal(
    new Headers(requestInit?.headers).get('Authorization'),
    'Bearer test-key',
  )
  assert.deepEqual(
    JSON.parse(String(requestInit?.body)),
    {
      model: 'qwen3.7-text-embedding-flash',
      input: ['导数', '积分'],
      dimensions: 3,
      encoding_format: 'float',
    },
  )
})

test('拒绝数量不完整或包含非法数字的向量响应', async () => {
  const module = await import('./qwenEmbeddingClient.js').catch(() => null)

  assert.ok(module, '缺少千问 Embedding 客户端')

  const client = new module.QwenEmbeddingClient(
    {
      enabled: true,
      apiKey: 'test-key',
      baseURL: 'https://example.test/v1',
      model: 'embedding-test',
      dimensions: 3,
      timeoutMs: 1000,
    },
    async () => new Response(JSON.stringify({
      data: [{ index: 0, embedding: [1, Number.NaN, 0] }],
    }), { status: 200 }),
  )

  await assert.rejects(
    client.embed(['导数']),
    /非法向量响应/,
  )
})
