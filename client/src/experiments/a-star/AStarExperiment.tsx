import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { aStarNarration } from '../../narrations/scripts/a-star'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { drawAStar, frameCount } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function AStarExperiment() {
  const [useHeuristic, setUseHeuristic] = useState(true)
  const [frame, setFrame] = useState(-1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(aStarNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawAStar(canvas, useHeuristic, frame)
  }, [useHeuristic, frame])

  const total = frameCount(useHeuristic)
  const runStep = (algo: boolean) => {
    setUseHeuristic(algo)
    setFrame(1)
  }

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "A星寻路",
        ]}
        title="A星寻路"
        subtitle="启发式最短路搜索"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{useHeuristic ? 'A*' : 'Dijkstra'} · 扩展 {frame < 0 ? total : Math.min(frame, total)} / {total} 格</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="算法对比">
<div className="space-y-2">
                <button onClick={() => runStep(true)} className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${useHeuristic ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}>
                  A* (f = g + h)
                </button>
                <button onClick={() => runStep(false)} className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${!useHeuristic ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>
                  Dijkstra (h = 0)
                </button>
              </div>
<div className="mt-3 flex gap-2">
                <button onClick={() => setFrame((f) => (f < 0 ? total : Math.min(f + 4, total)))} className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                  单步 +4
                </button>
                <button onClick={() => setFrame(-1)} className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200">
                  直接到底
                </button>
              </div>
<button onClick={() => setFrame(1)} className="w-full mt-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
                🔄 从头搜索
              </button>
</ExperimentCard>
<ExperimentCard title="图例与要点">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• <b className="text-blue-500">蓝/黄</b>=已扩展，<b className="text-green-600">绿</b>=最终路径。</li>
                <li>• g 是已走步数，h 是到终点的曼哈顿估计。</li>
                <li>• A* 按 <b>f = g + h</b> 优先扩展，朝终点定向。</li>
                <li>• h 设 0 即 Dijkstra，向四面盲目漫开，扩展更多。</li>
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
