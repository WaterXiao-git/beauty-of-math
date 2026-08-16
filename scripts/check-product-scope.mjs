import { createReadStream } from 'node:fs'
import { access, lstat, readFile, readdir, realpath } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const ROOT_DIRECTORY = resolve(dirname(fileURLToPath(import.meta.url)), '..')
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
const EXPECTED_CHAPTERS = [
  { id: 'ch1', title: '函数、极限与连续' },
  { id: 'ch2', title: '导数与微分' },
  { id: 'ch3', title: '微分中值定理与导数的应用' },
  { id: 'ch4', title: '不定积分与定积分' },
]
const FORBIDDEN_PATHS = [
  'client/src/experiments', 'client/src/narrations', 'client/public/audio/narrations',
  'client/src/components/NarrationPresenter', 'client/src/components/NarrationController',
  'client/src/contexts/NarrationContext.tsx', 'client/src/experiment-v2/LegacyExperimentRuntime.tsx',
  'client/src/experiment-v2/legacyExperimentRegistry.ts', 'client/src/experiment-v2/knowledgeExperimentMap.ts',
  'server/src/agent/manifests', 'server/src/routes/experiments.ts', 'server/src/routes/route.ts',
  'server/src/routes/generate.ts', 'server/src/services/experimentCatalogService.ts',
  'server/src/services/experimentCatalogService.test.ts', 'server/src/services/routeService.ts',
  'server/src/services/generateService.ts', 'server/src/content/experimentTaxonomy.ts',
  'server/src/data/experimentManifest.ts', 'server/scripts', 'client/scripts/check-experiment-v2-quality.ts',
  'client/scripts/check-missing-knowledge-renderers.ts', 'client/scripts/convert_ts_to_json.py',
  'client/scripts/export-narrations.ts', 'client/scripts/finalize_audio.py',
  'client/scripts/fix-native-v2-plotly-theme.ts', 'client/scripts/fix-native-v2-white-cards.ts',
  'client/scripts/generate_audio.py', 'client/scripts/migrate-experiments-v2.ts',
  'client/scripts/normalize-experiment-light-theme.ts', 'client/scripts/plan-compatibility-v2-migration.ts',
  'client/scripts/qa_narration.py',
]
const RISK_SIGNATURES = [
  { label: '旧实验总数文案', pattern: /浏览全部\s*300\s*个可视化实验|浏览全部\s*300/ },
  { label: '旧实验 Catalog 导入', pattern: /(?:^|[/'"])experiments\/catalog/ },
  { label: '旧实验 API 挂载', pattern: /\/api\/experiments/ },
  { label: 'Legacy Runtime', pattern: /LegacyExperimentRuntime/ },
  { label: '旧 Registry', pattern: /legacyExperimentRegistry|knowledgeExperimentMap/ },
  { label: '旧讲解运行时', pattern: /NarrationProvider|NarrationController|NarrationPresenter|usePresenterHistory/ },
  { label: '旧搜索工具', pattern: /search-experiments/ },
]
const DIST_RISK_SIGNATURES = [...RISK_SIGNATURES, { label: '旧正式实验 ID', pattern: /\b(?:fourier|basic-arithmetic|conic-sections)\b/ }]
const PATH_RISK_SIGNATURES = [
  { label: '旧正式实验资源路径', pattern: /(?:^|[\\/_.-])(?:fourier|basic-arithmetic|conic-sections)(?:$|[\\/_.-])/iu },
  { label: '旧讲解资源路径', pattern: /(?:^|[\\/_.-])narration(?:$|[\\/_.-])/iu },
]
const TEXT_EXTENSIONS = new Set(['.css', '.csv', '.html', '.js', '.json', '.mjs', '.svg', '.ts', '.tsx', '.txt', '.webmanifest', '.xml', '.yaml', '.yml'])
const SOURCE_SCAN_PATHS = [
  'client/src', 'server/src', 'client/public', 'package.json', 'package-lock.json',
  'client/package.json', 'client/package-lock.json', 'client/pnpm-lock.yaml',
  'server/package.json', 'server/package-lock.json',
]
const READONLY_ARRAY_METHODS = new Set(['at', 'every', 'filter', 'find', 'findIndex', 'findLast', 'findLastIndex', 'flatMap', 'forEach', 'includes', 'indexOf', 'lastIndexOf', 'map', 'reduce', 'reduceRight', 'some'])
const ELEMENT_CALLBACK_METHODS = new Set(['every', 'filter', 'find', 'findIndex', 'findLast', 'findLastIndex', 'flatMap', 'forEach', 'map', 'reduce', 'reduceRight', 'some'])
const ELEMENT_RESULT_METHODS = new Set(['at', 'find', 'findLast'])
const ELEMENT_ARRAY_RESULT_METHODS = new Set(['concat', 'filter', 'flat', 'flatMap', 'map', 'slice', 'toReversed', 'toSorted', 'toSpliced', 'with'])
const SIGNATURE_EXCEPTIONS = new Map([
  ['client/src/services/agentRouting.test.ts', new Set(['旧搜索工具'])],
  ['server/src/app.test.ts', new Set(['旧实验 API 挂载'])],
  ['server/dist/app.test.js', new Set(['旧实验 API 挂载'])],
])

function parseArguments(arguments_) {
  let rootDirectory = ROOT_DIRECTORY
  let scanDist = false
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index]
    if (argument === '--dist') {
      scanDist = true
    } else if (argument === '--root') {
      const root = arguments_[index + 1]
      if (!root) throw new Error('--root requires a directory.')
      rootDirectory = resolve(root)
      index += 1
    } else {
      throw new Error(`Unknown argument: ${argument}`)
    }
  }
  return { rootDirectory, scanDist }
}

function displayPath(rootDirectory, path) {
  return relative(rootDirectory, path).replaceAll('\\', '/') || '.'
}

function isWithin(rootDirectory, path) {
  const relativePath = relative(rootDirectory, path)
  return relativePath === '' || (!relativePath.startsWith('..') && !isAbsolute(relativePath))
}

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function collectEntries(rootDirectory, path, violations) {
  if (!await exists(path)) return []
  const relativePath = displayPath(rootDirectory, path)
  let metadata
  try {
    metadata = await lstat(path)
  } catch (error) {
    violations.push(`${relativePath}: 无法安全读取路径（${error.message}）`)
    return []
  }
  if (metadata.isSymbolicLink()) {
    violations.push(`${relativePath}: 不允许符号链接或目录联接进入审计范围。`)
    return []
  }
  let resolvedPath
  try {
    resolvedPath = await realpath(path)
  } catch (error) {
    violations.push(`${relativePath}: 无法解析真实路径（${error.message}）`)
    return []
  }
  if (!isWithin(rootDirectory, resolvedPath)) {
    violations.push(`${relativePath}: 解析后的路径越出审计根目录。`)
    return []
  }
  if (!metadata.isDirectory()) return [path]

  const entries = [path]
  for (const entry of await readdir(path, { withFileTypes: true })) {
    entries.push(...await collectEntries(rootDirectory, resolve(path, entry.name), violations))
  }
  return entries
}

function hasTextExtension(path) {
  return TEXT_EXTENSIONS.has(path.slice(path.lastIndexOf('.')).toLowerCase())
}

async function readTextAsset(path) {
  let text = ''
  for await (const chunk of createReadStream(path, { encoding: 'utf8' })) text += chunk
  return text
}

function checkPathSignatures(relativePath, violations) {
  for (const signature of PATH_RISK_SIGNATURES) {
    if (signature.pattern.test(relativePath)) violations.push(`${relativePath}: ${signature.label}`)
  }
}

function isSignatureException(relativePath, signature) {
  return SIGNATURE_EXCEPTIONS.get(relativePath)?.has(signature.label) ?? false
}

async function scanPaths(rootDirectory, paths, signatures, violations) {
  for (const scanPath of paths) {
    for (const entryPath of await collectEntries(rootDirectory, resolve(rootDirectory, scanPath), violations)) {
      const relativePath = displayPath(rootDirectory, entryPath)
      checkPathSignatures(relativePath, violations)
      const metadata = await lstat(entryPath)
      if (metadata.isDirectory() || !hasTextExtension(entryPath)) continue
      const text = await readTextAsset(entryPath)
      for (const signature of signatures) {
        if (signature.pattern.test(text) && !isSignatureException(relativePath, signature)) {
          violations.push(`${relativePath}: ${signature.label}`)
        }
      }
    }
  }
}

async function checkOwnedExperimentCatalog(rootDirectory, violations) {
  const path = resolve(rootDirectory, 'config/owned-experiments.json')
  let experiments
  try {
    experiments = JSON.parse(await readFile(path, 'utf8'))
  } catch (error) {
    violations.push(`config/owned-experiments.json: 无法读取唯一自研实验清单（${error.message}）`)
    return
  }
  if (!Array.isArray(experiments) || experiments.length !== OWNED_EXPERIMENT_IDS.length) {
    violations.push(`config/owned-experiments.json: 自研实验清单必须恰好包含 ${OWNED_EXPERIMENT_IDS.length} 项。`)
    return
  }
  const ids = experiments.map(({ id }) => id).sort()
  if (new Set(ids).size !== ids.length || JSON.stringify(ids) !== JSON.stringify(OWNED_EXPERIMENT_IDS)) {
    violations.push(`config/owned-experiments.json: 自研实验 ID 必须严格等于批准的 ${OWNED_EXPERIMENT_IDS.length} 项白名单。`)
  }
  if (experiments.some(({ ownership }) => ownership !== 'self-developed')) {
    violations.push('config/owned-experiments.json: 所有正式实验必须标记为 self-developed。')
  }
}

function unwrapExpression(expression) {
  let current = expression
  while (ts.isAsExpression(current) || ts.isTypeAssertionExpression(current) || ts.isParenthesizedExpression(current)) {
    current = current.expression
  }
  return current
}

function getStaticString(expression) {
  const value = unwrapExpression(expression)
  return ts.isStringLiteralLike(value) ? value.text : undefined
}

function propertyName(property) {
  if (!ts.isPropertyAssignment(property) || property.name && ts.isComputedPropertyName(property.name)) return undefined
  if (ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name)) return property.name.text
  return undefined
}

function objectProperties(object, context) {
  const properties = new Map()
  for (const property of object.properties) {
    const name = propertyName(property)
    if (!name || properties.has(name)) throw new Error(`${context} 含有动态、展开或重复属性。`)
    properties.set(name, property.initializer)
  }
  return properties
}

function variableDeclarations(sourceFile, name) {
  const declarations = []
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name) declarations.push(node)
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return declarations
}

function singleVariableDeclaration(sourceFile, name, context) {
  const declarations = variableDeclarations(sourceFile, name)
  if (declarations.length !== 1 || !declarations[0].initializer) throw new Error(`${context} 必须有唯一的静态声明。`)
  return declarations[0]
}

function isExportedDeclaration(declaration) {
  return ts.isVariableStatement(declaration.parent?.parent)
    && declaration.parent.parent.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
}

function baseIdentifier(expression) {
  let current = expression
  while (ts.isPropertyAccessExpression(current) || ts.isElementAccessExpression(current)) current = current.expression
  return ts.isIdentifier(current) ? current.text : undefined
}

function assertNoDynamicMutation(sourceFile, trackedNames, context) {
  const mutatingMethods = new Set(['copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'])
  function targetsTracked(expression) {
    return trackedNames.has(baseIdentifier(expression))
  }
  function visit(node) {
    if (ts.isBinaryExpression(node) && ts.isAssignmentOperator(node.operatorToken.kind) && targetsTracked(node.left)) {
      throw new Error(`${context} 不允许对正式课程范围作动态或计算属性变更。`)
    }
    if ((ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) && targetsTracked(node.operand)) {
      throw new Error(`${context} 不允许对正式课程范围作动态或计算属性变更。`)
    }
    if (ts.isCallExpression(node) && (ts.isPropertyAccessExpression(node.expression) || ts.isElementAccessExpression(node.expression))) {
      const receiver = node.expression.expression
      const method = ts.isPropertyAccessExpression(node.expression) ? node.expression.name.text : undefined
      if (targetsTracked(receiver) && (!method || mutatingMethods.has(method))) {
        throw new Error(`${context} 不允许对正式课程范围作动态或计算属性变更。`)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
}

function unwrapReference(identifier) {
  let current = identifier
  while (ts.isAsExpression(current.parent) || ts.isTypeAssertionExpression(current.parent) || ts.isParenthesizedExpression(current.parent)) {
    current = current.parent
  }
  return current
}

function isReadonlyMethodCall(reference) {
  const access = reference.parent
  if (!ts.isPropertyAccessExpression(access) || access.expression !== reference || !ts.isCallExpression(access.parent) || access.parent.expression !== access) return false
  return READONLY_ARRAY_METHODS.has(access.name.text)
}

function isApprovedCatalogChaptersReference(reference) {
  const property = reference.parent
  if (!ts.isPropertyAssignment(property) || property.initializer !== reference || propertyName(property) !== 'chapters') return false
  const object = property.parent
  return ts.isObjectLiteralExpression(object)
    && ts.isVariableDeclaration(object.parent)
    && ts.isIdentifier(object.parent.name)
    && object.parent.name.text === 'HIGHER_MATHEMATICS_COURSE'
}

function isIndirectMutationCall(call) {
  return ts.isPropertyAccessExpression(call.expression)
    && ((ts.isIdentifier(call.expression.expression) && call.expression.expression.text === 'Object' && call.expression.name.text === 'assign')
      || (ts.isIdentifier(call.expression.expression) && call.expression.expression.text === 'Reflect' && call.expression.name.text === 'set'))
}

function isObjectFreezeCall(call, expectedName) {
  return ts.isCallExpression(call)
    && ts.isPropertyAccessExpression(call.expression)
    && ts.isIdentifier(call.expression.expression)
    && call.expression.expression.text === 'Object'
    && call.expression.name.text === 'freeze'
    && call.arguments.length === 1
    && ts.isIdentifier(unwrapExpression(call.arguments[0]))
    && unwrapExpression(call.arguments[0]).text === expectedName
}

function isObjectFreezeArgument(call, reference) {
  return ts.isCallExpression(call)
    && ts.isPropertyAccessExpression(call.expression)
    && ts.isIdentifier(call.expression.expression)
    && call.expression.expression.text === 'Object'
    && call.expression.name.text === 'freeze'
    && call.arguments.length === 1
    && call.arguments[0] === reference
}

function isConstDeclaration(declaration) {
  return ts.isVariableDeclarationList(declaration.parent) && (declaration.parent.flags & ts.NodeFlags.Const) !== 0
}

function directProtectedReference(expression, protectedNames) {
  const value = unwrapExpression(expression)
  return ts.isIdentifier(value) && protectedNames.has(value.text)
}

function collectProtectedAliases(sourceFile, protectedName) {
  const protectedNames = new Set([protectedName])
  let changed = true
  while (changed) {
    changed = false
    function visit(node) {
      if (ts.isVariableDeclaration(node) && node.initializer && directProtectedReference(node.initializer, protectedNames)) {
        if (!ts.isIdentifier(node.name) || !isConstDeclaration(node)) {
          throw new Error('不允许将受保护课程范围赋给可变别名或解构。')
        }
        if (!protectedNames.has(node.name.text)) {
          protectedNames.add(node.name.text)
          changed = true
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(sourceFile)
  }
  return protectedNames
}

function assertNoProtectedReferenceEscape(sourceFile, protectedNames, allowCatalogChaptersProperty = false) {
  function visit(node) {
    if (ts.isIdentifier(node) && protectedNames.has(node.text)) {
      const reference = unwrapReference(node)
      const parent = reference.parent
      if (ts.isVariableDeclaration(parent) && parent.name === node) {
        // The protected declaration itself is the source of truth.
      } else if (ts.isVariableDeclaration(parent) && directProtectedReference(parent.initializer, protectedNames) && ts.isIdentifier(parent.name) && protectedNames.has(parent.name.text)) {
        // Direct const aliases are tracked and remain subject to the same checks.
      } else if (ts.isImportSpecifier(parent)) {
        // courseCatalog's named import is the sole approved cross-module reference.
      } else if (ts.isForOfStatement(parent) && parent.expression === reference) {
        // Iteration is an approved direct readonly use.
      } else if (isReadonlyMethodCall(reference)) {
        // Explicit array read methods are approved direct readonly uses.
      } else if (allowCatalogChaptersProperty && isApprovedCatalogChaptersReference(reference)) {
        // The formal course object may directly reference the approved chapter array.
      } else if (ts.isVariableDeclaration(parent) || ts.isBinaryExpression(parent) || ts.isBindingElement(parent)) {
        throw new Error('不允许将受保护课程范围赋给可变别名或解构。')
      } else if (ts.isCallExpression(parent) && parent.arguments.includes(reference)) {
        if (isObjectFreezeArgument(parent, reference)) return
        if (isIndirectMutationCall(parent)) throw new Error('不允许将受保护课程范围传给 Object.assign 或 Reflect.set。')
        throw new Error('不允许将受保护课程范围传给未知函数。')
      } else {
        throw new Error('不允许将受保护课程范围返回、导出或传入无法证明只读的结构。')
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
}

function protectedArrayMethodCall(node, elementArrayNames) {
  if (!ts.isCallExpression(node) || !ts.isPropertyAccessExpression(node.expression)) return undefined
  if (!isProtectedElementArray(node.expression.expression, elementArrayNames)) return undefined
  return node.expression.name.text
}

function isProtectedElementArray(expression, elementArrayNames) {
  const value = unwrapExpression(expression)
  if (ts.isIdentifier(value)) return elementArrayNames.has(value.text)
  return ts.isCallExpression(value)
    && ts.isPropertyAccessExpression(value.expression)
    && ELEMENT_ARRAY_RESULT_METHODS.has(value.expression.name.text)
    && isProtectedElementArray(value.expression.expression, elementArrayNames)
}

function isProtectedElement(expression, state) {
  const value = unwrapExpression(expression)
  if (ts.isIdentifier(value) && state.elementNames.has(value.text)) return true
  if (ts.isElementAccessExpression(value)) return isProtectedElementArray(value.expression, state.elementArrayNames)
  if (!ts.isCallExpression(value) || !ts.isPropertyAccessExpression(value.expression)) return false
  const method = value.expression.name.text
  if (ELEMENT_RESULT_METHODS.has(method)) return isProtectedElementArray(value.expression.expression, state.elementArrayNames)
  return (method === 'reduce' || method === 'reduceRight')
    && value.arguments.length === 1
    && isProtectedElementArray(value.expression.expression, state.elementArrayNames)
}

function collectProtectedElementState(sourceFile, protectedNames) {
  const elementArrayNames = new Set(protectedNames)
  const elementNames = new Set()
  let changed = true
  while (changed) {
    changed = false
    const state = { elementArrayNames, elementNames }
    function addName(names, name) {
      if (!names.has(name)) {
        names.add(name)
        changed = true
      }
    }
    function addBinding(parameter) {
      if (!parameter || !ts.isIdentifier(parameter.name)) {
        throw new Error('无法静态证明受保护课程元素的回调或迭代绑定。')
      }
      addName(elementNames, parameter.name.text)
    }
    function visit(node) {
      if (ts.isForOfStatement(node) && isProtectedElementArray(node.expression, elementArrayNames)) {
        if (!ts.isVariableDeclarationList(node.initializer) || (node.initializer.flags & ts.NodeFlags.Const) === 0 || node.initializer.declarations.length !== 1) {
          throw new Error('无法静态证明受保护课程元素的回调或迭代绑定。')
        }
        addBinding(node.initializer.declarations[0])
      }
      const method = protectedArrayMethodCall(node, elementArrayNames)
      if (method && ELEMENT_CALLBACK_METHODS.has(method)) {
        const callback = node.arguments[0]
        if (!ts.isArrowFunction(callback) && !ts.isFunctionExpression(callback)) {
          throw new Error('无法静态证明受保护课程元素的回调或迭代绑定。')
        }
        if ((method === 'reduce' || method === 'reduceRight') && node.arguments.length === 1 && callback.parameters.length > 0) {
          addBinding(callback.parameters[0])
        }
        const elementParameterIndex = method === 'reduce' || method === 'reduceRight' ? 1 : 0
        if (callback.parameters.length > elementParameterIndex) addBinding(callback.parameters[elementParameterIndex])
      }
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
        if (isProtectedElement(node.initializer, state)) addName(elementNames, node.name.text)
        if (isProtectedElementArray(node.initializer, elementArrayNames)) addName(elementArrayNames, node.name.text)
      }
      ts.forEachChild(node, visit)
    }
    visit(sourceFile)
  }
  return { elementArrayNames, elementNames }
}

function assertNoProtectedElementEscape(sourceFile, state, context) {
  function targetsElement(expression) {
    let current = unwrapExpression(expression)
    while (ts.isPropertyAccessExpression(current) || ts.isElementAccessExpression(current)) {
      if (isProtectedElement(current, state)) return true
      current = current.expression
    }
    return isProtectedElement(current, state)
  }
  function isReadonlyElementMethodCall(node) {
    return ts.isCallExpression(node)
      && ts.isPropertyAccessExpression(node.expression)
      && targetsElement(node.expression.expression)
      && READONLY_ARRAY_METHODS.has(node.expression.name.text)
  }
  function visit(node) {
    if (ts.isBinaryExpression(node) && ts.isAssignmentOperator(node.operatorToken.kind) && targetsElement(node.left)) {
      throw new Error(`${context} 不允许对受保护课程元素作属性或计算属性变更。`)
    }
    if ((ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) && targetsElement(node.operand)) {
      throw new Error(`${context} 不允许对受保护课程元素作属性或计算属性变更。`)
    }
    if (ts.isDeleteExpression(node) && targetsElement(node.expression)) {
      throw new Error(`${context} 不允许删除受保护课程元素属性。`)
    }
    if (ts.isCallExpression(node)) {
      if (node.arguments.some((argument) => targetsElement(argument))) {
        if (node.arguments.some((argument) => isObjectFreezeArgument(node, unwrapReference(argument)))) {
          ts.forEachChild(node, visit)
          return
        }
        if (isIndirectMutationCall(node)) throw new Error('不允许将受保护课程元素传给 Object.assign 或 Reflect.set。')
        throw new Error('不允许将受保护课程元素传给未知函数。')
      }
      if (ts.isPropertyAccessExpression(node.expression) && targetsElement(node.expression.expression) && !isReadonlyElementMethodCall(node)) {
        throw new Error('不允许调用受保护课程元素的未知方法。')
      }
    }
    if (ts.isIdentifier(node) && state.elementNames.has(node.text)) {
      const reference = unwrapReference(node)
      const parent = reference.parent
      if (ts.isParameter(parent) && parent.name === node) {
        // The callback parameter is the protected element binding.
      } else if (ts.isVariableDeclaration(parent) && parent.name === node) {
        // The for-of declaration is the protected element binding.
      } else if ((ts.isPropertyAccessExpression(parent) || ts.isElementAccessExpression(parent)) && parent.expression === reference) {
        // Reads are allowed; writes and unknown calls are handled above.
      } else if (ts.isCallExpression(parent) && parent.arguments.includes(reference)) {
        // Calls are handled above.
      } else if (ts.isReturnStatement(parent) && parent.expression === reference) {
        // Returning a matched element is an approved readonly query result.
      } else if (ts.isIfStatement(parent) && parent.expression === reference) {
        // A presence check is a readonly query use.
      } else {
        throw new Error('不允许返回、别名或导出受保护课程元素。')
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
}

function parseSourceFile(path, content) {
  const sourceFile = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  if (sourceFile.parseDiagnostics.length > 0) throw new Error('包含无法静态解析的 TypeScript 语法。')
  return sourceFile
}

function staticChapters(courseData) {
  const declaration = singleVariableDeclaration(courseData, 'courseChapters', 'courseChapters')
  if (!isExportedDeclaration(declaration)) throw new Error('courseChapters 必须是显式导出的静态章节数组。')
  const initializer = unwrapExpression(declaration.initializer)
  if (!ts.isArrayLiteralExpression(initializer)) throw new Error('courseChapters 必须直接声明为静态章节数组。')
  const chapters = initializer.elements.map((element) => {
    if (!ts.isObjectLiteralExpression(element)) throw new Error('courseChapters 不允许章节展开或动态项。')
    const properties = objectProperties(element, '章节')
    return { id: getStaticString(properties.get('id')), title: getStaticString(properties.get('title')) }
  })
  if (JSON.stringify(chapters) !== JSON.stringify(EXPECTED_CHAPTERS)) {
    throw new Error('章节 ID、标题和顺序必须精确匹配批准范围。')
  }
  const declarationStatement = declaration.parent.parent
  const declarationIndex = courseData.statements.indexOf(declarationStatement)
  const elementFreeze = courseData.statements[declarationIndex + 1]
  const arrayFreeze = courseData.statements[declarationIndex + 2]
  const loopDeclaration = elementFreeze && ts.isForOfStatement(elementFreeze)
    && ts.isVariableDeclarationList(elementFreeze.initializer)
    && elementFreeze.initializer.declarations.length === 1
    ? elementFreeze.initializer.declarations[0]
    : undefined
  const loopName = loopDeclaration && ts.isIdentifier(loopDeclaration.name) ? loopDeclaration.name.text : undefined
  const loopBody = elementFreeze && ts.isForOfStatement(elementFreeze)
    ? (ts.isBlock(elementFreeze.statement) ? elementFreeze.statement.statements[0] : elementFreeze.statement)
    : undefined
  if (!elementFreeze
    || !ts.isForOfStatement(elementFreeze)
    || !ts.isIdentifier(elementFreeze.expression)
    || elementFreeze.expression.text !== 'courseChapters'
    || !loopName
    || !loopBody
    || !ts.isExpressionStatement(loopBody)
    || !isObjectFreezeCall(loopBody.expression, loopName)
    || !arrayFreeze
    || !ts.isExpressionStatement(arrayFreeze)
    || !isObjectFreezeCall(arrayFreeze.expression, 'courseChapters')) {
    throw new Error('正式课程章节必须在声明后立即逐章运行时冻结，并冻结章节数组。')
  }
}

function importedCourseChapters(catalog) {
  const declaration = catalog.statements.find((statement) => ts.isImportDeclaration(statement)
    && ts.isStringLiteral(statement.moduleSpecifier)
    && statement.moduleSpecifier.text === './courseData'
    && statement.importClause?.namedBindings
    && ts.isNamedImports(statement.importClause.namedBindings)
    && statement.importClause.namedBindings.elements.some((element) => element.name.text === 'courseChapters' && (element.propertyName?.text ?? 'courseChapters') === 'courseChapters'))
  if (!declaration) throw new Error('courseCatalog 必须从 ./courseData 静态导入 courseChapters。')
}

function staticCatalog(catalog) {
  importedCourseChapters(catalog)
  const courseDeclaration = singleVariableDeclaration(catalog, 'HIGHER_MATHEMATICS_COURSE', 'HIGHER_MATHEMATICS_COURSE')
  if (!isExportedDeclaration(courseDeclaration)) throw new Error('HIGHER_MATHEMATICS_COURSE 必须是显式导出的正式课程。')
  const course = unwrapExpression(courseDeclaration.initializer)
  if (!ts.isObjectLiteralExpression(course)) throw new Error('HIGHER_MATHEMATICS_COURSE 必须为静态对象。')
  const courseProperties = objectProperties(course, '正式课程')
  const chapters = courseProperties.get('chapters')
  if (getStaticString(courseProperties.get('id')) !== 'higher-mathematics-1' || !chapters || !ts.isIdentifier(unwrapExpression(chapters)) || unwrapExpression(chapters).text !== 'courseChapters') {
    throw new Error('正式课程必须静态引用 approved courseChapters。')
  }
  const coursesDeclaration = singleVariableDeclaration(catalog, 'courses', 'courses')
  if (!isExportedDeclaration(coursesDeclaration)) throw new Error('courses 必须是显式导出的正式课程目录。')
  const courses = unwrapExpression(coursesDeclaration.initializer)
  if (!ts.isArrayLiteralExpression(courses) || courses.elements.length !== 1 || !ts.isIdentifier(courses.elements[0]) || courses.elements[0].text !== 'HIGHER_MATHEMATICS_COURSE') {
    throw new Error('courses 必须只包含唯一的高等数学（上册）静态课程。')
  }
  const courseStatement = courseDeclaration.parent.parent
  const courseIndex = catalog.statements.indexOf(courseStatement)
  const courseFreeze = catalog.statements[courseIndex + 1]
  const coursesStatement = coursesDeclaration.parent.parent
  const coursesIndex = catalog.statements.indexOf(coursesStatement)
  const coursesFreeze = catalog.statements[coursesIndex + 1]
  if (!courseFreeze
    || !ts.isExpressionStatement(courseFreeze)
    || !isObjectFreezeCall(courseFreeze.expression, 'HIGHER_MATHEMATICS_COURSE')
    || !coursesFreeze
    || !ts.isExpressionStatement(coursesFreeze)
    || !isObjectFreezeCall(coursesFreeze.expression, 'courses')) {
    throw new Error('正式课程对象和课程目录必须在声明后立即运行时冻结。')
  }
}

async function readAuditedSource(rootDirectory, path) {
  const relativePath = displayPath(rootDirectory, path)
  const metadata = await lstat(path)
  if (metadata.isSymbolicLink()) throw new Error(`${relativePath} 不允许符号链接或目录联接。`)
  const resolvedPath = await realpath(path)
  if (!isWithin(rootDirectory, resolvedPath)) throw new Error(`${relativePath} 解析后的路径越出审计根目录。`)
  return readFile(resolvedPath, 'utf8')
}

async function checkCourseScope(rootDirectory, violations) {
  const catalogPath = resolve(rootDirectory, 'client/src/course/courseCatalog.ts')
  const dataPath = resolve(rootDirectory, 'client/src/course/courseData.ts')
  try {
    const courseData = parseSourceFile(dataPath, await readAuditedSource(rootDirectory, dataPath))
    const protectedChapters = collectProtectedAliases(courseData, 'courseChapters')
    const protectedChapterElements = collectProtectedElementState(courseData, protectedChapters)
    assertNoDynamicMutation(courseData, protectedChapters, 'client/src/course/courseData.ts')
    assertNoProtectedReferenceEscape(courseData, protectedChapters)
    assertNoProtectedElementEscape(courseData, protectedChapterElements, 'client/src/course/courseData.ts')
    staticChapters(courseData)
  } catch (error) {
    violations.push(`client/src/course/courseData.ts: 无法静态证明课程章节范围（${error.message}）`)
  }
  try {
    const courseCatalog = parseSourceFile(catalogPath, await readAuditedSource(rootDirectory, catalogPath))
    const protectedChapters = collectProtectedAliases(courseCatalog, 'courseChapters')
    const protectedCourses = collectProtectedAliases(courseCatalog, 'courses')
    assertNoDynamicMutation(courseCatalog, new Set([...protectedCourses, 'HIGHER_MATHEMATICS_COURSE']), 'client/src/course/courseCatalog.ts')
    assertNoProtectedReferenceEscape(courseCatalog, protectedChapters, true)
    assertNoProtectedReferenceEscape(courseCatalog, protectedCourses)
    staticCatalog(courseCatalog)
  } catch (error) {
    violations.push(`client/src/course/courseCatalog.ts: 无法静态证明正式课程范围（${error.message}）`)
  }
}

async function checkForbiddenPaths(rootDirectory, violations) {
  for (const forbiddenPath of FORBIDDEN_PATHS) {
    const path = resolve(rootDirectory, forbiddenPath)
    if (!await exists(path)) continue
    for (const foundPath of await collectEntries(rootDirectory, path, violations)) {
      violations.push(`${displayPath(rootDirectory, foundPath)}: 已删除的许可证风险路径不得回流。`)
    }
  }
}

async function checkDist(rootDirectory, violations) {
  for (const directory of ['client/dist', 'server/dist']) {
    if (!await exists(resolve(rootDirectory, directory))) violations.push(`${directory}: 缺少待审计的构建产物目录。`)
  }
  await scanPaths(rootDirectory, ['client/dist', 'server/dist'], DIST_RISK_SIGNATURES, violations)
}

async function resolveAuditRoot(inputPath) {
  const metadata = await lstat(inputPath)
  if (metadata.isSymbolicLink()) throw new Error(`--root ${inputPath}: 不允许符号链接或目录联接。`)
  if (!metadata.isDirectory()) throw new Error(`--root ${inputPath}: 必须是目录。`)
  return realpath(inputPath)
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const rootDirectory = await resolveAuditRoot(options.rootDirectory)
  const violations = []
  await checkOwnedExperimentCatalog(rootDirectory, violations)
  await checkCourseScope(rootDirectory, violations)
  await checkForbiddenPaths(rootDirectory, violations)
  await scanPaths(rootDirectory, SOURCE_SCAN_PATHS, RISK_SIGNATURES, violations)
  if (options.scanDist) await checkDist(rootDirectory, violations)
  if (violations.length > 0) {
    console.error('产品范围检查失败：')
    for (const violation of [...new Set(violations)]) console.error(`- ${violation}`)
    process.exitCode = 1
    return
  }
  console.log(`产品范围检查通过：1 门课程、4 章、${OWNED_EXPERIMENT_IDS.length} 个正式实验${options.scanDist ? '；已审计前后端构建产物。' : '。'}`)
}

main().catch((error) => {
  console.error(`产品范围检查失败：${error.message}`)
  process.exitCode = 1
})
