import type {
  PublishedCourseTree,
  PublishedKnowledgePointSummary,
} from '../services/contentCatalog'
import type { CourseChapter, KnowledgePoint } from './courseData'

export interface AdaptedCourseContent {
  chapters: CourseChapter[]
  syncedPointIds: Set<string>
}

function findPublishedPoint(
  tree: PublishedCourseTree,
  point: KnowledgePoint,
): PublishedKnowledgePointSummary | undefined {
  for (const chapter of tree.chapters) {
    for (const section of chapter.children) {
      const match = section.knowledgePoints.find(
        (candidate) => candidate.id === point.id || candidate.id === point.demoId,
      )
      if (match) return match
    }
  }

  return undefined
}

/**
 * 正式发布数据覆盖本地展示字段；尚未迁入后端的知识点继续使用本地课程数据。
 * 这样内容后台可以逐点迁移，而不会让前端目录从 15 项骤减到 3 项。
 */
export function mergePublishedCourseTree(
  localChapters: CourseChapter[],
  tree: PublishedCourseTree,
): AdaptedCourseContent {
  const syncedPointIds = new Set<string>()
  const chapters = localChapters.map((chapter) => ({
    ...chapter,
    sections: chapter.sections.map((section) => ({
      ...section,
      points: section.points.map((point) => {
        const published = findPublishedPoint(tree, point)
        if (!published) return { ...point }

        syncedPointIds.add(point.id)
        return {
          ...point,
          title: published.title,
          summary: published.summary,
          template: published.templateKey ?? point.template,
          demoId: published.id,
          backendId: published.id,
          contentVersion: published.contentVersion,
          source: 'published' as const,
        }
      }),
    })),
  }))

  return { chapters, syncedPointIds }
}
