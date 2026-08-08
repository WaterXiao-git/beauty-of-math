import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { grayCodeNarration } from '../../narrations/scripts/gray-code'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { binaryToGray, BITS } from './grayCode'
import { drawGrayCode } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function GrayCodeExperiment() {
  const [bits, setBits] = useState(3)
  const [active, setActive] = useState(-1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(grayCodeNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawGrayCode(canvas, bits, active)
  }, [bits, active])

  const total = 1 << bits

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "格雷码",
        ]}
        title="格雷码"
        subtitle="相邻只差一位"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{bits} 位格雷码 · 共 {total} 个码字</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="位数">
<div className="space-y-2">
                {BITS.map((b) => (
                  <button
                    key={b}
                    onClick={() => { setBits(b); setActive(-1) }}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${bits === b ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    {b} 位（{1 << b} 个码字）
                  </button>
                ))}
              </div>
<button onClick={() => setActive((a) => (a + 1) % total)} className="w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200">
                ▶ 高亮下一行的翻转位
              </button>
</ExperimentCard>
<ExperimentCard title="转换与应用">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 转换公式：<b>gray(n) = n ⊕ (n {'>>'} 1)</b>。</li>
                <li>• 例如 4 的格雷码是 <b>{binaryToGray(4).toString(2).padStart(3, '0')}</b>。</li>
                <li>• 相邻码<b>汉明距离恒为 1</b>，只翻一位。</li>
                <li>• 旋转编码器用它避免<b>读数跳变</b>。</li>
                <li>• 卡诺图行列<b>用格雷码排序</b>以便化简。</li>
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
