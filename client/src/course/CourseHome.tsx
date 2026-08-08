// 课程主界面：八门课程共享同一套知识目录、知识地图与详情工作区。
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { fetchPublishedCourses, fetchPublishedCourseTree } from '../services/contentCatalog'
import CourseHeader from './CourseHeader'
import DrawerSidebar from './DrawerSidebar'
import KnowledgeMap from './KnowledgeMap'
import KnowledgeCards from './KnowledgeCards'
import KnowledgeDetail from './KnowledgeDetail'
import KnowledgeNavigationPanel from './KnowledgeNavigationPanel'
import { mergePublishedCourseTree } from './courseContentAdapter'
import { chapters as localHigherMathematicsChapters } from './courseData'
import {
  collectCoursePoints,
  collectRelatedPoints,
  courses as localCourses,
  DEFAULT_COURSE_ID,
  findChapterInCourse,
  findCourse,
  findSectionInCourse,
  type UniversityCourse,
} from './courseCatalog'

export default function CourseHome() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [navigationOpen, setNavigationOpen] = useState(false)
  const [higherMathematicsChapters, setHigherMathematicsChapters] = useState(localHigherMathematicsChapters)
  const selectedCourseId = searchParams.get('course') ?? DEFAULT_COURSE_ID
  const selectedPointId = searchParams.get('point') ?? ''

  useEffect(() => {
    const controller = new AbortController()
    fetchPublishedCourses(controller.signal)
      .then((publishedCourses) => {
        const course = publishedCourses.find((item) => item.code === 'higher-mathematics-1')
        if (!course) throw new Error('高等数学课程尚未发布')
        return fetchPublishedCourseTree(course.id, controller.signal)
      })
      .then((tree) => setHigherMathematicsChapters(mergePublishedCourseTree(localHigherMathematicsChapters, tree).chapters))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setHigherMathematicsChapters(localHigherMathematicsChapters)
      })
    return () => controller.abort()
  }, [])

  const courses = useMemo<UniversityCourse[]>(() => localCourses.map((course) =>
    course.id === DEFAULT_COURSE_ID ? { ...course, chapters: higherMathematicsChapters } : course,
  ), [higherMathematicsChapters])
  const course = courses.find((item) => item.id === selectedCourseId) ?? findCourse(DEFAULT_COURSE_ID)
  const allPoints = useMemo(() => collectCoursePoints(course), [course])
  const point = selectedPointId
    ? allPoints.find((candidate) => candidate.id === selectedPointId || candidate.demoId === selectedPointId)
    : undefined
  const section = point ? findSectionInCourse(course, point.id) : undefined
  const chapter = point ? findChapterInCourse(course, point.id) : undefined
  const relatedPoints = useMemo(() => point ? collectRelatedPoints(course, point) : [], [course, point])

  const selectCourse = (courseId: string) => {
    setSearchParams({ course: courseId })
  }
  const selectPoint = (pointId: string) => {
    setSearchParams({ course: course.id, point: pointId })
    setNavigationOpen(false)
  }
  const showCourseOverview = () => {
    setSearchParams({ course: course.id })
    setNavigationOpen(false)
  }

  const breadcrumb = point ? ['首页', course.title, point.title] : ['首页', course.title]
  const handleBreadcrumbClick = (index: number) => {
    if (index <= 1) showCourseOverview()
    else if (chapter) {
      const first = chapter.sections[0]?.points[0]
      if (first) selectPoint(first.id)
    }
  }

  const navigation = (
    <KnowledgeNavigationPanel
      key={`${course.id}:${point?.id ?? 'overview'}`}
      chapters={course.chapters}
      courses={courses}
      selectedCourseId={course.id}
      onSelectCourse={selectCourse}
      selectedPointId={point?.id ?? ''}
      onSelectPoint={selectPoint}
      defaultCollapsed={!point}
    />
  )

  return (
    <div className="flex h-full flex-col bg-[#f5f7fa]">
      <CourseHeader breadcrumb={breadcrumb} onBreadcrumbClick={handleBreadcrumbClick} onOpenNavigation={() => setNavigationOpen(true)} />
      <DrawerSidebar
        open={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        selectedPointId={point?.id ?? ''}
        onSelectPoint={selectPoint}
        chapters={course.chapters}
        courses={courses}
        selectedCourseId={course.id}
        onSelectCourse={selectCourse}
        defaultCollapsed={!point}
      />

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[300px] shrink-0 border-r border-slate-200 bg-white xl:block">{navigation}</aside>
        {point ? (
          <div className="flex min-w-0 flex-1 gap-4 p-3 md:p-4">
            <main className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
              <KnowledgeMap point={point} relatedPoints={relatedPoints} onSelectPoint={selectPoint} />
              <KnowledgeCards points={section?.points ?? [point]} selectedPointId={point.id} onSelectPoint={selectPoint} sectionTitle={section?.title} />
            </main>
            <KnowledgeDetail point={point} />
          </div>
        ) : (
          <main className="flex min-w-0 flex-1 items-center justify-center p-4">
            <section className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></svg>
              </div>
              <div className="mt-4 text-sm font-semibold text-blue-600">{course.title}</div>
              <h1 className="mt-2 text-xl font-bold text-slate-900">选择一个知识点开始学习</h1>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{course.subtitle}。从左侧章节目录展开小节并选择知识点，系统将同步展示对应的知识地图、关联知识、学习目标和可视化演示入口。</p>
            </section>
          </main>
        )}
      </div>
    </div>
  )
}
