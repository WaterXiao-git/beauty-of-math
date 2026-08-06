import {
  contentRepository,
  type InMemoryContentRepository,
} from '../content/repository.js'
import type {
  Chapter,
  KnowledgePoint,
  KnowledgePointVersionBundle,
  TemplateDefinition,
} from '../content/types.js'

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

function isPublicPublished(
  item: {
    status: string
    visibility?: string
  },
): boolean {
  return (
    item.status === 'published' &&
    (item.visibility === undefined ||
      item.visibility === 'public')
  )
}

function getPrimaryTemplate(
  bundle: KnowledgePointVersionBundle,
): TemplateDefinition | null {
  const primaryBinding = bundle.templateBindings
    .filter((binding) => binding.isPrimary)
    .sort((left, right) => left.priority - right.priority)[0]

  if (!primaryBinding) {
    return null
  }

  return (
    bundle.templates.find(
      (template) =>
        template.id === primaryBinding.templateVersionId,
    ) ?? null
  )
}

function toKnowledgeSummary(
  knowledgePoint: KnowledgePoint,
  repository: InMemoryContentRepository,
): PublishedKnowledgePointSummary | null {
  if (
    !isPublicPublished(knowledgePoint) ||
    !knowledgePoint.currentPublishedVersionId
  ) {
    return null
  }

  const bundle = repository.getBundleByVersionId(
    knowledgePoint.currentPublishedVersionId,
  )

  if (!bundle || bundle.version.status !== 'published') {
    return null
  }

  const template = getPrimaryTemplate(bundle)

  return {
    id: knowledgePoint.id,
    code: knowledgePoint.code,
    title: knowledgePoint.title,
    summary: knowledgePoint.summary,
    aliases: knowledgePoint.aliases,
    tags: knowledgePoint.tags,
    contentVersion: bundle.version.contentVersion,
    demoPath: `/demo/${knowledgePoint.id}`,
    templateKey: template?.key ?? null,
  }
}

function buildChapterNode(
  chapter: Chapter,
  chapters: readonly Chapter[],
  knowledgePoints: readonly KnowledgePoint[],
  repository: InMemoryContentRepository,
): PublishedChapterNode {
  const summaries = knowledgePoints
    .filter(
      (knowledgePoint) =>
        knowledgePoint.chapterId === chapter.id,
    )
    .map((knowledgePoint) =>
      toKnowledgeSummary(knowledgePoint, repository),
    )
    .filter(
      (
        summary,
      ): summary is PublishedKnowledgePointSummary =>
        summary !== null,
    )

  const children = chapters
    .filter(
      (candidate) =>
        candidate.parentChapterId === chapter.id,
    )
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((child) =>
      buildChapterNode(
        child,
        chapters,
        knowledgePoints,
        repository,
      ),
    )

  return {
    id: chapter.id,
    code: chapter.code,
    title: chapter.title,
    description: chapter.description,
    sortOrder: chapter.sortOrder,
    knowledgePoints: summaries,
    children,
  }
}

export function listPublishedCourses(
  repository = contentRepository,
) {
  const knowledgePoints = repository
    .listKnowledgePoints()
    .filter(isPublicPublished)

  return repository
    .listCourses()
    .filter(isPublicPublished)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((course) => {
      const chapters = repository
        .listChaptersByCourse(course.id)
        .filter((chapter) => chapter.status === 'published')
      const chapterIds = new Set(
        chapters.map((chapter) => chapter.id),
      )

      return {
        id: course.id,
        code: course.code,
        title: course.title,
        description: course.description,
        sortOrder: course.sortOrder,
        chapterCount: chapters.filter(
          (chapter) => chapter.parentChapterId === null,
        ).length,
        sectionCount: chapters.filter(
          (chapter) => chapter.parentChapterId !== null,
        ).length,
        knowledgePointCount: knowledgePoints.filter(
          (knowledgePoint) =>
            chapterIds.has(knowledgePoint.chapterId),
        ).length,
      }
    })
}

export function getPublishedCourseTree(
  courseId: string,
  repository = contentRepository,
) {
  const course = repository.getCourseById(courseId)

  if (!course || !isPublicPublished(course)) {
    return null
  }

  const chapters = repository
    .listChaptersByCourse(course.id)
    .filter((chapter) => chapter.status === 'published')
  const knowledgePoints = repository.listKnowledgePoints()

  return {
    course: {
      id: course.id,
      code: course.code,
      title: course.title,
      description: course.description,
    },
    chapters: chapters
      .filter((chapter) => chapter.parentChapterId === null)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((chapter) =>
        buildChapterNode(
          chapter,
          chapters,
          knowledgePoints,
          repository,
        ),
      ),
  }
}

export function getPublishedKnowledgePoint(
  knowledgePointId: string,
  repository = contentRepository,
) {
  const knowledgePoint = repository.getKnowledgePointById(
    knowledgePointId,
  )

  if (
    !knowledgePoint ||
    !isPublicPublished(knowledgePoint) ||
    !knowledgePoint.currentPublishedVersionId
  ) {
    return null
  }

  const bundle = repository.getBundleByVersionId(
    knowledgePoint.currentPublishedVersionId,
  )

  if (!bundle || bundle.version.status !== 'published') {
    return null
  }

  return {
    ...bundle,
    primaryTemplate: getPrimaryTemplate(bundle),
    demoPath: `/demo/${knowledgePoint.id}`,
  }
}

export function listPublishedKnowledgePointVersions(
  knowledgePointId: string,
  repository = contentRepository,
) {
  const knowledgePoint = repository.getKnowledgePointById(
    knowledgePointId,
  )

  if (!knowledgePoint || !isPublicPublished(knowledgePoint)) {
    return null
  }

  return repository
    .listVersionsByKnowledgePoint(knowledgePointId)
    .filter(
      (version) => version.status === 'published',
    )
    .sort((left, right) =>
      right.contentVersion.localeCompare(
        left.contentVersion,
        undefined,
        { numeric: true },
      ),
    )
    .map((version) => ({
      id: version.id,
      contentVersion: version.contentVersion,
      implementationVersion:
        version.implementationVersion,
      changeSummary: version.changeSummary,
      contentHash: version.contentHash,
      publishedAt: version.publishedAt,
      isCurrent:
        version.id ===
        knowledgePoint.currentPublishedVersionId,
    }))
}

export function getPublishedKnowledgePointVersion(
  knowledgePointId: string,
  contentVersion: string,
  repository = contentRepository,
) {
  const knowledgePoint = repository.getKnowledgePointById(
    knowledgePointId,
  )

  if (!knowledgePoint || !isPublicPublished(knowledgePoint)) {
    return null
  }

  const version = repository
    .listVersionsByKnowledgePoint(knowledgePointId)
    .find(
      (item) =>
        item.contentVersion === contentVersion &&
        item.status === 'published',
    )

  if (!version) {
    return null
  }

  return repository.getBundleByVersionId(version.id)
}
