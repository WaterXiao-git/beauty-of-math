import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  AgentRouteRequestError,
  collectRouteCandidates,
  getDirectRoutePath,
  requestAgentRoute,
  type AgentRouteResponse,
} from './agentRouting'

function createCandidate(
  id: string,
  path: string,
) {
  return {
    id,
    path,
    title: id,
    score: 60,
    confidence: 0.85,
    matchedSignals: [`标题:${id}`],
    intentSupported: true,
    matchQuality: 'exact' as const,
  }
}

function createResponse(): AgentRouteResponse {
  const target = createCandidate(
    'riemann-sum',
    '/riemann-sum',
  )

  return {
    question: '打开黎曼和实验',
    analysis: {
      originalText: '打开黎曼和实验',
      normalizedText: '打开黎曼和实验',
      knowledgeText: '黎曼和',
      knowledgeTerms: ['黎曼和'],
      removedPhrases: ['打开', '实验'],
    },
    intent: {
      primaryIntent: 'find-experiment',
      confidence: 0.85,
      needsAI: false,
    },
    experiments: [target],
    routeDecision: {
      decision: 'direct',
      reason: 'clear-route',
      message: '操作意图和实验模块均已明确。',
      target,
      alternatives: [],
      scoreGap: 60,
    },
    ai: {
      attempted: false,
      status: 'skipped',
      models: [],
      reviewed: false,
      message: '规则结果已经足够明确。',
      toolRequest: null,
    },
  }
}

describe('requestAgentRoute', () => {
  it('提交规范化后的问题并解析路由结果', async () => {
    const responseBody = createResponse()
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify(responseBody),
          {
            status: 200,
            headers: {
              'Content-Type':
                'application/json',
            },
          },
        ),
    ) as typeof fetch

    const result = await requestAgentRoute(
      '  打开黎曼和实验  ',
      undefined,
      fetchMock,
    )

    expect(result).toEqual(responseBody)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/agent/route',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          question: '打开黎曼和实验',
        }),
      }),
    )
  })

  it('优先展示服务端错误信息', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            error: '问题不能为空',
          }),
          {
            status: 400,
            headers: {
              'Content-Type':
                'application/json',
            },
          },
        ),
    ) as typeof fetch

    await expect(
      requestAgentRoute(
        '测试问题',
        undefined,
        fetchMock,
      ),
    ).rejects.toMatchObject({
      message: '问题不能为空',
      status: 400,
    } satisfies Partial<AgentRouteRequestError>)
  })

  it('拒绝无法识别的成功响应', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response('{}', {
          status: 200,
          headers: {
            'Content-Type':
              'application/json',
          },
        }),
    ) as typeof fetch

    await expect(
      requestAgentRoute(
        '黎曼和',
        undefined,
        fetchMock,
      ),
    ).rejects.toThrow(
      '实验匹配服务返回了无法识别的数据。',
    )
  })
})

describe('路由结果辅助函数', () => {
  it('只为 direct 决策返回跳转路径', () => {
    const response = createResponse()

    expect(getDirectRoutePath(response)).toBe(
      '/riemann-sum',
    )

    response.routeDecision.decision = 'suggest'

    expect(getDirectRoutePath(response)).toBeNull()
  })

  it('合并目标和备选实验并按路径去重', () => {
    const response = createResponse()
    const duplicate = createCandidate(
      'duplicate',
      '/riemann-sum',
    )
    const alternative = createCandidate(
      'numerical-integration',
      '/numerical-integration',
    )

    response.routeDecision.alternatives = [
      duplicate,
      alternative,
    ]

    expect(
      collectRouteCandidates(response).map(
        (candidate) =>
          candidate.path,
      ),
    ).toEqual([
      '/riemann-sum',
      '/numerical-integration',
    ])
  })
})
