import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { sineSuperpositionNarration } from '../../narrations/scripts/sine-superposition'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { WAVE_SCENARIOS } from './sineSuperposition'
import { drawSineSuperposition } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


export const experimentV2 = true

export default function SineSuperpositionExperiment() {
  const [scenarioId, setScenarioId] = useState(WAVE_SCENARIOS[0].id)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(sineSuperpositionNarration)
  }, [narration])

  const scenario = WAVE_SCENARIOS.find((s) => s.id === scenarioId) ?? WAVE_SCENARIOS[0]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let raf = 0
    let progress = 0
    const tick = () => {
      progress += 0.006
      if (progress > 1) progress -= 1
      drawSineSuperposition(canvas, scenario.waves, progress)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [scenario])

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "波的叠加",
        ]}
        title="波的叠加"
        subtitle="两列正弦波相加，涌现干涉、拍频与谐波"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{scenario.label} · 分量波（上）与合成波（下）</h3>
<canvas ref={canvasRef} width={600} height={520} className="w-full rounded-lg" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择叠加场景">
<div className="space-y-2">
                {WAVE_SCENARIOS.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setScenarioId(o.id)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${scenarioId === o.id ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    <div>{o.label}</div>
                    <div className={`text-xs ${scenarioId === o.id ? 'text-indigo-100' : 'text-indigo-400'}`}>{o.note}</div>
                  </button>
                ))}
              </div>
</ExperimentCard>
<ExperimentCard title="叠加趣闻">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 叠加原理：同一点的位移等于各列波位移的<b>代数和</b>。</li>
                <li>• 同频同相相加，振幅翻倍，这是<b>相长干涉</b>。</li>
                <li>• 同频反相相加，处处抵消归零，这是<b>相消干涉</b>。</li>
                <li>• 频率相近时会出现缓慢起伏的<b>拍频</b>包络。</li>
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
