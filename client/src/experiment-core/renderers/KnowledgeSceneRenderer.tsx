import type { KnowledgeSceneData } from '../models/knowledgeFamilyModel'

const width = 900
const height = 520
const margin = { left: 64, right: 28, top: 34, bottom: 58 }

function ticks(min: number, max: number, count = 8) {
  return Array.from({ length: count + 1 }, (_, index) => min + (max - min) * index / count)
}

function formatTick(value: number) {
  if (Math.abs(value) < 1e-10) return '0'
  return Math.abs(value) >= 10 ? value.toFixed(0) : value.toFixed(1).replace(/\.0$/, '')
}

export default function KnowledgeSceneRenderer({ scene }: { scene: KnowledgeSceneData }) {
  const [xMin, xMax] = scene.xDomain
  const [yMin, yMax] = scene.yDomain
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const projectX = (x: number) => margin.left + (x - xMin) / (xMax - xMin) * plotWidth
  const projectY = (y: number) => margin.top + (yMax - y) / (yMax - yMin) * plotHeight
  const xTicks = ticks(xMin, xMax)
  const yTicks = ticks(yMin, yMax)
  const axisX = projectY(Math.max(yMin, Math.min(yMax, 0)))
  const axisY = projectX(Math.max(xMin, Math.min(xMax, 0)))

  return <div className="flex h-full min-h-[460px] flex-col bg-white p-4">
    <div className="mb-2 flex flex-wrap items-center gap-4 px-2 text-xs text-slate-500">
      {scene.series.map((series) => <span key={series.id} className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-6 rounded-full" style={{ backgroundColor: series.color, opacity: series.dashed ? 0.65 : 1 }} />
        {series.label}
      </span>)}
      {scene.annotations.map((annotation) => <span key={annotation} className="rounded-md bg-slate-50 px-2 py-1">{annotation}</span>)}
    </div>
    <svg className="min-h-0 w-full flex-1" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${scene.xLabel}-${scene.yLabel} 数学图像`}>
      <rect x={margin.left} y={margin.top} width={plotWidth} height={plotHeight} rx="12" fill="#f8fafc" />
      {xTicks.map((tick) => <g key={`x-${tick}`}>
        <line x1={projectX(tick)} y1={margin.top} x2={projectX(tick)} y2={height - margin.bottom} stroke="#e2e8f0" />
        <text x={projectX(tick)} y={height - margin.bottom + 24} textAnchor="middle" fill="#64748b" fontSize="12">{formatTick(tick)}</text>
      </g>)}
      {yTicks.map((tick) => <g key={`y-${tick}`}>
        <line x1={margin.left} y1={projectY(tick)} x2={width - margin.right} y2={projectY(tick)} stroke="#e2e8f0" />
        <text x={margin.left - 12} y={projectY(tick) + 4} textAnchor="end" fill="#64748b" fontSize="12">{formatTick(tick)}</text>
      </g>)}
      <line x1={margin.left} y1={axisX} x2={width - margin.right} y2={axisX} stroke="#64748b" strokeWidth="1.5" />
      <line x1={axisY} y1={margin.top} x2={axisY} y2={height - margin.bottom} stroke="#64748b" strokeWidth="1.5" />
      {scene.guides.map((guide) => <line
        key={guide.id}
        data-guide-id={guide.id}
        x1={projectX(guide.x1)} y1={projectY(guide.y1)} x2={projectX(guide.x2)} y2={projectY(guide.y2)}
        stroke={guide.color} strokeWidth="2" strokeDasharray={guide.dashed ? '7 6' : undefined}
      />)}
      {scene.series.flatMap((series) => series.segments.map((segment, index) => {
        if (segment.length === 0) return null
        const d = segment.map((point, pointIndex) => `${pointIndex === 0 ? 'M' : 'L'} ${projectX(point.x).toFixed(2)} ${projectY(point.y).toFixed(2)}`).join(' ')
        return <path
          key={`${series.id}-${index}`}
          data-series-id={series.id}
          d={d}
          fill="none"
          stroke={series.color}
          strokeWidth={series.dashed ? 2.5 : 4}
          strokeDasharray={series.dashed ? '8 7' : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      }))}
      {scene.markers.map((marker) => <g key={marker.id} data-marker-id={marker.id}>
        <circle cx={projectX(marker.x)} cy={projectY(marker.y)} r="7" fill={marker.color} stroke="white" strokeWidth="3" />
        <text x={projectX(marker.x) + 12} y={projectY(marker.y) - 12} fill={marker.color} fontSize="12" fontWeight="600">{marker.label}</text>
      </g>)}
      <text x={width - margin.right} y={axisX - 10} textAnchor="end" fill="#475569" fontSize="14">{scene.xLabel}</text>
      <text x={axisY + 12} y={margin.top + 16} fill="#475569" fontSize="14">{scene.yLabel}</text>
    </svg>
  </div>
}
