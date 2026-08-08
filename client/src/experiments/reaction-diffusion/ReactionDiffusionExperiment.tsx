import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import type {
  ReactNode,
} from 'react'

import MathFormula from '../../components/MathFormula/MathFormula'

import {
  NarrationPresenter,
} from '../../components/NarrationPresenter'

import {
  useNarrationOptional,
} from '../../contexts/NarrationContext'

import ExperimentShell from '../../experiment-v2/ExperimentShell'

import {
  usePresenterHistory,
} from '../../hooks/usePresenterHistory'

import {
  reactionDiffusionNarration,
} from '../../narrations/scripts/reaction-diffusion'

import {
  createField,
  RD_PRESETS,
  renderToImageData,
  step,
} from './grayScott'

import type {
  Field,
} from './grayScott'

// ============================================================================
// Experiment V2
// ============================================================================

export const experimentV2 =
  true

// ============================================================================
// Constants
// ============================================================================

const W =
  160

const H =
  120

const Du =
  0.16

const Dv =
  0.08

const STEPS_PER_FRAME =
  8

// ============================================================================
// Sidebar Card
// ============================================================================

interface SidebarCardProps {
  title: string

  children:
    ReactNode
}

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
// Canvas Renderer
// ============================================================================

interface ReactionDiffusionCanvasProps {
  canvasRef:
    React.RefObject<HTMLCanvasElement | null>

  presetLabel:
    string

  running:
    boolean
}

function ReactionDiffusionCanvas({
  canvasRef,
  presetLabel,
  running,
}: ReactionDiffusionCanvasProps) {
  return (
    <div
      className="
        flex
        h-full
        min-h-0
        min-w-0
        flex-col
        p-3

        md:p-5
      "
    >
      {/* ====================================================================
          Status
      ==================================================================== */}

      <div
        className="
          mb-3
          flex
          shrink-0
          flex-wrap
          items-center
          justify-between
          gap-2
        "
      >
        <div
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
        >
          <span
            className={[
              'h-2',
              'w-2',
              'rounded-full',

              running
                ? 'bg-emerald-400'
                : 'bg-amber-400',
            ].join(
              ' ',
            )}
          />

          {running
            ? '模拟运行中'
            : '模拟已暂停'}
        </div>

        <div
          className="
            rounded-full
            border
            border-indigo-500/20
            bg-indigo-500/10
            px-3
            py-1.5
            text-xs
            font-semibold
            text-indigo-700
          "
        >
          {presetLabel}
        </div>
      </div>

      {/* ====================================================================
          Simulation viewport
      ==================================================================== */}

      <div
        className="
          flex
          min-h-0
          min-w-0
          flex-1
          items-center
          justify-center
          overflow-hidden
          rounded-xl
          border
          border-slate-200
          bg-black/30
          p-2

          md:p-4
        "
      >
        <canvas
          ref={
            canvasRef
          }
          width={
            W
          }
          height={
            H
          }
          className="
            block
            h-auto
            max-h-full
            w-full
            max-w-full
            rounded-lg
            border
            border-slate-200
            bg-white
            shadow-2xl
            shadow-black/30
          "
          style={{
            imageRendering:
              'pixelated',

            aspectRatio:
              `${W}/${H}`,

            objectFit:
              'contain',
          }}
        />
      </div>

      {/* ====================================================================
          Description
      ==================================================================== */}

      <div
        className="mt-3 shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-500"
      >
        两种化学物质在二维网格中持续发生扩散与反应。
        即使初始状态只有很小的扰动，也可能逐渐形成稳定的条纹、斑点或复杂空间结构。
      </div>
    </div>
  )
}

// ============================================================================
// Sidebar
// ============================================================================

interface ReactionDiffusionSidebarProps {
  presetIdx:
    number

  running:
    boolean

  onToggleRunning:
    () => void

  onReset:
    () => void

  onSelectPreset:
    (
      index: number,
    ) => void

  onStartNarration:
    () => void
}

function ReactionDiffusionSidebar({
  presetIdx,
  running,
  onToggleRunning,
  onReset,
  onSelectPreset,
  onStartNarration,
}: ReactionDiffusionSidebarProps) {
  const currentPreset =
    RD_PRESETS[
      presetIdx
    ]

  return (
    <>
      {/* ====================================================================
          Simulation controls
      ==================================================================== */}

      <SidebarCard title="模拟控制">
        <div
          className="
            grid
            grid-cols-2
            gap-2
          "
        >
          <button
            type="button"
            onClick={
              onToggleRunning
            }
            className={[
              'rounded-lg',
              'px-3',
              'py-2.5',
              'text-sm',
              'font-semibold',
              'text-white',
              'transition',

              running
                ? 'bg-rose-500 hover:bg-rose-600'
                : 'bg-emerald-500 hover:bg-emerald-600',
            ].join(
              ' ',
            )}
          >
            {running
              ? '⏸ 暂停'
              : '▶ 继续'}
          </button>

          <button
            type="button"
            onClick={
              onReset
            }
            className="
              rounded-lg
              border
              border-slate-200
              bg-slate-100
              px-3
              py-2.5
              text-sm
              font-semibold
              text-slate-700
              transition
              hover:border-indigo-200
              hover:bg-indigo-50
              hover:text-indigo-700
            "
          >
            ↺ 重新生长
          </button>
        </div>

        <div
          className="
            mt-3
            rounded-lg
            border
            border-slate-200
            bg-slate-100
            px-3
            py-2
            text-xs
            leading-5
            text-slate-500
          "
        >
          每一帧执行
          {' '}
          <strong className="text-slate-700">
            {STEPS_PER_FRAME}
          </strong>
          {' '}
          次数值迭代。
        </div>
      </SidebarCard>

      {/* ====================================================================
          Pattern presets
      ==================================================================== */}

      <SidebarCard title="图案类型">
        <div
          className="
            grid
            grid-cols-1
            gap-2
          "
        >
          {RD_PRESETS.map(
            (
              preset,
              index,
            ) => {
              const active =
                index ===
                presetIdx

              return (
                <button
                  key={
                    preset.name
                  }
                  type="button"
                  onClick={() =>
                    onSelectPreset(
                      index,
                    )
                  }
                  className={[
                    'flex',
                    'items-center',
                    'justify-between',
                    'gap-3',
                    'rounded-lg',
                    'border',
                    'px-3',
                    'py-2.5',
                    'text-left',
                    'text-sm',
                    'font-semibold',
                    'transition',

                    active
                      ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'border-slate-200 bg-slate-100 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700',
                  ].join(
                    ' ',
                  )}
                >
                  <span>
                    {
                      preset.label
                    }
                  </span>

                  {active && (
                    <span
                      className="
                        rounded-full
                        bg-white/15
                        px-2
                        py-0.5
                        text-[10px]
                        font-bold
                      "
                    >
                      当前
                    </span>
                  )}
                </button>
              )
            },
          )}
        </div>
      </SidebarCard>

      {/* ====================================================================
          Parameters
      ==================================================================== */}

      <SidebarCard title="当前参数">
        <div
          className="
            grid
            grid-cols-2
            gap-2
          "
        >
          <div
            className="
              rounded-lg
              border
              border-slate-200
              bg-slate-100
              p-3
            "
          >
            <div
              className="
                text-[11px]
                font-medium
                text-slate-500
              "
            >
              补给率 f
            </div>

            <div
              className="
                mt-1
                font-mono
                text-base
                font-bold
                text-indigo-600
              "
            >
              {
                currentPreset.feed
              }
            </div>
          </div>

          <div
            className="
              rounded-lg
              border
              border-slate-200
              bg-slate-100
              p-3
            "
          >
            <div
              className="
                text-[11px]
                font-medium
                text-slate-500
              "
            >
              消亡率 k
            </div>

            <div
              className="
                mt-1
                font-mono
                text-base
                font-bold
                text-rose-600
              "
            >
              {
                currentPreset.kill
              }
            </div>
          </div>

          <div
            className="
              rounded-lg
              border
              border-slate-200
              bg-slate-100
              p-3
            "
          >
            <div
              className="
                text-[11px]
                font-medium
                text-slate-500
              "
            >
              Dᵤ
            </div>

            <div
              className="
                mt-1
                font-mono
                text-base
                font-bold
                text-emerald-600
              "
            >
              {Du}
            </div>
          </div>

          <div
            className="
              rounded-lg
              border
              border-slate-200
              bg-slate-100
              p-3
            "
          >
            <div
              className="
                text-[11px]
                font-medium
                text-slate-500
              "
            >
              Dᵥ
            </div>

            <div
              className="
                mt-1
                font-mono
                text-base
                font-bold
                text-amber-600
              "
            >
              {Dv}
            </div>
          </div>
        </div>
      </SidebarCard>

      {/* ====================================================================
          Gray-Scott equations
      ==================================================================== */}

      <SidebarCard title="Gray-Scott 方程">
        <div
          className="
            space-y-3
            rounded-lg
            border
            border-indigo-100
            bg-indigo-50
            p-3
            text-sm
          "
        >
          <MathFormula
            formula="\frac{\partial u}{\partial t} = D_u \nabla^2 u - uv^2 + f(1-u)"
          />

          <MathFormula
            formula="\frac{\partial v}{\partial t} = D_v \nabla^2 v + uv^2 - (f+k)v"
          />
        </div>

        <p
          className="
            mt-3
            text-xs
            leading-5
            text-slate-500
          "
        >
          当补给率和消亡率发生微小变化时，
          系统最终形成的空间结构可能完全不同。
          这类反应扩散模型常用于解释形态发生与图灵斑图。
        </p>
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
          从局部化学反应、空间扩散以及参数变化三个角度观察图案如何自组织形成。
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

export default function ReactionDiffusionExperiment() {
  const [
    presetIdx,
    setPresetIdx,
  ] =
    useState(
      0,
    )

  const [
    running,
    setRunning,
  ] =
    useState(
      true,
    )

  const canvasRef =
    useRef<HTMLCanvasElement>(
      null,
    )

  const fieldRef =
    useRef<Field>(
      createField(
        W,
        H,
      ),
    )

  const presetRef =
    useRef(
      RD_PRESETS[
        0
      ],
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
          reactionDiffusionNarration,
        )
      }
    },
    [
      narration,
    ],
  )

  // ==========================================================================
  // Reset simulation
  // ==========================================================================

  const reset =
    useCallback(
      (
        index:
          number,
      ) => {
        presetRef.current =
          RD_PRESETS[
            index
          ]

        fieldRef.current =
          createField(
            W,
            H,
          )
      },
      [],
    )

  // ==========================================================================
  // Simulation + Canvas rendering loop
  // ==========================================================================

  useEffect(
    () => {
      const canvas =
        canvasRef.current

      if (
        !canvas
      ) {
        return
      }

      const context =
        canvas.getContext(
          '2d',
        )

      if (
        !context
      ) {
        return
      }

      const image =
        context.createImageData(
          W,
          H,
        )

      let animationFrame =
        0

      const loop =
        () => {
          if (
            running
          ) {
            const parameters = {
              Du,

              Dv,

              feed:
                presetRef
                  .current
                  .feed,

              kill:
                presetRef
                  .current
                  .kill,
            }

            for (
              let index =
                0;
              index <
              STEPS_PER_FRAME;
              index +=
                1
            ) {
              fieldRef.current =
                step(
                  fieldRef.current,
                  parameters,
                )
            }
          }

          renderToImageData(
            fieldRef.current,
            image.data,
          )

          context.putImageData(
            image,
            0,
            0,
          )

          animationFrame =
            window.requestAnimationFrame(
              loop,
            )
        }

      animationFrame =
        window.requestAnimationFrame(
          loop,
        )

      return () => {
        window.cancelAnimationFrame(
          animationFrame,
        )
      }
    },
    [
      running,
    ],
  )

  // ==========================================================================
  // Preset
  // ==========================================================================

  const currentPreset =
    RD_PRESETS[
      presetIdx
    ]

  const selectPreset =
    (
      index:
        number,
    ) => {
      setPresetIdx(
        index,
      )

      reset(
        index,
      )
    }

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
          '偏微分方程与复杂系统',
          '反应扩散与图灵斑图',
        ]}
        title="反应扩散与图灵斑图"
        subtitle="使用 Gray-Scott 反应扩散模型观察局部化学反应如何在空间中自组织形成稳定图案。"
        legend={[
          {
            label:
              'Gray-Scott Field',

            color:
              '#818cf8',
          },

          {
            label:
              running
                ? '模拟运行中'
                : '模拟已暂停',

            color:
              running
                ? '#34d399'
                : '#fbbf24',
          },
        ]}
        canvas={
          <ReactionDiffusionCanvas
            canvasRef={
              canvasRef
            }
            presetLabel={
              currentPreset.label
            }
            running={
              running
            }
          />
        }
        sidebar={
          <ReactionDiffusionSidebar
            presetIdx={
              presetIdx
            }
            running={
              running
            }
            onToggleRunning={() =>
              setRunning(
                (
                  current,
                ) =>
                  !current,
              )
            }
            onReset={() =>
              reset(
                presetIdx,
              )
            }
            onSelectPreset={
              selectPreset
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
