import {
  hasContentValidationErrors,
  validateContentCatalog,
  validateKnowledgePointVersionBundle,
} from './validation.js'
import {
  createPublishedContentSeed,
  type PublishedContentSeed,
} from './publishedSeed.js'
import type {
  Chapter,
  Course,
  KnowledgePoint,
  KnowledgePointVersion,
  KnowledgePointVersionBundle,
} from './types.js'

function copy<T>(value: T): T {
  return structuredClone(value)
}

function formatValidationFailure(
  scope: string,
  issues: ReturnType<typeof validateContentCatalog>,
): string {
  return issues
    .filter((issue) => issue.severity === 'error')
    .map(
      (issue) =>
        `${scope}:${issue.path}:${issue.code} ${issue.message}`,
    )
    .join('\n')
}

/**
 * 首期使用内存仓储承接发布内容。
 * 接口刻意保持为仓储语义，后续可替换为 LowDB/PostgreSQL，
 * 而不改动路由和前端 DTO。
 */
export class InMemoryContentRepository {
  private readonly seed: PublishedContentSeed
  private readonly bundlesByVersionId: ReadonlyMap<
    string,
    KnowledgePointVersionBundle
  >

  constructor(seed = createPublishedContentSeed()) {
    const catalogIssues = validateContentCatalog(
      seed.snapshot,
    )

    if (hasContentValidationErrors(catalogIssues)) {
      throw new Error(
        formatValidationFailure(
          'catalog',
          catalogIssues,
        ),
      )
    }

    for (const bundle of seed.bundles) {
      const issues =
        validateKnowledgePointVersionBundle(bundle)

      if (hasContentValidationErrors(issues)) {
        throw new Error(
          formatValidationFailure(
            bundle.version.id,
            issues,
          ),
        )
      }
    }

    this.seed = copy(seed)
    this.bundlesByVersionId = new Map(
      this.seed.bundles.map((bundle) => [
        bundle.version.id,
        bundle,
      ]),
    )
  }

  listCourses(): Course[] {
    return copy(this.seed.snapshot.courses)
  }

  getCourseById(id: string): Course | null {
    const course = this.seed.snapshot.courses.find(
      (item) => item.id === id,
    )

    return course ? copy(course) : null
  }

  listChaptersByCourse(courseId: string): Chapter[] {
    return copy(
      this.seed.snapshot.chapters.filter(
        (chapter) => chapter.courseId === courseId,
      ),
    )
  }

  listKnowledgePoints(): KnowledgePoint[] {
    return copy(this.seed.snapshot.knowledgePoints)
  }

  getKnowledgePointById(
    id: string,
  ): KnowledgePoint | null {
    const knowledgePoint =
      this.seed.snapshot.knowledgePoints.find(
        (item) => item.id === id,
      )

    return knowledgePoint
      ? copy(knowledgePoint)
      : null
  }

  listVersionsByKnowledgePoint(
    knowledgePointId: string,
  ): KnowledgePointVersion[] {
    return copy(
      this.seed.snapshot.versions.filter(
        (version) =>
          version.knowledgePointId ===
          knowledgePointId,
      ),
    )
  }

  getBundleByVersionId(
    versionId: string,
  ): KnowledgePointVersionBundle | null {
    const bundle = this.bundlesByVersionId.get(versionId)
    return bundle ? copy(bundle) : null
  }
}

export const contentRepository =
  new InMemoryContentRepository()
