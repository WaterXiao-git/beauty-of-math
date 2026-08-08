import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { qrDecompositionNarration } from '../../narrations/scripts/qr-decomposition'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { SAMPLE_MATRICES } from './qrDecomposition'
import { drawQrDecomposition } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function QrDecompositionExperiment() {
  const [idx, setIdx] = useState(1)
  const [showQ, setShowQ] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(qrDecompositionNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawQrDecomposition(canvas, SAMPLE_MATRICES[idx].matrix, showQ)
  }, [idx, showQ])

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "QR分解",
        ]}
        title="QR分解"
        subtitle="正交阵乘上三角"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{SAMPLE_MATRICES[idx].label} · A = Q R</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择矩阵">
<div className="space-y-2">
                {SAMPLE_MATRICES.map((m, i) => (
                  <button
                    key={m.label}
                    onClick={() => setIdx(i)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${idx === i ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
<button onClick={() => setShowQ((v) => !v)} className="w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200">
                {showQ ? '隐藏正交列 Q' : '显示正交列 Q'}
              </button>
</ExperimentCard>
<ExperimentCard title="要点与应用">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• Q 的列<b>两两正交</b>且长度为 1，满足 Q<sup>T</sup>Q = I。</li>
                <li>• R 是<b>上三角</b>阵，记录了正交化的投影系数。</li>
                <li>• 二者相乘正好还原 A，即 <b>A = Q R</b>。</li>
                <li>• QR 分解是最小二乘、求特征值 <b>QR 算法</b>的核心工具。</li>
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
