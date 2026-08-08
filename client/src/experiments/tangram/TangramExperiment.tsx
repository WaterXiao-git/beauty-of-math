import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { tangramNarration } from '../../narrations/scripts/tangram'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { tangramPieces, SHAPE_OPTIONS, TANGRAM_PIECES } from './tangram'
import { drawTangram } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


export const experimentV2 = true

export default function TangramExperiment() {
  const [shape, setShape] = useState('square')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(tangramNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const pieces = tangramPieces()
    let raf = 0
    let progress = 0
    const tick = () => {
      progress = Math.min(1, progress + 0.02)
      drawTangram(canvas, pieces, progress)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [shape])

  const info = SHAPE_OPTIONS.find((o) => o.id === shape)!

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "🧩 七巧板",
        ]}
        title="🧩 七巧板"
        subtitle="一块正方形切成七块，拼出千变万化，面积始终守恒"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">标准剖分 · 七块拼成正方形</h3>
<canvas ref={canvasRef} width={600} height={560} className="w-full rounded-lg" />
<p className="text-sm text-gray-500 mt-2">格中数字为该块的面积份数（最小三角形 = 1 份），合计 16 份。</p>
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="目标图形">
<div className="space-y-2">
                {SHAPE_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setShape(o.id)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${shape === o.id ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    <div>{o.label}</div>
                    <div className={`text-xs ${shape === o.id ? 'text-indigo-100' : 'text-indigo-400'}`}>{o.note}</div>
                  </button>
                ))}
              </div>
<p className="text-xs text-gray-400 mt-3">当前目标：{info.label}，面积恒为 16。</p>
</ExperimentCard>
<ExperimentCard title="七块清单">
<ul className="text-sm text-gray-600 space-y-1.5">
                {TANGRAM_PIECES.map((p) => (
                  <li key={p.id} className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-sm" style={{ background: p.color }} />
                    {p.name}
                    <span className="text-gray-400">· {p.units} 份</span>
                  </li>
                ))}
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
