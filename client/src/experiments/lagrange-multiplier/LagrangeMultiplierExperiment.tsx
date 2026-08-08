import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { lagrangeMultiplierNarration } from '../../narrations/scripts/lagrange-multiplier'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { solveCircle, LAGRANGE_PROBLEMS } from './lagrangeMultiplier'
import { drawLagrangeMultiplier } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


export const experimentV2 = true

export default function LagrangeMultiplierExperiment() {
  const [probId, setProbId] = useState(LAGRANGE_PROBLEMS[1].id)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(lagrangeMultiplierNarration)
  }, [narration])

  const prob = LAGRANGE_PROBLEMS.find((p) => p.id === probId)!
  const sol = solveCircle(prob.a, prob.b, prob.r, 'max')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let raf = 0
    let progress = 0
    const data = { a: prob.a, b: prob.b, r: prob.r }
    const tick = () => {
      progress = Math.min(1, progress + 0.015)
      drawLagrangeMultiplier(canvas, data, progress)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [prob])

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "⛰️ 拉格朗日乘数",
        ]}
        title="⛰️ 拉格朗日乘数"
        subtitle="在约束曲线上寻找目标函数的极值"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">约束圆上最大化 {prob.label}</h3>
<canvas ref={canvasRef} width={600} height={560} className="w-full rounded-lg" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择目标函数">
<div className="space-y-2">
                {LAGRANGE_PROBLEMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProbId(p.id)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${probId === p.id ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    <div>{p.label} （约束半径 {p.r}）</div>
                    <div className={`text-xs ${probId === p.id ? 'text-indigo-100' : 'text-indigo-400'}`}>{p.note}</div>
                  </button>
                ))}
              </div>
</ExperimentCard>
<ExperimentCard title="解析解">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 最优点 x = <b>{sol.x.toFixed(3)}</b>，y = <b>{sol.y.toFixed(3)}</b></li>
                <li>• 最大值 = <b>{sol.value.toFixed(3)}</b>（等于半径乘梯度模长）</li>
                <li>• 乘数 λ = <b>{sol.lambda.toFixed(3)}</b>，满足 ∇f = λ∇g</li>
                <li>• 切点处目标梯度与约束梯度<b>平行</b>。</li>
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
