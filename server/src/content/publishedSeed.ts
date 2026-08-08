import { createHash } from 'node:crypto'

import { knowledgePoints as legacyKnowledgePoints } from '../data/knowledge.js'
import {
  createCourseNavigationChapters,
  createCourseNavigationKnowledgePoints,
} from './courseNavigationSeed.js'

import type {
  AcceptanceCriterion,
  ContentCatalogSnapshot,
  Course,
  FormulaDefinition,
  KnowledgePoint,
  KnowledgePointVersion,
  KnowledgePointVersionBundle,
  ParameterDefinition,
  SemanticObjectDefinition,
  TeachingCase,
  TeachingStep,
  TemplateBinding,
  TemplateDefinition,
} from './types.js'

const PUBLISHED_AT = '2026-08-06T00:00:00.000Z'
const IMPLEMENTATION_VERSION =
  'git:frontend-course-demo-2026-08-06'

interface ContentBlueprint {
  configId: string
  prerequisites: string[]
  implementationRef: string
  capabilities: string[]
  semanticObjects: SemanticObjectDefinition[]
  formulas: FormulaDefinition[]
  controls: Array<
    Omit<
      ParameterDefinition,
      'id' | 'knowledgePointVersionId' | 'sortOrder'
    >
  >
}

const blueprints: ContentBlueprint[] = [
  {
    configId: 'epsilon-delta',
    prerequisites: ['函数', '数列极限'],
    implementationRef:
      'client/src/demo/EpsilonDeltaDemo.tsx',
    capabilities: [
      'function-curve',
      'epsilon-band',
      'delta-neighborhood',
      'pan-zoom',
    ],
    semanticObjects: [
      {
        id: 'function-curve',
        type: 'curve',
        label: '函数曲线',
        description: '当前案例对应的函数图像。',
        valueSource: 'math-engine',
      },
      {
        id: 'epsilon-band',
        type: 'region',
        label: 'ε 误差带',
        description: '目标值 L 上下宽度为 ε 的区域。',
        valueSource: 'template-runtime',
      },
      {
        id: 'delta-neighborhood',
        type: 'region',
        label: 'δ 邻域',
        description: '自变量 a 左右宽度为 δ 的邻域。',
        valueSource: 'template-runtime',
      },
    ],
    formulas: [
      {
        id: 'epsilon-delta-definition',
        latex:
          '0<|x-a|<\\delta \\Rightarrow |f(x)-L|<\\varepsilon',
        description: '函数极限的 ε−δ 定义。',
        valueSource: 'content',
      },
    ],
    controls: [
      {
        key: 'epsilon',
        label: 'ε',
        description: '纵向误差带半宽。',
        valueType: 'number',
        role: 'input',
        defaultValue: 0.6,
        unit: null,
        minimum: 0.05,
        maximum: 2,
        step: 0.05,
        options: [],
        required: true,
      },
    ],
  },
  {
    configId: 'derivative',
    prerequisites: ['函数极限', '函数图像'],
    implementationRef:
      'client/src/demo/DerivativeDemo.tsx',
    capabilities: [
      'function-curve',
      'draggable-points',
      'secant-line',
      'tangent-line',
      'pan-zoom',
    ],
    semanticObjects: [
      {
        id: 'point-p',
        type: 'point',
        label: '固定点 P',
        description: '函数在 x₀ 处的固定点。',
        valueSource: 'math-engine',
      },
      {
        id: 'point-q',
        type: 'point',
        label: '移动点 Q',
        description: '函数在 x₀+h 处的移动点。',
        valueSource: 'math-engine',
      },
      {
        id: 'secant-line',
        type: 'line',
        label: '割线',
        description: '通过 P、Q 两点的直线。',
        valueSource: 'template-runtime',
      },
      {
        id: 'tangent-line',
        type: 'line',
        label: '切线',
        description: '函数在 P 点处的切线。',
        valueSource: 'template-runtime',
      },
    ],
    formulas: [
      {
        id: 'difference-quotient',
        latex:
          '\\frac{f(x_0+h)-f(x_0)}{h}',
        description: 'P、Q 两点之间的差商。',
        valueSource: 'math-engine',
      },
      {
        id: 'derivative-limit',
        latex:
          "f'(x_0)=\\lim_{h\\to0}\\frac{f(x_0+h)-f(x_0)}{h}",
        description: '导数的极限定义。',
        valueSource: 'content',
      },
    ],
    controls: [
      {
        key: 'x0',
        label: 'x₀',
        description: '固定点横坐标。',
        valueType: 'number',
        role: 'input',
        defaultValue: 0,
        unit: null,
        minimum: -10,
        maximum: 10,
        step: 0.1,
        options: [],
        required: true,
      },
      {
        key: 'h',
        label: 'h',
        description: 'P、Q 两点横坐标之差；正值从右侧趋近，负值从左侧趋近。',
        valueType: 'number',
        role: 'input',
        defaultValue: 0.8,
        unit: null,
        minimum: -4,
        maximum: 4,
        step: 0.05,
        options: [],
        required: true,
      },
    ],
  },
  {
    configId: 'rolle',
    prerequisites: ['连续函数', '导数'],
    implementationRef:
      'client/src/demo/RolleDemo.tsx',
    capabilities: [
      'function-curve',
      'condition-toggles',
      'stationary-point',
      'pan-zoom',
    ],
    semanticObjects: [
      {
        id: 'function-curve',
        type: 'curve',
        label: '函数曲线',
        description: '闭区间上的函数图像。',
        valueSource: 'math-engine',
      },
      {
        id: 'endpoints',
        type: 'point-pair',
        label: '区间端点',
        description: '满足 f(a)=f(b) 的两个端点。',
        valueSource: 'math-engine',
      },
      {
        id: 'stationary-point',
        type: 'point',
        label: '中值点 ξ',
        description: '导数等于零的区间内点。',
        valueSource: 'template-runtime',
      },
    ],
    formulas: [
      {
        id: 'rolle-conclusion',
        latex:
          "\\exists\\xi\\in(a,b),\\ f'(\\xi)=0",
        description: '罗尔定理结论。',
        valueSource: 'content',
      },
    ],
    controls: [
      {
        key: 'continuous',
        label: '闭区间连续',
        description: '函数是否在闭区间上连续。',
        valueType: 'boolean',
        role: 'input',
        defaultValue: true,
        unit: null,
        minimum: null,
        maximum: null,
        step: null,
        options: [],
        required: true,
      },
      {
        key: 'differentiable',
        label: '开区间可导',
        description: '函数是否在开区间内可导。',
        valueType: 'boolean',
        role: 'input',
        defaultValue: true,
        unit: null,
        minimum: null,
        maximum: null,
        step: null,
        options: [],
        required: true,
      },
      {
        key: 'equalEndpoints',
        label: '端点函数值相等',
        description: '是否满足 f(a)=f(b)。',
        valueType: 'boolean',
        role: 'input',
        defaultValue: true,
        unit: null,
        minimum: null,
        maximum: null,
        step: null,
        options: [],
        required: true,
      },
    ],
  },
]

const course: Course = {
  id: 'higher-mathematics-volume-1',
  code: 'higher-mathematics-1',
  title: '高等数学（上册）',
  description:
    '以函数、极限、导数和微分中值定理为主线的交互式课程。',
  status: 'published',
  visibility: 'public',
  sortOrder: 1,
  createdAt: PUBLISHED_AT,
  updatedAt: PUBLISHED_AT,
}

function createKnowledgePoint(
  blueprint: ContentBlueprint,
): KnowledgePoint {
  const knowledgePoint = createCourseNavigationKnowledgePoints().find(
    (item) => item.id === blueprint.configId,
  )

  if (!knowledgePoint) {
    throw new Error(
      `Missing course navigation knowledge point: ${blueprint.configId}`,
    )
  }

  return knowledgePoint
}

function createAcceptanceCriteria(
  knowledgePointId: string,
): AcceptanceCriterion[] {
  return [
    {
      id: `criterion:${knowledgePointId}:mathematics`,
      category: 'mathematics',
      severity: 'blocking',
      description:
        '公式、图像和数值结果必须与知识点定义一致。',
      verification: 'manual',
      ruleId: null,
    },
    {
      id: `criterion:${knowledgePointId}:interaction`,
      category: 'functionality',
      severity: 'required',
      description:
        '参数变化必须同步更新图像、数值和教学步骤。',
      verification: 'automatic',
      ruleId: `${knowledgePointId}.interaction-sync`,
    },
  ]
}

function createContentHash(
  blueprint: ContentBlueprint,
  config: (typeof legacyKnowledgePoints)[number],
): string {
  const normalizedContent = JSON.stringify({
    id: config.id,
    title: config.title,
    summary: config.summary,
    goals: config.goals,
    defaultCase: config.defaultCase,
    cases: config.cases,
    steps: config.steps,
    conditions: config.conditions ?? [],
    template: config.template,
    semanticObjects: blueprint.semanticObjects,
    formulas: blueprint.formulas,
    controls: blueprint.controls,
    implementationRef: blueprint.implementationRef,
  })

  return `sha256:${createHash('sha256')
    .update(normalizedContent)
    .digest('hex')}`
}

function createBundle(
  blueprint: ContentBlueprint,
): KnowledgePointVersionBundle {
  const config = legacyKnowledgePoints.find(
    (item) => item.id === blueprint.configId,
  )

  if (!config) {
    throw new Error(
      `Missing legacy knowledge config: ${blueprint.configId}`,
    )
  }

  const knowledgePoint = createKnowledgePoint(blueprint)
  const versionId = knowledgePoint.currentPublishedVersionId as string
  const defaultLegacyCase = config.cases.find(
    (item) => item.id === config.defaultCase,
  )

  if (!defaultLegacyCase) {
    throw new Error(
      `Missing default case for knowledge point: ${config.id}`,
    )
  }

  const baseParameters: ParameterDefinition[] = [
    {
      id: `parameter:${config.id}:caseId`,
      knowledgePointVersionId: versionId,
      key: 'caseId',
      label: '教学案例',
      description: '当前使用的审核案例。',
      valueType: 'enum',
      role: 'input',
      defaultValue: config.defaultCase,
      unit: null,
      minimum: null,
      maximum: null,
      step: null,
      options: config.cases.map((item) => ({
        value: item.id,
        label: item.name,
      })),
      required: true,
      sortOrder: 1,
    },
    {
      id: `parameter:${config.id}:expression`,
      knowledgePointVersionId: versionId,
      key: 'expression',
      label: '函数表达式',
      description: '当前案例的 mathjs 函数表达式。',
      valueType: 'expression',
      role: 'input',
      defaultValue: defaultLegacyCase.expr,
      unit: null,
      minimum: null,
      maximum: null,
      step: null,
      options: [],
      required: true,
      sortOrder: 2,
    },
    ...(['domainMin', 'domainMax', 'yMin', 'yMax'] as const)
      .map((key, index): ParameterDefinition => ({
        id: `parameter:${config.id}:${key}`,
        knowledgePointVersionId: versionId,
        key,
        label: key,
        description: '案例定义域或默认视图边界。',
        valueType: 'number',
        role: 'input',
        defaultValue: [
          defaultLegacyCase.domain[0],
          defaultLegacyCase.domain[1],
          defaultLegacyCase.yRange[0],
          defaultLegacyCase.yRange[1],
        ][index],
        unit: null,
        minimum: -1000,
        maximum: 1000,
        step: 0.1,
        options: [],
        required: true,
        sortOrder: index + 3,
      })),
    {
      id: `parameter:${config.id}:anchor`,
      knowledgePointVersionId: versionId,
      key: 'anchor',
      label: '目标点',
      description: '案例中的目标点或中值点。',
      valueType: 'number',
      role: 'input',
      defaultValue: defaultLegacyCase.anchor ?? null,
      unit: null,
      minimum: -1000,
      maximum: 1000,
      step: 0.1,
      options: [],
      required: false,
      sortOrder: 7,
    },
  ]

  const parameters = [
    ...baseParameters,
    ...blueprint.controls.map(
      (control, index): ParameterDefinition => ({
        ...control,
        id: `parameter:${config.id}:${control.key}`,
        knowledgePointVersionId: versionId,
        sortOrder: baseParameters.length + index + 1,
      }),
    ),
  ]

  const cases: TeachingCase[] = config.cases.map(
    (item, index) => ({
      id: `case:${config.id}:${item.id}`,
      knowledgePointVersionId: versionId,
      code: item.id,
      title: item.name,
      kind:
        item.id === config.defaultCase
          ? 'default'
          : 'exploration',
      description: item.desc,
      parameterValues: {
        caseId: item.id,
        expression: item.expr,
        domainMin: item.domain[0],
        domainMax: item.domain[1],
        yMin: item.yRange[0],
        yMax: item.yRange[1],
        anchor: item.anchor ?? null,
      },
      expectedObservations: [item.desc],
      sortOrder: index + 1,
    }),
  )

  const steps: TeachingStep[] = config.steps.map(
    (item, index) => ({
      id: `step:${config.id}:${item.id}`,
      knowledgePointVersionId: versionId,
      code: item.id,
      title: item.title,
      kind:
        index === 0
          ? 'observe'
          : index === config.steps.length - 1
            ? 'verify'
            : 'interact',
      instruction: item.desc,
      observationPrompt: item.desc,
      highlightObjectIds:
        blueprint.semanticObjects.length > 0
          ? [blueprint.semanticObjects[0].id]
          : [],
      formulaIds: blueprint.formulas.map(
        (formula) => formula.id,
      ),
      parameterPatch: {},
      caseIds: [],
      sortOrder: index + 1,
    }),
  )

  const templateId = `template:${config.template}:1.0.0`
  const template: TemplateDefinition = {
    id: templateId,
    key: config.template,
    templateVersion: '1.0.0',
    name: `${config.title}统一演示模板`,
    description: config.summary,
    status: 'published',
    renderer: 'react-component',
    implementationRef: blueprint.implementationRef,
    runtimeVersion: '1.0.0',
    capabilities: blueprint.capabilities,
    createdAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
  }

  const binding: TemplateBinding = {
    id: `binding:${config.id}:${config.template}`,
    knowledgePointVersionId: versionId,
    templateVersionId: templateId,
    mode: 'prebuilt',
    isPrimary: true,
    priority: 1,
    defaultCaseId:
      `case:${config.id}:${config.defaultCase}`,
    parameterMappings: Object.fromEntries(
      parameters.map((parameter) => [
        parameter.key,
        parameter.key,
      ]),
    ),
    objectMappings: Object.fromEntries(
      blueprint.semanticObjects.map((item) => [
        item.id,
        item.id,
      ]),
    ),
    stepMappings: Object.fromEntries(
      steps.map((step) => [step.id, step.code]),
    ),
  }

  const version: KnowledgePointVersion = {
    id: versionId,
    knowledgePointId: knowledgePoint.id,
    schemaVersion: 1,
    contentVersion: '1.0.0',
    implementationVersion: IMPLEMENTATION_VERSION,
    basedOnVersionId: null,
    status: 'published',
    changeSummary: '从统一知识点演示配置迁移的首个发布版本。',
    learningObjectives: config.goals,
    prerequisites: blueprint.prerequisites,
    conceptDefinition: config.summary,
    teachingNotes: [
      '首次进入必须使用审核后的默认案例。',
      '参数、图像、公式与步骤需要同步更新。',
    ],
    boundaryNotes: [
      '案例切换后必须重置为该案例的审核参数。',
      '表达式、定义域和采样结果必须通过运行时校验。',
    ],
    semanticObjects: blueprint.semanticObjects,
    formulas: blueprint.formulas,
    acceptanceCriteria:
      createAcceptanceCriteria(knowledgePoint.id),
    defaultCaseId:
      `case:${config.id}:${config.defaultCase}`,
    contentHash: createContentHash(blueprint, config),
    createdBy: 'system-migration',
    reviewedBy: 'project-team',
    reviewedAt: PUBLISHED_AT,
    publishedBy: 'project-team',
    publishedAt: PUBLISHED_AT,
    createdAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
  }

  return {
    knowledgePoint,
    version,
    parameters,
    cases,
    steps,
    templateBindings: [binding],
    templates: [template],
  }
}

export interface PublishedContentSeed {
  snapshot: ContentCatalogSnapshot
  bundles: KnowledgePointVersionBundle[]
}

export function createPublishedContentSeed(): PublishedContentSeed {
  const bundles = blueprints.map(createBundle)
  const knowledgePoints = createCourseNavigationKnowledgePoints()

  return {
    snapshot: {
      courses: [course],
      chapters: createCourseNavigationChapters(),
      knowledgePoints,
      versions: bundles.map(
        (bundle) => bundle.version,
      ),
    },
    bundles,
  }
}
