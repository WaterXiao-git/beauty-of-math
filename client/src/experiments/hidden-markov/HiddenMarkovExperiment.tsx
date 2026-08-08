import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { hiddenMarkovNarration } from '../../narrations/scripts/hidden-markov'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { generateSequence, viterbi, MODELS, SEQ_LENGTHS } from './hiddenMarkov'
import { drawHiddenMarkov } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480
const model = MODELS[0]

export const experimentV2 = true

export default function HiddenMarkovExperiment() {
  const [length, setLength] = useState(20)
  const [seed, setSeed] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(hiddenMarkovNarration)
  }, [narration])

  const seq = generateSequence(model, length, seed)
  const decoded = viterbi(seq.observed, model)
  const correct = decoded.filter((s, t) => s === seq.hidden[t]).length
  const accuracy = Math.round((correct / length) * 100)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawHiddenMarkov(canvas, model, seq, true)
  }, [length, seed, seq])

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "隐马尔可夫模型",
        ]}
        title="隐马尔可夫模型"
        subtitle="维特比解码隐藏状态"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">观测 · 真实隐状态 · 维特比解码</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="序列长度">
<div className="space-y-2">
                {SEQ_LENGTHS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setLength(n)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${length === n ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    {n} 天
                  </button>
                ))}
              </div>
<button onClick={() => setSeed((s) => s + 1)} className="w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200">
                🎲 重新生成序列
              </button>
<p className="mt-3 text-sm text-gray-600">解码准确率 <b className="text-indigo-600">{accuracy}%</b>（{correct}/{length}）</p>
</ExperimentCard>
<ExperimentCard title="模型与趣闻">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 隐状态：<b>晴 / 雨</b>，只能通过活动间接推测。</li>
                <li>• 观测：<b>散步 / 购物 / 打扫</b>，由发射概率决定。</li>
                <li>• 维特比用<b>动态规划</b>找全局最可能的状态路径。</li>
                <li>• 语音识别、词性标注、基因序列分析都靠它。</li>
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
