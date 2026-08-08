import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { similarTrianglesNarration } from '../../narrations/scripts/similar-triangles'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { computeSimilar, SCALE_OPTIONS } from './similarTriangles'
import { drawSimilarTriangles } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


export const experimentV2 = true

export default function SimilarTrianglesExperiment() {
  const [k, setK] = useState(2)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(similarTrianglesNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const data = computeSimilar(k)
    let raf = 0
    let progress = 0
    const tick = () => {
      progress = Math.min(1, progress + 0.02)
      drawSimilarTriangles(canvas, data, progress)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [k])

  const data = computeSimilar(k)
  const info = SCALE_OPTIONS.find((o) => o.k === k)

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "相似三角形",
        ]}
        title="相似三角形"
        subtitle="形状相同、对应角相等、对应边成比例"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{info?.label ?? `相似比 k = ${k}`}</h3>
<canvas ref={canvasRef} width={600} height={540} className="w-full rounded-lg" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择相似比">
<div className="space-y-2">
                {SCALE_OPTIONS.map((o) => (
                  <button
                    key={o.k}
                    onClick={() => setK(o.k)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${k === o.k ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    <div>{o.label}</div>
                    <div className={`text-xs ${k === o.k ? 'text-indigo-100' : 'text-indigo-400'}`}>{o.note}</div>
                  </button>
                ))}
              </div>
</ExperimentCard>
<ExperimentCard title="实时数据">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 相似比 k = <b>{data.k}</b></li>
                <li>• 面积比 = <b>{data.areaRatio.toFixed(2)}</b>，正好是 k 的平方。</li>
                <li>• 三个内角保持不变：<b>{data.angles.map((a) => a.toFixed(0) + '°').join(' , ')}</b>。</li>
                <li>• 对应边同时按相同比例放缩，形状不改变。</li>
              </ul>
</ExperimentCard>

<ExperimentCard title="实验讲解">
  <div className="[&>button]:w-full">
    <button onClick={openPresenter} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" /></svg>
            <span>开始讲解</span>
          </button>
  </div>
</ExperimentCard>

          </>
        }
      />
    </>
  )
}
