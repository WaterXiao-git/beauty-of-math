import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { jacobianNarration } from '../../narrations/scripts/jacobian'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { MAPPINGS, GRID_STEPS } from './jacobian'
import { drawJacobian } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function JacobianExperiment() {
  const [mappingId, setMappingId] = useState(MAPPINGS[0].id)
  const [hi, setHi] = useState(3)
  const [hj, setHj] = useState(4)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(jacobianNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawJacobian(canvas, mappingId, hi, hj)
  }, [mappingId, hi, hj])

  const move = (di: number, dj: number) => {
    setHi((i) => Math.max(0, Math.min(GRID_STEPS - 1, i + di)))
    setHj((j) => Math.max(0, Math.min(GRID_STEPS - 1, j + dj)))
  }

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "雅可比矩阵",
        ]}
        title="雅可比矩阵"
        subtitle="非线性映射的局部线性"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">左：uv 网格 · 右：映射后的扭曲网格</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择映射">
<div className="space-y-2">
                {MAPPINGS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMappingId(m.id)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${mappingId === m.id ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
</ExperimentCard>
<ExperimentCard title="移动高亮方块">
<div className="grid grid-cols-3 gap-2 text-sm">
                <div />
                <button onClick={() => move(0, 1)} className="px-3 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200">↑</button>
                <div />
                <button onClick={() => move(-1, 0)} className="px-3 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200">←</button>
                <button onClick={() => move(0, -1)} className="px-3 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200">↓</button>
                <button onClick={() => move(1, 0)} className="px-3 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200">→</button>
              </div>
<p className="text-xs text-gray-500 mt-2">行列式给出该方块被映射后的面积缩放。</p>
</ExperimentCard>
<ExperimentCard title="要点">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 雅可比矩阵是映射在一点的<b>局部线性近似</b>。</li>
                <li>• 行列式 det J = 局部<b>面积缩放因子</b>。</li>
                <li>• 换元积分的 dxdy = |det J| dudv 由此而来。</li>
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
