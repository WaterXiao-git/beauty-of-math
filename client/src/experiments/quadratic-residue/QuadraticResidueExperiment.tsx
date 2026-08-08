import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { quadraticResidueNarration } from '../../narrations/scripts/quadratic-residue'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { quadraticResidues, PRIMES } from './quadraticResidue'
import { drawQuadraticResidue } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function QuadraticResidueExperiment() {
  const [p, setP] = useState(11)
  const [showChords, setShowChords] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(quadraticResidueNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawQuadraticResidue(canvas, p, showChords)
  }, [p, showChords])

  const qr = quadraticResidues(p)

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "二次剩余",
        ]}
        title="二次剩余"
        subtitle="模 p 的完全平方"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">模 {p} 圆环 · {qr.length} 个二次剩余</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择素数 p">
<div className="space-y-2">
                {PRIMES.map((n) => (
                  <button
                    key={n}
                    onClick={() => setP(n)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${p === n ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    p = {n}
                  </button>
                ))}
              </div>
<button onClick={() => setShowChords((s) => !s)} className="w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200">
                {showChords ? '隐藏配对连线' : '显示配对连线'}
              </button>
</ExperimentCard>
<ExperimentCard title="当前剩余集合">
<p className="text-sm text-gray-700 mb-2">{'{ ' + qr.join(', ') + ' }'}</p>
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 奇素数 p 恰有 <b>(p-1)/2</b> 个非零二次剩余。</li>
                <li>• 勒让德符号用<b>欧拉判别法</b> a^((p-1)/2) 判定。</li>
                <li>• x 与 p-x 平方相同，故剩余成对出现。</li>
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
