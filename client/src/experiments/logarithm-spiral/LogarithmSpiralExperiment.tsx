import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { logarithmSpiralNarration } from '../../narrations/scripts/logarithm-spiral'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { PARAMS, growthPerTurn, pitchAngle } from './logarithmSpiral'
import { drawLogarithmSpiral } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function LogarithmSpiralExperiment() {
  const [idx, setIdx] = useState(1)
  const [compare, setCompare] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(logarithmSpiralNarration)
  }, [narration])

  const { a, b } = PARAMS[idx]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawLogarithmSpiral(canvas, a, b, 4, compare)
  }, [a, b, compare])

  const angleDeg = (pitchAngle(b) * 180) / Math.PI

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "对数螺线",
        ]}
        title="对数螺线"
        subtitle="自相似的等角螺线"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">r = a·e^(b·θ)，b = {b}</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="松紧参数 b">
<div className="space-y-2">
                {PARAMS.map((p, i) => (
                  <button
                    key={p.label}
                    onClick={() => setIdx(i)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${idx === i ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
<button onClick={() => setCompare((c) => !c)} className="w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium bg-amber-100 text-amber-700 hover:bg-amber-200">
                {compare ? '隐藏' : '对比'}阿基米德螺线
              </button>
</ExperimentCard>
<ExperimentCard title="当前特征">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 等角（定角）= <b>{angleDeg.toFixed(1)}°</b>，处处不变。</li>
                <li>• 每转一圈半径放大 <b>{growthPerTurn(b).toFixed(2)}</b> 倍。</li>
                <li>• 鹦鹉螺壳、旋涡星系都近似这条曲线。</li>
                <li>• 对数螺线指数增长，阿基米德螺线线性增长。</li>
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
