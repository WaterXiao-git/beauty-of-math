import {
  DYNAMIC_RENDERER_TYPES,
  type ArithmeticOperation,
  type DynamicExperimentSpec,
  type DynamicExperimentStep,
  type DynamicRendererSpec,
  type DynamicSliderParameter,
} from './types.js'

const MAX_TEXT_LENGTH = 500
const MAX_EXPRESSION_LENGTH = 180
const MAX_SANDBOX_DOCUMENT_LENGTH = 50_000
const MAX_PARAMETERS = 6
const MAX_STEPS = 8
const MAX_KNOWLEDGE_POINTS = 8

const EXPRESSION_FUNCTIONS = new Set([
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'sqrt',
  'abs',
  'exp',
  'log',
  'ln',
  'floor',
  'ceil',
  'round',
  'min',
  'max',
  'pow',
])

const ARITHMETIC_OPERATIONS = new Set<ArithmeticOperation>([
  'addition',
  'subtraction',
  'multiplication',
  'division',
])

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readText(
  value: unknown,
  maxLength = MAX_TEXT_LENGTH,
): string {
  if (typeof value !== 'string') {
    return ''
  }

  return value
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function readSandboxDocument(value: unknown): string {
  if (typeof value !== 'string') {
    return ''
  }

  return value
    .replace(/\u0000/g, '')
    .trim()
    .slice(0, MAX_SANDBOX_DOCUMENT_LENGTH)
}

function readFiniteNumber(
  value: unknown,
  minimum: number,
  maximum: number,
): number | null {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < minimum ||
    value > maximum
  ) {
    return null
  }

  return value
}

function hasBalancedParentheses(
  expression: string,
): boolean {
  let depth = 0

  for (const character of expression) {
    if (character === '(') {
      depth += 1
    } else if (character === ')') {
      depth -= 1
    }

    if (depth < 0) {
      return false
    }
  }

  return depth === 0
}

export function isSafeMathExpression(
  expression: string,
  variables: ReadonlySet<string>,
): boolean {
  if (
    !expression ||
    expression.length > MAX_EXPRESSION_LENGTH ||
    !/^[0-9A-Za-z_+\-*/^().,\s]+$/.test(expression) ||
    !hasBalancedParentheses(expression)
  ) {
    return false
  }

  const identifiers =
    expression.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? []

  const allowedIdentifiers = new Set([
    ...variables,
    ...EXPRESSION_FUNCTIONS,
    'pi',
    'e',
  ])

  return identifiers.every(
    (identifier) =>
      allowedIdentifiers.has(identifier),
  )
}

function readParameters(
  value: unknown,
): DynamicSliderParameter[] | null {
  if (!Array.isArray(value) || value.length > MAX_PARAMETERS) {
    return null
  }

  const parameters: DynamicSliderParameter[] = []
  const ids = new Set<string>()

  for (const item of value) {
    if (!isRecord(item)) {
      return null
    }

    const id = readText(item.id, 24)
    const label = readText(item.label, 40)
    const unit = readText(item.unit, 16)
    const minimum = readFiniteNumber(item.min, -1_000, 1_000)
    const maximum = readFiniteNumber(item.max, -1_000, 1_000)
    const step = readFiniteNumber(item.step, 0.0001, 1_000)
    const defaultValue = readFiniteNumber(
      item.defaultValue,
      -1_000,
      1_000,
    )

    if (
      !/^[a-z][a-z0-9_]{0,23}$/.test(id) ||
      ids.has(id) ||
      !label ||
      minimum === null ||
      maximum === null ||
      step === null ||
      defaultValue === null ||
      minimum >= maximum ||
      step > maximum - minimum ||
      defaultValue < minimum ||
      defaultValue > maximum
    ) {
      return null
    }

    ids.add(id)
    parameters.push({
      id,
      label,
      min: minimum,
      max: maximum,
      step,
      defaultValue,
      unit,
    })
  }

  return parameters
}

function readRenderer(
  value: unknown,
  parameters: readonly DynamicSliderParameter[],
): DynamicRendererSpec | null {
  if (
    !isRecord(value) ||
    typeof value.type !== 'string' ||
    !DYNAMIC_RENDERER_TYPES.includes(
      value.type as DynamicRendererSpec['type'],
    )
  ) {
    return null
  }

  const parameterIds = new Set(
    parameters.map((parameter) => parameter.id),
  )

  if (value.type === 'cartesian-2d') {
    const expression = readText(
      value.expression,
      MAX_EXPRESSION_LENGTH,
    )
    const xMin = readFiniteNumber(value.xMin, -1_000, 1_000)
    const xMax = readFiniteNumber(value.xMax, -1_000, 1_000)
    const yMin = readFiniteNumber(value.yMin, -1_000, 1_000)
    const yMax = readFiniteNumber(value.yMax, -1_000, 1_000)
    const samples = readFiniteNumber(value.samples, 100, 800)

    if (
      xMin === null ||
      xMax === null ||
      yMin === null ||
      yMax === null ||
      samples === null ||
      xMin >= xMax ||
      yMin >= yMax ||
      !isSafeMathExpression(
        expression,
        new Set(['x', ...parameterIds]),
      )
    ) {
      return null
    }

    return {
      type: 'cartesian-2d',
      expression,
      xMin,
      xMax,
      yMin,
      yMax,
      samples: Math.round(samples),
    }
  }

  if (value.type === 'polar-2d') {
    const expression = readText(
      value.expression,
      MAX_EXPRESSION_LENGTH,
    )
    const thetaMin = readFiniteNumber(
      value.thetaMin,
      -100,
      100,
    )
    const thetaMax = readFiniteNumber(
      value.thetaMax,
      -100,
      100,
    )
    const radiusMax = readFiniteNumber(
      value.radiusMax,
      0.1,
      1_000,
    )
    const samples = readFiniteNumber(value.samples, 100, 800)

    if (
      thetaMin === null ||
      thetaMax === null ||
      radiusMax === null ||
      samples === null ||
      thetaMin >= thetaMax ||
      !isSafeMathExpression(
        expression,
        new Set(['theta', ...parameterIds]),
      )
    ) {
      return null
    }

    return {
      type: 'polar-2d',
      expression,
      thetaMin,
      thetaMax,
      radiusMax,
      samples: Math.round(samples),
    }
  }

  if (value.type === 'sandboxed-html') {
    const document = readSandboxDocument(value.document)
    const height = readFiniteNumber(
      value.height,
      320,
      1_000,
    )

    if (!document || height === null) {
      return null
    }

    return {
      type: 'sandboxed-html',
      document,
      height: Math.round(height),
    }
  }

  const operation = value.operation
  const left = readFiniteNumber(value.left, 0, 24)
  const right = readFiniteNumber(value.right, 0, 24)

  if (
    typeof operation !== 'string' ||
    !ARITHMETIC_OPERATIONS.has(
      operation as ArithmeticOperation,
    ) ||
    left === null ||
    right === null ||
    !Number.isInteger(left) ||
    !Number.isInteger(right) ||
    (operation === 'division' && right === 0)
  ) {
    return null
  }

  return {
    type: 'arithmetic-blocks',
    operation: operation as ArithmeticOperation,
    left,
    right,
  }
}

function readSteps(
  value: unknown,
  parameters: readonly DynamicSliderParameter[],
): DynamicExperimentStep[] | null {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.length > MAX_STEPS
  ) {
    return null
  }

  const parametersById = new Map(
    parameters.map((parameter) => [parameter.id, parameter]),
  )

  const steps: DynamicExperimentStep[] = []

  for (const item of value) {
    if (!isRecord(item)) {
      return null
    }

    const title = readText(item.title, 80)
    const description = readText(item.description, 300)
    const rawValues = isRecord(item.parameterValues)
      ? item.parameterValues
      : {}
    const parameterValues: Record<string, number> = {}

    for (const [id, rawValue] of Object.entries(rawValues)) {
      const parameter = parametersById.get(id)

      if (
        !parameter ||
        typeof rawValue !== 'number' ||
        !Number.isFinite(rawValue) ||
        rawValue < parameter.min ||
        rawValue > parameter.max
      ) {
        continue
      }

      parameterValues[id] = rawValue
    }

    if (!title || !description) {
      return null
    }

    steps.push({
      title,
      description,
      parameterValues,
    })
  }

  return steps
}

function readKnowledgePoints(
  value: unknown,
): string[] | null {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.length > MAX_KNOWLEDGE_POINTS
  ) {
    return null
  }

  const points = value
    .map((item) => readText(item, 240))
    .filter(Boolean)

  return points.length === value.length
    ? points
    : null
}

export function parseDynamicExperimentSpec(
  value: unknown,
): DynamicExperimentSpec | null {
  if (!isRecord(value)) {
    return null
  }

  const title = readText(value.title, 80)
  const description = readText(value.description, 240)
  const gradeLevel = readText(value.gradeLevel, 40)
  const formulaLatex = readText(value.formulaLatex, 300)
  const parameters = readParameters(value.parameters)

  if (
    !title ||
    !description ||
    !gradeLevel ||
    !formulaLatex ||
    !parameters
  ) {
    return null
  }

  const renderer = readRenderer(
    value.renderer,
    parameters,
  )
  const steps = readSteps(value.steps, parameters)
  const knowledgePoints = readKnowledgePoints(
    value.knowledgePoints,
  )

  if (!renderer || !steps || !knowledgePoints) {
    return null
  }

  return {
    version: 1,
    title,
    description,
    gradeLevel,
    formulaLatex,
    parameters,
    renderer,
    steps,
    knowledgePoints,
  }
}
