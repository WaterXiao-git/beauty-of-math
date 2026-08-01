import type {
  MathIntent,
} from '../intentClassifier.js'

export type AgentCapability = Exclude<
  MathIntent,
  'unknown'
>

/**
 * 实验通用能力类型。
 *
 * 300 个实验归入少量通用类型，
 * 而不是为每个实验创建独立参数提取器。
 */
export const EXPERIMENT_KINDS = [
  'function-graph',
  'calculus-concept',
  'integral-estimation',
  'geometry',
  'transformation',
  'sequence-series',
  'probability-statistics',
  'linear-algebra',
  'differential-equation',
  'simulation',

  /**
   * 第二轮扩展类型。
   */
  'numerical-method',
  'algebra',
  'number-theory',
  'discrete-math',
  'optimization',
  'signal-processing',
  'dynamical-system',
  'topology',
  'cryptography',

  'concept',
  'custom',
] as const

export type ExperimentKind =
  (typeof EXPERIMENT_KINDS)[number]

/**
 * 参数提取结构类型。
 */
export const PARAMETER_SCHEMA_IDS = [
  'none',
  'function',
  'calculus-limit',
  'integral-estimation',
  'solid-of-revolution',
  'geometry',
  'transformation',
  'sequence-series',
  'probability-distribution',
  'matrix',
  'differential-equation',
  'simulation',

  /**
   * 第二轮扩展参数类型。
   */
  'numerical-method',
  'algebra-equation',
  'number-theory',
  'combinatorics',
  'optimization',
  'signal',
  'dynamical-system',
  'topology',
  'cryptography',

  'custom',
] as const

export type ParameterSchemaId =
  (typeof PARAMETER_SCHEMA_IDS)[number]

/**
 * 从前端实验目录生成的基础信息。
 */
export interface ExperimentCatalogMetadata {
  id: string
  path: string
  title: string
  description: string
  topics: readonly string[]
}

/**
 * Agent 使用的实验配置。
 */
export interface ExperimentAgentMetadata {
  /**
   * 是否允许该实验进入 Agent 匹配器。
   */
  enabled: boolean

  /**
   * 实验所属的通用能力类型。
   */
  kind: ExperimentKind

  /**
   * 用户可能使用的其他名称。
   */
  aliases: readonly string[]

  /**
   * 高可信度完整短语。
   */
  strongPhrases: readonly string[]

  /**
   * 普通辅助关键词。
   */
  keywords: readonly string[]

  /**
   * 实验支持的操作意图。
   */
  capabilities: readonly AgentCapability[]

  /**
   * 参数提取器使用的 Schema。
   */
  parameterSchema: ParameterSchemaId
}

/**
 * 完整实验 Manifest。
 */
export interface ExperimentManifest
  extends ExperimentCatalogMetadata {
  agent: ExperimentAgentMetadata
}