// 视口计算工具：正方形格子（等比例世界映射）+ 网格/坐标轴无限延伸 + 刻度标签
// 网格线、坐标轴按当前缩放/平移在屏幕坐标绘制，始终铺满可视区域；
// 曲线等数据内容保持在世界坐标（<g transform> 内）
import type { PanZoom } from './usePanZoom'

/** 取"好看的"刻度步长（1/2/5 × 10^n） */
export function niceStep(raw: number): number {
  if (raw <= 0) return 1
  const pow = Math.pow(10, Math.floor(Math.log10(raw)))
  const r = raw / pow
  if (r < 1.5) return pow
  if (r < 3) return 2 * pow
  if (r < 7) return 5 * pow
  return 10 * pow
}

/** 刻度标签格式：整数显示整数，否则 1 位小数 */
function fmtTick(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}

/** 等比例世界映射：x/y 单位像素一致 → 正方形格子 */
export interface WorldMap {
  sx: (x: number) => number
  sy: (y: number) => number
  fromSx: (mx: number) => number
  fromSy: (my: number) => number
  /** 每单位世界坐标的像素（x/y 相同） */
  unit: number
}

export function buildWorldMap(
  domain: [number, number],
  yRange: [number, number],
  W: number,
  H: number,
  padL: number,
  padR: number,
  padT: number,
  padB: number,
): WorldMap {
  const xSpan = domain[1] - domain[0]
  const ySpan = yRange[1] - yRange[0]
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const unit = Math.min(plotW / xSpan, plotH / ySpan)
  const offX = padL + (plotW - xSpan * unit) / 2
  const offY = padT + (plotH - ySpan * unit) / 2
  const baseY = H - padB - offY
  const sx = (x: number) => offX + (x - domain[0]) * unit
  const sy = (y: number) => baseY - (y - yRange[0]) * unit
  const fromSx = (mx: number) => domain[0] + (mx - offX) / unit
  const fromSy = (my: number) => yRange[0] + (baseY - my) / unit
  return { sx, sy, fromSx, fromSy, unit }
}

export interface GridLine {
  /** 屏幕坐标位置（垂直线的 x / 水平线的 y） */
  pos: number
  /** 是否主刻度（世界整数轴，加粗） */
  major: boolean
  /** 刻度标签（如 1 / 2 / 5 / 10），轴旁显示 */
  label?: string
}

export interface ViewportGrid {
  /** 垂直网格线（屏幕 x） */
  verts: GridLine[]
  /** 水平网格线（屏幕 y） */
  hors: GridLine[]
  /** y 轴屏幕 x（世界 x=0）；不在画布内则为 null */
  axisX: number | null
  /** x 轴屏幕 y（世界 y=0）；不在画布内则为 null */
  axisY: number | null
}

/**
 * 根据当前 pan/zoom 变换与数据映射，计算铺满屏幕的网格线与贯穿坐标轴（屏幕坐标）
 * 内部使用等比例映射（buildWorldMap），网格为正方形格子
 * @param t 当前 transform
 * @param W H 画布尺寸
 * @param domain 数据 x 范围
 * @param yRange 数据 y 范围
 * @param padL padR padT padB 绘图内边距
 * @param majorEvery 主刻度间隔（个网格）
 */
export function calcViewportGrid(
  t: PanZoom,
  W: number,
  H: number,
  domain: [number, number],
  yRange: [number, number],
  padL: number,
  padR: number,
  padT: number,
  padB: number,
  majorEvery = 5,
): ViewportGrid {
  const map = buildWorldMap(domain, yRange, W, H, padL, padR, padT, padB)

  // 屏幕坐标 → 映射坐标
  const xMapMin = -t.tx / t.scale
  const xMapMax = (W - t.tx) / t.scale
  const yMapMin = (H - t.ty) / t.scale // 屏幕 y=H
  const yMapMax = -t.ty / t.scale // 屏幕 y=0

  // 映射坐标 → 世界坐标（等比例）
  const worldXMin = map.fromSx(xMapMin)
  const worldXMax = map.fromSx(xMapMax)
  const worldYMin = map.fromSy(yMapMin)
  const worldYMax = map.fromSy(yMapMax)

  const xStep = niceStep((worldXMax - worldXMin) / 14)
  const yStep = niceStep((worldYMax - worldYMin) / 14)

  const verts: GridLine[] = []
  const xStart = Math.ceil(worldXMin / xStep) * xStep
  for (let c = xStart, i = 0; c <= worldXMax + xStep / 2; c += xStep, i++) {
    verts.push({ pos: t.tx + map.sx(c) * t.scale, major: i % majorEvery === 0, label: fmtTick(c) })
  }
  const hors: GridLine[] = []
  const yStart = Math.ceil(worldYMin / yStep) * yStep
  for (let c = yStart, i = 0; c <= worldYMax + yStep / 2; c += yStep, i++) {
    hors.push({ pos: t.ty + map.sy(c) * t.scale, major: i % majorEvery === 0, label: fmtTick(c) })
  }

  // 坐标轴：世界 0 的屏幕位置，在画布内则贯穿
  const axisXScreen = t.tx + map.sx(0) * t.scale
  const axisYScreen = t.ty + map.sy(0) * t.scale
  const axisX = axisXScreen >= 0 && axisXScreen <= W ? axisXScreen : null
  const axisY = axisYScreen >= 0 && axisYScreen <= H ? axisYScreen : null

  return { verts, hors, axisX, axisY }
}


// ============ 曲率自适应采样 ============

export interface CurvePt {
  x: number
  y: number
}

/**
 * 曲率自适应细分（Desmos 式）：对相邻两点中点相对线性插值的偏差超过 tol 的区间插入中点。
 * passes 轮后曲线在弯曲剧烈处自动加密、平缓处保持稀疏。
 * @param pts 有效采样点（无 NaN）
 * @param fn 原函数（用于取中点值）
 * @param tol 偏差容差（世界单位；建议 (yMax-yMin)/300）
 * @param passes 细分轮数
 */
export function refineCurve(pts: CurvePt[], fn: (x: number) => number, tol: number, passes = 2): CurvePt[] {
  let out = pts
  for (let pass = 0; pass < passes; pass++) {
    const next: CurvePt[] = []
    for (let i = 0; i < out.length; i++) {
      next.push(out[i])
      if (i + 1 < out.length) {
        const a = out[i]
        const b = out[i + 1]
        const xm = (a.x + b.x) / 2
        const ym = fn(xm)
        if (Number.isFinite(ym) && Math.abs(ym - (a.y + b.y) / 2) > tol) {
          next.push({ x: xm, y: ym })
        }
      }
    }
    out = next
  }
  return out
}
