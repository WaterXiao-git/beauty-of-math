// 网格刻度标签：随缩放自适应（缩小显示 5/10/15，放大显示 1/2/3）
// 贴坐标轴显示：x 刻度沿 x 轴（y=0）下方、y 刻度沿 y 轴（x=0）左侧；轴不在画布内时回退底边/左边
import type { ViewportGrid } from '../viewport'

const H = 400
const PAD_L = 62
const PAD_B = 52

export default function GridTicks({ grid }: { grid: ViewportGrid }) {
  const xLabelY = grid.axisY !== null ? grid.axisY + 13 : H - PAD_B + 13
  const yLabelX = grid.axisX !== null ? grid.axisX - 7 : PAD_L - 7
  return (
    <g fontSize={9} fill="#64748b" pointerEvents="none">
      {/* x 轴刻度（沿 x 轴下方） */}
      {grid.verts.map((v, i) =>
        v.label != null ? (
          <text key={"vx" + i} x={v.pos} y={xLabelY} textAnchor="middle">{v.label}</text>
        ) : null,
      )}
      {/* y 轴刻度（沿 y 轴左侧） */}
      {grid.hors.map((h, i) =>
        h.label != null ? (
          <text key={"hy" + i} x={yLabelX} y={h.pos + 3} textAnchor="end">{h.label}</text>
        ) : null,
      )}
    </g>
  )
}
