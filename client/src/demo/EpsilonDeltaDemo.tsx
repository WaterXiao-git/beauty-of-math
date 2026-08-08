// ============================================================================
// ε−δ 极限定义 Demo V2
//
// 核心思想：
//
// lim f(x) = L
// x→a
//
// 表示：
//
// 对任意 ε > 0，
// 都存在 δ > 0，
//
// 使得：
//
// 0 < |x-a| < δ
//
// 时：
//
// |f(x)-L| < ε
//
// 本实验通过：
//
// - ε 水平误差带
// - δ 垂直邻域
// - 函数曲线
// - δ 内曲线高亮
//
// 将极限定义可视化。
//
// 页面统一使用：
//
// ExperimentShell
// ├── DemoHeader
// ├── Title / Legend
// ├── ε−δ Renderer
// ├── ExperimentCard Sidebar
// └── PlayerBar
// ============================================================================

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  compile,
} from 'mathjs'

import ExperimentCard from '../experiment-v2/ExperimentCard'
import ExperimentShell from '../experiment-v2/ExperimentShell'

import type {
  StepItem,
} from './PlayerBar'

import {
  usePanZoom,
} from './usePanZoom'

import {
  calcViewportGrid,
} from './viewport'

// ============================================================================
// 后端配置
// ============================================================================

interface DemoCase {
  id: string

  name: string

  /**
   * MathJS 函数表达式。
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
   * 极限趋近点 a。
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

// ============================================================================
// 创建函数
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
// 数值搜索可行 δ
//
// 搜索最大的 δ，使：
//
// |x-a| < δ
//
// 范围内采样点都满足：
//
// |f(x)-L| < ε
//
// 注意：
// δ 本身不唯一。
// ============================================================================

function feasibleDelta(
  f: (
    x: number,
  ) => number,

  a: number,

  limitValue: number,

  epsilon: number,

  domain: [
    number,
    number,
  ],
): number {
  /**
   * δ 最大不能超出当前定义域。
   */
  const upperBound =
    Math.min(
      a - domain[0],
      domain[1] - a,
    )

  if (
    upperBound <= 0
  ) {
    return 0
  }

  /**
   * 判断一个 δ 是否可行。
   */
  const isValidDelta = (
    delta: number,
  ): boolean => {
    const SAMPLE_COUNT =
      240

    for (
      let index = 0;
      index <=
      SAMPLE_COUNT;
      index += 1
    ) {
      const x =
        a -
        delta +
        (
          (2 * delta) /
          SAMPLE_COUNT
        ) *
          index

      if (
        x < domain[0] ||
        x > domain[1]
      ) {
        continue
      }

      /**
       * ε−δ 定义严格来说排除 x=a，
       * 这里采样中遇到 a 时跳过。
       */
      if (
        Math.abs(
          x - a,
        ) <
        1e-10
      ) {
        continue
      }

      const y =
        f(x)

      if (
        !Number.isFinite(
          y,
        )
      ) {
        return false
      }

      if (
        Math.abs(
          y -
            limitValue,
        ) >= epsilon
      ) {
        return false
      }
    }

    return true
  }

  // ==========================================================================
  // 二分搜索
  // ==========================================================================

  let low = 0

  let high =
    upperBound

  for (
    let iteration = 0;
    iteration < 40;
    iteration += 1
  ) {
    const middle =
      (
        low +
        high
      ) / 2

    if (
      isValidDelta(
        middle,
      )
    ) {
      low =
        middle
    } else {
      high =
        middle
    }
  }

  return low
}

// ============================================================================
// Demo
// ============================================================================

export default function EpsilonDeltaDemo() {
  const navigate =
    useNavigate()

  // ==========================================================================
  // 画布平移 / 缩放
  // ==========================================================================

  const {
    transform,
    handlers,
    reset:
      resetView,
  } = usePanZoom()

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
  // 当前案例
  // ==========================================================================

  const [
    caseId,
    setCaseId,
  ] = useState('')

  // ==========================================================================
  // ε
  // ==========================================================================

  const [
    epsilon,
    setEpsilon,
  ] = useState(
    0.6,
  )

  // ==========================================================================
  // 教学步骤
  // ==========================================================================

  const [
    step,
    setStep,
  ] = useState(1)

  const [
    playing,
    setPlaying,
  ] = useState(false)

  // ==========================================================================
  // 加载配置
  // ==========================================================================

  useEffect(() => {
    const controller =
      new AbortController()

    fetch(
      '/api/knowledge/epsilon-delta',
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
           * 与原页面一致：
           *
           * 首次进入直接展示完整状态。
           */
          setStep(
            Math.max(
              1,
              nextConfig.steps.length,
            ),
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
  // 总步骤
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
  // 原版写死：
  //
  // 1 → 4
  //
  // 现在：
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
              current,
            ) =>
              current >=
              Math.max(
                1,
                config.steps.length,
              )
                ? 1
                : current +
                  1,
          )
        },
        2000,
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
  // ε−δ 数学计算
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

      /**
       * 当前趋近点：
       *
       * x → a
       */
      const a =
        activeCase.anchor ??
        1

      /**
       * 当前案例数据本身设计为
       * 在 anchor 位置可直接得到 L。
       */
      const limitValue =
        f(a)

      /**
       * 数值寻找当前 ε
       * 对应的可行 δ。
       */
      const delta =
        feasibleDelta(
          f,
          a,
          limitValue,
          epsilon,
          activeCase.domain,
        )

      return {
        f,

        a,

        limitValue,

        delta,
      }
    }, [
      activeCase,
      epsilon,
    ])

  // ==========================================================================
  // 加载失败
  // ==========================================================================

  if (loadError) {
    return (
      <ExperimentShell
        breadcrumb={[
          '高等数学（上册）',
          '函数、极限与连续',
          'ε−δ 极限定义',
        ]}
        onBreadcrumbClick={() =>
          navigate('/')
        }
        title="ε−δ 极限定义"
        subtitle="演示配置加载失败"
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
          '函数、极限与连续',
          'ε−δ 极限定义',
        ]}
        onBreadcrumbClick={() =>
          navigate('/')
        }
        title="ε−δ 极限定义"
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
  // 展开状态
  // ==========================================================================

  const {
    f,

    a,

    limitValue,

    delta,
  } =
    derived

  const [
    domainMin,
    domainMax,
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
    (
      (x -
        domainMin) /
      (
        domainMax -
        domainMin
      )
    ) *
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
    (
      (y -
        yMin) /
      (
        yMax -
        yMin
      )
    ) *
      (
        H -
        PAD_T -
        PAD_B
      )

  // ==========================================================================
  // 当前可视范围
  //
  // 因为整个图形 group 会进行：
  //
  // translate + scale
  //
  // 所以需要反推出屏幕当前实际可见的
  // SVG 原始坐标范围。
  // ==========================================================================

  const visibleMapXMin =
    -transform.tx /
    transform.scale

  const visibleMapXMax =
    (
      W -
      transform.tx
    ) /
    transform.scale

  const visibleMapYTop =
    -transform.ty /
    transform.scale

  const visibleMapYBottom =
    (
      H -
      transform.ty
    ) /
    transform.scale

  // ==========================================================================
  // 可视世界坐标范围
  // ==========================================================================

  const visibleWorldXMin =
    domainMin +
    (
      (
        visibleMapXMin -
        PAD_L
      ) /
      (
        W -
        PAD_L -
        PAD_R
      )
    ) *
      (
        domainMax -
        domainMin
      )

  const visibleWorldXMax =
    domainMin +
    (
      (
        visibleMapXMax -
        PAD_L
      ) /
      (
        W -
        PAD_L -
        PAD_R
      )
    ) *
      (
        domainMax -
        domainMin
      )

  // ==========================================================================
  // 网格
  // ==========================================================================

  const grid =
    calcViewportGrid(
      transform,

      W,

      H,

      [
        domainMin,
        domainMax,
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

  const validBandPoints:
    string[] = []

  const SAMPLE_COUNT =
    160

  let curveStarted =
    false

  for (
    let index = 0;
    index <=
    SAMPLE_COUNT;
    index += 1
  ) {
    const x =
      visibleWorldXMin +
      (
        (
          visibleWorldXMax -
          visibleWorldXMin
        ) *
        index
      ) /
        SAMPLE_COUNT

    const y =
      f(x)

    if (
      !Number.isFinite(
        y,
      )
    ) {
      /**
       * 如果出现函数断点，
       * 后一个有效点必须重新 M 起笔。
       */
      curveStarted =
        false

      continue
    }

    curvePoints.push(
      `${
        curveStarted
          ? 'L'
          : 'M'
      }${sx(x).toFixed(
        1,
      )} ${sy(y).toFixed(
        1,
      )}`,
    )

    curveStarted =
      true

    /**
     * 第 4 步：
     *
     * 高亮：
     *
     * |x-a| < δ
     *
     * 范围中的函数曲线。
     */
    if (
      step >=
        totalSteps &&
      delta > 0 &&
      Math.abs(
        x - a,
      ) < delta
    ) {
      validBandPoints.push(
        `${
          validBandPoints.length ===
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
  }

  // ==========================================================================
  // 教学判断
  // ==========================================================================

  const verificationStep =
    step >=
    totalSteps

  const definitionSatisfied =
    verificationStep &&
    delta > 0

  // ==========================================================================
  // 案例切换
  // ==========================================================================

  const handleSelectCase = (
    nextCase:
      DemoCase,
  ) => {
    setCaseId(
      nextCase.id,
    )

    setEpsilon(
      0.6,
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
       * 已经处于最后一步时，
       * 点击播放从第一步重新开始。
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

    setEpsilon(
      0.6,
    )

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
        '函数、极限与连续',
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
        `a = ${a.toFixed(
          2,
        )} · ` +
        `L = ${limitValue.toFixed(
          2,
        )}`
      }

      // ======================================================================
      // 图例
      // ======================================================================

      legend={[
        {
          label:
            '函数曲线',

          color:
            '#60a5fa',
        },

        {
          label:
            'ε 误差带',

          color:
            '#7dd3fc',
        },

        {
          label:
            'δ 邻域',

          color:
            '#fcd34d',
        },

        {
          label:
            '满足区间',

          color:
            '#34d399',
        },
      ]}

      // ======================================================================
      // 数学 Renderer
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
            viewBox={
              `0 0 ${W} ${H}`
            }
            preserveAspectRatio="xMidYMid meet"
            aria-label="ε−δ 极限定义交互式可视化"
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
                世界坐标变换
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
                  ε 误差带
                 ========================================================= */}

              {step >=
                2 && (
                <g>
                  {/* L ± ε 区域 */}

                  <rect
                    x={
                      visibleMapXMin
                    }
                    y={
                      sy(
                        limitValue +
                          epsilon,
                      )
                    }
                    width={
                      visibleMapXMax -
                      visibleMapXMin
                    }
                    height={
                      sy(
                        limitValue -
                          epsilon,
                      ) -
                      sy(
                        limitValue +
                          epsilon,
                      )
                    }
                    fill="#38bdf8"
                    opacity={
                      0.12
                    }
                  />

                  {/* L + ε */}

                  <line
                    x1={
                      visibleMapXMin
                    }
                    y1={
                      sy(
                        limitValue +
                          epsilon,
                      )
                    }
                    x2={
                      visibleMapXMax
                    }
                    y2={
                      sy(
                        limitValue +
                          epsilon,
                      )
                    }
                    stroke="#7dd3fc"
                    strokeWidth={
                      1.2
                    }
                    strokeDasharray="5 4"
                  />

                  {/* L - ε */}

                  <line
                    x1={
                      visibleMapXMin
                    }
                    y1={
                      sy(
                        limitValue -
                          epsilon,
                      )
                    }
                    x2={
                      visibleMapXMax
                    }
                    y2={
                      sy(
                        limitValue -
                          epsilon,
                      )
                    }
                    stroke="#7dd3fc"
                    strokeWidth={
                      1.2
                    }
                    strokeDasharray="5 4"
                  />

                  {/* L */}

                  <line
                    x1={
                      visibleMapXMin
                    }
                    y1={
                      sy(
                        limitValue,
                      )
                    }
                    x2={
                      visibleMapXMax
                    }
                    y2={
                      sy(
                        limitValue,
                      )
                    }
                    stroke="#2563eb"
                    strokeWidth={
                      1.3
                    }
                    strokeDasharray="2 2"
                  />
                </g>
              )}

              {/* =========================================================
                  δ 邻域
                 ========================================================= */}

              {step >=
                3 &&
                delta >
                  0 && (
                  <g>
                    {/* a ± δ 区域 */}

                    <rect
                      x={
                        sx(
                          a -
                            delta,
                        )
                      }
                      y={
                        visibleMapYTop
                      }
                      width={
                        sx(
                          a +
                            delta,
                        ) -
                        sx(
                          a -
                            delta,
                        )
                      }
                      height={
                        visibleMapYBottom -
                        visibleMapYTop
                      }
                      fill="#fbbf24"
                      opacity={
                        0.1
                      }
                    />

                    {/* a - δ */}

                    <line
                      x1={
                        sx(
                          a -
                            delta,
                        )
                      }
                      y1={
                        visibleMapYTop
                      }
                      x2={
                        sx(
                          a -
                            delta,
                        )
                      }
                      y2={
                        visibleMapYBottom
                      }
                      stroke="#fcd34d"
                      strokeWidth={
                        1.2
                      }
                      strokeDasharray="5 4"
                    />

                    {/* a + δ */}

                    <line
                      x1={
                        sx(
                          a +
                            delta,
                        )
                      }
                      y1={
                        visibleMapYTop
                      }
                      x2={
                        sx(
                          a +
                            delta,
                        )
                      }
                      y2={
                        visibleMapYBottom
                      }
                      stroke="#fcd34d"
                      strokeWidth={
                        1.2
                      }
                      strokeDasharray="5 4"
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
                  验证步骤：
                  δ 邻域中的有效曲线高亮
                 ========================================================= */}

              {verificationStep &&
                validBandPoints.length >
                  1 && (
                  <path
                    d={
                      validBandPoints.join(
                        ' ',
                      )
                    }
                    fill="none"
                    stroke="#34d399"
                    strokeWidth={
                      3.2
                    }
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

              {/* =========================================================
                  目标点 (a,L)
                 ========================================================= */}

              {step >=
                1 && (
                <g>
                  <circle
                    cx={
                      sx(a)
                    }
                    cy={
                      sy(
                        limitValue,
                      )
                    }
                    r={
                      6.5
                    }
                    fill="#ffffff"
                    stroke="#2563eb"
                    strokeWidth={
                      2.5
                    }
                  />

                  <text
                    x={
                      sx(a) +
                      10
                    }
                    y={
                      sy(
                        limitValue,
                      ) -
                      10
                    }
                    fontSize={
                      13
                    }
                    fontWeight={
                      700
                    }
                    fill="#93c5fd"
                  >
                    (a, L)
                  </text>
                </g>
              )}

              {/* =========================================================
                  坐标文字
                 ========================================================= */}

              <g
                fontSize={
                  11
                }
                fill="#64748b"
              >
                <text
                  x={
                    sx(a) -
                    3
                  }
                  y={
                    sy(0) +
                    18
                  }
                  textAnchor="middle"
                >
                  a
                </text>

                <text
                  x={
                    sx(
                      domainMin,
                    ) +
                    10
                  }
                  y={
                    sy(
                      limitValue,
                    ) -
                    6
                  }
                >
                  L
                </text>

                {step >=
                  2 && (
                  <text
                    x={
                      sx(
                        domainMin,
                      ) +
                      10
                    }
                    y={
                      sy(
                        limitValue +
                          epsilon,
                      ) +
                      12
                    }
                    fontSize={
                      10
                    }
                  >
                    L+ε
                  </text>
                )}

                {step >=
                  2 && (
                  <text
                    x={
                      sx(
                        domainMin,
                      ) +
                      10
                    }
                    y={
                      sy(
                        limitValue -
                          epsilon,
                      ) -
                      4
                    }
                    fontSize={
                      10
                    }
                  >
                    L−ε
                  </text>
                )}
              </g>
            </g>
          </svg>

          {/* =============================================================
              ε−δ 数学关系浮层
             ============================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              left-3
              top-3
              z-10
              rounded-xl
              border
              border-slate-700/60
              bg-slate-900/85
              px-3.5
              py-2.5
              shadow-lg
              backdrop-blur-sm
            "
          >
            <div
              className="
                font-mono
                text-xs
                font-semibold
                text-slate-200
              "
            >
              |x−a| &lt; δ
              {' '}
              ⇒
              {' '}
              |f(x)−L| &lt; ε
            </div>
          </div>

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
                  '趋近点',

                value:
                  `a = ${a.toFixed(
                    2,
                  )}`,
              },

              {
                label:
                  '极限值',

                value:
                  `L = ${limitValue.toFixed(
                    2,
                  )}`,
              },

              {
                label:
                  '误差 ε',

                value:
                  epsilon.toFixed(
                    2,
                  ),
              },

              {
                label:
                  '可行 δ',

                value:
                  delta >
                  0
                    ? `≈ ${delta.toFixed(
                        3,
                      )}`
                    : '—',
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
                              'shadow-indigo-500/20',
                            ].join(
                              ' ',
                            )
                          : [
                              'text-gray-500',
                              'hover:bg-white/70',
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
                  py-2.5
                  text-[11px]
                  leading-5
                  text-slate-500
                "
              >
                {activeCase.desc}
              </p>
            )}

            {/* ε 参数 */}

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
                  误差 ε
                </span>

                <span
                  className="
                    font-mono
                    text-xs
                    font-semibold
                    text-indigo-600
                  "
                >
                  {epsilon.toFixed(
                    2,
                  )}
                </span>
              </div>

              <input
                type="range"
                min={
                  0.05
                }
                max={
                  0.8
                }
                step={
                  0.05
                }
                value={
                  epsilon
                }
                onChange={(
                  event,
                ) => {
                  setPlaying(false)

                  setEpsilon(
                    Number.parseFloat(
                      event.target
                        .value,
                    ),
                  )
                }}
                className="
                  w-full
                  accent-indigo-600
                "
              />

              <div
                className="
                  mt-1
                  flex
                  items-center
                  justify-between
                  text-[10px]
                  text-gray-400
                "
              >
                <span>
                  更严格
                </span>

                <span>
                  更宽松
                </span>
              </div>

              <p
                className="
                  mt-2
                  text-[11px]
                  leading-5
                  text-gray-400
                "
              >
                ε 越小，
                对函数值允许的误差越严格，
                因此可选择的 δ
                通常也会随之缩小。
              </p>
            </div>

            {/* 当前 δ */}

            <div
              className="
                mt-4
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
                当前数值搜索得到
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
                δ ≈{' '}
                {delta >
                0
                  ? delta.toFixed(
                      3,
                    )
                  : '—'}
              </div>

              <div
                className="
                  mt-1
                  text-[10px]
                  text-indigo-400
                "
              >
                δ 不唯一，
                更小的正数通常同样可行
              </div>
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

                  definitionSatisfied
                    ? [
                        'bg-emerald-50',
                        'text-emerald-600',
                      ].join(
                        ' ',
                      )
                    : verificationStep
                      ? [
                          'bg-rose-50',
                          'text-rose-500',
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
                {definitionSatisfied
                  ? '定义成立'
                  : verificationStep
                    ? '暂未找到 δ'
                    : '进行中'}
              </span>
            }
          >
            <div
              className={[
                'flex',
                'items-start',
                'gap-2.5',
                'rounded-xl',
                'border',
                'px-3.5',
                'py-3',

                definitionSatisfied
                  ? [
                      'border-emerald-100',
                      'bg-emerald-50/60',
                    ].join(
                      ' ',
                    )
                  : verificationStep
                    ? [
                        'border-rose-100',
                        'bg-rose-50/60',
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

                  definitionSatisfied
                    ? 'text-emerald-500'
                    : verificationStep
                      ? 'text-rose-400'
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
                {definitionSatisfied ? (
                  <path d="M9 12l2 2 4-4m5.2 2a9 9 0 1 1-2.6-6.4" />
                ) : verificationStep ? (
                  <>
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                    />

                    <path d="M8 8l8 8M16 8l-8 8" />
                  </>
                ) : (
                  <>
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                    />

                    <path d="M12 7v5l3 2" />
                  </>
                )}
              </svg>

              <p
                className="
                  text-[13px]
                  leading-6
                  text-gray-600
                "
              >
                {verificationStep
                  ? delta >
                    0
                    ? `取 δ ≈ ${delta.toFixed(
                        3,
                      )}，当 |x−a| < δ 时，δ 邻域中的函数曲线全部位于 L±ε 误差带中。`
                    : '当前数值搜索没有找到可行 δ，请调整 ε 或检查当前案例。'
                  : '按照底部教学步骤继续观察 ε 误差带与 δ 邻域之间的对应关系。'}
              </p>
            </div>

            {/* 逻辑关系 */}

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
                  grid
                  grid-cols-[1fr_auto_1fr]
                  items-center
                  gap-2
                  text-center
                "
              >
                <div>
                  <div
                    className="
                      text-[10px]
                      text-gray-400
                    "
                  >
                    自变量约束
                  </div>

                  <div
                    className="
                      mt-1
                      font-mono
                      text-xs
                      font-semibold
                      text-amber-600
                    "
                  >
                    |x−a| &lt; δ
                  </div>
                </div>

                <span
                  className="
                    text-gray-300
                  "
                >
                  ⇒
                </span>

                <div>
                  <div
                    className="
                      text-[10px]
                      text-gray-400
                    "
                  >
                    函数值约束
                  </div>

                  <div
                    className="
                      mt-1
                      font-mono
                      text-xs
                      font-semibold
                      text-sky-600
                    "
                  >
                    |f(x)−L| &lt; ε
                  </div>
                </div>
              </div>
            </div>
          </ExperimentCard>
        </>
      }

      // ======================================================================
      // Player
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
