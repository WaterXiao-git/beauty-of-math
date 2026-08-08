import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { spectralTheoremNarration } from '../../narrations/scripts/spectral-theorem'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { eigenSym2x2, SAMPLE_MATRICES } from './spectralTheorem'
import { drawSpectralTheorem } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function SpectralTheoremExperiment() {
  const [idx, setIdx] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(spectralTheoremNarration)
  }, [narration])

  const matrix = SAMPLE_MATRICES[idx].matrix
  const e = eigenSym2x2(matrix)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawSpectralTheorem(canvas, matrix, true)
  }, [matrix])

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "谱分解",
        ]}
        title="谱分解"
        subtitle="对称矩阵的正交对角化"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">单位圆经 M 变换成椭圆 · 主轴即特征向量</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择对称矩阵">
<div className="space-y-2">
                {SAMPLE_MATRICES.map((s, i) => (
                  <button
                    key={s.label}
                    onClick={() => setIdx(i)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${idx === i ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    {s.label} · [[{s.matrix.a}, {s.matrix.b}], [{s.matrix.b}, {s.matrix.c}]]
                  </button>
                ))}
              </div>
</ExperimentCard>
<ExperimentCard title="谱分解结果">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 特征值 λ₁ = <b>{e.values[0].toFixed(3)}</b>，λ₂ = <b>{e.values[1].toFixed(3)}</b>。</li>
                <li>• 特征向量 v₁ = ({e.vectors[0][0].toFixed(2)}, {e.vectors[0][1].toFixed(2)})，粉色主轴。</li>
                <li>• v₂ = ({e.vectors[1][0].toFixed(2)}, {e.vectors[1][1].toFixed(2)})，绿色主轴，与 v₁ <b>正交</b>。</li>
                <li>• M = λ₁v₁v₁ᵀ + λ₂v₂v₂ᵀ，实对称矩阵总能正交对角化。</li>
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
