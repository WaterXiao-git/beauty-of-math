import type { Observation } from '../model'

export default function ObservationPanel({ observations }: { observations: readonly Observation[] }) {
  return <dl className="space-y-3">
    {observations.map((item) => <div key={item.key} className="rounded-xl bg-slate-50 px-3 py-2">
      <dt className="text-xs font-medium text-slate-500">{item.label}</dt>
      <dd className="mt-1 text-base font-bold text-slate-800">{item.formattedValue}</dd>
      <p className="mt-1 text-xs leading-5 text-slate-500">{item.meaning}</p>
    </div>)}
  </dl>
}
