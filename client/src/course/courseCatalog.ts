import {
  COURSE_SUBTITLE,
  COURSE_TITLE,
  courseChapters,
  type CourseChapter,
  type CourseSection,
  type KnowledgePoint,
} from './courseData'

export interface UniversityCourse {
  id: string
  title: string
  subtitle: string
  chapters: CourseChapter[]
}

export const HIGHER_MATHEMATICS_COURSE: UniversityCourse = {
  id: 'higher-mathematics',
  title: COURSE_TITLE,
  subtitle: COURSE_SUBTITLE,
  chapters: courseChapters,
}
Object.freeze(HIGHER_MATHEMATICS_COURSE)

export const courses: UniversityCourse[] = [HIGHER_MATHEMATICS_COURSE]
Object.freeze(courses)

export const DEFAULT_COURSE_ID = HIGHER_MATHEMATICS_COURSE.id

export function collectCoursePoints(course: UniversityCourse): KnowledgePoint[] {
  return course.chapters.flatMap((chapter) => chapter.sections.flatMap((section) => section.points))
}

export function findCourse(courseId: string | null | undefined): UniversityCourse {
  return courses.find((course) => course.id === courseId) ?? HIGHER_MATHEMATICS_COURSE
}

export function findCourseOfPoint(pointId: string): UniversityCourse | undefined {
  return courses.find((course) => collectCoursePoints(course).some((point) => point.id === pointId))
}

export function findPointAcrossCourses(pointId: string): KnowledgePoint | undefined {
  for (const course of courses) {
    const point = collectCoursePoints(course).find((candidate) => candidate.id === pointId)
    if (point) return point
  }
  return undefined
}

export function findSectionInCourse(course: UniversityCourse, pointId: string): CourseSection | undefined {
  return course.chapters.flatMap((chapter) => chapter.sections).find((section) =>
    section.points.some((point) => point.id === pointId),
  )
}

export function findChapterInCourse(course: UniversityCourse, pointId: string): CourseChapter | undefined {
  return course.chapters.find((chapter) => chapter.sections.some((section) =>
    section.points.some((point) => point.id === pointId),
  ))
}

/** 按关联与先修边做最多两层广度遍历，为知识地图提供稳定的邻接节点。 */
export function collectRelatedPoints(course: UniversityCourse, source: KnowledgePoint, depth = 2, limit = 6): KnowledgePoint[] {
  const points = collectCoursePoints(course)
  const byId = new Map(points.map((point) => [point.id, point]))
  const byTitle = new Map(points.map((point) => [point.title, point]))
  const result: KnowledgePoint[] = []
  const seen = new Set([source.id])
  let frontier: KnowledgePoint[] = [source]

  for (let level = 0; level < depth && frontier.length > 0 && result.length < limit; level += 1) {
    const next: KnowledgePoint[] = []
    for (const point of frontier) {
      const neighbors = [
        ...(point.relatedIds ?? []).map((id) => byId.get(id)),
        ...(point.prerequisiteIds ?? []).map((id) => byId.get(id)),
        ...point.related.map((title) => byTitle.get(title)),
      ].filter((candidate): candidate is KnowledgePoint => Boolean(candidate))
      for (const candidate of neighbors) {
        if (seen.has(candidate.id)) continue
        seen.add(candidate.id)
        result.push(candidate)
        next.push(candidate)
        if (result.length >= limit) break
      }
      if (result.length >= limit) break
    }
    frontier = next
  }
  return result
}
