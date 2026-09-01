import { sceneFingerprint, textFingerprint } from './fingerprint'
import type { ExperimentComputation, ExperimentRegistration } from './model'
import { normalizeParameterValue } from './parameters'
import { computeExperiment, createInitialParameterValues } from './runtime'
import type { ParameterEffect, ParameterSpec, ParameterValue } from './schema'

function nextValue(spec: ParameterSpec): ParameterValue | undefined {
  if (spec.type === 'boolean') return !spec.initial
  if (spec.type === 'choice') return spec.options.find(({ value }) => value !== spec.initial)?.value
  const upward = spec.initial + spec.step
  if (upward <= spec.max) return upward
  const downward = spec.initial - spec.step
  return downward >= spec.min ? downward : undefined
}

function effectFingerprint(effect: ParameterEffect, result: ExperimentComputation) {
  if (effect === 'formula') return textFingerprint(`${result.formula.text}|${result.formula.latex ?? ''}`)
  if (effect === 'plot') return sceneFingerprint(result.scene)
  if (effect === 'observation') return sceneFingerprint(result.observations)
  if (effect === 'condition') return sceneFingerprint(result.conditions)
  return sceneFingerprint(result.conclusion)
}

function validateSpec(spec: ParameterSpec, errors: string[]) {
  if (!spec.meaning.trim()) errors.push(`${spec.key} 缺少数学含义`)
  if (spec.unit === '') errors.push(`${spec.key} 的单位必须为 null 或非空字符串`)
  if (spec.affects.length === 0) errors.push(`${spec.key} 没有声明影响目标`)
  if (spec.type === 'choice') {
    if (spec.options.length < 2) errors.push(`${spec.key} 至少需要两个选项`)
    if (new Set(spec.options.map(({ value }) => value)).size !== spec.options.length) {
      errors.push(`${spec.key} 存在重复选项`)
    }
  }
  if (spec.type === 'continuous' || spec.type === 'integer') {
    if (!Number.isFinite(spec.min) || !Number.isFinite(spec.max) || spec.min >= spec.max) {
      errors.push(`${spec.key} 的数值范围非法`)
    }
    if (!Number.isFinite(spec.step) || spec.step <= 0) errors.push(`${spec.key} 的步长必须大于 0`)
    if (spec.type === 'integer' && ![spec.min, spec.max, spec.initial, spec.step].every(Number.isInteger)) {
      errors.push(`${spec.key} 必须使用整数边界、初值和整数步长`)
    }
  }
  try {
    normalizeParameterValue(spec, spec.initial)
  } catch (error) {
    errors.push(error instanceof Error ? error.message : `${spec.key} 初值非法`)
  }
}

export function validateExperimentRegistration<Config, SceneData>(
  registration: ExperimentRegistration<Config, SceneData>,
): string[] {
  const { config, model } = registration
  const errors: string[] = []
  if (config.modelId !== model.id) errors.push(`${config.id} 的 modelId 与模型 ID 不一致`)
  if (config.family !== model.family) errors.push(`${config.id} 的 family 与模型类型不一致`)
  if (!config.question.trim()) errors.push(`${config.id} 缺少实验问题`)
  if (!config.mathematicalObject.trim()) errors.push(`${config.id} 缺少数学对象`)

  const specs = model.parameters(config.modelConfig)
  const keys = specs.map(({ key }) => key)
  if (new Set(keys).size !== keys.length) errors.push(`${config.id} 存在重复参数 key`)
  for (const spec of specs) validateSpec(spec, errors)

  let initialResult: ExperimentComputation
  const initialValues = createInitialParameterValues(registration)
  try {
    initialResult = computeExperiment(registration, initialValues)
  } catch (error) {
    errors.push(`${config.id} 初始计算失败：${error instanceof Error ? error.message : String(error)}`)
    return errors
  }

  if (initialResult.conditions.length === 0) errors.push(`${config.id} 缺少成立条件`)
  if (model.counterexamples(config.modelConfig).length === 0) errors.push(`${config.id} 缺少反例`)
  for (const key of config.observationKeys) {
    if (!initialResult.observations.some((observation) => observation.key === key)) {
      errors.push(`${config.id} 缺少观测量 ${key}`)
    }
  }

  for (const spec of specs) {
    const changedValue = nextValue(spec)
    if (changedValue === undefined) {
      errors.push(`${config.id} 的参数 ${spec.key} 没有第二个合法值`)
      continue
    }
    let changedResult: ExperimentComputation
    try {
      changedResult = computeExperiment(registration, { ...initialValues, [spec.key]: changedValue })
    } catch (error) {
      errors.push(`${config.id} 的参数 ${spec.key} 扰动计算失败：${error instanceof Error ? error.message : String(error)}`)
      continue
    }
    for (const effect of spec.affects) {
      if (effectFingerprint(effect, initialResult) === effectFingerprint(effect, changedResult)) {
        errors.push(`${config.id} 的参数 ${spec.key} 未改变声明的 ${effect} 输出`)
      }
    }
  }

  return errors
}
