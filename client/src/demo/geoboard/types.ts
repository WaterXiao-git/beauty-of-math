// ============================================================================
// geoboard 几何画板内核（GeoGebra 式预留框架）
// 目标：演示画布内的可拖拽点 / 关联直线 / 坐标轴无限延伸 / 可扩展对象模型
//
// 已预留能力：
//   - 可拖拽点（约束：free 自由 / xAxis 沿 x 轴 / curve 沿曲线）
//   - 关联直线（两点定线 / 水平 / 垂直），自动贯穿可视区域（无限延伸）
//   - 拖拽点 → 依赖对象响应式更新（父组件持有状态即可）
// 后续可扩展（对象模型预留）：
//   - 衍生对象：中点 / 交点 / 垂直·平行线
//   - 测量：距离 / 斜率 / 角度（标签自动更新）
//   - 约束系统：点在曲线上 / 点在轴上 / 线线相交
//   - 对象面板：可见性 / 颜色 / 锁定 / 撤销重置
// ============================================================================

import type { PanZoom } from '../usePanZoom'

/** 坐标映射（世界坐标 <-> 绘图映射坐标） */
export interface CoordSystem {
  sx: (x: number) => number
  sy: (y: number) => number
  fromSx: (mx: number) => number
  fromSy: (my: number) => number
}

/** 拖拽约束 */
export type PointConstraint = 'free' | 'xAxis' | 'yAxis' | 'curve'

export interface DragPointOptions {
  /** 世界坐标 */
  x: number
  y: number
  constraint?: PointConstraint
  /** constraint='curve' 时的曲线 y=f(x) */
  curveY?: (x: number) => number
  onMove: (x: number, y: number) => void
  transform: PanZoom
  coord: CoordSystem
  /** 画布 svg 引用（用于坐标换算） */
  svgRef: React.RefObject<SVGSVGElement | null>
}

export interface Rect {
  xmin: number
  xmax: number
  ymin: number
  ymax: number
}

/** 计算当前可视区域（绘图映射坐标） */
export function visibleRect(t: PanZoom, W: number, H: number): Rect {
  return {
    xmin: -t.tx / t.scale,
    xmax: (W - t.tx) / t.scale,
    ymin: (H - t.ty) / t.scale,
    ymax: -t.ty / t.scale,
  }
}

/** 直线与可视矩形裁剪（Liang-Barsky）：返回裁剪后两点的映射坐标，完全在矩形外返回 null */
export function clipLineToRect(
  x1: number, y1: number, x2: number, y2: number, r: Rect,
): [number, number, number, number] | null {
  const dx = x2 - x1
  const dy = y2 - y1
  let t0 = 0
  let t1 = 1
  const p = [-dx, dx, -dy, dy]
  const q = [x1 - r.xmin, r.xmax - x1, y1 - r.ymin, r.ymax - y1]
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return null
    } else {
      const t = q[i] / p[i]
      if (p[i] < 0) {
        if (t > t1) return null
        if (t > t0) t0 = t
      } else {
        if (t < t0) return null
        if (t < t1) t1 = t
      }
    }
  }
  return [x1 + t0 * dx, y1 + t0 * dy, x1 + t1 * dx, y1 + t1 * dy]
}