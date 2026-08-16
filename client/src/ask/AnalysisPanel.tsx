// 右侧栏：当前提问路由解析面板（复述 / 意图与分支 / Top 匹配 / 目标 / 可视化预览 / CTA）
interface AnalysisPanelProps {
  /** 用户提问原文 */
  question: string
  /** 识别意图中文，如「画图」 */
  intentLabel: string
  /** 分支中文，如「直接加载」「候选确认」 */
  branchLabel: string
  /** 置信度 0-1 */
  confidence: number
  /** 识别到的课程章节路径 */
  chapterPath: string
  /** Top 匹配（含分数） */
  topMatches: { title: string; match: number }[]
  goals: string[]
  previewTitle: string
  onEnterDemo: () => void
  /** 继续追问：聚焦回输入框 */
  onContinueAsking: () => void
}

/** ε−δ 可视化演示预览图（简化 SVG + 播放按钮） */
function VisualizationPreview() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-100 bg-gradient-to-br from-gray-50 to-blue-50/50">
      <svg viewBox="0 0 300 150" className="w-full h-auto">
        <g stroke="#9ca3af" strokeWidth={1}>
          <line x1={28} y1={122} x2={282} y2={122} />
          <line x1={40} y1={10} x2={40} y2={132} />
        </g>
        <g stroke="#93c5fd" strokeWidth={0.8} strokeDasharray="3 3">
          <line x1={40} y1={52} x2={278} y2={52} />
          <line x1={40} y1={74} x2={278} y2={74} />
        </g>
        <line x1={40} y1={63} x2={278} y2={63} stroke="#2563eb" strokeWidth={1.2} strokeDasharray="2 2" />
        <line x1={185} y1={10} x2={185} y2={132} stroke="#f59e0b" strokeWidth={0.8} strokeDasharray="3 3" />
        <path
          d="M40 112 C 90 110 118 102 148 86 C 168 75 178 70 185 66 C 198 60 226 58 258 60 L 278 62"
          fill="none" stroke="#1d4ed8" strokeWidth={2} strokeLinecap="round"
        />
        <text x={255} y={114} fontSize={10} fill="#4b5563">x₀</text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="w-11 h-11 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-blue-600 cursor-pointer hover:scale-110 transition-transform">
          <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
    </div>
  )
}

export default function AnalysisPanel({
  question,
  intentLabel,
  branchLabel,
  confidence,
  chapterPath,
  topMatches,
  goals,
  previewTitle,
  onEnterDemo,
  onContinueAsking,
}: AnalysisPanelProps) {
  return (
    <aside className="hidden w-[320px] shrink-0 flex-col overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:flex 2xl:w-[350px]">
      {/* 提问解析 */}
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
        <span className="text-blue-600">✦</span>
        当前提问解析
      </div>

      <section className="border-t border-slate-100 py-4">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600">●</span>
          用户问题
        </h4>

        {/* 问题复述 */}
        <div className="flex items-start gap-2 mb-3">
          <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="rounded-lg bg-slate-50 p-2.5 text-[13px] leading-relaxed text-slate-600">
            “{question}”
          </p>
        </div>

      </section>

      <section className="border-t border-slate-100 py-4">
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <span className="text-blue-600">▣</span>识别章节
        </h4>
        <p className="text-xs leading-5 text-slate-600">{chapterPath || '等待识别课程章节'}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">{intentLabel}</span>
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600">{branchLabel}</span>
          {confidence > 0 && <span className="text-[11px] text-slate-400">置信度 {(confidence * 100).toFixed(0)}%</span>}
        </div>
      </section>

      {/* Top 匹配 */}
      <section className="border-t border-slate-100 py-4">
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><span className="text-blue-600">◎</span>匹配知识点（Top 3）</h4>
        {topMatches.length > 0 ? (
          <div className="space-y-1.5">
            {topMatches.map((m, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[13px]">
                <span className="flex items-center gap-2 text-gray-700">
                  <span className="w-4 text-center text-xs text-slate-400">{i + 1}.</span>
                  <span className="truncate">{m.title}</span>
                </span>
                <span className="text-xs font-medium text-emerald-600">匹配度 {m.match}%</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-gray-400">等待解析结果</p>
        )}
      </section>

      {/* 推荐学习目标 */}
      <section className="border-t border-slate-100 py-4">
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><span className="text-blue-600">▣</span>推荐学习目标</h4>
        {goals.length > 0 ? (
          <ul className="space-y-2">
            {goals.map((goal, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-gray-600 leading-relaxed">
                <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" fill="#eff6ff" stroke="none" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[12px] text-gray-400">提交问题后推荐</p>
        )}
      </section>

      {/* 可视化预览 */}
      <section className="border-t border-slate-100 py-4">
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><span className="text-blue-600">▧</span>推荐可视化演示</h4>
        <VisualizationPreview />
        <p className="mt-1.5 text-center text-[11px] text-gray-400">{previewTitle}</p>
      </section>

      {/* CTA */}
      <div className="mt-auto space-y-2.5 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onEnterDemo}
          disabled={topMatches.length === 0}
          className="w-full inline-flex items-center justify-center gap-1.5 h-11 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          进入演示
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onContinueAsking}
          className="w-full inline-flex items-center justify-center gap-1.5 h-11 rounded-lg bg-white text-blue-600 border-2 border-blue-200 text-sm font-semibold hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          继续追问
        </button>
      </div>
    </aside>
  )
}
