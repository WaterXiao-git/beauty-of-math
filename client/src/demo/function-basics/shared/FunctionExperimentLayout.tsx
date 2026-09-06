import type { ReactNode } from 'react'
import { findChapterOf, findPoint } from '../../../course/courseData'
import ExperimentCard from '../../../experiment-v2/ExperimentCard'
import ExperimentShell, { type ExperimentLegendItem, type ExperimentPlayerConfig } from '../../../experiment-v2/ExperimentShell'

export default function FunctionExperimentLayout({
  pointId, canvas, controls, observation, player, legend,
}: {
  pointId: string
  canvas: ReactNode
  controls: ReactNode
  observation: string
  player: ExperimentPlayerConfig
  legend: ExperimentLegendItem[]
}) {
  const point = findPoint(pointId)
  const chapter = findChapterOf(pointId)
  if (!point || !chapter) return null
  return (
    <ExperimentShell
      breadcrumb={['高等数学', chapter.title, point.title]}
      title={point.title}
      subtitle={point.summary}
      legend={legend}
      canvas={canvas}
      sidebar={<>
        <ExperimentCard title="概念说明"><p className="text-sm leading-7 text-slate-600">{point.summary}</p></ExperimentCard>
        <ExperimentCard title="实验参数">{controls}</ExperimentCard>
        <ExperimentCard title="当前观察"><p className="text-sm leading-7 text-slate-600">{observation}</p></ExperimentCard>
        <ExperimentCard title="学习目标"><ul className="space-y-2">{point.goals.map((goal) => <li key={goal} className="flex gap-2 text-sm leading-6 text-slate-600"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />{goal}</li>)}</ul></ExperimentCard>
      </>}
      player={player}
    />
  )
}

export function RangeControl({ label, value, min, max, step = 0.1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void }) {
  return <label className="block text-xs font-semibold text-slate-500">{label}<span className="float-right rounded bg-indigo-50 px-2 py-0.5 text-indigo-700">{value.toFixed(2)}</span><input className="mt-3 w-full accent-indigo-600" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>
}
