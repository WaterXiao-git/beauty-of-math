// AI 理解与匹配结果：主匹配卡片（学习路径/元信息/CTA）+ 关联知识点网格
import MathFormula from '../components/MathFormula/MathFormula'
import type { RelatedMatch } from './askData'
import { LEARNING_PATH } from './askData'

export interface MainMatch {
  title: string
  summary: string
  match: number
  experimentPath?: string
  templates: string[]
  time: string
  difficulty: string
}

interface MatchResultsProps {
  main: MainMatch
  related: RelatedMatch[]
  onStartLearning: () => void
  onViewMap: () => void
  onSelectRelated: (id: string) => void
}

export default function MatchResults({ main, related, onStartLearning, onViewMap, onSelectRelated }: MatchResultsProps) {
  return (
    <section>
      <h3 className="text-sm font-bold text-gray-800 mb-3">AI 理解结果</h3>

      <div className="flex flex-col xl:flex-row gap-4">
        {/* 主匹配卡片（60%） */}
        <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
          {/* 标题 + 匹配度 */}
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-base font-bold text-gray-900 leading-snug">
              已为你匹配相关知识点：{main.title}
            </h4>
            <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
              匹配度 {main.match}%
            </span>
          </div>

          {/* 知识点简介 */}
          <p className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
            <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            {main.summary}
          </p>

          {/* 学习路径 Timeline */}
          <div>
            <div className="text-xs font-medium text-gray-400 mb-2">推荐学习路径</div>
            <div className="flex items-center">
              {LEARNING_PATH.map((step, i) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-md shadow-blue-500/20">
                      {i + 1}
                    </span>
                    <span className="text-[11px] text-gray-500 whitespace-nowrap">{step}</span>
                  </div>
                  {i < LEARNING_PATH.length - 1 && (
                    <div className="flex-1 h-0.5 bg-blue-100 mx-1.5 mb-4" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 元信息 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/80 rounded-lg p-3.5">
            <div>
              <div className="text-xs text-gray-400 mb-1.5">适合的可视化模板</div>
              <div className="flex flex-wrap gap-1.5">
                {main.templates.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[11px] text-gray-600">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1.5">预估学习时长</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">{main.time}</span>
                <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[11px] font-medium">
                  {main.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* 操作 */}
          <div className="flex items-center gap-3 mt-auto">
            <button
              type="button"
              onClick={onViewMap}
              className="inline-flex items-center justify-center gap-1.5 px-4 h-10 rounded-lg bg-white text-blue-600 border-2 border-blue-200 text-sm font-semibold hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              查看知识地图
            </button>
            <button
              type="button"
              onClick={onStartLearning}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 h-10 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
            >
              开始学习此知识点
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* 关联知识点（40%） */}
        <div className="xl:w-[38%] flex flex-col gap-3">
          {related.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectRelated(item.id)}
              className="text-left bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-800">{item.title}</span>
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold">
                  {item.match}%
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