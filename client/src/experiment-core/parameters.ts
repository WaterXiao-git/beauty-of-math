import type {
  ParameterSpec,
  ParameterValue,
  ParameterValues,
} from './schema'

export class ParameterValidationError extends Error {
  readonly key: string

  constructor(key: string, reason: string) {
    super(`参数 ${key}：${reason}`)
    this.name = 'ParameterValidationError'
    this.key = key
  }
}

function normalizeNumericValue(
  spec: Extract<ParameterSpec, { type: 'continuous' | 'integer' }>,
  value: ParameterValue,
) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ParameterValidationError(spec.key, '必须是有限数值')
  }
  if (spec.type === 'integer' && !Number.isInteger(value)) {
    throw new ParameterValidationError(spec.key, '必须是整数')
  }
  if (value < spec.min || value > spec.max) {
    throw new ParameterValidationError(spec.key, `必须位于 ${spec.min} 到 ${spec.max} 之间`)
  }

  const steps = (value - spec.min) / spec.step
  const nearestStep = Math.round(steps)
  if (Math.abs(steps - nearestStep) > 1e-8) {
    throw new ParameterValidationError(spec.key, `必须按步长 ${spec.step} 取值`)
  }

  const normalized = spec.min + nearestStep * spec.step
  return Number(normalized.toPrecision(12))
}

export function normalizeParameterValue(spec: ParameterSpec, value: ParameterValue) {
  if (spec.type === 'continuous' || spec.type === 'integer') {
    return normalizeNumericValue(spec, value)
  }
  if (spec.type === 'choice') {
    if (typeof value !== 'string' || !spec.options.some((option) => option.value === value)) {
      throw new ParameterValidationError(spec.key, '必须选择已定义的选项')
    }
    return value
  }
  if (typeof value !== 'boolean') {
    throw new ParameterValidationError(spec.key, '必须是布尔值')
  }
  return value
}

export function normalizeParameterValues(
  specs: readonly ParameterSpec[],
  input: Readonly<Record<string, ParameterValue>>,
): ParameterValues {
  const normalized: Record<string, ParameterValue> = {}
  for (const spec of specs) {
    if (!(spec.key in input)) {
      throw new ParameterValidationError(spec.key, '缺少参数值')
    }
    normalized[spec.key] = normalizeParameterValue(spec, input[spec.key] as ParameterValue)
  }
  return normalized
}
