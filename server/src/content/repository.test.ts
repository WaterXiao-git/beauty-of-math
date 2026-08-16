import assert from 'node:assert/strict'
import test from 'node:test'

import { createPublishedContentSeed } from './publishedSeed.js'
import { InMemoryContentRepository } from './repository.js'
import {
  getPublishedCourseTree,
  getPublishedKnowledgePoint,
  getPublishedKnowledgePointVersion,
  listPublishedCourses,
  listPublishedKnowledgePointVersions,
} from '../services/contentCatalogService.js'

function createRepository() {
  return new InMemoryContentRepository(
    createPublishedContentSeed(),
  )
}

test(
  '发布内容种子通过校验并生成课程统计',
  () => {
    const courses = listPublishedCourses(
      createRepository(),
    )

    assert.equal(courses.length, 1)
    assert.deepEqual(courses[0], {
      id: 'higher-mathematics-volume-1',
      code: 'higher-mathematics-1',
      title: '高等数学（上册）',
      description:
        '以函数、极限、导数和微分中值定理为主线的交互式课程。',
      sortOrder: 1,
      chapterCount: 4,
      sectionCount: 11,
      knowledgePointCount: 18,
      publishedKnowledgePointCount: 3,
    })
  },
)

test(
  '课程树包含章节、小节和已发布知识点',
  () => {
    const tree = getPublishedCourseTree(
      'higher-mathematics-volume-1',
      createRepository(),
    )

    assert.ok(tree)
    assert.equal(tree.chapters.length, 4)
    assert.equal(tree.chapters[0].children.length, 3)

    const points = tree.chapters.flatMap((chapter) =>
      chapter.children.flatMap((section) => section.knowledgePoints),
    )
    const functionPoint = points.find((point) => point.id === 'function')
    const limitPoint = points.find((point) => point.id === 'epsilon-delta')

    assert.equal(points.length, 18)
    assert.equal(functionPoint?.availability, 'cataloged')
    assert.equal(functionPoint?.contentVersion, null)
    assert.equal(functionPoint?.demoPath, null)
    assert.equal(limitPoint?.availability, 'published')
    assert.equal(limitPoint?.demoPath, '/demo/epsilon-delta')
  },
)

test(
  '知识点详情固定到发布版本、案例、步骤和主模板',
  () => {
    const detail = getPublishedKnowledgePoint(
      'derivative',
      createRepository(),
    )

    assert.ok(detail)
    assert.equal(detail.knowledgePoint.title, '导数')
    assert.equal(detail.version.contentVersion, '1.0.0')
    assert.match(
      detail.version.contentHash ?? '',
      /^sha256:[a-f0-9]{64}$/,
    )
    assert.equal(detail.cases.length, 2)
    assert.equal(detail.steps.length, 4)
    assert.equal(detail.templateBindings.length, 1)
    assert.equal(
      detail.primaryTemplate?.implementationRef,
      'client/src/demo/DerivativeDemo.tsx',
    )
  },
)

test(
  '仅进入课程目录的知识点不会伪装成已发布演示',
  () => {
    const detail = getPublishedKnowledgePoint(
      'function',
      createRepository(),
    )

    assert.equal(detail, null)
  },
)

test(
  '版本历史和指定发布版本可以稳定读取',
  () => {
    const repository = createRepository()
    const versions = listPublishedKnowledgePointVersions(
      'rolle',
      repository,
    )
    const bundle = getPublishedKnowledgePointVersion(
      'rolle',
      '1.0.0',
      repository,
    )

    assert.equal(versions?.length, 1)
    assert.equal(versions?.[0].isCurrent, true)
    assert.equal(bundle?.version.contentVersion, '1.0.0')
    assert.equal(
      getPublishedKnowledgePointVersion(
        'rolle',
        '9.9.9',
        repository,
      ),
      null,
    )
  },
)

test(
  '仓储拒绝章节循环等非法发布数据',
  () => {
    const seed = createPublishedContentSeed()
    const root = seed.snapshot.chapters.find(
      (chapter) => chapter.parentChapterId === null,
    )
    const child = seed.snapshot.chapters.find(
      (chapter) =>
        chapter.parentChapterId === root?.id,
    )

    assert.ok(root)
    assert.ok(child)
    root.parentChapterId = child.id

    assert.throws(
      () => new InMemoryContentRepository(seed),
      /chapter-cycle/,
    )
  },
)
