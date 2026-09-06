import { HIGH_MATH_CURRICULUM } from '../course/highMathCurriculum.generated'
import { NATIVE_KNOWLEDGE_DEFINITIONS } from '../demo/knowledge-native/definitions'
import type { ExperimentRegistration, MathModelFamily } from './model'
import {
  createKnowledgeFamilyModel,
  familyForModule,
  type KnowledgeModelConfig,
  type KnowledgeSceneData,
} from './models/knowledgeFamilyModel'
import type { ParameterSpec } from './schema'

const integerLabel = /(项数|阶数|次数|密度|序号|进度|谐波数|分割数)/
const angleLabel = /(角|θ|方向)/i
const positiveLabel = /(误差|距离|尺度|半径|宽度|增量|间距|跨度|衰减|频率|上界|强度|深度)/

function parameterSpec(key: 'primary' | 'secondary', label: string, point: number): ParameterSpec {
  const common = {
    key,
    label,
    unit: angleLabel.test(label) ? 'rad' : integerLabel.test(label) ? '个' : null,
    meaning: `${label}控制当前数学对象的${key === 'primary' ? '主要变化方向' : '参照尺度与条件边界'}`,
    affects: ['formula', 'plot', 'observation', 'condition', 'conclusion'] as const,
  }
  if (integerLabel.test(label)) {
    return { ...common, type: 'integer', min: 2, max: 30, step: 1, initial: 6 + (point % 5) }
  }
  if (angleLabel.test(label)) {
    return { ...common, type: 'continuous', min: 0, max: 6.2, step: 0.1, initial: 1 + (point % 4) * 0.2 }
  }
  if (positiveLabel.test(label)) {
    return { ...common, type: 'continuous', min: 0.1, max: 4, step: 0.1, initial: 1 + (point % 5) * 0.2 }
  }
  return { ...common, type: 'continuous', min: -3, max: 3, step: 0.1, initial: 0.5 + (point % 4) * 0.2 }
}

const titleById = new Map<string, string>(
  HIGH_MATH_CURRICULUM.flatMap((module) => module.points.map((point) => [point.id, point.title] as const)),
)
const models = new Map<MathModelFamily, ReturnType<typeof createKnowledgeFamilyModel>>()

function modelFor(family: MathModelFamily) {
  const current = models.get(family)
  if (current) return current
  const model = createKnowledgeFamilyModel(family)
  models.set(family, model)
  return model
}

export const EXPERIMENT_REGISTRY = Object.fromEntries(
  NATIVE_KNOWLEDGE_DEFINITIONS.map((definition) => {
    const family = familyForModule(definition.module)
    const model = modelFor(family)
    const title = titleById.get(definition.id) ?? definition.id
    const modelConfig: KnowledgeModelConfig = {
      definition,
      title,
      formulaHint: definition.formula,
      primary: parameterSpec('primary', definition.parameter.label, definition.point),
      secondary: parameterSpec('secondary', definition.secondary.label, definition.point + 1),
    }
    const registration: ExperimentRegistration<KnowledgeModelConfig, KnowledgeSceneData> = {
      config: {
        id: definition.id,
        family,
        modelId: model.id,
        title,
        question: `调节变量并判断“${title}”的条件、图像、数值与结论如何同步变化。`,
        mathematicalObject: `${title}：${definition.formula}`,
        modelConfig,
        observationKeys: ['metric', 'valueAtOne', 'localRate'],
        learningGoals: [`理解${title}中的数学对象`, '用实际数值检查成立条件', '通过反例识别结论边界'],
      },
      model,
    }
    return [definition.id, registration]
  }),
) as Record<string, ExperimentRegistration<KnowledgeModelConfig, KnowledgeSceneData>>

export function getExperimentRegistration(id: string) {
  return Object.hasOwn(EXPERIMENT_REGISTRY, id) ? EXPERIMENT_REGISTRY[id] ?? null : null
}
