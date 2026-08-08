import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { markovStationaryNarration } from '../../narrations/scripts/markov-stationary'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { TRANSITION_MATRIX, INITIAL_DISTS, STATE_NAMES } from './markovStationary'
import { drawMarkovStationary } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480
const MAX_STEP = 30
const INIT_LABELS = ['从晴天出发', '从雨天出发', '均匀出发']

export const experimentV2 = true

export default function MarkovStationaryExperiment() {
  const [initIdx, setInitIdx] = useState(0)
  const [step, setStep] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(markovStationaryNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawMarkovStationary(canvas, TRANSITION_MATRIX, INITIAL_DISTS[initIdx], step)
  }, [initIdx, step])

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "马氏链稳态",
        ]}
        title="马氏链稳态"
        subtitle="转移矩阵的收敛分布"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">第 {step} 步 · {INIT_LABELS[initIdx]}（红线=稳态）</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="初始分布">
<div className="space-y-2">
                {INIT_LABELS.map((label, i) => (
                  <button
                    key={label}
                    onClick={() => { setInitIdx(i); setStep(0) }}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${initIdx === i ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
<h3 className="text-lg font-semibold mt-4 mb-2">迭代步数：{step}</h3>
<input
                type="range"
                min={0}
                max={MAX_STEP}
                value={step}
                onChange={(e) => setStep(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
<button onClick={() => setStep(0)} className="w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200">
                ↺ 回到初始分布
              </button>
</ExperimentCard>
<ExperimentCard title="应用与趣闻">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 天气模型：{STATE_NAMES.join('、')}三态互相转移。</li>
                <li>• 稳态是转移矩阵<b>特征值 1</b> 对应的分布。</li>
                <li>• 不管从哪出发，长期占比都<b>收敛到同一稳态</b>。</li>
                <li>• 谷歌 PageRank 就是超大马氏链的稳态分布。</li>
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
