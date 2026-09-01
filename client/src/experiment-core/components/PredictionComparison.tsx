import type { ExperimentComputation } from '../model'
import type { PredictionJudgement } from '../schema'

export default function PredictionComparison({
  judgement,
  computation,
  reason,
}: {
  judgement: PredictionJudgement
  computation: ExperimentComputation
  reason: string
}) {
  return <div className="space-y-3">
    <h3 className="text-sm font-bold text-slate-800">预测—实际结果—原因解释</h3>
    <div className="grid gap-2 text-xs">
      <p className="rounded-lg bg-slate-50 px-3 py-2">你的预测：{String(judgement.received)}{reason ? `；理由：${reason}` : ''}</p>
      <p className="rounded-lg bg-indigo-50 px-3 py-2 text-indigo-700">实际结果：{String(computation.actualPredictionAnswer)}</p>
      <p className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">原因解释：{computation.explanation}</p>
    </div>
    <p className={`text-sm font-semibold ${judgement.correct ? 'text-emerald-600' : 'text-amber-600'}`}>{judgement.summary}</p>
  </div>
}
