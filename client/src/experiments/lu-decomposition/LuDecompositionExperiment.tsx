import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { luDecompositionNarration } from '../../narrations/scripts/lu-decomposition'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { luDecompose, SAMPLE_MATRICES } from './luDecomposition'
import { drawLuDecomposition } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function LuDecompositionExperiment() {
  const [idx, setIdx] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(luDecompositionNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawLuDecomposition(canvas, SAMPLE_MATRICES[idx])
  }, [idx])

  const steps = luDecompose(SAMPLE_MATRICES[idx]).steps

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "LU分解",
        ]}
        title="LU分解"
        subtitle="矩阵分解为下三角乘上三角"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">示例 {idx + 1} · A = L × U</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择示例矩阵">
<div className="space-y-2">
                {SAMPLE_MATRICES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${idx === i ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    示例矩阵 {i + 1}
                  </button>
                ))}
              </div>
</ExperimentCard>
<div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h3 className="text-lg font-semibold mb-3">消元步骤（共 {steps.length} 步）</h3>
              <ul className="text-sm text-slate-600 space-y-1.5">
                {steps.map((s, i) => (
                  <li key={i}>
                    第 {i + 1} 步：用第 {s.pivot + 1} 行消去第 {s.target + 1} 行，乘数 = {Math.round(s.factor * 100) / 100}
                  </li>
                ))}
              </ul>
            </div>
<ExperimentCard title="要点">
<ul className="text-sm text-slate-600 space-y-1.5">
                <li>• U 是高斯消元得到的<b>上三角</b>矩阵。</li>
                <li>• L 是对角线为 1 的<b>下三角</b>，存放消元乘数。</li>
                <li>• 满足 <b>A = L · U</b>，可反复用于解方程。</li>
                <li>• 解方程 = 前代解 L·y=b，再回代解 U·x=y。</li>
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
