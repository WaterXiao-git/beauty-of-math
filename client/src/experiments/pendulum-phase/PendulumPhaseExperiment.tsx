import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { pendulumPhaseNarration } from '../../narrations/scripts/pendulum-phase'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { drawPendulumPhase } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480
const COUNTS = [3, 6, 9]

export const experimentV2 = true

export default function PendulumPhaseExperiment() {
  const [count, setCount] = useState(6)
  const [highlight, setHighlight] = useState(-1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(pendulumPhaseNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawPendulumPhase(canvas, count, Math.min(highlight, count - 1))
  }, [count, highlight])

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "单摆相空间",
        ]}
        title="单摆相空间"
        subtitle="从摆动到翻转"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">相空间 (横轴 θ · 纵轴 ω)</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
<p className="mt-2 text-xs text-gray-500">红色虚线为分界线：内侧闭合轨线是振荡，外侧波浪线是翻转越顶。</p>
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="振荡轨线条数">
<div className="space-y-2">
                {COUNTS.map((n) => (
                  <button
                    key={n}
                    onClick={() => { setCount(n); setHighlight(-1) }}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${count === n ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    {n} 条能量轨线
                  </button>
                ))}
              </div>
<button onClick={() => setHighlight((h) => (h + 1) % count)} className="w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200">
                🔦 高亮下一条轨线
              </button>
</ExperimentCard>
<ExperimentCard title="要点与趣闻">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 方程 θ'' = -(g/L)sinθ，用 <b>RK4</b> 数值积分。</li>
                <li>• 低能量：闭合椭圆状轨线，来回<b>振荡</b>。</li>
                <li>• 高能量：波浪线，越过顶点不停<b>翻转</b>。</li>
                <li>• 分隔两者的临界轨线叫<b>分界线</b> (separatrix)。</li>
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
