import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { marchingSquaresNarration } from '../../narrations/scripts/marching-squares'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { THRESHOLDS } from './marchingSquares'
import { drawMarchingSquares } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function MarchingSquaresExperiment() {
  const [threshold, setThreshold] = useState(0.45)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(marchingSquaresNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawMarchingSquares(canvas, 48, 40, [threshold])
  }, [threshold])

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "行进方块",
        ]}
        title="行进方块"
        subtitle="从标量场里提取等高线"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">阈值 {threshold.toFixed(2)} · 提取的等高线</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="等高线阈值">
<div className="space-y-2">
                {THRESHOLDS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setThreshold(t)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${threshold === t ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    阈值 = {t.toFixed(2)}
                  </button>
                ))}
              </div>
<input
                type="range"
                min={0.1}
                max={1.1}
                step={0.01}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full mt-3 accent-purple-500"
              />
</ExperimentCard>
<ExperimentCard title="原理与应用">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 每个单元 4 个角与阈值比较，得到 <b>0-15</b> 共 16 种情形。</li>
                <li>• 查表决定连哪几条边，交点用<b>线性插值</b>求得。</li>
                <li>• 地形图的<b>等高线</b>、气象图的等压线都靠它绘制。</li>
                <li>• 医学 CT 的<b>等值面</b>提取用的是它的三维版行进立方体。</li>
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
