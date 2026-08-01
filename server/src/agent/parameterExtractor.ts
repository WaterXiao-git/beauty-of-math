export type ExperimentParameterValue =
  | string
  | number
  | boolean

export type ExperimentInitialParameters =
  Record<string, ExperimentParameterValue>

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(maximum, Math.max(minimum, value))
}

function readNamedNumber(
  question: string,
  name: string,
): number | null {
  const match = question.match(
    new RegExp(
      `(?:^|[^a-z])${name}\\s*(?:=|:|：|为)?\\s*(-?\\d+(?:\\.\\d+)?)`,
      'i',
    ),
  )

  if (!match?.[1]) {
    return null
  }

  const parsed = Number(match[1])

  return Number.isFinite(parsed)
    ? parsed
    : null
}

const OPERATION_BY_SYMBOL = {
  '+': 'addition',
  '-': 'subtraction',
  '−': 'subtraction',
  '*': 'multiplication',
  '×': 'multiplication',
  'x': 'multiplication',
  '/': 'division',
  '÷': 'division',
} as const

const OPERATION_BY_PHRASE = [
  {
    pattern: /减去|减法|相减|减/,
    operation: 'subtraction',
  },
  {
    pattern: /乘以|乘法|相乘|乘/,
    operation: 'multiplication',
  },
  {
    pattern: /除以|除法|相除|除/,
    operation: 'division',
  },
  {
    pattern: /加上|加法|相加|加/,
    operation: 'addition',
  },
] as const

function extractArithmeticParameters(
  question: string,
): ExperimentInitialParameters {
  const symbolicExpression = question.match(
    /(-?\d+(?:\.\d+)?)\s*([+\-−*×x/÷])\s*(-?\d+(?:\.\d+)?)/i,
  )

  const verbalExpression = question.match(
    /(-?\d+(?:\.\d+)?)\s*(加上|加|减去|减|乘以|乘|除以|除)\s*(-?\d+(?:\.\d+)?)/,
  )

  const expression = symbolicExpression ?? verbalExpression
  const phraseOperation = OPERATION_BY_PHRASE.find(
    ({ pattern }) => pattern.test(question),
  )?.operation

  let operation:
    | 'addition'
    | 'subtraction'
    | 'multiplication'
    | 'division'
    | undefined = phraseOperation

  if (symbolicExpression?.[2]) {
    operation = OPERATION_BY_SYMBOL[
      symbolicExpression[2].toLowerCase() as
        keyof typeof OPERATION_BY_SYMBOL
    ]
  }

  if (verbalExpression?.[2]) {
    operation = OPERATION_BY_PHRASE.find(
      ({ pattern }) =>
        pattern.test(verbalExpression[2]!),
    )?.operation
  }

  const values = expression
    ? [Number(expression[1]), Number(expression[3])]
    : (
        question.match(/-?\d+(?:\.\d+)?/g) ?? []
      ).slice(0, 2).map(Number)

  const parameters: ExperimentInitialParameters = {}

  if (operation) {
    parameters.operation = operation
  }

  if (
    values.length >= 2 &&
    values.every(Number.isFinite)
  ) {
    parameters.num1 = Math.round(
      clamp(values[0]!, 0, 24),
    )
    parameters.num2 = Math.round(
      clamp(values[1]!, 0, 24),
    )
  }

  if (/方块|积木/.test(question)) {
    parameters.showBlocks = true
  }

  return parameters
}

function extractConicParameters(
  question: string,
): ExperimentInitialParameters {
  const parameters: ExperimentInitialParameters = {}

  if (/双曲线/.test(question)) {
    parameters.conicType = 'hyperbola'
  } else if (/抛物线/.test(question)) {
    parameters.conicType = 'parabola'
  } else if (/椭圆/.test(question)) {
    parameters.conicType = 'ellipse'
  }

  const a = readNamedNumber(question, 'a')
  const b = readNamedNumber(question, 'b')
  const p = readNamedNumber(question, 'p')

  if (a !== null) {
    parameters.a = clamp(a, 1, 8)
  }

  if (b !== null) {
    parameters.b = clamp(b, 1, 8)
  }

  if (p !== null) {
    parameters.p = clamp(p, 0.5, 5)
  }

  if (/焦点/.test(question)) {
    parameters.showFoci = true
  }

  if (/准线/.test(question)) {
    parameters.showDirectrix = true
  }

  if (/渐近线/.test(question)) {
    parameters.showAsymptotes = true
  }

  if (/动点|轨迹点/.test(question)) {
    parameters.showPoint = true
  }

  if (/动画|动态|运动|变化/.test(question)) {
    parameters.autoPlay = true
  }

  return parameters
}

export function extractExperimentInitialParameters(
  question: string,
  experimentId: string,
): ExperimentInitialParameters {
  if (experimentId === 'basic-arithmetic') {
    return extractArithmeticParameters(question)
  }

  if (experimentId === 'conic-sections') {
    return extractConicParameters(question)
  }

  return {}
}
