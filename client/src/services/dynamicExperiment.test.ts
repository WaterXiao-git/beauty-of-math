import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  requestDynamicExperiment,
} from './dynamicExperiment'

function validResponse() {
  return {
    question: '画出 y=x^2',
    spec: {
      version: 1,
      title: '二次函数实验',
      description: '观察抛物线。',
      gradeLevel: '初中',
      formulaLatex: 'y=x^2',
      parameters: [],
      renderer: {
        type: 'cartesian-2d',
        expression: 'x^2',
        xMin: -5,
        xMax: 5,
        yMin: -2,
        yMax: 10,
        samples: 300,
      },
      steps: [
        {
          title: '观察',
          description: '观察曲线形状。',
          parameterValues: {},
        },
      ],
      knowledgePoints: ['图像关于 y 轴对称。'],
    },
    generation: {
      models: ['deepseek/deepseek-v4-flash'],
      reviewed: false,
      fallback: false,
      temporary: true,
    },
  }
}

describe('requestDynamicExperiment', () => {
  it('请求并解析动态实验', async () => {
    const body = validResponse()
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify(body), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }),
    ) as typeof fetch

    await expect(
      requestDynamicExperiment(
        '画出 y=x^2',
        undefined,
        fetchMock,
      ),
    ).resolves.toEqual(body)
  })

  it('拒绝未知渲染器', async () => {
    const body = validResponse()
    body.spec.renderer.type = 'javascript'
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify(body), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }),
    ) as typeof fetch

    await expect(
      requestDynamicExperiment(
        '生成代码',
        undefined,
        fetchMock,
      ),
    ).rejects.toThrow('无法识别')
  })

  it('拒绝包含未授权函数的表达式', async () => {
    const body = validResponse()
    body.spec.renderer.expression = 'import(x)'
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify(body), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }),
    ) as typeof fetch

    await expect(
      requestDynamicExperiment(
        '执行表达式',
        undefined,
        fetchMock,
      ),
    ).rejects.toThrow('无法识别')
  })
})
