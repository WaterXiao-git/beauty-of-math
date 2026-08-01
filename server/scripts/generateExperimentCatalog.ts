import {
  mkdir,
  readFile,
  writeFile,
} from 'node:fs/promises'

import {
  dirname,
  resolve,
} from 'node:path'

import {
  fileURLToPath,
} from 'node:url'

import {
  experiments,
} from '../../client/src/experiments/catalog.js'

import type {
  ExperimentCatalogMetadata,
} from '../src/agent/manifests/experimentManifest.js'

const scriptDirectory = dirname(
  fileURLToPath(import.meta.url),
)

const outputPath = resolve(
  scriptDirectory,
  '../src/agent/manifests/generatedExperimentCatalog.ts',
)

const checkOnly =
  process.argv.includes('--check')

/**
 * 将页面路径转换成稳定的默认实验 ID。
 *
 * /riemann-sum
 * → riemann-sum
 *
 * /category/example
 * → category--example
 */
function pathToExperimentId(path: string): string {
  const normalizedPath = path
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')

  if (!normalizedPath) {
    throw new Error(
      `无法从空路径生成实验 ID：${path}`,
    )
  }

  return normalizedPath.replace(/\//g, '--')
}

function assertUnique(
  values: readonly string[],
  fieldName: string,
): void {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value)
    }

    seen.add(value)
  }

  if (duplicates.size > 0) {
    throw new Error(
      `${fieldName} 存在重复值：${[
        ...duplicates,
      ].join(', ')}`,
    )
  }
}

const generatedCatalog:
  ExperimentCatalogMetadata[] =
  experiments.map((experiment) => ({
    id: pathToExperimentId(experiment.path),
    path: experiment.path,
    title: experiment.title,
    description: experiment.description,
    topics: [...experiment.topics],
  }))

assertUnique(
  generatedCatalog.map((item) => item.id),
  '实验 ID',
)

assertUnique(
  generatedCatalog.map((item) => item.path),
  '实验路径',
)

const generatedSource = `/**
 * 此文件由 scripts/generateExperimentCatalog.ts 自动生成。
 *
 * 请勿直接修改。
 * 修改来源：
 * client/src/experiments/catalog.ts
 */

import type {
  ExperimentCatalogMetadata,
} from './experimentManifest.js'

export const GENERATED_EXPERIMENT_CATALOG = ${JSON.stringify(
  generatedCatalog,
  null,
  2,
)} as const satisfies readonly ExperimentCatalogMetadata[]
`

if (checkOnly) {
  let existingSource = ''

  try {
    existingSource = await readFile(
      outputPath,
      'utf8',
    )
  } catch {
    throw new Error(
      '实验 Manifest 尚未生成，请先运行 npm run generate:manifests。',
    )
  }

  if (existingSource !== generatedSource) {
    throw new Error(
      '实验 Manifest 已过期，请运行 npm run generate:manifests 后重新提交。',
    )
  }

  console.log(
    `[Manifest] 目录同步检查通过，共 ${generatedCatalog.length} 个实验`,
  )
} else {
  await mkdir(dirname(outputPath), {
    recursive: true,
  })

  await writeFile(
    outputPath,
    generatedSource,
    'utf8',
  )

  console.log(
    `[Manifest] 已生成 ${generatedCatalog.length} 个实验基础条目`,
  )

  console.log(
    `[Manifest] 输出位置：${outputPath}`,
  )
}
