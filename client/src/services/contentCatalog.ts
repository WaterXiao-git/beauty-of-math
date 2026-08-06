export interface PublishedCourseSummary {
  id: string
  code: string
  title: string
  description: string
  chapterCount: number
  sectionCount: number
  knowledgePointCount: number
}

export interface PublishedKnowledgePointSummary {
  id: string
  code: string
  title: string
  summary: string
  aliases: string[]
  tags: string[]
  contentVersion: string
  demoPath: string
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
