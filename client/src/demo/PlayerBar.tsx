export interface StepItem {
  id: string
  title: string
  desc: string
}

interface PlayerBarProps {
  steps: StepItem[]

  step: number
  playing: boolean

  onPrev: () => void
  onNext: () => void
  onTogglePlay: () => void
  onReset: () => void
  onStepSelect?: (step: number) => void

  stepDesc: {
    title: string
    desc: string
  }
}

/**
 * Experiment V2 底部统一教学播放器。
 *
 * 支持任意数量步骤：
 *
 * 3 步
 * 4 步
 * 5 步
 * 8 步
 * 10 步
 *
 * 不再写死为 4 个步骤。
 */
export default function PlayerBar({
  steps,
  step,
  playing,
  onPrev,
  onNext,
  onTogglePlay,
  onReset,
  onStepSelect,
  stepDesc,
}: PlayerBarProps) {
  const totalSteps = steps.length

  /**
   * 防止外部传入：
   *
   * step = 0
   * step > steps.length
   *
   * 导致播放器状态异常。
   */
  const safeStep =
    totalSteps > 0
      ? Math.max(
          1,
          Math.min(step, totalSteps),
        )
      : 1

  const canGoPrev =
    totalSteps > 0 &&
    safeStep > 1

  const canGoNext =
    totalSteps > 0 &&
    safeStep < totalSteps

  return (
    <footer
      className="
        shrink-0
        border-t
        border-gray-100
        bg-white
        px-3
        py-3

        md:px-5

        lg:h-20
        lg:px-6
        lg:py-0
      "
    >
      <div
        className="
          flex
          h-full
          items-center
          gap-4

          md:gap-6

          lg:gap-8
        "
      >
        {/* =====================================
            左侧：播放控制
           ===================================== */}
        <div
          className="
            flex
            shrink-0
            items-center
            gap-2
          "
        >
          {/* 上一步 */}
          <button
            type="button"
            onClick={onPrev}
            disabled={!canGoPrev}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              border
              border-gray-200
              text-gray-500
              transition-all

              hover:border-indigo-300
              hover:bg-indigo-50
              hover:text-indigo-600

              disabled:cursor-not-allowed
              disabled:opacity-35
              disabled:hover:border-gray-200
              disabled:hover:bg-transparent
              disabled:hover:text-gray-500
            "
            aria-label="上一步"
            title="上一步"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* 播放 / 暂停 */}
          <button
            type="button"
            onClick={onTogglePlay}
            disabled={totalSteps === 0}
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-indigo-600
              text-white
              shadow-lg
              shadow-indigo-500/30
              transition-all

              hover:scale-105
              hover:bg-indigo-700

              active:scale-95

              disabled:cursor-not-allowed
              disabled:opacity-40
              disabled:hover:scale-100
            "
            aria-label={
              playing
                ? '暂停'
                : '播放'
            }
            title={
              playing
                ? '暂停'
                : '播放'
            }
          >
            {playing ? (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect
                  x="6"
                  y="4"
                  width="4"
                  height="16"
                  rx="1"
                />

                <rect
                  x="14"
                  y="4"
                  width="4"
                  height="16"
                  rx="1"
                />
              </svg>
            ) : (
              <svg
                className="ml-0.5 h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* 下一步 */}
          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              border
              border-gray-200
              text-gray-500
              transition-all

              hover:border-indigo-300
              hover:bg-indigo-50
              hover:text-indigo-600

              disabled:cursor-not-allowed
              disabled:opacity-35
              disabled:hover:border-gray-200
              disabled:hover:bg-transparent
              disabled:hover:text-gray-500
            "
            aria-label="下一步"
            title="下一步"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* 重置 */}
          <button
            type="button"
            onClick={onReset}
            disabled={totalSteps === 0}
            className="
              inline-flex
              h-9
              items-center
              gap-1.5
              rounded-full
              border
              border-gray-200
              px-3
              text-xs
              font-medium
              text-gray-500
              transition-all

              hover:border-indigo-300
              hover:bg-indigo-50
              hover:text-indigo-600

              disabled:cursor-not-allowed
              disabled:opacity-40
            "
            title="重置教学步骤"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
            </svg>

            <span className="hidden sm:inline">
              重置
            </span>
          </button>
        </div>

        {/* =====================================
            中间：教学步骤进度条
           ===================================== */}
        <div
          className="
            hidden
            min-w-0
            flex-1
            items-center
            justify-center

            md:flex
          "
        >
          <div
            className="
              flex
              w-full
              max-w-3xl
              items-start
              overflow-x-auto
              px-1
              pb-1
            "
          >
            {steps.map(
              (
                item,
                index,
              ) => {
                const stepNumber =
                  index + 1

                const isActive =
                  stepNumber ===
                  safeStep

                const isDone =
                  stepNumber <
                  safeStep

                return (
                  <div
                    key={item.id}
                    className="
                      flex
                      min-w-[94px]
                      flex-1
                      items-start

                      last:flex-none
                    "
                  >
                    {/* 节点 */}
                    <button
                      type="button"
                      onClick={() => onStepSelect?.(stepNumber)}
                      disabled={!onStepSelect}
                      aria-label={`切换到步骤 ${stepNumber}：${item.title}`}
                      className="
                        flex
                        w-20
                        shrink-0
                        flex-col
                        items-center
                        gap-1.5
                        disabled:cursor-default
                      "
                    >
                      <span
                        className={[
                          'flex',
                          'h-7',
                          'w-7',
                          'items-center',
                          'justify-center',
                          'rounded-full',
                          'border-2',
                          'text-xs',
                          'font-bold',
                          'transition-all',
                          isActive
                            ? [
                                'scale-110',
                                'border-indigo-600',
                                'bg-indigo-600',
                                'text-white',
                                'shadow-lg',
                                'shadow-indigo-500/30',
                              ].join(
                                ' ',
                              )
                            : isDone
                              ? [
                                  'border-emerald-500',
                                  'bg-emerald-500',
                                  'text-white',
                                ].join(
                                  ' ',
                                )
                              : [
                                  'border-gray-200',
                                  'bg-white',
                                  'text-gray-400',
                                ].join(
                                  ' ',
                                ),
                        ].join(
                          ' ',
                        )}
                      >
                        {isDone ? (
                          <svg
                            className="h-3.5 w-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        ) : (
                          stepNumber
                        )}
                      </span>

                      <span
                        className={[
                          'max-w-20',
                          'truncate',
                          'text-center',
                          'text-[10px]',
                          'whitespace-nowrap',
                          isActive
                            ? 'font-semibold text-indigo-600'
                            : isDone
                              ? 'font-medium text-emerald-600'
                              : 'text-gray-400',
                        ].join(
                          ' ',
                        )}
                        title={
                          item.title
                        }
                      >
                        {
                          item.title
                        }
                      </span>
                    </button>

                    {/* 节点连接线 */}
                    {index <
                      steps.length -
                        1 && (
                      <div
                        className={[
                          'mt-3.5',
                          'h-0.5',
                          'min-w-4',
                          'flex-1',
                          'rounded-full',
                          'transition-colors',
                          isDone
                            ? 'bg-emerald-400'
                            : 'bg-gray-200',
                        ].join(
                          ' ',
                        )}
                      />
                    )}
                  </div>
                )
              },
            )}
          </div>
        </div>

        {/* =====================================
            右侧：当前步骤说明
           ===================================== */}
        <div
          className="
            hidden
            w-56
            shrink-0
            border-l
            border-gray-100
            pl-4

            lg:block
          "
        >
          <div
            className="
              mb-0.5
              truncate
              text-xs
              font-bold
              text-indigo-600
            "
            title={
              stepDesc.title
            }
          >
            {
              stepDesc.title
            }
          </div>

          <div
            className="
              line-clamp-2
              text-[11px]
              leading-snug
              text-gray-400
            "
            title={
              stepDesc.desc
            }
          >
            {
              stepDesc.desc
            }
          </div>
        </div>
      </div>

      {/* =====================================
          小屏幕当前步骤说明
         ===================================== */}
      <div
        className="
          mt-2
          flex
          items-start
          gap-2
          border-t
          border-gray-100
          pt-2

          md:hidden
        "
      >
        <span
          className="
            shrink-0
            rounded-full
            bg-indigo-50
            px-2
            py-0.5
            text-[10px]
            font-bold
            text-indigo-600
          "
        >
          {safeStep}/
          {totalSteps}
        </span>

        <div className="min-w-0">
          <div
            className="
              truncate
              text-xs
              font-semibold
              text-gray-700
            "
          >
            {
              stepDesc.title
            }
          </div>

          <div
            className="
              mt-0.5
              line-clamp-1
              text-[10px]
              text-gray-400
            "
          >
            {
              stepDesc.desc
            }
          </div>
        </div>
      </div>
    </footer>
  )
}
