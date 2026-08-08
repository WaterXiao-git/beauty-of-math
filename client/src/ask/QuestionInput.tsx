// AI 提问输入区：多模态输入框 + 工具栏 + 推荐问题
import { useRef, useState } from 'react'
import type { Ref } from 'react'

interface QuestionInputProps {
  question: string
  onQuestionChange: (value: string) => void
  onSubmit: () => void
  /** 当前展示的推荐问题 */
  prompts: string[]
  onFillPrompt: (prompt: string) => void
  onShuffle: () => void
  /** 解析中（禁用提交） */
  loading?: boolean
  mode: 'auto' | 'ai'
  onModeChange: (mode: 'auto' | 'ai') => void
  /** textarea ref（供「继续追问」聚焦） */
  ref?: Ref<HTMLTextAreaElement>
}

const MAX_LENGTH = 500

export default function QuestionInput({
  question,
  onQuestionChange,
  onSubmit,
  prompts,
  onFillPrompt,
  onShuffle,
  loading,
  mode,
  onModeChange,
  ref,
}: QuestionInputProps) {
  const uploadRef = useRef<HTMLInputElement>(null)
  const [attachment, setAttachment] = useState('')

  const insertFormulaPrompt = () => {
    const suffix = question.trim().length > 0 ? '\n' : ''
    onQuestionChange(`${question}${suffix}请解释公式：lim(x→x₀) f(x) = A`)
  }

  return (
    <section className="relative shrink-0 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-indigo-50/70 p-5 shadow-sm md:p-7">
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-blue-100/70" />
      <div className="pointer-events-none absolute -right-4 -top-16 h-44 w-44 rounded-full border border-blue-100/60" />
      {/* 大标题 */}
      <h2 className="relative mb-5 flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
        你想学什么？可以直接用自然语言提问
        <span className="inline-flex text-blue-500">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l1.9 5.7L19.6 9l-5.7 1.9L12 16.6l-1.9-5.7L4.4 9l5.7-1.3L12 2zm7 11l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z" />
          </svg>
        </span>
      </h2>

      <div className="relative mb-3 inline-flex rounded-xl border border-blue-100 bg-white/80 p-1" aria-label="提问模式">
        <button
          type="button"
          onClick={() => onModeChange('auto')}
          aria-pressed={mode === 'auto'}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
            mode === 'auto'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
          }`}
        >
          智能推荐
        </button>
        <button
          type="button"
          onClick={() => onModeChange('ai')}
          aria-pressed={mode === 'ai'}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
            mode === 'ai'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
          }`}
        >
          直接问 AI
        </button>
      </div>

      {/* 多模态输入框 */}
      <div className="relative rounded-2xl border border-blue-300 bg-white/95 shadow-[0_10px_40px_rgba(37,99,235,0.05)] transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
        <textarea
          ref={ref}
          rows={3}
          value={question}
          onChange={(e) => onQuestionChange(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') onSubmit()
          }}
          placeholder="例如：什么是函数在一点的极限？为什么要用 ϵ−δ 语言？导数为什么是切线斜率？"
          className="w-full resize-none bg-transparent px-5 pb-3 pt-5 text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 md:text-[15px]"
        />

        {/* 底部工具栏 */}
        <div className="flex flex-wrap items-end justify-between gap-3 px-4 pb-4">
          {/* 多模态操作组 */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={uploadRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => setAttachment(event.target.files?.[0]?.name ?? '')}
            />
            <button type="button" onClick={() => uploadRef.current?.click()} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600" aria-label="上传图片">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
              </svg>
              图片上传
            </button>
            <button type="button" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600" aria-label="语音输入">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8" />
              </svg>
              语音输入
            </button>
            <button type="button" onClick={insertFormulaPrompt} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600" aria-label="公式输入">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 5H8l4 7-4 7h10" />
              </svg>
              公式输入
            </button>
            {attachment && (
              <span className="max-w-36 truncate rounded-lg bg-blue-50 px-2.5 py-2 text-xs text-blue-600" title={attachment}>
                {attachment}
              </span>
            )}
          </div>

          {/* 字数统计 + 提交按钮 */}
          <div className="flex items-center gap-3">
            <span className="text-xs tabular-nums text-slate-400">{question.length}/{MAX_LENGTH}</span>
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading || question.trim().length === 0}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                  </svg>
                  解析中
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                  {mode === 'ai' ? '直接提问' : '智能解析'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 推荐问题 */}
      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        <span className="shrink-0 text-sm font-medium text-slate-600">推荐问题：</span>
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onFillPrompt(prompt)}
            className="rounded-full border border-blue-100 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-blue-600 transition hover:border-blue-300 hover:bg-blue-50"
          >
            {prompt}
          </button>
        ))}
        <button
          type="button"
          onClick={onShuffle}
          className="ml-auto inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
          aria-label="换一换"
          >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
          </svg>
          换一换
        </button>
      </div>
    </section>
  )
}
