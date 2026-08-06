// AI 智能提问与路由页：真实调用 POST /api/route（规则优先路由），按五分支渲染
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CourseHeader from '../course/CourseHeader'
import ChapterSidebar from '../course/ChapterSidebar'
import { chapters, findPoint } from '../course/courseData'
import QuestionInput from './QuestionInput'
import MatchResults from './MatchResults'
import AnalysisPanel from './AnalysisPanel'
import AnswerCard from './AnswerCard'
import { GenerateConfirm, NoMatchCard } from './GenerateConfirm'
import { PROMPT_POOL } from './askData'

// ---------- 路由结果类型（与后端 /api/route 对齐） ----------
export interface RouteMatch {
  path: string
  title: string
  score: number
  matchedBy: string
}
export interface RouteResult {
  question: string
  intent: 'draw' | 'calculate' | 'explain' | 'demo' | 'find'
  branch: 'direct' | 'suggest' | 'answer' | 'ai' | 'no-match'
  confidence: number
  matches: RouteMatch[]
  params: Record<string, number>
  reason: string
}

const INTENT_LABELS: Record<string, string> = {
  draw: '画图', calculate: '计算', explain: '解释', demo: '演示', find: '查找',
}
const BRANCH_LABELS: Record<string, string> = {
  direct: '直接加载', suggest: '候选确认', answer: '概念解释', ai: '生成确认', 'no-match': '未匹配',
}

function pickPrompts(count: number): string[] {
  const shuffled = [...PROMPT_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

const DEFAULT_QUESTION = '什么是函数在一点的极限？为什么要用 ϵ−δ 语言？'

export default function AskPage() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState(DEFAULT_QUESTION)
  const [prompts, setPrompts] = useState(() => pickPrompts(3))
  const [loading, setLoading] = useState(false)
  const [route, setRoute] = useState<RouteResult | null>(null)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)
  const [sidebarPointId, setSidebarPointId] = useState('limit-of-function')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const focusInput = () => inputRef.current?.focus()

  // 提交：真实调用规则优先路由
  const handleSubmit = async () => {
    if (question.trim().length === 0 || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: RouteResult = await res.json()
      setRoute(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  // ---------- 派生数据 ----------
  const top = route?.matches[0]
  const topScore = top?.score ?? 0

  // 知识匹配（matchedBy=knowledge，path=/demo/:pointId）→ 学习目标取自 courseData
  const knowledgeMatch = route?.matches.find((m) => m.matchedBy === 'knowledge')
  const kp = knowledgeMatch ? findPoint((knowledgeMatch.path.split('/').pop() ?? '')) : undefined

  const mainMatch = route
    ? {
        title: top?.title ?? route.question,
        summary: route.reason,
        match: Math.round(topScore * 100),
        experimentPath: top?.path,
        templates: [],
        time: '',
        difficulty: '',
      }
    : null

  const related = route
    ? route.matches.slice(1).map((m) => ({
        id: m.path,
        title: m.title,
        match: Math.round(m.score * 100),
        summary: '',
        formula: '',
      }))
    : []

  const topMatches = route
    ? route.matches.slice(0, 3).map((m) => ({ title: m.title, match: Math.round(m.score * 100) }))
    : []

  const handleEnterDemo = () => {
    if (top?.path) navigate(top.path)
  }
  const handleSelectRelated = (id: string) => navigate(id)

  // 确认生成临时实验（分支 C）：真实调用 /api/generate，仅当前会话预览
  const handleConfirmGenerate = async () => {
    if (generating || !route) return
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: route.question }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      const spec = await res.json()
      if (spec?.id) {
        sessionStorage.setItem(`temp-spec:${spec.id}`, JSON.stringify(spec))
        navigate(`/temp/${spec.id}`)
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setGenerating(false)
    }
  }

  // ---------- 五分支渲染 ----------
  const renderResult = () => {
    if (!route) return null
    switch (route.branch) {
      case 'direct':
      case 'suggest':
        return (
          <MatchResults
            main={mainMatch!}
            related={related}
            onStartLearning={handleEnterDemo}
            onViewMap={() => navigate('/')}
            onSelectRelated={handleSelectRelated}
          />
        )
      case 'answer':
        return <AnswerCard key={route.question} question={route.question} onRefine={focusInput} />
      case 'ai':
        return <GenerateConfirm route={route} onConfirmGenerate={handleConfirmGenerate} onRefine={focusInput} generating={generating} />
      case 'no-match':
        return <NoMatchCard route={route} onRefine={focusInput} />
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#f5f7fa]">
      <CourseHeader breadcrumb={['首页', 'AI 智能提问']} askActive />

      <div className="flex-1 min-h-0 flex gap-4 p-4 md:p-5">
        {/* 左：章节目录 */}
        <ChapterSidebar
          chapters={chapters}
          selectedPointId={sidebarPointId}
          onSelectPoint={setSidebarPointId}
        />

        {/* 中：提问输入 + 路由结果 */}
        <main className="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto">
          <QuestionInput
            ref={inputRef}
            question={question}
            onQuestionChange={setQuestion}
            onSubmit={handleSubmit}
            prompts={prompts}
            onFillPrompt={(p) => setQuestion(p)}
            onShuffle={() => setPrompts(pickPrompts(3))}
            loading={loading}
          />

          {/* 请求错误提示 */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600">
              路由请求失败（{error}），请确认后端服务已启动（/api/route）。
            </div>
          )}

          {renderResult()}

          {/* 未解析空状态 */}
          {!route && !loading && !error && (
            <div className="text-center py-14 text-gray-400">
              <div className="text-4xl mb-3">🤖</div>
              <p className="text-sm">输入问题后点击「智能解析」，系统将按规则优先路由匹配知识点或实验</p>
            </div>
          )}
        </main>

        {/* 右：路由解析面板 */}
        <AnalysisPanel
          question={route?.question ?? question}
          intentLabel={route ? (INTENT_LABELS[route.intent] ?? route.intent) : '—'}
          branchLabel={route ? (BRANCH_LABELS[route.branch] ?? route.branch) : '待解析'}
          confidence={route?.confidence ?? 0}
          reason={route?.reason ?? '尚未发起路由请求'}
          topMatches={topMatches}
          goals={kp?.goals ?? []}
          onEnterDemo={handleEnterDemo}
          onContinueAsking={focusInput}
        />
      </div>
    </div>
  )
}
