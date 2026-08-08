import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { fftNarration } from '../../narrations/scripts/fft'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { SIGNAL_PRESETS, FFT_SIZES, naiveOps, fftOps } from './fft'
import { drawFft } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function FftExperiment() {
  const [presetIdx, setPresetIdx] = useState(1)
  const [size, setSize] = useState(32)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(fftNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawFft(canvas, SIGNAL_PRESETS[presetIdx], size)
  }, [presetIdx, size])

  const speedup = (naiveOps(size) / (fftOps(size) || 1)).toFixed(1)

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "快速傅里叶变换",
        ]}
        title="快速傅里叶变换"
        subtitle="分治的 n log n 算法"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{SIGNAL_PRESETS[presetIdx].name} · {size} 点采样</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择信号">
<div className="space-y-2">
                {SIGNAL_PRESETS.map((p, i) => (
                  <button
                    key={p.name}
                    onClick={() => setPresetIdx(i)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${presetIdx === i ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
<h3 className="text-lg font-semibold mb-3 mt-4">采样点数 (2 的幂)</h3>
<div className="flex gap-2">
                {FFT_SIZES.map((n) => (
                  <button
                    key={n}
                    onClick={() => setSize(n)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${size === n ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
</ExperimentCard>
<ExperimentCard title="复杂度对比">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 朴素 DFT: <b>{naiveOps(size)}</b> 次复数乘法 (n²)。</li>
                <li>• FFT: 约 <b>{fftOps(size)}</b> 次 (n log n)。</li>
                <li>• 当前提速约 <b>{speedup}</b> 倍，n 越大差距越夸张。</li>
                <li>• 幅度谱的<b>粉色峰</b>正是信号里的频率成分。</li>
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
