export interface PublishedCourseSummary {
  id: string
  code: string
  title: string
  description: string
  chapterCount: number
  sectionCount: number
  knowledgePointCount: number
  publishedKnowledgePointCount: number
}

export interface PublishedKnowledgePointSummary {
  id: string
  code: string
  title: string
  summary: string
  aliases: string[]
  tags: string[]
  availability: 'cataloged' | 'published'
  contentVersion: string | null
  demoPath: string | null
  templateKey: string | null
}

export interface PublishedChapterNode {
  id: string
  code: string
  title: string
  description: string
  sortOrder: number
  knowledgePoints: PublishedKnowledgePointSummary[]
  children: PublishedChapterNode[]
}

export interface PublishedCourseTree {
  course: Pick<PublishedCourseSummary, 'id' | 'code' | 'title' | 'description'>
  chapters: PublishedChapterNode[]
}

export interface PublishedExperiment {
  id: string
  path: string
  title: string
  description: string
  topics: string[]
  difficulty: string
  hasAnimation: boolean
  hasSteps: boolean
  courseId?: string
  courseName?: string
  chapterId?: string
  chapterName?: string
  knowledgePointIds?: string[]
  knowledgePointNames?: string[]
  tags?: string[]
  keywords?: string[]
}

export interface ExperimentTaxonomyCourse {
  id: string
  name: string
  count: number
  chapterCount: number
}

export interface ExperimentTaxonomyChapter {
  id: string
  name: string
  count: number
  courseId: string
}

export interface ExperimentTaxonomyKnowledgePoint {
  id: string
  name: string
  count: number
  courseId: string
  chapterId: string
}

export interface ExperimentCatalogResponse {
  total: number
  offset: number
  limit: number
  hasMore: boolean
  items: PublishedExperiment[]
  facets: {
    difficulties: Record<string, number>
    topics: Record<string, number>
    taxonomy: {
      courses: ExperimentTaxonomyCourse[]
      chapters: ExperimentTaxonomyChapter[]
      knowledgePoints: ExperimentTaxonomyKnowledgePoint[]
      unclassifiedCount: number
    }
  }
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, {
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok) {
    throw new Error(`内容服务请求失败（${response.status}）`)
  }

  return response.json() as Promise<T>
}

export function fetchPublishedCourses(signal?: AbortSignal) {
  return getJson<PublishedCourseSummary[]>('/api/content/courses', signal)
}

export function fetchPublishedCourseTree(courseId: string, signal?: AbortSignal) {
  return getJson<PublishedCourseTree>(
    `/api/content/courses/${encodeURIComponent(courseId)}/tree`,
    signal,
  )
}

export function fetchExperimentCatalog(
  query: {
    q?: string
    difficulty?: string
    topic?: string
    courseId?: string
    chapterId?: string
    knowledgePointId?: string
    offset?: number
    limit?: number
  },
  signal?: AbortSignal,
) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }

  return getJson<ExperimentCatalogResponse>(
    `/api/content/experiments?${params.toString()}`,
    signal,
  )
}
