import { afterEach, describe, expect, it, vi } from 'vitest'
import { matchRoutes } from 'react-router-dom'

import { APP_ROUTE_PATHS } from './appRoutes'
import {
  loadDynamicExperimentPreview,
  saveDynamicExperimentPreview,
} from './services/dynamicExperiment'
import type { DynamicExperimentResponse } from './types/dynamicExperiment'

const preview: DynamicExperimentResponse = {
  question: '画出 y=x',
  spec: {
    version: 1,
    title: '一次函数',
    description: '直线图像',
    gradeLevel: '高中',
    formulaLatex: 'y=x',
    parameters: [],
    renderer: {
      type: 'cartesian-2d',
      expression: 'x',
      xMin: -1,
      xMax: 1,
      yMin: -1,
      yMax: 1,
      samples: 20,
    },
    steps: [],
    knowledgePoints: [],
  },
  generation: {
    models: ['test'],
    reviewed: true,
    fallback: false,
    temporary: true,
  },
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('动态实验临时预览', () => {
  it('通过 sessionStorage 保存并读取受约束 spec', () => {
    const entries = new Map<string, string>()
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
    })

    saveDynamicExperimentPreview(preview)

    expect(loadDynamicExperimentPreview()).toEqual(preview)
  })
})

describe('动态实验路由', () => {
  it('匹配两个入口并解析新目录的页面模块', async () => {
    const routes = [{
      path: '/',
      children: [
        { path: APP_ROUTE_PATHS.temp },
        { path: APP_ROUTE_PATHS.generatedExperiment },
      ],
    }]

    expect(matchRoutes(routes, '/temp/example-spec')?.at(-1)?.params)
      .toEqual({ specId: 'example-spec' })
    expect(matchRoutes(routes, '/generated-experiment')?.at(-1)?.route.path)
      .toBe(APP_ROUTE_PATHS.generatedExperiment)

    const [tempExperiment, dynamicExperiment] = await Promise.all([
      import('./demo/TempExperiment'),
      import('./dynamic-experiment/DynamicExperimentPage'),
    ])

    expect(tempExperiment.default).toBeTypeOf('function')
    expect(dynamicExperiment.default).toBeTypeOf('function')
  })
})
