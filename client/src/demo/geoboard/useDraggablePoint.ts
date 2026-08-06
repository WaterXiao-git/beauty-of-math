// 可拖拽点 hook：命中检测 + 拖拽（世界坐标更新，支持约束）
// 点元素 mousedown 时 stopPropagation，阻止画布平移；mousemove/mouseup 挂 window
import { useState } from 'react'
import type { DragPointOptions } from './types'

export type DragState = 'idle' | 'hover' | 'drag'

export function useDraggablePoint(opts: DragPointOptions) {
  const [state, setState] = useState<DragState>('idle')

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    e.stopPropagation() // 阻止画布 pan
    e.preventDefault()
    const svg = opts.svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    setState('drag')

    const onMove = (ev: MouseEvent) => {
      const mx = ev.clientX - rect.left
      const my = ev.clientY - rect.top
      const mapX = (mx - opts.transform.tx) / opts.transform.scale
      const mapY = (my - opts.transform.ty) / opts.transform.scale
      let wx = opts.coord.fromSx(mapX)
      let wy = opts.coord.fromSy(mapY)
      if (opts.constraint === 'xAxis') wy = 0
      else if (opts.constraint === 'yAxis') wx = 0
      else if (opts.constraint === 'curve' && opts.curveY) wy = opts.curveY(wx)
      opts.onMove(wx, wy)
    }
    const onUp = () => {
      setState('idle')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return { state, onMouseDown }
}