#!/usr/bin/env npx ts-node

import { OWNED_EXPERIMENT_CATALOG } from '../src/owned-experiments/catalog.generated'
import { collectCoursePoints, courses } from '../src/course/courseCatalog'

const EXPECTED_CHAPTER_COUNT = 4
const EXPECTED_RENDERER_COUNT = OWNED_EXPERIMENT_CATALOG.length

function fail(message: string): never {
  throw new Error(`课程完整性检查失败：${message}`)
}

function main() {
  const courseIds = courses.map((course) => course.id)
  if (courseIds.length !== 1 || courseIds[0] !== 'higher-mathematics-1') {
    fail('应只发布高等数学（上册）。')
  }

  const [course] = courses
  if (course.chapters.length !== EXPECTED_CHAPTER_COUNT) {
    fail(`应发布 ${EXPECTED_CHAPTER_COUNT} 章，实际为 ${course.chapters.length} 章。`)
  }

  const rendererIds = collectCoursePoints(course)
    .map((point) => point.rendererId)
    .filter((rendererId): rendererId is NonNullable<typeof rendererId> => Boolean(rendererId))

  if (rendererIds.length !== EXPECTED_RENDERER_COUNT) {
    fail(`应绑定 ${EXPECTED_RENDERER_COUNT} 个 renderer，实际为 ${rendererIds.length} 个。`)
  }

  if (new Set(rendererIds).size !== rendererIds.length) {
    fail('rendererId 不能重复。')
  }

  const ownedRendererIds = new Set(OWNED_EXPERIMENT_CATALOG.map((experiment) => experiment.id))
  const unknownRendererIds = rendererIds.filter((rendererId) => !ownedRendererIds.has(rendererId))
  if (unknownRendererIds.length > 0) {
    fail(`rendererId 不在自研清单中：${unknownRendererIds.join(', ')}。`)
  }

  console.log(`课程完整性检查通过：1 门课程、${course.chapters.length} 章、${rendererIds.length} 个 renderer 绑定。`)
}

main()
