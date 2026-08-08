import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import type { CourseChapter } from './courseData'
import type { UniversityCourse } from './courseCatalog'
import KnowledgeNavigationPanel from './KnowledgeNavigationPanel'

interface DrawerSidebarProps {
  open: boolean
  onClose: () => void
  selectedPointId?: string
  onSelectPoint?: (pointId: string) => void
  chapters?: CourseChapter[]
  courses?: UniversityCourse[]
  selectedCourseId?: string
  onSelectCourse?: (courseId: string) => void
  defaultCollapsed?: boolean
}

export default function DrawerSidebar({
  open,
  onClose,
  selectedPointId = '',
  onSelectPoint = () => undefined,
  chapters = [],
  courses = [],
  selectedCourseId = '',
  onSelectCourse,
  defaultCollapsed = false,
}: DrawerSidebarProps) {
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <aside
        className={`absolute left-0 top-0 flex h-dvh w-[min(340px,94vw)] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="课程目录"
      >
        <div className="absolute right-3 top-3 z-10">
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-blue-50 hover:text-blue-600" aria-label="关闭课程目录">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <KnowledgeNavigationPanel
            key={`${selectedCourseId}:${defaultCollapsed ? 'collapsed' : 'expanded'}:${selectedPointId ? 'selected' : 'none'}`}
            chapters={chapters}
            courses={courses}
            selectedCourseId={selectedCourseId}
            onSelectCourse={onSelectCourse}
            selectedPointId={selectedPointId}
            defaultCollapsed={defaultCollapsed}
            onSelectPoint={(pointId) => {
              onSelectPoint(pointId)
              onClose()
            }}
          />
        </div>
        <div className="shrink-0 border-t border-slate-100 bg-white p-3">
          <Link
            to="/experiments"
            onClick={onClose}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-blue-50 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            浏览全部 300 个可视化实验
          </Link>
        </div>
      </aside>
    </div>
  )
}
