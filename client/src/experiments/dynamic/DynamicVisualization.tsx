import {
  useEffect,
  useMemo,
  useRef,
} from 'react'

import {
  compile,
} from 'mathjs'

import type {
  ArithmeticBlocksRendererSpec,
  CartesianRendererSpec,
  DynamicRendererSpec,
  PolarRendererSpec,
} from '../../types/dynamicExperiment'

interface VisualizationProps {
  renderer: DynamicRendererSpec
  parameters: Record<string, number>
}

function drawGrid(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  context.clearRect(0, 0, width, height)
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.strokeStyle = '#e2e8f0'
  context.lineWidth = 1

  for (let index = 0; index <= 10; index += 1) {
    const x = (index / 10) * width
    const y = (index / 10) * height

    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, height)
    context.stroke()

    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(width, y)
    context.stroke()
  }
}

function CartesianVisualization({
  renderer,
  parameters,
}: {
  renderer: CartesianRendererSpec
  parameters: Record<string, number>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const compiled = useMemo(() => {
    try {
      return compile(renderer.expression)
    } catch {
      return null
    }
  }, [renderer.expression])

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')

    if (!context) {
      return
    }

    const width = canvas.width
    const height = canvas.height
    drawGrid(context, width, height)

    const toCanvasX = (x: number) =>
      (
        (x - renderer.xMin) /
        (renderer.xMax - renderer.xMin)
      ) * width
    const toCanvasY = (y: number) =>
      height -
      (
        (y - renderer.yMin) /
        (renderer.yMax - renderer.yMin)
      ) * height

    context.strokeStyle = '#334155'
    context.lineWidth = 2

    if (renderer.xMin <= 0 && renderer.xMax >= 0) {
      const axisX = toCanvasX(0)
      context.beginPath()
      context.moveTo(axisX, 0)
      context.lineTo(axisX, height)
      context.stroke()
    }

    if (renderer.yMin <= 0 && renderer.yMax >= 0) {
      const axisY = toCanvasY(0)
      context.beginPath()
      context.moveTo(0, axisY)
      context.lineTo(width, axisY)
      context.stroke()
    }

    if (!compiled) {
      return
    }

    context.strokeStyle = '#4f46e5'
    context.lineWidth = 3
    context.beginPath()
    let drawing = false

    for (
      let index = 0;
      index <= renderer.samples;
      index += 1
    ) {
      const x = renderer.xMin +
        (
          (renderer.xMax - renderer.xMin) *
          index
        ) /
          renderer.samples

      let y = Number.NaN

      try {
        y = Number(
          compiled.evaluate({
            ...parameters,
            x,
          }),
        )
      } catch {
        y = Number.NaN
      }

      const visible =
        Number.isFinite(y) &&
        y >= renderer.yMin &&
        y <= renderer.yMax

      if (!visible) {
        drawing = false
        continue
      }

      const canvasX = toCanvasX(x)
      const canvasY = toCanvasY(y)

      if (!drawing) {
        context.moveTo(canvasX, canvasY)
        drawing = true
      } else {
        context.lineTo(canvasX, canvasY)
      }
    }

    context.stroke()
  }, [compiled, parameters, renderer])

  return (
    <canvas
      ref={canvasRef}
      width={960}
      height={520}
      className="h-auto w-full rounded-xl border border-slate-200 bg-white"
      aria-label={`函数图像：${renderer.expression}`}
    />
  )
}

function PolarVisualization({
  renderer,
  parameters,
}: {
  renderer: PolarRendererSpec
  parameters: Record<string, number>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const compiled = useMemo(() => {
    try {
      return compile(renderer.expression)
    } catch {
      return null
    }
  }, [renderer.expression])

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')

    if (!context) {
      return
    }

    const width = canvas.width
    const height = canvas.height
    drawGrid(context, width, height)

    const centerX = width / 2
    const centerY = height / 2
    const scale =
      Math.min(width, height) /
      (2.2 * renderer.radiusMax)

    context.strokeStyle = '#334155'
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(0, centerY)
    context.lineTo(width, centerY)
    context.moveTo(centerX, 0)
    context.lineTo(centerX, height)
    context.stroke()

    if (!compiled) {
      return
    }

    context.strokeStyle = '#7c3aed'
    context.lineWidth = 3
    context.beginPath()
    let drawing = false

    for (
      let index = 0;
      index <= renderer.samples;
      index += 1
    ) {
      const theta = renderer.thetaMin +
        (
          (renderer.thetaMax - renderer.thetaMin) *
          index
        ) /
          renderer.samples

      let radius = Number.NaN

      try {
        radius = Number(
          compiled.evaluate({
            ...parameters,
            theta,
          }),
        )
      } catch {
        radius = Number.NaN
      }

      if (
        !Number.isFinite(radius) ||
        Math.abs(radius) > renderer.radiusMax * 2
      ) {
        drawing = false
        continue
      }

      const x = centerX +
        radius * Math.cos(theta) * scale
      const y = centerY -
        radius * Math.sin(theta) * scale

      if (!drawing) {
        context.moveTo(x, y)
        drawing = true
      } else {
        context.lineTo(x, y)
      }
    }

    context.stroke()
  }, [compiled, parameters, renderer])

  return (
    <canvas
      ref={canvasRef}
      width={960}
      height={520}
      className="h-auto w-full rounded-xl border border-slate-200 bg-white"
      aria-label={`极坐标图像：${renderer.expression}`}
    />
  )
}

const OPERATION_SYMBOL = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
} as const

function arithmeticResult(
  renderer: ArithmeticBlocksRendererSpec,
): number {
  switch (renderer.operation) {
    case 'addition':
      return renderer.left + renderer.right
    case 'subtraction':
      return renderer.left - renderer.right
    case 'multiplication':
      return renderer.left * renderer.right
    case 'division':
      return renderer.left / renderer.right
  }
}

function BlockGroup({
  count,
  colorClassName,
}: {
  count: number
  colorClassName: string
}) {
  return (
    <div className="flex max-w-md flex-wrap justify-center gap-1.5">
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className={`h-8 w-8 rounded-md shadow-sm ${colorClassName}`}
        />
      ))}
    </div>
  )
}

function ArithmeticVisualization({
  renderer,
}: {
  renderer: ArithmeticBlocksRendererSpec
}) {
  const result = arithmeticResult(renderer)
  const axisMinimum = Math.min(0, renderer.left, result)
  const axisMaximum = Math.max(
    1,
    renderer.left,
    result,
  )
  const range = axisMaximum - axisMinimum || 1
  const startPercent =
    ((renderer.left - axisMinimum) / range) * 100
  const resultPercent =
    ((result - axisMinimum) / range) * 100

  return (
    <div className="space-y-8 rounded-xl border border-slate-200 bg-white p-6 md:p-10">
      <div className="text-center text-4xl font-semibold text-slate-800">
        {renderer.left}{' '}
        {OPERATION_SYMBOL[renderer.operation]}{' '}
        {renderer.right} ={' '}
        {Number.isInteger(result)
          ? result
          : result.toFixed(2)}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <BlockGroup
          count={renderer.left}
          colorClassName="bg-blue-500"
        />
        <span className="text-3xl font-bold text-slate-400">
          {OPERATION_SYMBOL[renderer.operation]}
        </span>
        <BlockGroup
          count={renderer.right}
          colorClassName="bg-emerald-500"
        />
      </div>

      <div className="px-4 pb-8 pt-5">
        <div className="relative h-1 rounded-full bg-slate-400">
          <span
            className="absolute -top-2 h-5 w-5 -translate-x-1/2 rounded-full bg-blue-500 ring-4 ring-blue-100"
            style={{ left: `${startPercent}%` }}
          />
          <span
            className="absolute -top-2 h-5 w-5 -translate-x-1/2 rounded-full bg-rose-500 ring-4 ring-rose-100"
            style={{ left: `${resultPercent}%` }}
          />
          <span className="absolute left-0 top-4 text-xs text-slate-500">
            {axisMinimum}
          </span>
          <span className="absolute right-0 top-4 text-xs text-slate-500">
            {axisMaximum}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function DynamicVisualization({
  renderer,
  parameters,
}: VisualizationProps) {
  if (renderer.type === 'cartesian-2d') {
    return (
      <CartesianVisualization
        renderer={renderer}
        parameters={parameters}
      />
    )
  }

  if (renderer.type === 'polar-2d') {
    return (
      <PolarVisualization
        renderer={renderer}
        parameters={parameters}
      />
    )
  }

  return (
    <ArithmeticVisualization renderer={renderer} />
  )
}
