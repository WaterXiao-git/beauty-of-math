import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'

import {
  collectRouteCandidates,
  getDirectRoutePath,
  requestAgentRoute,
  type AgentExperimentCandidate,
  type AgentRouteDecision,
  type AgentRouteResponse,
} from '../../services/agentRouting'

const EXAMPLE_QUESTIONS = [
  '动态演示黎曼和的逼近过程',
  '打开偏微分方程实验',
  '用有限个点补出一条连续曲线',
]

const RESULT_PRESENTATION: Record<
  AgentRouteDecision,
  {
    label: string
    title: string
    containerClassName: string
    badgeClassName: string
  }
> = {
  direct: {
    label: '直接进入',
    title: '已找到明确实验',
    containerClassName:
      'border-emerald-200 bg-emerald-50/80',
    badgeClassName:
      'bg-emerald-100 text-emerald-700',
  },
  suggest: {
    label: '实验建议',
    title: '找到可能适合的实验',
    containerClassName:
      'border-indigo-200 bg-indigo-50/80',
    badgeClassName:
      'bg-indigo-100 text-indigo-700',
  },
  ai: {
    label: '需要确认',
    title: '这个问题还需要进一步判断',
    containerClassName:
      'border-amber-200 bg-amber-50/80',
    badgeClassName:
      'bg-amber-100 text-amber-700',
  },
  'no-match': {
    label: '暂无匹配',
    title: '没有找到合适的预设实验',
    containerClassName:
      'border-slate-200 bg-slate-50/90',
    badgeClassName:
      'bg-slate-200 text-slate-700',
  },
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.name === 'AbortError'
  )
}

function CandidateButton({
  candidate,
  isPrimary,
  onSelect,
}: {
  candidate: AgentExperimentCandidate
  isPrimary: boolean
  onSelect: (path: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(candidate.path)}
      className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
        isPrimary
          ? 'border-indigo-200 bg-white shadow-sm'
          : 'border-slate-200 bg-white/70'
      }`}
    >
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg ${
          isPrimary
            ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
            : 'bg-slate-100 text-slate-600'
        }`}
      >
        ∑
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold text-slate-800">
          {candidate.title}
        </div>
        <div className="mt-0.5 text-xs text-slate-500">
          {isPrimary
            ? candidate.matchQuality === 'related'
              ? '相近实验推荐'
              : '最匹配的实验'
            : '备选实验'}
        </div>
      </div>
      <svg
        className="h-5 w-5 flex-shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  )
}

export default function AgentExperimentRouter() {
  const navigate = useNavigate()
  const abortControllerRef =
    useRef<AbortController | null>(null)

  const [question, setQuestion] = useState('')
  const [result, setResult] =
    useState<AgentRouteResponse | null>(null)
  const [isLoading, setIsLoading] =
    useState(false)
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  useEffect(
    () => () => {
      abortControllerRef.current?.abort()
    },
    [],
  )

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const normalizedQuestion = question.trim()

    if (!normalizedQuestion) {
      setErrorMessage('请先描述你想探索的数学问题。')
      return
    }

    abortControllerRef.current?.abort()

    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsLoading(true)
    setErrorMessage(null)
    setResult(null)

    try {
      const routeResult = await requestAgentRoute(
        normalizedQuestion,
        controller.signal,
      )

      const directPath =
        getDirectRoutePath(routeResult)

      if (directPath) {
        navigate(directPath, {
          state: {
            source: 'agent-route',
            question: normalizedQuestion,
          },
        })
        return
      }

      if (
        routeResult.routeDecision.decision ===
          'direct'
      ) {
        setErrorMessage(
          '已经识别到实验，但返回结果缺少页面路径。',
        )
        return
      }

      setResult(routeResult)
    } catch (error) {
      if (!isAbortError(error)) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : '实验匹配失败，请稍后重试。',
        )
      }
    } finally {
      if (
        abortControllerRef.current === controller
      ) {
        abortControllerRef.current = null
        setIsLoading(false)
      }
    }
  }

  const handleQuestionChange = (
    value: string,
  ) => {
    setQuestion(value)
    setResult(null)
    setErrorMessage(null)
  }

  const candidates = result
    ? collectRouteCandidates(result)
    : []

  const presentation = result
    ? RESULT_PRESENTATION[
        result.routeDecision.decision
      ]
    : null

  return (
    <section
      className="relative mb-6 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/70 to-purple-50/80 p-4 shadow-lg shadow-indigo-100/50 md:mb-10 md:p-6"
      aria-labelledby="agent-router-title"
    >
      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-purple-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-12 h-48 w-48 rounded-full bg-indigo-300/20 blur-3xl" />

      <div className="relative">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl text-white shadow-lg shadow-indigo-500/25">
            ✦
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="agent-router-title"
                className="text-lg font-bold text-slate-800 md:text-xl"
              >
                智能实验导航
              </h2>
              <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-indigo-600 ring-1 ring-indigo-100">
                规则路由 MVP
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              用一句话描述想观察、理解或计算的内容，优先匹配现有数学实验。
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <label className="sr-only" htmlFor="agent-question">
            输入数学问题
          </label>
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z"
              />
            </svg>
            <input
              id="agent-question"
              type="text"
              value={question}
              onChange={(event) =>
                handleQuestionChange(
                  event.target.value,
                )
              }
              placeholder="例如：动态演示黎曼和的逼近过程"
              autoComplete="off"
              className="w-full rounded-xl border border-indigo-100 bg-white/90 py-3.5 pl-12 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 md:text-base"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                正在匹配
              </>
            ) : (
              <>
                找实验
                <span aria-hidden="true">→</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">
            可以试试：
          </span>
          {EXAMPLE_QUESTIONS.map(
            (exampleQuestion) => (
              <button
                key={exampleQuestion}
                type="button"
                onClick={() =>
                  handleQuestionChange(
                    exampleQuestion,
                  )
                }
                className="rounded-full bg-white/70 px-3 py-1.5 text-xs text-slate-600 ring-1 ring-slate-200 transition-colors hover:bg-white hover:text-indigo-600 hover:ring-indigo-200"
              >
                {exampleQuestion}
              </button>
            ),
          )}
        </div>

        <div aria-live="polite">
          {errorMessage && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          )}

          {result && presentation && (
            <div
              className={`mt-4 rounded-xl border p-4 ${presentation.containerClassName}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${presentation.badgeClassName}`}
                >
                  {presentation.label}
                </span>
                <h3 className="font-semibold text-slate-800">
                  {presentation.title}
                </h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {result.routeDecision.message}
              </p>

              {result.routeDecision.decision ===
                'ai' && (
                <p className="mt-2 text-xs leading-relaxed text-amber-700">
                  当前尚未接入大模型。你可以先选择候选实验，或换一种更明确的问法。
                </p>
              )}

              {candidates.length > 0 && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {candidates.map(
                    (candidate, index) => (
                      <CandidateButton
                        key={candidate.path}
                        candidate={candidate}
                        isPrimary={index === 0}
                        onSelect={(path) =>
                          navigate(path, {
                            state: {
                              source:
                                'agent-suggestion',
                              question,
                            },
                          })
                        }
                      />
                    ),
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
