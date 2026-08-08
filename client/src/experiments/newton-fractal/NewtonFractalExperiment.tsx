import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { newtonFractalNarration } from '../../narrations/scripts/newton-fractal'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { POLYNOMIALS } from './newtonFractal'
import { drawNewtonFractal } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function NewtonFractalExperiment() {
  const [poly, setPoly] = useState('z^3-1')
  const [scale, setScale] = useState(1.6)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(newtonFractalNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawNewtonFractal(canvas, poly, 0, 0, scale, 40)
  }, [poly, scale])

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "牛顿分形",
        ]}
        title="牛顿分形"
        subtitle="复平面上的收敛盆地"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">f(z) = {poly} · 收敛盆地</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-white" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择多项式">
<div className="space-y-2">
                {POLYNOMIALS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPoly(p)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${poly === p ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    f(z) = {p}
                  </button>
                ))}
              </div>
<h3 className="text-lg font-semibold mt-4 mb-2">缩放（半宽 {scale.toFixed(2)}）</h3>
<div className="flex gap-2">
                <button onClick={() => setScale((s) => Math.min(3, s * 1.4))} className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200">缩小</button>
                <button onClick={() => setScale((s) => Math.max(0.1, s / 1.4))} className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200">放大</button>
              </div>
</ExperimentCard>
<ExperimentCard title="原理与趣闻">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 每个像素按牛顿迭代 <b>z ← z − f/f′</b> 收敛到某个根。</li>
                <li>• 同色区域 = 收敛到同一根的<b>收敛盆地</b>。</li>
                <li>• 亮度表示收敛速度，越暗越靠近<b>分形边界</b>。</li>
                <li>• 边界处初值微小差异导致不同归属，正是<b>混沌</b>。</li>
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
