import type { ConditionResult, VerificationResult } from '../model'

export default function ValidationPanel({
  conditions,
  verification,
}: {
  conditions: readonly ConditionResult[]
  verification: VerificationResult
}) {
  return <div className="space-y-3">
    {conditions.map((condition) => <div key={condition.id} className={`rounded-xl border px-3 py-2 ${condition.satisfied ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
      <p className={`text-sm font-semibold ${condition.satisfied ? 'text-emerald-700' : 'text-rose-700'}`}>{condition.satisfied ? '✓' : '×'} {condition.label}</p>
      <p className="mt-1 text-xs leading-5 text-slate-600">证据：{condition.evidence}</p>
      {!condition.satisfied && condition.failureReason && <p className="mt-1 text-xs leading-5 text-rose-700">失败原因：{condition.failureReason}</p>}
    </div>)}
    <p className={`rounded-lg px-3 py-2 text-sm font-semibold ${verification.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
      {verification.passed ? '验证通过' : '验证未通过'}：{verification.rule}
    </p>
  </div>
}
