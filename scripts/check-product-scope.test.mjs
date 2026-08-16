import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

const ROOT_DIRECTORY = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CHECKER = join(ROOT_DIRECTORY, 'scripts/check-product-scope.mjs')
const OWNED_EXPERIMENT_IDS = [
  'continuity',
  'continuity-properties',
  'definite-integral',
  'derivative',
  'differential',
  'epsilon-delta',
  'function',
  'function-properties',
  'function-representation',
  'graphing',
  'indefinite-integral',
  'infinitesimal',
  'limit-laws',
  'limit-of-sequence',
  'newton-method',
  'rolle',
  'taylor',
  'two-important-limits',
]

async function writeFixtureFile(rootDirectory, filePath, content) {
  const target = join(rootDirectory, filePath)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, content)
}

async function createValidFixture() {
  const rootDirectory = await mkdtemp(join(tmpdir(), 'product-scope-'))
  const catalog = OWNED_EXPERIMENT_IDS.map((id) => ({
    id,
    path: `/demo/${id}`,
    ownership: 'self-developed',
  }))

  await writeFixtureFile(rootDirectory, 'package.json', JSON.stringify({ type: 'module' }))
  await writeFixtureFile(rootDirectory, 'config/owned-experiments.json', JSON.stringify(catalog))
  await writeFixtureFile(rootDirectory, 'client/src/course/courseCatalog.ts', [
    "import { courseChapters } from './courseData'",
    'export interface UniversityCourse { id: string; chapters: unknown[] }',
    "export const HIGHER_MATHEMATICS_COURSE = { id: 'higher-mathematics-1', chapters: courseChapters }",
    'Object.freeze(HIGHER_MATHEMATICS_COURSE)',
    'export const courses: UniversityCourse[] = [HIGHER_MATHEMATICS_COURSE]',
    'Object.freeze(courses)',
  ].join('\n'))
  await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', [
    "export const courseChapters = [",
    "  { id: 'ch1', title: '函数、极限与连续' },",
    "  { id: 'ch2', title: '导数与微分' },",
    "  { id: 'ch3', title: '微分中值定理与导数的应用' },",
    "  { id: 'ch4', title: '不定积分与定积分' },",
    '] as const',
    'for (const chapter of courseChapters) Object.freeze(chapter)',
    'Object.freeze(courseChapters)',
  ].join('\n'))
  await mkdir(join(rootDirectory, 'server/src'), { recursive: true })

  return rootDirectory
}

function validCourseData(...statements) {
  return [
    "export const courseChapters = [",
    "  { id: 'ch1', title: '函数、极限与连续' },",
    "  { id: 'ch2', title: '导数与微分' },",
    "  { id: 'ch3', title: '微分中值定理与导数的应用' },",
    "  { id: 'ch4', title: '不定积分与定积分' },",
    '] as const',
    'for (const chapter of courseChapters) Object.freeze(chapter)',
    'Object.freeze(courseChapters)',
    ...statements,
  ].join('\n')
}

function runChecker(rootDirectory, ...arguments_) {
  return spawnSync(process.execPath, [CHECKER, '--root', rootDirectory, ...arguments_], {
    encoding: 'utf8',
  })
}

async function listFiles(rootDirectory, currentDirectory = rootDirectory) {
  const entries = await readdir(currentDirectory, { withFileTypes: true })
  const result = []
  for (const entry of entries) {
    const path = join(currentDirectory, entry.name)
    if (entry.isDirectory()) {
      result.push(...await listFiles(rootDirectory, path))
      continue
    }
    result.push(relative(rootDirectory, path).replaceAll('\\', '/'))
  }
  return result.sort()
}

async function withFixture(callback) {
  const rootDirectory = await createValidFixture()
  try {
    await callback(rootDirectory)
  } finally {
    await rm(rootDirectory, { recursive: true, force: true })
  }
}

test('接受仅含允许目录、十八项自研清单和高数上四章的交付物，且不改写工作区', async () => {
  await withFixture(async (rootDirectory) => {
    const before = await listFiles(rootDirectory)
    const result = runChecker(rootDirectory)

    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /1 门课程、4 章、18 个正式实验/)
    assert.deepEqual(await listFiles(rootDirectory), before)
  })
})

test('拒绝未在运行时冻结的正式课程范围', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', [
      "export const courseChapters = [",
      "  { id: 'ch1', title: '函数、极限与连续' },",
      "  { id: 'ch2', title: '导数与微分' },",
      "  { id: 'ch3', title: '微分中值定理与导数的应用' },",
      "  { id: 'ch4', title: '不定积分与定积分' },",
      '] as const',
    ].join('\n'))
    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /运行时冻结/)
  })
})

test('报告旧 experiments/fourier 目录的精确路径', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/experiments/fourier/index.ts', 'export {}\n')

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /client\/src\/experiments\/fourier/)
  })
})

test('在 --dist 模式报告含旧实验总数文案的精确构建产物路径', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(
      rootDirectory,
      'client/dist/assets/index.js',
      '浏览全部 300 个可视化实验',
    )

    const result = runChecker(rootDirectory, '--dist')

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /client\/dist\/assets\/index\.js/)
  })
})

test('拒绝总数仍为十八项但来源不是 self-developed 的清单', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'config/owned-experiments.json', JSON.stringify([
      ...OWNED_EXPERIMENT_IDS.slice(0, -1).map((id) => ({
        id,
        path: `/demo/${id}`,
        ownership: 'self-developed',
      })),
      { id: 'two-important-limits', path: '/demo/two-important-limits', ownership: 'licensed' },
    ]))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /config\/owned-experiments\.json/)
  })
})

test('静态拒绝 push 混入的第五章，不执行被审计课程模块', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', [
      "export const courseChapters = [",
      "  { id: 'ch1', title: '函数、极限与连续' },",
      "  { id: 'ch2', title: '导数与微分' },",
      "  { id: 'ch3', title: '微分中值定理与导数的应用' },",
      "  { id: 'ch4', title: '不定积分与定积分' },",
      ']',
      "courseChapters.push({ id: 'chapter-five', title: '无权发布的第五章' })",
    ].join('\n'))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /client\/src\/course\/courseData\.ts/)
  })
})

test('静态拒绝章节数组的 spread', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', [
      "const approved = [",
      "  { id: 'ch1', title: '函数、极限与连续' },",
      "  { id: 'ch2', title: '导数与微分' },",
      "  { id: 'ch3', title: '微分中值定理与导数的应用' },",
      "  { id: 'ch4', title: '不定积分与定积分' },",
      '] as const',
      'export const courseChapters = [...approved]',
    ].join('\n'))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /client\/src\/course\/courseData\.ts/)
  })
})

test('静态拒绝章节数组的计算属性变更', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', [
      "export const courseChapters = [",
      "  { id: 'ch1', title: '函数、极限与连续' },",
      "  { id: 'ch2', title: '导数与微分' },",
      "  { id: 'ch3', title: '微分中值定理与导数的应用' },",
      "  { id: 'ch4', title: '不定积分与定积分' },",
      '] as const',
      "courseChapters['push']({ id: 'chapter-five', title: '无权发布的第五章' })",
    ].join('\n'))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /client\/src\/course\/courseData\.ts/)
  })
})

test('静态拒绝通过别名 push 变更章节范围', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData(
      'const scopeAlias = courseChapters as any',
      "scopeAlias.push({ id: 'ch5', title: '无权发布的第五章' })",
    ))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /client\/src\/course\/courseData\.ts: 无法静态证明课程章节范围（client\/src\/course\/courseData\.ts 不允许对正式课程范围作动态或计算属性变更。/)
  })
})

test('允许可证明只读的 const 导出别名，但继续追踪它', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData('export const chapters = courseChapters'))

    const result = runChecker(rootDirectory)

    assert.equal(result.status, 0, result.stderr)
  })
})

test('静态拒绝将章节范围传给未知函数', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData('unknownFunction(courseChapters)'))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /client\/src\/course\/courseData\.ts: 无法静态证明课程章节范围（不允许将受保护课程范围传给未知函数。/)
  })
})

test('静态拒绝将章节范围传给 Object.assign', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData('Object.assign(courseChapters, [])'))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /client\/src\/course\/courseData\.ts: 无法静态证明课程章节范围（不允许将受保护课程范围传给 Object\.assign 或 Reflect\.set。/)
  })
})

test('静态拒绝将章节范围传给 Reflect.set', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData("Reflect.set(courseChapters, '4', { id: 'ch5' })"))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /client\/src\/course\/courseData\.ts: 无法静态证明课程章节范围（不允许将受保护课程范围传给 Object\.assign 或 Reflect\.set。/)
  })
})

test('静态拒绝 courses 的别名变更', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseCatalog.ts', [
      "import { courseChapters } from './courseData'",
      'export interface UniversityCourse { id: string; chapters: unknown[] }',
      "export const HIGHER_MATHEMATICS_COURSE = { id: 'higher-mathematics-1', chapters: courseChapters }",
      'export const courses: UniversityCourse[] = [HIGHER_MATHEMATICS_COURSE]',
      'const scopeAlias = courses as any',
      "scopeAlias.push({ id: 'unapproved-course' })",
    ].join('\n'))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /client\/src\/course\/courseCatalog\.ts: 无法静态证明正式课程范围（client\/src\/course\/courseCatalog\.ts 不允许对正式课程范围作动态或计算属性变更。/)
  })
})

test('静态拒绝 forEach 回调中修改章节属性', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData(
      "courseChapters.forEach((chapter) => { chapter.title = '未批准' })",
    ))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /不允许对受保护课程元素作属性或计算属性变更。/)
  })
})

test('静态拒绝 map 回调中通过计算属性修改章节', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData(
      "courseChapters.map((chapter) => { chapter['id'] = 'ch5'; return chapter })",
    ))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /不允许对受保护课程元素作属性或计算属性变更。/)
  })
})

test('静态拒绝 reduce 回调将章节传给未知函数', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData(
      'courseChapters.reduce((count, chapter) => { unknownFunction(chapter); return count }, 0)',
    ))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /不允许将受保护课程元素传给未知函数。/)
  })
})

test('静态拒绝 for-of 中通过计算属性修改章节', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData(
      "for (const chapter of courseChapters) chapter['title'] = '未批准'",
    ))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /不允许对受保护课程元素作属性或计算属性变更。/)
  })
})

test('静态拒绝删除或自增章节属性', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData(
      'for (const chapter of courseChapters) { delete chapter.title }',
    ))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /不允许删除受保护课程元素属性。/)
  })
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData(
      'for (const chapter of courseChapters) { chapter.id++ }',
    ))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /不允许对受保护课程元素作属性或计算属性变更。/)
  })
})

test('静态拒绝通过 Object.assign 或 Reflect.set 变更章节', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData(
      "courseChapters.forEach((chapter) => Object.assign(chapter, { title: '未批准' }))",
    ))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /不允许将受保护课程元素传给 Object\.assign 或 Reflect\.set。/)
  })
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData(
      "courseChapters.forEach((chapter) => Reflect.set(chapter, 'title', '未批准'))",
    ))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /不允许将受保护课程元素传给 Object\.assign 或 Reflect\.set。/)
  })
})

test('允许 find 回调与 for-of 对章节进行只读查询', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData(
      "courseChapters.find((chapter) => chapter.id === 'ch1')",
      'for (const chapter of courseChapters) { const title = chapter.title; void title }',
    ))

    const result = runChecker(rootDirectory)

    assert.equal(result.status, 0, result.stderr)
  })
})

test('静态拒绝无 initial 的 reduce 与 reduceRight accumulator 变更', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData(
      "courseChapters.reduce((chapter) => { chapter.title = '未批准'; return chapter })",
    ))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /不允许对受保护课程元素作属性或计算属性变更。/)
  })
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData(
      "courseChapters.reduceRight((chapter) => { chapter['title'] = '未批准'; return chapter })",
    ))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /不允许对受保护课程元素作属性或计算属性变更。/)
  })
})

test('静态拒绝 find 和 at 返回元素后的直接或别名写入', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData(
      "courseChapters.find((chapter) => chapter.id === 'ch1').title = '未批准'",
    ))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /不允许对受保护课程元素作属性或计算属性变更。/)
  })
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData(
      'const chapter = courseChapters.at(0)',
      "chapter.title = '未批准'",
    ))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /不允许对受保护课程元素作属性或计算属性变更。/)
  })
})

test('静态拒绝 filter 索引和 findLast 结果别名写入', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData(
      "courseChapters.filter((chapter) => chapter.id === 'ch1')[0]['title'] = '未批准'",
    ))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /不允许对受保护课程元素作属性或计算属性变更。/)
  })
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData(
      "const chapter = courseChapters.findLast((candidate) => candidate.id === 'ch4')",
      "chapter.title = '未批准'",
    ))

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /不允许对受保护课程元素作属性或计算属性变更。/)
  })
})

test('允许读取或返回受保护章节查询结果', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData(
      "const chapter = courseChapters.find((candidate) => candidate.id === 'ch1')",
      'if (chapter) { void chapter.title }',
      'function findFirstChapter() { return courseChapters.at(0) }',
      'void findFirstChapter',
    ))

    const result = runChecker(rootDirectory)

    assert.equal(result.status, 0, result.stderr)
  })
})

test('只静态读取课程源码，不执行其中的顶层语句', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/course/courseData.ts', validCourseData(
      "throw new Error('this module must never execute')",
    ))

    const result = runChecker(rootDirectory)

    assert.equal(result.status, 0, result.stderr)
  })
})

test('报告 TypeScript 源码中的旧实验总数文案', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(
      rootDirectory,
      'client/src/legacy-copy.ts',
      "export const copy = '浏览全部 300 个可视化实验'\n",
    )

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /client\/src\/legacy-copy\.ts/)
  })
})

test('拒绝指向根目录外的符号链接而不跟随它', async () => {
  const outsideDirectory = await mkdtemp(join(tmpdir(), 'product-scope-outside-'))
  try {
    await withFixture(async (rootDirectory) => {
      await writeFixtureFile(outsideDirectory, 'secret.ts', 'export const secret = 1\n')
      await symlink(outsideDirectory, join(rootDirectory, 'client/src/outside'), 'junction')

      const result = runChecker(rootDirectory)

      assert.notEqual(result.status, 0)
      assert.match(result.stderr, /client\/src\/outside/)
    })
  } finally {
    await rm(outsideDirectory, { recursive: true, force: true })
  }
})

test('拒绝作为 --root 输入的目录联接', async (t) => {
  await withFixture(async (rootDirectory) => {
    const linkedRoot = `${rootDirectory}-link`
    try {
      await symlink(rootDirectory, linkedRoot, 'junction')
    } catch (error) {
      if (error?.code === 'EPERM') {
        t.skip('当前 Windows 权限不允许创建目录联接')
        return
      }
      throw error
    }
    try {
      const result = runChecker(linkedRoot)
      assert.notEqual(result.status, 0)
      assert.match(result.stderr, /--root.*不允许符号链接或目录联接/)
    } finally {
      await rm(linkedRoot, { recursive: true, force: true })
    }
  })
})

test('跳过压缩资产内容但仍要求两个 dist 目录存在', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/dist/assets/safe.js.gz', '浏览全部 300 个可视化实验')
    await mkdir(join(rootDirectory, 'server/dist'), { recursive: true })

    const result = runChecker(rootDirectory, '--dist')

    assert.equal(result.status, 0, result.stderr)
  })
})

test('仅豁免已知断言签名，继续审计同一 dist 目录中的产品文件', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/dist/assets/index.js', 'export const version = 1')
    await writeFixtureFile(rootDirectory, 'server/dist/app.test.js', "assert.equal('/api/experiments', '/api/experiments')")

    const result = runChecker(rootDirectory, '--dist')

    assert.equal(result.status, 0, result.stderr)
  })
})

test('不按测试文件名跳过生产树中的旧实验签名', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/src/legacy.test.ts', "export const legacyPath = '/api/experiments'\n")
    await writeFixtureFile(rootDirectory, 'client/src/production.ts', "import './legacy.test'\n")

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /client\/src\/legacy\.test\.ts/)
  })
})

test('报告公共二进制资源文件名中的旧实验标识', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/public/audio/fourier.mp3', 'binary content')

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /client\/public\/audio\/fourier\.mp3/)
  })
})

test('扫描 YAML 锁文件中的旧搜索工具签名', async () => {
  await withFixture(async (rootDirectory) => {
    await writeFixtureFile(rootDirectory, 'client/pnpm-lock.yaml', 'tool: search-experiments\n')

    const result = runChecker(rootDirectory)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /client\/pnpm-lock\.yaml/)
  })
})
