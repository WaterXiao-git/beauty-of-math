import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { oneTimePadNarration } from '../../narrations/scripts/one-time-pad'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import { generateKey, toBytes } from './oneTimePad'
import { drawOneTimePad } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const W = 600
const H = 480

export const experimentV2 = true

export default function OneTimePadExperiment() {
  const [text, setText] = useState('HELLO')
  const [mode, setMode] = useState<'encrypt' | 'reuse'>('encrypt')
  const [seed, setSeed] = useState(20260718)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(oneTimePadNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const clean = (text || ' ').slice(0, 6).toUpperCase()
    const key = generateKey(toBytes(clean).length, seed)
    drawOneTimePad(canvas, clean, key, mode)
  }, [text, mode, seed])

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "一次一密",
        ]}
        title="一次一密"
        subtitle="完美保密的异或"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{mode === 'encrypt' ? '明文 ⊕ 密钥 = 密文' : '密钥重用的危险'}</h3>
<canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg bg-slate-50" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="输入明文（≤6 字符）">
<input
                type="text"
                value={text}
                maxLength={6}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm font-mono uppercase"
                placeholder="HELLO"
              />
<div className="mt-3 space-y-2">
                <button onClick={() => setMode('encrypt')} className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${mode === 'encrypt' ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}>加密模式</button>
                <button onClick={() => setMode('reuse')} className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${mode === 'reuse' ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'}`}>密钥重用危险</button>
              </div>
<button onClick={() => setSeed((s) => s + 1)} className="w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200">
                🎲 换一把随机密钥
              </button>
</ExperimentCard>
<ExperimentCard title="要点与趣闻">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 异或是<b>对合</b>运算，加密解密用同一把密钥。</li>
                <li>• 密钥须<b>真随机、等长、只用一次</b>，才达完美保密。</li>
                <li>• 同一密文可用特制密钥解出<b>任意</b>等长明文。</li>
                <li>• 冷战时期热线电话就用过一次一密（One-Time Pad）。</li>
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
