import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import type {
  ReactNode,
} from 'react'

import DemoHeader from '../demo/DemoHeader'

import ContextAssistant from '../demo/ContextAssistant'

import {
  captureVisibleScreen,
  toggleDocumentFullscreen,
} from '../demo/screenCapture'

import PlayerBar from '../demo/PlayerBar'

import type {
  StepItem,
} from '../demo/PlayerBar'

// ============================================================================
// Types
// ============================================================================

/**
 * 实验顶部图例。
 *
 * 示例：
 *
 * [
 *   { label: '函数曲线', color: '#60a5fa' },
 *   { label: 'ε 误差带', color: '#7dd3fc' },
 * ]
 */
export interface ExperimentLegendItem {
  label: string

  color: string
}

/**
 * 底部教学步骤播放器配置。
 *
 * 如果实验拥有真正和数学状态绑定的步骤，
 * 只有实验拥有和数学状态绑定的真实步骤时才传入此配置。
 */
export interface ExperimentPlayerConfig {
  steps: StepItem[]

  step: number

  playing: boolean

  onPrev: () => void

  onNext: () => void

  onTogglePlay: () => void

  onReset: () => void
}

interface ExperimentShellProps {
  /**
   * 顶部面包屑。
   */
  breadcrumb: string[]

  /**
   * 当前实验标题。
   */
  title: string

  /**
   * 当前实验副标题。
   */
  subtitle?: string

  /**
   * 画布顶部图例。
   */
  legend?: ExperimentLegendItem[]

  /**
   * 左侧主实验区域。
   *
   * Plotly / SVG / Canvas / WebGL
   * 都放在这里。
   */
  canvas: ReactNode

  /**
   * 右侧控制区域。
   */
  sidebar?: ReactNode

  /**
   * 底部教学播放器。
   *
   * ExperimentPlayerConfig：
   *   使用实验自己的专用播放器。
   *
   * undefined / false：
   *   不展示底部播放器。
   */
  player?: ExperimentPlayerConfig | false

  /**
   * 面包屑点击事件。
   */
  onBreadcrumbClick?: (
    index: number,
  ) => void

  /**
   * 左侧画布额外 class。
   */
  canvasClassName?: string

  /**
   * 是否让画布内容自行滚动。
   *
   * true：
   *   适合兼容旧实验。
   *
   * false：
   *   适合已经迁移完成的 Renderer。
   */
  canvasScrollable?: boolean
}

// ============================================================================
// ExperimentShell
// ============================================================================

export default function ExperimentShell({
  breadcrumb,
  title,
  subtitle,
  legend = [],
  canvas,
  sidebar,
  player,
  onBreadcrumbClick,
  canvasClassName = '',
  canvasScrollable = false,
}: ExperimentShellProps) {
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [captureMode, setCaptureMode] = useState(false)
  const [captureControlsHidden, setCaptureControlsHidden] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [workspaceError, setWorkspaceError] = useState('')

  const closeAssistant = useCallback(
    () => setAssistantOpen(false),
    [],
  )

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const handleToggleFullscreen = async () => {
    setWorkspaceError('')
    try {
      await toggleDocumentFullscreen()
    } catch (error) {
      setWorkspaceError(error instanceof Error ? error.message : '当前浏览器无法切换全屏。')
    }
  }

  const handleCapture = async () => {
    setWorkspaceError('')
    setCaptureControlsHidden(true)
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()))

    try {
      await captureVisibleScreen()
    } catch (error) {
      setWorkspaceError(error instanceof Error ? error.message : '截图已取消或当前浏览器不支持。')
    } finally {
      setCaptureControlsHidden(false)
    }
  }

  const resolvedPlayer:
    ExperimentPlayerConfig | null =
    player || null

  // ==========================================================================
  // Current Step
  // ==========================================================================

  const currentStep =
    resolvedPlayer &&
    resolvedPlayer
      .steps
      .length >
      0
      ? resolvedPlayer
          .steps[
          Math.max(
            0,
            Math.min(
              resolvedPlayer
                .step -
                1,

              resolvedPlayer
                .steps
                .length -
                1,
            ),
          )
        ]
      : undefined

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div
      className="
        experiment-v2-theme
        flex
        h-screen
        min-h-0
        flex-col
        overflow-hidden
        bg-slate-100
      "
    >
      {/* ====================================================================
          顶部统一导航
      ==================================================================== */}

      {!captureMode && (
        <DemoHeader
          breadcrumb={
            breadcrumb
          }
          onBreadcrumbClick={
            onBreadcrumbClick
          }
          onOpenAssistant={() =>
            setAssistantOpen(true)
          }
          onEnterCaptureMode={() =>
            setCaptureMode(true)
          }
          fullscreen={
            fullscreen
          }
          onToggleFullscreen={
            handleToggleFullscreen
          }
        />
      )}

      {captureMode && !captureControlsHidden && (
        <div className="fixed right-4 top-4 z-[70] flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur">
          <button type="button" onClick={() => void handleCapture()} className="h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">保存 PNG</button>
          <button type="button" onClick={() => void handleToggleFullscreen()} className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">{fullscreen ? '退出全屏' : '全屏'}</button>
          <button type="button" onClick={() => setCaptureMode(false)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">退出截图模式</button>
        </div>
      )}

      {workspaceError && (
        <div className="fixed bottom-5 left-1/2 z-[90] -translate-x-1/2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-xl" role="alert">
          {workspaceError}
        </div>
      )}

      {assistantOpen && (
        <ContextAssistant
          title={
            title
          }
          breadcrumb={
            breadcrumb
          }
          onClose={
            closeAssistant
          }
        />
      )}

      {/* ====================================================================
          实验主体
      ==================================================================== */}

      <main
        className="
          min-h-0
          flex-1
          overflow-y-auto

          lg:overflow-hidden
        "
      >
        <div
          className={captureMode
            ? 'flex h-full min-h-0 flex-col p-0'
            : 'flex min-h-full flex-col gap-4 p-3 md:p-4 lg:h-full lg:min-h-0 lg:flex-row lg:p-5'}
        >
          {/* ==================================================================
              左侧主实验工作区
          ================================================================== */}

          <section
            className={captureMode
              ? 'flex min-h-0 min-w-0 flex-1 flex-col gap-3 bg-white p-4'
              : 'flex min-h-[560px] min-w-0 flex-1 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5 lg:min-h-0 xl:p-6'}
          >
            {/* ================================================================
                实验标题 + 图例
            ================================================================ */}

            <header
              className="
                flex
                shrink-0
                flex-col
                gap-3

                sm:flex-row
                sm:items-start
                sm:justify-between
              "
            >
              {/* 标题 */}

              <div className="min-w-0">
                <h1
                  className="
                    truncate
                    text-lg
                    font-bold
                    tracking-tight
                    text-slate-900

                    md:text-xl
                  "
                  title={
                    title
                  }
                >
                  {title}
                </h1>

                {subtitle && (
                  <p
                    className="
                      mt-1
                      max-w-3xl
                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    {
                      subtitle
                    }
                  </p>
                )}
              </div>

              {/* 图例 */}

              {legend.length >
                0 && (
                <div
                  className="
                    flex
                    shrink-0
                    flex-wrap
                    items-center
                    gap-x-3
                    gap-y-1.5
                    text-xs
                    text-slate-600
                  "
                >
                  {legend.map(
                    (
                      item,
                    ) => (
                      <span
                        key={
                          item.label
                        }
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          whitespace-nowrap
                        "
                      >
                        <span
                          className="
                            h-2
                            w-2
                            shrink-0
                            rounded-full
                          "
                          style={{
                            backgroundColor:
                              item.color,
                          }}
                        />

                        <span>
                          {
                            item.label
                          }
                        </span>
                      </span>
                    ),
                  )}
                </div>
              )}
            </header>

            {/* ================================================================
                数学可视化画布
            ================================================================ */}

            <div
              className={[
                'experiment-v2-canvas',

                'relative',

                'min-h-[420px]',

                'min-w-0',

                'flex-1',

                'rounded-xl',

                'border',

                'border-slate-200',

                'bg-white',

                canvasScrollable
                  ? 'overflow-auto'
                  : 'overflow-hidden',

                canvasClassName,
              ]
                .filter(
                  Boolean,
                )
                .join(
                  ' ',
                )}
            >
              {canvas}
            </div>
          </section>

          {/* ==================================================================
              右侧控制区 - Desktop
          ================================================================== */}

          {sidebar && !captureMode && (
            <aside
              className="
                hidden
                w-80
                shrink-0
                flex-col
                gap-4
                overflow-y-auto
                pr-0.5

                lg:flex

                xl:w-96
              "
            >
              {sidebar}
            </aside>
          )}

          {/* ==================================================================
              右侧控制区 - Mobile / Tablet
          ================================================================== */}

          {sidebar && !captureMode && (
            <section
              className="
                flex
                flex-col
                gap-4

                lg:hidden
              "
            >
              {sidebar}
            </section>
          )}
        </div>
      </main>

      {/* ====================================================================
          底部教学播放器
      ==================================================================== */}

      {!captureMode &&
        resolvedPlayer &&
        resolvedPlayer
          .steps
          .length >
          0 &&
        currentStep && (
          <PlayerBar
            steps={
              resolvedPlayer.steps
            }
            step={
              resolvedPlayer.step
            }
            playing={
              resolvedPlayer.playing
            }
            onPrev={
              resolvedPlayer.onPrev
            }
            onNext={
              resolvedPlayer.onNext
            }
            onTogglePlay={
              resolvedPlayer.onTogglePlay
            }
            onReset={
              resolvedPlayer.onReset
            }
            stepDesc={
              currentStep
            }
          />
        )}
    </div>
  )
}
