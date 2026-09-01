import type { ParameterSpec, ParameterValue, ParameterValues } from '../schema'

export default function ParameterControls({
  specs,
  values,
  disabled,
  onChange,
}: {
  specs: readonly ParameterSpec[]
  values: ParameterValues
  disabled: boolean
  onChange: (key: string, value: ParameterValue) => void
}) {
  return <div className="space-y-5">
    {disabled && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">先提交预测，再开放实验参数。</p>}
    {specs.map((spec) => {
      const value = values[spec.key] ?? spec.initial
      return <label key={spec.key} className="block text-xs font-semibold text-slate-600">
        <span className="flex items-center justify-between gap-3">
          <span>{spec.label}{spec.unit ? `（${spec.unit}）` : ''}</span>
          <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-700">{String(value)}</span>
        </span>
        <span className="mt-1 block font-normal leading-5 text-slate-400">{spec.meaning}</span>
        {(spec.type === 'continuous' || spec.type === 'integer') && <input
          className="mt-2 w-full accent-indigo-600"
          type="range"
          min={spec.min}
          max={spec.max}
          step={spec.step}
          value={value as number}
          disabled={disabled}
          onChange={(event) => onChange(spec.key, Number(event.target.value))}
        />}
        {spec.type === 'choice' && <select
          value={value as string}
          disabled={disabled}
          onChange={(event) => onChange(spec.key, event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm disabled:bg-slate-100"
        >{spec.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>}
        {spec.type === 'boolean' && <input
          type="checkbox"
          checked={value as boolean}
          disabled={disabled}
          onChange={(event) => onChange(spec.key, event.target.checked)}
          className="mt-2 h-4 w-4 accent-indigo-600"
        />}
      </label>
    })}
  </div>
}
