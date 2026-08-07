// 网格刻度标签：随缩放自适应（缩小显示 5/10/15，放大显示 1/2/3），贴底边/左边显示
import type { ViewportGrid } from '../viewport'

const H = 400
const PAD_L = 62
const PAD_B = 52

export default function GridTicks({ grid }: { grid: ViewportGrid }) {
  return (
    <g fontSize={9} fill="#64748b" pointerEvents="none">
      {/* x 轴刻度（底边） */}
      {grid.verts.map((v, i) =>
        v.label != null ? (
          <text key={"vx" + i} x={v.pos} y={H - PAD_B + 13} textAnchor="middle">{v.label}</text>
        ) : null,
      )}
      {/* y 轴刻度（左边） */}
      {grid.hors.map((h, i) =>
        h.label != null ? (
          <text key={"hy" + i} x={PAD_L - 7} y={h.pos + 3} textAnchor="end">{h.label}</text>
        ) : null,
      )}
    </g>
  )
}
