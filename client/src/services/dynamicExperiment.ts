import {
  DYNAMIC_RENDERER_TYPES,
  type DynamicExperimentResponse,
  type DynamicExperimentSpec,
} from '../types/dynamicExperiment'

const STORAGE_KEY = 'mathviz:dynamic-experiment-preview'

export class DynamicExperimentRequestError
extends Error {
  readonly status: number | null

  constructor(
    message: string,
    status: number | null = null,
  ) {
    super(message)
    this.name = 'DynamicExperimentRequestError'
    this.status = status
  }
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

const SAFE_EXPRESSION_IDENTIFIERS = new Set([
  'x',
  'theta',
  'pi',
  'e',
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

function isSafeExpression(
  expression: unknown,
  parameterIds: ReadonlySet<string>,
): expression is string {
  if (
    typeof expression !== 'string' ||
    !expression ||
    expression.length > 180 ||
    !/^[0-9A-Za-z_+\-*/^().,\s]+$/.test(expression)
  ) {
    return false
  }

  const identifiers =
    expression.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? []

  return identifiers.every(
    (identifier) =>
      SAFE_EXPRESSION_IDENTIFIERS.has(identifier) ||
      parameterIds.has(identifier),
  )
}

function isRenderer(
  value: unknown,
  parameterIds: ReadonlySet<string>,
): boolean {
  if (
    !isRecord(value) ||
    typeof value.type !== 'string' ||
    !DYNAMIC_RENDERER_TYPES.includes(
      value.type as DynamicExperimentSpec['renderer']['type'],
    )
  ) {
    return false
  }

  if (value.type === 'cartesian-2d') {
    return (
      isSafeExpression(value.expression, parameterIds) &&
      isFiniteNumber(value.xMin) &&
      isFiniteNumber(value.xMax) &&
      isFiniteNumber(value.yMin) &&
      isFiniteNumber(value.yMax) &&
      isFiniteNumber(value.samples) &&
      value.xMin < value.xMax &&
      value.yMin < value.yMax
    )
  }

  if (value.type === 'polar-2d') {
    return (
      isSafeExpression(value.expression, parameterIds) &&
      isFiniteNumber(value.thetaMin) &&
      isFiniteNumber(value.thetaMax) &&
      isFiniteNumber(value.radiusMax) &&
      isFiniteNumber(value.samples) &&
      value.thetaMin < value.thetaMax &&
      value.radiusMax > 0
    )
  }

  if (value.type === 'sandboxed-html') {
    return (
      typeof value.document === 'string' &&
      value.document.trim().length > 0 &&
      value.document.length <= 50_000 &&
      isFiniteNumber(value.height) &&
      value.height >= 320 &&
      value.height <= 1_000
    )
  }

  return (
    typeof value.operation === 'string' &&
    [
      'addition',
      'subtraction',
      'multiplication',
      'division',
    ].includes(value.operation) &&
    isFiniteNumber(value.left) &&
    isFiniteNumber(value.right) &&
    Number.isInteger(value.left) &&
    Number.isInteger(value.right) &&
    value.left >= 0 &&
    value.left <= 24 &&
    value.right >= 0 &&
    value.right <= 24 &&
    !(value.operation === 'division' && value.right === 0)
  )
}

export function isDynamicExperimentSpec(
  value: unknown,
): value is DynamicExperimentSpec {
  if (!isRecord(value)) {
    return false
  }

  const renderer = value.renderer
  const parameters = value.parameters

  if (!Array.isArray(parameters)) {
    return false
  }

  const parametersAreValid = parameters.every(
    (parameter) =>
      isRecord(parameter) &&
      typeof parameter.id === 'string' &&
      /^[a-z][a-z0-9_]{0,23}$/.test(parameter.id) &&
      typeof parameter.label === 'string' &&
      isFiniteNumber(parameter.min) &&
      isFiniteNumber(parameter.max) &&
      isFiniteNumber(parameter.step) &&
      isFiniteNumber(parameter.defaultValue) &&
      parameter.min < parameter.max &&
      parameter.defaultValue >= parameter.min &&
      parameter.defaultValue <= parameter.max &&
      typeof parameter.unit === 'string',
  )

  const parameterIds = new Set(
    parameters
      .filter(isRecord)
      .map((parameter) => parameter.id)
      .filter(
        (id): id is string => typeof id === 'string',
      ),
  )

  return (
    value.version === 1 &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    typeof value.gradeLevel === 'string' &&
    typeof value.formulaLatex === 'string' &&
    parametersAreValid &&
    parameterIds.size === parameters.length &&
    isRenderer(renderer, parameterIds) &&
    Array.isArray(value.steps) &&
    value.steps.every(
      (step) =>
        isRecord(step) &&
        typeof step.title === 'string' &&
        typeof step.description === 'string' &&
        isRecord(step.parameterValues) &&
        Object.entries(step.parameterValues).every(
          ([id, stepValue]) =>
            parameterIds.has(id) &&
            isFiniteNumber(stepValue),
        ),
    ) &&
    Array.isArray(value.knowledgePoints) &&
    value.knowledgePoints.every(
      (point) => typeof point === 'string',
    )
  )
}

function isDynamicExperimentResponse(
  value: unknown,
): value is DynamicExperimentResponse {
  if (!isRecord(value) || !isRecord(value.generation)) {
    return false
  }

  return (
    typeof value.question === 'string' &&
    isDynamicExperimentSpec(value.spec) &&
    Array.isArray(value.generation.models) &&
    value.generation.models.every(
      (model) => typeof model === 'string',
    ) &&
    typeof value.generation.reviewed === 'boolean' &&
    typeof value.generation.fallback === 'boolean' &&
    value.generation.temporary === true
  )
}

async function readResponseBody(
  response: Response,
): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function requestDynamicExperiment(
  question: string,
  signal?: AbortSignal,
  fetchImplementation: typeof fetch = fetch,
): Promise<DynamicExperimentResponse> {
  const normalizedQuestion = question.trim()

  if (!normalizedQuestion) {
    throw new DynamicExperimentRequestError(
      '请先描述需要生成的数学实验。',
    )
  }

  const response = await fetchImplementation(
    '/api/agent/generate',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: normalizedQuestion,
      }),
      signal,
    },
  )

  const body = await readResponseBody(response)

  if (!response.ok) {
    const message =
      isRecord(body) &&
      typeof body.error === 'string'
        ? body.error
        : '动态实验生成失败，请稍后重试。'

    throw new DynamicExperimentRequestError(
      message,
      response.status,
    )
  }

  if (!isDynamicExperimentResponse(body)) {
    throw new DynamicExperimentRequestError(
      '动态实验服务返回了无法识别的数据。',
      response.status,
    )
  }

  return body
}

export function saveDynamicExperimentPreview(
  response: DynamicExperimentResponse,
): void {
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(response),
  )
}

export function loadDynamicExperimentPreview():
  DynamicExperimentResponse | null {
  const serialized = sessionStorage.getItem(STORAGE_KEY)

  if (!serialized) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(serialized)

    return isDynamicExperimentResponse(parsed)
      ? parsed
      : null
  } catch {
    return null
  }
}
