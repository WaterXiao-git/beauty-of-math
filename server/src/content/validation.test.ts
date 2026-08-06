import assert from 'node:assert/strict'
import test from 'node:test'

import type {
  ContentCatalogSnapshot,
  KnowledgePointVersionBundle,
} from './types.js'

import {
  canTransitionContentVersion,
  hasContentValidationErrors,
  validateContentCatalog,
  validateKnowledgePointVersionBundle,
} from './validation.js'

const NOW = '2026-08-06T00:00:00.000Z'

function createValidBundle():
KnowledgePointVersionBundle {
  return {
    knowledgePoint: {
      id: 'kp-derivative-geometric',
      chapterId: 'chapter-derivative',
      code: 'derivative-geometric',
      title: '导数的几何意义',
      summary: '用割线趋近切线理解导数。',
      aliases: ['割线与切线'],
      tags: ['微积分', '导数'],
      status: 'published',
      visibility: 'public',
      currentPublishedVersionId: 'kpv-derivative-1',
      createdAt: NOW,
      updatedAt: NOW,
    },
    version: {
      id: 'kpv-derivative-1',
      knowledgePointId: 'kp-derivative-geometric',
      schemaVersion: 1,
      contentVersion: '1.0.0',
      implementationVersion: 'git:abc1234',
      basedOnVersionId: null,
      status: 'published',
      changeSummary: '首个审核版本',
      learningObjectives: [
        '理解割线斜率趋近切线斜率',
      ],
      prerequisites: ['函数', '极限'],
      conceptDefinition:
        '导数是函数在一点处的瞬时变化率。',
      teachingNotes: ['首次进入使用审核默认案例。'],
      boundaryNotes: ['h 不能等于 0。'],
      semanticObjects: [
        {
          id: 'point-p',
          type: 'point',
          label: '固定点 P',
          description: '函数在 x0 处的点。',
          valueSource: 'math-engine',
        },
        {
          id: 'secant-line',
          type: 'line',
          label: '割线',
          description: '通过 P、Q 两点的直线。',
          valueSource: 'template-runtime',
        },
      ],
      formulas: [
        {
          id: 'difference-quotient',
          latex:
            '\\frac{f(x_0+h)-f(x_0)}{h}',
          description: '两点差商。',
          valueSource: 'math-engine',
        },
      ],
      acceptanceCriteria: [
        {
          id: 'criterion-slope',
          category: 'mathematics',
          severity: 'blocking',
          description: '割线斜率必须等于两点差商。',
          verification: 'automatic',
          ruleId: 'derivative.secant-slope',
        },
      ],
      defaultCaseId: 'case-quadratic',
      contentHash: 'sha256:example',
      createdBy: 'editor-1',
      reviewedBy: 'reviewer-1',
      reviewedAt: NOW,
      publishedBy: 'publisher-1',
      publishedAt: NOW,
      createdAt: NOW,
      updatedAt: NOW,
    },
    parameters: [
      {
        id: 'parameter-function',
        knowledgePointVersionId:
          'kpv-derivative-1',
        key: 'function',
        label: '函数',
        description: '当前演示函数。',
        valueType: 'enum',
        role: 'input',
        defaultValue: 'quadratic',
        unit: null,
        minimum: null,
        maximum: null,
        step: null,
        options: [
          {
            value: 'quadratic',
            label: 'x²',
          },
          {
            value: 'sine',
            label: 'sin x',
          },
        ],
        required: true,
        sortOrder: 1,
      },
      {
        id: 'parameter-x0',
        knowledgePointVersionId:
          'kpv-derivative-1',
        key: 'x0',
        label: 'x₀',
        description: '固定点横坐标。',
        valueType: 'number',
        role: 'input',
        defaultValue: 1,
        unit: null,
        minimum: -5,
        maximum: 5,
        step: 0.1,
        options: [],
        required: true,
        sortOrder: 2,
      },
      {
        id: 'parameter-h',
        knowledgePointVersionId:
          'kpv-derivative-1',
        key: 'h',
        label: 'h',
        description: '两点横坐标差。',
        valueType: 'number',
        role: 'input',
        defaultValue: 1,
        unit: null,
        minimum: -2,
        maximum: 2,
        step: 0.01,
        options: [],
        required: true,
        sortOrder: 3,
      },
    ],
    cases: [
      {
        id: 'case-quadratic',
        knowledgePointVersionId:
          'kpv-derivative-1',
        code: 'quadratic-default',
        title: '二次函数默认案例',
        kind: 'default',
        description: '观察 x² 在 x=1 处的导数。',
        parameterValues: {
          function: 'quadratic',
          x0: 1,
          h: 1,
        },
        expectedObservations: [
          'h 减小时割线趋近切线。',
        ],
        sortOrder: 1,
      },
    ],
    steps: [
      {
        id: 'step-select-points',
        knowledgePointVersionId:
          'kpv-derivative-1',
        code: 'select-points',
        title: '选取两点',
        kind: 'observe',
        instruction: '观察固定点 P 和移动点 Q。',
        observationPrompt: '两点的横坐标相差多少？',
        highlightObjectIds: ['point-p'],
        formulaIds: ['difference-quotient'],
        parameterPatch: {
          h: 1,
        },
        caseIds: [],
        sortOrder: 1,
      },
      {
        id: 'step-approach-tangent',
        knowledgePointVersionId:
          'kpv-derivative-1',
        code: 'approach-tangent',
        title: '减小 h',
        kind: 'interact',
        instruction: '逐渐减小 h。',
        observationPrompt: '割线发生了什么变化？',
        highlightObjectIds: ['secant-line'],
        formulaIds: ['difference-quotient'],
        parameterPatch: {
          h: 0.1,
        },
        caseIds: ['case-quadratic'],
        sortOrder: 2,
      },
    ],
    templateBindings: [
      {
        id: 'binding-derivative-template',
        knowledgePointVersionId:
          'kpv-derivative-1',
        templateVersionId:
          'template-function-tangent-1',
        mode: 'template-instance',
        isPrimary: true,
        priority: 1,
        defaultCaseId: 'case-quadratic',
        parameterMappings: {
          function: 'functionId',
          x0: 'baseX',
          h: 'offsetX',
        },
        objectMappings: {
          'point-p': 'basePoint',
          'secant-line': 'secantLine',
        },
        stepMappings: {
          'step-select-points': 'selectPoints',
          'step-approach-tangent':
            'approachTangent',
        },
      },
    ],
    templates: [
      {
        id: 'template-function-tangent-1',
        key: 'function-tangent',
        templateVersion: '1.0.0',
        name: '函数割线与切线模板',
        description: '展示割线向切线逼近。',
        status: 'published',
        renderer: 'canvas-2d',
        implementationRef:
          'client/templates/function-tangent',
        runtimeVersion: '1.0.0',
        capabilities: [
          'function-curve',
          'secant-line',
          'tangent-line',
        ],
        createdAt: NOW,
        updatedAt: NOW,
      },
    ],
  }
}

test(
  '完整发布版本通过内容模型校验',
  () => {
    const issues =
      validateKnowledgePointVersionBundle(
        createValidBundle(),
      )

    assert.deepEqual(issues, [])
    assert.equal(
      hasContentValidationErrors(issues),
      false,
    )
  },
)

test(
  '发现默认案例、参数和步骤引用错误',
  () => {
    const bundle = createValidBundle()
    bundle.version.defaultCaseId = 'missing-case'
    bundle.cases[0].parameterValues.h = 5
    bundle.steps[0].highlightObjectIds = [
      'missing-object',
    ]
    bundle.steps[0].formulaIds = [
      'missing-formula',
    ]

    const issues =
      validateKnowledgePointVersionBundle(bundle)
    const codes = new Set(
      issues.map((issue) => issue.code),
    )

    assert.ok(codes.has('missing-default-case'))
    assert.ok(codes.has('invalid-parameter-value'))
    assert.ok(codes.has('unknown-semantic-object'))
    assert.ok(codes.has('unknown-formula'))
    assert.equal(
      hasContentValidationErrors(issues),
      true,
    )
  },
)

test(
  '发布版本必须具有审核发布记录和主模板',
  () => {
    const bundle = createValidBundle()
    bundle.version.reviewedBy = null
    bundle.version.reviewedAt = null
    bundle.version.publishedBy = null
    bundle.version.publishedAt = null
    bundle.version.contentHash = null
    bundle.templateBindings[0].isPrimary = false

    const codes = new Set(
      validateKnowledgePointVersionBundle(bundle)
        .map((issue) => issue.code),
    )

    assert.ok(codes.has('missing-content-hash'))
    assert.ok(codes.has('missing-review-record'))
    assert.ok(codes.has('missing-publish-record'))
    assert.ok(codes.has('missing-primary-binding'))
  },
)

test(
  '目录校验已发布知识点的父级和版本指针',
  () => {
    const bundle = createValidBundle()
    const snapshot: ContentCatalogSnapshot = {
      courses: [
        {
          id: 'course-calculus',
          code: 'calculus',
          title: '微积分',
          description: '微积分课程',
          status: 'draft',
          visibility: 'public',
          sortOrder: 1,
          createdAt: NOW,
          updatedAt: NOW,
        },
      ],
      chapters: [
        {
          id: 'chapter-derivative',
          courseId: 'course-calculus',
          parentChapterId: null,
          code: 'derivative',
          title: '导数',
          description: '导数章节',
          status: 'published',
          sortOrder: 1,
          createdAt: NOW,
          updatedAt: NOW,
        },
      ],
      knowledgePoints: [bundle.knowledgePoint],
      versions: [bundle.version],
    }

    const issues = validateContentCatalog(snapshot)

    assert.ok(
      issues.some(
        (issue) =>
          issue.code === 'unpublished-parent',
      ),
    )

    snapshot.courses[0].status = 'published'
    assert.deepEqual(
      validateContentCatalog(snapshot),
      [],
    )
  },
)

test(
  '版本状态只能按审核发布流程流转',
  () => {
    assert.equal(
      canTransitionContentVersion(
        'draft',
        'in-review',
      ),
      true,
    )
    assert.equal(
      canTransitionContentVersion(
        'draft',
        'published',
      ),
      false,
    )
    assert.equal(
      canTransitionContentVersion(
        'published',
        'archived',
      ),
      true,
    )
    assert.equal(
      canTransitionContentVersion(
        'published',
        'draft',
      ),
      false,
    )
  },
)

test(
  '章节层级必须同课程且不能循环引用',
  () => {
    const bundle = createValidBundle()
    const snapshot: ContentCatalogSnapshot = {
      courses: [
        {
          id: 'course-calculus',
          code: 'calculus',
          title: '微积分',
          description: '微积分课程',
          status: 'published',
          visibility: 'public',
          sortOrder: 1,
          createdAt: NOW,
          updatedAt: NOW,
        },
      ],
      chapters: [
        {
          id: 'chapter-derivative',
          courseId: 'course-calculus',
          parentChapterId: 'section-derivative',
          code: 'derivative',
          title: '导数',
          description: '导数章节',
          status: 'published',
          sortOrder: 1,
          createdAt: NOW,
          updatedAt: NOW,
        },
        {
          id: 'section-derivative',
          courseId: 'course-calculus',
          parentChapterId: 'chapter-derivative',
          code: 'derivative-concept',
          title: '导数的概念',
          description: '导数小节',
          status: 'published',
          sortOrder: 1,
          createdAt: NOW,
          updatedAt: NOW,
        },
      ],
      knowledgePoints: [bundle.knowledgePoint],
      versions: [bundle.version],
    }

    const issues = validateContentCatalog(snapshot)

    assert.ok(
      issues.some(
        (issue) => issue.code === 'chapter-cycle',
      ),
    )
  },
)
