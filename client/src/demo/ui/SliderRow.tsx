// 滑块行：标题左 + 数值右 + 紫色滑块
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
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-medium text-gray-700">{label}</span>
        <span className="text-xs font-mono text-purple-600 font-semibold">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-purple-600"
      />
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}
