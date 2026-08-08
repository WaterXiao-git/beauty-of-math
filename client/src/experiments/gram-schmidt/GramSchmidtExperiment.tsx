import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { gramSchmidtNarration } from '../../narrations/scripts/gram-schmidt'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { gramSchmidt, EXAMPLE_OPTIONS } from './gramSchmidt'
import { drawGramSchmidt } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


export const experimentV2 = true

export default function GramSchmidtExperiment() {
  const [exampleId, setExampleId] = useState('classic')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(gramSchmidtNarration)
  }, [narration])

  const option = EXAMPLE_OPTIONS.find((o) => o.id === exampleId)!

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let raf = 0
    let progress = 0
    const tick = () => {
      progress = Math.min(1, progress + 0.015)
      drawGramSchmidt(canvas, option.vectors, progress)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [option])

  const result = gramSchmidt(option.vectors)
  const fmt = (v: number[]) => `(${v.map((x) => x.toFixed(2)).join(', ')})`

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "施密特正交化",
        ]}
        title="施密特正交化"
        subtitle="把歪斜的一组基扶正成互相垂直的标准正交基"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{option.label} · 二维演示</h3>
<canvas ref={canvasRef} width={600} height={560} className="w-full rounded-lg" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择输入向量">
<div className="space-y-2">
                {EXAMPLE_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setExampleId(o.id)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${exampleId === o.id ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    <div>{o.label}</div>
                    <div className={`text-xs ${exampleId === o.id ? 'text-indigo-100' : 'text-indigo-400'}`}>{o.note}</div>
                  </button>
                ))}
              </div>
</ExperimentCard>
<ExperimentCard title="计算结果">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>输入 v1 = {fmt(option.vectors[0])}，v2 = {fmt(option.vectors[1])}</li>
                <li>正交基 u1 = {fmt(result.orthogonal[0])}</li>
                <li>正交基 u2 = {fmt(result.orthogonal[1])}</li>
                <li>标准正交基 e1 = {fmt(result.orthonormal[0])}</li>
                <li>标准正交基 e2 = {fmt(result.orthonormal[1])}</li>
              </ul>
</ExperimentCard>
<ExperimentCard title="要点">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 每个向量减去在前面向量上的<b>投影</b>，剩余部分必然<b>垂直</b>。</li>
                <li>• 第一个向量原样保留，作为第一个正交向量。</li>
                <li>• 再除以模长<b>单位化</b>，得到标准正交基。</li>
                <li>• 它是<b>QR 分解</b>与<b>最小二乘</b>的基础。</li>
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
