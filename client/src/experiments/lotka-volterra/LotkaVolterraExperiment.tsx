import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { lotkaVolterraNarration } from '../../narrations/scripts/lotka-volterra'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { PARAMS, PREY_STARTS } from './lotkaVolterra'
import { drawLotkaVolterra } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function LotkaVolterraExperiment() {
  const [preyStart, setPreyStart] = useState(10)
  const [beta, setBeta] = useState(PARAMS.beta)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(lotkaVolterraNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawLotkaVolterra(canvas, { ...PARAMS, beta }, preyStart, 5, 2000, 0.02)
  }, [preyStart, beta])

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "捕食者猎物模型",
        ]}
        title="捕食者猎物模型"
        subtitle="狐狸与兔子的周期"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">种群振荡曲线 + 相平面轨道</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="初始兔子数量">
<div className="space-y-2">
                {PREY_STARTS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setPreyStart(n)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${preyStart === n ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    {n} 只兔子
                  </button>
                ))}
              </div>
<h3 className="text-lg font-semibold mt-4 mb-2">被捕食率 β = {beta.toFixed(2)}</h3>
<input
                type="range" min={0.2} max={0.7} step={0.05} value={beta}
                onChange={(e) => setBeta(Number(e.target.value))}
                className="w-full"
              />
</ExperimentCard>
<ExperimentCard title="模型与趣闻">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 兔子多 → 狐狸吃得饱、变多 → 兔子被吃光 → 狐狸挨饿变少。</li>
                <li>• 两条曲线<b>此消彼长</b>，捕食者峰值总是<b>滞后</b>于猎物。</li>
                <li>• 相平面里轨迹是一条<b>闭合环</b>，说明系统周而复始。</li>
                <li>• 该模型用 <b>RK4</b> 数值积分，是种群生态学的经典基石。</li>
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
