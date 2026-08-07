// 滑块行：标题左 + 数值右（可点击手动输入，两位小数）+ 紫色滑块
import { useState } from 'react'

interface SliderRowProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  hint?: string
  format?: (v: number) => string
}

export default function SliderRow({
  label, value, min, max, step, onChange, hint,
  format = (v: number) => v.toFixed(2),
}: SliderRowProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const startEdit = () => {
    setDraft(format(value))
    setEditing(true)
  }
  const commit = () => {
    const v = parseFloat(draft)
    if (Number.isFinite(v)) {
      onChange(Math.min(Math.max(v, min), max))
    }
    setEditing(false)
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-medium text-gray-700">{label}</span>
        {editing ? (
          <input
            type="number"
            value={draft}
            step={0.01}
            min={min}
            max={max}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            autoFocus
            className="w-20 text-xs font-mono text-purple-600 font-semibold bg-white border border-purple-300 rounded-md px-1.5 py-0.5 text-right focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        ) : (
          <button
            type="button"
            onClick={startEdit}
            title="点击手动输入数值"
            className="text-xs font-mono text-purple-600 font-semibold px-1 rounded hover:bg-purple-50 hover:underline transition-colors"
          >
            {format(value)}
          </button>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={Math.min(step, 0.01)}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-purple-600"
      />
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}
