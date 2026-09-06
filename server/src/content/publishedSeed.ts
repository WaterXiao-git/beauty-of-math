import { createHash } from 'node:crypto'

import {
  HIGH_MATH_COURSE_META,
  HIGH_MATH_CURRICULUM,
} from './highMathCurriculum.generated.js'
import {
  createCourseNavigationChapters,
  createCourseNavigationKnowledgePoints,
} from './courseNavigationSeed.js'

import type {
  ContentCatalogSnapshot,
  Course,
  KnowledgePoint,
  KnowledgePointVersionBundle,
  TeachingStep,
} from './types.js'

const PUBLISHED_AT = '2026-08-30T00:00:00.000Z'
const IMPLEMENTATION_VERSION = 'git:high-math-150-native-experiments'
const TEMPLATE_ID = 'template:native-high-math-knowledge-experiment:1.0.0'

const course: Course = {
  id: HIGH_MATH_COURSE_META.id,
  code: 'higher-mathematics',
  title: HIGH_MATH_COURSE_META.title,
  description: HIGH_MATH_COURSE_META.subtitle,
  status: 'published',
  visibility: 'public',
  sortOrder: 1,
  createdAt: PUBLISHED_AT,
  updatedAt: PUBLISHED_AT,
}

function findPreviousPointTitle(pointId: string): string[] {
  for (const module of HIGH_MATH_CURRICULUM) {
    const index = module.points.findIndex((point) => point.id === pointId)
    if (index >= 0) {
      return index > 0 ? [module.points[index - 1].title] : []
    }
  }
  return []
}

function createSteps(point: KnowledgePoint, versionId: string): TeachingStep[] {
  const definitions = [
    ['observe', '观察对象', `先辨认“${point.title}”实验中的数学对象、坐标和关键标记。`],
    ['configure', '调节参数', '移动参数滑块，比较图像、数值或空间关系如何变化。'],
    ['interact', '比较关系', '开启对照信息，找出保持不变的条件与发生变化的结果。'],
    ['verify', '验证结论', `用观察结果解释“${point.title}”的定义、条件和结论。`],
  ] as const

  return definitions.map(([kind, title, instruction], index) => ({
    id: `step:${point.id}:${index + 1}`,
    knowledgePointVersionId: versionId,
    code: `step-${index + 1}`,
    title,
    kind,
    instruction,
    observationPrompt: instruction,
    highlightObjectIds: ['visual-model'],
    formulaIds: [],
    parameterPatch: {},
    caseIds: [],
    sortOrder: index + 1,
  }))
}

function createBundle(point: KnowledgePoint): KnowledgePointVersionBundle {
  const versionId = point.currentPublishedVersionId as string
  const caseId = `case:${point.id}:default`
  const steps = createSteps(point, versionId)
  const contentHash = createHash('sha256')
    .update(JSON.stringify({ id: point.id, title: point.title, summary: point.summary }))
    .digest('hex')

  return {
    knowledgePoint: point,
    version: {
      id: versionId,
      knowledgePointId: point.id,
      schemaVersion: 1,
      contentVersion: '1.0.0',
      implementationVersion: IMPLEMENTATION_VERSION,
      basedOnVersionId: null,
      status: 'published',
      changeSummary: '按客户确认的高等数学知识点清单建立独立 Native 实验页面。',
      learningObjectives: [
        `理解“${point.title}”的定义、条件与数学含义`,
        `能用实验图像和参数变化解释“${point.title}”`,
      ],
      prerequisites: findPreviousPointTitle(point.id),
      conceptDefinition: point.summary,
      teachingNotes: ['实验采用统一 Native 外壳，参数、画布、侧栏和步骤栏同步。'],
      boundaryNotes: ['实验用于概念理解，具体结论仍需结合教材条件判断。'],
      semanticObjects: [
        {
          id: 'visual-model',
          type: 'interactive-model',
          label: `${point.title}可视模型`,
          description: point.summary,
          valueSource: 'template-runtime',
        },
      ],
      formulas: [],
      acceptanceCriteria: [
        {
          id: `criterion:${point.id}:mathematics`,
          category: 'mathematics',
          severity: 'blocking',
          description: '图像、参数与教学结论必须符合该知识点的数学条件。',
          verification: 'manual',
          ruleId: null,
        },
      ],
      defaultCaseId: caseId,
      contentHash: `sha256:${contentHash}`,
      createdBy: 'system-generation',
      reviewedBy: 'project-team',
      reviewedAt: PUBLISHED_AT,
      publishedBy: 'project-team',
      publishedAt: PUBLISHED_AT,
      createdAt: PUBLISHED_AT,
      updatedAt: PUBLISHED_AT,
    },
    parameters: [
      {
        id: `parameter:${point.id}:value`,
        knowledgePointVersionId: versionId,
        key: 'value',
        label: '实验参数',
        description: '控制当前实验图像或过程的主要参数。',
        valueType: 'number',
        role: 'input',
        defaultValue: 0.5,
        unit: null,
        minimum: 0,
        maximum: 1,
        step: 0.01,
        options: [],
        required: true,
        sortOrder: 1,
      },
    ],
    cases: [
      {
        id: caseId,
        knowledgePointVersionId: versionId,
        code: 'default',
        title: `${point.title}默认案例`,
        kind: 'default',
        description: `用于观察“${point.title}”核心关系的默认案例。`,
        parameterValues: { value: 0.5 },
        expectedObservations: [`观察参数变化如何影响“${point.title}”的可视结果。`],
        sortOrder: 1,
      },
    ],
    steps,
    templateBindings: [
      {
        id: `binding:${point.id}:native`,
        knowledgePointVersionId: versionId,
        templateVersionId: TEMPLATE_ID,
        mode: 'prebuilt',
        isPrimary: true,
        priority: 1,
        defaultCaseId: caseId,
        parameterMappings: { value: 'value' },
        objectMappings: { 'visual-model': 'visual-model' },
        stepMappings: Object.fromEntries(steps.map((step) => [step.id, step.code])),
      },
    ],
    templates: [
      {
        id: TEMPLATE_ID,
        key: 'native-high-math-knowledge-experiment',
        templateVersion: '1.0.0',
        name: '高等数学知识点 Native 实验模板',
        description: '统一承载高等数学知识点的画布、参数侧栏和分步教学。',
        status: 'published',
        renderer: 'react-component',
        implementationRef: 'client/src/demo/knowledge/KnowledgeExperiment.tsx',
        runtimeVersion: '1.0.0',
        capabilities: ['native-v2', 'parameter-control', 'step-player'],
        createdAt: PUBLISHED_AT,
        updatedAt: PUBLISHED_AT,
      },
    ],
  }
}

export interface PublishedContentSeed {
  snapshot: ContentCatalogSnapshot
  bundles: KnowledgePointVersionBundle[]
}

export function createPublishedContentSeed(): PublishedContentSeed {
  const knowledgePoints = createCourseNavigationKnowledgePoints()
  const bundles = knowledgePoints.map(createBundle)

  return {
    snapshot: {
      courses: [course],
      chapters: createCourseNavigationChapters(),
      knowledgePoints,
      versions: bundles.map((bundle) => bundle.version),
    },
    bundles,
  }
}
