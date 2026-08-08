#!/usr/bin/env npx tsx

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

// ============================================================================
// Experiment V2 QA Scanner · V3
//
// 检查：
//
// 1. 旧版白色 Card
// 2. 旧版三栏 Grid
// 3. PlayerBar
// 4. 固定 Width / Height
// 5. Canvas 溢出风险
// 6. Plotly 白底
// 7. 旧蓝色按钮
// 8. 响应式布局
// 9. Compatibility Runtime
//
// V3 新增：
//
// PlayerBar 不再只检查实验文件有没有 player={...}。
//
// Scanner 会同时检查：
//
// ExperimentShell 是否已经实现默认 PlayerBar
//
// 因此可以区分：
//
// explicit
// shell-default
// disabled
// none
//
// 本脚本只扫描，不修改源代码。
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

const SRC_ROOT =
  path.join(
    CLIENT_ROOT,
    'src',
  )

const EXPERIMENT_ROOT =
  path.join(
    SRC_ROOT,
    'experiments',
  )

const EXPERIMENT_SHELL_PATH =
  path.join(
    SRC_ROOT,
    'experiment-v2',
    'ExperimentShell.tsx',
  )

const REPORT_ROOT =
  path.join(
    CLIENT_ROOT,
    '.migration',
  )

const JSON_REPORT_PATH =
  path.join(
    REPORT_ROOT,
    'experiment-v2-quality.json',
  )

const MARKDOWN_REPORT_PATH =
  path.join(
    REPORT_ROOT,
    'experiment-v2-quality.md',
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

const categoryArg =
  args.find(
    (
      item,
    ) =>
      item.startsWith(
        '--category=',
      ),
  )

const CATEGORY_FILTER =
  categoryArg
    ? categoryArg.slice(
        '--category='.length,
      )
    : null

const topArg =
  args.find(
    (
      item,
    ) =>
      item.startsWith(
        '--top=',
      ),
  )

const TOP_COUNT =
  topArg
    ? Math.max(
        1,
        Number(
          topArg.slice(
            '--top='.length,
          ),
        ) ||
          20,
      )
    : 20

// ============================================================================
// Types
// ============================================================================

type RendererKind =
  | 'canvas'
  | 'plotly'
  | 'svg'
  | 'webgl'
  | 'hybrid'
  | 'dom'
  | 'unknown'

type IssueSeverity =
  | 'low'
  | 'medium'
  | 'high'

type ExperimentRisk =
  | 'clean'
  | 'low'
  | 'medium'
  | 'high'

type PlayerMode =
  | 'explicit'
  | 'shell-default'
  | 'disabled'
  | 'none'

type QualityIssueType =
  | 'dark-experiment-surface'
  | 'legacy-three-column-grid'
  | 'missing-playerbar'
  | 'fixed-dimensions'
  | 'canvas-overflow-risk'
  | 'plotly-theme-mismatch'
  | 'legacy-blue-button'
  | 'missing-responsive-layout'
  | 'compatibility-runtime'
  | 'native-v2-without-shell'
  | 'shell-without-v2-flag'

interface Evidence {
  line: number

  snippet: string
}

interface QualityIssue {
  type:
    QualityIssueType

  severity:
    IssueSeverity

  title: string

  description: string

  evidence:
    Evidence[]
}

interface ExperimentQualityResult {
  id: string

  relativeFile: string

  lineCount: number

  renderer:
    RendererKind

  nativeV2: boolean

  usesExperimentShell: boolean

  compatibilityRuntime: boolean

  playerMode:
    PlayerMode

  hasEffectivePlayerBar: boolean

  hasResponsiveHint: boolean

  issues:
    QualityIssue[]

  issueCount: number

  structuralIssueCount: number

  score: number

  risk:
    ExperimentRisk
}

interface CategorySummary {
  type:
    QualityIssueType

  count: number
}

interface RendererSummary {
  renderer:
    RendererKind

  count: number

  withIssues: number
}

interface PlayerSummary {
  explicit: number

  shellDefault: number

  disabled: number

  missing: number
}

interface ReportSummary {
  totalExperiments: number

  nativeV2Count: number

  compatibilityCount: number

  fullyCleanCount: number

  structurallyCleanCount: number

  highRiskCount: number

  mediumRiskCount: number

  lowRiskCount: number

  structuralIssueTotal: number

  issueTotal: number

  player:
    PlayerSummary
}

interface QualityReport {
  generatedAt: string

  shellHasDefaultPlayer: boolean

  summary:
    ReportSummary

  categories:
    CategorySummary[]

  renderers:
    RendererSummary[]

  experiments:
    ExperimentQualityResult[]
}

// ============================================================================
// Issue metadata
// ============================================================================

const ISSUE_META:
  Record<
    QualityIssueType,
    {
      title: string

      description: string

      severity:
        IssueSeverity

      weight: number
    }
  > = {
  'dark-experiment-surface': {
    title:
      '深色实验容器',

    description:
      '检测到与客户浅色工作台规范不一致的深色页面容器。',

    severity:
      'low',

    weight:
      2,
  },

  'legacy-three-column-grid': {
    title:
      '旧版页面三栏',

    description:
      '检测到旧页面 grid-cols-1 + lg:grid-cols-3 + lg:col-span-2 页面结构。',

    severity:
      'medium',

    weight:
      4,
  },

  'missing-playerbar': {
    title:
      '缺少 PlayerBar',

    description:
      '实验既没有专用 PlayerBar，也无法从 ExperimentShell 获得默认 PlayerBar。',

    severity:
      'medium',

    weight:
      3,
  },

  'fixed-dimensions': {
    title:
      '固定尺寸',

    description:
      '检测到较大的固定宽度或最小宽度，可能降低响应式能力。',

    severity:
      'medium',

    weight:
      3,
  },

  'canvas-overflow-risk': {
    title:
      'Canvas 溢出风险',

    description:
      'Canvas 使用较大固定宽度，同时没有响应式宽度约束。',

    severity:
      'high',

    weight:
      7,
  },

  'plotly-theme-mismatch': {
    title:
      'Plotly 主题不一致',

    description:
      'Plotly 显式使用了与客户浅色工作台规范不一致的深色背景。',

    severity:
      'medium',

    weight:
      4,
  },

  'legacy-blue-button': {
    title:
      '旧蓝色按钮',

    description:
      'button 仍使用旧版 bg-blue-500 / 600 / 700。',

    severity:
      'low',

    weight:
      1,
  },

  'missing-responsive-layout': {
    title:
      '缺少响应式布局',

    description:
      '可视化实验没有检测到常见响应式约束。',

    severity:
      'medium',

    weight:
      4,
  },

  'compatibility-runtime': {
    title:
      'Compatibility Runtime',

    description:
      '实验没有声明 experimentV2 = true。',

    severity:
      'medium',

    weight:
      5,
  },

  'native-v2-without-shell': {
    title:
      'Native V2 未使用 ExperimentShell',

    description:
      '实验声明 experimentV2 = true，但没有使用 ExperimentShell。',

    severity:
      'high',

    weight:
      8,
  },

  'shell-without-v2-flag': {
    title:
      'ExperimentShell 缺 V2 标记',

    description:
      '实验已经使用 ExperimentShell，但没有 experimentV2 = true。',

    severity:
      'high',

    weight:
      7,
  },
}

// ============================================================================
// Help
// ============================================================================

function printHelp() {
  console.log(`
Experiment V2 QA Scanner V3

运行：

  npx tsx scripts/check-experiment-v2-quality.ts

生成报告：

  npx tsx scripts/check-experiment-v2-quality.ts --write

显示全部实验：

  npx tsx scripts/check-experiment-v2-quality.ts --all

指定问题：

  npx tsx scripts/check-experiment-v2-quality.ts --category=compatibility-runtime

显示风险最高的 50 个：

  npx tsx scripts/check-experiment-v2-quality.ts --top=50

PlayerBar 状态：

  explicit
      实验自己传入 player 或直接渲染 PlayerBar

  shell-default
      由 ExperimentShell 自动提供默认播放器

  disabled
      实验显式 player={false}

  none
      真正没有 PlayerBar

本脚本只扫描，不修改源码。
`)
}

// ============================================================================
// Shell default Player detection
// ============================================================================

function detectShellDefaultPlayer():
  boolean {
  if (
    !fs.existsSync(
      EXPERIMENT_SHELL_PATH,
    )
  ) {
    return false
  }

  const content =
    fs.readFileSync(
      EXPERIMENT_SHELL_PATH,
      'utf8',
    )

  const hasPlayerBar =
    /<PlayerBar\b/.test(
      content,
    )

  const hasDefaultSteps =
    /\bcreateDefaultSteps\b/.test(
      content,
    )

  const checksUndefined =
    /player\s*===\s*undefined/.test(
      content,
    )

  const hasDefaultPlayer =
    /\bdefaultPlayer\b/.test(
      content,
    )

  const hasResolvedPlayer =
    /\bresolvedPlayer\b/.test(
      content,
    )

  return (
    hasPlayerBar &&
    hasDefaultSteps &&
    checksUndefined &&
    hasDefaultPlayer &&
    hasResolvedPlayer
  )
}

const SHELL_HAS_DEFAULT_PLAYER =
  detectShellDefaultPlayer()

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

  for (
    const entry
    of fs.readdirSync(
      directory,
      {
        withFileTypes:
          true,
      },
    )
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

function lineNumberAt(
  content: string,
  index: number,
): number {
  return (
    content
      .slice(
        0,
        index,
      )
      .split(
        '\n',
      ).length
  )
}

function evidenceAt(
  content: string,
  index: number,
): Evidence {
  const line =
    lineNumberAt(
      content,
      index,
    )

  const sourceLine =
    content
      .split(
        '\n',
      )[
        line -
          1
      ] ??
    ''

  return {
    line,

    snippet:
      sourceLine
        .trim()
        .replace(
          /\s+/g,
          ' ',
        )
        .slice(
          0,
          200,
        ),
  }
}

function dedupeEvidence(
  items:
    Evidence[],
): Evidence[] {
  const seen =
    new Set<string>()

  const result:
    Evidence[] = []

  for (
    const item
    of items
  ) {
    const key =
      `${item.line}:${item.snippet}`

    if (
      seen.has(
        key,
      )
    ) {
      continue
    }

    seen.add(
      key,
    )

    result.push(
      item,
    )
  }

  return result
}

function findEvidence(
  content: string,

  patterns:
    RegExp[],

  max =
    8,
): Evidence[] {
  const result:
    Evidence[] = []

  for (
    const pattern
    of patterns
  ) {
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

    let match:
      RegExpExecArray | null

    while (
      (
        match =
          regex.exec(
            content,
          )
      ) !==
      null
    ) {
      result.push(
        evidenceAt(
          content,
          match.index,
        ),
      )

      if (
        result.length >=
        max
      ) {
        return dedupeEvidence(
          result,
        )
      }

      if (
        match[0].length ===
        0
      ) {
        regex.lastIndex +=
          1
      }
    }
  }

  return dedupeEvidence(
    result,
  )
}

function firstEvidence(
  content: string,
  text: string,
): Evidence[] {
  const index =
    content.indexOf(
      text,
    )

  if (
    index <
    0
  ) {
    return []
  }

  return [
    evidenceAt(
      content,
      index,
    ),
  ]
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

// ============================================================================
// Decorative SVG
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

function parseNumber(
  value:
    string | undefined,
): number | null {
  if (
    !value
  ) {
    return null
  }

  const number =
    Number(
      value,
    )

  return Number.isFinite(
    number,
  )
    ? number
    : null
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
    parseNumber(
      openTag.match(
        /\bwidth=["']?(\d+(?:\.\d+)?)/i,
      )?.[1],
    )

  const height =
    parseNumber(
      openTag.match(
        /\bheight=["']?(\d+(?:\.\d+)?)/i,
      )?.[1],
    )

  const viewBox =
    openTag.match(
      /\bviewBox=["'][^"']*?(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)["']/i,
    )

  const viewBoxWidth =
    parseNumber(
      viewBox?.[3],
    )

  const viewBoxHeight =
    parseNumber(
      viewBox?.[4],
    )

  const smallBySize =
    width !==
      null &&
    height !==
      null &&
    width <=
      64 &&
    height <=
      64

  const smallByViewBox =
    viewBoxWidth !==
      null &&
    viewBoxHeight !==
      null &&
    viewBoxWidth <=
      64 &&
    viewBoxHeight <=
      64

  const visualElementCount =
    (
      svg.match(
        /<(?:path|circle|rect|line|polyline|polygon|text)\b/gi,
      ) ??
      []
    ).length

  return (
    svg.length <
      1800 &&
    (
      smallBySize ||
      smallByViewBox
    ) &&
    visualElementCount <=
      12
  )
}

function hasMeaningfulSvg(
  content: string,
): boolean {
  return extractSvgBlocks(
    content,
  ).some(
    (
      svg,
    ) =>
      !isDecorativeSvg(
        svg,
      ),
  )
}

// ============================================================================
// Renderer
// ============================================================================

function detectRenderer(
  content: string,
): RendererKind {
  const canvas =
    /<canvas\b/i.test(
      content,
    ) ||
    /\.getContext\s*\(/.test(
      content,
    )

  const plotly =
    /react-plotly\.js/i.test(
      content,
    ) ||
    /<Plot\b/.test(
      content,
    )

  const svg =
    hasMeaningfulSvg(
      content,
    )

  const webgl =
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

  const count =
    [
      canvas,
      plotly,
      svg,
      webgl,
    ].filter(
      Boolean,
    ).length

  if (
    count >
    1
  ) {
    return 'hybrid'
  }

  if (
    webgl
  ) {
    return 'webgl'
  }

  if (
    plotly
  ) {
    return 'plotly'
  }

  if (
    canvas
  ) {
    return 'canvas'
  }

  if (
    svg
  ) {
    return 'svg'
  }

  if (
    /return\s*\(/.test(
      content,
    )
  ) {
    return 'dom'
  }

  return 'unknown'
}

// ============================================================================
// PlayerBar
// ============================================================================

function detectPlayerMode(
  content: string,
  nativeV2: boolean,
  usesExperimentShell: boolean,
): PlayerMode {
  // ==========================================================================
  // Explicitly disabled
  // ==========================================================================

  if (
    /\bplayer\s*=\s*\{\s*false\s*\}/.test(
      content,
    )
  ) {
    return 'disabled'
  }

  // ==========================================================================
  // Direct PlayerBar
  // ==========================================================================

  if (
    /<PlayerBar\b/.test(
      content,
    )
  ) {
    return 'explicit'
  }

  // ==========================================================================
  // ExperimentShell player prop
  //
  // Covers:
  //
  // player={player}
  // player={playerConfig}
  // player={{
  // ...
  // }}
  // ==========================================================================

  if (
    /\bplayer\s*=\s*\{/.test(
      content,
    )
  ) {
    return 'explicit'
  }

  // ==========================================================================
  // Shell default
  // ==========================================================================

  if (
    nativeV2 &&
    usesExperimentShell &&
    SHELL_HAS_DEFAULT_PLAYER
  ) {
    return 'shell-default'
  }

  return 'none'
}

// ============================================================================
// Dark experiment surfaces
// ============================================================================

function detectDarkExperimentSurfaces(
  content: string,
): Evidence[] {
  const regex =
    /<(div|section|article|aside)\b[^>]*className\s*=\s*["'`]([^"'`]*\bbg-slate-(?:800|900|950)\b[^"'`]*)["'`][^>]*>/gi

  const result:
    Evidence[] = []

  let match:
    RegExpExecArray | null

  while (
    (
      match =
        regex.exec(
          content,
        )
    ) !==
    null
  ) {
    const classes =
      match[2]

    const looksLikeCard =
      /\brounded(?:-\w+)?\b/.test(
        classes,
      ) ||
      /\bshadow(?:-\w+)?\b/.test(
        classes,
      ) ||
      /\bborder\b/.test(
        classes,
      )

    if (
      looksLikeCard
    ) {
      result.push(
        evidenceAt(
          content,
          match.index,
        ),
      )
    }

    if (
      result.length >=
      8
    ) {
      break
    }
  }

  return dedupeEvidence(
    result,
  )
}

// ============================================================================
// Old 3-column page structure
// ============================================================================

function detectLegacyThreeColumnGrid(
  content: string,
): Evidence[] {
  const grid =
    findEvidence(
      content,
      [
        /\bgrid-cols-1\b[^"'`\n]{0,240}\blg:grid-cols-3\b/gi,

        /\blg:grid-cols-3\b[^"'`\n]{0,240}\bgrid-cols-1\b/gi,
      ],
      6,
    )

  if (
    grid.length >
      0 &&
    /\blg:col-span-2\b/.test(
      content,
    )
  ) {
    grid.push(
      ...findEvidence(
        content,
        [
          /\blg:col-span-2\b/g,
        ],
        2,
      ),
    )
  }

  return dedupeEvidence(
    grid,
  )
}

// ============================================================================
// Fixed dimensions
// ============================================================================

function detectFixedDimensions(
  content: string,
): Evidence[] {
  return findEvidence(
    content,
    [
      /\bw-\[\s*(?:[4-9]\d{2,}|\d{4,})px\s*\]/gi,

      /\bmin-w-\[\s*(?:[4-9]\d{2,}|\d{4,})px\s*\]/gi,

      /\bwidth\s*:\s*['"]?(?:[4-9]\d{2,}|\d{4,})px/gi,

      /\bminWidth\s*:\s*['"]?(?:[4-9]\d{2,}|\d{4,})/g,

      /\bh-\[\s*(?:[6-9]\d{2,}|\d{4,})px\s*\]/gi,
    ],
    8,
  )
}

// ============================================================================
// Canvas overflow
// ============================================================================

function detectCanvasOverflow(
  content: string,
): Evidence[] {
  const canvasRegex =
    /<canvas\b[\s\S]*?>/gi

  const result:
    Evidence[] = []

  let match:
    RegExpExecArray | null

  while (
    (
      match =
        canvasRegex.exec(
          content,
        )
    ) !==
    null
  ) {
    const tag =
      match[0]

    const widthMatch =
      tag.match(
        /\bwidth\s*=\s*(?:\{\s*)?(\d{3,4})/,
      )

    const width =
      widthMatch
        ? Number(
            widthMatch[1],
          )
        : null

    const responsive =
      /\bw-full\b/.test(
        tag,
      ) ||
      /\bmax-w-full\b/.test(
        tag,
      ) ||
      /\bmin-w-0\b/.test(
        tag,
      )

    if (
      width !==
        null &&
      width >=
        500 &&
      !responsive
    ) {
      result.push(
        evidenceAt(
          content,
          match.index,
        ),
      )
    }
  }

  result.push(
    ...findEvidence(
      content,
      [
        /\bmin-w-\[\s*(?:[5-9]\d{2,}|\d{4,})px\s*\]/gi,
      ],
      5,
    ),
  )

  return dedupeEvidence(
    result,
  ).slice(
    0,
    8,
  )
}

// ============================================================================
// Plotly theme
// ============================================================================

function detectPlotlyThemeMismatch(
  content: string,
): Evidence[] {
  const hasPlotly =
    /react-plotly\.js/i.test(
      content,
    ) ||
    /<Plot\b/.test(
      content,
    )

  if (
    !hasPlotly
  ) {
    return []
  }

  const explicitDark =
    findEvidence(
      content,
      [
        /\bpaper_bgcolor\s*:\s*['"](?:#020617|#0f172a|#1e293b)['"]/gi,

        /\bplot_bgcolor\s*:\s*['"](?:#020617|#0f172a|#1e293b)['"]/gi,
      ],
      6,
    )

  if (
    explicitDark.length >
    0
  ) {
    return explicitDark
  }

  return []
}

// ============================================================================
// Legacy blue buttons
// ============================================================================

function detectLegacyBlueButtons(
  content: string,
): Evidence[] {
  const regex =
    /<button\b[\s\S]{0,1200}?>/gi

  const result:
    Evidence[] = []

  let match:
    RegExpExecArray | null

  while (
    (
      match =
        regex.exec(
          content,
        )
    ) !==
    null
  ) {
    if (
      /\bbg-blue-(?:500|600|700)\b/.test(
        match[0],
      )
    ) {
      result.push(
        evidenceAt(
          content,
          match.index,
        ),
      )
    }

    if (
      result.length >=
      8
    ) {
      break
    }
  }

  return dedupeEvidence(
    result,
  )
}

// ============================================================================
// Responsive
// ============================================================================

function hasResponsiveLayout(
  content: string,
): boolean {
  return [
    /\b(?:sm|md|lg|xl|2xl):/,

    /\bw-full\b/,

    /\bmax-w-full\b/,

    /\bmin-w-0\b/,

    /\bflex-wrap\b/,

    /\bgrid-cols-1\b/,

    /\boverflow-x-auto\b/,

    /\baspect-video\b/,

    /\baspect-\[/,
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
// Issue factory
// ============================================================================

function makeIssue(
  type:
    QualityIssueType,

  evidence:
    Evidence[],
): QualityIssue {
  const meta =
    ISSUE_META[
      type
    ]

  return {
    type,

    severity:
      meta.severity,

    title:
      meta.title,

    description:
      meta.description,

    evidence:
      dedupeEvidence(
        evidence,
      ).slice(
        0,
        8,
      ),
  }
}

// ============================================================================
// Risk
// ============================================================================

function calculateScore(
  issues:
    QualityIssue[],
): number {
  return issues.reduce(
    (
      total,
      issue,
    ) =>
      total +
      ISSUE_META[
        issue.type
      ].weight,
    0,
  )
}

function calculateRisk(
  score: number,
  issues:
    QualityIssue[],
): ExperimentRisk {
  if (
    issues.length ===
    0
  ) {
    return 'clean'
  }

  if (
    issues.some(
      (
        issue,
      ) =>
        issue.severity ===
        'high',
    ) ||
    score >=
      12
  ) {
    return 'high'
  }

  if (
    score >=
    4
  ) {
    return 'medium'
  }

  return 'low'
}

// ============================================================================
// Analyze experiment
// ============================================================================

function analyze(
  filePath: string,
): ExperimentQualityResult {
  const content =
    fs.readFileSync(
      filePath,
      'utf8',
    )

  const id =
    getExperimentId(
      filePath,
    )

  const relativeFile =
    normalizeSlashes(
      path.relative(
        CLIENT_ROOT,
        filePath,
      ),
    )

  const nativeV2 =
    /export\s+const\s+experimentV2\s*=\s*true\b/.test(
      content,
    )

  const usesExperimentShell =
    /<ExperimentShell\b/.test(
      content,
    )

  const compatibilityRuntime =
    !nativeV2

  const renderer =
    detectRenderer(
      content,
    )

  const responsive =
    hasResponsiveLayout(
      content,
    )

  const playerMode =
    detectPlayerMode(
      content,
      nativeV2,
      usesExperimentShell,
    )

  const hasEffectivePlayerBar =
    playerMode ===
      'explicit' ||
    playerMode ===
      'shell-default'

  const issues:
    QualityIssue[] = []

  // ==========================================================================
  // Architecture
  // ==========================================================================

  if (
    compatibilityRuntime
  ) {
    issues.push(
      makeIssue(
        'compatibility-runtime',
        firstEvidence(
          content,
          'export default',
        ),
      ),
    )
  }

  if (
    nativeV2 &&
    !usesExperimentShell
  ) {
    issues.push(
      makeIssue(
        'native-v2-without-shell',
        firstEvidence(
          content,
          'experimentV2',
        ),
      ),
    )
  }

  if (
    usesExperimentShell &&
    !nativeV2
  ) {
    issues.push(
      makeIssue(
        'shell-without-v2-flag',
        firstEvidence(
          content,
          'ExperimentShell',
        ),
      ),
    )
  }

  // ==========================================================================
  // PlayerBar
  //
  // 通用四步播放器已经取消；只有和实验状态绑定的专用 PlayerBar
  // 才属于有效教学能力。none 与 disabled 都是允许状态。
  // ==========================================================================

  // ==========================================================================
  // Dark experiment surfaces
  // ==========================================================================

  const darkSurfaces =
    detectDarkExperimentSurfaces(
      content,
    )

  if (
    darkSurfaces.length >
    0
  ) {
    issues.push(
      makeIssue(
        'dark-experiment-surface',
        darkSurfaces,
      ),
    )
  }

  // ==========================================================================
  // Old grid
  // ==========================================================================

  const oldGrid =
    detectLegacyThreeColumnGrid(
      content,
    )

  if (
    oldGrid.length >
    0
  ) {
    issues.push(
      makeIssue(
        'legacy-three-column-grid',
        oldGrid,
      ),
    )
  }

  // ==========================================================================
  // Dimensions
  // ==========================================================================

  const fixedDimensions =
    detectFixedDimensions(
      content,
    )

  if (
    fixedDimensions.length >
    0
  ) {
    issues.push(
      makeIssue(
        'fixed-dimensions',
        fixedDimensions,
      ),
    )
  }

  // ==========================================================================
  // Canvas overflow
  // ==========================================================================

  if (
    /<canvas\b/i.test(
      content,
    )
  ) {
    const overflow =
      detectCanvasOverflow(
        content,
      )

    if (
      overflow.length >
      0
    ) {
      issues.push(
        makeIssue(
          'canvas-overflow-risk',
          overflow,
        ),
      )
    }
  }

  // ==========================================================================
  // Plotly
  // ==========================================================================

  const plotlyMismatch =
    detectPlotlyThemeMismatch(
      content,
    )

  if (
    plotlyMismatch.length >
    0
  ) {
    issues.push(
      makeIssue(
        'plotly-theme-mismatch',
        plotlyMismatch,
      ),
    )
  }

  // ==========================================================================
  // Buttons
  // ==========================================================================

  const blueButtons =
    detectLegacyBlueButtons(
      content,
    )

  if (
    blueButtons.length >
    0
  ) {
    issues.push(
      makeIssue(
        'legacy-blue-button',
        blueButtons,
      ),
    )
  }

  // ==========================================================================
  // Responsive
  // ==========================================================================

  if (
    [
      'canvas',
      'plotly',
      'svg',
      'webgl',
      'hybrid',
    ].includes(
      renderer,
    ) &&
    !responsive
  ) {
    issues.push(
      makeIssue(
        'missing-responsive-layout',
        firstEvidence(
          content,
          'return',
        ),
      ),
    )
  }

  const score =
    calculateScore(
      issues,
    )

  return {
    id,

    relativeFile,

    lineCount:
      content.split(
        '\n',
      ).length,

    renderer,

    nativeV2,

    usesExperimentShell,

    compatibilityRuntime,

    playerMode,

    hasEffectivePlayerBar,

    hasResponsiveHint:
      responsive,

    issues,

    issueCount:
      issues.length,

    structuralIssueCount:
      issues.length,

    score,

    risk:
      calculateRisk(
        score,
        issues,
      ),
  }
}

// ============================================================================
// Build report
// ============================================================================

function buildReport():
  QualityReport {
  const experiments =
    walk(
      EXPERIMENT_ROOT,
    )
      .sort()
      .map(
        analyze,
      )

  const issueTypes =
    Object.keys(
      ISSUE_META,
    ) as
      QualityIssueType[]

  const categories =
    issueTypes.map(
      (
        type,
      ): CategorySummary => ({
        type,

        count:
          experiments.filter(
            (
              experiment,
            ) =>
              experiment.issues.some(
                (
                  issue,
                ) =>
                  issue.type ===
                  type,
              ),
          ).length,
      }),
    )

  const rendererKinds:
    RendererKind[] = [
      'canvas',
      'plotly',
      'svg',
      'webgl',
      'hybrid',
      'dom',
      'unknown',
    ]

  const renderers =
    rendererKinds.map(
      (
        renderer,
      ): RendererSummary => {
        const matched =
          experiments.filter(
            (
              experiment,
            ) =>
              experiment.renderer ===
              renderer,
          )

        return {
          renderer,

          count:
            matched.length,

          withIssues:
            matched.filter(
              (
                experiment,
              ) =>
                experiment.issueCount >
                0,
            ).length,
        }
      },
    )

  const player:
    PlayerSummary = {
    explicit:
      experiments.filter(
        (
          experiment,
        ) =>
          experiment.playerMode ===
          'explicit',
      ).length,

    shellDefault:
      experiments.filter(
        (
          experiment,
        ) =>
          experiment.playerMode ===
          'shell-default',
      ).length,

    disabled:
      experiments.filter(
        (
          experiment,
        ) =>
          experiment.playerMode ===
          'disabled',
      ).length,

    missing:
      experiments.filter(
        (
          experiment,
        ) =>
          experiment.playerMode ===
          'none' &&
          experiment.nativeV2,
      ).length,
  }

  const fullyCleanCount =
    experiments.filter(
      (
        experiment,
      ) =>
        experiment.issueCount ===
        0,
    ).length

  const issueTotal =
    experiments.reduce(
      (
        total,
        experiment,
      ) =>
        total +
        experiment.issueCount,
      0,
    )

  return {
    generatedAt:
      new Date().toISOString(),

    shellHasDefaultPlayer:
      SHELL_HAS_DEFAULT_PLAYER,

    summary: {
      totalExperiments:
        experiments.length,

      nativeV2Count:
        experiments.filter(
          (
            experiment,
          ) =>
            experiment.nativeV2,
        ).length,

      compatibilityCount:
        experiments.filter(
          (
            experiment,
          ) =>
            experiment.compatibilityRuntime,
        ).length,

      fullyCleanCount,

      structurallyCleanCount:
        fullyCleanCount,

      highRiskCount:
        experiments.filter(
          (
            experiment,
          ) =>
            experiment.risk ===
            'high',
        ).length,

      mediumRiskCount:
        experiments.filter(
          (
            experiment,
          ) =>
            experiment.risk ===
            'medium',
        ).length,

      lowRiskCount:
        experiments.filter(
          (
            experiment,
          ) =>
            experiment.risk ===
            'low',
        ).length,

      structuralIssueTotal:
        issueTotal,

      issueTotal,

      player,
    },

    categories,

    renderers,

    experiments,
  }
}

// ============================================================================
// Sort
// ============================================================================

function sortExperiments(
  experiments:
    ExperimentQualityResult[],
): ExperimentQualityResult[] {
  const riskRank:
    Record<
      ExperimentRisk,
      number
    > = {
    high:
      3,

    medium:
      2,

    low:
      1,

    clean:
      0,
  }

  return [
    ...experiments,
  ].sort(
    (
      a,
      b,
    ) =>
      riskRank[
        b.risk
      ] -
        riskRank[
          a.risk
        ] ||
      b.score -
        a.score ||
      a.id.localeCompare(
        b.id,
      ),
  )
}

// ============================================================================
// Console summary
// ============================================================================

function printSummary(
  report:
    QualityReport,
) {
  const summary =
    report.summary

  console.log(
    '\n🔍 Experiment V2 QA Scan V3\n',
  )

  console.log(
    `实验总数：                ${summary.totalExperiments}`,
  )

  console.log(
    `Native V2：               ${summary.nativeV2Count}`,
  )

  console.log(
    `Compatibility：           ${summary.compatibilityCount}`,
  )

  console.log(
    `完全 Clean：              ${summary.fullyCleanCount}`,
  )

  console.log(
    `High Risk：               ${summary.highRiskCount}`,
  )

  console.log(
    `Medium Risk：             ${summary.mediumRiskCount}`,
  )

  console.log(
    `Low Risk：                ${summary.lowRiskCount}`,
  )

  console.log(
    `问题总数：                ${summary.issueTotal}`,
  )

  console.log(
    '\nPlayerBar：\n',
  )

  console.log(
    `ExperimentShell 通用播放器： ${
      report.shellHasDefaultPlayer
        ? '⚠️ 仍启用'
        : '✅ 已关闭'
    }`,
  )

  console.log(
    `专用 PlayerBar：          ${summary.player.explicit}`,
  )

  console.log(
    `Shell 默认 PlayerBar：    ${summary.player.shellDefault}`,
  )

  console.log(
    `主动关闭：                ${summary.player.disabled}`,
  )

  console.log(
    `未使用 PlayerBar：        ${summary.player.missing}`,
  )

  console.log(
    '\nIssue Categories：\n',
  )

  for (
    const category
    of report.categories
  ) {
    if (
      category.count ===
      0
    ) {
      continue
    }

    console.log(
      `${category.type.padEnd(
        30,
      )}${category.count}`,
    )
  }

  console.log(
    '\nRenderer：\n',
  )

  for (
    const renderer
    of report.renderers
  ) {
    if (
      renderer.count ===
      0
    ) {
      continue
    }

    console.log(
      `${renderer.renderer.padEnd(
        12,
      )} total=${String(
        renderer.count,
      ).padEnd(
        4,
      )} withIssues=${renderer.withIssues}`,
    )
  }
}

// ============================================================================
// Console experiments
// ============================================================================

function printExperiments(
  report:
    QualityReport,
) {
  let experiments =
    sortExperiments(
      report.experiments,
    )

  if (
    CATEGORY_FILTER
  ) {
    experiments =
      experiments.filter(
        (
          experiment,
        ) =>
          experiment.issues.some(
            (
              issue,
            ) =>
              issue.type ===
              CATEGORY_FILTER,
          ),
      )
  } else if (
    !SHOW_ALL
  ) {
    experiments =
      experiments
        .filter(
          (
            experiment,
          ) =>
            experiment.issueCount >
            0,
        )
        .slice(
          0,
          TOP_COUNT,
        )
  }

  if (
    experiments.length ===
    0
  ) {
    console.log(
      '\n✅ 没有匹配的 QA 问题。\n',
    )

    return
  }

  console.log(
    CATEGORY_FILTER
      ? `\n📋 ${CATEGORY_FILTER}\n`
      : SHOW_ALL
        ? '\n📋 全部实验\n'
        : `\n🔥 风险最高的 ${experiments.length} 个实验\n`,
  )

  for (
    const experiment
    of experiments
  ) {
    const icon =
      experiment.risk ===
      'high'
        ? '🔴'
        : experiment.risk ===
            'medium'
          ? '🟠'
          : experiment.risk ===
              'low'
            ? '🟡'
            : '✅'

    console.log(
      `${icon} ${experiment.id}`,
    )

    console.log(
      `   renderer=${experiment.renderer}`,
    )

    console.log(
      `   nativeV2=${experiment.nativeV2}`,
    )

    console.log(
      `   player=${experiment.playerMode}`,
    )

    console.log(
      `   score=${experiment.score}`,
    )

    console.log(
      `   ${experiment.relativeFile}`,
    )

    for (
      const issue
      of experiment.issues
    ) {
      console.log(
        `   - [${issue.severity}] ${issue.type}`,
      )

      for (
        const evidence
        of issue.evidence.slice(
          0,
          2,
        )
      ) {
        console.log(
          `       L${evidence.line}: ${evidence.snippet}`,
        )
      }
    }

    console.log('')
  }
}

// ============================================================================
// Markdown
// ============================================================================

function createMarkdown(
  report:
    QualityReport,
): string {
  const summary =
    report.summary

  const lines:
    string[] = [
    '# Experiment V2 Quality Report',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Summary',
    '',
    `- Total experiments: ${summary.totalExperiments}`,
    `- Native V2: ${summary.nativeV2Count}`,
    `- Compatibility: ${summary.compatibilityCount}`,
    `- Fully clean: ${summary.fullyCleanCount}`,
    `- High risk: ${summary.highRiskCount}`,
    `- Medium risk: ${summary.mediumRiskCount}`,
    `- Low risk: ${summary.lowRiskCount}`,
    `- Total issues: ${summary.issueTotal}`,
    '',
    '## PlayerBar',
    '',
    `- ExperimentShell default player: ${report.shellHasDefaultPlayer}`,
    `- Explicit player: ${summary.player.explicit}`,
    `- Shell default player: ${summary.player.shellDefault}`,
    `- Disabled player: ${summary.player.disabled}`,
    `- Missing player: ${summary.player.missing}`,
    '',
    '## Categories',
    '',
    '| Category | Count |',
    '| --- | ---: |',
  ]

  for (
    const category
    of report.categories
  ) {
    lines.push(
      `| ${category.type} | ${category.count} |`,
    )
  }

  lines.push(
    '',
    '## Renderer',
    '',
    '| Renderer | Total | With issues |',
    '| --- | ---: | ---: |',
  )

  for (
    const renderer
    of report.renderers
  ) {
    if (
      renderer.count >
      0
    ) {
      lines.push(
        `| ${renderer.renderer} | ${renderer.count} | ${renderer.withIssues} |`,
      )
    }
  }

  lines.push(
    '',
    '## Experiments',
    '',
  )

  for (
    const experiment
    of sortExperiments(
      report.experiments,
    )
  ) {
    lines.push(
      `### ${experiment.id}`,
      '',
      `- File: \`${experiment.relativeFile}\``,
      `- Renderer: ${experiment.renderer}`,
      `- Native V2: ${experiment.nativeV2}`,
      `- Player: ${experiment.playerMode}`,
      `- Effective PlayerBar: ${experiment.hasEffectivePlayerBar}`,
      `- Risk: ${experiment.risk}`,
      `- Score: ${experiment.score}`,
      '',
    )

    if (
      experiment.issues.length ===
      0
    ) {
      lines.push(
        'Clean.',
        '',
      )

      continue
    }

    for (
      const issue
      of experiment.issues
    ) {
      lines.push(
        `- **${issue.type}** (${issue.severity})`,
      )

      for (
        const evidence
        of issue.evidence.slice(
          0,
          3,
        )
      ) {
        lines.push(
          `  - L${evidence.line}: \`${evidence.snippet.replace(
            /`/g,
            '\\`',
          )}\``,
        )
      }
    }

    lines.push('')
  }

  return lines.join(
    '\n',
  )
}

// ============================================================================
// Write report
// ============================================================================

function writeReport(
  report:
    QualityReport,
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
    '\n📄 QA 报告已生成：',
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
      `❌ experiments 目录不存在：${EXPERIMENT_ROOT}`,
    )

    process.exitCode =
      1

    return
  }

  if (
    !fs.existsSync(
      EXPERIMENT_SHELL_PATH,
    )
  ) {
    console.warn(
      `⚠️ 未找到 ExperimentShell：${EXPERIMENT_SHELL_PATH}`,
    )
  }

  const report =
    buildReport()

  printSummary(
    report,
  )

  printExperiments(
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
    '\n✅ Experiment V2 QA V3 扫描完成。\n',
  )
}

main()
