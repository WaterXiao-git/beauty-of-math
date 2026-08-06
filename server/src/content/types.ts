export const CONTENT_SCHEMA_VERSION = 1 as const

export const CATALOG_PUBLICATION_STATUSES = [
  'draft',
  'published',
  'archived',
] as const

export type CatalogPublicationStatus =
  (typeof CATALOG_PUBLICATION_STATUSES)[number]

export const CONTENT_VISIBILITIES = [
  'public',
  'restricted',
  'private',
] as const

export type ContentVisibility =
  (typeof CONTENT_VISIBILITIES)[number]

export const CONTENT_VERSION_STATUSES = [
  'draft',
  'in-review',
  'approved',
  'published',
  'archived',
] as const

export type ContentVersionStatus =
  (typeof CONTENT_VERSION_STATUSES)[number]

export const TEACHING_CASE_KINDS = [
  'default',
  'exploration',
  'boundary',
  'counterexample',
  'summary',
] as const

export type TeachingCaseKind =
  (typeof TEACHING_CASE_KINDS)[number]

export const TEACHING_STEP_KINDS = [
  'observe',
  'configure',
  'interact',
  'verify',
  'summarize',
] as const

export type TeachingStepKind =
  (typeof TEACHING_STEP_KINDS)[number]

export const PARAMETER_VALUE_TYPES = [
  'number',
  'boolean',
  'enum',
  'expression',
  'text',
] as const

export type ParameterValueType =
  (typeof PARAMETER_VALUE_TYPES)[number]

export const PARAMETER_ROLES = [
  'input',
  'computed',
  'display',
] as const

export type ParameterRole =
  (typeof PARAMETER_ROLES)[number]

export const TEMPLATE_BINDING_MODES = [
  'prebuilt',
  'template-instance',
  'constrained-generation',
] as const

export type TemplateBindingMode =
  (typeof TEMPLATE_BINDING_MODES)[number]

export const TEMPLATE_RENDERERS = [
  'react-component',
  'plotly-2d',
  'canvas-2d',
  'svg',
  'webgl-3d',
] as const

export type TemplateRenderer =
  (typeof TEMPLATE_RENDERERS)[number]

export const ACCEPTANCE_CATEGORIES = [
  'mathematics',
  'functionality',
  'teaching',
  'performance',
  'maintainability',
] as const

export type AcceptanceCategory =
  (typeof ACCEPTANCE_CATEGORIES)[number]

export const ACCEPTANCE_SEVERITIES = [
  'blocking',
  'required',
  'recommended',
] as const

export type AcceptanceSeverity =
  (typeof ACCEPTANCE_SEVERITIES)[number]

export type ContentScalar =
  | string
  | number
  | boolean
  | null

export type ParameterValues =
  Record<string, ContentScalar>

export interface TimestampedEntity {
  createdAt: string
  updatedAt: string
}

/**
 * 课程和章节只承载目录关系，不直接存放教学实现。
 */
export interface Course extends TimestampedEntity {
  id: string
  code: string
  title: string
  description: string
  status: CatalogPublicationStatus
  visibility: ContentVisibility
  sortOrder: number
}

export interface Chapter extends TimestampedEntity {
  id: string
  courseId: string
  /**
   * null 表示教材章节；非 null 表示章节下的小节。
   * 这样可以覆盖新版前端“章节—小节—知识点”的三级目录。
   */
  parentChapterId: string | null
  code: string
  title: string
  description: string
  status: CatalogPublicationStatus
  sortOrder: number
}

/**
 * 知识点是稳定身份；可变的教学内容全部进入版本实体。
 */
export interface KnowledgePoint
  extends TimestampedEntity {
  id: string
  chapterId: string
  code: string
  title: string
  summary: string
  aliases: string[]
  tags: string[]
  status: CatalogPublicationStatus
  visibility: ContentVisibility
  currentPublishedVersionId: string | null
}

export interface SemanticObjectDefinition {
  id: string
  type: string
  label: string
  description: string
  valueSource:
    | 'math-engine'
    | 'template-runtime'
    | 'content'
}

export interface FormulaDefinition {
  id: string
  latex: string
  description: string
  valueSource:
    | 'math-engine'
    | 'template-runtime'
    | 'content'
}

export interface AcceptanceCriterion {
  id: string
  category: AcceptanceCategory
  severity: AcceptanceSeverity
  description: string
  verification: 'automatic' | 'manual'
  ruleId: string | null
}

/**
 * 发布版本是稳定复现单元。published 后不再原位修改，
 * 后续变更必须创建新的 draft 版本。
 */
export interface KnowledgePointVersion
  extends TimestampedEntity {
  id: string
  knowledgePointId: string
  schemaVersion: typeof CONTENT_SCHEMA_VERSION
  contentVersion: string
  implementationVersion: string
  basedOnVersionId: string | null
  status: ContentVersionStatus
  changeSummary: string
  learningObjectives: string[]
  prerequisites: string[]
  conceptDefinition: string
  teachingNotes: string[]
  boundaryNotes: string[]
  semanticObjects: SemanticObjectDefinition[]
  formulas: FormulaDefinition[]
  acceptanceCriteria: AcceptanceCriterion[]
  defaultCaseId: string
  contentHash: string | null
  createdBy: string
  reviewedBy: string | null
  reviewedAt: string | null
  publishedBy: string | null
  publishedAt: string | null
}

export interface ParameterOption {
  value: string
  label: string
}

export interface ParameterDefinition {
  id: string
  knowledgePointVersionId: string
  key: string
  label: string
  description: string
  valueType: ParameterValueType
  role: ParameterRole
  defaultValue: ContentScalar
  unit: string | null
  minimum: number | null
  maximum: number | null
  step: number | null
  options: ParameterOption[]
  required: boolean
  sortOrder: number
}

export interface TeachingCase {
  id: string
  knowledgePointVersionId: string
  code: string
  title: string
  kind: TeachingCaseKind
  description: string
  parameterValues: ParameterValues
  expectedObservations: string[]
  sortOrder: number
}

export interface TeachingStep {
  id: string
  knowledgePointVersionId: string
  code: string
  title: string
  kind: TeachingStepKind
  instruction: string
  observationPrompt: string
  highlightObjectIds: string[]
  formulaIds: string[]
  parameterPatch: ParameterValues

  /**
   * 空数组表示适用于所有案例。
   */
  caseIds: string[]
  sortOrder: number
}

/**
 * 模板版本独立于知识点内容版本发布，绑定必须固定到具体版本。
 */
export interface TemplateDefinition
  extends TimestampedEntity {
  id: string
  key: string
  templateVersion: string
  name: string
  description: string
  status: CatalogPublicationStatus
  renderer: TemplateRenderer
  implementationRef: string
  runtimeVersion: string
  capabilities: string[]
}

export interface TemplateBinding {
  id: string
  knowledgePointVersionId: string
  templateVersionId: string
  mode: TemplateBindingMode
  isPrimary: boolean
  priority: number
  defaultCaseId: string

  /**
   * key 为知识点参数 key，value 为模板输入 key。
   */
  parameterMappings: Record<string, string>

  /**
   * key 为知识点语义对象 ID，value 为模板对象 ID。
   */
  objectMappings: Record<string, string>

  /**
   * key 为教学步骤 ID，value 为模板场景 ID。
   */
  stepMappings: Record<string, string>
}

export interface ContentCatalogSnapshot {
  courses: Course[]
  chapters: Chapter[]
  knowledgePoints: KnowledgePoint[]
  versions: KnowledgePointVersion[]
}

/**
 * 编辑、审核、发布和运行时读取的最小聚合根。
 */
export interface KnowledgePointVersionBundle {
  knowledgePoint: KnowledgePoint
  version: KnowledgePointVersion
  parameters: ParameterDefinition[]
  cases: TeachingCase[]
  steps: TeachingStep[]
  templateBindings: TemplateBinding[]
  templates: TemplateDefinition[]
}
