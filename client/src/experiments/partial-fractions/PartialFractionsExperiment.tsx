import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { partialFractionsNarration } from '../../narrations/scripts/partial-fractions'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { SAMPLES, decompose } from './partialFractions'
import { drawPartialFractions } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function PartialFractionsExperiment() {
  const [idx, setIdx] = useState(0)
  const [showParts, setShowParts] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(partialFractionsNarration)
  }, [narration])

  const sample = SAMPLES[idx]
  const terms = decompose(sample.numer, sample.roots)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawPartialFractions(canvas, sample.numer, sample.roots, showParts)
  }, [sample, showParts])

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "部分分式分解",
        ]}
        title="部分分式分解"
        subtitle="拆分有理分式"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{sample.label}</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
<p className="text-xs text-gray-500 mt-2">黑色粗线为原有理式，彩色细线为各简单分式，虚线为渐近线。</p>
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择例子">
<div className="space-y-2">
                {SAMPLES.map((s, i) => (
                  <button
                    key={s.label}
                    onClick={() => setIdx(i)}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-medium text-left ${idx === i ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
<button onClick={() => setShowParts((v) => !v)} className="w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200">
                {showParts ? '隐藏分式曲线' : '显示分式曲线'}
              </button>
</ExperimentCard>
<ExperimentCard title="留数法系数">
<ul className="text-sm text-gray-700 space-y-1.5">
                {terms.map((t) => (
                  <li key={t.root}>
                    <b>{t.coeff.toFixed(3)}</b> / (x {t.root >= 0 ? '- ' + t.root : '+ ' + -t.root})
                  </li>
                ))}
              </ul>
<p className="text-xs text-gray-500 mt-2">A_i = P(r_i) / Q'(r_i)，各分式之和恒等于原式。</p>
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
