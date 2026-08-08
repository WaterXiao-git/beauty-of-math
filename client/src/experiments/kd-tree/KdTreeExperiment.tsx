import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { kdTreeNarration } from '../../narrations/scripts/kd-tree'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { makePoints, nearestNeighbor, buildKdTree, POINT_COUNTS, type Point } from './kdTree'
import { drawKdTree } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function KdTreeExperiment() {
  const [count, setCount] = useState(16)
  const [seed, setSeed] = useState(1)
  const [query, setQuery] = useState<Point>({ x: 300, y: 240 })
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(kdTreeNarration)
  }, [narration])

  const points = makePoints(count, W, H, seed)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawKdTree(canvas, points, query)
  }, [count, seed, query, points])

  const visited = nearestNeighbor(buildKdTree(points), query).visited

  const onMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setQuery({
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    })
  }

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "KD树",
        ]}
        title="KD树"
        subtitle="交替轴切分与最近邻"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{count} 个点 · 移动鼠标查询最近邻</h3>
<canvas ref={canvasRef} width={W} height={H} onMouseMove={onMove} className="w-full rounded-lg bg-slate-50 cursor-crosshair" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="点数量">
<div className="space-y-2">
                {POINT_COUNTS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${count === n ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    {n} 个点
                  </button>
                ))}
              </div>
<button onClick={() => setSeed((s) => s + 1)} className="w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200">
                🎲 重新随机分布
              </button>
<p className="mt-3 text-sm text-gray-600">本次查询访问 <b className="text-emerald-600">{visited}</b> / {count} 个节点</p>
</ExperimentCard>
<ExperimentCard title="应用与趣闻">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• <b>竖线</b>按 x 切分，<b>横线</b>按 y 切分，交替进行。</li>
                <li>• 取中位数建树，保证左右子树<b>平衡</b>。</li>
                <li>• 剪枝让最近邻查询平均只需 <b>O(log n)</b>。</li>
                <li>• 广泛用于最近邻检索、光线追踪、KNN 分类。</li>
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
