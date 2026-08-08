import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { circlePackingNarration } from '../../narrations/scripts/circle-packing'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { MODES, type PackMode } from './circlePacking'
import { drawCirclePacking } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480
const LABELS: Record<PackMode, string> = {
  hex: '六边形最密',
  square: '方形堆积',
  random: '随机堆积',
}

export const experimentV2 = true

export default function CirclePackingExperiment() {
  const [mode, setMode] = useState<PackMode>('hex')
  const [seed, setSeed] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(circlePackingNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawCirclePacking(canvas, mode, 22, seed)
  }, [mode, seed])

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "圆填充",
        ]}
        title="圆填充"
        subtitle="最密堆积的艺术"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{LABELS[mode]} · 密度对比</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="堆积模式">
<div className="space-y-2">
                {MODES.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${mode === m ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    {LABELS[m]}
                  </button>
                ))}
              </div>
<button onClick={() => setSeed((s) => s + 1)} className="w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200">
                🎲 重新随机分布
              </button>
</ExperimentCard>
<ExperimentCard title="密度速查">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 六边形最密堆积：约 <b>90.69%</b>，平面理论极限。</li>
                <li>• 方形堆积：约 <b>78.54%</b>，四角留缝浪费更多。</li>
                <li>• 随机堆积：通常明显低于规则排布。</li>
                <li>• 蜂巢、橙子摆放、晶体结构都是最密堆积的应用。</li>
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
