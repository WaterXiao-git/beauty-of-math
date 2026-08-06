// viewBox <-> client 坐标换算：SVG 用 preserveAspectRatio="xMidYMid meet" 渲染时，
// 实际内容按等比缩放并居中，四周可能有留白（letterbox）。直接把 clientX-rect.left 当 viewBox 坐标会偏移，
// 导致拖拽点/缩放中心跳变。本工具按 viewBox 与实际渲染尺寸正确换算。
export function clientToViewBox(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const vb = svg.viewBox?.baseVal
  const rect = svg.getBoundingClientRect()
  if (!vb || vb.width <= 0 || vb.height <= 0 || rect.width <= 0 || rect.height <= 0) return null
  const scale = Math.min(rect.width / vb.width, rect.height / vb.height)
  const offX = rect.left + (rect.width - vb.width * scale) / 2 - vb.x * scale
  const offY = rect.top + (rect.height - vb.height * scale) / 2 - vb.y * scale
  return { x: (clientX - offX) / scale, y: (clientY - offY) / scale }
}
