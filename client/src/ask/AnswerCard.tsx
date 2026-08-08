// answer 分支：结构化解释卡片（真实调用 POST /api/answer，双模型生成）
// 三态：加载中 / 成功（标题/摘要/关键点/示例）/ 失败降级（占位文案）
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface Explanation {
  title: string
  summary: string
  keyPoints: string[]
  example: string
  source?: 'deepseek' | 'qwen' | 'local'
  model?: string
}

function explanationSourceLabel(content: Explanation | null): string {
  if (content?.source === 'deepseek') return 'DeepSeek 解释'
  if (content?.source === 'qwen') return '千问解释'
  if (content?.source === 'local') return '本地兜底'
  return 'AI 解释'
}

interface AnswerCardProps {
  question: string
  onRefine: () => void
}

export default function AnswerCard({ question, onRefine }: AnswerCardProps) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [content, setContent] = useState<Explanation | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch('/api/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((j) => Promise.reject(new Error(j.error ?? `HTTP ${r.status}`)))
        return r.json()
      })
      .then((data: Explanation) => {
        if (cancelled) return
        setContent(data)
        setState('ok')
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(String(e))
        setState('error')
      })
    return () => {
      cancelled = true
    }
  }, [question])

  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      {/* 标题区 */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h4 className="text-base font-bold text-gray-900 leading-snug">
          {state === 'ok' && content ? `概念解释：${content.title}` : '概念解释'}
        </h4>
        <span className="shrink-0 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold">
          {explanationSourceLabel(content)}
        </span>
      </div>

      {/* 加载中 */}
      {state === 'loading' && (
        <div className="flex items-center gap-3 py-8 justify-center text-gray-400">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
          </svg>
          <span className="text-sm">AI 正在生成解释…</span>
        </div>
      )}

      {/* 成功：真实内容 */}
      {state === 'ok' && content && (
        <>
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-400 mb-1.5">通俗摘要</div>
            <p className="text-sm text-gray-600 leading-relaxed">{content.summary}</p>
          </div>

          {content.keyPoints.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-400 mb-2">关键知识点</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {content.keyPoints.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-[13px] text-gray-600 leading-relaxed">
                    <svg className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" fill="#eef2ff" stroke="none" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {content.example && (
            <div className="mb-4 px-3.5 py-3 rounded-xl bg-blue-50/60 border border-blue-100">
              <div className="text-xs font-medium text-blue-500 mb-1">数学示例 / 应用场景</div>
              <p className="text-[13px] text-gray-600 leading-relaxed">{content.example}</p>
            </div>
          )}
        </>
      )}

      {/* 失败降级 */}
      {state === 'error' && (
        <div className="mb-4">
          <div className="px-3.5 py-3 rounded-xl bg-amber-50/60 border border-amber-100 text-[13px] text-gray-600 leading-relaxed mb-3">
            AI 解释生成暂不可用（{error}）。请确认后端已配置 LLM API Key（server/.env）。
          </div>
          <div className="text-xs font-medium text-gray-400 mb-1.5">通俗摘要（占位）</div>
          <p className="text-sm text-gray-600 leading-relaxed">
            「{question}」是一个数学概念问题。接入 DeepSeek/Qwen 双模型后将在此生成通俗解释与关键知识点。
          </p>
        </div>
      )}

      {/* 操作 */}
      <div className="flex items-center gap-3">
        <Link
          to="/experiments"
          className="inline-flex items-center justify-center px-4 h-10 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
        >
          浏览全部实验
        </Link>
        <button
          type="button"
          onClick={onRefine}
          className="inline-flex items-center justify-center gap-1.5 px-4 h-10 rounded-lg bg-white text-blue-600 border-2 border-blue-200 text-sm font-semibold hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          调整问题
        </button>
      </div>
    </section>
  )
}
