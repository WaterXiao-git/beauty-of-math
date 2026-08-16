import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'

import type { CourseChapter } from './courseData'

interface KnowledgeNavigationPanelProps {
  chapters: CourseChapter[]
  selectedPointId: string
  onSelectPoint: (pointId: string) => void
  defaultCollapsed?: boolean
}

export default function KnowledgeNavigationPanel({
  chapters,
  selectedPointId,
  onSelectPoint,
  defaultCollapsed = false,
}: KnowledgeNavigationPanelProps) {
  const selectedChapterId = chapters.find((chapter) =>
    chapter.sections.some((section) => section.points.some((point) => point.id === selectedPointId)),
  )?.id
  const selectedSectionId = chapters
    .flatMap((chapter) => chapter.sections)
    .find((section) => section.points.some((point) => point.id === selectedPointId))?.id
  const [query, setQuery] = useState('')
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    () => new Set(selectedChapterId ? [selectedChapterId] : (!defaultCollapsed && chapters[0] ? [chapters[0].id] : [])),
  )
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(selectedSectionId ? [selectedSectionId] : (!defaultCollapsed ? (chapters[0]?.sections.map((section) => section.id) ?? []) : [])),
  )

  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN')
  const visibleChapters = useMemo(() => {
    if (!normalizedQuery) return chapters
    return chapters
      .map((chapter) => ({
        ...chapter,
        sections: chapter.sections
          .map((section) => ({
            ...section,
            points: section.points.filter((point) =>
              [chapter.title, section.title, point.title]
                .join(' ')
                .toLocaleLowerCase('zh-CN')
                .includes(normalizedQuery),
            ),
          }))
          .filter((section) => section.points.length > 0),
      }))
      .filter((chapter) => chapter.sections.length > 0)
  }, [chapters, normalizedQuery])

  const toggle = (setter: Dispatch<SetStateAction<Set<string>>>, id: string) => {
    setter((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="border-b border-slate-100 px-4 py-4">
        <h2 className="font-bold text-slate-900">章节目录</h2>
        <label className="relative mt-3 block">
          <span className="sr-only">搜索章节或知识点</span>
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索章节或知识点" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" />
        </label>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3 text-xs" aria-label="章节与知识点">
        {visibleChapters.map((chapter, chapterIndex) => {
          const chapterOpen = normalizedQuery.length > 0 || expandedChapters.has(chapter.id)
          return (
            <section key={chapter.id} className="mb-2">
              <button
                type="button"
                onClick={() => toggle(setExpandedChapters, chapter.id)}
                className={`flex w-full items-center gap-2 rounded-xl px-2 py-2.5 text-left transition ${chapterOpen ? 'bg-blue-50 font-semibold text-blue-700' : 'font-medium text-slate-700 hover:bg-slate-50'}`}
              >
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] ${chapterOpen ? 'border-blue-400 bg-white text-blue-600' : 'border-slate-300 text-slate-500'}`}>{chapterIndex + 1}</span>
                <span className="min-w-0 flex-1 truncate">{chapter.title}</span>
                <svg className={`h-3.5 w-3.5 shrink-0 transition-transform ${chapterOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m6 9 6 6 6-6" /></svg>
              </button>

              {chapterOpen && (
                <div className="ml-5 border-l border-slate-200 py-1 pl-3">
                  {chapter.sections.map((section) => {
                    const sectionOpen = normalizedQuery.length > 0 || expandedSections.has(section.id)
                    return (
                      <div key={section.id} className="mb-1">
                        <button type="button" onClick={() => toggle(setExpandedSections, section.id)} className="flex w-full items-center gap-1.5 rounded-lg px-1 py-2 text-left font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-700">
                          <svg className={`h-3 w-3 shrink-0 transition-transform ${sectionOpen ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m9 18 6-6-6-6" /></svg>
                          <span className="truncate">{section.title}</span>
                        </button>
                        {sectionOpen && (
                          <div className="space-y-0.5 py-0.5 pl-3">
                            {section.points.map((point) => {
                              const selected = point.id === selectedPointId
                              return (
                                <button
                                  key={point.id}
                                  type="button"
                                  onClick={() => onSelectPoint(point.id)}
                                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition ${selected ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-700'}`}
                                >
                                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${selected ? 'bg-blue-600' : 'bg-slate-300'}`} />
                                  <span className="min-w-0 flex-1 truncate">{point.title}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          )
        })}
      </nav>
    </div>
  )
}
