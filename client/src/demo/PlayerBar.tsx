// 底部播放控制栏：播放控制组 / 步进进度条（4 节点）/ 当前步骤说明
export interface StepItem {
  id: string
  title: string
  desc: string
}

interface PlayerBarProps {
  /** 步进节点 */
  steps: StepItem[]
  step: number
  playing: boolean
  onPrev: () => void
  onNext: () => void
  onTogglePlay: () => void
  onReset: () => void
  /** 当前步骤说明 */
  stepDesc: { title: string; desc: string }
}

export default function PlayerBar({ steps, step, playing, onPrev, onNext, onTogglePlay, onReset, stepDesc }: PlayerBarProps) {
  return (
    <footer className="h-20 shrink-0 bg-white border-t border-gray-100 flex items-center gap-4 md:gap-8 px-4 md:px-6">
      {/* 左：播放控制组 */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onPrev}
          disabled={step <= 1}
          className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="上一步"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 播放/暂停（紫色圆形主按钮） */}
        <button
          type="button"
          onClick={onTogglePlay}
          className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
          aria-label={playing ? '暂停' : '播放'}
        >
          {playing ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={step >= 4}
          className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="下一步"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full border border-gray-200 text-gray-500 text-xs font-medium hover:border-indigo-300 hover:text-indigo-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
          </svg>
          重置
        </button>
      </div>

      {/* 中：步进进度条 */}
      <div className="hidden md:flex flex-1 items-center justify-center min-w-0">
        <div className="flex items-center w-full max-w-md">
          {steps.map((s, i) => {
            const n = i + 1
            const isActive = n === step
            const isDone = n < step
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5 w-14">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110'
                        : isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'bg-white border-gray-200 text-gray-400'
                    }`}
                  >
                    {isDone ? (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      n
                    )}
                  </span>
                  <span className={`text-[10px] whitespace-nowrap ${isActive ? 'text-indigo-600 font-semibold' : 'text-gray-400'}`}>
                    {s.title}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 -mt-4 mx-1 rounded ${isDone ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 右：当前步骤说明 */}
      <div className="hidden lg:block w-52 shrink-0 border-l border-gray-100 pl-4">
        <div className="text-xs font-bold text-indigo-600 mb-0.5">{stepDesc.title}</div>
        <div className="text-[11px] text-gray-400 leading-snug line-clamp-2">{stepDesc.desc}</div>
      </div>
    </footer>
  )
}