import { useState, useEffect, useRef } from 'react'
import { NarrationPresenter } from '../../components/NarrationPresenter'
import { useNarrationOptional } from '../../contexts/NarrationContext'
import { greenTheoremNarration } from '../../narrations/scripts/green-theorem'
import { usePresenterHistory } from '../../hooks/usePresenterHistory'
import {
  FIELD_OPTIONS,
  getField,
  lineIntegralCircle,
  curlIntegralDisk,
} from './greenTheorem'
import { drawGreenTheorem } from './draw'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'


const RADIUS = 1.4

export const experimentV2 = true

export default function GreenTheoremExperiment() {
  const [fieldId, setFieldId] = useState('rotation')
  const [showCurl, setShowCurl] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const narration = useNarrationOptional()
  const { showPresenter, openPresenter, handleExit } = usePresenterHistory(narration)

  useEffect(() => {
    if (narration) narration.loadScript(greenTheoremNarration)
  }, [narration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const field = getField(fieldId)
    let raf = 0
    let progress = 0
    const tick = () => {
      progress = Math.min(1, progress + 0.015)
      drawGreenTheorem(canvas, { field, radius: RADIUS, showCurl }, progress)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [fieldId, showCurl])

  const field = getField(fieldId)
  const lineIntegral = lineIntegralCircle(field, RADIUS)
  const curlIntegral = curlIntegralDisk(field, RADIUS)

  return (
    <>
      {showPresenter && <NarrationPresenter onExit={handleExit} />}

      <ExperimentShell
        breadcrumb={[
          '实验库',
          "格林公式",
        ]}
        title="格林公式"
        subtitle="边界线积分等于区域旋度的二重积分"
        canvasScrollable
        canvas={
          <div className="min-h-full w-full p-3 text-slate-800 md:p-4">
            <h3 className="text-lg font-semibold mb-2">{field.label} · 半径 {RADIUS} 的圆</h3>
<canvas ref={canvasRef} width={600} height={600} className="w-full rounded-lg" />
          </div>
        }
        sidebar={
          <>
            <ExperimentCard title="选择向量场">
<div className="space-y-2">
                {FIELD_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setFieldId(o.id)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left ${fieldId === o.id ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    <div>{o.label}</div>
                    <div className={`text-xs ${fieldId === o.id ? 'text-indigo-100' : 'text-indigo-400'}`}>{o.note}</div>
                  </button>
                ))}
              </div>
<label className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                <input type="checkbox" checked={showCurl} onChange={(e) => setShowCurl(e.target.checked)} />
                显示旋度热力底图
              </label>
</ExperimentCard>
<ExperimentCard title="数值验证">
<div className="text-sm text-gray-600 space-y-1.5">
                <div>边界线积分 ∮(P dx + Q dy)</div>
                <div className="font-mono text-indigo-600 text-base">{lineIntegral.toFixed(4)}</div>
                <div className="pt-2">区域旋度二重积分 ∬(Qx - Py) dA</div>
                <div className="font-mono text-purple-600 text-base">{curlIntegral.toFixed(4)}</div>
                <div className="pt-2 text-xs text-emerald-600">两者相等即验证了格林公式</div>
              </div>
</ExperimentCard>
<ExperimentCard title="格林公式趣闻">
<ul className="text-sm text-gray-600 space-y-1.5">
                <li>• 沿边界绕一圈的<b>环量</b>, 只由区域内部的<b>旋度</b>决定。</li>
                <li>• 取旋度恒为 1 的场, 线积分就<b>等于面积</b>。</li>
                <li>• <b>求积仪</b>正是靠描一圈轮廓来读出面积。</li>
                <li>• 它是<b>斯托克斯定理</b>在平面上的特例。</li>
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
