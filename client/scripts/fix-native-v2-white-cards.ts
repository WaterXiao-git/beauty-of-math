#!/usr/bin/env npx tsx

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

// ============================================================================
// Native Experiment V2 Light Card Fixer
//
// 目标：
//
// 只处理已经完成 Experiment V2 迁移的实验中，
// 遗留自旧版深色实验工作区的深色 Card。
//
// 不处理：
//
// - Compatibility Runtime
// - ExperimentShell 本身
// - ExperimentCard
// - Canvas 元素自己的 bg-white
// - Plotly 白底
//
// 默认 Dry Run。
// 只有传 --apply 才会写文件。
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

const REPORT_PATH =
  path.join(
    MIGRATION_ROOT,
    'native-v2-white-card-fix.json',
  )

// ============================================================================
// CLI
// ============================================================================

const args =
  process.argv.slice(
    2,
  )

const SHOULD_APPLY =
  args.includes(
    '--apply',
  )

const SHOW_HELP =
  args.includes(
    '--help',
  ) ||
  args.includes(
    '-h',
  )

// ============================================================================
// Types
// ============================================================================

interface Replacement {
  from: string

  to: string

  line: number
}

interface FilePlan {
  id: string

  file: string

  relativeFile: string

  nativeV2: boolean

  usesShell: boolean

  replacements:
    Replacement[]

  changed: boolean
}

interface FixReport {
  generatedAt: string

  mode:
    'dry-run' |
    'apply'

  scanned: number

  candidateFiles: number

  replacementCount: number

  changedFiles: number

  files:
    FilePlan[]
}

// ============================================================================
// Help
// ============================================================================

function printHelp() {
  console.log(`
Native Experiment V2 White Card Fixer

Dry Run:

  npx tsx scripts/fix-native-v2-white-cards.ts

Apply:

  npx tsx scripts/fix-native-v2-white-cards.ts --apply

作用：

  将 Native V2 实验中遗留的深色卡片：

    bg-slate-900/70
    border-slate-700
    shadow-none

  转换为客户版 ExperimentShell 浅色画布的：

    bg-white
    border-slate-200
    shadow-sm

同时调整常见灰色文字，使其在深色背景可读。

不会处理 Compatibility Runtime。
`)
}

// ============================================================================
// Walk
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

  const files:
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
      files.push(
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
      files.push(
        fullPath,
      )
    }
  }

  return files
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
    .toLowerCase()
}

function getLineNumber(
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

// ============================================================================
// Native V2 checks
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

function usesExperimentShell(
  content: string,
): boolean {
  return (
    /<ExperimentShell\b/.test(
      content,
    )
  )
}

// ============================================================================
// Card transformation
//
// 这里只匹配容器标签：
//
// div
// section
// article
// aside
//
// 不会修改：
//
// <canvas className="bg-white ...">
//
// ============================================================================

const CARD_REGEX =
  /<(div|section|article|aside)\b([^>]*?)className=(["'`])([^"'`]*\bbg-slate-(?:950|900|800)(?:\/\d+)?\b[^"'`]*)\3([^>]*)>/gi

function transformCardClasses(
  classes: string,
): string {
  let result =
    classes

  // ==========================================================================
  // Background
  // ==========================================================================

  result =
    result.replace(
      /\bbg-slate-(?:950|900|800)(?:\/\d+)?\b/g,
      'bg-white',
    )

  // ==========================================================================
  // Border
  // ==========================================================================

  result =
    result.replace(
      /\bborder-slate-(?:800|700|600)(?:\/\d+)?\b/g,
      'border-slate-200',
    )

  result =
    result.replace(
      /\bshadow-none\b/g,
      'shadow-sm',
    )

  result =
    result.replace(
      /\bshadow-slate-\d+(?:\/\d+)?\b/g,
      '',
    )

  // ==========================================================================
  // Clean spaces
  // ==========================================================================

  result =
    result
      .replace(
        /\s+/g,
        ' ',
      )
      .trim()

  return result
}

// ============================================================================
// Text color normalization
//
// 只在文件确实存在旧白色 Card 时执行。
//
// 这里转换最常见的旧灰色文字。
// 不碰：
//
// text-white
// 彩色强调文字
// indigo / emerald / rose 等语义色
// ============================================================================

function normalizeTextColors(
  content: string,
): string {
  return content
    .replace(
      /\btext-slate-100\b/g,
      'text-slate-900',
    )
    .replace(
      /\btext-slate-200\b/g,
      'text-slate-700',
    )
    .replace(
      /\btext-slate-300\b/g,
      'text-slate-600',
    )
    .replace(
      /\btext-slate-400\b/g,
      'text-slate-500',
    )
}

// ============================================================================
// Analyze / Transform
// ============================================================================

function planFile(
  filePath: string,
): FilePlan {
  const original =
    fs.readFileSync(
      filePath,
      'utf8',
    )

  const nativeV2 =
    isNativeV2(
      original,
    )

  const usesShell =
    usesExperimentShell(
      original,
    )

  const relativeFile =
    normalizeSlashes(
      path.relative(
        CLIENT_ROOT,
        filePath,
      ),
    )

  const plan:
    FilePlan = {
    id:
      getExperimentId(
        filePath,
      ),

    file:
      filePath,

    relativeFile,

    nativeV2,

    usesShell,

    replacements:
      [],

    changed:
      false,
  }

  if (
    !nativeV2 ||
    !usesShell
  ) {
    return plan
  }

  let match:
    RegExpExecArray | null

  CARD_REGEX.lastIndex =
    0

  while (
    (
      match =
        CARD_REGEX.exec(
          original,
        )
    ) !==
    null
  ) {
    const full =
      match[0]

    const tag =
      match[1]

    const beforeClass =
      match[2]

    const quote =
      match[3]

    const classes =
      match[4]

    const afterClass =
      match[5]

    const transformedClasses =
      transformCardClasses(
        classes,
      )

    if (
      transformedClasses ===
      classes
    ) {
      continue
    }

    const transformed =
      `<${tag}${beforeClass}className=${quote}${transformedClasses}${quote}${afterClass}>`

    plan.replacements.push({
      from:
        full,

      to:
        transformed,

      line:
        getLineNumber(
          original,
          match.index,
        ),
    })
  }

  plan.changed =
    plan.replacements.length >
    0

  return plan
}

// ============================================================================
// Apply one file
// ============================================================================

function applyPlan(
  plan: FilePlan,
): boolean {
  if (
    !plan.changed
  ) {
    return false
  }

  let content =
    fs.readFileSync(
      plan.file,
      'utf8',
    )

  for (
    const replacement
    of plan.replacements
  ) {
    content =
      content.replace(
        replacement.from,
        replacement.to,
      )
  }

  content =
    normalizeTextColors(
      content,
    )

  fs.writeFileSync(
    plan.file,
    content,
    'utf8',
  )

  return true
}

// ============================================================================
// Backup
// ============================================================================

function backupFiles(
  plans: FilePlan[],
): string | null {
  const candidates =
    plans.filter(
      (
        plan,
      ) =>
        plan.changed,
    )

  if (
    candidates.length ===
    0
  ) {
    return null
  }

  const timestamp =
    new Date()
      .toISOString()
      .replace(
        /[:.]/g,
        '-',
      )

  const backupRoot =
    path.join(
      MIGRATION_ROOT,
      'backups',
      `native-v2-white-card-${timestamp}`,
    )

  for (
    const plan
    of candidates
  ) {
    const relative =
      path.relative(
        CLIENT_ROOT,
        plan.file,
      )

    const destination =
      path.join(
        backupRoot,
        relative,
      )

    fs.mkdirSync(
      path.dirname(
        destination,
      ),
      {
        recursive:
          true,
      },
    )

    fs.copyFileSync(
      plan.file,
      destination,
    )
  }

  return backupRoot
}

// ============================================================================
// Print
// ============================================================================

function printPlans(
  plans: FilePlan[],
) {
  const candidates =
    plans.filter(
      (
        plan,
      ) =>
        plan.changed,
    )

  console.log(
    '\n🎨 Native V2 White Card Fix\n',
  )

  console.log(
    `模式：          ${
      SHOULD_APPLY
        ? 'APPLY'
        : 'DRY RUN'
    }`,
  )

  console.log(
    `扫描实验：      ${plans.length}`,
  )

  console.log(
    `候选文件：      ${candidates.length}`,
  )

  console.log(
    `Card 数量：     ${candidates.reduce(
      (
        total,
        plan,
      ) =>
        total +
        plan.replacements.length,
      0,
    )}`,
  )

  console.log(
    '\n候选：\n',
  )

  for (
    const plan
    of candidates
  ) {
    console.log(
      `• ${plan.id}`,
    )

    console.log(
      `  ${plan.relativeFile}`,
    )

    console.log(
      `  cards=${plan.replacements.length}`,
    )

    console.log(
      `  lines=${plan.replacements
        .map(
          (
            replacement,
          ) =>
            replacement.line,
        )
        .join(
          ', ',
        )}`,
    )

    console.log('')
  }
}

// ============================================================================
// Report
// ============================================================================

function writeReport(
  report:
    FixReport,
) {
  fs.mkdirSync(
    MIGRATION_ROOT,
    {
      recursive:
        true,
    },
  )

  fs.writeFileSync(
    REPORT_PATH,

    JSON.stringify(
      report,
      null,
      2,
    ),

    'utf8',
  )

  console.log(
    `报告：${path.relative(
      CLIENT_ROOT,
      REPORT_PATH,
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

  const files =
    walk(
      EXPERIMENT_ROOT,
    ).sort()

  const plans =
    files.map(
      planFile,
    )

  printPlans(
    plans,
  )

  let changedFiles =
    0

  let backupRoot:
    string | null = null

  if (
    SHOULD_APPLY
  ) {
    backupRoot =
      backupFiles(
        plans,
      )

    for (
      const plan
      of plans
    ) {
      if (
        applyPlan(
          plan,
        )
      ) {
        changedFiles +=
          1
      }
    }

    console.log(
      `修改文件：      ${changedFiles}`,
    )

    if (
      backupRoot
    ) {
      console.log(
        `备份：          ${path.relative(
          CLIENT_ROOT,
          backupRoot,
        )}`,
      )
    }
  }

  const candidates =
    plans.filter(
      (
        plan,
      ) =>
        plan.changed,
    )

  const report:
    FixReport = {
    generatedAt:
      new Date().toISOString(),

    mode:
      SHOULD_APPLY
        ? 'apply'
        : 'dry-run',

    scanned:
      plans.length,

    candidateFiles:
      candidates.length,

    replacementCount:
      candidates.reduce(
        (
          total,
          plan,
        ) =>
          total +
          plan.replacements.length,
        0,
      ),

    changedFiles,

    files:
      candidates,
  }

  writeReport(
    report,
  )

  console.log(
    SHOULD_APPLY
      ? '\n✅ Native V2 白色 Card 批量修复完成。\n'
      : '\n✅ Dry Run 完成，尚未修改任何源码。\n',
  )
}

main()
