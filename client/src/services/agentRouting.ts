export const AGENT_ROUTE_DECISIONS = [
  'direct',
  'suggest',
  'ai',
  'no-match',
] as const

export type AgentRouteDecision =
  (typeof AGENT_ROUTE_DECISIONS)[number]

export interface AgentExperimentCandidate {
  id: string
  path: string
  title: string
  score: number
  confidence: number
  matchedSignals: string[]
  intentSupported: boolean
  matchQuality: 'exact' | 'strong' | 'related'
  initialParameters: Record<
    string,
    string | number | boolean
  >
}

export interface AgentQuestionAnalysis {
  originalText: string
  normalizedText: string
  knowledgeText: string
  knowledgeTerms: string[]
  removedPhrases: string[]
}

export interface AgentIntentResult {
  primaryIntent: string
  confidence: number
  needsAI: boolean
}

export interface AgentRouteDecisionResult {
  decision: AgentRouteDecision
  reason: string
  message: string
  target: AgentExperimentCandidate | null
  alternatives: AgentExperimentCandidate[]
  scoreGap: number
}

export interface AgentToolRequest {
  name: 'search-experiments' | 'create-experiment'
  input: Record<string, unknown>
}

export interface AgentAIRouteMetadata {
  attempted: boolean
  status:
    | 'skipped'
    | 'disabled'
    | 'enhanced'
    | 'fallback'
    | 'failed'
  models: string[]
  reviewed: boolean
  message: string
  toolRequest: AgentToolRequest | null
}

export interface AgentRouteResponse {
  question: string
  analysis: AgentQuestionAnalysis
  intent: AgentIntentResult
  experiments: AgentExperimentCandidate[]
  routeDecision: AgentRouteDecisionResult
  ai: AgentAIRouteMetadata
}

export class AgentRouteRequestError
  extends Error {
  readonly status: number | null

  constructor(
    message: string,
    status: number | null = null,
  ) {
    super(message)
    this.name = 'AgentRouteRequestError'
    this.status = status
  }
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null
  )
}

function isExperimentCandidate(
  value: unknown,
): value is AgentExperimentCandidate {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.path === 'string' &&
    typeof value.title === 'string' &&
    typeof value.score === 'number' &&
    typeof value.confidence === 'number' &&
    Array.isArray(value.matchedSignals) &&
    value.matchedSignals.every(
      (signal) =>
        typeof signal === 'string',
    ) &&
    typeof value.intentSupported === 'boolean' &&
    typeof value.matchQuality === 'string' &&
    [
      'exact',
      'strong',
      'related',
    ].includes(value.matchQuality) &&
    isRecord(value.initialParameters) &&
    Object.values(value.initialParameters).every(
      (parameterValue) =>
        typeof parameterValue === 'string' ||
        typeof parameterValue === 'number' ||
        typeof parameterValue === 'boolean',
    )
  )
}

function isQuestionAnalysis(
  value: unknown,
): value is AgentQuestionAnalysis {
  return (
    isRecord(value) &&
    typeof value.originalText === 'string' &&
    typeof value.normalizedText === 'string' &&
    typeof value.knowledgeText === 'string' &&
    Array.isArray(value.knowledgeTerms) &&
    value.knowledgeTerms.every(
      (term) => typeof term === 'string',
    ) &&
    Array.isArray(value.removedPhrases) &&
    value.removedPhrases.every(
      (phrase) => typeof phrase === 'string',
    )
  )
}

function isAgentRouteResponse(
  value: unknown,
): value is AgentRouteResponse {
  if (!isRecord(value)) {
    return false
  }

  const intent = value.intent
  const routeDecision = value.routeDecision
  const ai = value.ai

  return (
    typeof value.question === 'string' &&
    isQuestionAnalysis(value.analysis) &&
    isRecord(intent) &&
    typeof intent.primaryIntent === 'string' &&
    typeof intent.confidence === 'number' &&
    typeof intent.needsAI === 'boolean' &&
    Array.isArray(value.experiments) &&
    value.experiments.every(
      isExperimentCandidate,
    ) &&
    isRecord(routeDecision) &&
    typeof routeDecision.decision ===
      'string' &&
    AGENT_ROUTE_DECISIONS.includes(
      routeDecision.decision as AgentRouteDecision,
    ) &&
    typeof routeDecision.reason === 'string' &&
    typeof routeDecision.message === 'string' &&
    (
      routeDecision.target === null ||
      isExperimentCandidate(
        routeDecision.target,
      )
    ) &&
    Array.isArray(routeDecision.alternatives) &&
    routeDecision.alternatives.every(
      isExperimentCandidate,
    ) &&
    typeof routeDecision.scoreGap === 'number'
    &&
    isRecord(ai) &&
    typeof ai.attempted === 'boolean' &&
    typeof ai.status === 'string' &&
    [
      'skipped',
      'disabled',
      'enhanced',
      'fallback',
      'failed',
    ].includes(ai.status) &&
    Array.isArray(ai.models) &&
    ai.models.every(
      (model) => typeof model === 'string',
    ) &&
    typeof ai.reviewed === 'boolean' &&
    typeof ai.message === 'string' &&
    (
      ai.toolRequest === null ||
      (
        isRecord(ai.toolRequest) &&
        typeof ai.toolRequest.name === 'string' &&
        [
          'search-experiments',
          'create-experiment',
        ].includes(ai.toolRequest.name) &&
        isRecord(ai.toolRequest.input)
      )
    )
  )
}

async function readResponseBody(
  response: Response,
): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function requestAgentRoute(
  question: string,
  signal?: AbortSignal,
  fetchImplementation: typeof fetch = fetch,
): Promise<AgentRouteResponse> {
  const normalizedQuestion = question.trim()

  if (!normalizedQuestion) {
    throw new AgentRouteRequestError(
      '请先输入一个数学问题。',
    )
  }

  const response = await fetchImplementation(
    '/api/agent/route',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: normalizedQuestion,
      }),
      signal,
    },
  )

  const body = await readResponseBody(response)

  if (!response.ok) {
    const serverMessage =
      isRecord(body) &&
      typeof body.error === 'string'
        ? body.error
        : '实验匹配服务暂时不可用，请稍后重试。'

    throw new AgentRouteRequestError(
      serverMessage,
      response.status,
    )
  }

  if (!isAgentRouteResponse(body)) {
    throw new AgentRouteRequestError(
      '实验匹配服务返回了无法识别的数据。',
      response.status,
    )
  }

  return body
}

export function getDirectRoutePath(
  response: AgentRouteResponse,
): string | null {
  if (
    response.routeDecision.decision !==
      'direct'
  ) {
    return null
  }

  return (
    response.routeDecision.target?.path ??
    null
  )
}

export function collectRouteCandidates(
  response: AgentRouteResponse,
): AgentExperimentCandidate[] {
  const candidates = [
    response.routeDecision.target,
    ...response.routeDecision.alternatives,
  ].filter(
    (
      candidate,
    ): candidate is AgentExperimentCandidate =>
      candidate !== null,
  )

  const seenPaths = new Set<string>()

  return candidates.filter((candidate) => {
    if (seenPaths.has(candidate.path)) {
      return false
    }

    seenPaths.add(candidate.path)
    return true
  })
}
