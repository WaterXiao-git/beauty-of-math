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
