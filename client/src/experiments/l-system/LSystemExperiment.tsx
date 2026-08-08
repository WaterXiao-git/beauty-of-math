import { useState, useEffect, useRef, useMemo } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { lSystemNarration } from '../../narrations/scripts/l-system'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { expand, turtle, PRESETS, type PresetKey } from './lsystem'
import { drawLSystem } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


export const experimentV2 = true

export default function LSystemExperiment() {
  const [preset, setPreset] = useState<PresetKey>('plant')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(lSystemNarration)
  }, [narration])

  const segs = useMemo(() => {
    const { sys } = PRESETS[preset]
    const str = expand(sys.axiom, sys.rules, sys.iterations)
    return turtle(str, sys.angle, 5)
  }, [preset])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const greenish = preset === 'plant'
    let raf = 0
    let progress = 0
    const tick = () => {
      progress = Math.min(1, progress + 0.012)
      drawLSystem(canvas, segs, progress, greenish)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [segs, preset])

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "L-系统植物",
        ]}
        title="L-系统植物"
        subtitle="几条重写规则，长出整株分形植物"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{PRESETS[preset].label} · 生长动画</h3>
<canvas ref={canvasRef} width={620} height={560} className="w-full rounded-lg" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择图形">
<div className="space-y-2">
                {(Object.keys(PRESETS) as PresetKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setPreset(k)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${preset === k ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    {PRESETS[k].label}
                  </button>
                ))}
              </div>
</ExperimentCard>
<ExperimentCard title="当前规则">
<div className="p-3 bg-white rounded-lg text-xs font-mono text-emerald-300 space-y-1">
                <div>公理: {PRESETS[preset].sys.axiom}</div>
                {Object.entries(PRESETS[preset].sys.rules).map(([k, v]) => (
                  <div key={k}>{k} → {v}</div>
                ))}
                <div>转角: {PRESETS[preset].sys.angle}°</div>
              </div>
</ExperimentCard>
<ExperimentCard title="L-系统趣闻">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 1968 年生物学家林登迈尔提出，用来描述植物生长。</li>
                <li>• 几条简单规则反复替换，就能长出逼真的蕨类和树木。</li>
                <li>• 括号 [ ] 记录分叉点，让枝条能"分岔"再"回到"主干。</li>
                <li>• 游戏和电影里的程序化植被，常用 L-系统生成。</li>
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
