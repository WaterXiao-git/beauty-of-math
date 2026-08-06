// 中间下部：知识点导航卡片网格（4 列）
import type { KnowledgePoint } from './courseData'
import { STATUS_META, LEVEL_META } from './courseData'

interface KnowledgeCardsProps {
  points: KnowledgePoint[]
  selectedPointId: string
  onSelectPoint: (pointId: string) => void
  sectionTitle?: string
}

export default function KnowledgeCards({ points, selectedPointId, onSelectPoint, sectionTitle }: KnowledgeCardsProps) {
  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5 flex flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-800">知识点导航</h3>
          <span className="text-xs text-gray-400">{sectionTitle ? `${sectionTitle} · ` : ''}共 {points.length} 个知识点</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-3 md:gap-4">
        {points.map((point) => {
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

    </section>
  )
}
