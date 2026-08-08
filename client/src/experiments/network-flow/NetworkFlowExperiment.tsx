import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { networkFlowNarration } from '../../narrations/scripts/network-flow'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { maxFlow, SAMPLE_NETWORK } from './networkFlow'
import { drawNetworkFlow } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function NetworkFlowExperiment() {
  const [showFlow, setShowFlow] = useState(false)
  const [highlightCut, setHighlightCut] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(networkFlowNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawNetworkFlow(canvas, SAMPLE_NETWORK, { showFlow, highlightCut })
  }, [showFlow, highlightCut])

  const result = maxFlow(SAMPLE_NETWORK)

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "最大流最小割",
        ]}
        title="最大流最小割"
        subtitle="增广路径求最大流"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">流网络 · S 到 T 的最大输送</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="运行算法">
<div className="space-y-2">
                <button
                  onClick={() => setShowFlow((v) => !v)}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium ${showFlow ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                >
                  {showFlow ? '显示容量' : '求解最大流'}
                </button>
                <button
                  onClick={() => setHighlightCut((v) => !v)}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium ${highlightCut ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                >
                  {highlightCut ? '隐藏最小割' : '高亮最小割'}
                </button>
              </div>
<p className="mt-3 text-sm text-gray-700">
                最大流 = <b className="text-indigo-600">{result.value}</b>，等于最小割容量。
              </p>
</ExperimentCard>
<ExperimentCard title="应用与趣闻">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 边上标注 <b>流量/容量</b>，绿点是源 S，橙点是汇 T。</li>
                <li>• Edmonds-Karp 用 <b>BFS</b> 反复找最短增广路径推送流量。</li>
                <li>• 最大流<b>恰好等于</b>把网络切成两半的最小割容量。</li>
                <li>• 用于物流调度、二分图匹配、图像分割等场景。</li>
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
