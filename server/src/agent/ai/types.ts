import type {
  QuestionRouteResult,
} from '../questionRouter.js'

export const AGENT_AI_ACTIONS = [
  'accept',
  'suggest',
  'clarify',
  'no-match',
  'request-tool',
] as const

export type AgentAIAction =
  (typeof AGENT_AI_ACTIONS)[number]

export const AGENT_TOOL_NAMES = [
  'search-experiments',
  'create-experiment',
] as const

export type AgentToolName =
  (typeof AGENT_TOOL_NAMES)[number]

/**
 * 模型只能提出工具请求，不能直接执行工具。
 * create-experiment 始终需要人工批准。
 */
export interface AgentToolRequest {
  name: AgentToolName
  input: Record<string, unknown>
}
export interface AgentAIProposal {
  action: AgentAIAction
  candidateIds: string[]
  rewrittenQuery: string | null
  confidence: number
  reason: string
  clarifyingQuestion: string | null
  toolRequest: AgentToolRequest | null
}

export interface AgentModelRequest {
  systemPrompt: string
  userPrompt: string
  maxTokens?: number
}

export interface AgentModelProvider {
  readonly provider: 'deepseek' | 'qwen'
  readonly model: string
  completeJSON(
    request: AgentModelRequest,
  ): Promise<unknown>
}

export const AGENT_AI_STATUSES = [
  'skipped',
  'disabled',
  'enhanced',
  'fallback',
  'failed',
] as const

export type AgentAIStatus =
  (typeof AGENT_AI_STATUSES)[number]

export interface AgentAIRouteMetadata {
  attempted: boolean
  status: AgentAIStatus
  models: string[]
  reviewed: boolean
  message: string
  toolRequest: AgentToolRequest | null
}

export interface AgentEnhancedRouteResult
  extends QuestionRouteResult {
  ai: AgentAIRouteMetadata
}
