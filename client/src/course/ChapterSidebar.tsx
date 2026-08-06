// 左侧栏：章节目录（树形手风琴）
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { CourseChapter } from './courseData'

interface ChapterSidebarProps {
  chapters: CourseChapter[]
  /** 当前选中的知识点 id */
  selectedPointId: string
  onSelectPoint: (pointId: string) => void
  onCollapse?: () => void
}

export default function ChapterSidebar({ chapters, selectedPointId, onSelectPoint, onCollapse }: ChapterSidebarProps) {
  // 默认展开包含当前选中知识点的章节
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const init = new Set<string>()
    for (const ch of chapters) {
      const contains = ch.sections.some((sec) => sec.points.some((p) => p.id === selectedPointId))
      if (contains) init.add(ch.id)
    }
    return init
  })

  const toggle = (chId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(chId)) next.delete(chId)
      else next.add(chId)
      return next
    })
  }

  return (
    <aside className="hidden lg:flex w-64 md:w-72 shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
      {/* 头部：章节目录 + 筛选图标 */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-800">章节目录</h2>
        <button
          type="button"
          onClick={onCollapse}
          className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          aria-label="收起章节目录"
          title="收起章节目录"
        >
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* 章节树 */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1.5" aria-label="章节目录">
        {chapters.map((ch, chIndex) => {
          const isActiveChapter = ch.sections.some((sec) => sec.points.some((p) => p.id === selectedPointId))
          const isExpanded = expanded.has(ch.id) || isActiveChapter
          return (
            <div key={ch.id} className="rounded-lg">
              {/* 一级：章节行 */}
              <button
                type="button"
                onClick={() => toggle(ch.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors ${
                  isActiveChapter ? 'bg-blue-50/70' : 'hover:bg-gray-50'
                }`}
              >
                {/* 数字编号 Badge */}
                <span
                  className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                    isActiveChapter
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  {chIndex + 1}
                </span>
                <span className={`flex-1 text-left text-[13px] font-medium truncate ${isActiveChapter ? 'text-blue-700' : 'text-gray-700'}`}>
                  {ch.title}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {/* 二、三级：小节 + 知识点 */}
              {isExpanded && (
                <div className="ml-[17px] pl-3 mt-0.5 border-l border-gray-200 space-y-1">
                  {ch.sections.map((sec) => (
                    <div key={sec.id} className="space-y-0.5">
                      {/* 二级：小节标题 */}
                      <div className="px-2.5 py-1 text-xs text-gray-400 font-medium">{sec.title}</div>
                      {/* 三级：知识点 */}
                      {sec.points.map((point) => {
                        const isSelected = point.id === selectedPointId
                        return (
                          <button
                            key={point.id}
                            type="button"
                            onClick={() => onSelectPoint(point.id)}
                            className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                              isSelected
                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                            }`}
                          >
                            {/* 选中指示圆点 */}
                            <span
                              className={`w-1.5 h-1.5 shrink-0 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-gray-300'}`}
                            />
                            <span className="truncate">{point.title}</span>
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="border-t border-gray-100 p-3">
        <Link
          to="/experiments"
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-50 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          全部可视化实验
        </Link>
      </div>
    </aside>
  )
}
