// GeoLine：关联直线（两点定线），自动贯穿可视区域（无限延伸，随 pan/zoom 重算）
import { clipLineToRect, visibleRect } from './types'
import type { CoordSystem } from './types'
import type { PanZoom } from '../usePanZoom'

interface GeoLineProps {
  /** 世界坐标端点 */
  x1: number
  y1: number
  x2: number
  y2: number
  color?: string
  width?: number
  dash?: string
  coord: CoordSystem
  transform: PanZoom
  /** 画布尺寸 */
  W: number
  H: number
}

export default function GeoLine({
  x1, y1, x2, y2, color = '#38bdf8', width = 2.2, dash,
  coord, transform, W, H,
}: GeoLineProps) {
  const r = visibleRect(transform, W, H)
  const clipped = clipLineToRect(coord.sx(x1), coord.sy(y1), coord.sx(x2), coord.sy(y2), r)
  if (!clipped) return null
  return (
    <line
      x1={clipped[0]} y1={clipped[1]} x2={clipped[2]} y2={clipped[3]}
      stroke={color} strokeWidth={width} strokeDasharray={dash}
    />
  )
}