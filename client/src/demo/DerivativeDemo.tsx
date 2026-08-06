// 导数的几何意义演示（需求 4.2）：配置来自统一接口 /api/knowledge/derivative
// 固定点 P + 移动点 Q，观察 h→0 时割线斜率趋近切线斜率（差商极限）
import { useEffect, useMemo, useState } from 'react'
import { compile, derivative as mathDerivative } from 'mathjs'
import DemoHeader from './DemoHeader'
import PlayerBar from './PlayerBar'
import type { StepItem } from './PlayerBar'

interface DemoCase {
  id: string
  name: string
  expr: string
  domain: [number, number]
  yRange: [number, number]
  anchor?: number | null
  desc?: string
}
interface KnowledgeConfig {
  id: string
  title: string
  summary: string
  goals: string[]
  defaultCase: string
  cases: DemoCase[]
  steps: StepItem[]
  meta?: { difficulty: string; duration: string }
}

const W = 720
const H = 400
const PAD_L = 62
const PAD_R = 40
const PAD_T = 44
const PAD_B = 52

function makeFn(expr: string) {
  const compiled = compile(expr)
  return (x: number): number => {
    try {
      const v = compiled.evaluate({ x })
      return Number.isFinite(v) ? v : NaN
    } catch {
      return NaN
    }
  }
}

function makeDerivFn(expr: string) {
  let derivExpr: string
  try {
    derivExpr = mathDerivative(expr, 'x').toString()
  } catch {
    derivExpr = '0'
  }
  const compiled = compile(derivExpr)
  return (x: number): number => {
    try {
      const v = compiled.evaluate({ x })
      return Number.isFinite(v) ? v : NaN
    } catch {
      return NaN
    }
  }
}

export default function DerivativeDemo() {
  const [config, setConfig] = useState<KnowledgeConfig | null>(null)
  const [loadError, setLoadError] = useState('')
  const [caseId, setCaseId] = useState('')
  const [x0, setX0] = useState(0)
  const [h, setH] = useState(0.8)
  const [step, setStep] = useState(4)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    fetch('/api/knowledge/derivative')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((cfg: KnowledgeConfig) => {
        setConfig(cfg)
        setCaseId(cfg.defaultCase)
      })
      .catch((e) => setLoadError(String(e)))
  }, [])

  // 播放：步进循环 + 第 3 步自动减小 h（逼近）
  useEffect(() => {
    if (!playing) return
    const timer = setInterval(() => {
      setStep((s) => (s >= 4 ? 1 : s + 1))
      setH((prev) => (step === 3 ? Math.max(0.05, prev * 0.7) : prev))
    }, 1800)
    return () => clearInterval(timer)
  }, [playing, step])

  const activeCase = useMemo(() => config?.cases.find((c) => c.id === caseId) ?? config?.cases[0], [config, caseId])

  const derived = useMemo(() => {
    if (!activeCase) return null
    const f = makeFn(activeCase.expr)
    const fp = makeDerivFn(activeCase.expr)
    const xMin = activeCase.domain[0]
    const xMax = activeCase.domain[1]
    const x0v = Math.min(Math.max(x0, xMin + 0.3), xMax - 0.3)
    const hh = Math.max(0.05, h)
    const yP = f(x0v)
    const yQ = f(x0v + hh)
    const secantSlope = (yQ - yP) / hh
    const tangentSlope = fp(x0v)
    return { f, fp, x0: x0v, h: hh, yP, yQ, secantSlope, tangentSlope, diff: Math.abs(secantSlope - tangentSlope) }
  }, [activeCase, x0, h])

  if (loadError) {
    return (
      <div className="flex flex-col h-full bg-[#f5f7fa]">
        <DemoHeader breadcrumb={['高等数学（上册）', '导数与微分', '导数的几何意义']} />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-gray-600 text-sm">演示配置加载失败（{loadError}），请确认后端服务已启动。</p>
          </div>
        </div>
      </div>
    )
  }
  if (!config || !activeCase || !derived) {
    return (
      <div className="flex flex-col h-full bg-[#f5f7fa]">
        <DemoHeader breadcrumb={['高等数学（上册）', '导数与微分', '导数的几何意义']} />
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">配置加载中…</div>
      </div>
    )
  }

  const { f, fp, x0: x0v, h: hh, yP, yQ, secantSlope, tangentSlope, diff } = derived
  const [xMin, xMax] = activeCase.domain
  const [yMin, yMax] = activeCase.yRange
  const sx = (x: number) => PAD_L + ((x - xMin) / (xMax - xMin)) * (W - PAD_L - PAD_R)
  const sy = (y: number) => H - PAD_B - ((y - yMin) / (yMax - yMin)) * (H - PAD_T - PAD_B)

  // 曲线采样
  const curvePts: string[] = []
  const N = 160
  for (let i = 0; i <= N; i++) {
    const x = xMin + ((xMax - xMin) * i) / N
    const y = f(x)
    if (!Number.isFinite(y)) continue
    curvePts.push((i === 0 ? 'M' : 'L') + sx(x).toFixed(1) + ' ' + sy(y).toFixed(1))
  }

    return (
    <div className="flex flex-col h-full bg-[#f5f7fa]">
      <DemoHeader breadcrumb={['高等数学（上册）', '导数与微分', config.title]} />

      <div className="flex-1 min-h-0 flex gap-4 p-4 md:p-5">
        {/* 左：深色画板 */}
        <section className="flex-1 min-w-0 bg-slate-900 rounded-2xl p-4 md:p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">{config.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{activeCase.name} · x₀ = {x0v.toFixed(2)} · h = {hh.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300 shrink-0">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" />P 点</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-300" />Q 点</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-400" />割线</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-400" />切线</span>
            </div>
          </div>

          <div className="relative rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden flex-1 min-h-[380px]">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
              {/* 网格 */}
              {[-2, -1, 0, 1, 2, 3, 4].filter((g) => g >= yMin && g <= yMax).map((gy) => (
                <line key={'gy' + gy} x1={sx(xMin)} y1={sy(gy)} x2={sx(xMax)} y2={sy(gy)} stroke="#1e293b" />
              ))}
              {[-2, -1, 0, 1, 2].filter((g) => g >= xMin && g <= xMax).map((gx) => (
                <line key={'gx' + gx} x1={sx(gx)} y1={sy(yMin)} x2={sx(gx)} y2={sy(yMax)} stroke="#1e293b" />
              ))}
              <g stroke="#475569" strokeWidth={1.4}>
                <line x1={sx(xMin)} y1={sy(0)} x2={sx(xMax)} y2={sy(0)} />
                <line x1={sx(xMin)} y1={sy(yMin)} x2={sx(xMin)} y2={sy(yMax)} />
              </g>

              {/* Δx / Δy 标注（虚线三角形） */}
              {step >= 2 && (
                <g stroke="#94a3b8" strokeWidth={1.1} strokeDasharray="5 4">
                  <line x1={sx(x0v + hh)} y1={sy(yP)} x2={sx(x0v)} y2={sy(yP)} />
                  <line x1={sx(x0v + hh)} y1={sy(yP)} x2={sx(x0v + hh)} y2={sy(yQ)} />
                </g>
              )}

              {/* 函数曲线 */}
              {curvePts.length > 0 && <path d={curvePts.join(' ')} fill="none" stroke="#60a5fa" strokeWidth={2.6} strokeLinecap="round" />}

              {/* 切线（粉色，step>=4） */}
              {step >= 4 && (
                <line x1={sx(x0v) - 1.2 * (sx(1) - sx(0))} y1={sy(yP - tangentSlope * 1.2)} x2={sx(x0v) + 1.2 * (sx(1) - sx(0))} y2={sy(yP + tangentSlope * 1.2)} stroke="#f472b6" strokeWidth={2.2} />
              )}

              {/* 割线（亮蓝，step>=2） */}
              {step >= 2 && (
                <line x1={sx(x0v)} y1={sy(yP)} x2={sx(x0v + hh)} y2={sy(yQ)} stroke="#38bdf8" strokeWidth={2.2} />
              )}

              {/* P 点 / Q 点 */}
              <g>
                <circle cx={sx(x0v)} cy={sy(yP)} r={6.5} fill="#60a5fa" stroke="#0f172a" strokeWidth={2} />
                <text x={sx(x0v) - 12} y={sy(yP) - 10} fontSize={13} fontWeight={700} fill="#93c5fd">P</text>
                {step >= 1 && (
                  <>
                    <circle cx={sx(x0v + hh)} cy={sy(yQ)} r={6} fill="#fbbf24" stroke="#0f172a" strokeWidth={2} />
                    <text x={sx(x0v + hh) + 6} y={sy(yQ) - 10} fontSize={13} fontWeight={700} fill="#fcd34d">Q</text>
                  </>
                )}
              </g>

              {/* Δx / Δy 文字 */}
              {step >= 2 && (
                <g fontSize={11} fill="#cbd5e1">
                  <text x={sx(x0v) + (sx(x0v + hh) - sx(x0v)) / 2 - 6} y={sy(yP) + 16}>Δx = h</text>
                  <text x={sx(x0v + hh) + 8} y={(sy(yP) + sy(yQ)) / 2 + 4}>Δy</text>
                </g>
              )}
            </svg>

            {/* 动态数据面板 */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 flex-wrap">
              {[
                { label: 'Δx = h', value: hh.toFixed(2) },
                { label: 'Δy', value: (yQ - yP).toFixed(3) },
                { label: '割线斜率', value: secantSlope.toFixed(3) },
                { label: '切线斜率 f′', value: tangentSlope.toFixed(3) },
              ].map((item) => (
                <div key={item.label} className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/50 backdrop-blur-sm">
                  <div className="text-[10px] text-slate-400">{item.label}</div>
                  <div className="text-xs font-semibold text-slate-100 font-mono">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 右：控制面板 */}
        <aside className="w-80 xl:w-96 shrink-0 hidden lg:flex flex-col gap-4 overflow-y-auto">
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-2">概念说明</h3>
            <p className="text-[13px] text-gray-600 leading-relaxed">{config.summary}</p>
          </section>

          <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-3">案例与参数</h3>
            <div className="flex rounded-xl bg-gray-100 p-1 mb-4">
              {config.cases.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setCaseId(c.id); setH(0.8); setX0(c.anchor ?? 0); setStep(4) }}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${c.id === caseId ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-medium text-gray-700">固定点 x₀</span>
                <span className="text-xs font-mono text-indigo-600 font-semibold">{x0v.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={Math.round((xMin + 0.3) * 10) / 10}
                max={Math.round((xMax - 0.3) * 10) / 10}
                step={0.1}
                value={x0v}
                onChange={(e) => setX0(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-medium text-gray-700">步长 h（h ≠ 0）</span>
                <span className="text-xs font-mono text-indigo-600 font-semibold">{hh.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={2}
                step={0.05}
                value={hh}
                onChange={(e) => setH(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-[11px] text-gray-400 mt-1">h 减小时，Q 沿曲线靠近 P，割线逼近切线</p>
            </div>
          </section>

          <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800">教学判断</h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${step >= 4 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {step >= 4 ? '趋近完成' : '进行中'}
              </span>
            </div>
            <div className={`flex items-start gap-2.5 px-3.5 py-3 rounded-xl border mb-3 ${diff < 0.15 ? 'bg-emerald-50/60 border-emerald-100' : 'bg-blue-50/60 border-blue-100'}`}>
              <svg className={`w-4 h-4 shrink-0 mt-0.5 ${diff < 0.15 ? 'text-emerald-500' : 'text-blue-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m5.2 2a9 9 0 1 1-2.6-6.4" />
              </svg>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                割线斜率 {secantSlope.toFixed(3)}，切线斜率 {tangentSlope.toFixed(3)}，差值 {diff.toFixed(3)}。
                {diff < 0.15 ? ' h 足够小时割线已趋近切线，差商趋近导数。' : ' 继续减小 h，割线将趋近切线。'}
              </p>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-center">
              <span className="text-sm font-semibold text-indigo-700">f′(x₀) = {tangentSlope.toFixed(3)}</span>
            </div>
          </section>
        </aside>
      </div>

      <PlayerBar
        steps={config.steps}
        step={step}
        playing={playing}
        onPrev={() => setStep((s) => Math.max(1, s - 1))}
        onNext={() => setStep((s) => Math.min(4, s + 1))}
        onTogglePlay={() => setPlaying((p) => !p)}
        onReset={() => { setPlaying(false); setStep(1); setH(0.8) }}
        stepDesc={config.steps[Math.min(step, 4) - 1]}
      />
    </div>
  )
}