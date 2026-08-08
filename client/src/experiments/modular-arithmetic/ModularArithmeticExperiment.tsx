import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { modularArithmeticNarration } from '../../narrations/scripts/modular-arithmetic'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { buildCircleData, MULTIPLIER_OPTIONS } from './modularArithmetic'
import { drawModularArithmetic } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const N = 240

export const experimentV2 = true

export default function ModularArithmeticExperiment() {
  const [k, setK] = useState(2)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(modularArithmeticNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const data = buildCircleData(N, k)
    let raf = 0
    let progress = 0
    const tick = () => {
      progress = Math.min(1, progress + 0.02)
      drawModularArithmetic(canvas, data, progress)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [k])

  const info = MULTIPLIER_OPTIONS.find((o) => o.k === k)!

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "🕰️ 模运算与同余",
        ]}
        title="🕰️ 模运算与同余"
        subtitle="时钟上的数学，圆环乘法涌现的心形线"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">模 {N} 乘法圆环 · {info.label}</h3>
<canvas ref={canvasRef} width={600} height={600} className="w-full rounded-lg" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择乘数 k">
<div className="space-y-2">
                {MULTIPLIER_OPTIONS.map((o) => (
                  <button
                    key={o.k}
                    onClick={() => setK(o.k)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${k === o.k ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    <div>连线 i → (i × {o.k}) mod {N}</div>
                    <div className={`text-xs ${k === o.k ? 'text-indigo-100' : 'text-indigo-400'}`}>{o.note}</div>
                  </button>
                ))}
              </div>
</ExperimentCard>
<ExperimentCard title="模运算趣闻">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 模运算就像<b>时钟</b>：走到头就绕回起点，15 点即下午 3 点。</li>
                <li>• 同余 a ≡ b (mod n) 表示两数除以 n 的<b>余数相同</b>。</li>
                <li>• 把乘法表画上圆环，×2 涌现<b>心形线</b>，×3 涌现<b>肾脏线</b>。</li>
                <li>• 模运算是<b>密码学</b>与哈希算法的数学基石。</li>
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
