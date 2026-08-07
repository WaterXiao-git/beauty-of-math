// 统一演示容器：/demo/:pointId
// 按知识点 demoId 渲染对应模板容器；未实现模板按需求 2.2 说明原因并给出替代路径
// 左侧抽屉式侧边栏：收起时左侧留「目录」触角标志，点击弹出章节知识点抽屉（跳转 /demo/:pointId）
import { useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import type { ComponentType } from 'react'
import CourseHeader from '../course/CourseHeader'
import DrawerSidebar from '../course/DrawerSidebar'
import { COURSE_TITLE, findChapterOf, findPoint, findSectionOf } from '../course/courseData'
import RolleDemo from './RolleDemo'
import DrawerTab from './DrawerTab'
import EpsilonDeltaDemo from './EpsilonDeltaDemo'
import DerivativeDemo from './DerivativeDemo'
import FunctionPlotDemo from './FunctionPlotDemo'
import AiCopilot from './AiCopilot'
import type { AiCopilotContext } from './AiCopilot'

/** 已实现的演示模板注册表：demoId -> 演示页组件 */
const demoRegistry: Record<string, ComponentType> = {
  rolle: RolleDemo,
  'epsilon-delta': EpsilonDeltaDemo,
  derivative: DerivativeDemo,
  'function-plot': FunctionPlotDemo,
  'quadratic-function': FunctionPlotDemo,
  'absolute-value-function': FunctionPlotDemo,
  'exponential-log-function': FunctionPlotDemo,
  'rational-function': FunctionPlotDemo,
  'inverse-function': FunctionPlotDemo,
  'piecewise-function': FunctionPlotDemo,
  'composite-function': FunctionPlotDemo,
  'trigonometric-function': FunctionPlotDemo,
  'conic-sections': FunctionPlotDemo,
  'taylor-approximation': FunctionPlotDemo,
  'function-transform': FunctionPlotDemo,
  'power-series': FunctionPlotDemo,
  'newton-method': FunctionPlotDemo,
  'limit-of-sequence': FunctionPlotDemo,
  'infinitesimal': FunctionPlotDemo,
  'limit-laws': FunctionPlotDemo,
  'two-important-limits': FunctionPlotDemo,
  'continuity': FunctionPlotDemo,
  'differential': FunctionPlotDemo,
  'graphing': FunctionPlotDemo,
  'indefinite-integral': FunctionPlotDemo,
  'definite-integral': FunctionPlotDemo,
}

/** 未实现模板的占位页（需求 2.2：说明原因 + 替代学习路径） */
function DemoPlaceholder({ pointId }: { pointId: string }) {
  const point = findPoint(pointId)
  if (!point) {
    return (
      <div className="flex flex-col h-full bg-[#f5f7fa]">
        <CourseHeader breadcrumb={['首页', '演示']} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">未找到该知识点</h2>
            <p className="text-sm text-gray-500 mb-6">知识点 ID「{pointId}」不存在，可能已被移除或链接有误。</p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-5 h-10 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              返回主界面
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const chapter = findChapterOf(point.id)
  const section = findSectionOf(point.id)
  const breadcrumb = ['首页', COURSE_TITLE, chapter?.title ?? '', section?.title ?? '', point.title].filter(Boolean)

  return (
    <div className="flex flex-col h-full bg-[#f5f7fa]">
      <CourseHeader breadcrumb={breadcrumb} />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-lg w-full text-center">
          <div className="text-5xl mb-4">🛠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">「{point.title}」的交互演示建设中</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            该知识点的统一交互演示正在制作中，暂未开放。你可以选择以下替代方式继续学习：
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {point.experimentPath && (
              <Link
                to={point.experimentPath}
                className="inline-flex items-center justify-center gap-1.5 px-5 h-10 rounded-lg bg-white text-blue-600 border-2 border-blue-200 text-sm font-semibold hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                打开原有实验预览
              </Link>
            )}
            <Link
              to="/"
              className="inline-flex items-center justify-center px-5 h-10 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              返回知识点
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DemoPage() {
  const { pointId = '' } = useParams()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const point = findPoint(pointId)

  // AI 助教上下文：按当前演示模板映射（后续可改为从演示页状态实时提取）
  const aiContext = useMemo<AiCopilotContext>(() => {
    const t = point?.title ?? '未知知识点'
    switch (point?.demoId) {
      case 'epsilon-delta':
        return { pointTitle: t, formula: 'lim(x→a) f(x) = L', currentLabel: 'a', currentValue: '1.00', limitLabel: 'L', limitValue: 'f(a)' }
      case 'derivative':
        return { pointTitle: t, formula: "f'(x₀) = lim(h→0) (f(x₀+h)−f(x₀))/h", currentLabel: 'x₀', currentValue: '0.50', limitLabel: "f'(x₀)", limitValue: '切线斜率' }
      case 'rolle':
        return { pointTitle: t, formula: 'f(a)=f(b) ⇒ ∃ξ∈(a,b), f′(ξ)=0', currentLabel: 'ξ', currentValue: '0.00', limitLabel: "f'(ξ)", limitValue: '0' }
      case 'function-plot':
        return { pointTitle: t, formula: 'y = k·x + b', currentLabel: 'k', currentValue: '1.00', limitLabel: 'b', limitValue: '0.00' }
      default:
        return { pointTitle: t, formula: '—', currentLabel: '—', currentValue: '—', limitLabel: '—', limitValue: '—' }
    }
  }, [point])

  // 抽屉选中知识点 → 跳转对应演示页（DrawerSidebar 内部选中后自动调 onClose）
  const handleSelectPoint = (id: string) => {
    setDrawerOpen(false)
    navigate('/demo/' + id)
  }

  // 已实现演示：直接渲染对应模板容器
  let content
  if (point?.demoId && demoRegistry[point.demoId]) {
    const Demo = demoRegistry[point.demoId]
    content = <Demo />
  } else {
    // 未实现 / 未找到：占位页（说明原因 + 替代路径）
    content = <DemoPlaceholder pointId={pointId} />
  }

  return (
    <div className="relative h-full">
      {content}

      {/* 收起态左侧触角：点击弹出章节目录抽屉 */}
      {!drawerOpen && <DrawerTab onClick={() => setDrawerOpen(true)} />}

      {/* 抽屉式侧边栏（章节知识点目录，选中跳转 /demo/:pointId） */}
      <DrawerSidebar
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selectedPointId={pointId}
        onSelectPoint={handleSelectPoint}
      />

      {/* AI 助教 FAB（右下角悬浮，紫色渐变胶囊） */}
      {!aiOpen && (
        <button
          type="button"
          onClick={() => setAiOpen(true)}
          className="fixed bottom-24 right-5 z-40 inline-flex items-center gap-2 px-4 h-11 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
          aria-label="问 AI 助教"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
            <path d="M19 14l.9 2.6L22.5 17.5l-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 14z" opacity={0.7} />
          </svg>
          问 AI 助教
        </button>
      )}

      {/* AI 数学助教侧边栏（右侧悬浮/可收起） */}
      <AiCopilot open={aiOpen} onClose={() => setAiOpen(false)} context={aiContext} />
    </div>
  )
}
