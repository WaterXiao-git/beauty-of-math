import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { gammaFunctionNarration } from '../../narrations/scripts/gamma-function'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { gamma, SAMPLE_POINTS } from './gammaFunction'
import { drawGammaFunction } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function GammaFunctionExperiment() {
  const [pick, setPick] = useState(2.5)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(gammaFunctionNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawGammaFunction(canvas, pick)
  }, [pick])

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "伽马函数",
        ]}
        title="伽马函数"
        subtitle="阶乘的连续推广"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">Γ(x) 曲线 · 整数点落在阶乘上</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="取一个 x 看 Γ(x)">
<div className="grid grid-cols-3 gap-2">
                {SAMPLE_POINTS.map((x) => (
                  <button
                    key={x}
                    onClick={() => setPick(x)}
                    className={`px-2 py-2 rounded-lg text-sm font-medium ${pick === x ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    {x}
                  </button>
                ))}
              </div>
<div className="mt-3 text-sm text-gray-700">
                Γ({pick}) = <b className="text-amber-600">{gamma(pick).toFixed(4)}</b>
              </div>
</ExperimentCard>
<ExperimentCard title="关键性质">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 对正整数 n：<b>Γ(n) = (n-1)!</b>，阶乘的推广。</li>
                <li>• 递推关系：<b>Γ(x+1) = x·Γ(x)</b>。</li>
                <li>• 神奇的半整数值：<b>Γ(1/2) = √π</b>。</li>
                <li>• 在 0 和负整数处有极点，曲线在此发散。</li>
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
