// 概念要点卡：白卡 + 左侧紫色强调条(border-l-4) + 圆角 + 标题/副标题左右分布 + 淡紫(#F5F3FF)公式块
// 全部自然流布局（无绝对定位 / 无 overflow-hidden / 无 flex 嵌套），避免内容被裁剪
import type { ReactNode } from 'react'
import MathFormula from '../../components/MathFormula/MathFormula'

interface ConceptCardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  /** 淡紫背景公式（KaTeX） */
  formula?: string
}

export default function ConceptCard({ title = '概念要点', subtitle = '严格定义', children, formula }: ConceptCardProps) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 border-l-4 border-l-purple-500 shadow-sm p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        <span className="text-xs text-gray-400">{subtitle}</span>
      </div>
      <p className="text-[13px] text-gray-600 leading-relaxed">{children}</p>
      {formula && (
        <div className="mt-3 px-4 py-3 rounded-xl bg-[#F5F3FF] border border-purple-100 overflow-x-auto text-center">
          <MathFormula formula={formula} displayMode={false} className="text-purple-900" />
        </div>
      )}
    </section>
  )
}
