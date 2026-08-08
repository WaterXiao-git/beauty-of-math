import { useState, useEffect, useRef, useMemo } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { epidemicSirNarration } from '../../narrations/scripts/epidemic-sir'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import {
  simulateSIR,
  computeR0,
  herdImmunityThreshold,
  peakInfection,
  finalEpidemicSize,
  SCENARIO_OPTIONS,
} from './epidemicSir'
import { drawEpidemicSir } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const DAYS = 160
const DT = 0.5
const I0 = 0.001

export const experimentV2 = true

export default function EpidemicSirExperiment() {
  const [beta, setBeta] = useState(0.6)
  const [gamma, setGamma] = useState(0.1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(epidemicSirNarration)
  }, [narration])

  const series = useMemo(
    () => simulateSIR({ beta, gamma, i0: I0, days: DAYS, dt: DT }),
    [beta, gamma],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let raf = 0
    let progress = 0
    const tick = () => {
      progress = Math.min(1, progress + 0.02)
      drawEpidemicSir(canvas, series, progress)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [series])

  const r0 = computeR0(beta, gamma)
  const peak = peakInfection(series)
  const herd = herdImmunityThreshold(r0)
  const finalSize = finalEpidemicSize(series)

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "🦠 SIR 传染病模型",
        ]}
        title="🦠 SIR 传染病模型"
        subtitle="易感、感染、康复三类人群随时间演化的经典模型"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">
              R0 = {r0.toFixed(2)} · {DAYS} 天演化
            </h3>
<canvas ref={canvasRef} width={640} height={480} className="w-full rounded-lg" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="预设情景">
<div className="space-y-2">
                {SCENARIO_OPTIONS.map((o) => {
                  const active = Math.abs(beta - o.beta) < 1e-9 && Math.abs(gamma - o.gamma) < 1e-9
                  return (
                    <button
                      key={o.key}
                      onClick={() => { setBeta(o.beta); setGamma(o.gamma) }}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${active ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                    >
                      <div>{o.label}</div>
                      <div className={`text-xs ${active ? 'text-indigo-100' : 'text-indigo-400'}`}>{o.note}</div>
                    </button>
                  )
                })}
              </div>
</ExperimentCard>
<ExperimentCard title="调节参数">
<label className="block text-sm text-gray-600">
                传染率 beta：{beta.toFixed(2)}
                <input type="range" min={0.05} max={1} step={0.01} value={beta} onChange={(e) => setBeta(Number(e.target.value))} className="w-full mt-1" />
              </label>
<label className="block text-sm text-gray-600">
                康复率 gamma：{gamma.toFixed(2)}
                <input type="range" min={0.03} max={0.5} step={0.01} value={gamma} onChange={(e) => setGamma(Number(e.target.value))} className="w-full mt-1" />
              </label>
</ExperimentCard>
<ExperimentCard title="关键指标">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 基本再生数 <b>R0 = {r0.toFixed(2)}</b>（{r0 > 1 ? '疫情会爆发' : '疫情将消退'}）</li>
                <li>• 感染峰值 <b>{(peak.value * 100).toFixed(1)}%</b>，出现在第 <b>{Math.round(peak.day)}</b> 天</li>
                <li>• 累计感染规模 <b>{(finalSize * 100).toFixed(1)}%</b></li>
                <li>• 群体免疫阈值 <b>{herd > 0 ? `${(herd * 100).toFixed(1)}%` : '无需'}</b></li>
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
