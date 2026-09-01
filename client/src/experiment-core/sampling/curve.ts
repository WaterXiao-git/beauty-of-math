export interface Point2D {
  x: number
  y: number
}

export interface CurveSamplingOptions {
  fn: (x: number) => number
  from: number
  to: number
  count?: number
  yMin?: number
  yMax?: number
  jumpThreshold?: number
  excluded?: (x: number) => boolean
}

export function sampleCurve({
  fn,
  from,
  to,
  count = 240,
  yMin = Number.NEGATIVE_INFINITY,
  yMax = Number.POSITIVE_INFINITY,
  jumpThreshold = Number.POSITIVE_INFINITY,
  excluded,
}: CurveSamplingOptions): readonly Point2D[][] {
  const segments: Point2D[][] = []
  let segment: Point2D[] = []

  const closeSegment = () => {
    if (segment.length > 0) segments.push(segment)
    segment = []
  }

  for (let index = 0; index <= count; index += 1) {
    const x = from + ((to - from) * index) / count
    const y = fn(x)
    const previous = segment.at(-1)
    const invalid = excluded?.(x)
      || !Number.isFinite(y)
      || y < yMin
      || y > yMax
      || (previous !== undefined && Math.abs(y - previous.y) > jumpThreshold)

    if (invalid) {
      closeSegment()
      continue
    }
    segment.push({ x, y })
  }

  closeSegment()
  return segments
}
