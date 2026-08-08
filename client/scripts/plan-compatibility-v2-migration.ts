#!/usr/bin/env npx tsx

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

// ============================================================================
// Compatibility → Experiment V2 Migration Planner
//
// 目标：
//
// 对剩余没有：
//
//   export const experimentV2 = true
//
// 的实验进行迁移前分类。
//
// 本脚本：
//
//   - 只分析
//   - 不修改源码
//
// 输出：
//
//   .migration/compatibility-v2-plan.json
//   .migration/compatibility-v2-plan.md
//
// ============================================================================

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

const EXPERIMENT_ROOT =
  path.join(
    CLIENT_ROOT,
    'src',
    'experiments',
  )

const MIGRATION_ROOT =
  path.join(
    CLIENT_ROOT,
    '.migration',
  )

const JSON_REPORT_PATH =
  path.join(
    MIGRATION_ROOT,
    'compatibility-v2-plan.json',
  )

const MARKDOWN_REPORT_PATH =
  path.join(
    MIGRATION_ROOT,
    'compatibility-v2-plan.md',
  )

// ============================================================================
// CLI
// ============================================================================

const args =
  process.argv.slice(
    2,
  )

const SHOULD_WRITE =
  args.includes(
    '--write',
  )

const SHOW_ALL =
  args.includes(
    '--all',
  )

const SHOW_HELP =
  args.includes(
    '--help',
  ) ||
  args.includes(
    '-h',
  )

const groupArg =
  args.find(
    (
      item,
    ) =>
      item.startsWith(
        '--group=',
      ),
  )

const GROUP_FILTER =
  groupArg
    ? groupArg.slice(
        '--group='.length,
      )
    : null

// ============================================================================
// Types
// ============================================================================

type RendererKind =
  | 'canvas'
  | 'plotly'
  | 'svg'
  | 'hybrid'
  | 'webgl'
  | 'dom'
  | 'unknown'

type MigrationGroup =
  | 'safe'
  | 'review'
  | 'manual'

interface CompatibilityAnalysis {
  id: string

  file: string

  relativeFile: string

  lineCount: number

  renderer:
    RendererKind

  standardThreeColumn: boolean

  whiteCardCount: number

  canvasCount: number

  plotCount: number

  meaningfulSvgCount: number

  buttonCount: number

  inputCount: number

  selectCount: number

  rangeInputCount: number

  hookCount: number

  effectCount: number

  memoCount: number

  callbackCount: number

  stateCount: number

  customComponentCount: number

  returnCount: number

  hasResponsiveHint: boolean

  hasLegacyNarration: boolean

  hasMultipleVisualizations: boolean

  hasConditionalLayouts: boolean

  hasAbsoluteLayout: boolean

  hasComplexGrid: boolean

  score: number

  group:
    MigrationGroup

  reasons:
    string[]

  recommendation: string
}

interface MigrationSummary {
  totalExperiments: number

  nativeV2: number

  compatibility: number

  safe: number

  review: number

  manual: number

  canvas: number

  plotly: number

  hybrid: number

  other: number
}

interface MigrationReport {
  generatedAt: string

  summary:
    MigrationSummary

  compatibility:
    CompatibilityAnalysis[]
}

// ============================================================================
// Help
// ============================================================================

function printHelp() {
  console.log(`
Compatibility → Experiment V2 Migration Planner

运行：

  npx tsx scripts/plan-compatibility-v2-migration.ts

生成报告：

  npx tsx scripts/plan-compatibility-v2-migration.ts --write

显示所有 Compatibility：

  npx tsx scripts/plan-compatibility-v2-migration.ts --all

只看安全组：

  npx tsx scripts/plan-compatibility-v2-migration.ts --group=safe

只看人工组：

  npx tsx scripts/plan-compatibility-v2-migration.ts --group=manual

分组：

  safe
      后续可优先批量迁移

  review
      建议小批量迁移 + build 验证

  manual
      特殊结构，建议单独适配

本脚本不会修改实验源码。
`)
}

// ============================================================================
// File traversal
// ============================================================================

function walk(
  directory: string,
): string[] {
  if (
    !fs.existsSync(
      directory,
    )
  ) {
    return []
  }

  const result:
    string[] = []

  const entries =
    fs.readdirSync(
      directory,
      {
        withFileTypes:
          true,
      },
    )

  for (
    const entry
    of entries
  ) {
    const fullPath =
      path.join(
        directory,
        entry.name,
      )

    if (
      entry.isDirectory()
    ) {
      result.push(
        ...walk(
          fullPath,
        ),
      )

      continue
    }

    if (
      entry.isFile() &&
      /Experiment\.tsx$/i.test(
        entry.name,
      )
    ) {
      result.push(
        fullPath,
      )
    }
  }

  return result
}

// ============================================================================
// Helpers
// ============================================================================

function normalizeSlashes(
  value: string,
): string {
  return value.replace(
    /\\/g,
    '/',
  )
}

function getExperimentId(
  filePath: string,
): string {
  const relative =
    normalizeSlashes(
      path.relative(
        EXPERIMENT_ROOT,
        filePath,
      ),
    )

  const parts =
    relative.split(
      '/',
    )

  if (
    parts.length >
    1
  ) {
    return parts[0]
  }

  return path
    .basename(
      filePath,
    )
    .replace(
      /Experiment\.tsx$/i,
      '',
    )
    .replace(
      /([a-z0-9])([A-Z])/g,
      '$1-$2',
    )
    .toLowerCase()
}

function countMatches(
  content: string,
  pattern: RegExp,
): number {
  const flags =
    pattern.flags.includes(
      'g',
    )
      ? pattern.flags
      : `${pattern.flags}g`

  const regex =
    new RegExp(
      pattern.source,
      flags,
    )

  return (
    content.match(
      regex,
    ) ??
    []
  ).length
}

// ============================================================================
// Native V2
// ============================================================================

function isNativeV2(
  content: string,
): boolean {
  return (
    /export\s+const\s+experimentV2\s*=\s*true\b/.test(
      content,
    )
  )
}

// ============================================================================
// SVG detection
//
// 避免把按钮中的小 icon SVG 算成数学 Renderer。
// ============================================================================

function extractSvgBlocks(
  content: string,
): string[] {
  return (
    content.match(
      /<svg\b[\s\S]*?<\/svg>/gi,
    ) ??
    []
  )
}

function isDecorativeSvg(
  svg: string,
): boolean {
  const openTag =
    svg.match(
      /<svg\b[^>]*>/i,
    )?.[0] ??
    ''

  const width =
    Number(
      openTag.match(
        /\bwidth=["']?(\d+)/i,
      )?.[1] ??
      NaN,
    )

  const height =
    Number(
      openTag.match(
        /\bheight=["']?(\d+)/i,
      )?.[1] ??
      NaN,
    )

  const viewBoxMatch =
    openTag.match(
      /\bviewBox=["'][^"']*?(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)["']/i,
    )

  const viewBoxWidth =
    viewBoxMatch
      ? Number(
          viewBoxMatch[3],
        )
      : NaN

  const viewBoxHeight =
    viewBoxMatch
      ? Number(
          viewBoxMatch[4],
        )
      : NaN

  const smallExplicit =
    Number.isFinite(
      width,
    ) &&
    Number.isFinite(
      height,
    ) &&
    width <=
      64 &&
    height <=
      64

  const smallViewBox =
    Number.isFinite(
      viewBoxWidth,
    ) &&
    Number.isFinite(
      viewBoxHeight,
    ) &&
    viewBoxWidth <=
      64 &&
    viewBoxHeight <=
      64

  const visualElements =
    countMatches(
      svg,
      /<(?:path|circle|rect|line|polyline|polygon|text)\b/gi,
    )

  return (
    svg.length <
      1800 &&
    (
      smallExplicit ||
      smallViewBox
    ) &&
    visualElements <=
      12
  )
}

function countMeaningfulSvg(
  content: string,
): number {
  return extractSvgBlocks(
    content,
  ).filter(
    (
      svg,
    ) =>
      !isDecorativeSvg(
        svg,
      ),
  ).length
}

// ============================================================================
// Renderer
// ============================================================================

function detectRenderer(
  content: string,
): {
  renderer:
    RendererKind

  canvasCount: number

  plotCount: number

  meaningfulSvgCount: number
} {
  const canvasCount =
    countMatches(
      content,
      /<canvas\b/gi,
    )

  const plotCount =
    Math.max(
      countMatches(
        content,
        /<Plot\b/g,
      ),

      /react-plotly\.js/i.test(
        content,
      )
        ? 1
        : 0,
    )

  const meaningfulSvgCount =
    countMeaningfulSvg(
      content,
    )

  const hasWebGL =
    /getContext\s*\(\s*['"]webgl2?['"]/.test(
      content,
    ) ||
    /\bWebGLRenderingContext\b/.test(
      content,
    ) ||
    /\bTHREE\./.test(
      content,
    ) ||
    /from\s+['"]three['"]/.test(
      content,
    )

  const active =
    [
      canvasCount >
        0,
      plotCount >
        0,
      meaningfulSvgCount >
        0,
      hasWebGL,
    ].filter(
      Boolean,
    ).length

  let renderer:
    RendererKind =
    'unknown'

  if (
    active >
    1
  ) {
    renderer =
      'hybrid'
  } else if (
    hasWebGL
  ) {
    renderer =
      'webgl'
  } else if (
    plotCount >
    0
  ) {
    renderer =
      'plotly'
  } else if (
    canvasCount >
    0
  ) {
    renderer =
      'canvas'
  } else if (
    meaningfulSvgCount >
    0
  ) {
    renderer =
      'svg'
  } else if (
    /return\s*\(/.test(
      content,
    )
  ) {
    renderer =
      'dom'
  }

  return {
    renderer,

    canvasCount,

    plotCount,

    meaningfulSvgCount,
  }
}

// ============================================================================
// Standard layout
// ============================================================================

function detectStandardThreeColumn(
  content: string,
): boolean {
  const parent =
    /\bgrid-cols-1\b[^"'`\n]{0,300}\blg:grid-cols-3\b/.test(
      content,
    ) ||
    /\blg:grid-cols-3\b[^"'`\n]{0,300}\bgrid-cols-1\b/.test(
      content,
    )

  const main =
    /\blg:col-span-2\b/.test(
      content,
    )

  return (
    parent &&
    main
  )
}

// ============================================================================
// White cards
// ============================================================================

function countWhiteCards(
  content: string,
): number {
  const regex =
    /<(?:div|section|article|aside)\b[^>]*className\s*=\s*["'`][^"'`]*\bbg-white\b[^"'`]*(?:rounded|shadow|border)[^"'`]*["'`][^>]*>/gi

  return countMatches(
    content,
    regex,
  )
}

// ============================================================================
// Complexity
// ============================================================================

function countCustomComponents(
  content: string,
): number {
  const matches =
    content.match(
      /<([A-Z][A-Za-z0-9_]*)\b/g,
    ) ??
    []

  const ignored =
    new Set([
      'Plot',
      'ExperimentShell',
      'ExperimentCard',
      'PlayerBar',
      'Fragment',
    ])

  const components =
    new Set<string>()

  for (
    const match
    of matches
  ) {
    const name =
      match.slice(
        1,
      )

    if (
      !ignored.has(
        name,
      )
    ) {
      components.add(
        name,
      )
    }
  }

  return components.size
}

function hasResponsiveHint(
  content: string,
): boolean {
  return [
    /\bsm:/,
    /\bmd:/,
    /\blg:/,
    /\bxl:/,
    /\bw-full\b/,
    /\bmax-w-full\b/,
    /\bmin-w-0\b/,
    /\bflex-wrap\b/,
  ].some(
    (
      pattern,
    ) =>
      pattern.test(
        content,
      ),
  )
}

// ============================================================================
// Group scoring
// ============================================================================

function classify(
  analysis:
    Omit<
      CompatibilityAnalysis,
      | 'score'
      | 'group'
      | 'reasons'
      | 'recommendation'
    >,
): {
  score: number

  group:
    MigrationGroup

  reasons:
    string[]

  recommendation:
    string
} {
  let score =
    0

  const reasons:
    string[] = []

  // ==========================================================================
  // Positive: standard old layout
  // ==========================================================================

  if (
    analysis.standardThreeColumn
  ) {
    reasons.push(
      '标准旧三栏结构，可较明确拆分 Canvas 与 Sidebar。',
    )
  } else {
    score +=
      4

    reasons.push(
      '不是标准旧三栏结构，需要人工确认页面边界。',
    )
  }

  // ==========================================================================
  // Renderer
  // ==========================================================================

  switch (
    analysis.renderer
  ) {
    case 'canvas': {
      break
    }

    case 'plotly': {
      score +=
        2

      reasons.push(
        'Plotly 需要同时处理 layout/theme。',
      )

      break
    }

    case 'svg': {
      score +=
        1

      break
    }

    case 'hybrid': {
      score +=
        7

      reasons.push(
        '存在多个 Renderer 类型，不能使用普通单 Renderer 迁移。',
      )

      break
    }

    case 'webgl': {
      score +=
        8

      reasons.push(
        'WebGL 实验需要专用容器生命周期检查。',
      )

      break
    }

    default: {
      score +=
        4

      reasons.push(
        `Renderer 类型为 ${analysis.renderer}，需要额外检查。`,
      )

      break
    }
  }

  // ==========================================================================
  // Multiple plots/canvases
  // ==========================================================================

  if (
    analysis.hasMultipleVisualizations
  ) {
    score +=
      4

    reasons.push(
      '同一实验包含多个可视化区域。',
    )
  }

  // ==========================================================================
  // File size
  // ==========================================================================

  if (
    analysis.lineCount >
    700
  ) {
    score +=
      5

    reasons.push(
      `文件较大：${analysis.lineCount} 行。`,
    )
  } else if (
    analysis.lineCount >
    500
  ) {
    score +=
      3

    reasons.push(
      `文件偏大：${analysis.lineCount} 行。`,
    )
  } else if (
    analysis.lineCount >
    350
  ) {
    score +=
      1
  }

  // ==========================================================================
  // State complexity
  // ==========================================================================

  if (
    analysis.stateCount >
    12
  ) {
    score +=
      3

    reasons.push(
      `useState 较多：${analysis.stateCount}。`,
    )
  } else if (
    analysis.stateCount >
    8
  ) {
    score +=
      1
  }

  if (
    analysis.effectCount >
    4
  ) {
    score +=
      3

    reasons.push(
      `useEffect 较多：${analysis.effectCount}。`,
    )
  } else if (
    analysis.effectCount >
    2
  ) {
    score +=
      1
  }

  // ==========================================================================
  // Dynamic layout
  // ==========================================================================

  if (
    analysis.hasConditionalLayouts
  ) {
    score +=
      3

    reasons.push(
      '检测到条件 JSX 布局，自动切割风险较高。',
    )
  }

  if (
    analysis.hasAbsoluteLayout
  ) {
    score +=
      2

    reasons.push(
      '存在 absolute 布局，需要确认坐标容器。',
    )
  }

  if (
    analysis.hasComplexGrid
  ) {
    score +=
      2

    reasons.push(
      '除旧三栏外还存在复杂 Grid。',
    )
  }

  // ==========================================================================
  // Components
  // ==========================================================================

  if (
    analysis.customComponentCount >
    5
  ) {
    score +=
      3

    reasons.push(
      `自定义组件较多：${analysis.customComponentCount}。`,
    )
  }

  // ==========================================================================
  // Classification
  // ==========================================================================

  let group:
    MigrationGroup

  let recommendation:
    string

  if (
    score <=
      3 &&
    analysis.standardThreeColumn &&
    (
      analysis.renderer ===
        'canvas' ||
      analysis.renderer ===
        'svg'
    ) &&
    !analysis.hasMultipleVisualizations
  ) {
    group =
      'safe'

    recommendation =
      '适合进入第一批自动迁移：保留数学状态与 Renderer，只替换页面骨架。'
  } else if (
    score <=
    8
  ) {
    group =
      'review'

    recommendation =
      '适合 3~5 个一批迁移，每批执行 npm run build 和页面检查。'
  } else {
    group =
      'manual'

    recommendation =
      '不建议自动批量迁移，应为 Renderer / 控制区单独设计适配。'
  }

  return {
    score,

    group,

    reasons,

    recommendation,
  }
}

// ============================================================================
// Analyze file
// ============================================================================

function analyzeCompatibility(
  filePath: string,
):
  CompatibilityAnalysis | null {
  const content =
    fs.readFileSync(
      filePath,
      'utf8',
    )

  if (
    isNativeV2(
      content,
    )
  ) {
    return null
  }

  const rendererInfo =
    detectRenderer(
      content,
    )

  const lineCount =
    content.split(
      '\n',
    ).length

  const buttonCount =
    countMatches(
      content,
      /<button\b/gi,
    )

  const inputCount =
    countMatches(
      content,
      /<input\b/gi,
    )

  const selectCount =
    countMatches(
      content,
      /<select\b/gi,
    )

  const rangeInputCount =
    countMatches(
      content,
      /type\s*=\s*["']range["']/gi,
    )

  const stateCount =
    countMatches(
      content,
      /\buseState\s*(?:<[^>]+>)?\s*\(/g,
    )

  const effectCount =
    countMatches(
      content,
      /\buseEffect\s*\(/g,
    )

  const memoCount =
    countMatches(
      content,
      /\buseMemo\s*\(/g,
    )

  const callbackCount =
    countMatches(
      content,
      /\buseCallback\s*\(/g,
    )

  const hookCount =
    stateCount +
    effectCount +
    memoCount +
    callbackCount

  const returnCount =
    countMatches(
      content,
      /\breturn\s*\(/g,
    )

  const standardThreeColumn =
    detectStandardThreeColumn(
      content,
    )

  const whiteCardCount =
    countWhiteCards(
      content,
    )

  const customComponentCount =
    countCustomComponents(
      content,
    )

  const visualizationCount =
    rendererInfo.canvasCount +
    rendererInfo.plotCount +
    rendererInfo.meaningfulSvgCount

  const hasMultipleVisualizations =
    visualizationCount >
    1

  const hasConditionalLayouts =
    /\?\s*\([\s\S]{0,1500}<div\b/.test(
      content,
    ) ||
    /&&\s*\([\s\S]{0,1500}<div\b/.test(
      content,
    )

  const hasAbsoluteLayout =
    /\babsolute\b/.test(
      content,
    )

  const hasComplexGrid =
    (
      countMatches(
        content,
        /\bgrid-cols-(?:2|3|4|5|6|7|8|9|10|11|12)\b/g,
      ) >
      1
    )

  const base =
    {
      id:
        getExperimentId(
          filePath,
        ),

      file:
        filePath,

      relativeFile:
        normalizeSlashes(
          path.relative(
            CLIENT_ROOT,
            filePath,
          ),
        ),

      lineCount,

      renderer:
        rendererInfo.renderer,

      standardThreeColumn,

      whiteCardCount,

      canvasCount:
        rendererInfo.canvasCount,

      plotCount:
        rendererInfo.plotCount,

      meaningfulSvgCount:
        rendererInfo.meaningfulSvgCount,

      buttonCount,

      inputCount,

      selectCount,

      rangeInputCount,

      hookCount,

      effectCount,

      memoCount,

      callbackCount,

      stateCount,

      customComponentCount,

      returnCount,

      hasResponsiveHint:
        hasResponsiveHint(
          content,
        ),

      hasLegacyNarration:
        /NarrationPresenter|useNarration|Narration/.test(
          content,
        ),

      hasMultipleVisualizations,

      hasConditionalLayouts,

      hasAbsoluteLayout,

      hasComplexGrid,
    }

  const classification =
    classify(
      base,
    )

  return {
    ...base,

    ...classification,
  }
}

// ============================================================================
// Report
// ============================================================================

function buildReport():
  MigrationReport {
  const files =
    walk(
      EXPERIMENT_ROOT,
    ).sort()

  let nativeV2 =
    0

  const compatibility:
    CompatibilityAnalysis[] = []

  for (
    const file
    of files
  ) {
    const content =
      fs.readFileSync(
        file,
        'utf8',
      )

    if (
      isNativeV2(
        content,
      )
    ) {
      nativeV2 +=
        1

      continue
    }

    const analysis =
      analyzeCompatibility(
        file,
      )

    if (
      analysis
    ) {
      compatibility.push(
        analysis,
      )
    }
  }

  compatibility.sort(
    (
      a,
      b,
    ) => {
      const rank:
        Record<
          MigrationGroup,
          number
        > = {
        safe:
          0,

        review:
          1,

        manual:
          2,
      }

      return (
        rank[
          a.group
        ] -
          rank[
            b.group
          ] ||
        a.score -
          b.score ||
        a.id.localeCompare(
          b.id,
        )
      )
    },
  )

  return {
    generatedAt:
      new Date().toISOString(),

    summary: {
      totalExperiments:
        files.length,

      nativeV2,

      compatibility:
        compatibility.length,

      safe:
        compatibility.filter(
          (
            item,
          ) =>
            item.group ===
            'safe',
        ).length,

      review:
        compatibility.filter(
          (
            item,
          ) =>
            item.group ===
            'review',
        ).length,

      manual:
        compatibility.filter(
          (
            item,
          ) =>
            item.group ===
            'manual',
        ).length,

      canvas:
        compatibility.filter(
          (
            item,
          ) =>
            item.renderer ===
            'canvas',
        ).length,

      plotly:
        compatibility.filter(
          (
            item,
          ) =>
            item.renderer ===
            'plotly',
        ).length,

      hybrid:
        compatibility.filter(
          (
            item,
          ) =>
            item.renderer ===
            'hybrid',
        ).length,

      other:
        compatibility.filter(
          (
            item,
          ) =>
            ![
              'canvas',
              'plotly',
              'hybrid',
            ].includes(
              item.renderer,
            ),
        ).length,
    },

    compatibility,
  }
}

// ============================================================================
// Console
// ============================================================================

function printSummary(
  report:
    MigrationReport,
) {
  const s =
    report.summary

  console.log(
    '\n🧭 Compatibility → Experiment V2 Migration Plan\n',
  )

  console.log(
    `实验总数：          ${s.totalExperiments}`,
  )

  console.log(
    `Native V2：         ${s.nativeV2}`,
  )

  console.log(
    `Compatibility：     ${s.compatibility}`,
  )

  console.log(
    '\n迁移分组：\n',
  )

  console.log(
    `SAFE：              ${s.safe}`,
  )

  console.log(
    `REVIEW：            ${s.review}`,
  )

  console.log(
    `MANUAL：            ${s.manual}`,
  )

  console.log(
    '\nRenderer：\n',
  )

  console.log(
    `Canvas：            ${s.canvas}`,
  )

  console.log(
    `Plotly：            ${s.plotly}`,
  )

  console.log(
    `Hybrid：            ${s.hybrid}`,
  )

  console.log(
    `Other：             ${s.other}`,
  )
}

function printItems(
  report:
    MigrationReport,
) {
  let items =
    report.compatibility

  if (
    GROUP_FILTER
  ) {
    items =
      items.filter(
        (
          item,
        ) =>
          item.group ===
          GROUP_FILTER,
      )
  } else if (
    !SHOW_ALL
  ) {
    items =
      items.slice(
        0,
        30,
      )
  }

  if (
    items.length ===
    0
  ) {
    console.log(
      '\n没有匹配实验。\n',
    )

    return
  }

  console.log(
    GROUP_FILTER
      ? `\n📋 ${GROUP_FILTER.toUpperCase()}\n`
      : '\n📋 Migration candidates\n',
  )

  for (
    const item
    of items
  ) {
    const icon =
      item.group ===
        'safe'
        ? '🟢'
        : item.group ===
            'review'
          ? '🟠'
          : '🔴'

    console.log(
      `${icon} ${item.id}`,
    )

    console.log(
      `   group=${item.group} score=${item.score}`,
    )

    console.log(
      `   renderer=${item.renderer} lines=${item.lineCount}`,
    )

    console.log(
      `   standardGrid=${item.standardThreeColumn} whiteCards=${item.whiteCardCount}`,
    )

    console.log(
      `   canvas=${item.canvasCount} plot=${item.plotCount} svg=${item.meaningfulSvgCount}`,
    )

    console.log(
      `   state=${item.stateCount} effect=${item.effectCount} hooks=${item.hookCount}`,
    )

    console.log(
      `   buttons=${item.buttonCount} inputs=${item.inputCount}`,
    )

    console.log(
      `   ${item.relativeFile}`,
    )

    for (
      const reason
      of item.reasons
    ) {
      console.log(
        `   - ${reason}`,
      )
    }

    console.log(
      `   → ${item.recommendation}`,
    )

    console.log('')
  }
}

// ============================================================================
// Markdown
// ============================================================================

function createMarkdown(
  report:
    MigrationReport,
): string {
  const s =
    report.summary

  const lines:
    string[] = [
    '# Compatibility → Experiment V2 Migration Plan',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Summary',
    '',
    `- Total experiments: ${s.totalExperiments}`,
    `- Native V2: ${s.nativeV2}`,
    `- Compatibility: ${s.compatibility}`,
    `- Safe: ${s.safe}`,
    `- Review: ${s.review}`,
    `- Manual: ${s.manual}`,
    '',
    '## Renderer',
    '',
    `- Canvas: ${s.canvas}`,
    `- Plotly: ${s.plotly}`,
    `- Hybrid: ${s.hybrid}`,
    `- Other: ${s.other}`,
    '',
    '## Experiments',
    '',
  ]

  for (
    const item
    of report.compatibility
  ) {
    lines.push(
      `### ${item.id}`,
      '',
      `- Group: **${item.group}**`,
      `- Score: ${item.score}`,
      `- Renderer: ${item.renderer}`,
      `- Lines: ${item.lineCount}`,
      `- Standard three column: ${item.standardThreeColumn}`,
      `- White cards: ${item.whiteCardCount}`,
      `- Canvas: ${item.canvasCount}`,
      `- Plot: ${item.plotCount}`,
      `- Meaningful SVG: ${item.meaningfulSvgCount}`,
      `- State hooks: ${item.stateCount}`,
      `- Effect hooks: ${item.effectCount}`,
      `- Buttons: ${item.buttonCount}`,
      `- Inputs: ${item.inputCount}`,
      `- Custom components: ${item.customComponentCount}`,
      '',
      '**Reasons**',
      '',
    )

    for (
      const reason
      of item.reasons
    ) {
      lines.push(
        `- ${reason}`,
      )
    }

    lines.push(
      '',
      `**Recommendation:** ${item.recommendation}`,
      '',
    )
  }

  return lines.join(
    '\n',
  )
}

// ============================================================================
// Write
// ============================================================================

function writeReport(
  report:
    MigrationReport,
) {
  fs.mkdirSync(
    MIGRATION_ROOT,
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
    '\n📄 Migration Plan：',
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

  if (
    !fs.existsSync(
      EXPERIMENT_ROOT,
    )
  ) {
    console.error(
      `❌ 未找到：${EXPERIMENT_ROOT}`,
    )

    process.exitCode =
      1

    return
  }

  const report =
    buildReport()

  printSummary(
    report,
  )

  printItems(
    report,
  )

  if (
    SHOULD_WRITE
  ) {
    writeReport(
      report,
    )
  }

  console.log(
    '\n✅ Compatibility Migration Plan 完成。\n',
  )
}

main()