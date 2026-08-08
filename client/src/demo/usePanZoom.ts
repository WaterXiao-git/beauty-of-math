// 画布交互 hook：滚轮缩放（以鼠标位置为中心）+ 拖拽平移
// 用于演示页的 SVG 画布；transform 应用到 <g> 包裹层
import { useRef, useState } from 'react'

export interface PanZoom {
  scale: number
  tx: number
  ty: number
}

export function usePanZoom(minScale = 0.5, maxScale = 12) {
  const [transform, setTransform] = useState<PanZoom>({ scale: 1, tx: 0, ty: 0 })
  const dragRef = useRef<{ startX: number; startY: number; tx: number; ty: number } | null>(null)
  /** 最近一次拖拽是否移动超过阈值（供节点 onClick 区分点击/拖拽） */
  const movedRef = useRef(false)

  // 滚轮缩放：围绕鼠标位置
  const onWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const factor = e.deltaY < 0 ? 1.1 : 0.9
    setTransform((t) => {
      const ns = Math.min(maxScale, Math.max(minScale, t.scale * factor))
      const k = ns / t.scale
      return { scale: ns, tx: mx - (mx - t.tx) * k, ty: my - (my - t.ty) * k }
    })
  }

  const onMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return
    dragRef.current = { startX: e.clientX, startY: e.clientY, tx: transform.tx, ty: transform.ty }
  }

  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const d = dragRef.current
    if (d) {
      setTransform((t) => ({ ...t, tx: d.tx + (e.clientX - d.startX), ty: d.ty + (e.clientY - d.startY) }))
    }
  }

  const onMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    const d = dragRef.current
    if (d) {
      movedRef.current = Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY) > 5
    }
    dragRef.current = null
  }

  const endDrag = () => {
    dragRef.current = null
  }

  const handlers = {
    onWheel,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave: endDrag,
  }

  /** 节点点击时调用：拖拽过则返回 true（忽略点击） */
  const consumeDrag = (): boolean => {
    const moved = movedRef.current
    movedRef.current = false
    return moved
  }

  const reset = () => {
    dragRef.current = null
    movedRef.current = false
    setTransform({ scale: 1, tx: 0, ty: 0 })
  }

  return { transform, handlers, consumeDrag, reset }
}
