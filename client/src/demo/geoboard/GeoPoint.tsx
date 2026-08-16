// GeoPoint：可拖拽点（世界坐标渲染，含命中区 / 拖拽态 / 标签）
import { useDraggablePoint } from './useDraggablePoint'
import type { CoordSystem, PointConstraint } from './types'
import type { PanZoom } from '../usePanZoom'

interface GeoPointProps {
  label: string
  x: number
  y: number
  color?: string
  size?: number
  constraint?: PointConstraint
  /** constraint='curve' 时的曲线 y=f(x) */
  curveY?: (x: number) => number
  onMove?: (x: number, y: number) => void
  coord: CoordSystem
  transform: PanZoom
  svgRef: React.RefObject<SVGSVGElement | null>
  labelDx?: number
  labelDy?: number
}

export default function GeoPoint({
  label, x, y, color = '#60a5fa', size = 6,
  constraint = 'free', curveY, onMove, coord, transform, svgRef, labelDx = 12, labelDy = -10,
}: GeoPointProps) {
  const { state, onMouseDown } = useDraggablePoint({
    x, y, constraint, curveY,
    onMove: onMove ?? (() => {}),
    transform, coord, svgRef,
  })
  const r = state === 'drag' ? size + 3 : size
  const px = coord.sx(x)
  const py = coord.sy(y)
  const draggable = Boolean(onMove)

  return (
    <g
      onMouseDown={draggable ? onMouseDown : undefined}
      style={{ cursor: draggable ? (state === 'drag' ? 'grabbing' : 'grab') : 'default' }}
    >
      {/* 大命中区（透明） */}
      {draggable && <circle cx={px} cy={py} r={16} fill="transparent" />}
      <circle cx={px} cy={py} r={r} fill={color} stroke="#0f172a" strokeWidth={2} />
      {state === 'drag' && (
        <circle cx={px} cy={py} r={r + 6} fill="none" stroke={color} strokeWidth={1} opacity={0.5} />
      )}
      <text x={px + labelDx} y={py + labelDy} fontSize={13} fontWeight={700} fill="#cbd5e1" style={{ pointerEvents: 'none' }}>
        {label}
      </text>
    </g>
  )
}