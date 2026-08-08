import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { matrixTransformNarration } from '../../narrations/scripts/matrix-transform'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { TRANSFORM_OPTIONS, determinant } from './matrixTransform'
import { drawMatrixTransform } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


export const experimentV2 = true

export default function MatrixTransformExperiment() {
  const [optionId, setOptionId] = useState(TRANSFORM_OPTIONS[0].id)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(matrixTransformNarration)
  }, [narration])

  const option = TRANSFORM_OPTIONS.find((o) => o.id === optionId)!

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let raf = 0
    let progress = 0
    const tick = () => {
      progress = Math.min(1, progress + 0.015)
      drawMatrixTransform(canvas, { matrix: option.matrix }, progress)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [option])

  const det = determinant(option.matrix)

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "🔲 矩阵变换",
        ]}
        title="🔲 矩阵变换"
        subtitle="看 2×2 矩阵如何把整个平面掰弯"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{option.label}</h3>
<canvas ref={canvasRef} width={600} height={560} className="w-full rounded-lg" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择变换">
<div className="space-y-2">
                {TRANSFORM_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setOptionId(o.id)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${optionId === o.id ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    <div>{o.label}</div>
                    <div className={`text-xs ${optionId === o.id ? 'text-indigo-100' : 'text-indigo-400'}`}>{o.note}</div>
                  </button>
                ))}
              </div>
</ExperimentCard>
<ExperimentCard title="当前矩阵">
<div className="font-mono text-sm text-gray-700 space-y-1">
                <div>[ {option.matrix[0].toFixed(2)}, {option.matrix[1].toFixed(2)} ]</div>
                <div>[ {option.matrix[2].toFixed(2)}, {option.matrix[3].toFixed(2)} ]</div>
              </div>
<p className="mt-3 text-sm text-gray-600">
                行列式 det = <b>{det.toFixed(2)}</b>，即面积缩放{det < 0 ? '（且方向翻转）' : ''}。
              </p>
</ExperimentCard>
<ExperimentCard title="要点">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 矩阵的两列就是<b>基向量</b> i、j 变换后的落点。</li>
                <li>• 网格始终保持<b>平行且等距</b>，这就是线性。</li>
                <li>• <b>行列式</b>是单位正方形被拉伸后的有向面积。</li>
                <li>• 行列式为 0 时平面被<b>压成一条线</b>，不可逆。</li>
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
