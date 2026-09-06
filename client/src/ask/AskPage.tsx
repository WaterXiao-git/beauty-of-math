// AI 智能提问与路由页：统一调用 POST /api/agent/route（规则优先、Agent 增强），按五分支渲染
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useNavigationType, useSearchParams } from 'react-router-dom'
import CourseHeader from '../course/CourseHeader'
import KnowledgeNavigationPanel from '../course/KnowledgeNavigationPanel'
import DrawerSidebar from '../course/DrawerSidebar'
import {
  collectCoursePoints,
  collectRelatedPoints,
  courses,
  findChapterInCourse,
  findCourseOfPoint,
  findPointAcrossCourses,
  findSectionInCourse,
} from '../course/courseCatalog'
import type { KnowledgePoint } from '../course/courseData'
import QuestionInput from './QuestionInput'
import MatchResults from './MatchResults'
import AnalysisPanel from './AnalysisPanel'
import AnswerCard from './AnswerCard'
import { GenerateConfirm, NoMatchCard } from './GenerateConfirm'
import { LEARNING_PATH, PROMPT_POOL } from './askData'
import type { RouteMatch, RouteResult } from './routeTypes'
import {
  requestQuestionRoute,
} from '../services/questionRoute'
import {
  requestDynamicExperiment,
  saveDynamicExperimentPreview,
} from '../services/dynamicExperiment'

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

const ALL_POINTS = courses.flatMap(collectCoursePoints)

const POINT_KEYWORDS: Record<string, string[]> = {
  'hm-02-02': ['函数极限', '极限', 'epsilon', 'ϵ', 'ε', 'delta', 'δ'],
  'hm-02-01': ['数列极限', '数列收敛'],
  'hm-02-07': ['极限运算', '极限法则'],
  'hm-04-05': ['导数', '切线斜率', '变化率'],
  'hm-04-12': ['微分', '线性主部'],
  'hm-05-01': ['中值定理', '罗尔'],
  'hm-05-02': ['拉格朗日中值定理', '拉格朗日'],
  'hm-05-03': ['柯西中值定理', '柯西'],
  'hm-14-08': ['泰勒', '麦克劳林'],
  'hm-03-01': ['连续函数', '连续性'],
  'hm-03-04': ['间断点', '可去间断'],
  'hm-07-01': ['定积分', '黎曼和', '曲边梯形'],
  'hm-06-02': ['不定积分', '原函数'],
}

function pointDestination(point: KnowledgePoint): string {
  if (point.rendererId) return `/demo/${point.rendererId}`
  return `/?point=${encodeURIComponent(point.id)}`
}

function resolveRoutePoint(match?: RouteMatch): KnowledgePoint | undefined {
  if (!match) return undefined
  const routeId = match.path.split('/').filter(Boolean).pop() ?? ''
  return (
    findPointAcrossCourses(routeId) ??
    ALL_POINTS.find((point) => `/demo/${point.rendererId}` === match.path) ??
    ALL_POINTS.find((point) => match.title.includes(point.title) || point.title.includes(match.title))
  )
}

function inferPoint(question: string): KnowledgePoint | undefined {
  const normalized = question.toLowerCase().replace(/\s+/g, '')
  let best: { point: KnowledgePoint; score: number } | undefined

  for (const point of ALL_POINTS) {
    const keywords = [point.title, ...(POINT_KEYWORDS[point.id] ?? [])]
    const score = keywords.reduce((sum, keyword) => {
      const token = keyword.toLowerCase().replace(/\s+/g, '')
      return token.length > 0 && normalized.includes(token) ? sum + Math.min(token.length, 6) : sum
    }, 0)
    if (score > 0 && (!best || score > best.score)) best = { point, score }
  }
  return best?.point
}

function learningPathFor(point?: KnowledgePoint): string[] {
  if (point?.id === 'hm-02-02') return LEARNING_PATH
  return ['概念引入', '核心定义', '图像理解', '例题验证', '应用拓展']
}

const FORMULAS: Record<string, string> = {
  '极限的四则运算': '\\lim(f+g)=\\lim f+\\lim g',
  '两个重要极限': '\\lim_{x\\to 0}\\frac{\\sin x}{x}=1',
  '导数的定义': "f'(x)=\\lim_{h\\to0}\\frac{f(x+h)-f(x)}{h}",
}

interface AskSessionSnapshot {
  question: string
  prompts: string[]
  route: RouteResult | null
  mode: 'auto' | 'ai'
}

// 仅保存在当前页面运行时内存中：浏览器后退可恢复，刷新页面会自然清空。
let askSessionSnapshot: AskSessionSnapshot | null = null

export default function AskPage() {
  const navigate = useNavigate()
  const navigationType = useNavigationType()
  const [searchParams] = useSearchParams()
  const restoredSession = navigationType === 'POP' ? askSessionSnapshot : null
  const [question, setQuestion] = useState(
    () => restoredSession?.question ?? searchParams.get('question')?.trim() ?? '',
  )
  const [prompts, setPrompts] = useState(() => restoredSession?.prompts ?? pickPrompts(4))
  const [loading, setLoading] = useState(false)
  const [route, setRoute] = useState<RouteResult | null>(() => restoredSession?.route ?? null)
  const [error, setError] = useState('')
  const [routeNotice, setRouteNotice] = useState('')
  const [generating, setGenerating] = useState(false)
  const [mode, setMode] = useState<'auto' | 'ai'>(
    () => restoredSession?.mode ?? (searchParams.get('mode') === 'ai' ? 'ai' : 'auto'),
  )
  const [navigationOpen, setNavigationOpen] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    askSessionSnapshot = {
      question,
      prompts,
      route,
      mode,
    }
  }, [mode, prompts, question, route])

  const focusInput = () => inputRef.current?.focus()
  const handleQuestionChange = (value: string) => {
    setQuestion(value)
    setRoute(null)
    setError('')
    setRouteNotice('')
  }

  // 提交：调用统一的规则优先 + Agent 增强路由。
  const handleSubmit = async () => {
    if (question.trim().length === 0 || loading) return
    setLoading(true)
    setError('')
    setRouteNotice('')
    if (mode === 'ai') {
      setRoute({
        question: question.trim(),
        intent: 'explain',
        branch: 'answer',
        confidence: 1,
        matches: [],
        params: {},
        reason: '用户选择直接问 AI，已跳过实验与知识点路由。',
      })
      setLoading(false)
      return
    }
    try {
      const outcome = await requestQuestionRoute(question)
      setRoute(
        outcome.route.branch === 'no-match'
          ? {
              ...outcome.route,
              branch: 'answer',
              reason: '未匹配到可靠实验，已自动转为 AI 回答。',
            }
          : outcome.route,
      )
      if (outcome.attempts > 1) {
        setRouteNotice('路由连接短暂中断，系统已自动重试并恢复。')
      }
    } catch (e) {
      setRoute(null)
      setError(e instanceof Error ? e.message : '无法识别的路由错误')
    } finally {
      setLoading(false)
    }
  }

  // ---------- 派生数据 ----------
  const top = route?.matches[0]
  const routePoint = route?.matches.map(resolveRoutePoint).find((point) => point !== undefined)
  const inferredPoint = route ? inferPoint(question) : undefined
  const contextPoint = mode === 'ai'
    ? undefined
    : routePoint ?? inferredPoint
  const contextCourse = contextPoint ? findCourseOfPoint(contextPoint.id) : undefined
  const navigationCourse = contextCourse ?? courses[0]!
  const contextChapter = contextPoint && contextCourse ? findChapterInCourse(contextCourse, contextPoint.id) : undefined
  const contextSection = contextPoint && contextCourse ? findSectionInCourse(contextCourse, contextPoint.id) : undefined
  const semanticRelated = contextPoint && contextCourse ? collectRelatedPoints(contextCourse, contextPoint) : []

  const mainMatch = contextPoint || top
    ? {
        title: contextPoint?.title ?? top!.title,
        summary: contextPoint?.summary ?? route?.reason ?? '系统已识别问题语义，并找到最接近的可视化学习入口。',
        match: Math.round((top?.score ?? 0.98) * 100),
        destination: contextPoint ? pointDestination(contextPoint) : top?.path,
        templates: [
          contextPoint?.template,
          ...semanticRelated.slice(0, 2).map((point) => point.template),
        ].filter((template): template is string => Boolean(template)),
        time: `约 ${Math.max(20, (contextPoint?.goals.length ?? 3) * 8)} 分钟`,
        difficulty: contextPoint?.previewLevel === 'A' ? '入门难度' : contextPoint?.previewLevel === 'C' ? '进阶难度' : '中等难度',
        learningPath: learningPathFor(contextPoint),
      }
    : null

  const relatedFromKnowledge = semanticRelated.map((point, index) => ({
    id: point.id,
    title: point.title,
    match: Math.max(86, 95 - index * 3),
    summary: point.summary,
    formula: FORMULAS[point.title] ?? '',
  }))
  const relatedFromRoute = (route?.matches ?? []).slice(1).map((match) => {
    const point = resolveRoutePoint(match)
    return {
      id: point?.id ?? match.path,
      title: point?.title ?? match.title,
      match: Math.round(match.score * 100),
      summary: point?.summary ?? '与当前问题语义接近，可作为补充实验或后续学习内容。',
      formula: FORMULAS[point?.title ?? match.title] ?? '',
    }
  })
  const related = [...relatedFromKnowledge, ...relatedFromRoute]
    .filter((item, index, items) => item.title !== mainMatch?.title && items.findIndex((other) => other.title === item.title) === index)
    .slice(0, 3)

  const fallbackTopMatches = mainMatch
    ? [{ title: mainMatch.title, match: mainMatch.match }, ...related.map(({ title, match }) => ({ title, match }))]
    : []
  const topMatches = !contextPoint && (route?.matches.length ?? 0) > 0
    ? route!.matches.slice(0, 3).map((match) => ({ title: match.title, match: Math.round(match.score * 100) }))
    : fallbackTopMatches.slice(0, 3)

  const handleEnterDemo = () => {
    if (mainMatch?.destination) navigate(mainMatch.destination)
  }
  const handleSelectRelated = (id: string) => {
    const point = findPointAcrossCourses(id)
    navigate(point ? `/experiments?q=${encodeURIComponent(point.title)}` : id)
  }

  // 确认生成临时实验：统一走受约束动态实验协议，仅当前会话预览。
  const handleConfirmGenerate = async () => {
    if (generating || !route) return
    setGenerating(true)
    setError('')
    try {
      const generated = await requestDynamicExperiment(route.question)
      saveDynamicExperimentPreview(generated)
      navigate('/generated-experiment', {
        state: {
          source: 'ask-generated-experiment',
          question: route.question,
        },
      })
    } catch (e) {
      setError(String(e))
    } finally {
      setGenerating(false)
    }
  }

  // ---------- 五分支渲染 ----------
  const renderResult = () => {
    const learningResult = mainMatch ? (
      <MatchResults
        main={mainMatch}
        related={related}
        onStartLearning={handleEnterDemo}
        onViewMap={() => navigate(contextPoint ? `/experiments?q=${encodeURIComponent(contextPoint.title)}` : '/experiments')}
        onAskAI={() => {
          setMode('ai')
          setRoute({
            question: question.trim(),
            intent: 'explain',
            branch: 'answer',
            confidence: 1,
            matches: route?.matches ?? [],
            params: route?.params ?? {},
            reason: '用户选择直接问 AI，已跳过后续实验路由。',
          })
        }}
        onSelectRelated={handleSelectRelated}
      />
    ) : null

    if (!route) {
      return learningResult ?? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">✦</span>
            <h2 className="font-bold text-slate-900">AI 理解结果</h2>
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-blue-200 bg-blue-50/40 px-6 py-10 text-center">
            <h3 className="font-semibold text-slate-800">等待你的问题</h3>
            <p className="mt-2 text-sm text-slate-500">输入数学问题并点击“智能解析”后，这里将展示知识点匹配、学习路径或 AI 解答。</p>
          </div>
        </section>
      )
    }
    switch (route.branch) {
      case 'direct':
      case 'suggest':
        return learningResult
      case 'answer':
        return (
          <div className="space-y-4">
            {learningResult}
            <AnswerCard key={route.question} question={route.question} onRefine={focusInput} />
          </div>
        )
      case 'ai':
        return <GenerateConfirm route={route} onConfirmGenerate={handleConfirmGenerate} onRefine={focusInput} generating={generating} />
      case 'no-match':
        return <NoMatchCard route={route} onRefine={focusInput} />
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#f5f7fa]">
      <CourseHeader
        breadcrumb={['首页', 'AI 智能提问']}
        askActive
        onOpenNavigation={() => setNavigationOpen(true)}
      />

      <DrawerSidebar
        open={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        selectedPointId={contextPoint?.id ?? ''}
        onSelectPoint={(pointId) => navigate(`/?point=${encodeURIComponent(pointId)}`)}
        chapters={navigationCourse.chapters}
        defaultCollapsed={!contextPoint}
      />

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[300px] shrink-0 border-r border-slate-200 bg-white xl:block">
          <KnowledgeNavigationPanel
            key={`${navigationCourse.id}:${contextPoint?.id ?? 'ask-overview'}`}
            chapters={navigationCourse.chapters}
            selectedPointId={contextPoint?.id ?? ''}
            onSelectPoint={(pointId) => navigate(`/?point=${encodeURIComponent(pointId)}`)}
            defaultCollapsed={!contextPoint}
          />
        </aside>

        <div className="flex min-w-0 flex-1 gap-4 p-3 md:p-4">
        {/* 中：提问输入 + 路由结果 */}
        <main className="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto">
          <QuestionInput
            ref={inputRef}
            question={question}
            onQuestionChange={handleQuestionChange}
            onSubmit={handleSubmit}
            prompts={prompts}
            onFillPrompt={handleQuestionChange}
            onShuffle={() => setPrompts(pickPrompts(4))}
            loading={loading}
            mode={mode}
            onModeChange={(nextMode) => {
              setMode(nextMode)
              setRoute(null)
              setError('')
              setRouteNotice('')
            }}
          />

          {routeNotice && (
            <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700" role="status">
              {routeNotice}
            </div>
          )}

          {/* 无法降级的请求错误提示 */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600">
              路由请求失败（{error}）。
            </div>
          )}

          <div className="shrink-0">{renderResult()}</div>

        </main>

        {/* 右：路由解析面板 */}
        <AnalysisPanel
          question={route?.question || '等待你提出问题'}
          intentLabel={route ? (INTENT_LABELS[route.intent] ?? route.intent) : '等待输入'}
          branchLabel={route ? (BRANCH_LABELS[route.branch] ?? route.branch) : '尚未提问'}
          confidence={route?.confidence ?? 0}
          chapterPath={contextPoint
            ? [contextCourse?.title, contextChapter?.title, contextSection?.title, contextPoint.title].filter(Boolean).join(' › ')
            : '提交问题后自动识别'}
          topMatches={topMatches}
          goals={contextPoint?.goals ?? []}
          previewTitle={contextPoint
            ? `${contextPoint.title} · ${contextPoint.template}`
            : '提交问题后推荐可视化演示'}
          onEnterDemo={handleEnterDemo}
          onContinueAsking={focusInput}
        />
        </div>
      </div>
    </div>
  )
}
