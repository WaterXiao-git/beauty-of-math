// ============================================================================
// 罗尔定理数学 Renderer
//
// 职责：
//
// - 绘制函数曲线
// - 绘制端点 A / B
// - 绘制中值点 ξ
// - 绘制辅助线
// - 模拟连续 / 可导 / 端点等高条件
// - SVG 平移与缩放
// - 显示数学公式
// - 显示动态数据
//
// 不再负责：
//
// - 页面标题
// - 页面图例
// - 深色 section 外壳
// - 页面左右布局
// - Sidebar
// - PlayerBar
//
// 这些全部由 ExperimentShell 统一负责。
// ============================================================================

import MathFormula from '../components/MathFormula/MathFormula'

import {
  usePanZoom,
} from './usePanZoom'

import {
  calcViewportGrid,
} from './viewport'

import type {
  RolleCase,
} from './rolleData'

// ============================================================================
// 定理条件状态
// ============================================================================

export interface Conditions {
  /**
   * 是否满足：
   *
   * f(x) 在 [a,b] 上连续。
   */
  continuous: boolean

  /**
   * 是否满足：
   *
   * f(x) 在 (a,b) 内可导。
   */
  differentiable: boolean

  /**
   * 是否满足：
   *
   * f(a) = f(b)
   */
  equalEndpoints: boolean
}

// ============================================================================
// Props
// ============================================================================

interface RolleCanvasProps {
  /**
   * 当前函数案例。
   */
  case: RolleCase

  /**
   * 当前定理条件状态。
   */
  conditions: Conditions

  /**
   * 当前教学步骤。
   *
   * 一般：
   *
   * 1. 观察端点
   * 2. 验证等高
   * 3. 搜索中值点
   * 4. 验证结论
   */
  step: number

  /**
   * 是否锁定中值点 ξ。
   */
  xiLocked: boolean

  /**
   * 切换 ξ 锁定状态。
   */
  onToggleXiLock: () => void
}

// ============================================================================
// SVG 基础尺寸
// ============================================================================

const W = 720
const H = 400

const PAD_L = 62
const PAD_R = 40
const PAD_T = 44
const PAD_B = 52

// ============================================================================
// Renderer
// ============================================================================

export default function RolleCanvas({
  case: currentCase,
  conditions,
  step,
  xiLocked,
  onToggleXiLock,
}: RolleCanvasProps) {
  // ==========================================================================
  // 平移 / 缩放
  // ==========================================================================

  const {
    transform,
    handlers,
  } = usePanZoom()

  // ==========================================================================
  // 当前案例范围
  // ==========================================================================

  const [
    a,
    b,
  ] =
    currentCase.domain

  const [
    yMin,
    yMax,
  ] =
    currentCase.yRange

  /**
   * 用于模拟：
   *
   * - 连续性破坏
   * - 可导性破坏
   *
   * 的中央位置。
   */
  const breakX =
    (a + b) / 2

  // ==========================================================================
  // 罗尔定理条件
  // ==========================================================================

  const allSatisfied =
    conditions.continuous &&
    conditions.differentiable &&
    conditions.equalEndpoints

  // ==========================================================================
  // 坐标映射
  // ==========================================================================

  /**
   * 世界坐标 x
   * ->
   * SVG 坐标 x
   */
  const sx = (
    x: number,
  ) =>
    PAD_L +
    ((x - a) /
      (b - a)) *
      (
        W -
        PAD_L -
        PAD_R
      )

  /**
   * 世界坐标 y
   * ->
   * SVG 坐标 y
   */
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

  // ==========================================================================
  // 无限视口网格
  // ==========================================================================

  const grid =
    calcViewportGrid(
      transform,
      W,
      H,
      [
        a,
        b,
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

  const SAMPLE_COUNT =
    120

  /**
   * 如果 continuous = false，
   * 在中间制造一个小断口。
   */
  const gapWidth =
    conditions.continuous
      ? 0
      : (b - a) / 60

  const leftPoints:
    Array<{
      x: number
      y: number
    }> = []

  const rightPoints:
    Array<{
      x: number
      y: number
    }> = []

  for (
    let index = 0;
    index <=
    SAMPLE_COUNT;
    index += 1
  ) {
    const x =
      a +
      ((b - a) *
        index) /
        SAMPLE_COUNT

    const y =
      currentCase.fn(
        x,
      )

    if (
      !Number.isFinite(
        y,
      )
    ) {
      continue
    }

    /**
     * 连续性关闭后，
     * 中心位置不绘制，
     * 制造断点。
     */
    if (
      !conditions.continuous &&
      Math.abs(
        x - breakX,
      ) < gapWidth
    ) {
      continue
    }

    if (
      x < breakX
    ) {
      leftPoints.push({
        x,
        y,
      })
    } else {
      rightPoints.push({
        x,
        y,
      })
    }
  }

  /**
   * 将采样点转换为 SVG path。
   *
   * 每个独立路径第一个点始终使用 M，
   * 防止曲线因为从 L 开始而无法正确绘制。
   */
  const createPath = (
    points: Array<{
      x: number
      y: number
    }>,
  ) =>
    points
      .map(
        (
          point,
          index,
        ) => {
          const command =
            index === 0
              ? 'M'
              : 'L'

          return (
            `${command}` +
            `${sx(
              point.x,
            ).toFixed(
              1,
            )} ` +
            `${sy(
              point.y,
            ).toFixed(
              1,
            )}`
          )
        },
      )
      .join(' ')

  const curveLeft =
    createPath(
      leftPoints,
    )

  const curveRight =
    createPath(
      rightPoints,
    )

  // ==========================================================================
  // 数学关键值
  // ==========================================================================

  const fa =
    currentCase.fn(a)

  const fb =
    currentCase.fn(b)

  const xi =
    currentCase.xi

  const fXi =
    xi != null
      ? currentCase.fn(
          xi,
        )
      : 0

  // ==========================================================================
  // 当前步骤控制
  // ==========================================================================

  /**
   * 第 2 步后显示：
   *
   * f(a) = f(b)
   *
   * 对应的水平辅助线。
   */
  const showEqualLine =
    conditions.equalEndpoints &&
    step >= 2

  /**
   * 第 3 步开始显示中值点 ξ。
   *
   * 必须满足全部罗尔条件。
   */
  const showXi =
    xi != null &&
    allSatisfied &&
    step >= 3

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div
      className="
        relative
        h-full
        min-h-[420px]
        w-full
        overflow-hidden
      "
    >
      {/* ===================================================================
          SVG 主数学画布
         =================================================================== */}

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="
          h-full
          min-h-[420px]
          w-full
          cursor-grab
          select-none

          active:cursor-grabbing
        "
        aria-label="罗尔定理交互式函数图像"
        {...handlers}
      >
        {/* ===============================================================
            无限网格
           =============================================================== */}

        {grid.verts.map(
          (
            vertical,
            index,
          ) => (
            <line
              key={`vertical-${index}`}
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
              key={`horizontal-${index}`}
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

        {/* ===============================================================
            坐标轴
           =============================================================== */}

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

        {/* ===============================================================
            世界坐标变换
           =============================================================== */}

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
          {/* =============================================================
              f(a) = f(b) 水平辅助线
             ============================================================= */}

          {showEqualLine && (
            <line
              x1={sx(a)}
              y1={sy(fa)}
              x2={sx(b)}
              y2={sy(fa)}
              stroke="#94a3b8"
              strokeWidth={
                1.4
              }
              strokeDasharray="7 5"
            />
          )}

          {/* =============================================================
              ξ 点水平切线
             ============================================================= */}

          {showXi && (
            <line
              x1={sx(a)}
              y1={sy(fXi)}
              x2={sx(b)}
              y2={sy(fXi)}
              stroke="#f472b6"
              strokeWidth={
                2
              }
            />
          )}

          {/* =============================================================
              函数曲线
             ============================================================= */}

          {curveLeft && (
            <path
              d={
                curveLeft
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

          {curveRight && (
            <path
              d={
                curveRight
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

          {/* =============================================================
              连续性破坏
             ============================================================= */}

          {!conditions.continuous && (
            <circle
              cx={
                sx(
                  breakX,
                )
              }
              cy={
                sy(
                  currentCase.fn(
                    breakX,
                  ),
                )
              }
              r={5}
              fill="#0f172a"
              stroke="#60a5fa"
              strokeWidth={
                2
              }
            />
          )}

          {/* =============================================================
              可导性破坏
             ============================================================= */}

          {!conditions.differentiable && (
            <path
              d={
                `M${
                  sx(
                    breakX,
                  ) - 6
                },${
                  sy(
                    currentCase.fn(
                      breakX,
                    ),
                  )
                } ` +
                'l6,-8 ' +
                'l6,8 ' +
                'l-6,8 z'
              }
              fill="#fbbf24"
              opacity={
                0.9
              }
            />
          )}

          {/* =============================================================
              端点 A / B
             ============================================================= */}

          {step >= 1 && (
            <g>
              <circle
                cx={sx(a)}
                cy={sy(fa)}
                r={6}
                fill="#60a5fa"
                stroke="#0f172a"
                strokeWidth={
                  2
                }
              />

              <circle
                cx={sx(b)}
                cy={sy(fb)}
                r={6}
                fill="#60a5fa"
                stroke="#0f172a"
                strokeWidth={
                  2
                }
              />

              <text
                x={
                  sx(a) -
                  14
                }
                y={
                  sy(fa) -
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
                A
              </text>

              <text
                x={
                  sx(b) +
                  6
                }
                y={
                  sy(fb) -
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
                B
              </text>
            </g>
          )}

          {/* =============================================================
              中值点 ξ
             ============================================================= */}

          {showXi &&
            xi != null && (
            <g>
              <circle
                cx={
                  sx(xi)
                }
                cy={
                  sy(fXi)
                }
                r={
                  xiLocked ||
                  step >= 4
                    ? 9
                    : 7
                }
                fill="#c084fc"
                stroke="#34d399"
                strokeWidth={
                  2.4
                }
              />

              <text
                x={
                  sx(xi) +
                  12
                }
                y={
                  sy(fXi) +
                  4
                }
                fontSize={
                  13
                }
                fontWeight={
                  700
                }
                fill="#e9d5ff"
              >
                ξ
              </text>
            </g>
          )}

          {/* =============================================================
              坐标标签
             ============================================================= */}

          <g
            fontSize={
              11
            }
            fill="#64748b"
          >
            <text
              x={
                sx(a) -
                4
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
                sx(b) -
                4
              }
              y={
                sy(0) +
                18
              }
              textAnchor="middle"
            >
              b
            </text>

            <text
              x={
                sx(0) +
                6
              }
              y={
                sy(0) -
                6
              }
            >
              0
            </text>
          </g>
        </g>
      </svg>

      {/* ===================================================================
          数学公式浮层
         =================================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-3
          top-3
          z-10
          max-w-[calc(100%-1.5rem)]
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
        <MathFormula
          formula={
            "f(a)=f(b) \\Rightarrow \\exists \\xi \\in (a,b),\\; f'(\\xi)=0"
          }
          displayMode={
            false
          }
          className="
            whitespace-nowrap
            text-white
            [&_.katex]:text-white
          "
        />
      </div>

      {/* ===================================================================
          ξ 锁定按钮
         =================================================================== */}

      <button
        type="button"
        onClick={
          onToggleXiLock
        }
        disabled={
          !showXi
        }
        className={[
          'absolute',
          'right-3',
          'top-3',
          'z-20',
          'h-8',
          'rounded-lg',
          'border',
          'px-3',
          'text-xs',
          'font-medium',
          'backdrop-blur-sm',
          'transition-all',

          !showXi
            ? [
                'cursor-not-allowed',
                'border-slate-800',
                'bg-slate-900/50',
                'text-slate-600',
              ].join(
                ' ',
              )
            : xiLocked
              ? [
                  'border-indigo-400',
                  'bg-indigo-600/80',
                  'text-white',
                  'shadow-md',
                  'shadow-indigo-500/20',
                ].join(
                  ' ',
                )
              : [
                  'border-slate-700',
                  'bg-slate-900/70',
                  'text-slate-300',
                  'hover:border-slate-500',
                  'hover:bg-slate-800/90',
                  'hover:text-white',
                ].join(
                  ' ',
                ),
        ].join(' ')}
        title={
          showXi
            ? xiLocked
              ? '解除中值点锁定'
              : '锁定当前中值点'
            : '当前步骤尚未找到中值点'
        }
      >
        {!showXi
          ? 'ξ 尚未出现'
          : xiLocked
            ? '🔒 已锁定 ξ'
            : '锁定 ξ'}
      </button>

      {/* ===================================================================
          动态数据面板
         =================================================================== */}

      <div
        className="
          absolute
          bottom-3
          left-3
          right-3
          z-10
          flex
          flex-wrap
          items-end
          gap-2
          pointer-events-none
        "
      >
        {[
          {
            label:
              '左端点',

            value:
              `a = ${a.toFixed(
                2,
              )}`,
          },

          {
            label:
              '右端点',

            value:
              `b = ${b.toFixed(
                2,
              )}`,
          },

          {
            label:
              '函数值',

            value:
              conditions.equalEndpoints
                ? `f(a)=f(b)=${fa.toFixed(
                    2,
                  )}`
                : `f(a)=${fa.toFixed(
                    2,
                  )} ≠ f(b)=${fb.toFixed(
                    2,
                  )}`,
          },

          {
            label:
              '中值点',

            value:
              showXi &&
              xi != null
                ? `ξ = ${xi.toFixed(
                    2,
                  )}`
                : '—',
          },

          {
            label:
              "f′(ξ)",

            value:
              showXi
                ? '0'
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
                {item.label}
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
                {item.value}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  )
}
