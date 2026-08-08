import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { waveletNarration } from '../../narrations/scripts/wavelet'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import {
  generateSignal,
  cwt,
  makeScales,
  SIGNAL_OPTIONS,
  WAVELET_OPTIONS,
} from './wavelet'
import { drawWavelet } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const N = 256
const SCALE_COUNT = 48

export const experimentV2 = true

export default function WaveletExperiment() {
  const [signal, setSignal] = useState('chirp')
  const [wavelet, setWavelet] = useState('mexican')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(waveletNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const sig = generateSignal(signal, N)
    const scales = makeScales(1, 48, SCALE_COUNT)
    const scaleogram = cwt(sig, scales, wavelet)
    const data = { signal: sig, scaleogram }
    let raf = 0
    let progress = 0
    const tick = () => {
      progress = Math.min(1, progress + 0.015)
      drawWavelet(canvas, data, progress)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [signal, wavelet])

  const sigInfo = SIGNAL_OPTIONS.find((o) => o.id === signal)!
  const wavInfo = WAVELET_OPTIONS.find((o) => o.id === wavelet)!

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "小波变换",
        ]}
        title="小波变换"
        subtitle="用平移与伸缩，同时看见时间与频率"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{sigInfo.label} · {wavInfo.label} 尺度图</h3>
<canvas ref={canvasRef} width={640} height={560} className="w-full rounded-lg" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择信号">
<div className="space-y-2">
                {SIGNAL_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setSignal(o.id)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${signal === o.id ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    <div>{o.label}</div>
                    <div className={`text-xs ${signal === o.id ? 'text-indigo-100' : 'text-indigo-400'}`}>{o.note}</div>
                  </button>
                ))}
              </div>
</ExperimentCard>
<ExperimentCard title="母小波">
<div className="space-y-2">
                {WAVELET_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setWavelet(o.id)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${wavelet === o.id ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                  >
                    <div>{o.label}</div>
                    <div className={`text-xs ${wavelet === o.id ? 'text-purple-100' : 'text-purple-400'}`}>{o.note}</div>
                  </button>
                ))}
              </div>
</ExperimentCard>
<ExperimentCard title="要点">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 傅里叶只见<b>频率</b>不见<b>时间</b>，小波两者兼得。</li>
                <li>• <b>平移</b>母小波定位时间，<b>伸缩</b>母小波选择频率。</li>
                <li>• 尺度图颜色越亮，该时刻该尺度的<b>能量</b>越强。</li>
                <li>• Haar 小波正交，可<b>完美重构</b>并<b>能量守恒</b>。</li>
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
