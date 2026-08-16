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
  isAgentRouteResponse,
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
    initialParameters: {},
  }
}

function createResponse(): AgentRouteResponse {
  const target = createCandidate(
    'riemann-sum',
    '/riemann-sum',
  )

  return {
    question: '打开黎曼和实验',
    generationAllowed: true,
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
    explanation: null,
  }
}

describe('requestAgentRoute', () => {
  it('只接受创建临时实验的工具请求并对已删除搜索工具 fail closed', () => {
    const responseWithCreateTool = createResponse()
    responseWithCreateTool.ai.toolRequest = {
      name: 'create-experiment',
      input: { question: '绘制一个参数曲线' },
    }

    expect(isAgentRouteResponse(responseWithCreateTool)).toBe(true)
    expect(isAgentRouteResponse({
      ...responseWithCreateTool,
      ai: {
        ...responseWithCreateTool.ai,
        toolRequest: {
          name: 'search-experiments',
          input: { query: '傅里叶变换' },
        },
      },
    })).toBe(false)
  })

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

  it('解析 Agent 数学解释结果', async () => {
    const responseBody = createResponse()
    responseBody.routeDecision = {
      decision: 'answer',
      reason: 'ai-explanation',
      message: '群是一种代数结构。',
      target: null,
      alternatives: [],
      scoreGap: 0,
    }
    responseBody.experiments = []
    responseBody.explanation = {
      title: '群',
      summary: '群是一种带有二元运算的代数结构。',
      keyPoints: ['满足结合律。', '存在单位元和逆元。'],
      example: '整数在加法下构成群。',
    }
    responseBody.ai.attempted = true
    responseBody.ai.status = 'enhanced'

    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify(responseBody), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }),
    ) as typeof fetch

    await expect(
      requestAgentRoute(
        '什么是群论中的群',
        undefined,
        fetchMock,
      ),
    ).resolves.toEqual(responseBody)
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
