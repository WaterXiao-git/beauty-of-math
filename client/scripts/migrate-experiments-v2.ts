#!/usr/bin/env npx tsx

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as ts from 'typescript'

// ============================================================================
// Paths
// ============================================================================

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CLIENT_ROOT = path.resolve(__dirname, '..')
const EXPERIMENTS_ROOT = path.join(CLIENT_ROOT, 'src', 'experiments')
const REPORT_ROOT = path.join(CLIENT_ROOT, '.migration')

const JSON_REPORT_PATH = path.join(
  REPORT_ROOT,
  'experiment-v2-scan.json',
)

const PLAN_JSON_PATH = path.join(
  REPORT_ROOT,
  'experiment-v2-plan.json',
)

const APPLY_REPORT_PATH = path.join(
  REPORT_ROOT,
  'experiment-v2-apply.json',
)

// ============================================================================
// Types
// ============================================================================

type RendererKind =
  | 'plotly'
  | 'canvas'
  | 'svg'
  | 'dom'
  | 'hybrid'
  | 'special'
  | 'unknown'

type ControlKind =
  | 'parameter'
  | 'custom'
  | 'none'

type ExperimentFamily =
  | 'native-v2'
  | 'canvas-custom'
  | 'canvas-parameter'
  | 'plotly-custom'
  | 'plotly-parameter'
  | 'svg-custom'
  | 'svg-parameter'
  | 'dom-custom'
  | 'dom-parameter'
  | 'hybrid-custom'
  | 'hybrid-parameter'
  | 'special'
  | 'unknown'

type MigrationRisk =
  | 'low'
  | 'medium'
  | 'high'

type Confidence =
  | 'high'
  | 'medium'
  | 'low'

type LayoutKind =
  | 'standard-three-column'
  | 'standard-two-column'
  | 'single-column'
  | 'custom'

interface RendererSignals {
  plotlyCount: number
  canvasCount: number
  svgCount: number
  decorativeSvgCount: number
  rendererSvgCount: number
  meaningfulRenderers: string[]
}

interface ExperimentSignals {
  experimentShell: boolean
  experimentV2Flag: boolean

  renderer: RendererSignals

  parameterPanel: boolean
  mathFormula: boolean
  narration: boolean

  three: boolean
  d3: boolean
  webgl: boolean

  dragInteraction: boolean
  pointerInteraction: boolean

  requestAnimationFrame: boolean
  intervalAnimation: boolean

  hasHeader: boolean
  hasAside: boolean
  playerBar: boolean

  standardThreeColumn: boolean
  standardTwoColumn: boolean

  hasMainColumn: boolean
  hasSidebarCards: boolean
}

interface ExperimentAnalysis {
  id: string

  fileName: string
  relativePath: string
  absolutePath: string

  lineCount: number
  sizeBytes: number

  rendererKind: RendererKind
  controlKind: ControlKind

  family: ExperimentFamily
  layout: LayoutKind

  risk: MigrationRisk
  confidence: Confidence

  batchCandidate: boolean
  migrationStrategy: string

  signals: ExperimentSignals

  hookCount: number
  stateCount: number
  effectCount: number
  memoCount: number
  refCount: number

  reasons: string[]
  warnings: string[]
}

interface FamilySummary {
  family: ExperimentFamily

  count: number

  lowRisk: number
  mediumRisk: number
  highRisk: number

  batchCandidates: number
}

interface ScanReport {
  generatedAt: string

  totalExperiments: number

  nativeV2Count: number
  legacyCount: number

  batchCandidateCount: number
  highRiskCount: number

  standardLayoutCount: number
  decorativeSvgOnlyCount: number

  families: FamilySummary[]
  experiments: ExperimentAnalysis[]
}

interface MigrationPlanItem {
  order: number

  id: string
  file: string

  family: ExperimentFamily
  renderer: RendererKind
  layout: LayoutKind

  risk: MigrationRisk

  lineCount: number

  strategy: string
}

interface MigrationPlan {
  generatedAt: string

  dryRun: boolean

  family: ExperimentFamily

  totalCandidates: number
  selectedCount: number

  items: MigrationPlanItem[]
}

interface TransformResult {
  success: boolean

  id: string
  file: string

  originalSource: string

  transformedSource?: string

  title?: string
  subtitle?: string

  convertedCards?: number

  reason?: string
}

interface ApplyResult {
  generatedAt: string

  family: ExperimentFamily

  requested: number
  changed: number
  skipped: number
  failed: number

  backupDirectory: string

  files: Array<{
    id: string

    file: string

    status:
      | 'changed'
      | 'skipped'
      | 'failed'

    reason?: string
  }>
}

// ============================================================================
// CLI
// ============================================================================

const rawArgs = process.argv.slice(2)
const args = new Set(rawArgs)

const SHOW_DETAILS = args.has('--details')
const SHOULD_WRITE = args.has('--write')
const DRY_RUN = args.has('--dry-run')
const APPLY = args.has('--apply')

const SHOW_HELP =
  args.has('--help') ||
  args.has('-h')

function readArgumentValue(
  name: string,
): string | undefined {
  const prefix = `${name}=`

  const matched = rawArgs.find(
    (argument) =>
      argument.startsWith(prefix),
  )

  return matched?.slice(prefix.length)
}

const FAMILY_FILTER = readArgumentValue(
  '--family',
) as ExperimentFamily | undefined

const LIMIT_RAW = readArgumentValue(
  '--limit',
)

const LIMIT = LIMIT_RAW
  ? Math.max(
      1,
      Number.parseInt(
        LIMIT_RAW,
        10,
      ) || 1,
    )
  : Number.POSITIVE_INFINITY

// ============================================================================
// Help
// ============================================================================

function printHelp() {
  console.log(`
Experiment V2 Batch Migration Tool

扫描：

  npx tsx scripts/migrate-experiments-v2.ts

Dry Run：

  npx tsx scripts/migrate-experiments-v2.ts --dry-run

Canvas：

  npx tsx scripts/migrate-experiments-v2.ts \\
    --apply \\
    --family=canvas-custom

Plotly + ParameterPanel：

  npx tsx scripts/migrate-experiments-v2.ts \\
    --apply \\
    --family=plotly-parameter

Plotly Custom：

  npx tsx scripts/migrate-experiments-v2.ts \\
    --apply \\
    --family=plotly-custom

限制数量：

  --limit=5

当前自动迁移只允许：

  canvas-custom
  canvas-parameter
  plotly-custom
  plotly-parameter

且必须满足：

  standard-three-column
  batchCandidate=true
  risk != high

Hybrid / Special / 高风险实验不会自动修改。
`)
}

// ============================================================================
// File discovery
// ============================================================================

function walkDirectory(
  directory: string,
): string[] {
  if (!fs.existsSync(directory)) {
    return []
  }

  const result: string[] = []

  const entries = fs.readdirSync(
    directory,
    {
      withFileTypes: true,
    },
  )

  for (const entry of entries) {
    const fullPath = path.join(
      directory,
      entry.name,
    )

    if (entry.isDirectory()) {
      result.push(
        ...walkDirectory(
          fullPath,
        ),
      )

      continue
    }

    if (entry.isFile()) {
      result.push(
        fullPath,
      )
    }
  }

  return result
}

function getExperimentFiles(): string[] {
  return walkDirectory(
    EXPERIMENTS_ROOT,
  )
    .filter(
      (filePath) =>
        /Experiment\.tsx$/i.test(
          filePath,
        ),
    )
    .sort()
}

function getExperimentId(
  filePath: string,
): string {
  const relative = path.relative(
    EXPERIMENTS_ROOT,
    filePath,
  )

  const segments = relative.split(
    path.sep,
  )

  if (segments.length >= 2) {
    return segments[0]
  }

  return path.basename(
    filePath,
    '.tsx',
  )
}

// ============================================================================
// Regex utilities
// ============================================================================

function countMatches(
  source: string,
  regex: RegExp,
): number {
  const flags = regex.flags.includes(
    'g',
  )
    ? regex.flags
    : `${regex.flags}g`

  const globalRegex = new RegExp(
    regex.source,
    flags,
  )

  return (
    source.match(
      globalRegex,
    )?.length ??
    0
  )
}

// ============================================================================
// Renderer detection
// ============================================================================

function extractSvgBlocks(
  source: string,
): string[] {
  return (
    source.match(
      /<svg\b[\s\S]*?<\/svg>/gi,
    ) ??
    []
  )
}

function isDecorativeSvg(
  block: string,
): boolean {
  const opening =
    block.match(
      /<svg\b[^>]*>/i,
    )?.[0] ??
    ''

  const iconClass =
    /\b(?:w|h)-(?:3|3\.5|4|5|6)\b/.test(
      opening,
    )

  const tinyViewBox =
    /viewBox\s*=\s*["']0 0 (?:16|20|24|32) (?:16|20|24|32)["']/i.test(
      opening,
    )

  const ariaHidden =
    /aria-hidden\s*=\s*["']true["']/i.test(
      opening,
    )

  return (
    block.length < 1800 &&
    (
      iconClass ||
      tinyViewBox ||
      ariaHidden
    )
  )
}

function detectRendererSignals(
  source: string,
): RendererSignals {
  const plotlyCount = Math.max(
    countMatches(
      source,
      /<Plot\b/,
    ),
    /react-plotly\.js/.test(
      source,
    )
      ? 1
      : 0,
  )

  const canvasCount = countMatches(
    source,
    /<canvas\b/i,
  )

  const svgBlocks = extractSvgBlocks(
    source,
  )

  const decorativeSvgCount =
    svgBlocks.filter(
      isDecorativeSvg,
    ).length

  const rendererSvgCount = Math.max(
    0,
    svgBlocks.length -
      decorativeSvgCount,
  )

  const meaningfulRenderers:
    string[] = []

  if (plotlyCount > 0) {
    meaningfulRenderers.push(
      'plotly',
    )
  }

  if (
    canvasCount > 0 ||
    /getContext\s*\(\s*["'](?:2d|webgl|webgl2)["']/.test(
      source,
    )
  ) {
    meaningfulRenderers.push(
      'canvas',
    )
  }

  if (rendererSvgCount > 0) {
    meaningfulRenderers.push(
      'svg',
    )
  }

  return {
    plotlyCount,
    canvasCount,

    svgCount:
      svgBlocks.length,

    decorativeSvgCount,
    rendererSvgCount,
    meaningfulRenderers,
  }
}

// ============================================================================
// Signals
// ============================================================================

function detectSignals(
  source: string,
): ExperimentSignals {
  const renderer =
    detectRendererSignals(
      source,
    )

  const standardThreeColumn =
    /(?:lg:)?grid-cols-3/.test(
      source,
    ) &&
    /lg:col-span-2/.test(
      source,
    )

  const standardTwoColumn =
    !standardThreeColumn &&
    (
      /grid-cols-2/.test(
        source,
      ) ||
      /(?:w-80|w-96)/.test(
        source,
      )
    )

  return {
    experimentShell:
      /ExperimentShell/.test(
        source,
      ),

    experimentV2Flag:
      /export\s+const\s+experimentV2\s*=\s*true/.test(
        source,
      ),

    renderer,

    parameterPanel:
      /ParameterPanel/.test(
        source,
      ),

    mathFormula:
      /MathFormula/.test(
        source,
      ),

    narration:
      /NarrationPresenter|useNarrationOptional|NarrationContext/.test(
        source,
      ),

    three:
      /(?:from\s+["']three["']|@react-three|THREE\.)/.test(
        source,
      ),

    d3:
      /(?:from\s+["']d3|d3\.)/.test(
        source,
      ),

    webgl:
      /webgl2?|WebGLRenderingContext|WebGL2RenderingContext/.test(
        source,
      ),

    dragInteraction:
      /onDrag|draggable|mousemove|touchmove|pointermove/i.test(
        source,
      ),

    pointerInteraction:
      /onPointer|PointerEvent|onMouseMove|onTouchMove/.test(
        source,
      ),

    requestAnimationFrame:
      /requestAnimationFrame/.test(
        source,
      ),

    intervalAnimation:
      /setInterval|setTimeout/.test(
        source,
      ),

    hasHeader:
      /<header\b/i.test(
        source,
      ),

    hasAside:
      /<aside\b/i.test(
        source,
      ),

    playerBar:
      /PlayerBar/.test(
        source,
      ),

    standardThreeColumn,

    standardTwoColumn,

    hasMainColumn:
      /lg:col-span-2/.test(
        source,
      ),

    hasSidebarCards:
      /space-y-(?:4|6)/.test(
        source,
      ),
  }
}

// ============================================================================
// Classification
// ============================================================================

function classifyRenderer(
  signals:
    ExperimentSignals,
): {
  renderer: RendererKind
  confidence: Confidence
  reasons: string[]
} {
  if (
    signals.experimentShell ||
    signals.experimentV2Flag
  ) {
    return {
      renderer:
        'unknown',

      confidence:
        'high',

      reasons: [
        '已经完成 Experiment V2',
      ],
    }
  }

  if (
    signals.three ||
    signals.d3 ||
    signals.webgl
  ) {
    return {
      renderer:
        'special',

      confidence:
        'high',

      reasons: [
        '特殊 Renderer',
      ],
    }
  }

  const renderers =
    signals.renderer
      .meaningfulRenderers

  if (renderers.length > 1) {
    return {
      renderer:
        'hybrid',

      confidence:
        'high',

      reasons: [
        `多个 Renderer：${renderers.join(
          ' + ',
        )}`,
      ],
    }
  }

  if (renderers.length === 0) {
    return {
      renderer:
        'dom',

      confidence:
        'medium',

      reasons: [
        'DOM Renderer',
      ],
    }
  }

  const renderer =
    renderers[0] as
      | 'canvas'
      | 'plotly'
      | 'svg'

  const reasons:
    string[] = []

  if (
    signals.renderer
      .decorativeSvgCount > 0 &&
    signals.renderer
      .rendererSvgCount === 0
  ) {
    reasons.push(
      `忽略 ${signals.renderer.decorativeSvgCount} 个装饰 SVG`,
    )
  }

  reasons.push(
    `主 Renderer：${renderer}`,
  )

  return {
    renderer,

    confidence:
      'high',

    reasons,
  }
}

function classifyControls(
  source: string,
  signals:
    ExperimentSignals,
): ControlKind {
  if (signals.parameterPanel) {
    return 'parameter'
  }

  if (
    /<(?:button|input|select)\b/i.test(
      source,
    )
  ) {
    return 'custom'
  }

  return 'none'
}

function makeFamily(
  renderer:
    RendererKind,
  controls:
    ControlKind,
  nativeV2:
    boolean,
): ExperimentFamily {
  if (nativeV2) {
    return 'native-v2'
  }

  if (
    renderer ===
    'special'
  ) {
    return 'special'
  }

  if (
    renderer ===
    'unknown'
  ) {
    return 'unknown'
  }

  const suffix =
    controls ===
    'parameter'
      ? 'parameter'
      : 'custom'

  return `${renderer}-${suffix}` as
    ExperimentFamily
}

function classifyLayout(
  signals:
    ExperimentSignals,
): LayoutKind {
  if (
    signals.standardThreeColumn
  ) {
    return 'standard-three-column'
  }

  if (
    signals.standardTwoColumn
  ) {
    return 'standard-two-column'
  }

  if (
    !signals.hasAside &&
    !signals.hasMainColumn
  ) {
    return 'single-column'
  }

  return 'custom'
}

// ============================================================================
// Risk
// ============================================================================

function calculateRisk(
  options: {
    family:
      ExperimentFamily

    renderer:
      RendererKind

    layout:
      LayoutKind

    lineCount:
      number

    hookCount:
      number

    stateCount:
      number

    signals:
      ExperimentSignals
  },
): {
  risk:
    MigrationRisk

  warnings:
    string[]
} {
  const {
    family,
    renderer,
    layout,
    lineCount,
    hookCount,
    stateCount,
    signals,
  } = options

  if (
    family ===
    'native-v2'
  ) {
    return {
      risk:
        'low',

      warnings:
        [],
    }
  }

  let score = 0

  const warnings:
    string[] = []

  if (
    renderer ===
    'special'
  ) {
    score += 6
  }

  if (
    renderer ===
    'hybrid'
  ) {
    score += 3
  }

  if (
    renderer ===
    'unknown'
  ) {
    score += 4
  }

  if (
    layout ===
      'standard-three-column' &&
    lineCount <= 220
  ) {
    score -= 1
  }

  if (
    layout ===
    'custom'
  ) {
    score += 1
  }

  if (
    lineCount > 700
  ) {
    score += 4

    warnings.push(
      `超大文件：${lineCount} 行`,
    )
  } else if (
    lineCount > 500
  ) {
    score += 3

    warnings.push(
      `大型文件：${lineCount} 行`,
    )
  } else if (
    lineCount > 350
  ) {
    score += 2

    warnings.push(
      `文件偏大：${lineCount} 行`,
    )
  } else if (
    lineCount > 220
  ) {
    score += 1
  }

  if (
    hookCount >= 14
  ) {
    score += 3
  } else if (
    hookCount >= 10
  ) {
    score += 2
  } else if (
    hookCount >= 7
  ) {
    score += 1
  }

  if (
    stateCount >= 10
  ) {
    score += 1
  }

  if (
    signals.dragInteraction ||
    signals.pointerInteraction
  ) {
    score += 1

    warnings.push(
      '拖拽 / Pointer',
    )
  }

  if (
    signals.requestAnimationFrame
  ) {
    score += 1

    warnings.push(
      'requestAnimationFrame',
    )
  }

  if (
    signals.narration
  ) {
    warnings.push(
      '保留 Narration',
    )
  }

  score = Math.max(
    0,
    score,
  )

  if (score >= 5) {
    return {
      risk:
        'high',

      warnings,
    }
  }

  if (score >= 2) {
    return {
      risk:
        'medium',

      warnings,
    }
  }

  return {
    risk:
      'low',

    warnings,
  }
}

// ============================================================================
// Strategy
// ============================================================================

function determineMigrationStrategy(
  renderer:
    RendererKind,
  layout:
    LayoutKind,
): string {
  if (
    renderer ===
      'canvas' &&
    layout ===
      'standard-three-column'
  ) {
    return 'standard-canvas-shell'
  }

  if (
    renderer ===
      'plotly' &&
    layout ===
      'standard-three-column'
  ) {
    return 'standard-plotly-shell'
  }

  if (
    renderer ===
      'svg' &&
    layout ===
      'standard-three-column'
  ) {
    return 'standard-svg-shell'
  }

  return `${renderer}-${layout}-manual`
}

function isBatchCandidate(
  options: {
    family:
      ExperimentFamily

    renderer:
      RendererKind

    layout:
      LayoutKind

    risk:
      MigrationRisk

    lineCount:
      number
  },
): boolean {
  const {
    family,
    renderer,
    layout,
    risk,
    lineCount,
  } = options

  if (
    family ===
    'native-v2'
  ) {
    return false
  }

  if (
    risk ===
    'high'
  ) {
    return false
  }

  if (
    renderer ===
      'hybrid' ||
    renderer ===
      'special' ||
    renderer ===
      'unknown'
  ) {
    return false
  }

  return (
    layout ===
      'standard-three-column' &&
    lineCount <= 350
  )
}

// ============================================================================
// Analyze
// ============================================================================

function analyzeExperiment(
  filePath: string,
): ExperimentAnalysis {
  const source =
    fs.readFileSync(
      filePath,
      'utf8',
    )

  const stats =
    fs.statSync(
      filePath,
    )

  const lineCount =
    source.split(
      /\r?\n/,
    ).length

  const signals =
    detectSignals(
      source,
    )

  const nativeV2 =
    signals.experimentShell ||
    signals.experimentV2Flag

  const stateCount =
    countMatches(
      source,
      /\buseState\s*(?:<[^>]+>)?\s*\(/,
    )

  const effectCount =
    countMatches(
      source,
      /\buseEffect\s*\(/,
    )

  const memoCount =
    countMatches(
      source,
      /\buseMemo\s*\(/,
    )

  const refCount =
    countMatches(
      source,
      /\buseRef\s*(?:<[^>]+>)?\s*\(/,
    )

  const hookCount =
    stateCount +
    effectCount +
    memoCount +
    refCount

  const rendererResult =
    classifyRenderer(
      signals,
    )

  const controls =
    classifyControls(
      source,
      signals,
    )

  const family =
    makeFamily(
      rendererResult.renderer,
      controls,
      nativeV2,
    )

  const layout =
    classifyLayout(
      signals,
    )

  const riskResult =
    calculateRisk({
      family,

      renderer:
        rendererResult.renderer,

      layout,

      lineCount,

      hookCount,

      stateCount,

      signals,
    })

  const batchCandidate =
    isBatchCandidate({
      family,

      renderer:
        rendererResult.renderer,

      layout,

      risk:
        riskResult.risk,

      lineCount,
    })

  return {
    id:
      getExperimentId(
        filePath,
      ),

    fileName:
      path.basename(
        filePath,
      ),

    relativePath:
      path
        .relative(
          CLIENT_ROOT,
          filePath,
        )
        .split(
          path.sep,
        )
        .join('/'),

    absolutePath:
      filePath,

    lineCount,

    sizeBytes:
      stats.size,

    rendererKind:
      rendererResult.renderer,

    controlKind:
      controls,

    family,

    layout,

    risk:
      riskResult.risk,

    confidence:
      rendererResult.confidence,

    batchCandidate,

    migrationStrategy:
      determineMigrationStrategy(
        rendererResult.renderer,
        layout,
      ),

    signals,

    hookCount,
    stateCount,
    effectCount,
    memoCount,
    refCount,

    reasons:
      rendererResult.reasons,

    warnings:
      riskResult.warnings,
  }
}

// ============================================================================
// Scan
// ============================================================================

const FAMILY_ORDER:
  ExperimentFamily[] = [
    'native-v2',

    'canvas-custom',
    'canvas-parameter',

    'plotly-custom',
    'plotly-parameter',

    'svg-custom',
    'svg-parameter',

    'dom-custom',
    'dom-parameter',

    'hybrid-custom',
    'hybrid-parameter',

    'special',

    'unknown',
  ]

function createFamilySummary(
  experiments:
    ExperimentAnalysis[],
): FamilySummary[] {
  return FAMILY_ORDER
    .map(
      (family) => {
        const members =
          experiments.filter(
            (experiment) =>
              experiment.family ===
              family,
          )

        return {
          family,

          count:
            members.length,

          lowRisk:
            members.filter(
              (item) =>
                item.risk ===
                'low',
            ).length,

          mediumRisk:
            members.filter(
              (item) =>
                item.risk ===
                'medium',
            ).length,

          highRisk:
            members.filter(
              (item) =>
                item.risk ===
                'high',
            ).length,

          batchCandidates:
            members.filter(
              (item) =>
                item.batchCandidate,
            ).length,
        }
      },
    )
    .filter(
      (family) =>
        family.count > 0,
    )
}

function scan(): ScanReport {
  const experiments =
    getExperimentFiles()
      .map(
        analyzeExperiment,
      )
      .sort(
        (left, right) =>
          left.id.localeCompare(
            right.id,
          ),
      )

  const nativeV2Count =
    experiments.filter(
      (item) =>
        item.family ===
        'native-v2',
    ).length

  return {
    generatedAt:
      new Date().toISOString(),

    totalExperiments:
      experiments.length,

    nativeV2Count,

    legacyCount:
      experiments.length -
      nativeV2Count,

    batchCandidateCount:
      experiments.filter(
        (item) =>
          item.batchCandidate,
      ).length,

    highRiskCount:
      experiments.filter(
        (item) =>
          item.risk ===
          'high',
      ).length,

    standardLayoutCount:
      experiments.filter(
        (item) =>
          item.layout ===
          'standard-three-column',
      ).length,

    decorativeSvgOnlyCount:
      experiments.filter(
        (item) =>
          item.signals
              .renderer
              .decorativeSvgCount >
            0 &&
          item.signals
              .renderer
              .rendererSvgCount ===
            0,
      ).length,

    families:
      createFamilySummary(
        experiments,
      ),

    experiments,
  }
}

// ============================================================================
// Plan
// ============================================================================

function getRecommendedFamily(
  report:
    ScanReport,
): ExperimentFamily | null {
  const candidates =
    report.families
      .filter(
        (family) =>
          family.batchCandidates >
            0 &&
          family.family !==
            'native-v2',
      )
      .sort(
        (left, right) =>
          right.batchCandidates -
          left.batchCandidates,
      )

  return (
    candidates[0]
      ?.family ??
    null
  )
}

function createMigrationPlan(
  report:
    ScanReport,
): MigrationPlan | null {
  const family =
    FAMILY_FILTER ??
    getRecommendedFamily(
      report,
    )

  if (!family) {
    return null
  }

  const allCandidates =
    report.experiments
      .filter(
        (experiment) =>
          experiment.family ===
            family &&
          experiment.batchCandidate,
      )
      .sort(
        (left, right) =>
          left.lineCount -
          right.lineCount,
      )

  const selected =
    allCandidates.slice(
      0,
      Number.isFinite(LIMIT)
        ? LIMIT
        : undefined,
    )

  return {
    generatedAt:
      new Date().toISOString(),

    dryRun:
      !APPLY,

    family,

    totalCandidates:
      allCandidates.length,

    selectedCount:
      selected.length,

    items:
      selected.map(
        (
          item,
          index,
        ) => ({
          order:
            index + 1,

          id:
            item.id,

          file:
            item.relativePath,

          family:
            item.family,

          renderer:
            item.rendererKind,

          layout:
            item.layout,

          risk:
            item.risk,

          lineCount:
            item.lineCount,

          strategy:
            item.migrationStrategy,
        }),
      ),
  }
}

// ============================================================================
// Console
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

function printSummary(
  report:
    ScanReport,
) {
  console.log(
    '\n🔍 Experiment V2 Scan\n',
  )

  console.log(
    `实验总数：       ${report.totalExperiments}`,
  )

  console.log(
    `Native V2：      ${report.nativeV2Count}`,
  )

  console.log(
    `Legacy：         ${report.legacyCount}`,
  )

  console.log(
    `标准三栏：       ${report.standardLayoutCount}`,
  )

  console.log(
    `可批量：         ${report.batchCandidateCount}`,
  )

  console.log(
    `高风险：         ${report.highRiskCount}`,
  )

  console.log(
    '\nFamily：\n',
  )

  for (
    const family
    of report.families
  ) {
    console.log(
      `${pad(
        family.family,
        24,
      )}` +
        `total=${pad(
          family.count,
          5,
        )}` +
        `batch=${pad(
          family.batchCandidates,
          5,
        )}` +
        `high=${family.highRisk}`,
    )
  }
}

function printDetails(
  report:
    ScanReport,
) {
  console.log(
    '\n📋 Details\n',
  )

  for (
    const item
    of report.experiments
  ) {
    console.log(
      [
        item.id,
        item.family,
        item.rendererKind,
        item.layout,
        item.risk,

        item.batchCandidate
          ? 'BATCH'
          : '',
      ]
        .filter(Boolean)
        .join(' | '),
    )
  }
}

function writeReports(
  report:
    ScanReport,
) {
  fs.mkdirSync(
    REPORT_ROOT,
    {
      recursive: true,
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
}

function writePlan(
  plan:
    MigrationPlan,
) {
  fs.mkdirSync(
    REPORT_ROOT,
    {
      recursive: true,
    },
  )

  fs.writeFileSync(
    PLAN_JSON_PATH,

    JSON.stringify(
      plan,
      null,
      2,
    ),

    'utf8',
  )
}

// ============================================================================
// TypeScript AST
// ============================================================================

function createSourceFile(
  filePath: string,
  source: string,
): ts.SourceFile {
  return ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
}

function unwrapExpression(
  expression:
    ts.Expression,
): ts.Expression {
  let current =
    expression

  while (
    ts.isParenthesizedExpression(
      current,
    )
  ) {
    current =
      current.expression
  }

  return current
}

function isDefaultExportFunction(
  node:
    ts.Node,
): node is ts.FunctionDeclaration {
  if (
    !ts.isFunctionDeclaration(
      node,
    )
  ) {
    return false
  }

  const modifiers =
    node.modifiers ??
    []

  return (
    modifiers.some(
      (modifier) =>
        modifier.kind ===
        ts.SyntaxKind.ExportKeyword,
    ) &&
    modifiers.some(
      (modifier) =>
        modifier.kind ===
        ts.SyntaxKind.DefaultKeyword,
    )
  )
}

function findReturnStatement(
  node:
    ts.Node,
): ts.ReturnStatement | undefined {
  let result:
    ts.ReturnStatement | undefined

  function visit(
    child:
      ts.Node,
  ) {
    if (result) {
      return
    }

    if (
      child !== node &&
      (
        ts.isFunctionDeclaration(
          child,
        ) ||
        ts.isFunctionExpression(
          child,
        ) ||
        ts.isArrowFunction(
          child,
        )
      )
    ) {
      return
    }

    if (
      ts.isReturnStatement(
        child,
      )
    ) {
      result =
        child

      return
    }

    ts.forEachChild(
      child,
      visit,
    )
  }

  ts.forEachChild(
    node,
    visit,
  )

  return result
}

type JsxContainer =
  | ts.JsxElement
  | ts.JsxFragment

function significantChildren(
  node:
    JsxContainer,
): ts.JsxChild[] {
  return node.children.filter(
    (child) => {
      if (
        ts.isJsxText(
          child,
        )
      ) {
        return (
          child.text.trim()
            .length > 0
        )
      }

      if (
        ts.isJsxExpression(
          child,
        ) &&
        !child.expression
      ) {
        return false
      }

      return true
    },
  )
}

function getJsxTagName(
  node:
    ts.JsxElement,
): string {
  return node.openingElement
    .tagName
    .getText()
}

function getStaticAttribute(
  node:
    ts.JsxElement,
  name: string,
): string | null {
  for (
    const property
    of node.openingElement
      .attributes
      .properties
  ) {
    if (
      !ts.isJsxAttribute(
        property,
      )
    ) {
      continue
    }

    if (
      property.name
        .getText() !==
      name
    ) {
      continue
    }

    const initializer =
      property.initializer

    if (
      initializer &&
      ts.isStringLiteral(
        initializer,
      )
    ) {
      return initializer.text
    }

    return null
  }

  return null
}

function hasClass(
  node:
    ts.JsxElement,
  token: string,
): boolean {
  return (
    getStaticAttribute(
      node,
      'className',
    )?.includes(
      token,
    ) ??
    false
  )
}

function findFirstElement(
  node:
    ts.Node,
  tagName: string,
): ts.JsxElement | undefined {
  let result:
    ts.JsxElement | undefined

  function visit(
    child:
      ts.Node,
  ) {
    if (result) {
      return
    }

    if (
      ts.isJsxElement(
        child,
      ) &&
      getJsxTagName(
        child,
      ) ===
        tagName
    ) {
      result =
        child

      return
    }

    ts.forEachChild(
      child,
      visit,
    )
  }

  visit(node)

  return result
}

function getStaticText(
  node:
    ts.JsxElement,
): string | null {
  let result = ''

  for (
    const child
    of node.children
  ) {
    if (
      ts.isJsxText(
        child,
      )
    ) {
      result +=
        child.text

      continue
    }

    if (
      ts.isJsxExpression(
        child,
      ) &&
      child.expression &&
      ts.isStringLiteral(
        child.expression,
      )
    ) {
      result +=
        child.expression.text

      continue
    }

    return null
  }

  return result
    .replace(
      /\s+/g,
      ' ',
    )
    .trim()
}

function nodeSource(
  sourceFile:
    ts.SourceFile,
  source: string,
  node:
    ts.Node,
): string {
  return source.slice(
    node.getStart(
      sourceFile,
    ),
    node.getEnd(),
  )
}

// ============================================================================
// Sidebar card conversion
// ============================================================================

function convertSidebarChild(
  sourceFile:
    ts.SourceFile,

  source: string,

  child:
    ts.JsxChild,
): {
  source: string
  converted: boolean
} {
  if (
    !ts.isJsxElement(
      child,
    )
  ) {
    return {
      source:
        nodeSource(
          sourceFile,
          source,
          child,
        ),

      converted:
        false,
    }
  }

  if (
    getJsxTagName(
      child,
    ) !==
    'div'
  ) {
    return {
      source:
        nodeSource(
          sourceFile,
          source,
          child,
        ),

      converted:
        false,
    }
  }

  const children =
    significantChildren(
      child,
    )

  const first =
    children[0]

  if (
    !first ||
    !ts.isJsxElement(
      first,
    ) ||
    getJsxTagName(
      first,
    ) !==
      'h3'
  ) {
    return {
      source:
        nodeSource(
          sourceFile,
          source,
          child,
        ),

      converted:
        false,
    }
  }

  const title =
    getStaticText(
      first,
    )

  if (!title) {
    return {
      source:
        nodeSource(
          sourceFile,
          source,
          child,
        ),

      converted:
        false,
    }
  }

  const body =
    children
      .slice(1)
      .map(
        (node) =>
          nodeSource(
            sourceFile,
            source,
            node,
          ),
      )
      .join('\n')

  return {
    source:
`<ExperimentCard title=${JSON.stringify(
  title,
)}>
${body}
</ExperimentCard>`,

    converted:
      true,
  }
}

// ============================================================================
// Text edits
// ============================================================================

interface TextEdit {
  start: number
  end: number
  text: string
}

function applyTextEdits(
  source: string,
  edits:
    TextEdit[],
): string {
  const ordered =
    [...edits].sort(
      (left, right) =>
        right.start -
        left.start,
    )

  let result =
    source

  for (
    const edit
    of ordered
  ) {
    result =
      result.slice(
        0,
        edit.start,
      ) +
      edit.text +
      result.slice(
        edit.end,
      )
  }

  return result
}

// ============================================================================
// Generic standard-three-column transformer
// ============================================================================

function transformStandardExperiment(
  analysis:
    ExperimentAnalysis,
): TransformResult {
  const source =
    fs.readFileSync(
      analysis.absolutePath,
      'utf8',
    )

  const baseResult = {
    id:
      analysis.id,

    file:
      analysis.relativePath,

    originalSource:
      source,
  }

  // ==========================================================================
  // Safety gate
  // ==========================================================================

  if (
    !analysis.batchCandidate
  ) {
    return {
      ...baseResult,

      success:
        false,

      reason:
        '不是 batchCandidate',
    }
  }

  if (
    analysis.layout !==
    'standard-three-column'
  ) {
    return {
      ...baseResult,

      success:
        false,

      reason:
        '不是 standard-three-column',
    }
  }

  if (
    ![
      'canvas',
      'plotly',
    ].includes(
      analysis.rendererKind,
    )
  ) {
    return {
      ...baseResult,

      success:
        false,

      reason:
        `暂不支持 Renderer：${analysis.rendererKind}`,
    }
  }

  if (
    analysis.risk ===
    'high'
  ) {
    return {
      ...baseResult,

      success:
        false,

      reason:
        '高风险实验不自动修改',
    }
  }

  if (
    /experimentV2\s*=\s*true/.test(
      source,
    )
  ) {
    return {
      ...baseResult,

      success:
        false,

      reason:
        '已经完成 V2',
    }
  }

  // ==========================================================================
  // Parse
  // ==========================================================================

  const sourceFile =
    createSourceFile(
      analysis.absolutePath,
      source,
    )

  if (
    sourceFile.parseDiagnostics
      .length > 0
  ) {
    return {
      ...baseResult,

      success:
        false,

      reason:
        '原 TSX 存在解析错误',
    }
  }

  // ==========================================================================
  // Component
  // ==========================================================================

  const component =
    sourceFile.statements.find(
      isDefaultExportFunction,
    )

  if (!component) {
    return {
      ...baseResult,

      success:
        false,

      reason:
        '找不到 export default function',
    }
  }

  const returnStatement =
    findReturnStatement(
      component,
    )

  if (
    !returnStatement ||
    !returnStatement.expression
  ) {
    return {
      ...baseResult,

      success:
        false,

      reason:
        '找不到组件 return',
    }
  }

  const root =
    unwrapExpression(
      returnStatement.expression,
    )

  if (
    !ts.isJsxFragment(
      root,
    )
  ) {
    return {
      ...baseResult,

      success:
        false,

      reason:
        '根节点不是 JSX Fragment',
    }
  }

  // ==========================================================================
  // Page
  // ==========================================================================

  const rootChildren =
    significantChildren(
      root,
    )

  const page =
    rootChildren.find(
      (child) =>
        ts.isJsxElement(
          child,
        ) &&
        getJsxTagName(
          child,
        ) ===
          'div' &&
        hasClass(
          child,
          'space-y-6',
        ),
    )

  if (
    !page ||
    !ts.isJsxElement(
      page,
    )
  ) {
    return {
      ...baseResult,

      success:
        false,

      reason:
        '找不到旧 page 容器',
    }
  }

  const preservedRootNodes =
    rootChildren.filter(
      (child) =>
        child !== page,
    )

  const pageChildren =
    significantChildren(
      page,
    )

  // ==========================================================================
  // Header
  // ==========================================================================

  const header =
    pageChildren.find(
      (child) =>
        ts.isJsxElement(
          child,
        ) &&
        getJsxTagName(
          child,
        ) ===
          'header',
    )

  if (
    !header ||
    !ts.isJsxElement(
      header,
    )
  ) {
    return {
      ...baseResult,

      success:
        false,

      reason:
        '找不到旧 Header',
    }
  }

  // ==========================================================================
  // Grid
  // ==========================================================================

  const grid =
    pageChildren.find(
      (child) =>
        ts.isJsxElement(
          child,
        ) &&
        getJsxTagName(
          child,
        ) ===
          'div' &&
        hasClass(
          child,
          'grid-cols-3',
        ),
    )

  if (
    !grid ||
    !ts.isJsxElement(
      grid,
    )
  ) {
    return {
      ...baseResult,

      success:
        false,

      reason:
        '找不到三栏 Grid',
    }
  }

  // ==========================================================================
  // Header metadata
  // ==========================================================================

  const h1 =
    findFirstElement(
      header,
      'h1',
    )

  if (!h1) {
    return {
      ...baseResult,

      success:
        false,

      reason:
        'Header 中没有 h1',
    }
  }

  const title =
    getStaticText(
      h1,
    )

  if (!title) {
    return {
      ...baseResult,

      success:
        false,

      reason:
        '标题不是静态文本',
    }
  }

  const subtitleElement =
    findFirstElement(
      header,
      'p',
    )

  const subtitle =
    subtitleElement
      ? getStaticText(
          subtitleElement,
        )
      : ''

  if (
    subtitleElement &&
    subtitle === null
  ) {
    return {
      ...baseResult,

      success:
        false,

      reason:
        '副标题不是静态文本',
    }
  }

  const presenterButton =
    findFirstElement(
      header,
      'button',
    )

  const presenterButtonSource =
    presenterButton
      ? nodeSource(
          sourceFile,
          source,
          presenterButton,
        )
      : ''

  // ==========================================================================
  // Columns
  // ==========================================================================

  const columns =
    significantChildren(
      grid,
    ).filter(
      ts.isJsxElement,
    ) as ts.JsxElement[]

  if (
    columns.length !== 2
  ) {
    return {
      ...baseResult,

      success:
        false,

      reason:
        `Grid 顶层列数量不是 2：${columns.length}`,
    }
  }

  const mainColumn =
    columns.find(
      (column) =>
        hasClass(
          column,
          'lg:col-span-2',
        ),
    )

  const sidebarColumn =
    columns.find(
      (column) =>
        column !==
        mainColumn,
    )

  if (
    !mainColumn ||
    !sidebarColumn
  ) {
    return {
      ...baseResult,

      success:
        false,

      reason:
        '无法识别 Main / Sidebar',
    }
  }

  // ==========================================================================
  // Main content
  // ==========================================================================

  const mainContent =
    significantChildren(
      mainColumn,
    )
      .map(
        (child) =>
          nodeSource(
            sourceFile,
            source,
            child,
          ),
      )
      .join('\n')

  if (
    analysis.rendererKind ===
      'canvas' &&
    !/<canvas\b/i.test(
      mainContent,
    )
  ) {
    return {
      ...baseResult,

      success:
        false,

      reason:
        'Main Column 中找不到 Canvas',
    }
  }

  if (
    analysis.rendererKind ===
      'plotly' &&
    !/<Plot\b/.test(
      mainContent,
    )
  ) {
    return {
      ...baseResult,

      success:
        false,

      reason:
        'Main Column 中找不到 Plot',
    }
  }

  // ==========================================================================
  // Sidebar
  //
  // JSX expression：
  //
  // {condition && <ParameterPanel />}
  //
  // 会原样保留。
  // ==========================================================================

  let convertedCards = 0

  const sidebarContent =
    significantChildren(
      sidebarColumn,
    )
      .map(
        (child) => {
          const converted =
            convertSidebarChild(
              sourceFile,
              source,
              child,
            )

          if (
            converted.converted
          ) {
            convertedCards += 1
          }

          return converted.source
        },
      )
      .join('\n')

  // ==========================================================================
  // Root Presenter
  // ==========================================================================

  const preservedRootSource =
    preservedRootNodes
      .map(
        (child) =>
          nodeSource(
            sourceFile,
            source,
            child,
          ),
      )
      .join('\n')

  // ==========================================================================
  // Presenter sidebar card
  // ==========================================================================

  const presenterCard =
    presenterButtonSource
      ? `
<ExperimentCard title="实验讲解">
  <div className="[&>button]:w-full">
    ${presenterButtonSource}
  </div>
</ExperimentCard>
`
      : ''

  // ==========================================================================
  // Renderer-specific wrapper
  // ==========================================================================

  const canvasWrapperClass =
    analysis.rendererKind ===
    'plotly'
      ? 'min-h-full w-full space-y-4 p-2 md:p-3 [&_.js-plotly-plot]:w-full'
      : 'min-h-full w-full p-3 text-slate-100 md:p-4'

  // ==========================================================================
  // New return
  // ==========================================================================

  const newReturn =
`return (
    <>
      ${preservedRootSource}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          ${JSON.stringify(
            title,
          )},
        ]}
        title=${JSON.stringify(
          title,
        )}
        ${
          subtitle
            ? `subtitle=${JSON.stringify(
                subtitle,
              )}`
            : ''
        }
        canvasScrollable
        canvas={
          <div className=${JSON.stringify(
            canvasWrapperClass,
          )}>
            ${mainContent}
          </div>
        }
        sidebar={
          <>
            ${sidebarContent}

            ${presenterCard}
          </>
        }
      />
    </>
  )`

  // ==========================================================================
  // Imports
  // ==========================================================================

  const imports =
    sourceFile.statements.filter(
      ts.isImportDeclaration,
    )

  if (
    imports.length === 0
  ) {
    return {
      ...baseResult,

      success:
        false,

      reason:
        '没有 import declaration',
    }
  }

  const lastImport =
    imports[
      imports.length - 1
    ]

  const importText =
`
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'
`

  const markerText =
`export const experimentV2 = true

`

  // ==========================================================================
  // Transform
  // ==========================================================================

  const transformedSource =
    applyTextEdits(
      source,
      [
        {
          start:
            lastImport.end,

          end:
            lastImport.end,

          text:
            importText,
        },

        {
          start:
            component.getStart(
              sourceFile,
            ),

          end:
            component.getStart(
              sourceFile,
            ),

          text:
            markerText,
        },

        {
          start:
            returnStatement.getStart(
              sourceFile,
            ),

          end:
            returnStatement.getEnd(),

          text:
            newReturn,
        },
      ],
    )

  // ==========================================================================
  // Parse transformed result
  // ==========================================================================

  const transformedFile =
    createSourceFile(
      analysis.absolutePath,
      transformedSource,
    )

  if (
    transformedFile
      .parseDiagnostics
      .length > 0
  ) {
    const diagnostic =
      transformedFile
        .parseDiagnostics[0]

    return {
      ...baseResult,

      success:
        false,

      reason:
        `转换后 TSX 解析失败：${ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          '\n',
        )}`,
    }
  }

  return {
    ...baseResult,

    success:
      true,

    transformedSource,

    title,

    subtitle:
      subtitle ||
      undefined,

    convertedCards,
  }
}

// ============================================================================
// Backup
// ============================================================================

function createBackupDirectory():
  string {
  const stamp =
    new Date()
      .toISOString()
      .replace(
        /[:.]/g,
        '-',
      )

  const directory =
    path.join(
      REPORT_ROOT,
      'backups',
      stamp,
    )

  fs.mkdirSync(
    directory,
    {
      recursive: true,
    },
  )

  return directory
}

function backupFile(
  backupRoot: string,
  result:
    TransformResult,
) {
  const destination =
    path.join(
      backupRoot,
      result.file,
    )

  fs.mkdirSync(
    path.dirname(
      destination,
    ),
    {
      recursive: true,
    },
  )

  fs.writeFileSync(
    destination,
    result.originalSource,
    'utf8',
  )
}

// ============================================================================
// Apply safety
// ============================================================================

const ALLOWED_APPLY_FAMILIES =
  new Set<ExperimentFamily>([
    'canvas-custom',
    'canvas-parameter',

    'plotly-custom',
    'plotly-parameter',
  ])

// ============================================================================
// Apply
// ============================================================================

function applyMigration(
  report:
    ScanReport,

  plan:
    MigrationPlan,
): ApplyResult {
  if (
    !ALLOWED_APPLY_FAMILIES.has(
      plan.family,
    )
  ) {
    throw new Error(
      `当前不允许自动迁移：${plan.family}`,
    )
  }

  const analysesById =
    new Map(
      report.experiments.map(
        (analysis) => [
          analysis.id,
          analysis,
        ],
      ),
    )

  // ==========================================================================
  // Preflight
  //
  // 所有转换先只发生在内存。
  // ==========================================================================

  console.log(
    '\n🧪 Preflight...\n',
  )

  const transformations:
    TransformResult[] = []

  for (
    const planItem
    of plan.items
  ) {
    const analysis =
      analysesById.get(
        planItem.id,
      )

    if (!analysis) {
      transformations.push({
        success:
          false,

        id:
          planItem.id,

        file:
          planItem.file,

        originalSource:
          '',

        reason:
          '找不到分析数据',
      })

      continue
    }

    const result =
      transformStandardExperiment(
        analysis,
      )

    transformations.push(
      result,
    )

    console.log(
      `${result.success ? '✅' : '⏭️ '} ${pad(
        result.id,
        32,
      )}` +
        (
          result.success
            ? `renderer=${analysis.rendererKind} cards=${result.convertedCards ?? 0}`
            : result.reason
        ),
    )
  }

  const successful =
    transformations.filter(
      (result) =>
        result.success &&
        result.transformedSource,
    )

  const skipped =
    transformations.filter(
      (result) =>
        !result.success,
    )

  console.log(
    '\nPreflight：',
  )

  console.log(
    `  可转换：${successful.length}`,
  )

  console.log(
    `  跳过：  ${skipped.length}`,
  )

  if (
    successful.length === 0
  ) {
    return {
      generatedAt:
        new Date().toISOString(),

      family:
        plan.family,

      requested:
        plan.selectedCount,

      changed:
        0,

      skipped:
        skipped.length,

      failed:
        0,

      backupDirectory:
        '',

      files:
        skipped.map(
          (result) => ({
            id:
              result.id,

            file:
              result.file,

            status:
              'skipped' as const,

            reason:
              result.reason,
          }),
        ),
    }
  }

  // ==========================================================================
  // Backup
  // ==========================================================================

  const backupDirectory =
    createBackupDirectory()

  console.log(
    `\n💾 Backup: ${path.relative(
      CLIENT_ROOT,
      backupDirectory,
    )}\n`,
  )

  for (
    const result
    of successful
  ) {
    backupFile(
      backupDirectory,
      result,
    )
  }

  // ==========================================================================
  // Write
  // ==========================================================================

  const files:
    ApplyResult['files'] = []

  let changed = 0
  let failed = 0

  for (
    const result
    of successful
  ) {
    try {
      fs.writeFileSync(
        path.join(
          CLIENT_ROOT,
          result.file,
        ),

        result.transformedSource!,

        'utf8',
      )

      changed += 1

      files.push({
        id:
          result.id,

        file:
          result.file,

        status:
          'changed',
      })

      console.log(
        `✍️  ${result.id}`,
      )
    } catch (error) {
      failed += 1

      files.push({
        id:
          result.id,

        file:
          result.file,

        status:
          'failed',

        reason:
          error instanceof Error
            ? error.message
            : String(error),
      })
    }
  }

  for (
    const result
    of skipped
  ) {
    files.push({
      id:
        result.id,

      file:
        result.file,

      status:
        'skipped',

      reason:
        result.reason,
    })
  }

  return {
    generatedAt:
      new Date().toISOString(),

    family:
      plan.family,

    requested:
      plan.selectedCount,

    changed,

    skipped:
      skipped.length,

    failed,

    backupDirectory:
      path.relative(
        CLIENT_ROOT,
        backupDirectory,
      ),

    files,
  }
}

function writeApplyReport(
  result:
    ApplyResult,
) {
  fs.mkdirSync(
    REPORT_ROOT,
    {
      recursive: true,
    },
  )

  fs.writeFileSync(
    APPLY_REPORT_PATH,

    JSON.stringify(
      result,
      null,
      2,
    ),

    'utf8',
  )
}

// ============================================================================
// Main
// ============================================================================

function main() {
  if (SHOW_HELP) {
    printHelp()

    return
  }

  if (
    !fs.existsSync(
      EXPERIMENTS_ROOT,
    )
  ) {
    console.error(
      `❌ experiments 不存在：${EXPERIMENTS_ROOT}`,
    )

    process.exitCode = 1

    return
  }

  // ==========================================================================
  // Scan
  // ==========================================================================

  const report =
    scan()

  printSummary(
    report,
  )

  if (SHOW_DETAILS) {
    printDetails(
      report,
    )
  }

  if (
    SHOULD_WRITE ||
    DRY_RUN ||
    APPLY
  ) {
    writeReports(
      report,
    )
  }

  // ==========================================================================
  // Plan
  // ==========================================================================

  if (
    !DRY_RUN &&
    !APPLY
  ) {
    return
  }

  const plan =
    createMigrationPlan(
      report,
    )

  if (
    !plan ||
    plan.selectedCount === 0
  ) {
    console.error(
      '\n❌ 没有符合条件的迁移对象。',
    )

    process.exitCode = 1

    return
  }

  writePlan(
    plan,
  )

  console.log(
    '\n📦 Migration Plan\n',
  )

  console.log(
    `Family:     ${plan.family}`,
  )

  console.log(
    `Candidates: ${plan.totalCandidates}`,
  )

  console.log(
    `Selected:   ${plan.selectedCount}`,
  )

  // ==========================================================================
  // Dry Run
  // ==========================================================================

  if (
    DRY_RUN &&
    !APPLY
  ) {
    console.log(
      '\n✅ Dry Run 完成，没有修改源码。',
    )

    return
  }

  // ==========================================================================
  // Apply
  // ==========================================================================

  const result =
    applyMigration(
      report,
      plan,
    )

  writeApplyReport(
    result,
  )

  console.log(
    '\n========================================',
  )

  console.log(
    'Experiment V2 Apply Result',
  )

  console.log(
    '========================================',
  )

  console.log(
    `请求：${result.requested}`,
  )

  console.log(
    `修改：${result.changed}`,
  )

  console.log(
    `跳过：${result.skipped}`,
  )

  console.log(
    `失败：${result.failed}`,
  )

  if (
    result.backupDirectory
  ) {
    console.log(
      `备份：${result.backupDirectory}`,
    )
  }

  console.log(
    `报告：${path.relative(
      CLIENT_ROOT,
      APPLY_REPORT_PATH,
    )}`,
  )

  console.log(
    '\n下一步执行：npm run build\n',
  )
}

main()