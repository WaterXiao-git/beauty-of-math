import type { NativeExperimentDefinition, NativeSceneModule } from '../../demo/knowledge-native/types'
import type {
  ExperimentComputation,
  MathModel,
  MathModelFamily,
} from '../model'
import { sampleCurve, type Point2D } from '../sampling/curve'
import type { ParameterSpec, ParameterValues, PredictionSpec } from '../schema'

export interface KnowledgeSceneData {
  kind: 'cartesian'
  xDomain: readonly [number, number]
  yDomain: readonly [number, number]
  xLabel: string
  yLabel: string
  series: readonly {
    id: string
    label: string
    color: string
    dashed?: boolean
    segments: readonly (readonly Point2D[])[]
  }[]
  markers: readonly { id: string; x: number; y: number; label: string; color: string }[]
  guides: readonly { id: string; x1: number; y1: number; x2: number; y2: number; color: string; dashed?: boolean }[]
  annotations: readonly string[]
}

export interface KnowledgeModelConfig {
  definition: NativeExperimentDefinition
  title: string
  formulaHint: string
  primary: ParameterSpec
  secondary: ParameterSpec
}

const familyByModule: Record<NativeSceneModule, MathModelFamily> = {
  limit: 'limit',
  continuity: 'continuity',
  derivative: 'derivative',
  application: 'theorem-application',
  antiderivative: 'integral',
  integral: 'integral',
  'integral-application': 'integral',
  ode: 'ode',
  space: 'space',
  multivariable: 'multivariable',
  'multiple-integral': 'multiple-integral',
  'field-integral': 'field-integral',
  series: 'series',
}

export function familyForModule(module: NativeSceneModule) {
  return familyByModule[module]
}

function numeric(params: ParameterValues, key: string) {
  const value = params[key]
  if (typeof value !== 'number') throw new Error(`${key} 必须是数值参数`)
  return value
}

function fixed(value: number, digits = 3) {
  return Number(value.toFixed(digits))
}

function modelEquation(family: MathModelFamily, point: number, p: number, q: number) {
  const rate = fixed(0.45 + (point % 5) * 0.15, 2)
  if (family === 'limit') return `f(x)=${fixed(q, 2)}+${fixed(p, 2)}/(1+${rate}|x|)`
  if (family === 'continuity') return `f(x)=${fixed(p, 2)}sin(${rate}x)+${fixed(q, 2)}`
  if (family === 'derivative') return `f(x)=${fixed(0.08 * p, 3)}x³+${fixed(0.15 * q, 3)}x²+${rate}x`
  if (family === 'theorem-application') return `f(x)=${fixed(0.1 * p, 3)}x³−${fixed(0.18 * q, 3)}x²+${rate}x`
  if (family === 'integral') return `f(x)=${fixed(q, 2)}+${fixed(p, 2)}sin(${rate}x)`
  if (family === 'ode') return `y(x)=${fixed(q, 2)}e^(${fixed(0.1 * p, 3)}x)`
  if (family === 'space') return `投影 y=${fixed(p, 2)}cos(${rate}x)+${fixed(q, 2)}sin x`
  if (family === 'multivariable') return `截线 z=${fixed(p, 2)}cos x·e^(−${fixed(0.08 * Math.abs(q), 3)}x²)`
  if (family === 'multiple-integral') return `截面 z=${fixed(q, 2)}+${fixed(0.12 * p, 3)}(9−x²)`
  if (family === 'field-integral') return `路径响应 y=${fixed(p, 2)}sin x+${fixed(q, 2)}cos(${rate}x)`
  return `Sₙ(x)=Σ(k=1…${Math.max(2, Math.round(Math.abs(p)))}) sin(kx)/(k+${fixed(Math.abs(q), 2)})`
}

function evaluator(family: MathModelFamily, point: number, p: number, q: number) {
  const rate = 0.45 + (point % 5) * 0.15
  if (family === 'limit') return (x: number) => q + p / (1 + rate * Math.abs(x))
  if (family === 'continuity') return (x: number) => p * Math.sin(rate * x) + q
  if (family === 'derivative') return (x: number) => 0.08 * p * x ** 3 + 0.15 * q * x ** 2 + rate * x
  if (family === 'theorem-application') return (x: number) => 0.1 * p * x ** 3 - 0.18 * q * x ** 2 + rate * x
  if (family === 'integral') return (x: number) => q + p * Math.sin(rate * x)
  if (family === 'ode') return (x: number) => q * Math.exp(Math.max(-5, Math.min(5, 0.1 * p * x)))
  if (family === 'space') return (x: number) => p * Math.cos(rate * x) + q * Math.sin(x)
  if (family === 'multivariable') return (x: number) => p * Math.cos(x) * Math.exp(-0.08 * Math.abs(q) * x ** 2)
  if (family === 'multiple-integral') return (x: number) => q + 0.12 * p * (9 - x ** 2)
  if (family === 'field-integral') return (x: number) => p * Math.sin(x) + q * Math.cos(rate * x)
  const count = Math.max(2, Math.round(Math.abs(p)))
  return (x: number) => Array.from({ length: count }, (_, index) => {
    const k = index + 1
    return Math.sin(k * x) / (k + Math.abs(q))
  }).reduce((sum, value) => sum + value, 0)
}

function metricFor(family: MathModelFamily, fn: (x: number) => number) {
  if (family === 'integral' || family === 'multiple-integral' || family === 'field-integral') {
    const count = 160
    const width = 4 / count
    return Array.from({ length: count }, (_, index) => fn(-2 + (index + 0.5) * width) * width)
      .reduce((sum, value) => sum + value, 0)
  }
  if (family === 'derivative' || family === 'theorem-application') {
    const h = 0.001
    return (fn(1 + h) - fn(1 - h)) / (2 * h)
  }
  return fn(1)
}

function conditionThreshold(spec: ParameterSpec) {
  if (spec.type === 'continuous' || spec.type === 'integer') {
    return spec.min + (spec.max - spec.min) * 0.2
  }
  return 0
}

function predictionFor(config: KnowledgeModelConfig, params: ParameterValues): PredictionSpec {
  const p = numeric(params, 'primary')
  const q = numeric(params, 'secondary')
  const family = familyForModule(config.definition.module)
  const fn = evaluator(family, config.definition.point, p, q)
  const metric = metricFor(family, fn)
  const mode = config.definition.point % 4
  if (mode === 0) {
    const spec = config.primary
    const step = spec.type === 'continuous' || spec.type === 'integer' ? spec.step : 0.1
    const nextMetric = metricFor(family, evaluator(family, config.definition.point, p + step, q))
    const answer = Math.abs(nextMetric - metric) < 1e-8 ? 'unchanged' : nextMetric > metric ? 'increase' : 'decrease'
    return { id: `${config.definition.id}-prediction`, type: 'trend', prompt: `${config.primary.label}增加一个步长时，关键观测量如何变化？`, answer }
  }
  if (mode === 1) {
    const satisfied = p > conditionThreshold(config.primary) && q > conditionThreshold(config.secondary)
    return { id: `${config.definition.id}-prediction`, type: 'boolean', prompt: '当前参数是否满足本实验的有效条件？', answer: satisfied }
  }
  if (mode === 2) {
    return { id: `${config.definition.id}-prediction`, type: 'numeric', prompt: '预测当前关键观测量（保留两位小数）', answer: fixed(metric, 2), absoluteTolerance: 0.05 }
  }
  return {
    id: `${config.definition.id}-prediction`, type: 'choice', mode: 'single', prompt: '预测当前关键观测量的符号',
    options: [{ value: 'positive', label: '正' }, { value: 'zero', label: '零' }, { value: 'negative', label: '负' }],
    answer: Math.abs(metric) < 1e-8 ? 'zero' : metric > 0 ? 'positive' : 'negative',
  }
}

function compute(config: KnowledgeModelConfig, params: ParameterValues): ExperimentComputation<KnowledgeSceneData> {
  const p = numeric(params, 'primary')
  const q = numeric(params, 'secondary')
  const family = familyForModule(config.definition.module)
  const fn = evaluator(family, config.definition.point, p, q)
  const metric = metricFor(family, fn)
  const h = 0.001
  const slope = (fn(1 + h) - fn(1 - h)) / (2 * h)
  const pThreshold = conditionThreshold(config.primary)
  const qThreshold = conditionThreshold(config.secondary)
  const parameterCondition = p > pThreshold && q > qThreshold
  const finiteCondition = Number.isFinite(metric) && Number.isFinite(slope)
  const conditions = [
    {
      id: 'parameter-domain', label: '参数位于当前数学模型的有效实验区间', satisfied: parameterCondition,
      evidence: `${config.primary.label}=${fixed(p, 3)}（需 > ${fixed(pThreshold, 3)}），${config.secondary.label}=${fixed(q, 3)}（需 > ${fixed(qThreshold, 3)}）`,
      failureReason: parameterCondition ? null : '至少一个参数落入反例区间，原结论的适用条件被破坏。',
    },
    {
      id: 'finite-result', label: '关键观测量为有限实数', satisfied: finiteCondition,
      evidence: `关键量=${fixed(metric, 4)}，局部变化率=${fixed(slope, 4)}`,
      failureReason: finiteCondition ? null : '当前参数导致观测量发散或超出定义域。',
    },
  ]
  const passed = conditions.every(({ satisfied }) => satisfied)
  const mainSegments = sampleCurve({ fn, from: -5, to: 5, count: 260, yMin: -8, yMax: 8, jumpThreshold: 3 })
  const referenceFn = evaluator(family, config.definition.point, pThreshold, qThreshold)
  const scene: KnowledgeSceneData = {
    kind: 'cartesian', xDomain: [-5, 5], yDomain: [-8, 8], xLabel: family === 'series' ? 'x / n' : 'x', yLabel: family === 'space' ? '投影量' : 'y',
    series: [
      { id: 'current', label: '当前数学结果', color: '#2563eb', segments: mainSegments },
      { id: 'boundary', label: '条件边界参照', color: '#94a3b8', dashed: true, segments: sampleCurve({ fn: referenceFn, from: -5, to: 5, count: 180, yMin: -8, yMax: 8, jumpThreshold: 3 }) },
    ],
    markers: [{ id: 'observation', x: 1, y: fn(1), label: `x=1, y=${fixed(fn(1), 3)}`, color: '#f43f5e' }],
    guides: [{ id: 'tangent', x1: 0.25, y1: fn(1) - 0.75 * slope, x2: 1.75, y2: fn(1) + 0.75 * slope, color: '#10b981', dashed: true }],
    annotations: [config.formulaHint, `关键观测量=${fixed(metric, 4)}`],
  }
  const failures = conditions.filter(({ satisfied }) => !satisfied).map(({ failureReason }) => failureReason ?? '条件未满足')
  return {
    formula: { text: `${config.formulaHint}｜当前示例：${modelEquation(family, config.definition.point, p, q)}` },
    scene,
    observations: [
      { key: 'metric', label: family === 'integral' ? '累计量' : '关键观测量', value: fixed(metric, 4), formattedValue: fixed(metric, 4).toString(), meaning: '由当前图像对应的数学函数直接计算' },
      { key: 'valueAtOne', label: 'x=1 时的值', value: fixed(fn(1), 4), formattedValue: fixed(fn(1), 4).toString(), meaning: '红色观测点的纵坐标' },
      { key: 'localRate', label: 'x=1 附近变化率', value: fixed(slope, 4), formattedValue: fixed(slope, 4).toString(), meaning: '由同一函数进行中心差分计算' },
    ],
    conditions,
    verification: { passed, rule: `${config.title}的当前示例必须同时满足参数域和有限性条件`, evidence: conditions.map(({ evidence }) => evidence), failureReasons: failures },
    conclusion: {
      status: passed ? 'confirmed' : 'refuted',
      statement: passed ? `${config.title}的当前示例满足设定条件。` : `${config.title}的当前示例已成为反例。`,
      reason: `参数 (${fixed(p, 3)}, ${fixed(q, 3)}) 给出关键量 ${fixed(metric, 4)}；${passed ? '所有条件均满足' : failures.join('；')}`,
    },
    actualPredictionAnswer: predictionFor(config, params).answer,
    explanation: `图像、公式和数值均由 ${modelEquation(family, config.definition.point, p, q)} 同步计算；关键量为 ${fixed(metric, 4)}。`,
  }
}

export function createKnowledgeFamilyModel(family: MathModelFamily): MathModel<KnowledgeModelConfig, KnowledgeSceneData> {
  return {
    id: `knowledge-${family}`,
    family,
    parameters: (config) => [config.primary, config.secondary],
    buildPrediction: predictionFor,
    counterexamples: (config) => [{
      id: `${config.definition.id}-domain-counterexample`,
      label: '破坏参数有效条件',
      explanation: `把${config.primary.label}移到边界，检查原结论为何不再成立。`,
      parameterOverrides: { primary: config.primary.type === 'continuous' || config.primary.type === 'integer' ? config.primary.min : config.primary.initial },
      expectedFailureConditionIds: ['parameter-domain'],
    }],
    compute: ({ config, params }) => compute(config, params),
  }
}
