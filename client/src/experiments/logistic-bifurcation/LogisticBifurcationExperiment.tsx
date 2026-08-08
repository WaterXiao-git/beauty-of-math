import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { logisticBifurcationNarration } from '../../narrations/scripts/logistic-bifurcation'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { R_WINDOWS } from './logisticBifurcation'
import { drawLogisticBifurcation } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function LogisticBifurcationExperiment() {
  const [win, setWin] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(logisticBifurcationNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const [rMin, rMax] = R_WINDOWS[win]
    drawLogisticBifurcation(canvas, rMin, rMax, 480)
  }, [win])

  const [rMin, rMax] = R_WINDOWS[win]

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "Logistic分岔图",
        ]}
        title="Logistic分岔图"
        subtitle="通往混沌的倍周期"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">r ∈ [{rMin}, {rMax}] · 稳态分布</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-white" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="放大窗口">
<div className="space-y-2">
                {R_WINDOWS.map(([a, b], i) => (
                  <button
                    key={i}
                    onClick={() => setWin(i)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${win === i ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    r ∈ [{a}, {b}]
                  </button>
                ))}
              </div>
<p className="mt-3 text-xs text-gray-500">逐级放大分岔枝杈，观察自相似结构。</p>
</ExperimentCard>
<ExperimentCard title="要点与趣闻">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 迭代规则 x = r·x·(1−x)，r 是繁殖率。</li>
                <li>• r &lt; 3 收敛到<b>单一不动点</b> 1−1/r。</li>
                <li>• r 越过 3 后倍周期分岔：<b>1→2→4→8</b>。</li>
                <li>• 分岔间隔按<b>费根鲍姆常数</b> 4.669… 收缩到混沌。</li>
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
