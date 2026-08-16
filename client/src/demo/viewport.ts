// 视口计算工具：让网格/坐标轴"无限延伸"（Desmos 风格）
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

export interface GridLine {
  /** 屏幕坐标位置（垂直线的 x / 水平线的 y） */
  pos: number
  /** 是否主刻度（世界整数轴，加粗） */
  major: boolean
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

interface MapFns {
  sx: (x: number) => number
  sy: (y: number) => number
}

/**
 * 根据当前 pan/zoom 变换与数据映射，计算铺满屏幕的网格线与贯穿坐标轴（屏幕坐标）
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
  const xSpan = domain[1] - domain[0]
  const ySpan = yRange[1] - yRange[0]
  const map: MapFns = {
    sx: (x) => padL + ((x - domain[0]) / xSpan) * (W - padL - padR),
    sy: (y) => H - padB - ((y - yRange[0]) / ySpan) * (H - padT - padB),
  }

  // 屏幕坐标 → 映射坐标：screen = t.tx + mapVal * t.scale
  // 屏幕 0..W 对应的映射坐标范围
  const xMapMin = -t.tx / t.scale
  const xMapMax = (W - t.tx) / t.scale
  const yMapMin = (H - t.ty) / t.scale // 屏幕 y=H
  const yMapMax = -t.ty / t.scale // 屏幕 y=0

  // 映射坐标 → 世界坐标
  const worldXMin = domain[0] + ((xMapMin - padL) / (W - padL - padR)) * xSpan
  const worldXMax = domain[0] + ((xMapMax - padL) / (W - padL - padR)) * xSpan
  const worldYMin = yRange[0] + ((H - padB - yMapMin) / (H - padT - padB)) * ySpan
  const worldYMax = yRange[0] + ((H - padB - yMapMax) / (H - padT - padB)) * ySpan

  const xStep = niceStep((worldXMax - worldXMin) / 14)
  const yStep = niceStep((worldYMax - worldYMin) / 14)

  const verts: GridLine[] = []
  const xStart = Math.ceil(worldXMin / xStep) * xStep
  for (let c = xStart, i = 0; c <= worldXMax + xStep / 2; c += xStep, i++) {
    verts.push({ pos: t.tx + map.sx(c) * t.scale, major: i % majorEvery === 0 })
  }
  const hors: GridLine[] = []
  const yStart = Math.ceil(worldYMin / yStep) * yStep
  for (let c = yStart, i = 0; c <= worldYMax + yStep / 2; c += yStep, i++) {
    hors.push({ pos: t.ty + map.sy(c) * t.scale, major: i % majorEvery === 0 })
  }

  // 坐标轴：世界 0 的屏幕位置，在画布内则贯穿
  const axisXScreen = t.tx + map.sx(0) * t.scale
  const axisYScreen = t.ty + map.sy(0) * t.scale
  const axisX = axisXScreen >= 0 && axisXScreen <= W ? axisXScreen : null
  const axisY = axisYScreen >= 0 && axisYScreen <= H ? axisYScreen : null

  return { verts, hors, axisX, axisY }
}