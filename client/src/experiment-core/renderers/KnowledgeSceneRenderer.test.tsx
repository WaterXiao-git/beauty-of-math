import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { KnowledgeSceneData } from '../models/knowledgeFamilyModel'
import KnowledgeSceneRenderer from './KnowledgeSceneRenderer'

const scene: KnowledgeSceneData = {
  kind: 'cartesian',
  xDomain: [-2, 2],
  yDomain: [-2, 2],
  xLabel: 'x',
  yLabel: 'y',
  series: [
    {
      id: 'curve',
      label: '当前曲线',
      color: '#2563eb',
      segments: [[{ x: -1, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 1 }]],
    },
  ],
  markers: [{ id: 'point', x: 1, y: 1, label: '(1, 1)', color: '#f43f5e' }],
  guides: [{ id: 'guide', x1: -1, y1: -1, x2: 1, y2: 1, color: '#10b981', dashed: true }],
  annotations: ['同源计算'],
}

describe('KnowledgeSceneRenderer', () => {
  it('只根据场景数据绘制曲线、标记、辅助线和图例', () => {
    const html = renderToStaticMarkup(<KnowledgeSceneRenderer scene={scene} />)

    expect(html).toContain('data-series-id="curve"')
    expect(html).toContain('data-marker-id="point"')
    expect(html).toContain('data-guide-id="guide"')
    expect(html).toContain('当前曲线')
    expect(html).toContain('同源计算')
  })

  it('曲线数据改变时 SVG 路径随之改变', () => {
    const first = renderToStaticMarkup(<KnowledgeSceneRenderer scene={scene} />)
    const changed: KnowledgeSceneData = {
      ...scene,
      series: [{ ...scene.series[0], segments: [[{ x: -1, y: -1 }, { x: 0, y: 1 }, { x: 1, y: -1 }]] }],
    }
    const second = renderToStaticMarkup(<KnowledgeSceneRenderer scene={changed} />)

    expect(first).not.toBe(second)
  })
})
