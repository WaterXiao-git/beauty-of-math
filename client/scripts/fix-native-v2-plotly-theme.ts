#!/usr/bin/env npx tsx

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import * as ts from 'typescript'

// ============================================================================
// Native Experiment V2 Plotly Theme Fixer
//
// 目标：
//
// 只处理:
//
//   experimentV2 = true
//   +
//   ExperimentShell
//   +
//   Plotly
//
// 自动修复：
//
//   paper_bgcolor
//   plot_bgcolor
//   font.color
//
// 默认 Dry Run。
//
// --apply 才修改源码。
//
// 不处理 Compatibility Runtime。
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
    'native-v2-plotly-theme-fix.json',
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

type EditType =
  | 'insert'
  | 'replace'

interface TextEdit {
  type:
    EditType

  start: number

  end: number

  text: string

  line: number

  reason: string
}

interface PlotInfo {
  line: number

  mode:
    | 'inline-object'
    | 'variable-object'
    | 'generated-layout'
    | 'already-themed'
    | 'unsupported'

  detail: string
}

interface FilePlan {
  id: string

  file: string

  relativeFile: string

  plotCount: number

  edits:
    TextEdit[]

  plots:
    PlotInfo[]

  unsafeCount: number

  changed: boolean
}

interface FixReport {
  generatedAt: string

  mode:
    | 'dry-run'
    | 'apply'

  scannedExperiments: number

  nativeV2PlotlyFiles: number

  candidateFiles: number

  changedFiles: number

  plotCount: number

  editCount: number

  unsafeLayouts: number

  backupPath:
    string | null

  files:
    FilePlan[]
}

// ============================================================================
// Theme
// ============================================================================

const TRANSPARENT_BACKGROUND =
  "'rgba(0,0,0,0)'"

const DEFAULT_FONT =
  "{ color: '#cbd5e1' }"

// ============================================================================
// Help
// ============================================================================

function printHelp() {
  console.log(`
Native Experiment V2 Plotly Theme Fixer

Dry Run:

  npx tsx scripts/fix-native-v2-plotly-theme.ts

Apply:

  npx tsx scripts/fix-native-v2-plotly-theme.ts --apply

处理范围：

  experimentV2 = true
  +
  ExperimentShell
  +
  react-plotly.js / <Plot>

自动补充：

  paper_bgcolor: 'rgba(0,0,0,0)'
  plot_bgcolor: 'rgba(0,0,0,0)'
  font: { color: '#cbd5e1' }

如果已经配置非白色背景则保留。

如果发现无法安全解析的 layout，会标记 unsupported，
不会强行修改。

本脚本不会修改 Compatibility Runtime。
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

function getLineNumber(
  sourceFile:
    ts.SourceFile,

  position: number,
): number {
  return (
    sourceFile
      .getLineAndCharacterOfPosition(
        position,
      )
      .line +
    1
  )
}

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

function usesPlotly(
  content: string,
): boolean {
  return (
    /react-plotly\.js/i.test(
      content,
    ) ||
    /<Plot\b/.test(
      content,
    )
  )
}

// ============================================================================
// JSX helpers
// ============================================================================

function isPlotTag(
  tag:
    ts.JsxTagNameExpression,

  sourceFile:
    ts.SourceFile,
): boolean {
  const text =
    tag.getText(
      sourceFile,
    )

  return (
    text ===
      'Plot' ||
    text.endsWith(
      '.Plot',
    )
  )
}

function getLayoutAttribute(
  attributes:
    ts.JsxAttributes,
):
  ts.JsxAttribute | null {
  for (
    const property
    of attributes.properties
  ) {
    if (
      ts.isJsxAttribute(
        property,
      ) &&
      property.name.getText() ===
        'layout'
    ) {
      return property
    }
  }

  return null
}

// ============================================================================
// AST traversal
// ============================================================================

function collectPlotNodes(
  sourceFile:
    ts.SourceFile,
):
  Array<
    ts.JsxSelfClosingElement |
    ts.JsxOpeningElement
  > {
  const result:
    Array<
      ts.JsxSelfClosingElement |
      ts.JsxOpeningElement
    > = []

  function visit(
    node:
      ts.Node,
  ) {
    if (
      ts.isJsxSelfClosingElement(
        node,
      ) &&
      isPlotTag(
        node.tagName,
        sourceFile,
      )
    ) {
      result.push(
        node,
      )
    }

    if (
      ts.isJsxOpeningElement(
        node,
      ) &&
      isPlotTag(
        node.tagName,
        sourceFile,
      )
    ) {
      result.push(
        node,
      )
    }

    ts.forEachChild(
      node,
      visit,
    )
  }

  visit(
    sourceFile,
  )

  return result
}

// ============================================================================
// Find variable
// ============================================================================

function findVariableDeclaration(
  sourceFile:
    ts.SourceFile,

  name: string,
):
  ts.VariableDeclaration | null {
  let result:
    ts.VariableDeclaration | null =
    null

  function visit(
    node:
      ts.Node,
  ) {
    if (
      result
    ) {
      return
    }

    if (
      ts.isVariableDeclaration(
        node,
      ) &&
      ts.isIdentifier(
        node.name,
      ) &&
      node.name.text ===
        name
    ) {
      result =
        node

      return
    }

    ts.forEachChild(
      node,
      visit,
    )
  }

  visit(
    sourceFile,
  )

  return result
}

// ============================================================================
// Expression → ObjectLiteral
// ============================================================================

function unwrapObjectLiteral(
  expression:
    ts.Expression,
):
  ts.ObjectLiteralExpression | null {
  if (
    ts.isObjectLiteralExpression(
      expression,
    )
  ) {
    return expression
  }

  if (
    ts.isParenthesizedExpression(
      expression,
    )
  ) {
    return unwrapObjectLiteral(
      expression.expression,
    )
  }

  if (
    ts.isAsExpression(
      expression,
    )
  ) {
    return unwrapObjectLiteral(
      expression.expression,
    )
  }

  if (
    ts.isTypeAssertionExpression(
      expression,
    )
  ) {
    return unwrapObjectLiteral(
      expression.expression,
    )
  }

  if (
    ts.isNonNullExpression(
      expression,
    )
  ) {
    return unwrapObjectLiteral(
      expression.expression,
    )
  }

  if (
    ts.isSatisfiesExpression(
      expression,
    )
  ) {
    return unwrapObjectLiteral(
      expression.expression,
    )
  }

  // ==========================================================================
  // useMemo(() => ({ ... }), [])
  // ==========================================================================

  if (
    ts.isCallExpression(
      expression,
    ) &&
    expression.arguments.length >
      0
  ) {
    const callback =
      expression.arguments[
        0
      ]

    if (
      ts.isArrowFunction(
        callback,
      ) ||
      ts.isFunctionExpression(
        callback,
      )
    ) {
      if (
        ts.isObjectLiteralExpression(
          callback.body,
        )
      ) {
        return callback.body
      }

      if (
        ts.isParenthesizedExpression(
          callback.body,
        )
      ) {
        return unwrapObjectLiteral(
          callback.body.expression,
        )
      }

      if (
        ts.isBlock(
          callback.body,
        )
      ) {
        for (
          const statement
          of callback.body.statements
        ) {
          if (
            ts.isReturnStatement(
              statement,
            ) &&
            statement.expression
          ) {
            const object =
              unwrapObjectLiteral(
                statement.expression,
              )

            if (
              object
            ) {
              return object
            }
          }
        }
      }
    }
  }

  return null
}

// ============================================================================
// Resolve layout object
// ============================================================================

function resolveLayoutObject(
  expression:
    ts.Expression,

  sourceFile:
    ts.SourceFile,
): {
  object:
    ts.ObjectLiteralExpression

  mode:
    'inline-object' |
    'variable-object'
} | null {
  const direct =
    unwrapObjectLiteral(
      expression,
    )

  if (
    direct
  ) {
    return {
      object:
        direct,

      mode:
        'inline-object',
    }
  }

  if (
    ts.isIdentifier(
      expression,
    )
  ) {
    const declaration =
      findVariableDeclaration(
        sourceFile,
        expression.text,
      )

    if (
      !declaration?.initializer
    ) {
      return null
    }

    const object =
      unwrapObjectLiteral(
        declaration.initializer,
      )

    if (
      object
    ) {
      return {
        object,

        mode:
          'variable-object',
      }
    }
  }

  return null
}

// ============================================================================
// Object properties
// ============================================================================

function propertyName(
  property:
    ts.ObjectLiteralElementLike,
): string | null {
  if (
    !property.name
  ) {
    return null
  }

  if (
    ts.isIdentifier(
      property.name,
    )
  ) {
    return property.name.text
  }

  if (
    ts.isStringLiteral(
      property.name,
    ) ||
    ts.isNumericLiteral(
      property.name,
    )
  ) {
    return property.name.text
  }

  return null
}

function findProperty(
  object:
    ts.ObjectLiteralExpression,

  name: string,
):
  ts.ObjectLiteralElementLike | null {
  for (
    const property
    of object.properties
  ) {
    if (
      propertyName(
        property,
      ) ===
      name
    ) {
      return property
    }
  }

  return null
}

// ============================================================================
// White detection
// ============================================================================

function normalizeColor(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /\s+/g,
      '',
    )
}

function isWhiteColor(
  value: string,
): boolean {
  const normalized =
    normalizeColor(
      value,
    )

  return [
    'white',
    '#fff',
    '#ffffff',
    'rgb(255,255,255)',
    'rgba(255,255,255,1)',
    'rgba(255,255,255,1.0)',
  ].includes(
    normalized,
  )
}

// ============================================================================
// Existing bgcolor edits
// ============================================================================

function maybeReplaceWhiteProperty(
  property:
    ts.ObjectLiteralElementLike | null,

  sourceFile:
    ts.SourceFile,

  name: string,
): TextEdit | null {
  if (
    !property ||
    !ts.isPropertyAssignment(
      property,
    )
  ) {
    return null
  }

  const initializer =
    property.initializer

  if (
    !ts.isStringLiteralLike(
      initializer,
    )
  ) {
    return null
  }

  if (
    !isWhiteColor(
      initializer.text,
    )
  ) {
    return null
  }

  return {
    type:
      'replace',

    start:
      initializer.getStart(
        sourceFile,
      ),

    end:
      initializer.getEnd(),

    text:
      TRANSPARENT_BACKGROUND,

    line:
      getLineNumber(
        sourceFile,
        initializer.getStart(
          sourceFile,
        ),
      ),

    reason:
      `${name}: white → transparent`,
  }
}

// ============================================================================
// Add missing properties
// ============================================================================

function createObjectThemeEdit(
  object:
    ts.ObjectLiteralExpression,

  sourceFile:
    ts.SourceFile,
):
  TextEdit | null {
  const paper =
    findProperty(
      object,
      'paper_bgcolor',
    )

  const plot =
    findProperty(
      object,
      'plot_bgcolor',
    )

  const font =
    findProperty(
      object,
      'font',
    )

  const missing:
    string[] = []

  if (
    !paper
  ) {
    missing.push(
      `paper_bgcolor: ${TRANSPARENT_BACKGROUND}`,
    )
  }

  if (
    !plot
  ) {
    missing.push(
      `plot_bgcolor: ${TRANSPARENT_BACKGROUND}`,
    )
  }

  if (
    !font
  ) {
    missing.push(
      `font: ${DEFAULT_FONT}`,
    )
  }

  if (
    missing.length ===
    0
  ) {
    return null
  }

  const start =
    object.getStart(
      sourceFile,
    )

  const end =
    object.getEnd()

  const body =
    sourceFile.text
      .slice(
        start +
          1,
        end -
          1,
      )
      .trim()

  let prefix =
    ''

  if (
    body.length >
    0
  ) {
    prefix =
      body.endsWith(
        ',',
      )
        ? ' '
        : ', '
  }

  return {
    type:
      'insert',

    start:
      end -
      1,

    end:
      end -
      1,

    text:
      `${prefix}${missing.join(
        ', ',
      )}`,

    line:
      getLineNumber(
        sourceFile,
        end -
          1,
      ),

    reason:
      `add ${missing
        .map(
          (
            property,
          ) =>
            property.split(
              ':',
            )[0],
        )
        .join(
          ', ',
        )}`,
  }
}

// ============================================================================
// Theme object
// ============================================================================

function createThemeEditsForObject(
  object:
    ts.ObjectLiteralExpression,

  sourceFile:
    ts.SourceFile,
):
  TextEdit[] {
  const edits:
    TextEdit[] = []

  const paper =
    findProperty(
      object,
      'paper_bgcolor',
    )

  const plot =
    findProperty(
      object,
      'plot_bgcolor',
    )

  const paperReplacement =
    maybeReplaceWhiteProperty(
      paper,
      sourceFile,
      'paper_bgcolor',
    )

  const plotReplacement =
    maybeReplaceWhiteProperty(
      plot,
      sourceFile,
      'plot_bgcolor',
    )

  if (
    paperReplacement
  ) {
    edits.push(
      paperReplacement,
    )
  }

  if (
    plotReplacement
  ) {
    edits.push(
      plotReplacement,
    )
  }

  const insertion =
    createObjectThemeEdit(
      object,
      sourceFile,
    )

  if (
    insertion
  ) {
    edits.push(
      insertion,
    )
  }

  return edits
}

// ============================================================================
// Generate layout attribute
// ============================================================================

function createGeneratedLayoutEdit(
  node:
    ts.JsxSelfClosingElement |
    ts.JsxOpeningElement,

  sourceFile:
    ts.SourceFile,
): TextEdit {
  const position =
    node.attributes.end

  return {
    type:
      'insert',

    start:
      position,

    end:
      position,

    text:
      ` layout={{ paper_bgcolor: ${TRANSPARENT_BACKGROUND}, plot_bgcolor: ${TRANSPARENT_BACKGROUND}, font: ${DEFAULT_FONT} }}`,

    line:
      getLineNumber(
        sourceFile,
        position,
      ),

    reason:
      'add missing Plot layout',
  }
}

// ============================================================================
// Deduplicate edits
// ============================================================================

function dedupeEdits(
  edits:
    TextEdit[],
): TextEdit[] {
  const seen =
    new Set<string>()

  const result:
    TextEdit[] = []

  for (
    const edit
    of edits
  ) {
    const key =
      [
        edit.start,
        edit.end,
        edit.text,
      ].join(
        ':',
      )

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
      edit,
    )
  }

  return result
}

// ============================================================================
// Plan file
// ============================================================================

function planFile(
  filePath: string,
): FilePlan | null {
  const content =
    fs.readFileSync(
      filePath,
      'utf8',
    )

  if (
    !isNativeV2(
      content,
    ) ||
    !usesExperimentShell(
      content,
    ) ||
    !usesPlotly(
      content,
    )
  ) {
    return null
  }

  const sourceFile =
    ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    )

  const plotNodes =
    collectPlotNodes(
      sourceFile,
    )

  const edits:
    TextEdit[] = []

  const plots:
    PlotInfo[] = []

  let unsafeCount =
    0

  const processedObjects =
    new Set<number>()

  for (
    const node
    of plotNodes
  ) {
    const line =
      getLineNumber(
        sourceFile,
        node.getStart(
          sourceFile,
        ),
      )

    const layout =
      getLayoutAttribute(
        node.attributes,
      )

    // =========================================================================
    // Plot has no layout at all
    // =========================================================================

    if (
      !layout
    ) {
      edits.push(
        createGeneratedLayoutEdit(
          node,
          sourceFile,
        ),
      )

      plots.push({
        line,

        mode:
          'generated-layout',

        detail:
          'Plot 没有 layout，自动增加透明主题。',
      })

      continue
    }

    // =========================================================================
    // layout exists but has no initializer
    // =========================================================================

    if (
      !layout.initializer
    ) {
      unsafeCount +=
        1

      plots.push({
        line,

        mode:
          'unsupported',

        detail:
          'layout 属性没有 initializer。',
      })

      continue
    }

    // =========================================================================
    // layout="..."
    // =========================================================================

    if (
      ts.isStringLiteral(
        layout.initializer,
      )
    ) {
      unsafeCount +=
        1

      plots.push({
        line,

        mode:
          'unsupported',

        detail:
          'layout 使用字符串形式，跳过。',
      })

      continue
    }

    // =========================================================================
    // layout={...}
    // =========================================================================

    if (
      !ts.isJsxExpression(
        layout.initializer,
      ) ||
      !layout.initializer.expression
    ) {
      unsafeCount +=
        1

      plots.push({
        line,

        mode:
          'unsupported',

        detail:
          'layout JSX expression 无法解析。',
      })

      continue
    }

    const resolved =
      resolveLayoutObject(
        layout.initializer.expression,
        sourceFile,
      )

    if (
      !resolved
    ) {
      unsafeCount +=
        1

      plots.push({
        line,

        mode:
          'unsupported',

        detail:
          `无法安全解析 layout={${layout.initializer.expression.getText(
            sourceFile,
          )}}`,
      })

      continue
    }

    const objectStart =
      resolved.object.getStart(
        sourceFile,
      )

    // =========================================================================
    // Same layout object may be shared by multiple Plot components
    // =========================================================================

    if (
      processedObjects.has(
        objectStart,
      )
    ) {
      plots.push({
        line,

        mode:
          'already-themed',

        detail:
          '该 Plot 与前面的 Plot 共用同一个 layout。',
      })

      continue
    }

    processedObjects.add(
      objectStart,
    )

    const objectEdits =
      createThemeEditsForObject(
        resolved.object,
        sourceFile,
      )

    if (
      objectEdits.length ===
      0
    ) {
      plots.push({
        line,

        mode:
          'already-themed',

        detail:
          'layout 已配置背景和字体主题。',
      })

      continue
    }

    edits.push(
      ...objectEdits,
    )

    plots.push({
      line,

      mode:
        resolved.mode,

      detail:
        `需要 ${objectEdits.length} 个主题修改。`,
    })
  }

  const uniqueEdits =
    dedupeEdits(
      edits,
    )

  return {
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

    plotCount:
      plotNodes.length,

    edits:
      uniqueEdits,

    plots,

    unsafeCount,

    changed:
      uniqueEdits.length >
      0,
  }
}

// ============================================================================
// Apply edits
// ============================================================================

function applyEdits(
  content: string,
  edits:
    TextEdit[],
): string {
  const ordered =
    [
      ...edits,
    ].sort(
      (
        a,
        b,
      ) =>
        b.start -
        a.start ||
        b.end -
        a.end,
    )

  let result =
    content

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
// Backup
// ============================================================================

function createBackup(
  plans:
    FilePlan[],
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
      `native-v2-plotly-theme-${timestamp}`,
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
// Apply plans
// ============================================================================

function applyPlans(
  plans:
    FilePlan[],
): number {
  let changed =
    0

  for (
    const plan
    of plans
  ) {
    if (
      !plan.changed
    ) {
      continue
    }

    const original =
      fs.readFileSync(
        plan.file,
        'utf8',
      )

    const next =
      applyEdits(
        original,
        plan.edits,
      )

    if (
      next ===
      original
    ) {
      continue
    }

    fs.writeFileSync(
      plan.file,
      next,
      'utf8',
    )

    changed +=
      1
  }

  return changed
}

// ============================================================================
// Console
// ============================================================================

function printPlans(
  plans:
    FilePlan[],

  scannedExperiments:
    number,
) {
  const candidates =
    plans.filter(
      (
        plan,
      ) =>
        plan.changed,
    )

  const plotCount =
    plans.reduce(
      (
        total,
        plan,
      ) =>
        total +
        plan.plotCount,
      0,
    )

  const editCount =
    plans.reduce(
      (
        total,
        plan,
      ) =>
        total +
        plan.edits.length,
      0,
    )

  const unsafe =
    plans.reduce(
      (
        total,
        plan,
      ) =>
        total +
        plan.unsafeCount,
      0,
    )

  console.log(
    '\n📊 Native V2 Plotly Theme Fix\n',
  )

  console.log(
    `模式：                ${
      SHOULD_APPLY
        ? 'APPLY'
        : 'DRY RUN'
    }`,
  )

  console.log(
    `实验总扫描：          ${scannedExperiments}`,
  )

  console.log(
    `Native V2 Plotly：    ${plans.length}`,
  )

  console.log(
    `Plot 组件：           ${plotCount}`,
  )

  console.log(
    `候选文件：            ${candidates.length}`,
  )

  console.log(
    `计划编辑：            ${editCount}`,
  )

  console.log(
    `无法安全解析：        ${unsafe}`,
  )

  console.log(
    '\n候选文件：\n',
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
      `  plots=${plan.plotCount} edits=${plan.edits.length} unsafe=${plan.unsafeCount}`,
    )

    for (
      const edit
      of plan.edits
    ) {
      console.log(
        `  L${edit.line}: ${edit.reason}`,
      )
    }

    console.log('')
  }

  const unsupported =
    plans.filter(
      (
        plan,
      ) =>
        plan.unsafeCount >
        0,
    )

  if (
    unsupported.length >
    0
  ) {
    console.log(
      '⚠️ 无法自动解析的文件：\n',
    )

    for (
      const plan
      of unsupported
    ) {
      console.log(
        `• ${plan.id}`,
      )

      for (
        const plot
        of plan.plots.filter(
          (
            item,
          ) =>
            item.mode ===
            'unsupported',
        )
      ) {
        console.log(
          `  L${plot.line}: ${plot.detail}`,
        )
      }

      console.log('')
    }
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
      `❌ 未找到 experiments：${EXPERIMENT_ROOT}`,
    )

    process.exitCode =
      1

    return
  }

  const experimentFiles =
    walk(
      EXPERIMENT_ROOT,
    ).sort()

  const plans =
    experimentFiles
      .map(
        planFile,
      )
      .filter(
        (
          plan,
        ): plan is FilePlan =>
          plan !==
          null,
      )

  printPlans(
    plans,
    experimentFiles.length,
  )

  const candidates =
    plans.filter(
      (
        plan,
      ) =>
        plan.changed,
    )

  const unsafeLayouts =
    plans.reduce(
      (
        total,
        plan,
      ) =>
        total +
        plan.unsafeCount,
      0,
    )

  let changedFiles =
    0

  let backupPath:
    string | null =
    null

  if (
    SHOULD_APPLY
  ) {
    backupPath =
      createBackup(
        plans,
      )

    changedFiles =
      applyPlans(
        plans,
      )

    console.log(
      `修改文件：            ${changedFiles}`,
    )

    if (
      backupPath
    ) {
      console.log(
        `备份：                ${path.relative(
          CLIENT_ROOT,
          backupPath,
        )}`,
      )
    }
  }

  const report:
    FixReport = {
    generatedAt:
      new Date().toISOString(),

    mode:
      SHOULD_APPLY
        ? 'apply'
        : 'dry-run',

    scannedExperiments:
      experimentFiles.length,

    nativeV2PlotlyFiles:
      plans.length,

    candidateFiles:
      candidates.length,

    changedFiles,

    plotCount:
      plans.reduce(
        (
          total,
          plan,
        ) =>
          total +
          plan.plotCount,
        0,
      ),

    editCount:
      plans.reduce(
        (
          total,
          plan,
        ) =>
          total +
          plan.edits.length,
        0,
      ),

    unsafeLayouts,

    backupPath:
      backupPath
        ? normalizeSlashes(
            path.relative(
              CLIENT_ROOT,
              backupPath,
            ),
          )
        : null,

    files:
      plans,
  }

  writeReport(
    report,
  )

  console.log(
    SHOULD_APPLY
      ? '\n✅ Native V2 Plotly 主题修复完成。\n'
      : '\n✅ Dry Run 完成，尚未修改源码。\n',
  )
}

main()