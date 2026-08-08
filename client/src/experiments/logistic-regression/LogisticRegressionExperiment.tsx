import { useState, useEffect, useRef, useMemo } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { logisticRegressionNarration } from '../../narrations/scripts/logistic-regression'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { train, DATASET, LEARNING_RATE } from './logisticRegression'
import { drawLogisticRegression } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function LogisticRegressionExperiment() {
  const [step, setStep] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const history = useMemo(
    () => train(DATASET.points, DATASET.labels, LEARNING_RATE, 150),
    [],
  )
  const maxStep = history.length - 1
  const cur = Math.min(step, maxStep)
  const { weights, loss } = history[cur]

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(logisticRegressionNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawLogisticRegression(canvas, DATASET.points, DATASET.labels, weights, 4)
  }, [weights])

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "逻辑回归",
        ]}
        title="逻辑回归"
        subtitle="S形函数分类"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">迭代 {cur} / {maxStep} · 损失 {loss.toFixed(4)}</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="训练控制">
<div className="space-y-2">
                <button onClick={() => setStep((s) => Math.min(s + 1, maxStep))} className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600">
                  单步训练 (+1 步)
                </button>
                <button onClick={() => setStep((s) => Math.min(s + 10, maxStep))} className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                  快进 10 步
                </button>
                <button onClick={() => setStep(maxStep)} className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                  训练到收敛
                </button>
                <button onClick={() => setStep(0)} className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
                  ↺ 重置权重
                </button>
              </div>
<p className="text-xs text-gray-500 mt-3">学习率 η = {LEARNING_RATE}，权重 [{weights.map((v) => v.toFixed(2)).join(', ')}]</p>
</ExperimentCard>
<ExperimentCard title="要点">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 背景是<b>概率梯度</b>，蓝色偏负类、红色偏正类。</li>
                <li>• 黑线是<b>决策边界</b>，即概率恰为 0.5 的位置。</li>
                <li>• 梯度下降每步都让<b>对数损失</b>下降，边界随之移动。</li>
                <li>• 训练收敛后，两类数据点被清晰分到边界两侧。</li>
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
