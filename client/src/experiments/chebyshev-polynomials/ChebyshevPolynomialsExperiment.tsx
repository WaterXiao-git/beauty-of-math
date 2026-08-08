import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { chebyshevPolynomialsNarration } from '../../narrations/scripts/chebyshev-polynomials'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { DEGREES } from './chebyshevPolynomials'
import { drawChebyshevPolynomials } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function ChebyshevPolynomialsExperiment() {
  const [degree, setDegree] = useState(4)
  const [showRoots, setShowRoots] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(chebyshevPolynomialsNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawChebyshevPolynomials(canvas, degree, showRoots)
  }, [degree, showRoots])

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "切比雪夫多项式",
        ]}
        title="切比雪夫多项式"
        subtitle="极小化最大误差"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">T0 到 T{degree} · 区间 [-1, 1] 等幅振荡</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="最高阶数 n">
<div className="space-y-2">
                {DEGREES.map((n) => (
                  <button
                    key={n}
                    onClick={() => setDegree(n)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${degree === n ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    n = {n}（T{n} 有 {n} 个根）
                  </button>
                ))}
              </div>
<button onClick={() => setShowRoots((v) => !v)} className="w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200">
                {showRoots ? '隐藏' : '显示'}切比雪夫节点
              </button>
</ExperimentCard>
<ExperimentCard title="性质与应用">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 递推：<b>T(n+1)=2x·Tn - T(n-1)</b>，T0=1，T1=x。</li>
                <li>• 在 [-1,1] 上以 <b>±1 等幅振荡</b>，最大偏离最小。</li>
                <li>• 根 <b>cos((2k+1)π/2n)</b> 两端密集，做插值节点。</li>
                <li>• 用切比雪夫节点插值可<b>抑制龙格现象</b>。</li>
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
