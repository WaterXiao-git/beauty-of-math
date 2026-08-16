import type { RouteResult } from '../ask/routeTypes'
import {
  isAgentRouteResponse,
  type AgentExperimentCandidate,
  type AgentRouteResponse,
} from './agentRouting'

const DEFAULT_TIMEOUT_MS = 15_000
const DEFAULT_RETRY_DELAYS_MS = [240]

export interface QuestionRouteOutcome {
  route: RouteResult
  attempts: number
}

export interface QuestionRouteRequestOptions {
  fetchImplementation?: typeof fetch
  timeoutMs?: number
  retryDelaysMs?: number[]
}

export class QuestionRouteRequestError extends Error {
  readonly status: number | null
  readonly attempts: number

  constructor(message: string, status: number | null, attempts: number) {
    super(message)
    this.name = 'QuestionRouteRequestError'
    this.status = status
    this.attempts = attempts
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds))
}

async function fetchWithTimeout(
  question: string,
  timeoutMs: number,
  fetchImplementation: typeof fetch,
): Promise<Response> {
  const controller = new AbortController()
  const timeout = globalThis.setTimeout(
    () => controller.abort(new DOMException('路由服务响应超时', 'TimeoutError')),
    timeoutMs,
  )

  try {
    return await fetchImplementation('/api/agent/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
      signal: controller.signal,
    })
  } finally {
    globalThis.clearTimeout(timeout)
  }
}

function mapIntent(intent: string): RouteResult['intent'] {
  if (intent === 'visualize') return 'draw'
  if (intent === 'calculate') return 'calculate'
  if (intent === 'explain') return 'explain'
  if (intent === 'find') return 'find'
  return 'demo'
}

function uniqueCandidates(response: AgentRouteResponse): AgentExperimentCandidate[] {
  const candidates = [
    response.routeDecision.target,
    ...response.routeDecision.alternatives,
    ...response.experiments,
  ].filter((candidate): candidate is AgentExperimentCandidate => candidate !== null)
  const seen = new Set<string>()
  return candidates.filter((candidate) => {
    if (seen.has(candidate.path)) return false
    seen.add(candidate.path)
    return true
  })
}

export function adaptAgentRoute(response: AgentRouteResponse): RouteResult {
  const matches = uniqueCandidates(response).slice(0, 5).map((candidate) => ({
    path: candidate.path,
    title: candidate.title,
    score: candidate.confidence,
    matchedBy: candidate.matchedSignals.join(',') || candidate.matchQuality,
  }))
  const numericParameters = Object.fromEntries(
    Object.entries(response.routeDecision.target?.initialParameters ?? {})
      .filter((entry): entry is [string, number] => typeof entry[1] === 'number'),
  )

  return {
    question: response.question,
    intent: mapIntent(response.intent.primaryIntent),
    branch: response.routeDecision.decision,
    confidence: response.intent.confidence,
    matches,
    params: numericParameters,
    reason: response.routeDecision.message || response.routeDecision.reason,
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  const body = await response.json().catch(() => null)
  return isRecord(body) && typeof body.error === 'string'
    ? body.error
    : `路由服务返回 HTTP ${response.status}`
}

export async function requestQuestionRoute(
  question: string,
  options: QuestionRouteRequestOptions = {},
): Promise<QuestionRouteOutcome> {
  const normalizedQuestion = question.trim()
  if (!normalizedQuestion) {
    throw new QuestionRouteRequestError('请先输入一个数学问题。', 400, 0)
  }

  const fetchImplementation = options.fetchImplementation ?? fetch
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const retryDelaysMs = options.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS
  let latestError: unknown

  for (let attempt = 1; attempt <= retryDelaysMs.length + 1; attempt += 1) {
    try {
      const response = await fetchWithTimeout(
        normalizedQuestion,
        timeoutMs,
        fetchImplementation,
      )

      if (!response.ok) {
        const message = await readErrorMessage(response)
        if (response.status < 500) {
          throw new QuestionRouteRequestError(message, response.status, attempt)
        }
        latestError = new QuestionRouteRequestError(message, response.status, attempt)
      } else {
        const body: unknown = await response.json().catch(() => null)
        if (!isAgentRouteResponse(body)) {
          throw new QuestionRouteRequestError('路由服务返回了无法识别的数据。', response.status, attempt)
        }
        return { route: adaptAgentRoute(body), attempts: attempt }
      }
    } catch (error) {
      if (error instanceof QuestionRouteRequestError && error.status !== null && error.status < 500) {
        throw error
      }
      latestError = error
    }

    const retryDelay = retryDelaysMs[attempt - 1]
    if (retryDelay !== undefined) await delay(retryDelay)
  }

  const message = latestError instanceof Error
    ? latestError.message
    : '路由服务暂时不可用。'
  throw new QuestionRouteRequestError(message, null, retryDelaysMs.length + 1)
}
