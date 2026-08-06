// 中间下部：知识点导航卡片网格（4 列）
import { useMemo, useState } from 'react'
import type { KnowledgePoint } from './courseData'
import { STATUS_META, LEVEL_META } from './courseData'

interface KnowledgeCardsProps {
  points: KnowledgePoint[]
  selectedPointId: string
  onSelectPoint: (pointId: string) => void
}

export default function KnowledgeCards({ points, selectedPointId, onSelectPoint }: KnowledgeCardsProps) {
  const [query, setQuery] = useState('')
  const filteredPoints = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('zh-CN')
    if (!keyword) return points
    return points.filter((point) =>
      [point.title, point.summary, point.template, ...point.related, ...point.goals]
        .join(' ')
        .toLocaleLowerCase('zh-CN')
        .includes(keyword),
    )
  }, [points, query])

  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5 flex flex-col">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800">全课程知识点导航</h3>
          <span className="text-xs text-gray-400">当前显示 {filteredPoints.length} / {points.length} 个知识点</span>
        </div>
        <label className="relative block w-full md:w-72">
          <span className="sr-only">搜索课程知识点</span>
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索知识点、目标或模板"
            className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {filteredPoints.map((point) => {
          const status = STATUS_META[point.status]
          const level = LEVEL_META[point.previewLevel]
          const isSelected = point.id === selectedPointId
          const isMastered = point.status === 'mastered'

          return (
            <button
              key={point.id}
              type="button"
              onClick={() => onSelectPoint(point.id)}
              aria-pressed={isSelected}
              className={`text-left p-4 rounded-xl border-2 transition-all duration-200 flex flex-col gap-2.5 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/40 shadow-md shadow-blue-500/10'
                  : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm'
              }`}
            >
              {/* 头部：名称 + 状态 */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className={`text-sm font-bold leading-snug ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                    {point.title}
                  </h4>
                  {point.source === 'published' && (
                    <span className="mt-1 inline-flex rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600">
                      已发布 v{point.contentVersion}
                    </span>
                  )}
                </div>
                <span className={`flex items-center gap-1 shrink-0 mt-0.5 text-xs font-medium ${status.text}`}>
                  <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>

              {/* 预览等级 */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">预览等级</span>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${level.badge}`}>{level.label}</span>
              </div>

              {/* 推荐模板 */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">推荐模板</span>
                <span className="text-gray-600 font-medium truncate ml-2">{point.template}</span>
              </div>

              {/* 学习目标（截断两行） */}
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
                {point.goals[0]}
              </p>

              {/* 底部按钮 */}
              <span
                className={`mt-1 w-full inline-flex items-center justify-center h-8 rounded-lg text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {isSelected ? '当前学习' : isMastered ? '回顾' : '未开始'}
              </span>
            </button>
          )
        })}
      </div>

      {filteredPoints.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
          没有找到匹配知识点，请尝试“极限”“导数”或“积分”。
        </div>
      )}
    </section>
  )
}
