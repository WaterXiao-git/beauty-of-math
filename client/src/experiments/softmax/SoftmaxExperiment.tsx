import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { softmaxNarration } from '../../narrations/scripts/softmax'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { SAMPLE_LOGITS, TEMPERATURES, softmax, argmax } from './softmax'
import { drawSoftmax } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function SoftmaxExperiment() {
  const [logits, setLogits] = useState<number[]>(SAMPLE_LOGITS)
  const [temp, setTemp] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(softmaxNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawSoftmax(canvas, logits, temp)
  }, [logits, temp])

  const probs = softmax(logits, temp)
  const best = argmax(probs)
  const randomize = () =>
    setLogits(logits.map(() => Math.round((Math.random() * 6 - 2) * 10) / 10))

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "Softmax函数",
        ]}
        title="Softmax函数"
        subtitle="把一组分数归一化成概率分布"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">最可能类别：第 {best + 1} 项 · {(probs[best] * 100).toFixed(1)}%</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h3 className="text-lg font-semibold mb-3">温度 T = {temp}</h3>
              <input
                type="range" min={0.2} max={5} step={0.1} value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full accent-pink-500"
              />
              <div className="flex gap-2 mt-3">
                {TEMPERATURES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTemp(t)}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-sm font-medium ${temp === t ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-700 hover:bg-pink-100'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button onClick={randomize} className="w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                🎲 随机生成 logits
              </button>
              <button onClick={() => setLogits(SAMPLE_LOGITS)} className="w-full mt-2 px-3 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200">
                恢复示例值
              </button>
            </div>
<ExperimentCard title="要点">
<ul className="text-sm text-slate-600 space-y-1.5">
                <li>• 公式：exp(zi) 除以所有 exp 之和。</li>
                <li>• 指数放大领先者，输出<b>全为正且和为 1</b>。</li>
                <li>• 温度 T <b>小</b>更尖锐，T <b>大</b>更均匀。</li>
                <li>• 分类网络最后一层、注意力权重都用它。</li>
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
