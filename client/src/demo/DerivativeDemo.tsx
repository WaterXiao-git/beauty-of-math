// ============================================================================
// 导数的几何意义 Demo V2
//
// 核心思想：
//
// 固定点 P = (x₀, f(x₀))
// 移动点 Q = (x₀ + h, f(x₀ + h))
//
// 当：
//
// h → 0
//
// Q 沿函数曲线趋近 P，
// 割线 PQ 的斜率逐渐趋近 P 点切线斜率：
//
//            f(x₀+h) - f(x₀)
// f'(x₀) = lim -----------------
//          h→0        h
//
// 页面结构统一使用：
//
// ExperimentShell
// ├── DemoHeader
// ├── Title / Legend
// ├── 数学 Renderer
// ├── ExperimentCard Sidebar
// └── PlayerBar
// ============================================================================

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  compile,
  derivative as mathDerivative,
} from 'mathjs'

import ExperimentCard from '../experiment-v2/ExperimentCard'
import ExperimentShell from '../experiment-v2/ExperimentShell'

import type {
  StepItem,
} from './PlayerBar'

import {
  usePanZoom,
} from './usePanZoom'

import GeoPoint from './geoboard/GeoPoint'
import GeoLine from './geoboard/GeoLine'

import {
  calcViewportGrid,
} from './viewport'

// ============================================================================
// 后端配置类型
// ============================================================================

interface DemoCase {
  id: string

  name: string

  /**
   * MathJS 函数表达式。
   *
   * 示例：
   *
   * x^2
   * sin(x)
   */
  expr: string

  domain: [
    number,
    number,
  ]

  yRange: [
    number,
    number,
  ]

  /**
   * 推荐初始观察点。
   */
  anchor?:
    | number
    | null

  desc?: string
}

interface KnowledgeConfig {
  id: string

  title: string

  summary: string

  goals: string[]

  defaultCase: string

  cases: DemoCase[]

  steps: StepItem[]

  meta?: {
    difficulty: string

    duration: string
  }
}

// ============================================================================
// SVG
// ============================================================================

const W = 720
const H = 400

const PAD_L = 62
const PAD_R = 40
const PAD_T = 44
const PAD_B = 52

const MIN_H_ABS = 0.05
const MAX_H_ABS = 2

function normalizeH(
  value: number,
  previous = 1,
): number {
  const clamped =
    Math.min(
      MAX_H_ABS,
      Math.max(
        -MAX_H_ABS,
        value,
      ),
    )

  if (
    Math.abs(
      clamped,
    ) >=
    MIN_H_ABS
  ) {
    return clamped
  }

  return previous < 0
    ? -MIN_H_ABS
    : MIN_H_ABS
}

// ============================================================================
// 将 MathJS 表达式编译成函数
// ============================================================================

function makeFn(
  expr: string,
) {
  const compiled =
    compile(expr)

  return (
    x: number,
  ): number => {
    try {
      const value =
        compiled.evaluate({
          x,
        })

      return Number.isFinite(
        value,
      )
        ? value
        : Number.NaN
    } catch {
      return Number.NaN
    }
  }
}

// ============================================================================
// 创建导函数
// ============================================================================

function makeDerivFn(
  expr: string,
) {
  let derivativeExpression:
    string

  try {
    derivativeExpression =
      mathDerivative(
        expr,
        'x',
      ).toString()
  } catch {
    derivativeExpression =
      '0'
  }

  const compiled =
    compile(
      derivativeExpression,
    )

  return (
    x: number,
  ): number => {
    try {
      const value =
        compiled.evaluate({
          x,
        })

      return Number.isFinite(
        value,
      )
        ? value
        : Number.NaN
    } catch {
      return Number.NaN
    }
  }
}

// ============================================================================
// Demo
// ============================================================================

export default function DerivativeDemo() {
  const navigate =
    useNavigate()

  // ==========================================================================
  // SVG 平移缩放
  // ==========================================================================

  const {
    transform,
    handlers,
    reset:
      resetView,
  } = usePanZoom()

  const svgRef =
    useRef<SVGSVGElement | null>(
      null,
    )

  // ==========================================================================
  // 后端配置
  // ==========================================================================

  const [
    config,
    setConfig,
  ] =
    useState<KnowledgeConfig | null>(
      null,
    )

  const [
    loadError,
    setLoadError,
  ] = useState('')

  // ==========================================================================
  // 实验状态
  // ==========================================================================

  const [
    caseId,
    setCaseId,
  ] = useState('')

  /**
   * 固定点 P 的横坐标。
   */
  const [
    x0,
    setX0,
  ] = useState(0)

  /**
   * Q 与 P 横坐标差：
   *
   * Δx = h
   */
  const [
    h,
    setH,
  ] = useState(
    0.8,
  )

  /**
   * 教学步骤。
   */
  const [
    step,
    setStep,
  ] = useState(1)

  const [
    playing,
    setPlaying,
  ] = useState(false)

  // ==========================================================================
  // 加载知识点配置
  // ==========================================================================

  useEffect(() => {
    const controller =
      new AbortController()

    fetch(
      '/api/knowledge/derivative',
      {
        signal:
          controller.signal,
      },
    )
      .then(
        (
          response,
        ) => {
          if (
            !response.ok
          ) {
            throw new Error(
              `HTTP ${response.status}`,
            )
          }

          return response.json()
        },
      )
      .then(
        (
          nextConfig:
            KnowledgeConfig,
        ) => {
          setConfig(
            nextConfig,
          )

          setCaseId(
            nextConfig.defaultCase,
          )

          /**
           * 默认直接展示完整实验。
           */
          setStep(
            Math.max(
              1,
              nextConfig.steps.length,
            ),
          )

          const defaultCase =
            nextConfig.cases.find(
              (
                item,
              ) =>
                item.id ===
                nextConfig.defaultCase,
            ) ??
            nextConfig.cases[0]

          setX0(
            defaultCase?.anchor ??
              0,
          )
        },
      )
      .catch(
        (
          error:
            unknown,
        ) => {
          if (
            error instanceof
              DOMException &&
            error.name ===
              'AbortError'
          ) {
            return
          }

          setLoadError(
            String(error),
          )
        },
      )

    return () => {
      controller.abort()
    }
  }, [])

  // ==========================================================================
  // 当前案例
  // ==========================================================================

  const activeCase =
    useMemo(
      () =>
        config?.cases.find(
          (
            item,
          ) =>
            item.id ===
            caseId,
        ) ??
        config?.cases[0],

      [
        config,
        caseId,
      ],
    )

  // ==========================================================================
  // 总步骤数量
  // ==========================================================================

  const totalSteps =
    Math.max(
      1,
      config?.steps.length ??
        1,
    )

  // ==========================================================================
  // 自动播放
  //
  // 不再固定：
  //
  // 1 → 4
  //
  // 而是：
  //
  // 1 → config.steps.length
  // ==========================================================================

  useEffect(() => {
    if (
      !playing ||
      !config
    ) {
      return
    }

    const timer =
      window.setInterval(
        () => {
          setStep(
            (
              currentStep,
            ) => {
              /**
               * 第三阶段：
               *
               * 自动缩小 h，
               * 让 Q 逐渐向 P 靠近。
               */
              if (
                currentStep ===
                3
              ) {
                setH(
                  (
                    previous,
                  ) =>
                    normalizeH(
                      previous *
                        0.7,
                      previous,
                    ),
                )
              }

              if (
                currentStep >=
                Math.max(
                  1,
                  config.steps.length,
                )
              ) {
                return 1
              }

              return (
                currentStep +
                1
              )
            },
          )
        },
        1800,
      )

    return () => {
      window.clearInterval(
        timer,
      )
    }
  }, [
    playing,
    config,
  ])

  // ==========================================================================
  // 数学计算
  // ==========================================================================

  const derived =
    useMemo(() => {
      if (!activeCase) {
        return null
      }

      const f =
        makeFn(
          activeCase.expr,
        )

      const fp =
        makeDerivFn(
          activeCase.expr,
        )

      const xMin =
        activeCase.domain[0]

      const xMax =
        activeCase.domain[1]

      /**
       * P 点不能太靠近边界，
       * 给 Q 留出观察空间。
       */
      const x0Value =
        Math.min(
          Math.max(
            x0,
            xMin + 0.3,
          ),
          xMax - 0.3,
        )

      /**
       * h 不能为 0。
       */
      const hValue =
        normalizeH(
          h,
          h,
        )

      const yP =
        f(x0Value)

      const yQ =
        f(
          x0Value +
            hValue,
        )

      /**
       * 割线斜率：
       *
       * Δy / Δx
       */
      const secantSlope =
        (yQ - yP) /
        hValue

      /**
       * 真正的导数：
       *
       * f'(x₀)
       */
      const tangentSlope =
        fp(x0Value)

      /**
       * 割线斜率与切线斜率误差。
       */
      const diff =
        Math.abs(
          secantSlope -
            tangentSlope,
        )

      return {
        f,

        x0:
          x0Value,

        h:
          hValue,

        yP,

        yQ,

        secantSlope,

        tangentSlope,

        diff,
      }
    }, [
      activeCase,
      x0,
      h,
    ])

  // ==========================================================================
  // 加载失败
  //
  // 即使失败也继续使用统一 ExperimentShell。
  // ==========================================================================

  if (loadError) {
    return (
      <ExperimentShell
        breadcrumb={[
          '高等数学（上册）',
          '导数与微分',
          '导数的几何意义',
        ]}
        onBreadcrumbClick={() =>
          navigate('/')
        }
        title="导数的几何意义"
        subtitle="配置加载失败"
        canvas={
          <div
            className="
              flex
              h-full
              min-h-[420px]
              items-center
              justify-center
              p-8
            "
          >
            <div
              className="
                max-w-md
                text-center
              "
            >
              <div
                className="
                  text-5xl
                "
              >
                ⚠️
              </div>

              <h2
                className="
                  mt-4
                  text-lg
                  font-bold
                  text-slate-900
                "
              >
                演示配置加载失败
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-slate-400
                "
              >
                {loadError}
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                请确认后端服务已经启动。
              </p>
            </div>
          </div>
        }
      />
    )
  }

  // ==========================================================================
  // Loading
  // ==========================================================================

  if (
    !config ||
    !activeCase ||
    !derived
  ) {
    return (
      <ExperimentShell
        breadcrumb={[
          '高等数学（上册）',
          '导数与微分',
          '导数的几何意义',
        ]}
        onBreadcrumbClick={() =>
          navigate('/')
        }
        title="导数的几何意义"
        subtitle="正在加载实验配置"
        canvas={
          <div
            className="
              flex
              h-full
              min-h-[420px]
              items-center
              justify-center
            "
          >
            <div
              className="
                text-center
              "
            >
              <div
                className="
                  mx-auto
                  h-9
                  w-9
                  animate-spin
                  rounded-full
                  border-2
                  border-slate-700
                  border-t-indigo-400
                "
              />

              <p
                className="
                  mt-3
                  text-sm
                  text-slate-400
                "
              >
                配置加载中…
              </p>
            </div>
          </div>
        }
      />
    )
  }

  // ==========================================================================
  // 展开数学状态
  // ==========================================================================

  const {
    f,

    x0:
      x0Value,

    h:
      hValue,

    yP,

    yQ,

    secantSlope,

    tangentSlope,

    diff,
  } = derived

  const [
    xMin,
    xMax,
  ] =
    activeCase.domain

  const [
    yMin,
    yMax,
  ] =
    activeCase.yRange

  // ==========================================================================
  // 世界坐标 -> SVG
  // ==========================================================================

  const sx = (
    x: number,
  ) =>
    PAD_L +
    ((x - xMin) /
      (xMax - xMin)) *
      (
        W -
        PAD_L -
        PAD_R
      )

  const sy = (
    y: number,
  ) =>
    H -
    PAD_B -
    ((y - yMin) /
      (yMax - yMin)) *
      (
        H -
        PAD_T -
        PAD_B
      )

  /**
   * GeoPoint / GeoLine
   * 使用的统一坐标转换。
   */
  const coord = {
    sx,

    sy,

    fromSx:
      (
        mouseX:
          number,
      ) =>
        xMin +
        ((mouseX -
          PAD_L) /
          (
            W -
            PAD_L -
            PAD_R
          )) *
          (
            xMax -
            xMin
          ),

    fromSy:
      (
        mouseY:
          number,
      ) =>
        yMin +
        ((H -
          PAD_B -
          mouseY) /
          (
            H -
            PAD_T -
            PAD_B
          )) *
          (
            yMax -
            yMin
          ),
  }

  // ==========================================================================
  // 网格
  // ==========================================================================

  const grid =
    calcViewportGrid(
      transform,
      W,
      H,

      [
        xMin,
        xMax,
      ],

      [
        yMin,
        yMax,
      ],

      PAD_L,
      PAD_R,
      PAD_T,
      PAD_B,
    )

  // ==========================================================================
  // 函数曲线采样
  // ==========================================================================

  const curvePoints:
    string[] = []

  const SAMPLE_COUNT =
    160

  for (
    let index = 0;
    index <=
    SAMPLE_COUNT;
    index += 1
  ) {
    const x =
      xMin +
      ((xMax -
        xMin) *
        index) /
        SAMPLE_COUNT

    const y =
      f(x)

    if (
      !Number.isFinite(
        y,
      )
    ) {
      continue
    }

    curvePoints.push(
      `${
        curvePoints.length ===
        0
          ? 'M'
          : 'L'
      }${sx(x).toFixed(
        1,
      )} ${sy(y).toFixed(
        1,
      )}`,
    )
  }

  // ==========================================================================
  // 切换案例
  // ==========================================================================

  const handleSelectCase = (
    nextCase:
      DemoCase,
  ) => {
    setCaseId(
      nextCase.id,
    )

    setH(0.8)

    setX0(
      nextCase.anchor ??
        0,
    )

    setStep(
      totalSteps,
    )

    setPlaying(false)

    resetView()
  }

  // ==========================================================================
  // Player
  // ==========================================================================

  const handlePrev = () => {
    setPlaying(false)

    setStep(
      (
        current,
      ) =>
        Math.max(
          1,
          current - 1,
        ),
    )
  }

  const handleNext = () => {
    setPlaying(false)

    setStep(
      (
        current,
      ) =>
        Math.min(
          totalSteps,
          current + 1,
        ),
    )
  }

  const handleTogglePlay =
    () => {
      /**
       * 如果已经处于最后一步，
       * 从第一步重新播放。
       */
      if (
        !playing &&
        step >=
          totalSteps
      ) {
        setStep(1)
      }

      setPlaying(
        (
          current,
        ) =>
          !current,
      )
    }

  const handleReset = () => {
    setPlaying(false)

    setStep(1)

    setCaseId(
      config.defaultCase,
    )

    const defaultCase =
      config.cases.find(
        (
          item,
        ) =>
          item.id ===
          config.defaultCase,
      ) ??
      config.cases[0]

    setX0(
      defaultCase?.anchor ??
        0,
    )

    setH(0.8)

    resetView()
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <ExperimentShell
      // ======================================================================
      // Header
      // ======================================================================

      breadcrumb={[
        '高等数学（上册）',
        '导数与微分',
        config.title,
      ]}

      onBreadcrumbClick={() =>
        navigate('/')
      }

      // ======================================================================
      // 标题
      // ======================================================================

      title={
        config.title
      }

      subtitle={
        `${activeCase.name} · ` +
        `x₀ = ${x0Value.toFixed(
          2,
        )} · ` +
        `h = ${hValue.toFixed(
          2,
        )}`
      }

      // ======================================================================
      // 图例
      // ======================================================================

      legend={[
        {
          label:
            'P 点',

          color:
            '#60a5fa',
        },

        {
          label:
            'Q 点',

          color:
            '#fbbf24',
        },

        {
          label:
            '割线',

          color:
            '#38bdf8',
        },

        {
          label:
            '切线',

          color:
            '#f472b6',
        },
      ]}

      // ======================================================================
      // 左侧数学 Renderer
      // ======================================================================

      canvas={
        <div
          className="
            relative
            h-full
            min-h-[420px]
            w-full
            overflow-hidden
          "
        >
          <svg
            ref={
              svgRef
            }
            viewBox={
              `0 0 ${W} ${H}`
            }
            preserveAspectRatio="xMidYMid meet"
            aria-label="导数几何意义交互式函数图像"
            className="
              h-full
              min-h-[420px]
              w-full
              cursor-grab
              select-none

              active:cursor-grabbing
            "
            {...handlers}
          >
            {/* ===========================================================
                无限视口网格
               =========================================================== */}

            {grid.verts.map(
              (
                vertical,
                index,
              ) => (
                <line
                  key={`v-${index}`}
                  x1={
                    vertical.pos
                  }
                  y1={0}
                  x2={
                    vertical.pos
                  }
                  y2={H}
                  stroke={
                    vertical.major
                      ? '#cbd5e1'
                      : '#e2e8f0'
                  }
                  strokeWidth={
                    1
                  }
                />
              ),
            )}

            {grid.hors.map(
              (
                horizontal,
                index,
              ) => (
                <line
                  key={`h-${index}`}
                  x1={0}
                  y1={
                    horizontal.pos
                  }
                  x2={W}
                  y2={
                    horizontal.pos
                  }
                  stroke={
                    horizontal.major
                      ? '#cbd5e1'
                      : '#e2e8f0'
                  }
                  strokeWidth={
                    1
                  }
                />
              ),
            )}

            {/* 坐标轴 */}

            {grid.axisX !==
              null && (
              <line
                x1={
                  grid.axisX
                }
                y1={0}
                x2={
                  grid.axisX
                }
                y2={H}
                stroke="#64748b"
                strokeWidth={
                  1.5
                }
              />
            )}

            {grid.axisY !==
              null && (
              <line
                x1={0}
                y1={
                  grid.axisY
                }
                x2={W}
                y2={
                  grid.axisY
                }
                stroke="#64748b"
                strokeWidth={
                  1.5
                }
              />
            )}

            {/* ===========================================================
                世界坐标
               =========================================================== */}

            <g
              transform={
                `translate(` +
                `${transform.tx} ` +
                `${transform.ty}` +
                `) ` +
                `scale(` +
                `${transform.scale}` +
                `)`
              }
            >
              {/* =========================================================
                  Δx / Δy 三角形
                 ========================================================= */}

              {step >=
                2 && (
                <g
                  stroke="#94a3b8"
                  strokeWidth={
                    1.1
                  }
                  strokeDasharray="5 4"
                >
                  <line
                    x1={
                      sx(
                        x0Value +
                          hValue,
                      )
                    }
                    y1={
                      sy(yP)
                    }
                    x2={
                      sx(
                        x0Value,
                      )
                    }
                    y2={
                      sy(yP)
                    }
                  />

                  <line
                    x1={
                      sx(
                        x0Value +
                          hValue,
                      )
                    }
                    y1={
                      sy(yP)
                    }
                    x2={
                      sx(
                        x0Value +
                          hValue,
                      )
                    }
                    y2={
                      sy(yQ)
                    }
                  />
                </g>
              )}

              {/* =========================================================
                  函数曲线
                 ========================================================= */}

              {curvePoints.length >
                0 && (
                <path
                  d={
                    curvePoints.join(
                      ' ',
                    )
                  }
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth={
                    2.6
                  }
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* =========================================================
                  切线
                 ========================================================= */}

              {step >=
                4 && (
                <GeoLine
                  x1={
                    x0Value
                  }
                  y1={
                    yP
                  }
                  x2={
                    x0Value +
                    1
                  }
                  y2={
                    yP +
                    tangentSlope
                  }
                  color="#f472b6"
                  width={
                    2.2
                  }
                  coord={
                    coord
                  }
                  transform={
                    transform
                  }
                  W={W}
                  H={H}
                />
              )}

              {/* =========================================================
                  割线
                 ========================================================= */}

              {step >=
                2 && (
                <GeoLine
                  x1={
                    x0Value
                  }
                  y1={
                    yP
                  }
                  x2={
                    x0Value +
                    hValue
                  }
                  y2={
                    yQ
                  }
                  color="#38bdf8"
                  coord={
                    coord
                  }
                  transform={
                    transform
                  }
                  W={W}
                  H={H}
                />
              )}

              {/* =========================================================
                  P 点
                 ========================================================= */}

              <GeoPoint
                label="P"
                x={
                  x0Value
                }
                y={
                  yP
                }
                color="#60a5fa"
                constraint="curve"
                curveY={
                  f
                }
                onMove={(
                  worldX,
                ) =>
                  setX0(
                    worldX,
                  )
                }
                coord={
                  coord
                }
                transform={
                  transform
                }
                svgRef={
                  svgRef
                }
                labelDx={
                  -12
                }
              />

              {/* =========================================================
                  Q 点
                 ========================================================= */}

              {step >=
                1 && (
                <GeoPoint
                  label="Q"
                  x={
                    x0Value +
                    hValue
                  }
                  y={
                    yQ
                  }
                  color="#fbbf24"
                  constraint="curve"
                  curveY={
                    f
                  }
                  onMove={(
                    worldX,
                  ) =>
                    setH(
                      normalizeH(
                        worldX -
                          x0Value,
                        hValue,
                      ),
                    )
                  }
                  coord={
                    coord
                  }
                  transform={
                    transform
                  }
                  svgRef={
                    svgRef
                  }
                />
              )}

              {/* =========================================================
                  Δx / Δy 标签
                 ========================================================= */}

              {step >=
                2 && (
                <g
                  fontSize={
                    11
                  }
                  fill="#475569"
                >
                  <text
                    x={
                      sx(
                        x0Value,
                      ) +
                      (
                        sx(
                          x0Value +
                            hValue,
                        ) -
                        sx(
                          x0Value,
                        )
                      ) /
                        2 -
                      6
                    }
                    y={
                      sy(yP) +
                      16
                    }
                  >
                    Δx = h
                  </text>

                  <text
                    x={
                      sx(
                        x0Value +
                          hValue,
                      ) +
                      8
                    }
                    y={
                      (
                        sy(
                          yP,
                        ) +
                        sy(
                          yQ,
                        )
                      ) /
                        2 +
                      4
                    }
                  >
                    Δy
                  </text>
                </g>
              )}
            </g>
          </svg>

          {/* =============================================================
              动态数据
             ============================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-3
              left-3
              right-3
              z-10
              flex
              flex-wrap
              items-end
              gap-2
            "
          >
            {[
              {
                label:
                  'Δx = h',

                value:
                  hValue.toFixed(
                    2,
                  ),
              },

              {
                label:
                  'Δy',

                value:
                  (
                    yQ -
                    yP
                  ).toFixed(
                    3,
                  ),
              },

              {
                label:
                  '割线斜率',

                value:
                  secantSlope.toFixed(
                    3,
                  ),
              },

              {
                label:
                  '切线斜率 f′',

                value:
                  tangentSlope.toFixed(
                    3,
                  ),
              },

              {
                label:
                  '斜率误差',

                value:
                  diff.toFixed(
                    3,
                  ),
              },
            ].map(
              (
                item,
              ) => (
                <div
                  key={
                    item.label
                  }
                  className="
                    rounded-xl
                    border
                    border-slate-700/50
                    bg-slate-800/85
                    px-3
                    py-2
                    shadow-sm
                    backdrop-blur-sm
                  "
                >
                  <div
                    className="
                      text-[10px]
                      text-slate-400
                    "
                  >
                    {
                      item.label
                    }
                  </div>

                  <div
                    className="
                      mt-0.5
                      whitespace-nowrap
                      font-mono
                      text-xs
                      font-semibold
                      text-slate-100
                    "
                  >
                    {
                      item.value
                    }
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      }

      // ======================================================================
      // Sidebar
      // ======================================================================

      sidebar={
        <>
          {/* =============================================================
              概念说明
             ============================================================= */}

          <ExperimentCard title="概念说明">
            <p
              className="
                text-[13px]
                leading-6
                text-gray-600
              "
            >
              {config.summary}
            </p>

            {config.goals.length >
              0 && (
              <div
                className="
                  mt-4
                  border-t
                  border-gray-100
                  pt-3
                "
              >
                <div
                  className="
                    mb-2
                    text-xs
                    font-semibold
                    text-gray-400
                  "
                >
                  学习目标
                </div>

                <ul
                  className="
                    space-y-2
                  "
                >
                  {config.goals.map(
                    (
                      goal,
                    ) => (
                      <li
                        key={
                          goal
                        }
                        className="
                          flex
                          items-start
                          gap-2
                          text-[12px]
                          leading-5
                          text-gray-500
                        "
                      >
                        <span
                          className="
                            mt-2
                            h-1.5
                            w-1.5
                            shrink-0
                            rounded-full
                            bg-indigo-500
                          "
                        />

                        <span>
                          {goal}
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}
          </ExperimentCard>

          {/* =============================================================
              案例与参数
             ============================================================= */}

          <ExperimentCard title="案例与参数">
            {/* 案例 Tabs */}

            <div
              className="
                flex
                rounded-xl
                bg-gray-100
                p-1
              "
            >
              {config.cases.map(
                (
                  item,
                ) => {
                  const active =
                    item.id ===
                    caseId

                  return (
                    <button
                      key={
                        item.id
                      }
                      type="button"
                      onClick={() =>
                        handleSelectCase(
                          item,
                        )
                      }
                      title={
                        item.desc
                      }
                      className={[
                        'min-w-0',
                        'flex-1',
                        'truncate',
                        'rounded-lg',
                        'px-2',
                        'py-1.5',
                        'text-xs',
                        'font-semibold',
                        'transition-all',

                        active
                          ? [
                              'bg-indigo-600',
                              'text-white',
                              'shadow-sm',
                            ].join(
                              ' ',
                            )
                          : [
                              'text-gray-500',
                              'hover:bg-white/60',
                              'hover:text-gray-700',
                            ].join(
                              ' ',
                            ),
                      ].join(
                        ' ',
                      )}
                    >
                      {item.name}
                    </button>
                  )
                },
              )}
            </div>

            {/* 案例描述 */}

            {activeCase.desc && (
              <p
                className="
                  mt-3
                  rounded-lg
                  bg-slate-50
                  px-3
                  py-2
                  text-[11px]
                  leading-5
                  text-slate-500
                "
              >
                {activeCase.desc}
              </p>
            )}

            {/* x₀ */}

            <div
              className="
                mt-4
              "
            >
              <div
                className="
                  mb-1.5
                  flex
                  items-center
                  justify-between
                "
              >
                <span
                  className="
                    text-[13px]
                    font-medium
                    text-gray-700
                  "
                >
                  固定点 x₀
                </span>

                <span
                  className="
                    font-mono
                    text-xs
                    font-semibold
                    text-indigo-600
                  "
                >
                  {x0Value.toFixed(
                    2,
                  )}
                </span>
              </div>

              <input
                type="range"
                min={
                  Math.round(
                    (
                      xMin +
                      0.3
                    ) *
                      10,
                  ) /
                  10
                }
                max={
                  Math.round(
                    (
                      xMax -
                      0.3
                    ) *
                      10,
                  ) /
                  10
                }
                step={
                  0.1
                }
                value={
                  x0Value
                }
                onChange={(
                  event,
                ) =>
                  setX0(
                    Number.parseFloat(
                      event.target
                        .value,
                    ),
                  )
                }
                className="
                  w-full
                  accent-indigo-600
                "
              />
            </div>

            {/* h */}

            <div
              className="
                mt-4
              "
            >
              <div
                className="
                  mb-1.5
                  flex
                  items-center
                  justify-between
                "
              >
                <span
                  className="
                    text-[13px]
                    font-medium
                    text-gray-700
                  "
                >
                  步长 h
                  （h ≠ 0）
                </span>

                <span
                  className="
                    font-mono
                    text-xs
                    font-semibold
                    text-indigo-600
                  "
                >
                  {hValue.toFixed(
                    2,
                  )}
                </span>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  aria-pressed={hValue < 0}
                  onClick={() =>
                    setH(
                      -Math.max(
                        MIN_H_ABS,
                        Math.abs(
                          hValue,
                        ),
                      ),
                    )
                  }
                  className={hValue < 0
                    ? 'rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white'
                    : 'rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100'}
                >
                  ← 左侧趋近
                </button>

                <button
                  type="button"
                  aria-pressed={hValue > 0}
                  onClick={() =>
                    setH(
                      Math.max(
                        MIN_H_ABS,
                        Math.abs(
                          hValue,
                        ),
                      ),
                    )
                  }
                  className={hValue > 0
                    ? 'rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white'
                    : 'rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100'}
                >
                  右侧趋近 →
                </button>
              </div>

              <input
                type="range"
                min={
                  -2
                }
                max={
                  2
                }
                step={
                  0.05
                }
                value={
                  hValue
                }
                onChange={(
                  event,
                ) =>
                  setH(
                    normalizeH(
                      Number.parseFloat(
                        event.target
                          .value,
                      ),
                      hValue,
                    ),
                  )
                }
                className="
                  w-full
                  accent-indigo-600
                "
              />

              <p
                className="
                  mt-1
                  text-[11px]
                  leading-5
                  text-gray-400
                "
              >
                当前从
                {hValue < 0
                  ? '左侧'
                  : '右侧'}
                趋近；拖动到零点另一侧可比较左、右差商。
              </p>
            </div>
          </ExperimentCard>

          {/* =============================================================
              教学判断
             ============================================================= */}

          <ExperimentCard
            title="教学判断"
            action={
              <span
                className={[
                  'rounded-full',
                  'px-2.5',
                  'py-1',
                  'text-xs',
                  'font-semibold',

                  step >=
                  totalSteps
                    ? [
                        'bg-emerald-50',
                        'text-emerald-600',
                      ].join(
                        ' ',
                      )
                    : [
                        'bg-amber-50',
                        'text-amber-600',
                      ].join(
                        ' ',
                      ),
                ].join(
                  ' ',
                )}
              >
                {step >=
                totalSteps
                  ? '趋近完成'
                  : '进行中'}
              </span>
            }
          >
            {/* 斜率比较 */}

            <div
              className={[
                'flex',
                'items-start',
                'gap-2.5',
                'rounded-xl',
                'border',
                'px-3.5',
                'py-3',

                diff <
                0.15
                  ? [
                      'border-emerald-100',
                      'bg-emerald-50/60',
                    ].join(
                      ' ',
                    )
                  : [
                      'border-blue-100',
                      'bg-blue-50/60',
                    ].join(
                      ' ',
                    ),
              ].join(
                ' ',
              )}
            >
              <svg
                className={[
                  'mt-0.5',
                  'h-4',
                  'w-4',
                  'shrink-0',

                  diff <
                  0.15
                    ? 'text-emerald-500'
                    : 'text-blue-500',
                ].join(
                  ' ',
                )}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={
                  2.4
                }
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12l2 2 4-4m5.2 2a9 9 0 1 1-2.6-6.4" />
              </svg>

              <p
                className="
                  text-[13px]
                  leading-6
                  text-gray-600
                "
              >
                割线斜率{' '}
                <strong>
                  {secantSlope.toFixed(
                    3,
                  )}
                </strong>
                ，切线斜率{' '}
                <strong>
                  {tangentSlope.toFixed(
                    3,
                  )}
                </strong>
                ，误差为{' '}
                <strong>
                  {diff.toFixed(
                    3,
                  )}
                </strong>
                。

                {diff <
                0.15
                  ? ' h 已经足够小，可以观察到差商明显趋近导数。'
                  : ' 继续减小 h，观察割线如何逐渐旋转并趋近切线。'}
              </p>
            </div>

            {/* 导数结果 */}

            <div
              className="
                mt-3
                rounded-xl
                border
                border-indigo-100
                bg-indigo-50/70
                px-3.5
                py-3
                text-center
              "
            >
              <div
                className="
                  text-[11px]
                  text-indigo-400
                "
              >
                当前点导数
              </div>

              <div
                className="
                  mt-1
                  font-mono
                  text-sm
                  font-bold
                  text-indigo-700
                "
              >
                f′(x₀) ={' '}
                {tangentSlope.toFixed(
                  3,
                )}
              </div>
            </div>

            {/* 差商 */}

            <div
              className="
                mt-3
                rounded-xl
                bg-gray-50
                px-3
                py-3
              "
            >
              <div
                className="
                  text-center
                  font-mono
                  text-xs
                  leading-6
                  text-gray-600
                "
              >
                [f(x₀+h) −
                f(x₀)] / h
              </div>

              <div
                className="
                  mt-1
                  text-center
                  text-xs
                  font-semibold
                  text-sky-600
                "
              >
                ≈{' '}
                {secantSlope.toFixed(
                  3,
                )}
              </div>
            </div>
          </ExperimentCard>
        </>
      }

      // ======================================================================
      // PlayerBar
      // ======================================================================

      player={{
        steps:
          config.steps,

        step,

        playing,

        onPrev:
          handlePrev,

        onNext:
          handleNext,

        onTogglePlay:
          handleTogglePlay,

        onReset:
          handleReset,
      }}
    />
  )
}
