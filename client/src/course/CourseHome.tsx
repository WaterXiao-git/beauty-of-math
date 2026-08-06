// 课程主界面：知识工作区 + 不占用主体宽度的章节目录抽屉
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { fetchPublishedCourses, fetchPublishedCourseTree } from '../services/contentCatalog'
import CourseHeader from './CourseHeader'
import DrawerSidebar from './DrawerSidebar'
import KnowledgeMap from './KnowledgeMap'
import KnowledgeCards from './KnowledgeCards'
import KnowledgeDetail from './KnowledgeDetail'
import { mergePublishedCourseTree } from './courseContentAdapter'
import {
  chapters as localChapters,
  COURSE_TITLE,
  DEFAULT_POINT_ID,
} from './courseData'
import type { CourseChapter, CourseSection, KnowledgePoint } from './courseData'

function collectAllPoints(chapters: CourseChapter[]): KnowledgePoint[] {
  return chapters.flatMap((chapter) =>
    chapter.sections.flatMap((section) => section.points),
  )
}

function findPoint(chapters: CourseChapter[], pointId: string) {
  return collectAllPoints(chapters).find(
    (point) => point.id === pointId || point.demoId === pointId,
  )
}

function findSection(chapters: CourseChapter[], pointId: string): CourseSection | undefined {
  return chapters
    .flatMap((chapter) => chapter.sections)
    .find((section) =>
      section.points.some((point) => point.id === pointId || point.demoId === pointId),
    )
}

function findChapter(chapters: CourseChapter[], pointId: string) {
  return chapters.find((chapter) =>
    chapter.sections.some((section) =>
      section.points.some((point) => point.id === pointId || point.demoId === pointId),
    ),
  )
}

export default function CourseHome() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [navigationOpen, setNavigationOpen] = useState(false)
  const [chapters, setChapters] = useState<CourseChapter[]>(localChapters)
  const selectedPointId = searchParams.get('point') ?? DEFAULT_POINT_ID

  useEffect(() => {
    const controller = new AbortController()

    fetchPublishedCourses(controller.signal)
      .then((courses) => {
        const course =
          courses.find((item) => item.code === 'higher-mathematics-1') ?? courses[0]
        if (!course) throw new Error('没有可用的已发布课程')
        return fetchPublishedCourseTree(course.id, controller.signal)
      })
      .then((tree) => {
        const adapted = mergePublishedCourseTree(localChapters, tree)
        setChapters(adapted.chapters)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setChapters(localChapters)
      })

    return () => controller.abort()
  }, [])

  const allPoints = useMemo(() => collectAllPoints(chapters), [chapters])
  const point =
    findPoint(chapters, selectedPointId) ??
    findPoint(chapters, DEFAULT_POINT_ID) ??
    allPoints[0]
  const section = point ? findSection(chapters, point.id) : undefined
  const chapter = point ? findChapter(chapters, point.id) : undefined

  const relatedPoints = useMemo(() => {
    if (!point) return []
    return point.related
      .map((title) => allPoints.find((candidate) => candidate.title === title))
      .filter((candidate): candidate is KnowledgePoint => Boolean(candidate))
  }, [allPoints, point])

  const selectPoint = (pointId: string) => {
    setSearchParams(pointId === DEFAULT_POINT_ID ? {} : { point: pointId })
    setNavigationOpen(false)
  }

  const showDefaultPoint = () => {
    setSearchParams({})
    setNavigationOpen(false)
  }

  const breadcrumb = point
    ? ['首页', COURSE_TITLE, chapter?.title ?? '', section?.title ?? '', point.title].filter(Boolean)
    : ['首页', COURSE_TITLE]

  const handleBreadcrumbClick = (index: number) => {
    if (index <= 1 || !point) {
      showDefaultPoint()
      return
    }
    if (index === 2 && chapter) {
      const first = chapter.sections[0]?.points[0]
      if (first) selectPoint(first.id)
      return
    }
    if (index === 3 && section) {
      const first = section.points[0]
      if (first) selectPoint(first.id)
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#f5f7fa]">
      <CourseHeader
        breadcrumb={breadcrumb}
        onBreadcrumbClick={handleBreadcrumbClick}
        onOpenNavigation={() => setNavigationOpen(true)}
      />

      <DrawerSidebar
        open={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        selectedPointId={point?.id ?? ''}
        onSelectPoint={selectPoint}
        chapters={chapters}
      />

      {point && (
        <div className="flex min-h-0 flex-1 gap-4 p-3 md:p-4">
          <main className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
            <KnowledgeMap
              point={point}
              relatedPoints={relatedPoints}
              onSelectPoint={selectPoint}
            />
            <KnowledgeCards
              points={section?.points ?? [point]}
              selectedPointId={point.id}
              onSelectPoint={selectPoint}
              sectionTitle={section?.title}
            />
          </main>

          <KnowledgeDetail point={point} />
        </div>
      )}
    </div>
  )
}
