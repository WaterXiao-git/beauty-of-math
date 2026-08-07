// 概念要点卡：白毛玻璃 + 左侧紫色强调条 + 圆角 22px + 标题/副标题左右分布 + 淡紫(#F5F3FF)公式块
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
    <section className="relative bg-white/85 backdrop-blur-sm rounded-[22px] border border-gray-100 shadow-sm p-5 pl-6 overflow-hidden">
      <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-400" />
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        <span className="text-xs text-gray-400">{subtitle}</span>
      </div>
      <div className="text-[13px] text-gray-600 leading-relaxed">{children}</div>
      {formula && (
        <div className="mt-3 px-4 py-3 rounded-xl bg-[#F5F3FF] border border-purple-100 flex justify-center overflow-x-auto">
          <MathFormula formula={formula} displayMode={false} className="text-purple-900" />
        </div>
      )}
    </section>
  )
}
