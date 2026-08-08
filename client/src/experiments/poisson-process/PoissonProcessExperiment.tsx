import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { poissonProcessNarration } from '../../narrations/scripts/poisson-process'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { simulateArrivals, RATES } from './poissonProcess'
import { drawPoissonProcess } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480
const T = 30

export const experimentV2 = true

export default function PoissonProcessExperiment() {
  const [rate, setRate] = useState(1)
  const [seed, setSeed] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(poissonProcessNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const arrivals = simulateArrivals(rate, T, seed)
    drawPoissonProcess(canvas, arrivals, T)
  }, [rate, seed])

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "泊松过程",
        ]}
        title="泊松过程"
        subtitle="随机到达的计数"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">速率 λ = {rate} · 时间窗 [0, {T}]</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="到达速率 λ">
<div className="space-y-2">
                {RATES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRate(r)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${rate === r ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    λ = {r} 次/单位时间
                  </button>
                ))}
              </div>
<button onClick={() => setSeed((s) => s + 1)} className="w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200">
                🎲 重新随机一次
              </button>
</ExperimentCard>
<ExperimentCard title="要点与趣闻">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 相邻到达的间隔服从<b>指数分布</b>，均值为 1/λ。</li>
                <li>• 计数 N(t) 是右连续的<b>阶梯函数</b>，只增不减。</li>
                <li>• 时间窗内到达数服从<b>泊松分布</b>，期望 λt。</li>
                <li>• 顾客到店、粒子衰变、网站请求都能用它建模。</li>
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
