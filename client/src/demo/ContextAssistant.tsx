import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

interface Explanation {
  title: string
  summary: string
  keyPoints: string[]
  example: string
  source?: 'deepseek' | 'qwen' | 'local'
  model?: string
}

interface ContextAssistantProps {
  title: string
  breadcrumb: string[]
  onClose: () => void
}

function isExplanation(value: unknown): value is Explanation {
  if (typeof value !== 'object' || value === null) return false
  const result = value as Record<string, unknown>
  return (
    typeof result.title === 'string' &&
    typeof result.summary === 'string' &&
    Array.isArray(result.keyPoints) &&
    result.keyPoints.every((item) => typeof item === 'string') &&
    typeof result.example === 'string'
  )
}

export default function ContextAssistant({
  title,
  breadcrumb,
  onClose,
}: ContextAssistantProps) {
  const [question, setQuestion] = useState(
    () => `请结合当前图像讲解${title}，并说明参数变化代表什么。`,
  )
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [content, setContent] = useState<Explanation | null>(null)
  const [error, setError] = useState('')
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      controllerRef.current?.abort()
    }
  }, [onClose])

  const handleSubmit = async () => {
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || state === 'loading') return

    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    const timeout = window.setTimeout(
      () => controller.abort(new DOMException('AI 助教响应超时', 'TimeoutError')),
      32_000,
    )

    setState('loading')
    setError('')
    setContent(null)

    try {
      const context = breadcrumb.filter(Boolean).join(' › ')
      const response = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `${trimmedQuestion}\n当前演示：${title}\n课程位置：${context}`,
          core: title,
        }),
        signal: controller.signal,
      })

      const body: unknown = await response.json().catch(() => null)
      if (!response.ok) {
        const serverMessage = typeof body === 'object' && body !== null && 'error' in body
          ? String((body as { error: unknown }).error)
          : `HTTP ${response.status}`
        throw new Error(serverMessage)
      }
      if (!isExplanation(body)) throw new Error('AI 助教返回了无法识别的数据。')

      setContent(body)
      setState('ok')
    } catch (requestError) {
      if (controller.signal.aborted && controllerRef.current !== controller) return
      setError(requestError instanceof Error ? requestError.message : String(requestError))
      setState('error')
    } finally {
      window.clearTimeout(timeout)
      if (controllerRef.current === controller) controllerRef.current = null
    }
  }

  const askPath = `/ask?question=${encodeURIComponent(question)}`

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/25 backdrop-blur-[1px]" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label="当前演示 AI 助教">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <div className="text-xs font-semibold text-indigo-600">当前演示 AI 助教</div>
            <h2 className="mt-1 text-lg font-bold text-slate-900">{title}</h2>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{breadcrumb.join(' › ')}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="关闭 AI 助教">×</button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <label className="text-sm font-semibold text-slate-800" htmlFor="context-assistant-question">结合当前图像追问</label>
          <textarea
            id="context-assistant-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={4}
            maxLength={500}
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
          />
          <div className="mt-3 flex items-center gap-3">
            <button type="button" onClick={handleSubmit} disabled={state === 'loading' || !question.trim()} className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
              {state === 'loading' ? '正在结合当前演示分析…' : '发送给 AI 助教'}
            </button>
            <Link to={askPath} className="inline-flex h-10 items-center justify-center rounded-xl border border-indigo-200 px-3 text-xs font-semibold text-indigo-600 hover:bg-indigo-50">完整提问页</Link>
          </div>

          {state === 'idle' && (
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm leading-6 text-slate-600">
              助教会自动携带当前知识点、课程位置和演示标题，无需重复描述上下文。
            </div>
          )}

          {state === 'error' && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              AI 助教暂时未能回答：{error}。你可以重试，或打开完整提问页继续使用规则路由与本地推荐。
            </div>
          )}

          {state === 'ok' && content && (
            <article className="mt-5 space-y-4">
              <div>
                <div className="text-xs font-semibold text-indigo-600">{content.title}</div>
                <p className="mt-2 text-sm leading-7 text-slate-700">{content.summary}</p>
              </div>
              {content.keyPoints.length > 0 && (
                <ul className="space-y-2">
                  {content.keyPoints.map((point) => (
                    <li key={point} className="flex gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                      {point}
                    </li>
                  ))}
                </ul>
              )}
              {content.example && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <div className="text-xs font-semibold text-emerald-700">结合图像的例子</div>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{content.example}</p>
                </div>
              )}
            </article>
          )}
        </div>
      </section>
    </div>
  )
}
