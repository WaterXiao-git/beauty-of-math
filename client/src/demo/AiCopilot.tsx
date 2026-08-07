// AI 数学助教侧边栏（AI Copilot Sidebar）：右侧悬浮/可收起抽屉
// 结构：头部(星光+标题+关闭) / 当前上下文卡(可收起) / 对话消息列表(用户+AI 气泡,支持公式渲染,底部工具栏) / 底部输入区
import { useState } from 'react'
import MathFormula from '../components/MathFormula/MathFormula'

/** 当前上下文数据（由宿主演示页提供） */
export interface AiCopilotContext {
  pointTitle: string
  /** 当前公式（上下文卡展示） */
  formula: string
  /** 当前项标签，如 a₁₀ */
  currentLabel: string
  currentValue: string
  /** 极限/目标值标签 */
  limitLabel: string
  limitValue: string
}

interface AiBlock {
  type: 'text' | 'formula'
  content: string
}

interface AiMessage {
  role: 'user' | 'ai'
  time: string
  text?: string
  blocks?: AiBlock[]
}

const now = () => new Date().toTimeString().slice(0, 5)

/** 空状态快捷提问 */
const SUGGESTIONS = [
  '这个演示的核心概念是什么？',
  '拖动点或参数时应该观察什么？',
  '能给我一个具体的数学例子吗？',
]


const ICON_COPY = (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)
const ICON_UP = (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
)
const ICON_DOWN = (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 14V2M9.93 18.12l.94-4.12H5a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 7.26 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3.07-3.88Z" />
  </svg>
)

export default function AiCopilot({ open, onClose, context }: AiCopilotProps & { onClose: () => void }) {
  const [contextOpen, setContextOpen] = useState(true)
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<Record<number, 'up' | 'down' | null>>({})
  const [loading, setLoading] = useState(false)

  // 真实问答：/api/answer（DeepSeek 主 + Qwen 备，双模型）
  const send = async (text?: string) => {
    const q = (text ?? input).trim()
    if (!q || loading) return
    setMessages((m) => [...m, { role: 'user', time: now(), text: q }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, core: context.pointTitle }),
      })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const data = await res.json()
      const blocks: AiBlock[] = []
      if (data.summary) blocks.push({ type: 'text', content: data.summary })
      if (Array.isArray(data.keyPoints) && data.keyPoints.length > 0) {
        blocks.push({ type: 'text', content: data.keyPoints.map((k: string) => '· ' + k).join('\n') })
      }
      if (data.example) blocks.push({ type: 'text', content: '示例：' + data.example })
      if (blocks.length === 0) blocks.push({ type: 'text', content: '抱歉，暂时没有生成有效回答，请换个问法再试。' })
      setMessages((m) => [...m, { role: 'ai', time: now(), blocks }])
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: 'ai', time: now(), blocks: [{ type: 'text', content: 'AI 服务暂时不可用（' + String(e) + '），请稍后再试。' }] },
      ])
    } finally {
      setLoading(false)
    }
  }

  const copyText = (m: AiMessage) => {
    const txt = m.text ?? m.blocks?.map((b) => b.content).join(' ') ?? ''
    navigator.clipboard?.writeText(txt).catch(() => {})
  }

  return (
    <>
      {/* 面板：fixed 右侧，top-16 避开 Header，纯白 + 左边框 + 阴影 */}
      <aside
        className={`fixed right-0 top-16 bottom-0 z-40 w-80 xl:w-96 max-w-[92vw] bg-white border-l border-gray-200 shadow-lg flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
              <path d="M19 14l.9 2.6L22.5 17.5l-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 14z" opacity={0.6} />
            </svg>
            <h2 className="text-base font-bold text-gray-900">AI 数学助教</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="收起 AI 助教"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 当前上下文卡 */}
        <div className="shrink-0 px-4 mt-3 mb-2">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600">当前上下文</span>
              <button
                type="button"
                onClick={() => setContextOpen((v) => !v)}
                className="text-xs text-blue-600 cursor-pointer hover:underline"
              >
                {contextOpen ? '收起' : '展开'}
              </button>
            </div>
            {contextOpen && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-gray-400">📘</span>
                  <span className="text-gray-400">当前知识点：</span>
                  <span className="font-medium text-gray-800">{context.pointTitle}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-gray-400">∑</span>
                  <span className="text-gray-400">当前公式：</span>
                  <span className="font-mono text-gray-800">{context.formula}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-gray-400">📍</span>
                  <span className="text-gray-400">当前项：</span>
                  <span className="font-mono text-gray-800">{context.currentLabel} = {context.currentValue}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-gray-400">🎯</span>
                  <span className="text-gray-400">极限值：</span>
                  <span className="font-mono text-gray-800">{context.limitLabel} = {context.limitValue}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 对话消息列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg mb-3 shadow-lg shadow-purple-500/30">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
                  <path d="M19 14l.9 2.6L22.5 17.5l-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 14z" opacity={0.7} />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">我是 AI 数学助教</p>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">可以提问当前演示相关的数学概念、推导或困惑</p>
              <div className="flex flex-col gap-2 w-full max-w-[230px]">
                {SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => send(sug)}
                    className="px-3 py-2 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, idx) => (
            <div key={idx} className={m.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}>
              {/* 顶部信息 */}
              <div className="flex items-center gap-1.5 mb-1 text-[11px] text-gray-400 px-1">
                {m.role === 'ai' ? (
                  <>
                    <span className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[8px] text-white font-bold shrink-0">AI</span>
                    <span className="text-gray-500 font-medium">AI 助教</span>
                    <span>· {m.time}</span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-500 font-medium">你</span>
                    <span>· {m.time}</span>
                  </>
                )}
              </div>
              {/* 气泡 */}
              <div
                className={`px-3 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-gray-100 text-gray-800 rounded-2xl rounded-tr-sm'
                    : 'bg-indigo-50/60 border border-gray-100 text-gray-700 rounded-2xl rounded-tl-sm'
                }`}
              >
                {m.text && <p>{m.text}</p>}
                {m.blocks?.map((b, i) =>
                  b.type === 'formula' ? (
                    <div key={i} className="my-1.5 text-center">
                      <MathFormula formula={b.content} displayMode={false} className="text-gray-800" />
                    </div>
                  ) : (
                    <p key={i} className="text-[13px]" style={{ whiteSpace: 'pre-line' }}>{b.content}</p>
                  ),
                )}
              </div>
              {/* 底部交互工具栏（仅 AI 气泡） */}
              {m.role === 'ai' && (
                <div className="flex items-center gap-0.5 mt-1 pl-1">
                  <button
                    type="button"
                    onClick={() => copyText(m)}
                    className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    aria-label="复制回答"
                  >
                    {ICON_COPY}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedback((f) => ({ ...f, [idx]: f[idx] === 'up' ? null : 'up' }))}
                    className={`p-1.5 rounded-md transition-colors ${
                      feedback[idx] === 'up' ? 'text-emerald-500 bg-emerald-50' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                    }`}
                    aria-label="点赞"
                  >
                    {ICON_UP}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedback((f) => ({ ...f, [idx]: f[idx] === 'down' ? null : 'down' }))}
                    className={`p-1.5 rounded-md transition-colors ${
                      feedback[idx] === 'down' ? 'text-rose-500 bg-rose-50' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                    }`}
                    aria-label="点踩"
                  >
                    {ICON_DOWN}
                  </button>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1.5 mb-1 text-[11px] text-gray-400 px-1">
                <span className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[8px] text-white font-bold shrink-0">AI</span>
                <span className="text-gray-500 font-medium">AI 助教</span>
                <span>· {now()}</span>
              </div>
              <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-indigo-50/60 border border-gray-100 text-gray-400 text-sm">
                思考中<span className="animate-pulse">…</span>
              </div>
            </div>
          )}
        </div>

        {/* 底部输入区 */}
        <div className="p-4 border-t border-gray-100 bg-white shrink-0">
          <div className="bg-gray-50 border border-gray-200 rounded-full flex items-center p-1.5 pl-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="继续提问（支持自然语言或公式）..."
              className="bg-transparent focus:outline-none flex-1 text-sm text-gray-800 placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => send()}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shrink-0 transition-colors disabled:opacity-50"
              aria-label="发送"
              disabled={!input.trim()}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

interface AiCopilotProps {
  open: boolean
  context: AiCopilotContext
}
