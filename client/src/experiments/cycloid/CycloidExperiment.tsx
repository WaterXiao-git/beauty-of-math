import { useState, useEffect, useRef } from 'react'
import MathFormula from '../../components/MathFormula/MathFormula'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { cycloidNarration } from '../../narrations/scripts/cycloid'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { buildCurve, CURVE_INFO, type CurveKind } from './cycloid'
import { drawCurveScene } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const FORMULAS: Record<CurveKind, string[]> = {
  cycloid: ['x = r(t - \\sin t)', 'y = r(1 - \\cos t)'],
  astroid: ['x = R\\cos^3 t', 'y = R\\sin^3 t', '(R=4,\\ r=1\\ \\text{内摆线})'],
  cardioid: ['x = 2r\\cos t - r\\cos 2t', 'y = 2r\\sin t - r\\sin 2t', '(R=r\\ \\text{外摆线})'],
  hypocycloid: ['x = (R-r)\\cos t + r\\cos\\tfrac{R-r}{r}t', 'y = (R-r)\\sin t - r\\sin\\tfrac{R-r}{r}t'],
  epicycloid: ['x = (R+r)\\cos t - r\\cos\\tfrac{R+r}{r}t', 'y = (R+r)\\sin t - r\\sin\\tfrac{R+r}{r}t'],
}

export const experimentV2 = true

export default function CycloidExperiment() {
  const [kind, setKind] = useState<CurveKind>('cycloid')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(cycloidNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const pts = buildCurve(kind)
    let raf = 0
    let progress = 0
    const tick = () => {
      progress = Math.min(1, progress + 0.006)
      drawCurveScene(canvas, kind, pts, progress)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [kind])

  const info = CURVE_INFO.find((c) => c.kind === kind)!

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "旋轮线家族",
        ]}
        title="旋轮线家族"
        subtitle="一个圆滚动，画出最优美的曲线"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{info.label} · 滚动生成动画</h3>
<canvas ref={canvasRef} width={640} height={480} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择曲线">
<div className="space-y-2">
                {CURVE_INFO.map((c) => (
                  <button
                    key={c.kind}
                    onClick={() => setKind(c.kind)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${kind === c.kind ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
</ExperimentCard>
<ExperimentCard title="参数方程">
<div className="p-3 bg-indigo-50 rounded-lg space-y-2 text-sm">
                {FORMULAS[kind].map((f, i) => <MathFormula key={i} formula={f} />)}
              </div>
</ExperimentCard>
<ExperimentCard title="曲线趣闻">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• <b>摆线</b>是"最速降线"：重力下小球沿摆线下滑最快，比直线还快。</li>
                <li>• <b>摆线</b>也是"等时曲线"：从任意高度释放，到底部用时相同。</li>
                <li>• <b>星形线</b>是动圆半径为大圆 1/4 的内摆线，有 4 个尖点。</li>
                <li>• <b>心脏线</b>是两个等大圆相切滚动得到的外摆线。</li>
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
