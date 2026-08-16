import type {
  ContentCatalogSnapshot,
  ContentScalar,
  ContentVersionStatus,
  KnowledgePointVersionBundle,
  ParameterDefinition,
} from './types.js'

export type ContentValidationSeverity =
  | 'error'
  | 'warning'

export interface ContentValidationIssue {
  code: string
  path: string
  message: string
  severity: ContentValidationSeverity
}

const SEMANTIC_VERSION_PATTERN =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/

const ALLOWED_VERSION_TRANSITIONS:
  Record<
    ContentVersionStatus,
    readonly ContentVersionStatus[]
  > = {
    draft: ['in-review'],
    'in-review': ['draft', 'approved'],
    approved: ['draft', 'published'],
    published: ['archived'],
    archived: [],
  }

function addIssue(
  issues: ContentValidationIssue[],
  code: string,
  path: string,
  message: string,
  severity: ContentValidationSeverity = 'error',
) {
  issues.push({
    code,
    path,
    message,
    severity,
  })
}

function nonEmpty(value: string): boolean {
  return value.trim().length > 0
}

function addDuplicateIssues(
  issues: ContentValidationIssue[],
  values: readonly string[],
  path: string,
  label: string,
) {
  const seen = new Set<string>()

  for (const value of values) {
    if (seen.has(value)) {
      addIssue(
        issues,
        'duplicate-value',
        path,
        `${label}存在重复值：${value}`,
      )
    }

    seen.add(value)
  }
}

function valueMatchesParameter(
  definition: ParameterDefinition,
  value: ContentScalar,
): string | null {
  if (value === null) {
    return definition.required
      ? '必填参数不能为 null'
      : null
  }

  if (definition.valueType === 'number') {
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value)
    ) {
      return '参数值必须是有限数字'
    }

    if (
      definition.minimum !== null &&
      value < definition.minimum
    ) {
      return `参数值不能小于 ${definition.minimum}`
    }

    if (
      definition.maximum !== null &&
      value > definition.maximum
    ) {
      return `参数值不能大于 ${definition.maximum}`
    }

    return null
  }

  if (definition.valueType === 'boolean') {
    return typeof value === 'boolean'
      ? null
      : '参数值必须是布尔值'
  }

  if (definition.valueType === 'enum') {
    if (typeof value !== 'string') {
      return '枚举参数值必须是字符串'
    }

    const allowedValues = new Set(
      definition.options.map(
        (option) => option.value,
      ),
    )

    return allowedValues.has(value)
      ? null
      : `枚举参数值不在允许范围内：${value}`
  }

  if (typeof value !== 'string') {
    return '参数值必须是字符串'
  }

  if (
    definition.required &&
    value.trim().length === 0
  ) {
    return '必填字符串参数不能为空'
  }

  return null
}

function validateParameterValues(
  issues: ContentValidationIssue[],
  values: Record<string, ContentScalar>,
  parametersByKey:
    ReadonlyMap<string, ParameterDefinition>,
  path: string,
) {
  for (const [key, value] of Object.entries(values)) {
    const definition = parametersByKey.get(key)

    if (!definition) {
      addIssue(
        issues,
        'unknown-parameter',
        `${path}.${key}`,
        `引用了未定义参数：${key}`,
      )
      continue
    }

    const validationMessage =
      valueMatchesParameter(definition, value)

    if (validationMessage) {
      addIssue(
        issues,
        'invalid-parameter-value',
        `${path}.${key}`,
        validationMessage,
      )
    }
  }
}

export function canTransitionContentVersion(
  current: ContentVersionStatus,
  next: ContentVersionStatus,
): boolean {
  return ALLOWED_VERSION_TRANSITIONS[
    current
  ].includes(next)
}

/**
 * 校验目录层关系和已发布版本指针。
 */
export function validateContentCatalog(
  snapshot: ContentCatalogSnapshot,
): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = []

  addDuplicateIssues(
    issues,
    snapshot.courses.map((course) => course.id),
    'courses',
    '课程 ID',
  )
  addDuplicateIssues(
    issues,
    snapshot.courses.map((course) => course.code),
    'courses',
    '课程 code',
  )
  addDuplicateIssues(
    issues,
    snapshot.chapters.map((chapter) => chapter.id),
    'chapters',
    '章节 ID',
  )
  addDuplicateIssues(
    issues,
    snapshot.chapters.map(
      (chapter) =>
        `${chapter.parentChapterId ?? chapter.courseId}:${chapter.code}`,
    ),
    'chapters',
    '同一父级下的章节 code',
  )
  addDuplicateIssues(
    issues,
    snapshot.knowledgePoints.map(
      (knowledgePoint) => knowledgePoint.id,
    ),
    'knowledgePoints',
    '知识点 ID',
  )
  addDuplicateIssues(
    issues,
    snapshot.knowledgePoints.map(
      (knowledgePoint) =>
        `${knowledgePoint.chapterId}:${knowledgePoint.code}`,
    ),
    'knowledgePoints',
    '同一章节下的知识点 code',
  )
  addDuplicateIssues(
    issues,
    snapshot.versions.map((version) => version.id),
    'versions',
    '知识点版本 ID',
  )
  addDuplicateIssues(
    issues,
    snapshot.versions.map(
      (version) =>
        `${version.knowledgePointId}:${version.contentVersion}`,
    ),
    'versions',
    '同一知识点下的内容版本号',
  )

  const coursesById = new Map(
    snapshot.courses.map(
      (course) => [course.id, course],
    ),
  )
  const chaptersById = new Map(
    snapshot.chapters.map(
      (chapter) => [chapter.id, chapter],
    ),
  )
  const versionsById = new Map(
    snapshot.versions.map(
      (version) => [version.id, version],
    ),
  )

  for (const chapter of snapshot.chapters) {
    const course = coursesById.get(chapter.courseId)

    if (!course) {
      addIssue(
        issues,
        'missing-course',
        `chapters.${chapter.id}.courseId`,
        `章节引用的课程不存在：${chapter.courseId}`,
      )
      continue
    }

    if (
      chapter.status === 'published' &&
      course.status !== 'published'
    ) {
      addIssue(
        issues,
        'unpublished-parent',
        `chapters.${chapter.id}.status`,
        '已发布章节的所属课程也必须已发布',
      )
    }

    if (chapter.parentChapterId) {
      const parentChapter = chaptersById.get(
        chapter.parentChapterId,
      )

      if (!parentChapter) {
        addIssue(
          issues,
          'missing-parent-chapter',
          `chapters.${chapter.id}.parentChapterId`,
          `父章节不存在：${chapter.parentChapterId}`,
        )
      } else {
        if (parentChapter.courseId !== chapter.courseId) {
          addIssue(
            issues,
            'cross-course-parent',
            `chapters.${chapter.id}.parentChapterId`,
            '子章节和父章节必须属于同一课程',
          )
        }

        if (
          chapter.status === 'published' &&
          parentChapter.status !== 'published'
        ) {
          addIssue(
            issues,
            'unpublished-parent',
            `chapters.${chapter.id}.status`,
            '已发布小节的父章节也必须已发布',
          )
        }
      }
    }

    const ancestorIds = new Set([chapter.id])
    let ancestor = chapter

    while (ancestor.parentChapterId) {
      if (ancestorIds.has(ancestor.parentChapterId)) {
        addIssue(
          issues,
          'chapter-cycle',
          `chapters.${chapter.id}.parentChapterId`,
          '章节层级不能形成循环引用',
        )
        break
      }

      ancestorIds.add(ancestor.parentChapterId)
      const parent = chaptersById.get(
        ancestor.parentChapterId,
      )

      if (!parent) {
        break
      }

      ancestor = parent
    }
  }

  for (
    const knowledgePoint
    of snapshot.knowledgePoints
  ) {
    const chapter = chaptersById.get(
      knowledgePoint.chapterId,
    )

    if (!chapter) {
      addIssue(
        issues,
        'missing-chapter',
        `knowledgePoints.${knowledgePoint.id}.chapterId`,
        `知识点引用的章节不存在：${knowledgePoint.chapterId}`,
      )
      continue
    }

    if (
      (knowledgePoint.status === 'cataloged' ||
        knowledgePoint.status === 'published') &&
      chapter.status !== 'published'
    ) {
      addIssue(
        issues,
        'unpublished-parent',
        `knowledgePoints.${knowledgePoint.id}.status`,
        '已进入目录或已发布知识点的所属章节也必须已发布',
      )
    }

    if (knowledgePoint.status === 'cataloged') {
      if (knowledgePoint.currentPublishedVersionId) {
        addIssue(
          issues,
          'cataloged-version-pointer',
          `knowledgePoints.${knowledgePoint.id}.currentPublishedVersionId`,
          '仅进入目录的知识点不能指向已发布内容版本',
        )
      }
      continue
    }

    if (knowledgePoint.status !== 'published') {
      continue
    }

    if (!knowledgePoint.currentPublishedVersionId) {
      addIssue(
        issues,
        'missing-published-version',
        `knowledgePoints.${knowledgePoint.id}.currentPublishedVersionId`,
        '已发布知识点必须指向当前发布版本',
      )
      continue
    }

    const publishedVersion = versionsById.get(
      knowledgePoint.currentPublishedVersionId,
    )

    if (
      !publishedVersion ||
      publishedVersion.knowledgePointId !==
        knowledgePoint.id ||
      publishedVersion.status !== 'published'
    ) {
      addIssue(
        issues,
        'invalid-published-version',
        `knowledgePoints.${knowledgePoint.id}.currentPublishedVersionId`,
        '当前发布版本不存在、属于其他知识点或尚未发布',
      )
    }
  }

  return issues
}

/**
 * 校验一个知识点版本聚合是否能够安全进入审核或发布。
 */
export function validateKnowledgePointVersionBundle(
  bundle: KnowledgePointVersionBundle,
): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = []
  const { version } = bundle

  if (
    bundle.knowledgePoint.id !==
    version.knowledgePointId
  ) {
    addIssue(
      issues,
      'knowledge-point-mismatch',
      'version.knowledgePointId',
      '版本不属于当前知识点',
    )
  }

  if (
    !SEMANTIC_VERSION_PATTERN.test(
      version.contentVersion,
    )
  ) {
    addIssue(
      issues,
      'invalid-content-version',
      'version.contentVersion',
      '内容版本必须使用语义化版本格式，例如 1.0.0',
    )
  }

  if (!nonEmpty(version.implementationVersion)) {
    addIssue(
      issues,
      'missing-implementation-version',
      'version.implementationVersion',
      '必须固定实现版本或 Git 提交标识',
    )
  }

  addDuplicateIssues(
    issues,
    bundle.parameters.map((parameter) => parameter.id),
    'parameters',
    '参数 ID',
  )
  addDuplicateIssues(
    issues,
    bundle.parameters.map((parameter) => parameter.key),
    'parameters',
    '参数 key',
  )
  addDuplicateIssues(
    issues,
    bundle.cases.map((teachingCase) => teachingCase.id),
    'cases',
    '案例 ID',
  )
  addDuplicateIssues(
    issues,
    bundle.cases.map((teachingCase) => teachingCase.code),
    'cases',
    '案例 code',
  )
  addDuplicateIssues(
    issues,
    bundle.steps.map((step) => step.id),
    'steps',
    '步骤 ID',
  )
  addDuplicateIssues(
    issues,
    bundle.steps.map((step) => step.code),
    'steps',
    '步骤 code',
  )
  addDuplicateIssues(
    issues,
    bundle.steps.map((step) => String(step.sortOrder)),
    'steps',
    '步骤排序值',
  )
  addDuplicateIssues(
    issues,
    version.semanticObjects.map((object) => object.id),
    'version.semanticObjects',
    '语义对象 ID',
  )
  addDuplicateIssues(
    issues,
    version.formulas.map((formula) => formula.id),
    'version.formulas',
    '公式 ID',
  )

  const parametersByKey = new Map(
    bundle.parameters.map(
      (parameter) => [parameter.key, parameter],
    ),
  )
  const caseIds = new Set(
    bundle.cases.map(
      (teachingCase) => teachingCase.id,
    ),
  )
  const stepIds = new Set(
    bundle.steps.map((step) => step.id),
  )
  const semanticObjectIds = new Set(
    version.semanticObjects.map(
      (object) => object.id,
    ),
  )
  const formulaIds = new Set(
    version.formulas.map(
      (formula) => formula.id,
    ),
  )
  const templatesById = new Map(
    bundle.templates.map(
      (template) => [template.id, template],
    ),
  )

  for (const parameter of bundle.parameters) {
    if (
      parameter.knowledgePointVersionId !==
      version.id
    ) {
      addIssue(
        issues,
        'version-mismatch',
        `parameters.${parameter.id}.knowledgePointVersionId`,
        '参数不属于当前知识点版本',
      )
    }

    if (
      parameter.valueType === 'number' &&
      parameter.minimum !== null &&
      parameter.maximum !== null &&
      parameter.minimum > parameter.maximum
    ) {
      addIssue(
        issues,
        'invalid-number-range',
        `parameters.${parameter.id}`,
        '数字参数的最小值不能大于最大值',
      )
    }

    if (
      parameter.valueType === 'number' &&
      parameter.step !== null &&
      parameter.step <= 0
    ) {
      addIssue(
        issues,
        'invalid-number-step',
        `parameters.${parameter.id}.step`,
        '数字参数步长必须大于 0',
      )
    }

    if (
      parameter.valueType === 'enum' &&
      parameter.options.length === 0
    ) {
      addIssue(
        issues,
        'missing-enum-options',
        `parameters.${parameter.id}.options`,
        '枚举参数必须提供可选项',
      )
    }

    const defaultValueIssue = valueMatchesParameter(
      parameter,
      parameter.defaultValue,
    )

    if (defaultValueIssue) {
      addIssue(
        issues,
        'invalid-default-value',
        `parameters.${parameter.id}.defaultValue`,
        defaultValueIssue,
      )
    }
  }

  const defaultCases = bundle.cases.filter(
    (teachingCase) => teachingCase.kind === 'default',
  )

  if (defaultCases.length !== 1) {
    addIssue(
      issues,
      'invalid-default-case-count',
      'cases',
      '每个知识点版本必须且只能有一个默认案例',
    )
  }

  if (!caseIds.has(version.defaultCaseId)) {
    addIssue(
      issues,
      'missing-default-case',
      'version.defaultCaseId',
      '版本引用的默认案例不存在',
    )
  } else if (
    defaultCases[0]?.id !== version.defaultCaseId
  ) {
    addIssue(
      issues,
      'default-case-kind-mismatch',
      'version.defaultCaseId',
      'defaultCaseId 必须指向 kind=default 的案例',
    )
  }

  for (const teachingCase of bundle.cases) {
    if (
      teachingCase.knowledgePointVersionId !==
      version.id
    ) {
      addIssue(
        issues,
        'version-mismatch',
        `cases.${teachingCase.id}.knowledgePointVersionId`,
        '案例不属于当前知识点版本',
      )
    }

    validateParameterValues(
      issues,
      teachingCase.parameterValues,
      parametersByKey,
      `cases.${teachingCase.id}.parameterValues`,
    )
  }

  for (const step of bundle.steps) {
    if (
      step.knowledgePointVersionId !== version.id
    ) {
      addIssue(
        issues,
        'version-mismatch',
        `steps.${step.id}.knowledgePointVersionId`,
        '步骤不属于当前知识点版本',
      )
    }

    for (const caseId of step.caseIds) {
      if (!caseIds.has(caseId)) {
        addIssue(
          issues,
          'unknown-case',
          `steps.${step.id}.caseIds`,
          `步骤引用了不存在的案例：${caseId}`,
        )
      }
    }

    for (const objectId of step.highlightObjectIds) {
      if (!semanticObjectIds.has(objectId)) {
        addIssue(
          issues,
          'unknown-semantic-object',
          `steps.${step.id}.highlightObjectIds`,
          `步骤引用了不存在的语义对象：${objectId}`,
        )
      }
    }

    for (const formulaId of step.formulaIds) {
      if (!formulaIds.has(formulaId)) {
        addIssue(
          issues,
          'unknown-formula',
          `steps.${step.id}.formulaIds`,
          `步骤引用了不存在的公式：${formulaId}`,
        )
      }
    }

    validateParameterValues(
      issues,
      step.parameterPatch,
      parametersByKey,
      `steps.${step.id}.parameterPatch`,
    )
  }

  const primaryBindings =
    bundle.templateBindings.filter(
      (binding) => binding.isPrimary,
    )

  if (primaryBindings.length > 1) {
    addIssue(
      issues,
      'multiple-primary-bindings',
      'templateBindings',
      '一个知识点版本最多只能有一个主模板绑定',
    )
  }

  for (const binding of bundle.templateBindings) {
    if (
      binding.knowledgePointVersionId !==
      version.id
    ) {
      addIssue(
        issues,
        'version-mismatch',
        `templateBindings.${binding.id}.knowledgePointVersionId`,
        '模板绑定不属于当前知识点版本',
      )
    }

    const template = templatesById.get(
      binding.templateVersionId,
    )

    if (!template) {
      addIssue(
        issues,
        'missing-template-version',
        `templateBindings.${binding.id}.templateVersionId`,
        `模板版本不存在：${binding.templateVersionId}`,
      )
    } else if (template.status !== 'published') {
      addIssue(
        issues,
        'unpublished-template-version',
        `templateBindings.${binding.id}.templateVersionId`,
        '发布内容只能绑定已发布模板版本',
        version.status === 'published'
          ? 'error'
          : 'warning',
      )
    }

    if (!caseIds.has(binding.defaultCaseId)) {
      addIssue(
        issues,
        'unknown-case',
        `templateBindings.${binding.id}.defaultCaseId`,
        '模板绑定引用的默认案例不存在',
      )
    }

    for (
      const [parameterKey, templateKey]
      of Object.entries(binding.parameterMappings)
    ) {
      if (!parametersByKey.has(parameterKey)) {
        addIssue(
          issues,
          'unknown-parameter',
          `templateBindings.${binding.id}.parameterMappings.${parameterKey}`,
          `模板映射引用了不存在的参数：${parameterKey}`,
        )
      }

      if (!nonEmpty(templateKey)) {
        addIssue(
          issues,
          'empty-template-key',
          `templateBindings.${binding.id}.parameterMappings.${parameterKey}`,
          '模板输入 key 不能为空',
        )
      }
    }

    for (
      const [objectId, templateObjectId]
      of Object.entries(binding.objectMappings)
    ) {
      if (!semanticObjectIds.has(objectId)) {
        addIssue(
          issues,
          'unknown-semantic-object',
          `templateBindings.${binding.id}.objectMappings.${objectId}`,
          `模板映射引用了不存在的语义对象：${objectId}`,
        )
      }

      if (!nonEmpty(templateObjectId)) {
        addIssue(
          issues,
          'empty-template-object-id',
          `templateBindings.${binding.id}.objectMappings.${objectId}`,
          '模板对象 ID 不能为空',
        )
      }
    }

    for (
      const [stepId, sceneId]
      of Object.entries(binding.stepMappings)
    ) {
      if (!stepIds.has(stepId)) {
        addIssue(
          issues,
          'unknown-step',
          `templateBindings.${binding.id}.stepMappings.${stepId}`,
          `模板映射引用了不存在的步骤：${stepId}`,
        )
      }

      if (!nonEmpty(sceneId)) {
        addIssue(
          issues,
          'empty-template-scene-id',
          `templateBindings.${binding.id}.stepMappings.${stepId}`,
          '模板场景 ID 不能为空',
        )
      }
    }
  }

  if (version.status === 'published') {
    if (!version.contentHash) {
      addIssue(
        issues,
        'missing-content-hash',
        'version.contentHash',
        '发布版本必须记录内容哈希',
      )
    }

    if (
      !version.reviewedBy ||
      !version.reviewedAt
    ) {
      addIssue(
        issues,
        'missing-review-record',
        'version.reviewedBy',
        '发布版本必须具有审核人和审核时间',
      )
    }

    if (
      !version.publishedBy ||
      !version.publishedAt
    ) {
      addIssue(
        issues,
        'missing-publish-record',
        'version.publishedBy',
        '发布版本必须具有发布人和发布时间',
      )
    }

    if (bundle.steps.length === 0) {
      addIssue(
        issues,
        'missing-teaching-steps',
        'steps',
        '发布版本至少需要一个教学步骤',
      )
    }

    if (version.acceptanceCriteria.length === 0) {
      addIssue(
        issues,
        'missing-acceptance-criteria',
        'version.acceptanceCriteria',
        '发布版本至少需要一条验收规则',
      )
    }

    if (primaryBindings.length !== 1) {
      addIssue(
        issues,
        'missing-primary-binding',
        'templateBindings',
        '发布版本必须且只能有一个主模板绑定',
      )
    }
  }

  return issues
}

export function hasContentValidationErrors(
  issues: readonly ContentValidationIssue[],
): boolean {
  return issues.some(
    (issue) => issue.severity === 'error',
  )
}
