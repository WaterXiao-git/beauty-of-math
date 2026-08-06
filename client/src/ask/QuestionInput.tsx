// AI 提问输入区：多模态输入框 + 工具栏 + 推荐问题
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
  ref,
}: QuestionInputProps) {
  return (
    <section className="bg-gradient-to-b from-blue-50/50 to-white rounded-xl border border-blue-100/60 shadow-sm p-6">
      {/* 大标题 */}
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
        你想学什么？可以直接用自然语言提问
        <span className="inline-flex text-amber-400">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l1.9 5.7L19.6 9l-5.7 1.9L12 16.6l-1.9-5.7L4.4 9l5.7-1.3L12 2zm7 11l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z" />
          </svg>
        </span>
      </h3>

      {/* 多模态输入框 */}
      <div className="bg-white border border-blue-100 rounded-xl transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 focus-within:shadow-lg focus-within:shadow-blue-500/10">
        <textarea
          ref={ref}
          rows={4}
          value={question}
          onChange={(e) => onQuestionChange(e.target.value.slice(0, MAX_LENGTH))}
          placeholder="例如：什么是函数在一点的极限？为什么要用 ϵ−δ 语言？导数为什么是切线斜率？"
          className="w-full p-4 text-sm text-gray-800 placeholder:text-gray-400 bg-transparent outline-none resize-none leading-relaxed"
        />

        {/* 底部工具栏 */}
        <div className="flex items-center justify-between px-4 pb-3 gap-3 flex-wrap">
          {/* 多模态操作组 */}
          <div className="flex items-center gap-2">
            <button type="button" className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors" aria-label="上传图片">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
              </svg>
            </button>
            <button type="button" className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors" aria-label="语音输入">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8" />
              </svg>
            </button>
            <button type="button" className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors" aria-label="公式输入">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h16M4 12h10M4 17h16M14 12v5M18 12v5" />
              </svg>
            </button>
          </div>

          {/* 字数统计 + 提交按钮 */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 tabular-nums">{question.length}/{MAX_LENGTH}</span>
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading || question.trim().length === 0}
              className="inline-flex items-center gap-1.5 px-5 h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
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
                  智能解析
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 推荐问题 */}
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <span className="text-sm text-gray-400 shrink-0">推荐问题：</span>
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onFillPrompt(prompt)}
            className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors"
          >
            {prompt}
          </button>
        ))}
        <button
          type="button"
          onClick={onShuffle}
          className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          aria-label="换一换"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
          </svg>
        </button>
      </div>
    </section>
  )
}