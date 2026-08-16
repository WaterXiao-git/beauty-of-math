import {
  useMemo,
  useState,
} from 'react'

import type {
  ReactNode,
} from 'react'

import ExperimentCard from '../../experiment-v2/ExperimentCard'

import ExperimentShell from '../../experiment-v2/ExperimentShell'

// ============================================================================
// Core Calculus Supplement Demos
//
// 当前文件补齐课程中 5 个真正缺失的数学 Renderer：
//
// 1. limit-laws
//    极限的运算法则
//
// 2. two-important-limits
//    两个重要极限
//
// 3. infinitesimal
//    无穷小与无穷大
//
// 4. differential
//    微分
//
// 5. graphing
//    函数图形描绘
//
// 页面结构全部复用 ExperimentShell。
// 本文件只负责数学交互和 SVG Renderer。
// ============================================================================

// ============================================================================
// Shared types
// ============================================================================

interface MathPoint {
  x: number
  y: number
}

interface PlotSeries {
  id: string

  label: string

  points: MathPoint[]

  stroke: string

  width?: number

  dash?: string

  opacity?: number
}

interface PlotMarker {
  id: string

  x: number

  y: number

  label?: string

  color?: string
}

interface FunctionPlotProps {
  series: PlotSeries[]

  xMin: number
  xMax: number

  yMin?: number
  yMax?: number

  markers?: PlotMarker[]

  height?: number

  children?: ReactNode
}

// ============================================================================
// Shared constants
// ============================================================================

const SVG_WIDTH = 760

const DEFAULT_HEIGHT = 430

const PLOT_PADDING = {
  left: 58,
  right: 28,
  top: 28,
  bottom: 48,
}

// ============================================================================
// Shared helpers
// ============================================================================

function clamp(
  value: number,
  min: number,
  max: number,
): number {
  return Math.min(
    max,
    Math.max(
      min,
      value,
    ),
  )
}

function formatNumber(
  value: number,
  digits = 4,
): string {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return '—'
  }

  if (
    Math.abs(
      value,
    ) < 1e-10
  ) {
    return '0'
  }

  if (
    Math.abs(
      value,
    ) >= 10000 ||
    Math.abs(
      value,
    ) < 0.001
  ) {
    return value.toExponential(
      3,
    )
  }

  return Number(
    value.toFixed(
      digits,
    ),
  ).toString()
}

function sampleFunction(
  fn: (
    x: number,
  ) => number,

  xMin: number,

  xMax: number,

  samples = 260,
): MathPoint[] {
  const points:
    MathPoint[] = []

  for (
    let index = 0;
    index <= samples;
    index += 1
  ) {
    const x =
      xMin +
      (
        (
          xMax -
          xMin
        ) *
        index
      ) /
        samples

    const y =
      fn(
        x,
      )

    if (
      Number.isFinite(
        y,
      )
    ) {
      points.push({
        x,
        y,
      })
    }
  }

  return points
}

function calculateYBounds(
  series:
    PlotSeries[],
): {
  min: number
  max: number
} {
  const values =
    series.flatMap(
      (
        item,
      ) =>
        item.points
          .map(
            (
              point,
            ) =>
              point.y,
          )
          .filter(
            Number.isFinite,
          ),
    )

  if (
    values.length ===
    0
  ) {
    return {
      min:
        -1,

      max:
        1,
    }
  }

  let min =
    Math.min(
      ...values,
    )

  let max =
    Math.max(
      ...values,
    )

  if (
    Math.abs(
      max -
      min,
    ) <
    1e-8
  ) {
    min -=
      1

    max +=
      1
  }

  const padding =
    (
      max -
      min
    ) *
    0.12

  return {
    min:
      min -
      padding,

    max:
      max +
      padding,
  }
}

// ============================================================================
// Shared SVG plot
// ============================================================================

function FunctionPlot({
  series,
  xMin,
  xMax,
  yMin,
  yMax,
  markers = [],
  height = DEFAULT_HEIGHT,
  children,
}: FunctionPlotProps) {
  const automaticBounds =
    useMemo(
      () =>
        calculateYBounds(
          series,
        ),
      [
        series,
      ],
    )

  const finalYMin =
    yMin ??
    automaticBounds.min

  const finalYMax =
    yMax ??
    automaticBounds.max

  const innerWidth =
    SVG_WIDTH -
    PLOT_PADDING.left -
    PLOT_PADDING.right

  const innerHeight =
    height -
    PLOT_PADDING.top -
    PLOT_PADDING.bottom

  const mapX = (
    x: number,
  ) =>
    PLOT_PADDING.left +
    (
      (
        x -
        xMin
      ) /
      (
        xMax -
        xMin
      )
    ) *
      innerWidth

  const mapY = (
    y: number,
  ) =>
    PLOT_PADDING.top +
    (
      1 -
      (
        y -
        finalYMin
      ) /
        (
          finalYMax -
          finalYMin
        )
    ) *
      innerHeight

  const xAxisY =
    finalYMin <=
      0 &&
    finalYMax >=
      0
      ? mapY(
          0,
        )
      : mapY(
          finalYMin,
        )

  const yAxisX =
    xMin <=
      0 &&
    xMax >=
      0
      ? mapX(
          0,
        )
      : mapX(
          xMin,
        )

  const gridLines =
    Array.from(
      {
        length:
          9,
      },
      (
        _,
        index,
      ) => index,
    )

  const makePath = (
    points:
      MathPoint[],
  ) => {
    let path =
      ''

    let drawing =
      false

    for (
      const point
      of points
    ) {
      if (
        point.x <
          xMin ||
        point.x >
          xMax ||
        point.y <
          finalYMin *
            4 -
            10 ||
        point.y >
          finalYMax *
            4 +
            10
      ) {
        drawing =
          false

        continue
      }

      const px =
        mapX(
          point.x,
        )

      const py =
        mapY(
          point.y,
        )

      if (
        !Number.isFinite(
          px,
        ) ||
        !Number.isFinite(
          py,
        )
      ) {
        drawing =
          false

        continue
      }

      if (
        !drawing
      ) {
        path +=
          `M ${px.toFixed(
            2,
          )} ${py.toFixed(
            2,
          )}`

        drawing =
          true
      } else {
        path +=
          ` L ${px.toFixed(
            2,
          )} ${py.toFixed(
            2,
          )}`
      }
    }

    return path
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${height}`}
        className="block h-auto w-full select-none"
        role="img"
      >
        {/* ================================================================
            Background
        ================================================================= */}

        <rect
          x="0"
          y="0"
          width={SVG_WIDTH}
          height={height}
          fill="#ffffff"
        />

        {/* ================================================================
            Grid
        ================================================================= */}

        {gridLines.map(
          (
            index,
          ) => {
            const ratio =
              index /
              8

            const x =
              PLOT_PADDING.left +
              ratio *
                innerWidth

            const y =
              PLOT_PADDING.top +
              ratio *
                innerHeight

            return (
              <g
                key={
                  `grid-${index}`
                }
              >
                <line
                  x1={x}
                  x2={x}
                  y1={PLOT_PADDING.top}
                  y2={
                    height -
                    PLOT_PADDING.bottom
                  }
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />

                <line
                  x1={PLOT_PADDING.left}
                  x2={
                    SVG_WIDTH -
                    PLOT_PADDING.right
                  }
                  y1={y}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              </g>
            )
          },
        )}

        {/* ================================================================
            Axes
        ================================================================= */}

        <line
          x1={PLOT_PADDING.left}
          x2={
            SVG_WIDTH -
            PLOT_PADDING.right
          }
          y1={xAxisY}
          y2={xAxisY}
          stroke="#94a3b8"
          strokeWidth="1.5"
        />

        <line
          x1={yAxisX}
          x2={yAxisX}
          y1={PLOT_PADDING.top}
          y2={
            height -
            PLOT_PADDING.bottom
          }
          stroke="#94a3b8"
          strokeWidth="1.5"
        />

        {/* ================================================================
            Axis labels
        ================================================================= */}

        <text
          x={
            SVG_WIDTH -
            PLOT_PADDING.right
          }
          y={
            xAxisY -
            8
          }
          fill="#94a3b8"
          fontSize="13"
          textAnchor="end"
        >
          x
        </text>

        <text
          x={
            yAxisX +
            9
          }
          y={
            PLOT_PADDING.top +
            14
          }
          fill="#94a3b8"
          fontSize="13"
        >
          y
        </text>

        <text
          x={PLOT_PADDING.left}
          y={
            height -
            14
          }
          fill="#64748b"
          fontSize="11"
        >
          {formatNumber(
            xMin,
            2,
          )}
        </text>

        <text
          x={
            SVG_WIDTH -
            PLOT_PADDING.right
          }
          y={
            height -
            14
          }
          fill="#64748b"
          fontSize="11"
          textAnchor="end"
        >
          {formatNumber(
            xMax,
            2,
          )}
        </text>

        <text
          x="8"
          y={
            PLOT_PADDING.top +
            5
          }
          fill="#64748b"
          fontSize="11"
        >
          {formatNumber(
            finalYMax,
            2,
          )}
        </text>

        <text
          x="8"
          y={
            height -
            PLOT_PADDING.bottom
          }
          fill="#64748b"
          fontSize="11"
        >
          {formatNumber(
            finalYMin,
            2,
          )}
        </text>

        {/* ================================================================
            Curves
        ================================================================= */}

        {series.map(
          (
            item,
          ) => (
            <path
              key={
                item.id
              }
              d={
                makePath(
                  item.points,
                )
              }
              fill="none"
              stroke={
                item.stroke
              }
              strokeWidth={
                item.width ??
                2.5
              }
              strokeDasharray={
                item.dash
              }
              opacity={
                item.opacity ??
                1
              }
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ),
        )}

        {/* ================================================================
            Markers
        ================================================================= */}

        {markers.map(
          (
            marker,
          ) => {
            const px =
              mapX(
                marker.x,
              )

            const py =
              mapY(
                marker.y,
              )

            if (
              !Number.isFinite(
                px,
              ) ||
              !Number.isFinite(
                py,
              )
            ) {
              return null
            }

            return (
              <g
                key={
                  marker.id
                }
              >
                <circle
                  cx={px}
                  cy={py}
                  r="6"
                  fill={
                    marker.color ??
                    '#f8fafc'
                  }
                  stroke="#020617"
                  strokeWidth="2"
                />

                {marker.label && (
                  <text
                    x={
                      px +
                      10
                    }
                    y={
                      py -
                      10
                    }
                    fill="#334155"
                    fontSize="12"
                    fontWeight="600"
                  >
                    {
                      marker.label
                    }
                  </text>
                )}
              </g>
            )
          },
        )}

        {children}
      </svg>

      {/* ================================================================
          Legend
      ================================================================= */}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 px-4 py-3">
        {series.map(
          (
            item,
          ) => (
            <div
              key={
                `legend-${item.id}`
              }
              className="flex items-center gap-2 text-xs text-slate-600"
            >
              <span
                className="inline-block h-0.5 w-6 rounded-full"
                style={{
                  backgroundColor:
                    item.stroke,
                }}
              />

              <span>
                {
                  item.label
                }
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Shared UI
// ============================================================================

function NumberReadout({
  label,
  value,
  emphasis = false,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div
      className={[
        'rounded-xl border px-3 py-3',
        emphasis
          ? 'border-indigo-200 bg-indigo-50'
          : 'border-slate-200 bg-slate-50',
      ].join(
        ' ',
      )}
    >
      <div className="text-xs font-medium text-slate-500">
        {label}
      </div>

      <div
        className={[
          'mt-1 font-mono text-sm font-semibold',
          emphasis
            ? 'text-indigo-700'
            : 'text-slate-700',
        ].join(
          ' ',
        )}
      >
        {value}
      </div>
    </div>
  )
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (
    value: number,
  ) => void
  display?: string
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>

        <span className="font-mono text-xs font-semibold text-indigo-600">
          {
            display ??
            formatNumber(
              value,
            )
          }
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={
          (
            event,
          ) =>
            onChange(
              Number(
                event.target.value,
              ),
            )
        }
        className="w-full accent-indigo-600"
      />
    </label>
  )
}

function ChoiceButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={[
        'rounded-xl border px-3 py-2 text-sm font-medium transition',
        active
          ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
          : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50',
      ].join(
        ' ',
      )}
    >
      {children}
    </button>
  )
}

// ============================================================================
// 1. Limit Laws
// ============================================================================

type LimitOperation =
  | 'sum'
  | 'difference'
  | 'product'
  | 'quotient'

const LIMIT_OPERATION_META:
  Record<
    LimitOperation,
    {
      title: string
      symbol: string
      description: string
    }
  > = {
  sum: {
    title:
      '和的极限',

    symbol:
      'f + g',

    description:
      '两个极限存在时，和的极限等于极限的和。',
  },

  difference: {
    title:
      '差的极限',

    symbol:
      'f − g',

    description:
      '两个极限存在时，差的极限等于极限的差。',
  },

  product: {
    title:
      '积的极限',

    symbol:
      'f · g',

    description:
      '两个极限存在时，积的极限等于极限的积。',
  },

  quotient: {
    title:
      '商的极限',

    symbol:
      'f / g',

    description:
      '分母极限不为 0 时，商的极限等于极限的商。',
  },
}

function limitF(
  x: number,
): number {
  return (
    x *
      x +
    1
  )
}

function limitG(
  x: number,
): number {
  return (
    2 *
      x -
    1
  )
}

function applyLimitOperation(
  operation:
    LimitOperation,

  left: number,

  right: number,
): number {
  switch (
    operation
  ) {
    case 'sum':
      return (
        left +
        right
      )

    case 'difference':
      return (
        left -
        right
      )

    case 'product':
      return (
        left *
        right
      )

    case 'quotient':
      return (
        left /
        right
      )
  }
}

export function LimitLawsDemo() {
  const [
    operation,
    setOperation,
  ] =
    useState<LimitOperation>(
      'sum',
    )

  const [
    x,
    setX,
  ] =
    useState(
      1.7,
    )

  const fValue =
    limitF(
      x,
    )

  const gValue =
    limitG(
      x,
    )

  const resultValue =
    applyLimitOperation(
      operation,
      fValue,
      gValue,
    )

  const fLimit =
    limitF(
      1,
    )

  const gLimit =
    limitG(
      1,
    )

  const resultLimit =
    applyLimitOperation(
      operation,
      fLimit,
      gLimit,
    )

  const meta =
    LIMIT_OPERATION_META[
      operation
    ]

  const series =
    useMemo<
      PlotSeries[]
    >(
      () => [
        {
          id:
            'f',

          label:
            'f(x) = x² + 1',

          points:
            sampleFunction(
              limitF,
              0.15,
              1.85,
            ),

          stroke:
            '#60a5fa',
        },

        {
          id:
            'g',

          label:
            'g(x) = 2x − 1',

          points:
            sampleFunction(
              limitG,
              0.15,
              1.85,
            ),

          stroke:
            '#34d399',
        },

        {
          id:
            'result',

          label:
            `h(x) = ${meta.symbol}`,

          points:
            sampleFunction(
              (
                value,
              ) =>
                applyLimitOperation(
                  operation,
                  limitF(
                    value,
                  ),
                  limitG(
                    value,
                  ),
                ),
              0.15,
              1.85,
            ),

          stroke:
            '#f472b6',

          width:
            3.2,
        },
      ],
      [
        operation,
        meta.symbol,
      ],
    )

  return (
    <ExperimentShell
      breadcrumb={[
        '高等数学（上册）',
        '函数、极限与连续',
        '极限的运算法则',
      ]}
      title="极限的运算法则"
      subtitle="观察 x → 1 时，函数的和、差、积、商如何继承各自的极限。"
      canvas={
        <div className="space-y-4 p-3 md:p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
              f(x) = x² + 1
              <div className="mt-1 font-mono text-lg font-bold">
                f(1) = 2
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              g(x) = 2x − 1
              <div className="mt-1 font-mono text-lg font-bold">
                g(1) = 1
              </div>
            </div>

            <div className="rounded-xl border border-pink-200 bg-pink-50 p-3 text-sm text-pink-700">
              {meta.title}
              <div className="mt-1 font-mono text-lg font-bold">
                极限 = {
                  formatNumber(
                    resultLimit,
                  )
                }
              </div>
            </div>
          </div>

          <FunctionPlot
            series={
              series
            }
            xMin={
              0.15
            }
            xMax={
              1.85
            }
            markers={[
              {
                id:
                  'current',

                x,

                y:
                  resultValue,

                label:
                  `x=${formatNumber(
                    x,
                    2,
                  )}`,

                color:
                  '#f9a8d4',
              },

              {
                id:
                  'limit',

                x:
                  1,

                y:
                  resultLimit,

                label:
                  '极限点',

                color:
                  '#facc15',
              },
            ]}
          />
        </div>
      }
      sidebar={
        <>
          <ExperimentCard
            title="运算法则"
          >
            <div className="grid grid-cols-2 gap-2">
              {(
                Object.keys(
                  LIMIT_OPERATION_META,
                ) as
                  LimitOperation[]
              ).map(
                (
                  key,
                ) => (
                  <ChoiceButton
                    key={
                      key
                    }
                    active={
                      operation ===
                      key
                    }
                    onClick={
                      () =>
                        setOperation(
                          key,
                        )
                    }
                  >
                    {
                      LIMIT_OPERATION_META[
                        key
                      ]
                        .title
                    }
                  </ChoiceButton>
                ),
              )}
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              {
                meta.description
              }
            </p>
          </ExperimentCard>

          <ExperimentCard
            title="让 x 趋近于 1"
          >
            <RangeControl
              label="x"
              value={x}
              min={
                0.2
              }
              max={
                1.8
              }
              step={
                0.01
              }
              onChange={
                setX
              }
            />

            <button
              type="button"
              onClick={
                () =>
                  setX(
                    1.01,
                  )
              }
              className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              快速趋近 x = 1
            </button>
          </ExperimentCard>

          <ExperimentCard
            title="实时数值"
          >
            <div className="grid grid-cols-2 gap-3">
              <NumberReadout
                label="f(x)"
                value={
                  formatNumber(
                    fValue,
                  )
                }
              />

              <NumberReadout
                label="g(x)"
                value={
                  formatNumber(
                    gValue,
                  )
                }
              />

              <NumberReadout
                label="h(x)"
                value={
                  formatNumber(
                    resultValue,
                  )
                }
              />

              <NumberReadout
                label="理论极限"
                value={
                  formatNumber(
                    resultLimit,
                  )
                }
                emphasis
              />
            </div>
          </ExperimentCard>

          <ExperimentCard
            title="教学判断"
          >
            <p className="text-sm leading-7 text-slate-600">
              当 x 越靠近 1，
              h(x) 越靠近
              {' '}
              <strong className="text-indigo-700">
                {
                  formatNumber(
                    resultLimit,
                  )
                }
              </strong>
              。这说明极限运算法则允许我们先分别求极限，再进行代数运算。
            </p>
          </ExperimentCard>
        </>
      }
    />
  )
}

// ============================================================================
// 2. Two Important Limits
// ============================================================================

type ImportantLimitMode =
  | 'sinc'
  | 'e'

function sinc(
  x: number,
): number {
  if (
    Math.abs(
      x,
    ) <
    1e-8
  ) {
    return 1
  }

  return (
    Math.sin(
      x,
    ) /
    x
  )
}

function eSequence(
  n: number,
): number {
  return Math.pow(
    1 +
      1 /
        n,
    n,
  )
}

export function TwoImportantLimitsDemo() {
  const [
    mode,
    setMode,
  ] =
    useState<ImportantLimitMode>(
      'sinc',
    )

  const [
    x,
    setX,
  ] =
    useState(
      1.2,
    )

  const [
    n,
    setN,
  ] =
    useState(
      8,
    )

  const sincSeries =
    useMemo<
      PlotSeries[]
    >(
      () => [
        {
          id:
            'sinc',

          label:
            'sin(x) / x',

          points:
            sampleFunction(
              sinc,
              -5,
              5,
              340,
            ),

          stroke:
            '#60a5fa',

          width:
            3,
        },

        {
          id:
            'one',

          label:
            'y = 1',

          points: [
            {
              x:
                -5,

              y:
                1,
            },

            {
              x:
                5,

              y:
                1,
            },
          ],

          stroke:
            '#facc15',

          dash:
            '8 6',
        },
      ],
      [],
    )

  const eSeries =
    useMemo<
      PlotSeries[]
    >(
      () => [
        {
          id:
            'e-sequence',

          label:
            '(1 + 1/n)ⁿ',

          points:
            Array.from(
              {
                length:
                  100,
              },
              (
                _,
                index,
              ) => {
                const currentN =
                  index +
                  1

                return {
                  x:
                    currentN,

                  y:
                    eSequence(
                      currentN,
                    ),
                }
              },
            ),

          stroke:
            '#34d399',

          width:
            3,
        },

        {
          id:
            'e',

          label:
            'y = e',

          points: [
            {
              x:
                1,

              y:
                Math.E,
            },

            {
              x:
                100,

              y:
                Math.E,
            },
          ],

          stroke:
            '#facc15',

          dash:
            '8 6',
        },
      ],
      [],
    )

  const firstValue =
    sinc(
      x,
    )

  const secondValue =
    eSequence(
      n,
    )

  const currentError =
    mode ===
    'sinc'
      ? Math.abs(
          firstValue -
          1,
        )
      : Math.abs(
          secondValue -
          Math.E,
        )

  return (
    <ExperimentShell
      breadcrumb={[
        '高等数学（上册）',
        '函数、极限与连续',
        '两个重要极限',
      ]}
      title="两个重要极限"
      subtitle="观察 sin(x)/x 在 x → 0 时趋近 1，以及 (1+1/n)ⁿ 在 n → ∞ 时趋近 e。"
      canvas={
        <div className="space-y-4 p-3 md:p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={
                () =>
                  setMode(
                    'sinc',
                  )
              }
              className={[
                'rounded-2xl border p-4 text-left transition',
                mode ===
                'sinc'
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-slate-50',
              ].join(
                ' ',
              )}
            >
              <div className="text-xs font-semibold uppercase tracking-wider">
                第一个重要极限
              </div>

              <div className="mt-2 text-lg font-bold">
                lim sin(x) / x = 1
              </div>

              <div className="mt-1 text-xs opacity-70">
                x → 0
              </div>
            </button>

            <button
              type="button"
              onClick={
                () =>
                  setMode(
                    'e',
                  )
              }
              className={[
                'rounded-2xl border p-4 text-left transition',
                mode ===
                'e'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-slate-50',
              ].join(
                ' ',
              )}
            >
              <div className="text-xs font-semibold uppercase tracking-wider">
                第二个重要极限
              </div>

              <div className="mt-2 text-lg font-bold">
                lim (1 + 1/n)ⁿ = e
              </div>

              <div className="mt-1 text-xs opacity-70">
                n → ∞
              </div>
            </button>
          </div>

          {mode ===
          'sinc' ? (
            <FunctionPlot
              series={
                sincSeries
              }
              xMin={
                -5
              }
              xMax={
                5
              }
              yMin={
                -0.4
              }
              yMax={
                1.25
              }
              markers={[
                {
                  id:
                    'current',

                  x,

                  y:
                    firstValue,

                  label:
                    `(${formatNumber(
                      x,
                      2,
                    )}, ${formatNumber(
                      firstValue,
                      3,
                    )})`,

                  color:
                    '#93c5fd',
                },

                {
                  id:
                    'target',

                  x:
                    0,

                  y:
                    1,

                  label:
                    '目标 1',

                  color:
                    '#fde047',
                },
              ]}
            />
          ) : (
            <FunctionPlot
              series={
                eSeries
              }
              xMin={
                1
              }
              xMax={
                100
              }
              yMin={
                1.9
              }
              yMax={
                2.8
              }
              markers={[
                {
                  id:
                    'current',

                  x:
                    n,

                  y:
                    secondValue,

                  label:
                    `n=${n}`,

                  color:
                    '#6ee7b7',
                },
              ]}
            />
          )}
        </div>
      }
      sidebar={
        <>
          <ExperimentCard
            title="选择重要极限"
          >
            <div className="grid gap-2">
              <ChoiceButton
                active={
                  mode ===
                  'sinc'
                }
                onClick={
                  () =>
                    setMode(
                      'sinc',
                    )
                }
              >
                sin(x) / x → 1
              </ChoiceButton>

              <ChoiceButton
                active={
                  mode ===
                  'e'
                }
                onClick={
                  () =>
                    setMode(
                      'e',
                    )
                }
              >
                (1 + 1/n)ⁿ → e
              </ChoiceButton>
            </div>
          </ExperimentCard>

          <ExperimentCard
            title="趋近控制"
          >
            {mode ===
            'sinc' ? (
              <>
                <RangeControl
                  label="x"
                  value={x}
                  min={
                    -2
                  }
                  max={
                    2
                  }
                  step={
                    0.01
                  }
                  onChange={
                    setX
                  }
                />

                <button
                  type="button"
                  onClick={
                    () =>
                      setX(
                        0.01,
                      )
                  }
                  className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  令 x 接近 0
                </button>
              </>
            ) : (
              <>
                <RangeControl
                  label="n"
                  value={n}
                  min={
                    1
                  }
                  max={
                    100
                  }
                  step={
                    1
                  }
                  onChange={
                    (
                      value,
                    ) =>
                      setN(
                        Math.round(
                          value,
                        ),
                      )
                  }
                  display={
                    String(
                      n,
                    )
                  }
                />

                <button
                  type="button"
                  onClick={
                    () =>
                      setN(
                        100,
                      )
                  }
                  className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  增大到 n = 100
                </button>
              </>
            )}
          </ExperimentCard>

          <ExperimentCard
            title="数值观察"
          >
            <div className="grid grid-cols-2 gap-3">
              <NumberReadout
                label="当前值"
                value={
                  formatNumber(
                    mode ===
                      'sinc'
                      ? firstValue
                      : secondValue,
                    6,
                  )
                }
              />

              <NumberReadout
                label="目标值"
                value={
                  mode ===
                  'sinc'
                    ? '1'
                    : formatNumber(
                        Math.E,
                        6,
                      )
                }
                emphasis
              />

              <div className="col-span-2">
                <NumberReadout
                  label="绝对误差"
                  value={
                    formatNumber(
                      currentError,
                      8,
                    )
                  }
                />
              </div>
            </div>
          </ExperimentCard>

          <ExperimentCard
            title="教学判断"
          >
            <p className="text-sm leading-7 text-slate-600">
              极限强调的是
              <strong className="text-indigo-700">
                “无限趋近”
              </strong>
              ，并不要求自变量真正到达极限位置。
              调整参数时，观察误差不断减小即可看到这一过程。
            </p>
          </ExperimentCard>
        </>
      }
    />
  )
}

// ============================================================================
// 3. Infinitesimal
// ============================================================================

export function InfinitesimalDemo() {
  const [
    x,
    setX,
  ] =
    useState(
      0.55,
    )

  const absX =
    Math.abs(
      x,
    )

  const x2 =
    absX *
    absX

  const x3 =
    x2 *
    absX

  const sinX =
    Math.abs(
      Math.sin(
        x,
      ),
    )

  const series =
    useMemo<
      PlotSeries[]
    >(
      () => [
        {
          id:
            'x',

          label:
            '|x|',

          points:
            sampleFunction(
              (
                value,
              ) =>
                Math.abs(
                  value,
                ),
              0,
              1,
            ),

          stroke:
            '#60a5fa',
        },

        {
          id:
            'x2',

          label:
            'x²',

          points:
            sampleFunction(
              (
                value,
              ) =>
                value *
                value,
              0,
              1,
            ),

          stroke:
            '#34d399',
        },

        {
          id:
            'x3',

          label:
            'x³',

          points:
            sampleFunction(
              (
                value,
              ) =>
                value *
                value *
                value,
              0,
              1,
            ),

          stroke:
            '#f472b6',
        },

        {
          id:
            'sin',

          label:
            '|sin x|',

          points:
            sampleFunction(
              (
                value,
              ) =>
                Math.abs(
                  Math.sin(
                    value,
                  ),
                ),
              0,
              1,
            ),

          stroke:
            '#facc15',
        },
      ],
      [],
    )

  const ratioX2ToX =
    absX >
    0
      ? x2 /
        absX
      : 0

  const ratioX3ToX2 =
    x2 >
    0
      ? x3 /
        x2
      : 0

  const ratioSinToX =
    absX >
    0
      ? sinX /
        absX
      : 1

  return (
    <ExperimentShell
      breadcrumb={[
        '高等数学（上册）',
        '函数、极限与连续',
        '无穷小与无穷大',
      ]}
      title="无穷小与无穷大"
      subtitle="比较 x、x²、x³ 与 sin x 在 x → 0 时趋近 0 的速度，理解高阶、同阶与等价无穷小。"
      canvas={
        <div className="space-y-4 p-3 md:p-5">
          <FunctionPlot
            series={
              series
            }
            xMin={
              0
            }
            xMax={
              1
            }
            yMin={
              0
            }
            yMax={
              1.05
            }
            markers={[
              {
                id:
                  'x',

                x,

                y:
                  absX,

                label:
                  '|x|',

                color:
                  '#93c5fd',
              },

              {
                id:
                  'x2',

                x,

                y:
                  x2,

                label:
                  'x²',

                color:
                  '#6ee7b7',
              },

              {
                id:
                  'x3',

                x,

                y:
                  x3,

                label:
                  'x³',

                color:
                  '#f9a8d4',
              },
            ]}
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
              <div className="text-xs text-slate-500">
                x² / |x|
              </div>

              <div className="mt-1 font-mono text-lg font-bold text-emerald-600">
                {
                  formatNumber(
                    ratioX2ToX,
                    6,
                  )
                }
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
              <div className="text-xs text-slate-500">
                x³ / x²
              </div>

              <div className="mt-1 font-mono text-lg font-bold text-pink-600">
                {
                  formatNumber(
                    ratioX3ToX2,
                    6,
                  )
                }
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
              <div className="text-xs text-slate-500">
                sin(x) / x
              </div>

              <div className="mt-1 font-mono text-lg font-bold text-amber-600">
                {
                  formatNumber(
                    ratioSinToX,
                    6,
                  )
                }
              </div>
            </div>
          </div>
        </div>
      }
      sidebar={
        <>
          <ExperimentCard
            title="让 x 趋近于 0"
          >
            <RangeControl
              label="x"
              value={x}
              min={
                0.01
              }
              max={
                1
              }
              step={
                0.01
              }
              onChange={
                setX
              }
            />

            <button
              type="button"
              onClick={
                () =>
                  setX(
                    0.01,
                  )
              }
              className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              x → 0.01
            </button>
          </ExperimentCard>

          <ExperimentCard
            title="无穷小量"
          >
            <div className="grid grid-cols-2 gap-3">
              <NumberReadout
                label="|x|"
                value={
                  formatNumber(
                    absX,
                    6,
                  )
                }
              />

              <NumberReadout
                label="x²"
                value={
                  formatNumber(
                    x2,
                    6,
                  )
                }
              />

              <NumberReadout
                label="x³"
                value={
                  formatNumber(
                    x3,
                    6,
                  )
                }
              />

              <NumberReadout
                label="|sin x|"
                value={
                  formatNumber(
                    sinX,
                    6,
                  )
                }
              />
            </div>
          </ExperimentCard>

          <ExperimentCard
            title="阶的比较"
          >
            <div className="space-y-3 text-sm leading-6 text-slate-600">
              <p>
                当 x → 0：
              </p>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                x² / x → 0
                <br />
                所以 x² 是 x 的高阶无穷小。
              </div>

              <div className="rounded-xl bg-pink-50 p-3 text-pink-700">
                x³ / x² → 0
                <br />
                所以 x³ 又比 x² 更高阶。
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                sin x / x → 1
                <br />
                所以 sin x 与 x 是等价无穷小。
              </div>
            </div>
          </ExperimentCard>

          <ExperimentCard
            title="教学判断"
          >
            <p className="text-sm leading-7 text-slate-600">
              “都是趋近 0”
              并不意味着趋近速度相同。
              比值极限可以精确比较不同无穷小量的阶。
            </p>
          </ExperimentCard>
        </>
      }
    />
  )
}

// ============================================================================
// 4. Differential
// ============================================================================

function differentialFunction(
  x: number,
): number {
  return (
    x *
    x
  )
}

export function DifferentialDemo() {
  const [
    x0,
    setX0,
  ] =
    useState(
      1,
    )

  const [
    dx,
    setDx,
  ] =
    useState(
      0.6,
    )

  const y0 =
    differentialFunction(
      x0,
    )

  const x1 =
    x0 +
    dx

  const y1 =
    differentialFunction(
      x1,
    )

  const derivative =
    2 *
    x0

  const dy =
    derivative *
    dx

  const deltaY =
    y1 -
    y0

  const tangentY1 =
    y0 +
    derivative *
      (
        x1 -
        x0
      )

  const linearError =
    deltaY -
    dy

  const series =
    useMemo<
      PlotSeries[]
    >(
      () => [
        {
          id:
            'curve',

          label:
            'f(x) = x²',

          points:
            sampleFunction(
              differentialFunction,
              -3,
              3,
            ),

          stroke:
            '#60a5fa',

          width:
            3,
        },

        {
          id:
            'tangent',

          label:
            '切线线性近似',

          points:
            sampleFunction(
              (
                x,
              ) =>
                y0 +
                derivative *
                  (
                    x -
                    x0
                  ),
              -3,
              3,
            ),

          stroke:
            '#facc15',

          width:
            2.5,

          dash:
            '8 6',
        },
      ],
      [
        x0,
        derivative,
        y0,
      ],
    )

  return (
    <ExperimentShell
      breadcrumb={[
        '高等数学（上册）',
        '导数与微分',
        '微分',
      ]}
      title="微分"
      subtitle="比较真实增量 Δy 与线性近似 dy = f′(x₀)Δx，理解微分的局部线性意义。"
      canvas={
        <div className="space-y-4 p-3 md:p-5">
          <FunctionPlot
            series={
              series
            }
            xMin={
              -3
            }
            xMax={
              3
            }
            yMin={
              -3
            }
            yMax={
              10
            }
            markers={[
              {
                id:
                  'p',

                x:
                  x0,

                y:
                  y0,

                label:
                  'P',

                color:
                  '#93c5fd',
              },

              {
                id:
                  'q',

                x:
                  x1,

                y:
                  y1,

                label:
                  'Q：真实函数值',

                color:
                  '#f9a8d4',
              },

              {
                id:
                  't',

                x:
                  x1,

                y:
                  tangentY1,

                label:
                  'T：线性近似',

                color:
                  '#fde047',
              },
            ]}
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-blue-700">
              <div className="text-xs text-blue-500">
                Δx
              </div>

              <div className="mt-1 font-mono text-xl font-bold">
                {
                  formatNumber(
                    dx,
                    4,
                  )
                }
              </div>
            </div>

            <div className="rounded-xl border border-pink-200 bg-pink-50 p-3 text-pink-700">
              <div className="text-xs text-pink-500">
                Δy
              </div>

              <div className="mt-1 font-mono text-xl font-bold">
                {
                  formatNumber(
                    deltaY,
                    4,
                  )
                }
              </div>
            </div>

            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-yellow-700">
              <div className="text-xs text-yellow-600">
                dy
              </div>

              <div className="mt-1 font-mono text-xl font-bold">
                {
                  formatNumber(
                    dy,
                    4,
                  )
                }
              </div>
            </div>
          </div>
        </div>
      }
      sidebar={
        <>
          <ExperimentCard
            title="基点 x₀"
          >
            <RangeControl
              label="x₀"
              value={x0}
              min={
                -2
              }
              max={
                2
              }
              step={
                0.05
              }
              onChange={
                setX0
              }
            />
          </ExperimentCard>

          <ExperimentCard
            title="自变量增量"
          >
            <RangeControl
              label="Δx"
              value={dx}
              min={
                0.02
              }
              max={
                1.2
              }
              step={
                0.02
              }
              onChange={
                setDx
              }
            />

            <button
              type="button"
              onClick={
                () =>
                  setDx(
                    0.05,
                  )
              }
              className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              缩小 Δx
            </button>
          </ExperimentCard>

          <ExperimentCard
            title="微分计算"
          >
            <div className="grid grid-cols-2 gap-3">
              <NumberReadout
                label="f′(x₀)"
                value={
                  formatNumber(
                    derivative,
                  )
                }
              />

              <NumberReadout
                label="dy = f′(x₀)Δx"
                value={
                  formatNumber(
                    dy,
                    6,
                  )
                }
                emphasis
              />

              <NumberReadout
                label="真实 Δy"
                value={
                  formatNumber(
                    deltaY,
                    6,
                  )
                }
              />

              <NumberReadout
                label="Δy − dy"
                value={
                  formatNumber(
                    linearError,
                    8,
                  )
                }
              />
            </div>
          </ExperimentCard>

          <ExperimentCard
            title="教学判断"
          >
            <p className="text-sm leading-7 text-slate-600">
              当 Δx 越小时，
              曲线在 P 点附近越像它的切线，
              因而
              {' '}
              <strong className="text-indigo-700">
                Δy ≈ dy
              </strong>
              。
              微分就是函数增量的主要线性部分。
            </p>
          </ExperimentCard>
        </>
      }
    />
  )
}

// ============================================================================
// 5. Graphing
// ============================================================================

type GraphFunctionId =
  | 'cubic'
  | 'quartic'
  | 'sine'

interface GraphFunctionDefinition {
  id:
    GraphFunctionId

  title:
    string

  formula:
    string

  derivativeFormula:
    string

  secondFormula:
    string

  fn:
    (
      x: number,
    ) => number

  derivative:
    (
      x: number,
    ) => number

  second:
    (
      x: number,
    ) => number

  xMin:
    number

  xMax:
    number
}

const GRAPH_FUNCTIONS:
  Record<
    GraphFunctionId,
    GraphFunctionDefinition
  > = {
  cubic: {
    id:
      'cubic',

    title:
      '三次函数',

    formula:
      'f(x) = x³ − 3x',

    derivativeFormula:
      'f′(x) = 3x² − 3',

    secondFormula:
      'f″(x) = 6x',

    fn:
      (
        x,
      ) =>
        x *
          x *
          x -
        3 *
          x,

    derivative:
      (
        x,
      ) =>
        3 *
          x *
          x -
        3,

    second:
      (
        x,
      ) =>
        6 *
        x,

    xMin:
      -2.6,

    xMax:
      2.6,
  },

  quartic: {
    id:
      'quartic',

    title:
      '四次函数',

    formula:
      'f(x) = x⁴/4 − x²',

    derivativeFormula:
      'f′(x) = x³ − 2x',

    secondFormula:
      'f″(x) = 3x² − 2',

    fn:
      (
        x,
      ) =>
        Math.pow(
          x,
          4,
        ) /
          4 -
        x *
          x,

    derivative:
      (
        x,
      ) =>
        x *
          x *
          x -
        2 *
          x,

    second:
      (
        x,
      ) =>
        3 *
          x *
          x -
        2,

    xMin:
      -2.3,

    xMax:
      2.3,
  },

  sine: {
    id:
      'sine',

    title:
      '正弦函数',

    formula:
      'f(x) = sin x',

    derivativeFormula:
      'f′(x) = cos x',

    secondFormula:
      'f″(x) = −sin x',

    fn:
      (
        x,
      ) =>
        Math.sin(
          x,
        ),

    derivative:
      (
        x,
      ) =>
        Math.cos(
          x,
        ),

    second:
      (
        x,
      ) =>
        -Math.sin(
          x,
        ),

    xMin:
      -Math.PI *
      2,

    xMax:
      Math.PI *
      2,
  },
}

export function GraphingDemo() {
  const [
    functionId,
    setFunctionId,
  ] =
    useState<GraphFunctionId>(
      'cubic',
    )

  const definition =
    GRAPH_FUNCTIONS[
      functionId
    ]

  const [
    x,
    setX,
  ] =
    useState(
      0.5,
    )

  const safeX =
    clamp(
      x,
      definition.xMin,
      definition.xMax,
    )

  const fValue =
    definition.fn(
      safeX,
    )

  const d1 =
    definition.derivative(
      safeX,
    )

  const d2 =
    definition.second(
      safeX,
    )

  const monotonicity =
    Math.abs(
      d1,
    ) <
    0.05
      ? '驻点附近'
      : d1 >
        0
        ? '单调递增'
        : '单调递减'

  const concavity =
    Math.abs(
      d2,
    ) <
    0.05
      ? '拐点附近'
      : d2 >
        0
        ? '凹向上'
        : '凹向下'

  const series =
    useMemo<
      PlotSeries[]
    >(
      () => [
        {
          id:
            'f',

          label:
            'f(x)',

          points:
            sampleFunction(
              definition.fn,
              definition.xMin,
              definition.xMax,
              340,
            ),

          stroke:
            '#60a5fa',

          width:
            3.2,
        },

        {
          id:
            'd1',

          label:
            'f′(x)',

          points:
            sampleFunction(
              definition.derivative,
              definition.xMin,
              definition.xMax,
              340,
            ),

          stroke:
            '#34d399',
        },

        {
          id:
            'd2',

          label:
            'f″(x)',

          points:
            sampleFunction(
              definition.second,
              definition.xMin,
              definition.xMax,
              340,
            ),

          stroke:
            '#f472b6',

          opacity:
            0.85,
        },
      ],
      [
        definition,
      ],
    )

  const handleFunctionChange = (
    next:
      GraphFunctionId,
  ) => {
    const nextDefinition =
      GRAPH_FUNCTIONS[
        next
      ]

    setFunctionId(
      next,
    )

    setX(
      clamp(
        0.5,
        nextDefinition.xMin,
        nextDefinition.xMax,
      ),
    )
  }

  return (
    <ExperimentShell
      breadcrumb={[
        '高等数学（上册）',
        '微分中值定理与导数的应用',
        '函数图形描绘',
      ]}
      title="函数图形描绘"
      subtitle="联动观察 f、f′、f″，利用导数判断单调性、极值、凹凸性与拐点。"
      canvas={
        <div className="space-y-4 p-3 md:p-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              当前函数
            </div>

            <div className="mt-1 text-lg font-bold text-slate-900">
              {
                definition.formula
              }
            </div>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
              <span>
                {
                  definition.derivativeFormula
                }
              </span>

              <span>
                {
                  definition.secondFormula
                }
              </span>
            </div>
          </div>

          <FunctionPlot
            series={
              series
            }
            xMin={
              definition.xMin
            }
            xMax={
              definition.xMax
            }
            markers={[
              {
                id:
                  'f-current',

                x:
                  safeX,

                y:
                  fValue,

                label:
                  'f',

                color:
                  '#93c5fd',
              },

              {
                id:
                  'd1-current',

                x:
                  safeX,

                y:
                  d1,

                label:
                  'f′',

                color:
                  '#6ee7b7',
              },

              {
                id:
                  'd2-current',

                x:
                  safeX,

                y:
                  d2,

                label:
                  'f″',

                color:
                  '#f9a8d4',
              },
            ]}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <div
              className={[
                'rounded-xl border p-4',
                d1 >
                0
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
                  : d1 <
                    0
                    ? 'border-rose-500/20 bg-rose-500/10 text-rose-100'
                    : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-100',
              ].join(
                ' ',
              )}
            >
              <div className="text-xs opacity-70">
                一阶导数判断
              </div>

              <div className="mt-1 text-lg font-bold">
                {
                  monotonicity
                }
              </div>
            </div>

            <div
              className={[
                'rounded-xl border p-4',
                d2 >
                0
                  ? 'border-blue-500/20 bg-blue-500/10 text-blue-100'
                  : d2 <
                    0
                    ? 'border-purple-500/20 bg-purple-500/10 text-purple-100'
                    : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-100',
              ].join(
                ' ',
              )}
            >
              <div className="text-xs opacity-70">
                二阶导数判断
              </div>

              <div className="mt-1 text-lg font-bold">
                {
                  concavity
                }
              </div>
            </div>
          </div>
        </div>
      }
      sidebar={
        <>
          <ExperimentCard
            title="函数选择"
          >
            <div className="grid gap-2">
              {(
                Object.keys(
                  GRAPH_FUNCTIONS,
                ) as
                  GraphFunctionId[]
              ).map(
                (
                  id,
                ) => (
                  <ChoiceButton
                    key={
                      id
                    }
                    active={
                      functionId ===
                      id
                    }
                    onClick={
                      () =>
                        handleFunctionChange(
                          id,
                        )
                    }
                  >
                    {
                      GRAPH_FUNCTIONS[
                        id
                      ]
                        .title
                    }
                  </ChoiceButton>
                ),
              )}
            </div>
          </ExperimentCard>

          <ExperimentCard
            title="观察位置"
          >
            <RangeControl
              label="x"
              value={
                safeX
              }
              min={
                definition.xMin
              }
              max={
                definition.xMax
              }
              step={
                0.02
              }
              onChange={
                setX
              }
            />
          </ExperimentCard>

          <ExperimentCard
            title="导数状态"
          >
            <div className="grid grid-cols-2 gap-3">
              <NumberReadout
                label="f(x)"
                value={
                  formatNumber(
                    fValue,
                    5,
                  )
                }
              />

              <NumberReadout
                label="f′(x)"
                value={
                  formatNumber(
                    d1,
                    5,
                  )
                }
                emphasis
              />

              <NumberReadout
                label="f″(x)"
                value={
                  formatNumber(
                    d2,
                    5,
                  )
                }
              />

              <NumberReadout
                label="x"
                value={
                  formatNumber(
                    safeX,
                    4,
                  )
                }
              />
            </div>
          </ExperimentCard>

          <ExperimentCard
            title="图形判断"
          >
            <div className="space-y-3 text-sm leading-6 text-slate-600">
              <div className="rounded-xl bg-emerald-50 p-3">
                <strong>
                  f′ &gt; 0
                </strong>
                {' '}
                → 函数递增
              </div>

              <div className="rounded-xl bg-rose-50 p-3">
                <strong>
                  f′ &lt; 0
                </strong>
                {' '}
                → 函数递减
              </div>

              <div className="rounded-xl bg-blue-50 p-3">
                <strong>
                  f″ &gt; 0
                </strong>
                {' '}
                → 图形凹向上
              </div>

              <div className="rounded-xl bg-purple-50 p-3">
                <strong>
                  f″ &lt; 0
                </strong>
                {' '}
                → 图形凹向下
              </div>
            </div>
          </ExperimentCard>

          <ExperimentCard
            title="教学判断"
          >
            <p className="text-sm leading-7 text-slate-600">
              描绘函数图形时，不需要盲目取很多点。
              一阶导数提供
              <strong className="text-indigo-700">
                单调性与极值
              </strong>
              信息，
              二阶导数进一步提供
              <strong className="text-indigo-700">
                凹凸性与拐点
              </strong>
              信息。
            </p>
          </ExperimentCard>
        </>
      }
    />
  )
}

// ============================================================================
// IDs
//
// 下一步 DemoPage 注册时可以直接使用这些 ID。
// ============================================================================

export const CORE_CALCULUS_SUPPLEMENT_DEMO_IDS = [
  'limit-laws',
  'two-important-limits',
  'infinitesimal',
  'differential',
  'graphing',
] as const
