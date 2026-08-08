import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { cellularAutomataNarration } from '../../narrations/scripts/cellular-automata'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { evolve, RULE_OPTIONS } from './cellularAutomata'
import { drawCellularAutomata } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const WIDTH = 151
const GENS = 130

export const experimentV2 = true

export default function CellularAutomataExperiment() {
  const [rule, setRule] = useState(90)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(cellularAutomataNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const grid = evolve(rule, WIDTH, GENS)
    let raf = 0
    let progress = 0
    const tick = () => {
      progress = Math.min(1, progress + 0.02)
      drawCellularAutomata(canvas, grid, progress)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [rule])

  const info = RULE_OPTIONS.find((o) => o.rule === rule)

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "元胞自动机",
        ]}
        title="元胞自动机"
        subtitle="一条局部规则涌现出混沌、分形与通用计算"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{info?.label ?? `规则 ${rule}`} · {GENS} 代演化</h3>
<canvas ref={canvasRef} width={620} height={520} className="w-full rounded-lg" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择规则">
<div className="space-y-2">
                {RULE_OPTIONS.map((o) => (
                  <button
                    key={o.rule}
                    onClick={() => setRule(o.rule)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${rule === o.rule ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    <div>{o.label}</div>
                    <div className={`text-xs ${rule === o.rule ? 'text-indigo-100' : 'text-indigo-400'}`}>{o.note}</div>
                  </button>
                ))}
              </div>
</ExperimentCard>
<ExperimentCard title="数学趣闻">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 三个格子有 <b>2³=8</b> 种邻域，一条规则就是一个 <b>0~255</b> 的整数。</li>
                <li>• <b>规则 30</b> 从有序种子长出<b>混沌</b>，曾用作随机数发生器。</li>
                <li>• <b>规则 90</b> 是左右异或，涌现出<b>谢尔宾斯基三角</b>。</li>
                <li>• <b>规则 110</b> 已被证明<b>图灵完备</b>，能模拟任意计算。</li>
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
