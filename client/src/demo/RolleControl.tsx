// 右侧控制面板：定理条件 / 案例与条件（Tabs + 开关）/ 教学判断 + AI 助教
import type { RolleCase } from './rolleData'
import { CASES, CONDITION_FORMULA, THEOREM_TEXT } from './rolleData'
import type { Conditions } from './RolleCanvas'

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

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${
        checked ? 'bg-indigo-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
          checked ? 'left-[18px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

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
      {/* 1. 定理条件 */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">定理条件</h3>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              judgmentOk ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            {judgmentOk ? '全部满足' : '条件未满足'}
          </span>
        </div>
        <p className="text-[13px] text-gray-600 leading-relaxed mb-3">{THEOREM_TEXT}</p>
        <div className="px-3.5 py-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-center">
          <span className="text-sm font-semibold text-indigo-700">{CONDITION_FORMULA}</span>
        </div>
      </section>

      {/* 2. 案例与条件 */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">案例与条件</h3>
          <button
            type="button"
            onClick={() => onSelectCase('x3-1')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            切换反例
          </button>
        </div>

        {/* 函数案例 Tabs */}
        <div className="flex rounded-xl bg-gray-100 p-1 mb-4">
          {CASES.map((c: RolleCase) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCase(c.id)}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                c.id === caseId ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* 条件开关组 */}
        <div className="space-y-1">
          {CONDITION_ITEMS.map((item) => {
            const checked = conditions[item.key]
            // 反例案例（x³−1）天然不等高：等高开关跟随案例，用户仍可手动开
            const isAutoOff = item.key === 'equalEndpoints' && activeCase?.id === 'x3-1' && !checked
            return (
              <div
                key={item.key}
                className={`flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl transition-colors ${
                  isAutoOff ? 'bg-amber-50/60' : 'hover:bg-gray-50'
                }`}
              >
                <div>
                  <div className="text-[13px] font-medium text-gray-700">{item.label}</div>
                  <div className="text-[11px] text-gray-400">
                    {isAutoOff ? '此函数端点值不相等（反例）' : item.desc}
                  </div>
                </div>
                <ToggleSwitch checked={checked} onChange={() => onToggleCondition(item.key)} />
              </div>
            )
          })}
        </div>
      </section>

      {/* 3. 教学判断 */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">教学判断</h3>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              judgmentOk ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
            }`}
          >
            {judgmentOk ? '结论成立' : '结论不成立'}
          </span>
        </div>

        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-blue-50/70 border border-blue-100 mb-4">
          <svg
            className={`w-4 h-4 shrink-0 mt-0.5 ${judgmentOk ? 'text-emerald-500' : 'text-rose-400'}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
          >
            {judgmentOk ? (
              <path d="M9 12l2 2 4-4m5.2 2a9 9 0 1 1-2.6-6.4" />
            ) : (
              <path d="M6 18L18 6M6 6l12 12" />
            )}
          </svg>
          <p className="text-[13px] text-gray-600 leading-relaxed">{judgmentText}</p>
        </div>

        {/* AI 助教 */}
        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-1.5 h-11 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20"
        >
          <svg className="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l1.9 5.7L19.6 9l-5.7 1.9L12 16.6l-1.9-5.7L4.4 9l5.7-1.3L12 2zm7 11l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z" />
          </svg>
          向 AI 助教提问
        </button>
      </section>
    </aside>
  )
}