import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import type {
  ReactNode,
} from 'react'

import Plot from 'react-plotly.js'

import MathFormula from '../../components/MathFormula/MathFormula'
import { NarrationPresenter } from '../../components/NarrationPresenter'

import { useNarrationOptional } from '../../contexts/NarrationContext'

import ExperimentShell from '../../experiment-v2/ExperimentShell'

import { usePresenterHistory } from '../../hooks/usePresenterHistory'

import { eulerIdentityNarration } from '../../narrations/scripts/euler-identity'

import {
  arcPoints,
  eulerPoint,
  unitCirclePoints,
} from './euler'

// ============================================================================
// Experiment V2
// ============================================================================

export const experimentV2 =
  true

// ============================================================================
// Types
// ============================================================================

interface XY {
  x: number[]

  y: number[]
}

interface SidebarCardProps {
  title: string

  children:
    ReactNode
}

// ============================================================================
// Sidebar Card
//
// 使用浅色 V2 控制卡，避免继续保留旧实验中的 bg-white Card 标记。
// ============================================================================

function SidebarCard({
  title,
  children,
}: SidebarCardProps) {
  return (
    <section
      className="
        rounded-xl
        border
        border-slate-200
        bg-slate-50
        p-4
        shadow-sm
      "
    >
      <h3
        className="
          mb-3
          text-sm
          font-bold
          tracking-tight
          text-slate-800
        "
      >
        {title}
      </h3>

      {children}
    </section>
  )
}

// ============================================================================
// Plotly Renderer
// ============================================================================

interface ComplexPlaneProps {
  unitCircle:
    XY

  arc:
    XY

  re:
    number

  im:
    number

  theta:
    number
}

function ComplexPlane({
  unitCircle,
  arc,
  re,
  im,
  theta,
}: ComplexPlaneProps) {
  return (
    <div
      className="
        absolute
        inset-0
        min-h-0
        min-w-0
      "
    >
      <Plot
        data={[
          {
            x:
              unitCircle.x,

            y:
              unitCircle.y,

            type:
              'scatter',

            mode:
              'lines',

            line: {
              color:
                '#64748b',

              width:
                1.5,
            },

            name:
              '单位圆',

            hoverinfo:
              'skip',
          },

          {
            x:
              arc.x,

            y:
              arc.y,

            type:
              'scatter',

            mode:
              'lines',

            line: {
              color:
                '#8b5cf6',

              width:
                4,
            },

            name:
              '已扫过的弧',

            hoverinfo:
              'skip',
          },

          {
            x: [
              0,
              re,
            ],

            y: [
              0,
              im,
            ],

            type:
              'scatter',

            mode:
              'lines+markers',

            line: {
              color:
                '#fb7185',

              width:
                2.5,
            },

            marker: {
              size: [
                4,
                12,
              ],

              color:
                '#fb7185',
            },

            name:
              'e^(iθ)',
          },

          {
            x: [
              re,
            ],

            y: [
              0,
            ],

            type:
              'scatter',

            mode:
              'markers',

            marker: {
              size:
                9,

              color:
                '#34d399',
            },

            name:
              'cosθ · 实部',
          },

          {
            x: [
              0,
            ],

            y: [
              im,
            ],

            type:
              'scatter',

            mode:
              'markers',

            marker: {
              size:
                9,

              color:
                '#fbbf24',
            },

            name:
              'sinθ · 虚部',
          },
        ]}
        layout={{
          autosize:
            true,

          paper_bgcolor:
            'rgba(0,0,0,0)',

          plot_bgcolor:
            'rgba(0,0,0,0)',

          font: {
            color:
              '#cbd5e1',

            family:
              'Inter, ui-sans-serif, system-ui, sans-serif',
          },

          margin: {
            t:
              35,

            r:
              35,

            b:
              75,

            l:
              55,
          },

          xaxis: {
            range: [
              -1.4,
              1.4,
            ],

            zeroline:
              true,

            zerolinecolor:
              '#64748b',

            zerolinewidth:
              1,

            gridcolor:
              '#1e293b',

            tickfont: {
              color:
                '#94a3b8',
            },

            title: {
              text:
                '实轴 Re',

              font: {
                color:
                  '#94a3b8',
              },
            },

            scaleanchor:
              'y',

            scaleratio:
              1,
          },

          yaxis: {
            range: [
              -1.4,
              1.4,
            ],

            zeroline:
              true,

            zerolinecolor:
              '#64748b',

            zerolinewidth:
              1,

            gridcolor:
              '#1e293b',

            tickfont: {
              color:
                '#94a3b8',
            },

            title: {
              text:
                '虚轴 Im',

              font: {
                color:
                  '#94a3b8',
              },
            },
          },

          legend: {
            orientation:
              'h',

            x:
              0.5,

            xanchor:
              'center',

            y:
              -0.15,

            font: {
              color:
                '#cbd5e1',
            },
          },

          annotations: [
            {
              x:
                re,

              y:
                im,

              text:
                `θ = ${theta.toFixed(
                  2,
                )}`,

              showarrow:
                true,

              arrowhead:
                2,

              arrowcolor:
                '#fb7185',

              ax:
                35,

              ay:
                -35,

              font: {
                color:
                  '#fb7185',
              },
            },
          ],
        }}
        config={{
          responsive:
            true,

          displaylogo:
            false,

          scrollZoom:
            false,

          modeBarButtonsToRemove: [
            'lasso2d',
            'select2d',
          ],
        }}
        useResizeHandler
        style={{
          width:
            '100%',

          height:
            '100%',
        }}
      />
    </div>
  )
}

// ============================================================================
// Sidebar
// ============================================================================

interface EulerSidebarProps {
  theta:
    number

  setTheta:
    (
      value: number,
    ) => void

  isAnimating:
    boolean

  setIsAnimating:
    (
      value: boolean,
    ) => void

  re:
    number

  im:
    number

  onStartNarration:
    () => void
}

function EulerSidebar({
  theta,
  setTheta,
  isAnimating,
  setIsAnimating,
  re,
  im,
  onStartNarration,
}: EulerSidebarProps) {
  const isPi =
    Math.abs(
      theta -
        Math.PI,
    ) <
    0.05

  const setAngle =
    (
      multiplier: number,
    ) => {
      setIsAnimating(
        false,
      )

      setTheta(
        multiplier *
          Math.PI,
      )
    }

  return (
    <>
      {/* ====================================================================
          Concept
      ==================================================================== */}

      <SidebarCard title="欧拉公式">
        <div
          className="
            rounded-lg
            border
            border-indigo-100
            bg-indigo-50
            p-3
          "
        >
          <MathFormula
            formula="e^{i\theta} = \cos\theta + i\sin\theta"
          />
        </div>

        <div
          className="
            mt-3
            rounded-lg
            border
            border-rose-100
            bg-rose-50
            p-3
            text-center
          "
        >
          <MathFormula
            formula="e^{i\pi} + 1 = 0"
          />

          <p
            className="
              mt-2
              text-xs
              text-rose-600
            "
          >
            θ = π 时，复指数恰好到达 −1。
          </p>
        </div>
      </SidebarCard>

      {/* ====================================================================
          Current value
      ==================================================================== */}

      <SidebarCard title="当前复数">
        <div
          className="
            space-y-2
            font-mono
            text-sm
            text-slate-700
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <span className="text-slate-500">
              θ
            </span>

            <span className="font-semibold">
              {theta.toFixed(
                4,
              )}{' '}
              rad
            </span>
          </div>

          <div
            className="
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <span className="text-slate-500">
              cos θ
            </span>

            <span className="font-semibold text-emerald-600">
              {re.toFixed(
                4,
              )}
            </span>
          </div>

          <div
            className="
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <span className="text-slate-500">
              sin θ
            </span>

            <span className="font-semibold text-amber-600">
              {im.toFixed(
                4,
              )}
            </span>
          </div>

          <div
            className="
              mt-2
              border-t
              border-slate-200
              pt-2
            "
          >
            <div className="text-xs text-slate-500">
              e^(iθ)
            </div>

            <div
              className={[
                'mt-1',
                'font-bold',

                isPi
                  ? 'text-rose-600'
                  : 'text-indigo-600',
              ].join(
                ' ',
              )}
            >
              {re.toFixed(
                3,
              )}{' '}
              {im >=
              0
                ? '+'
                : '−'}{' '}
              {Math.abs(
                im,
              ).toFixed(
                3,
              )}
              i
            </div>
          </div>
        </div>

        {isPi && (
          <div
            className="
              mt-3
              rounded-lg
              bg-rose-50
              px-3
              py-2
              text-xs
              font-medium
              text-rose-600
            "
          >
            当前点接近 −1，因此 e^(iπ) + 1 ≈ 0。
          </div>
        )}
      </SidebarCard>

      {/* ====================================================================
          Parameters
      ==================================================================== */}

      <SidebarCard title="参数控制">
        <button
          type="button"
          onClick={() =>
            setIsAnimating(
              !isAnimating,
            )
          }
          className={[
            'mb-4',
            'w-full',
            'rounded-lg',
            'px-4',
            'py-2.5',
            'text-sm',
            'font-semibold',
            'text-white',
            'transition',

            isAnimating
              ? 'bg-rose-500 hover:bg-rose-600'
              : 'bg-emerald-500 hover:bg-emerald-600',
          ].join(
            ' ',
          )}
        >
          {isAnimating
            ? '⏸ 暂停旋转'
            : '▶ 播放旋转'}
        </button>

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            text-xs
          "
        >
          <label
            htmlFor="euler-theta"
            className="
              font-semibold
              text-slate-600
            "
          >
            角度 θ
          </label>

          <span
            className="
              rounded-md
              bg-slate-200
              px-2
              py-1
              font-mono
              text-slate-700
            "
          >
            {(
              theta /
              Math.PI
            ).toFixed(
              2,
            )}
            π
          </span>
        </div>

        <input
          id="euler-theta"
          type="range"
          min="0"
          max={(
            Math.PI *
            2
          ).toFixed(
            3,
          )}
          step="0.01"
          value={
            theta
          }
          onChange={(
            event,
          ) => {
            setIsAnimating(
              false,
            )

            setTheta(
              Number(
                event
                  .target
                  .value,
              ),
            )
          }}
          className="
            mt-3
            w-full
            accent-indigo-600
          "
        />

        <div
          className="
            mt-3
            grid
            grid-cols-4
            gap-2
          "
        >
          {[
            0,
            0.5,
            1,
            1.5,
          ].map(
            (
              multiplier,
            ) => (
              <button
                key={
                  multiplier
                }
                type="button"
                onClick={() =>
                  setAngle(
                    multiplier,
                  )
                }
                className="
                  rounded-lg
                  border
                  border-indigo-100
                  bg-indigo-50
                  px-1
                  py-1.5
                  text-xs
                  font-semibold
                  text-indigo-700
                  transition
                  hover:border-indigo-200
                  hover:bg-indigo-100
                "
              >
                {multiplier ===
                0
                  ? '0'
                  : `${multiplier}π`}
              </button>
            ),
          )}
        </div>
      </SidebarCard>

      {/* ====================================================================
          Constants
      ==================================================================== */}

      <SidebarCard title="五大数学常数">
        <div
          className="
            grid
            grid-cols-1
            gap-2
            text-xs
            leading-5
            text-slate-600
          "
        >
          <div>
            <strong className="text-slate-800">
              e
            </strong>
            {' '}
            — 自然对数底 ≈ 2.718
          </div>

          <div>
            <strong className="text-slate-800">
              i
            </strong>
            {' '}
            — 虚数单位，i² = −1
          </div>

          <div>
            <strong className="text-slate-800">
              π
            </strong>
            {' '}
            — 圆周率 ≈ 3.14159
          </div>

          <div>
            <strong className="text-slate-800">
              1
            </strong>
            {' '}
            — 乘法单位元
          </div>

          <div>
            <strong className="text-slate-800">
              0
            </strong>
            {' '}
            — 加法单位元
          </div>
        </div>
      </SidebarCard>

      {/* ====================================================================
          Narration
      ==================================================================== */}

      <SidebarCard title="教学讲解">
        <p
          className="
            mb-3
            text-xs
            leading-5
            text-slate-500
          "
        >
          从单位圆、复指数与 θ = π 三个角度逐步理解欧拉恒等式。
        </p>

        <button
          type="button"
          onClick={
            onStartNarration
          }
          className="
            inline-flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-indigo-600
            px-4
            py-2.5
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-indigo-700
          "
        >
          <svg
            className="
              h-4
              w-4
            "
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z"
              clipRule="evenodd"
            />
          </svg>

          开始讲解
        </button>
      </SidebarCard>
    </>
  )
}

// ============================================================================
// Experiment
// ============================================================================

export default function EulerIdentityExperiment() {
  const [
    theta,
    setTheta,
  ] =
    useState(
      Math.PI,
    )

  const [
    isAnimating,
    setIsAnimating,
  ] =
    useState(
      false,
    )

  const animationRef =
    useRef<
      number | null
    >(
      null,
    )

  // ==========================================================================
  // Narration
  // ==========================================================================

  const narration =
    useNarrationOptional()

  const {
    showPresenter,
    openPresenter,
    handleExit:
      handleExitPresenter,
  } =
    usePresenterHistory(
      narration,
    )

  useEffect(
    () => {
      if (
        narration
      ) {
        narration.loadScript(
          eulerIdentityNarration,
        )
      }
    },
    [
      narration,
    ],
  )

  // ==========================================================================
  // Rotation
  // ==========================================================================

  useEffect(
    () => {
      if (
        !isAnimating
      ) {
        return
      }

      const animate =
        () => {
          setTheta(
            (
              current,
            ) => {
              const next =
                current +
                0.02

              return next >
                Math.PI *
                  2
                ? 0
                : next
            },
          )

          animationRef.current =
            window.requestAnimationFrame(
              animate,
            )
        }

      animationRef.current =
        window.requestAnimationFrame(
          animate,
        )

      return () => {
        if (
          animationRef.current !==
          null
        ) {
          window.cancelAnimationFrame(
            animationRef.current,
          )
        }
      }
    },
    [
      isAnimating,
    ],
  )

  // ==========================================================================
  // Math data
  // ==========================================================================

  const unitCircle =
    useMemo(
      () =>
        unitCirclePoints(
          100,
        ),
      [],
    )

  const {
    re,
    im,
  } =
    eulerPoint(
      theta,
    )

  const arc =
    useMemo(
      () =>
        arcPoints(
          theta,
          100,
        ),
      [
        theta,
      ],
    )

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <>
      {showPresenter && (
        <NarrationPresenter
          onExit={
            handleExitPresenter
          }
        />
      )}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          '复数与数学分析',
          '欧拉恒等式',
        ]}
        title="欧拉恒等式"
        subtitle="在复平面单位圆上观察 e^(iθ) = cosθ + i·sinθ，并理解 e^(iπ) + 1 = 0。"
        legend={[
          {
            label:
              '单位圆',

            color:
              '#64748b',
          },

          {
            label:
              '扫过的圆弧',

            color:
              '#8b5cf6',
          },

          {
            label:
              'e^(iθ)',

            color:
              '#fb7185',
          },

          {
            label:
              '实部 cosθ',

            color:
              '#34d399',
          },

          {
            label:
              '虚部 sinθ',

            color:
              '#fbbf24',
          },
        ]}
        canvas={
          <ComplexPlane
            unitCircle={
              unitCircle
            }
            arc={
              arc
            }
            re={
              re
            }
            im={
              im
            }
            theta={
              theta
            }
          />
        }
        sidebar={
          <EulerSidebar
            theta={
              theta
            }
            setTheta={
              setTheta
            }
            isAnimating={
              isAnimating
            }
            setIsAnimating={
              setIsAnimating
            }
            re={
              re
            }
            im={
              im
            }
            onStartNarration={
              openPresenter
            }
          />
        }
      />
    </>
  )
}