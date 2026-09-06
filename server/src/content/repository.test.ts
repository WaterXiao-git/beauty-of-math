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
      id: 'higher-mathematics',
      code: 'higher-mathematics',
      title: '高等数学',
      description: '从函数与极限到无穷级数',
      sortOrder: 1,
      chapterCount: 14,
      sectionCount: 14,
      knowledgePointCount: 150,
      publishedKnowledgePointCount: 150,
    })
  },
)

test(
  '课程树包含章节、小节和已发布知识点',
  () => {
    const tree = getPublishedCourseTree(
      'higher-mathematics',
      createRepository(),
    )

    assert.ok(tree)
    assert.equal(tree.chapters.length, 14)
    assert.equal(tree.chapters[0].children.length, 1)

    const points = tree.chapters.flatMap((chapter) =>
      chapter.children.flatMap((section) => section.knowledgePoints),
    )
    const functionPoint = points.find((point) => point.id === 'hm-01-01')
    const limitPoint = points.find((point) => point.id === 'hm-02-02')

    assert.equal(points.length, 150)
    assert.equal(functionPoint?.availability, 'published')
    assert.equal(functionPoint?.contentVersion, '1.0.0')
    assert.equal(functionPoint?.demoPath, '/demo/hm-01-01')
    assert.equal(limitPoint?.availability, 'published')
    assert.equal(limitPoint?.demoPath, '/demo/hm-02-02')
  },
)

test(
  '知识点详情固定到发布版本、案例、步骤和主模板',
  () => {
    const detail = getPublishedKnowledgePoint(
      'hm-04-05',
      createRepository(),
    )

    assert.ok(detail)
    assert.equal(detail.knowledgePoint.title, '导数的几何意义')
    assert.equal(detail.version.contentVersion, '1.0.0')
    assert.match(
      detail.version.contentHash ?? '',
      /^sha256:[a-f0-9]{64}$/,
    )
    assert.equal(detail.cases.length, 1)
    assert.equal(detail.steps.length, 4)
    assert.equal(detail.templateBindings.length, 1)
    assert.equal(
      detail.primaryTemplate?.implementationRef,
      'client/src/demo/knowledge/KnowledgeExperiment.tsx',
    )
  },
)

test(
  '不存在的知识点不会伪装成已发布演示',
  () => {
    const detail = getPublishedKnowledgePoint(
      'missing-point',
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
      'hm-05-01',
      repository,
    )
    const bundle = getPublishedKnowledgePointVersion(
      'hm-05-01',
      '1.0.0',
      repository,
    )

    assert.equal(versions?.length, 1)
    assert.equal(versions?.[0].isCurrent, true)
    assert.equal(bundle?.version.contentVersion, '1.0.0')
    assert.equal(
      getPublishedKnowledgePointVersion(
        'hm-05-01',
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
