// AI 理解与匹配结果：主匹配卡片（学习路径/元信息/CTA）+ 关联知识点网格
import MathFormula from '../components/MathFormula/MathFormula'
import type { RelatedMatch } from './askData'

export interface MainMatch {
  title: string
  summary: string
  match: number
  destination?: string
  templates: string[]
  time: string
  difficulty: string
  learningPath: string[]
}

interface MatchResultsProps {
  main: MainMatch
  related: RelatedMatch[]
  onStartLearning: () => void
  onViewMap: () => void
  onAskAI: () => void
  onSelectRelated: (id: string) => void
}

export default function MatchResults({ main, related, onStartLearning, onViewMap, onAskAI, onSelectRelated }: MatchResultsProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/55 p-3 shadow-sm md:p-4">
      <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">✦</span>
        AI 理解结果
      </h3>

      <div className="flex flex-col gap-3 2xl:flex-row">
        {/* 主匹配卡片（60%） */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
          {/* 标题 + 匹配度 */}
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-base font-bold leading-snug text-slate-900">
              已为你匹配相关知识点：<span className="text-blue-600">{main.title}</span>
            </h4>
            <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
              匹配度 {main.match}%
            </span>
          </div>

          {/* 知识点简介 */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5z" /><path d="M4 6.5v13" />
              </svg>
              知识点简介
            </div>
            <p className="text-[13px] leading-6 text-slate-600">
              {main.summary}
            </p>
          </div>

          {/* 学习路径 Timeline */}
          <div>
            <div className="mb-3 text-sm font-semibold text-slate-800">推荐学习路径</div>
            <div className="flex items-center">
              {main.learningPath.map((step, i) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-200 bg-white text-xs font-bold text-blue-600">
                      {i + 1}
                    </span>
                    <span className="whitespace-nowrap text-[11px] text-slate-500">{step}</span>
                  </div>
                  {i < main.learningPath.length - 1 && (
                    <div className="flex-1 h-0.5 bg-blue-100 mx-1.5 mb-4" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 元信息 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
              <div className="mb-2 text-xs font-semibold text-slate-700">适合的可视化模板</div>
              <div className="flex flex-wrap gap-1.5">
                {main.templates.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[11px] text-gray-600">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
              <div className="mb-2 text-xs font-semibold text-slate-700">预估学习时长</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">{main.time}</span>
                <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[11px] font-medium">
                  {main.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* 操作 */}
          <div className="mt-auto grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onStartLearning}
              className="inline-flex items-center justify-center gap-1.5 px-4 h-10 rounded-lg bg-white text-blue-600 border-2 border-blue-200 text-sm font-semibold hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              打开实验
            </button>
            <button
              type="button"
              onClick={onAskAI}
              className="inline-flex items-center justify-center gap-1.5 px-4 h-10 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
            >
              直接问 AI
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onViewMap}
              className="col-span-2 text-xs font-medium text-slate-500 hover:text-blue-600"
            >
              查看知识地图
            </button>
          </div>
        </div>

        {/* 关联知识点（40%） */}
        <div className="flex flex-col gap-3 2xl:w-[38%]">
          {related.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectRelated(item.id)}
              className="text-left rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-800">{item.title}</span>
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold">
                  匹配度 {item.match}%
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-2.5">{item.summary}</p>
              {item.formula && (
                <div className="mb-3 px-3 py-2 rounded-lg bg-blue-50/60 text-blue-800 text-center">
                  <MathFormula formula={item.formula} displayMode={false} className="text-[13px]" />
                </div>
              )}
              <span className="inline-flex items-center justify-center w-full h-8 rounded-lg bg-white text-blue-600 border border-blue-200 text-xs font-semibold hover:bg-blue-50 transition-colors">
                进入学习
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
