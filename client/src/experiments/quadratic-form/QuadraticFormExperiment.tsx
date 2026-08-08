import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { quadraticFormNarration } from '../../narrations/scripts/quadratic-form'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { eigenvalues2x2, classify, classInfo, SAMPLES } from './quadraticForm'
import { drawQuadraticForm } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function QuadraticFormExperiment() {
  const [a, setA] = useState(2)
  const [b, setB] = useState(0.5)
  const [c, setC] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(quadraticFormNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawQuadraticForm(canvas, { a, b, c }, 2)
  }, [a, b, c])

  const form = { a, b, c }
  const [lo, hi] = eigenvalues2x2(form)
  const info = classInfo(classify(form))

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "二次型",
        ]}
        title="二次型"
        subtitle="矩阵刻画的曲面"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">Q(x,y) = a x² + 2b xy + c y² · 等高线</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="调节系数">
<div className="space-y-3 text-sm">
                <label className="block">a = {a.toFixed(1)}
                  <input type="range" min={-3} max={3} step={0.1} value={a} onChange={(e) => setA(+e.target.value)} className="w-full" />
                </label>
                <label className="block">b = {b.toFixed(1)} <span className="text-gray-400">(交叉项)</span>
                  <input type="range" min={-3} max={3} step={0.1} value={b} onChange={(e) => setB(+e.target.value)} className="w-full" />
                </label>
                <label className="block">c = {c.toFixed(1)}
                  <input type="range" min={-3} max={3} step={0.1} value={c} onChange={(e) => setC(+e.target.value)} className="w-full" />
                </label>
              </div>
<div className="flex gap-2 mt-3">
                {SAMPLES.map((s) => (
                  <button key={s.name} onClick={() => { setA(s.form.a); setB(s.form.b); setC(s.form.c) }} className="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                    {s.name}
                  </button>
                ))}
              </div>
</ExperimentCard>
<ExperimentCard title="矩阵与特征值">
<p className="text-sm text-gray-600 font-mono">M = [[{a.toFixed(1)}, {b.toFixed(1)}], [{b.toFixed(1)}, {c.toFixed(1)}]]</p>
<p className="text-sm text-gray-600 mt-1">λ₁ = {lo.toFixed(2)} · λ₂ = {hi.toFixed(2)}</p>
<p className="text-sm font-semibold mt-2" style={{ color: info.color }}>{info.label}</p>
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
