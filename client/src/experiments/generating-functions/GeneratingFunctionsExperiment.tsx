import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { generatingFunctionsNarration } from '../../narrations/scripts/generating-functions'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { EXAMPLES, coeffSum } from './generatingFunctions'
import { drawGeneratingFunctions } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function GeneratingFunctionsExperiment() {
  const [idx, setIdx] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(generatingFunctionsNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawGeneratingFunctions(canvas, EXAMPLES[idx].coeffs, '#6366f1')
  }, [idx])

  const example = EXAMPLES[idx]
  const total = coeffSum(example.coeffs)

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "生成函数",
        ]}
        title="生成函数"
        subtitle="把数列装进幂级数"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{example.label} · 系数柱状图</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
<p className="text-sm text-gray-500 mt-2">系数总和 = {total}（组合总方案数）</p>
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择示例">
<div className="space-y-2">
                {EXAMPLES.map((e, i) => (
                  <button
                    key={e.id}
                    onClick={() => setIdx(i)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${idx === i ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
</ExperimentCard>
<ExperimentCard title="要点与趣闻">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 数列 a₀,a₁,a₂… 编码成幂级数 Σ aₖ·xᵏ。</li>
                <li>• 两个生成函数相乘，系数做的是<b>卷积</b>。</li>
                <li>• 掷 n 颗骰子和的分布 = 单骰生成函数的 <b>n 次幂</b>。</li>
                <li>• 斐波那契数列来自 x/(1−x−x²) 的<b>系数展开</b>。</li>
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
