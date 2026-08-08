import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { couponCollectorNarration } from '../../narrations/scripts/coupon-collector'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { expectedDraws, simulateTotal, COUPON_COUNTS } from './couponCollector'
import { drawCouponCollector } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function CouponCollectorExperiment() {
  const [count, setCount] = useState(12)
  const [seed, setSeed] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(couponCollectorNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawCouponCollector(canvas, count, seed)
  }, [count, seed])

  const exp = expectedDraws(count)
  const total = simulateTotal(count, seed)

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "赠券收集问题",
        ]}
        title="赠券收集问题"
        subtitle="集齐全套的期望次数"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{count} 种赠券 · 收集进度</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="赠券种类数">
<div className="space-y-2">
                {COUPON_COUNTS.map((n) => (
                  <button
                    key={n}
                    onClick={() => { setCount(n); setSeed(1) }}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${count === n ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    {n} 种赠券
                  </button>
                ))}
              </div>
<button onClick={() => setSeed((s) => s + 1)} className="w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200">
                🎲 再模拟一次
              </button>
<div className="mt-3 text-sm text-gray-600 space-y-1">
                <div>理论期望 <b>n·H(n)</b> ≈ <b>{exp.toFixed(1)}</b> 次</div>
                <div>本次模拟共抽 <b>{total}</b> 次</div>
              </div>
</ExperimentCard>
<ExperimentCard title="应用与趣闻">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 集齐 n 种的期望次数是 <b>n·H(n)</b>，约等于 <b>n·ln n</b>。</li>
                <li>• 前几张很快到手，<b>最后几张</b>却要等很久。</li>
                <li>• 集卡、扭蛋、抽奖凑套都是同一个数学问题。</li>
                <li>• 收集第 k 种新券，平均要抽 <b>n/(n−k+1)</b> 次。</li>
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
