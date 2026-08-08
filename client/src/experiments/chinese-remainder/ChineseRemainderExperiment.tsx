import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { chineseRemainderNarration } from '../../narrations/scripts/chinese-remainder'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { crt, SAMPLES } from './chineseRemainder'
import { drawChineseRemainder } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function ChineseRemainderExperiment() {
  const [remainders, setRemainders] = useState<number[]>(SAMPLES[0].remainders)
  const [moduli, setModuli] = useState<number[]>(SAMPLES[0].moduli)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(chineseRemainderNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawChineseRemainder(canvas, remainders, moduli, -1)
  }, [remainders, moduli])

  let answer = '—'
  try {
    answer = String(crt(remainders, moduli).x)
  } catch {
    answer = '模不互质'
  }

  const setRem = (i: number, v: number) => {
    const next = remainders.slice()
    next[i] = ((v % moduli[i]) + moduli[i]) % moduli[i]
    setRemainders(next)
  }

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "中国剩余定理",
        ]}
        title="中国剩余定理"
        subtitle="物不知数"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">数轴上的公共解 · x = {answer}</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="经典问题">
<div className="space-y-2">
                {SAMPLES.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => { setRemainders(s.remainders); setModuli(s.moduli) }}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${moduli.join() === s.moduli.join() ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
</ExperimentCard>
<ExperimentCard title="调整余数">
<div className="space-y-3">
                {moduli.map((m, i) => (
                  <div key={i}>
                    <label className="text-sm text-gray-600">x ≡ {remainders[i]} (mod {m})</label>
                    <input type="range" min={0} max={m - 1} step={1} value={remainders[i]} onChange={(e) => setRem(i, Number(e.target.value))} className="w-full" />
                  </div>
                ))}
              </div>
</ExperimentCard>
<ExperimentCard title="要点">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 模两两<b>互质</b>时，解在周期内<b>唯一</b>。</li>
                <li>• 韩信点兵、大衍求一术都是它的化身，RSA 用它加速大数运算。</li>
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
