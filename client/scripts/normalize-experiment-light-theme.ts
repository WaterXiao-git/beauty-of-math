#!/usr/bin/env npx tsx

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const CLIENT_ROOT = path.resolve(SCRIPT_DIR, '..')
const EXPERIMENT_ROOT = path.join(CLIENT_ROOT, 'src', 'experiments')
const EXTRA_ROOTS = [path.join(CLIENT_ROOT, 'src', 'demo', 'knowledge')]
const SHOULD_APPLY = process.argv.includes('--apply')

const SURFACE_REPLACEMENTS: ReadonlyArray<readonly [string, string]> = [
  ['bg-slate-950/80', 'bg-white'],
  ['bg-slate-950', 'bg-white'],
  ['bg-slate-900/70', 'bg-slate-50'],
  ['bg-slate-900/60', 'bg-slate-50'],
  ['bg-slate-900', 'bg-white'],
  ['bg-slate-800', 'bg-slate-100'],
  ['border-slate-800', 'border-slate-200'],
  ['border-slate-700', 'border-slate-200'],
  ['text-slate-200', 'text-slate-700'],
  ['text-slate-300', 'text-slate-600'],
  ['text-slate-400', 'text-slate-500'],
]

const DARK_SURFACE_PATTERN = /\bbg-slate-(?:950|900|800)(?:\/\d+)?\b/g
const DARK_PLOTLY_PATTERN = /\b(?:paper_bgcolor|plot_bgcolor)\s*:\s*['"]#(?:020617|0f172a|111827|1e293b)['"]/gi
const LIGHT_PLOTLY_FONT_PATTERN = /\bfont\s*:\s*\{\s*color\s*:\s*['"]#(?:cbd5e1|e2e8f0|f1f5f9)['"]\s*\}/gi
const LOW_CONTRAST_LIGHT_CARD_PATTERNS = [
  /className\s*=\s*["'`][^"'`]*\bbg-[a-z]+-(?:50|500\/10)\b[^"'`]*\btext-[a-z]+-(?:100|200|300)\b[^"'`]*["'`]/gi,
  /className\s*=\s*["'`][^"'`]*\btext-[a-z]+-(?:100|200|300)\b[^"'`]*\bbg-[a-z]+-(?:50|500\/10)\b[^"'`]*["'`]/gi,
]
const DARK_CANVAS_BACKGROUND_PATTERNS = [
  /(ctx\.fillStyle\s*=\s*)'#(?:020617|0f172a|111827)'(\s*;?\s*ctx\.fillRect\s*\(\s*0\s*,\s*0\s*,)/g,
  /(ctx\.fillStyle\s*=\s*)"#(?:020617|0f172a|111827)"(\s*;?\s*ctx\.fillRect\s*\(\s*0\s*,\s*0\s*,)/g,
]

interface FileResult {
  file: string
  changes: number
  remaining: string[]
}

function walk(directory: string): string[] {
  if (!fs.existsSync(directory)) return []

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) return walk(target)
    return entry.isFile() && /\.(?:ts|tsx)$/.test(entry.name) ? [target] : []
  })
}

function countMatches(content: string, pattern: RegExp): number {
  return [...content.matchAll(new RegExp(pattern.source, pattern.flags))].length
}

function normalizeFile(file: string): FileResult {
  const original = fs.readFileSync(file, 'utf8')
  let next = original
  let changes = 0

  if (file.endsWith('.tsx')) {
    for (const [from, to] of SURFACE_REPLACEMENTS) {
      const occurrences = next.split(from).length - 1
      if (occurrences > 0) {
        next = next.split(from).join(to)
        changes += occurrences
      }
    }
  }

  for (const pattern of DARK_CANVAS_BACKGROUND_PATTERNS) {
    next = next.replace(pattern, (_match, prefix: string, suffix: string) => {
      changes += 1
      return `${prefix}'#ffffff'${suffix}`
    })
  }

  next = next.replace(LIGHT_PLOTLY_FONT_PATTERN, () => {
    changes += 1
    return "font: { color: '#334155' }"
  })

  next = next.replace(DARK_PLOTLY_PATTERN, (match) => {
    changes += 1
    return match.replace(/#[0-9a-f]+/i, '#ffffff')
  })

  if (SHOULD_APPLY && next !== original) fs.writeFileSync(file, next, 'utf8')

  const inspected = SHOULD_APPLY ? next : original
  const remaining: string[] = []
  if (file.endsWith('.tsx') && DARK_SURFACE_PATTERN.test(inspected)) remaining.push('dark-surface')
  DARK_SURFACE_PATTERN.lastIndex = 0
  if (DARK_PLOTLY_PATTERN.test(inspected)) remaining.push('dark-plotly-background')
  DARK_PLOTLY_PATTERN.lastIndex = 0
  if (LIGHT_PLOTLY_FONT_PATTERN.test(inspected)) remaining.push('light-plotly-font')
  LIGHT_PLOTLY_FONT_PATTERN.lastIndex = 0
  if (LOW_CONTRAST_LIGHT_CARD_PATTERNS.some((pattern) => countMatches(inspected, pattern) > 0)) {
    remaining.push('low-contrast-light-card')
  }
  if (DARK_CANVAS_BACKGROUND_PATTERNS.some((pattern) => countMatches(inspected, pattern) > 0)) {
    remaining.push('dark-canvas-background')
  }

  return { file, changes, remaining }
}

const experimentDirectories = fs.readdirSync(EXPERIMENT_ROOT, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .filter((entry) => fs.readdirSync(path.join(EXPERIMENT_ROOT, entry.name))
    .some((file) => /Experiment\.tsx$/i.test(file)))
const files = [EXPERIMENT_ROOT, ...EXTRA_ROOTS].flatMap(walk)
const results = files.map(normalizeFile)
const changedFiles = results.filter((result) => result.changes > 0)
const violations = results.filter((result) => result.remaining.length > 0)

console.log(`实验目录：${experimentDirectories.length}`)
console.log(`扫描源码：${files.length}`)
console.log(`候选修改：${changedFiles.length} 个文件 / ${changedFiles.reduce((sum, item) => sum + item.changes, 0)} 处`)
console.log(`主题违规：${violations.length}`)

for (const violation of violations.slice(0, 30)) {
  console.log(`- ${path.relative(CLIENT_ROOT, violation.file)}: ${violation.remaining.join(', ')}`)
}

if (experimentDirectories.length !== 300) {
  console.error(`期望 300 个实验目录，实际 ${experimentDirectories.length}`)
  process.exitCode = 1
} else if (!SHOULD_APPLY && violations.length > 0) {
  process.exitCode = 1
}
