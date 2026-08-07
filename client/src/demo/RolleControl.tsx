// 右侧控制面板（Card Stack）：概念要点（定理条件） / 实验控制（案例 + 条件开关） / 观察提示
import type { RolleCase } from './rolleData'
import { CASES, THEOREM_TEXT } from './rolleData'
import type { Conditions } from './RolleCanvas'
import ConceptCard from './ui/ConceptCard'
import SegmentedControl from './ui/SegmentedControl'
import SwitchRow from './ui/SwitchRow'
import ObserveTipCard from './ui/ObserveTipCard'

interface RolleControlProps {
  caseId: string
  onSelectCase: (id: string) => void
  conditions: Conditions
  onToggleCondition: (key: keyof Conditions) => void
  /** 教学判断是否成立 */
  judgmentOk: boolean
  judgmentText: string
}

type ConditionKey = keyof Conditions

const CONDITION_ITEMS: { key: ConditionKey; label: string; desc: string }[] = [
  { key: 'continuous', label: '闭区间连续', desc: '关闭后将破坏连续性' },
  { key: 'differentiable', label: '开区间可导', desc: '关闭后将破坏可导性' },
  { key: 'equalEndpoints', label: '端点函数值相等', desc: '关闭后将破坏等高条件' },
]

export default function RolleControl({
  caseId,
  onSelectCase,
  conditions,
  onToggleCondition,
  judgmentOk,
  judgmentText,
}: RolleControlProps) {
  const activeCase = CASES.find((c) => c.id === caseId)

  return (
    <aside className="w-80 xl:w-96 shrink-0 hidden lg:flex flex-col gap-4 overflow-y-auto">
      {/* 概念要点（定理条件） */}
      <ConceptCard
        title="定理条件"
        subtitle="罗尔定理"
        formula={"f(a)=f(b) \\Rightarrow \\exists \\xi \\in (a,b),\\; f'(\\xi)=0"}
      >
        {THEOREM_TEXT}
      </ConceptCard>

      {/* 实验控制 */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">实验控制</h3>
          <button
            type="button"
            onClick={() => onSelectCase('x3-1')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors"
          >
            切换反例
          </button>
        </div>
        <div className="mb-4">
          <SegmentedControl
            options={CASES.map((c: RolleCase) => ({ id: c.id, label: c.name }))}
            value={caseId}
            onChange={onSelectCase}
          />
        </div>
        <div className="border-t border-gray-100 pt-1">
          {CONDITION_ITEMS.map((item) => {
            const checked = conditions[item.key]
            // 反例案例（x³−1）天然不等高：等高开关跟随案例，用户仍可手动开
            const isAutoOff = item.key === 'equalEndpoints' && activeCase?.id === 'x3-1' && !checked
            return (
              <SwitchRow
                key={item.key}
                label={item.label}
                desc={isAutoOff ? '此函数端点值不相等（反例）' : item.desc}
                checked={checked}
                onChange={() => onToggleCondition(item.key)}
              />
            )
          })}
        </div>
      </section>

      {/* 观察提示 */}
      <ObserveTipCard
        tips={[
          { icon: judgmentOk ? '✅' : '⚠️', text: judgmentText },
          { icon: '🖱️', text: '拖动画布 A / B 端点改变区间 [a, b]，或拖动背景平移 / 滚轮缩放。' },
          { icon: '🎯', text: '三条件全部满足时，曲线内部至少出现一条水平切线（ξ 自动高亮）；破坏任一条件观察定理失效。' },
        ]}
      />
    </aside>
  )
}
