#!/usr/bin/env npx tsx

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  chapters,
  type KnowledgePoint,
} from '../src/course/courseData'

import {
  experiments,
} from '../src/experiments/catalog'

import {
  resolveKnowledgeExperiment,
  type KnowledgeExperimentSource,
} from '../src/experiment-v2/knowledgeExperimentMap'

import {
  normalizeExperimentId,
} from '../src/experiment-v2/routing'

import {
  CORE_CALCULUS_SUPPLEMENT_DEMO_IDS,
} from '../src/demo/knowledge/CoreCalculusSupplementDemos'

// ============================================================================
// Paths
// ============================================================================

const __filename =
  fileURLToPath(
    import.meta.url,
  )

const __dirname =
  path.dirname(
    __filename,
  )

const CLIENT_ROOT =
  path.resolve(
    __dirname,
    '..',
  )

const REPORT_ROOT =
  path.join(
    CLIENT_ROOT,
    '.migration',
  )

const JSON_REPORT_PATH =
  path.join(
    REPORT_ROOT,
    'knowledge-renderer-report.json',
  )

const MARKDOWN_REPORT_PATH =
  path.join(
    REPORT_ROOT,
    'knowledge-renderer-report.md',
  )

// ============================================================================
// Native Demo Registry
//
// 已有 Demo：
//
// epsilon-delta
// derivative
// rolle
//
// 新增 Demo：
//
// limit-laws
// two-important-limits
// infinitesimal
// differential
// graphing
//
// 这里不再手工重复写新 5 个 ID，
// 而是直接读取 CoreCalculusSupplementDemos 导出的 ID。
// ============================================================================

const ORIGINAL_NATIVE_DEMO_IDS = [
  'epsilon-delta',
  'derivative',
  'rolle',
] as const

const NATIVE_DEMO_IDS =
  new Set<string>([
    ...ORIGINAL_NATIVE_DEMO_IDS,
    ...CORE_CALCULUS_SUPPLEMENT_DEMO_IDS,
  ])

// ============================================================================
// Experiment Catalog
// ============================================================================

const EXPERIMENT_IDS =
  new Set(
    experiments.map(
      (
        experiment,
      ) =>
        normalizeExperimentId(
          experiment.path,
        ),
    ),
  )

// ============================================================================
// Types
// ============================================================================

type RendererStatus =
  | 'native-demo'
  | 'experiment'
  | 'missing'
  | 'broken'

interface KnowledgeLocation {
  chapterId: string
  chapterTitle: string

  sectionId: string
  sectionTitle: string
}

interface KnowledgeRendererItem {
  pointId: string
  title: string

  chapterId: string
  chapterTitle: string

  sectionId: string
  sectionTitle: string

  template: string

  status:
    RendererStatus

  experimentId:
    string | null

  source:
    KnowledgeExperimentSource | 'native-same-id' | null

  demoId:
    string | null

  experimentPath:
    string | null

  reason:
    string
}

interface RendererSummary {
  totalKnowledgePoints: number

  resolvedCount: number

  nativeDemoCount: number

  experimentCount: number

  missingCount: number

  brokenCount: number

  coveragePercent: number
}

interface RendererReport {
  generatedAt: string

  summary:
    RendererSummary

  missing:
    KnowledgeRendererItem[]

  broken:
    KnowledgeRendererItem[]

  nativeDemos:
    KnowledgeRendererItem[]

  experiments:
    KnowledgeRendererItem[]

  all:
    KnowledgeRendererItem[]
}

// ============================================================================
// CLI
// ============================================================================

const args =
  new Set(
    process.argv.slice(
      2,
    ),
  )

const SHOULD_WRITE =
  args.has(
    '--write',
  )

const SHOW_ALL =
  args.has(
    '--all',
  )

const SHOW_HELP =
  args.has(
    '--help',
  ) ||
  args.has(
    '-h',
  )

// ============================================================================
// Help
// ============================================================================

function printHelp() {
  console.log(`
Knowledge Renderer Checker

用途：

  检查 courseData 中所有课程知识点，
  判断它们是否已经能够解析到真实数学 Renderer。

运行：

  npx tsx scripts/check-missing-knowledge-renderers.ts

显示全部知识点：

  npx tsx scripts/check-missing-knowledge-renderers.ts --all

生成 JSON / Markdown 报告：

  npx tsx scripts/check-missing-knowledge-renderers.ts --write

状态：

  native-demo
      使用专用课程 Demo。

  experiment
      复用 experiments/* 中已有实验。

  missing
      没有任何 Renderer。

  broken
      配置存在映射，但目标 Renderer 实际不存在。
`)
}

// ============================================================================
// Course traversal
// ============================================================================

function getKnowledgePoints():
  Array<{
    point:
      KnowledgePoint

    location:
      KnowledgeLocation
  }> {
  const result:
    Array<{
      point:
        KnowledgePoint

      location:
        KnowledgeLocation
    }> = []

  for (
    const chapter
    of chapters
  ) {
    for (
      const section
      of chapter.sections
    ) {
      for (
        const point
        of section.points
      ) {
        result.push({
          point,

          location: {
            chapterId:
              chapter.id,

            chapterTitle:
              chapter.title,

            sectionId:
              section.id,

            sectionTitle:
              section.title,
          },
        })
      }
    }
  }

  return result
}

// ============================================================================
// Renderer existence
// ============================================================================

function hasNativeDemo(
  id: string,
): boolean {
  return NATIVE_DEMO_IDS.has(
    normalizeExperimentId(
      id,
    ),
  )
}

function hasCatalogExperiment(
  id: string,
): boolean {
  return EXPERIMENT_IDS.has(
    normalizeExperimentId(
      id,
    ),
  )
}

// ============================================================================
// Analyze one KnowledgePoint
// ============================================================================

function analyzeKnowledgePoint(
  point:
    KnowledgePoint,

  location:
    KnowledgeLocation,
): KnowledgeRendererItem {
  const base = {
    pointId:
      point.id,

    title:
      point.title,

    chapterId:
      location.chapterId,

    chapterTitle:
      location.chapterTitle,

    sectionId:
      location.sectionId,

    sectionTitle:
      location.sectionTitle,

    template:
      point.template,

    demoId:
      point.demoId ??
      null,

    experimentPath:
      point.experimentPath ??
      null,
  }

  // ==========================================================================
  // 1. Direct native demo
  //
  // 这是本轮最重要的变化。
  //
  // DemoPage 的实际路由逻辑首先执行：
  //
  // /demo/:pointId
  //       ↓
  // getNativeDemo(pointId)
  //
  // 因此：
  //
  // point.id = "two-important-limits"
  //
  // 并且：
  //
  // nativeDemoRegistry["two-important-limits"]
  //
  // 存在时，它已经拥有 Renderer。
  //
  // Checker 必须和真实运行逻辑保持一致。
  // ==========================================================================

  const pointId =
    normalizeExperimentId(
      point.id,
    )

  if (
    hasNativeDemo(
      pointId,
    )
  ) {
    return {
      ...base,

      status:
        'native-demo',

      experimentId:
        pointId,

      source:
        'native-same-id',

      reason:
        `知识点 ID 与专用 Native Demo ID 一致：${pointId}`,
    }
  }

  // ==========================================================================
  // 2. Knowledge Experiment Resolver
  // ==========================================================================

  const resolution =
    resolveKnowledgeExperiment(
      point,
    )

  if (
    !resolution
  ) {
    return {
      ...base,

      status:
        'missing',

      experimentId:
        null,

      source:
        null,

      reason:
        'Native Demo、demoId、显式映射、experimentPath 和同名实验均未匹配。',
    }
  }

  const experimentId =
    normalizeExperimentId(
      resolution.experimentId,
    )

  // ==========================================================================
  // 3. Native Demo resolved through demoId
  // ==========================================================================

  if (
    hasNativeDemo(
      experimentId,
    )
  ) {
    return {
      ...base,

      status:
        'native-demo',

      experimentId,

      source:
        resolution.source,

      reason:
        `已解析到专用 Demo：${experimentId}`,
    }
  }

  // ==========================================================================
  // 4. Existing Experiment
  // ==========================================================================

  if (
    hasCatalogExperiment(
      experimentId,
    )
  ) {
    return {
      ...base,

      status:
        'experiment',

      experimentId,

      source:
        resolution.source,

      reason:
        `已解析到现有实验：${experimentId}`,
    }
  }

  // ==========================================================================
  // 5. Broken
  // ==========================================================================

  return {
    ...base,

    status:
      'broken',

    experimentId,

    source:
      resolution.source,

    reason:
      `映射到了“${experimentId}”，但 Native Demo 和实验目录中均不存在该 Renderer。`,
  }
}

// ============================================================================
// Report
// ============================================================================

function buildReport():
  RendererReport {
  const all =
    getKnowledgePoints()
      .map(
        ({
          point,
          location,
        }) =>
          analyzeKnowledgePoint(
            point,
            location,
          ),
      )

  const nativeDemos =
    all.filter(
      (
        item,
      ) =>
        item.status ===
        'native-demo',
    )

  const experimentItems =
    all.filter(
      (
        item,
      ) =>
        item.status ===
        'experiment',
    )

  const missing =
    all.filter(
      (
        item,
      ) =>
        item.status ===
        'missing',
    )

  const broken =
    all.filter(
      (
        item,
      ) =>
        item.status ===
        'broken',
    )

  const resolvedCount =
    nativeDemos.length +
    experimentItems.length

  const coveragePercent =
    all.length >
    0
      ? Number(
          (
            (
              resolvedCount /
              all.length
            ) *
            100
          ).toFixed(
            1,
          ),
        )
      : 0

  return {
    generatedAt:
      new Date().toISOString(),

    summary: {
      totalKnowledgePoints:
        all.length,

      resolvedCount,

      nativeDemoCount:
        nativeDemos.length,

      experimentCount:
        experimentItems.length,

      missingCount:
        missing.length,

      brokenCount:
        broken.length,

      coveragePercent,
    },

    missing,

    broken,

    nativeDemos,

    experiments:
      experimentItems,

    all,
  }
}

// ============================================================================
// Console helpers
// ============================================================================

function pad(
  value:
    string | number,

  width: number,
): string {
  return String(
    value,
  ).padEnd(
    width,
    ' ',
  )
}

// ============================================================================
// Summary
// ============================================================================

function printSummary(
  report:
    RendererReport,
) {
  const {
    summary,
  } =
    report

  console.log(
    '\n🔍 Knowledge Renderer Check\n',
  )

  console.log(
    `课程知识点总数：       ${summary.totalKnowledgePoints}`,
  )

  console.log(
    `已有 Renderer：        ${summary.resolvedCount}`,
  )

  console.log(
    `  专用 Demo：          ${summary.nativeDemoCount}`,
  )

  console.log(
    `  复用实验：           ${summary.experimentCount}`,
  )

  console.log(
    `真正缺 Renderer：      ${summary.missingCount}`,
  )

  console.log(
    `错误映射：             ${summary.brokenCount}`,
  )

  console.log(
    `Renderer 覆盖率：      ${summary.coveragePercent}%`,
  )
}

// ============================================================================
// Missing
// ============================================================================

function printMissing(
  report:
    RendererReport,
) {
  console.log(
    '\n❌ 真正缺少 Renderer 的知识点：\n',
  )

  if (
    report.missing.length ===
    0
  ) {
    console.log(
      '没有缺失 Renderer 的知识点。',
    )

    return
  }

  report.missing.forEach(
    (
      item,
      index,
    ) => {
      console.log(
        `${pad(
          index +
            1,
          4,
        )}${pad(
          item.pointId,
          32,
        )}${item.title}`,
      )

      console.log(
        `     章节：${item.chapterTitle} / ${item.sectionTitle}`,
      )

      console.log(
        `     推荐模板：${item.template}`,
      )

      console.log('')
    },
  )
}

// ============================================================================
// Broken
// ============================================================================

function printBroken(
  report:
    RendererReport,
) {
  if (
    report.broken.length ===
    0
  ) {
    return
  }

  console.log(
    '\n⚠️ 映射存在但 Renderer 不存在：\n',
  )

  report.broken.forEach(
    (
      item,
      index,
    ) => {
      console.log(
        `${index + 1}. ${item.pointId} (${item.title})`,
      )

      console.log(
        `   → ${item.experimentId}`,
      )

      console.log(
        `   source: ${item.source}`,
      )

      console.log('')
    },
  )
}

// ============================================================================
// All
// ============================================================================

function printAll(
  report:
    RendererReport,
) {
  console.log(
    '\n📋 全部知识点：\n',
  )

  for (
    const item
    of report.all
  ) {
    const icon =
      item.status ===
      'native-demo'
        ? '🟣'
        : item.status ===
            'experiment'
          ? '✅'
          : item.status ===
              'broken'
            ? '⚠️'
            : '❌'

    console.log(
      [
        icon,

        pad(
          item.pointId,
          30,
        ),

        pad(
          item.status,
          14,
        ),

        item.experimentId ??
          '-',
      ].join(
        ' ',
      ),
    )
  }
}

// ============================================================================
// Markdown
// ============================================================================

function createMarkdown(
  report:
    RendererReport,
): string {
  const lines:
    string[] = []

  const {
    summary,
  } =
    report

  lines.push(
    '# Knowledge Renderer Report',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Summary',
    '',
    `- Knowledge points: ${summary.totalKnowledgePoints}`,
    `- Resolved: ${summary.resolvedCount}`,
    `- Native demos: ${summary.nativeDemoCount}`,
    `- Existing experiments: ${summary.experimentCount}`,
    `- Missing renderers: ${summary.missingCount}`,
    `- Broken mappings: ${summary.brokenCount}`,
    `- Coverage: ${summary.coveragePercent}%`,
    '',
    '## Missing Renderers',
    '',
  )

  if (
    report.missing.length ===
    0
  ) {
    lines.push(
      'None.',
    )
  } else {
    lines.push(
      '| Point ID | Title | Chapter | Section | Suggested Template |',
      '| --- | --- | --- | --- | --- |',
    )

    for (
      const item
      of report.missing
    ) {
      lines.push(
        `| ${item.pointId} | ${item.title} | ${item.chapterTitle} | ${item.sectionTitle} | ${item.template} |`,
      )
    }
  }

  lines.push(
    '',
    '## Broken Mappings',
    '',
  )

  if (
    report.broken.length ===
    0
  ) {
    lines.push(
      'None.',
    )
  } else {
    lines.push(
      '| Point ID | Title | Target | Source |',
      '| --- | --- | --- | --- |',
    )

    for (
      const item
      of report.broken
    ) {
      lines.push(
        `| ${item.pointId} | ${item.title} | ${item.experimentId ?? '-'} | ${item.source ?? '-'} |`,
      )
    }
  }

  lines.push(
    '',
    '## Resolved',
    '',
    '| Point ID | Title | Renderer | Source | Status |',
    '| --- | --- | --- | --- | --- |',
  )

  for (
    const item
    of report.all.filter(
      (
        entry,
      ) =>
        entry.status ===
          'native-demo' ||
        entry.status ===
          'experiment',
    )
  ) {
    lines.push(
      `| ${item.pointId} | ${item.title} | ${item.experimentId ?? '-'} | ${item.source ?? '-'} | ${item.status} |`,
    )
  }

  return lines.join(
    '\n',
  )
}

// ============================================================================
// Write
// ============================================================================

function writeReports(
  report:
    RendererReport,
) {
  fs.mkdirSync(
    REPORT_ROOT,
    {
      recursive:
        true,
    },
  )

  fs.writeFileSync(
    JSON_REPORT_PATH,

    JSON.stringify(
      report,
      null,
      2,
    ),

    'utf8',
  )

  fs.writeFileSync(
    MARKDOWN_REPORT_PATH,

    createMarkdown(
      report,
    ),

    'utf8',
  )

  console.log(
    '\n📄 报告已生成：',
  )

  console.log(
    `   ${path.relative(
      CLIENT_ROOT,
      JSON_REPORT_PATH,
    )}`,
  )

  console.log(
    `   ${path.relative(
      CLIENT_ROOT,
      MARKDOWN_REPORT_PATH,
    )}`,
  )
}

// ============================================================================
// Main
// ============================================================================

function main() {
  if (
    SHOW_HELP
  ) {
    printHelp()

    return
  }

  const report =
    buildReport()

  printSummary(
    report,
  )

  printMissing(
    report,
  )

  printBroken(
    report,
  )

  if (
    SHOW_ALL
  ) {
    printAll(
      report,
    )
  }

  if (
    SHOULD_WRITE
  ) {
    writeReports(
      report,
    )
  }

  console.log(
    '\n✅ Knowledge Renderer 检查完成。\n',
  )
}

main()