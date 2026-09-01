import type {
  PredictionAnswer,
  PredictionJudgement,
  PredictionResponse,
  PredictionSpec,
} from './schema'

export class PredictionValidationError extends Error {
  constructor(reason: string) {
    super(`预测输入：${reason}`)
    this.name = 'PredictionValidationError'
  }
}

function assertMatchingType(spec: PredictionSpec, response: PredictionResponse) {
  if (spec.type !== response.type) {
    throw new PredictionValidationError(`题型应为 ${spec.type}，实际收到 ${response.type}`)
  }
}

function sameSet(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && left.every((value) => right.includes(value))
}

function result(
  correct: boolean,
  expected: PredictionAnswer,
  received: PredictionAnswer,
): PredictionJudgement {
  return {
    correct,
    expected,
    received,
    summary: correct ? '预测正确' : '预测与实际结果不同',
  }
}

export function judgePrediction(
  spec: PredictionSpec,
  response: PredictionResponse,
): PredictionJudgement {
  assertMatchingType(spec, response)

  if (spec.type === 'trend' && response.type === 'trend') {
    return result(spec.answer === response.value, spec.answer, response.value)
  }
  if (spec.type === 'boolean' && response.type === 'boolean') {
    return result(spec.answer === response.value, spec.answer, response.value)
  }
  if (spec.type === 'numeric' && response.type === 'numeric') {
    if (!Number.isFinite(response.value)) {
      throw new PredictionValidationError('数值必须是有限数')
    }
    const absoluteError = Math.abs(response.value - spec.answer)
    const relativeError = spec.answer === 0
      ? Number.POSITIVE_INFINITY
      : absoluteError / Math.abs(spec.answer)
    const absoluteOk = absoluteError <= (spec.absoluteTolerance ?? -1)
    const relativeOk = relativeError <= (spec.relativeTolerance ?? -1)
    return result(absoluteOk || relativeOk, spec.answer, response.value)
  }
  if (spec.type === 'choice' && response.type === 'choice') {
    const expected = Array.isArray(spec.answer) ? spec.answer : [spec.answer]
    const received = Array.isArray(response.value) ? response.value : [response.value]
    const correct = spec.mode === 'order'
      ? expected.length === received.length && expected.every((value, index) => value === received[index])
      : sameSet(expected, received)
    return result(correct, spec.answer, response.value)
  }

  throw new PredictionValidationError('题型与回答不匹配')
}
