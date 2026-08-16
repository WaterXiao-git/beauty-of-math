import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'

import app from './app.js'

async function withServer(
  run: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')

  const address = server.address()
  assert.ok(address && typeof address !== 'string')

  try {
    await run(`http://127.0.0.1:${address.port}`)
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
    })
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function assertErrorResponse(body: unknown): void {
  assert.ok(isRecord(body))
  assert.equal(typeof body.error, 'string')
}

test('API 挂载面保留现有能力并移除旧实验链路', async () => {
  await withServer(async (baseUrl) => {
    const health = await fetch(`${baseUrl}/api/health`)
    assert.equal(health.status, 200)
    const healthBody: unknown = await health.json()
    assert.ok(isRecord(healthBody))
    assert.equal(healthBody.status, 'ok')
    assert.equal(typeof healthBody.timestamp, 'string')

    const agentStatus = await fetch(`${baseUrl}/api/agent/status`, {
      headers: { Origin: 'https://mathviz.example.test' },
    })
    assert.equal(agentStatus.status, 200)
    assert.equal(agentStatus.headers.get('access-control-allow-origin'), '*')
    const agentStatusBody: unknown = await agentStatus.json()
    assert.ok(isRecord(agentStatusBody))
    assert.equal(typeof agentStatusBody.enabled, 'boolean')
    assert.ok(isRecord(agentStatusBody.tools))
    assert.equal(typeof agentStatusBody.tools.createExperiment, 'string')

    const intent = await fetch(`${baseUrl}/api/agent/intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: '展示导数的几何意义' }),
    })
    assert.equal(intent.status, 200)
    const intentBody: unknown = await intent.json()
    assert.ok(isRecord(intentBody))
    assert.equal(typeof intentBody.primaryIntent, 'string')
    assert.equal(typeof intentBody.confidence, 'number')

    const route = await fetch(`${baseUrl}/api/agent/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: '' }),
    })
    assert.equal(route.status, 400)
    assertErrorResponse(await route.json())

    const generation = await fetch(`${baseUrl}/api/agent/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: '今天天气怎么样' }),
    })
    assert.equal(generation.status, 422)
    assertErrorResponse(await generation.json())

    const answer = await fetch(`${baseUrl}/api/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: '' }),
    })
    assert.equal(answer.status, 400)
    assertErrorResponse(await answer.json())

    const knowledge = await fetch(`${baseUrl}/api/knowledge`)
    assert.equal(knowledge.status, 200)
    const knowledgeBody: unknown = await knowledge.json()
    assert.ok(Array.isArray(knowledgeBody))
    assert.ok(knowledgeBody.length > 0)
    assert.ok(isRecord(knowledgeBody[0]))
    assert.equal(typeof knowledgeBody[0].id, 'string')
    assert.equal(typeof knowledgeBody[0].title, 'string')

    const courses = await fetch(`${baseUrl}/api/content/courses`)
    assert.equal(courses.status, 200)
    const coursesBody: unknown = await courses.json()
    assert.ok(Array.isArray(coursesBody))
    assert.ok(coursesBody.length > 0)
    assert.ok(isRecord(coursesBody[0]))
    assert.equal(typeof coursesBody[0].id, 'string')
    assert.equal(typeof coursesBody[0].chapterCount, 'number')

    for (const endpoint of [
      { path: '/api/experiments' },
      { path: '/api/route', method: 'POST' },
      { path: '/api/generate', method: 'POST' },
      { path: '/api/content/experiments' },
    ]) {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
      })
      assert.equal(response.status, 404, endpoint.path)
    }
  })
})
