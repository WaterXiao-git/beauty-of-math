import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { hyperbolicTilingNarration } from '../../narrations/scripts/hyperbolic-tiling'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { TILINGS } from './hyperbolicTiling'
import { drawHyperbolicTiling } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function HyperbolicTilingExperiment() {
  const [idx, setIdx] = useState(0)
  const [layers, setLayers] = useState(3)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(hyperbolicTilingNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawHyperbolicTiling(canvas, TILINGS[idx], layers)
  }, [idx, layers])

  const cur = TILINGS[idx]

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "双曲镶嵌",
        ]}
        title="双曲镶嵌"
        subtitle="庞加莱圆盘上的正多边形铺砌"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{`{${cur.p},${cur.q}}`} 镶嵌 · {layers} 层</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="镶嵌类型">
<div className="space-y-2">
                {TILINGS.map((t, i) => (
                  <button
                    key={`${t.p}-${t.q}`}
                    onClick={() => setIdx(i)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${idx === i ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    {`{${t.p},${t.q}}`} — 正 {t.p} 边形，每顶点 {t.q} 个
                  </button>
                ))}
              </div>
<h3 className="text-lg font-semibold mt-4 mb-2">翻折层数</h3>
<div className="flex gap-2">
                {[2, 3, 4].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLayers(l)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${layers === l ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                  >
                    {l} 层
                  </button>
                ))}
              </div>
</ExperimentCard>
<ExperimentCard title="知识卡">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 埃舍尔的《极限圆》正是双曲镶嵌的艺术呈现。</li>
                <li>• 只有 <b>(p-2)(q-2) &gt; 4</b> 时 {'{p,q}'} 才能镶嵌双曲平面。</li>
                <li>• 每块瓦片<b>双曲面积相等</b>，越靠边界欧氏尺寸越小。</li>
                <li>• 相邻瓦片由<b>圆反演</b>翻折而来，边是垂直边界的圆弧。</li>
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
