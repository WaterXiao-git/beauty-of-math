import { describe, expect, it, vi } from 'vitest'

import { requestQuestionRoute } from './questionRoute'

const CANDIDATE = {
  id: 'rotation3d',
  path: '/rotation3d',
  title: '三维旋转矩阵',
  score: 0.57,
  confidence: 0.57,
  matchedSignals: ['semantic'],
  intentSupported: true,
  matchQuality: 'related',
  initialParameters: {},
} as const

const AGENT_RESPONSE = {
  question: '用三维图像表示四维',
  generationAllowed: true,
  analysis: {
    originalText: '用三维图像表示四维',
    normalizedText: '用三维图像表示四维',
    knowledgeText: '四维',
    knowledgeTerms: ['四维'],
    removedPhrases: ['用三维图像表示'],
  },
  intent: { primaryIntent: 'visualize', confidence: 0.91, needsAI: true },
  experiments: [CANDIDATE],
  routeDecision: {
    decision: 'ai',
    reason: 'generation-required',
    message: '需要生成新的可视化实验',
    target: null,
    alternatives: [CANDIDATE],
    scoreGap: 0,
  },
  ai: {
    attempted: true,
    status: 'enhanced',
    models: ['deepseek/deepseek-v4-flash'],
    reviewed: false,
    message: '主模型已完成受控路由增强。',
    toolRequest: { name: 'create-experiment', input: { question: '用三维图像表示四维' } },
  },
  explanation: null,
} as const

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('requestQuestionRoute', () => {
  it('使用统一 Agent 路由并适配提问页结果', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(AGENT_RESPONSE)) as typeof fetch

    const outcome = await requestQuestionRoute('  用三维图像表示四维  ', {
      fetchImplementation: fetchMock,
      retryDelaysMs: [],
    })

    expect(outcome.route).toMatchObject({
      question: '用三维图像表示四维',
      intent: 'draw',
      branch: 'ai',
      confidence: 0.91,
      reason: '需要生成新的可视化实验',
    })
    expect(outcome.route.matches[0]).toMatchObject({
      path: '/rotation3d',
      score: 0.57,
    })
    expect(fetchMock).toHaveBeenCalledWith('/api/agent/route', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ question: '用三维图像表示四维' }),
    }))
  })

  it('代理瞬断后按配置重试', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(jsonResponse(AGENT_RESPONSE)) as typeof fetch

    await expect(requestQuestionRoute('用三维图像表示四维', {
      fetchImplementation: fetchMock,
      retryDelaysMs: [0],
    })).resolves.toMatchObject({ attempts: 2 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('客户端错误不会进行无意义重试', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ error: '问题不能为空' }, 400)) as typeof fetch

    await expect(requestQuestionRoute('测试', {
      fetchImplementation: fetchMock,
      retryDelaysMs: [0, 0],
    })).rejects.toMatchObject({ status: 400, attempts: 1 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
