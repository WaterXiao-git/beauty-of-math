import { useState } from 'react'

import type { PredictionResponse, PredictionSpec, TrendValue } from '../schema'

const trendOptions: readonly { value: TrendValue; label: string }[] = [
  { value: 'increase', label: '增大' },
  { value: 'decrease', label: '减小' },
  { value: 'unchanged', label: '不变' },
]

export default function PredictionPanel({
  spec,
  submitted,
  onSubmit,
}: {
  spec: PredictionSpec
  submitted: boolean
  onSubmit: (response: PredictionResponse, reason: string) => void
}) {
  const [value, setValue] = useState<string | readonly string[]>('')
  const [reason, setReason] = useState('')

  const buildResponse = (): PredictionResponse | null => {
    if (spec.type === 'trend') return value ? { type: 'trend', value: value as TrendValue } : null
    if (spec.type === 'boolean') return value ? { type: 'boolean', value: value === 'true' } : null
    if (spec.type === 'numeric') {
      const numeric = Number(value)
      return value !== '' && Number.isFinite(numeric) ? { type: 'numeric', value: numeric } : null
    }
    return value === '' || (Array.isArray(value) && value.length === 0)
      ? null
      : { type: 'choice', value }
  }

  const toggleChoice = (option: string) => {
    if (spec.type !== 'choice') return
    if (spec.mode === 'single') {
      setValue(option)
      return
    }
    const current = Array.isArray(value) ? value : []
    setValue(current.includes(option) ? current.filter((item) => item !== option) : [...current, option])
  }

  const options = spec.type === 'trend'
    ? trendOptions
    : spec.type === 'boolean'
      ? [{ value: 'true', label: '成立' }, { value: 'false', label: '不成立' }]
      : spec.type === 'choice'
        ? spec.options
        : []

  return <div className="space-y-3">
    <p className="text-sm font-semibold leading-6 text-slate-700">{spec.prompt}</p>
    {spec.type === 'numeric' ? (
      <input
        type="number"
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => setValue(event.target.value)}
        disabled={submitted}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
        placeholder={`输入预测数值${spec.unit ? `（${spec.unit}）` : ''}`}
      />
    ) : (
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const active = Array.isArray(value) ? value.includes(option.value) : value === option.value
          return <button
            key={option.value}
            type="button"
            disabled={submitted}
            onClick={() => spec.type === 'choice' ? toggleChoice(option.value) : setValue(option.value)}
            className={`rounded-xl border px-3 py-2 text-sm font-medium ${active ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'} disabled:opacity-60`}
          >{option.label}</button>
        })}
      </div>
    )}
    <textarea
      value={reason}
      onChange={(event) => setReason(event.target.value)}
      disabled={submitted}
      rows={2}
      className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
      placeholder="可选：写下预测理由（不参与自动判定）"
    />
    {!submitted && <button
      type="button"
      disabled={!buildResponse()}
      onClick={() => {
        const response = buildResponse()
        if (response) onSubmit(response, reason)
      }}
      className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
    >提交预测并开始实验</button>}
  </div>
}
