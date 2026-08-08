import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { lorenzAttractorNarration } from '../../narrations/scripts/lorenz-attractor'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { integrateLorenz, LORENZ_PRESETS } from './lorenzAttractor'
import { drawLorenzAttractor } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const STEPS = 12000
const DT = 0.008

export const experimentV2 = true

export default function LorenzAttractorExperiment() {
  const [presetId, setPresetId] = useState('classic')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(lorenzAttractorNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const preset = LORENZ_PRESETS.find((p) => p.id === presetId) ?? LORENZ_PRESETS[0]
    const pts = integrateLorenz({ x: 1, y: 1, z: 1 }, preset.params, STEPS, DT)
    let raf = 0
    let progress = 0
    const tick = () => {
      progress = Math.min(1, progress + 0.006)
      drawLorenzAttractor(canvas, pts, progress)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [presetId])

  const info = LORENZ_PRESETS.find((p) => p.id === presetId)!

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "洛伦兹吸引子 🦋",
        ]}
        title="洛伦兹吸引子 🦋"
        subtitle="确定性方程孕育的混沌与蝴蝶效应"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{info.label} · x-z 投影</h3>
<canvas ref={canvasRef} width={600} height={560} className="w-full rounded-lg" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择参数">
<div className="space-y-2">
                {LORENZ_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPresetId(p.id)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${presetId === p.id ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    <div>{p.label}</div>
                    <div className={`text-xs ${presetId === p.id ? 'text-indigo-100' : 'text-indigo-400'}`}>{p.note}</div>
                  </button>
                ))}
              </div>
</ExperimentCard>
<ExperimentCard title="混沌趣闻">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 洛伦兹方程是<b>确定性</b>的，却产生<b>不可预测</b>的轨迹。</li>
                <li>• 轨迹被吸向一个<b>奇怪吸引子</b>，有界却永不重复。</li>
                <li>• 初值相差万分之一，长期行为<b>天差地别</b>，即<b>蝴蝶效应</b>。</li>
                <li>• 参数 rho 越过阈值，系统从稳定收敛跌入<b>混沌</b>。</li>
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
