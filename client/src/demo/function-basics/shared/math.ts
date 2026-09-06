export const VIEW_W = 900
export const VIEW_H = 500
export const PAD = 54

export function sx(x: number, min = -5, max = 5) {
  return PAD + ((x - min) / (max - min)) * (VIEW_W - PAD * 2)
}

export function sy(y: number, min = -4, max = 4) {
  return VIEW_H - PAD - ((y - min) / (max - min)) * (VIEW_H - PAD * 2)
}

export function curvePath(
  fn: (x: number) => number,
  from = -5,
  to = 5,
  count = 220,
  yMin = -4,
  yMax = 4,
) {
  let path = ''
  let drawing = false
  for (let index = 0; index <= count; index += 1) {
    const x = from + ((to - from) * index) / count
    const y = fn(x)
    if (!Number.isFinite(y) || y < yMin - 1 || y > yMax + 1) {
      drawing = false
      continue
    }
    path += `${drawing ? 'L' : 'M'} ${sx(x, from, to).toFixed(2)} ${sy(y, yMin, yMax).toFixed(2)} `
    drawing = true
  }
  return path
}
