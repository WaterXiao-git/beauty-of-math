// ε−δ 极限定义演示（需求 4.1）：配置来自统一接口 /api/knowledge/epsilon-delta
// 把「x 趋近 a 时 f(x) 趋近 L」转换为 ε 误差带 + δ 邻域，观察 ε 收紧时可行 δ 变化
import { useEffect, useMemo, useRef, useState } from 'react'
import { compile } from 'mathjs'
import DemoHeader from './DemoHeader'
import { useNavigate } from 'react-router-dom'
import PlayerBar from './PlayerBar'
import type { StepItem } from './PlayerBar'
import { usePanZoom } from './usePanZoom'
import GeoPoint from './geoboard/GeoPoint'
import { calcViewportGrid } from './viewport'
import ConceptCard from './ui/ConceptCard'
import SegmentedControl from './ui/SegmentedControl'
import SliderRow from './ui/SliderRow'
import SwitchRow from './ui/SwitchRow'
import ObserveTipCard from './ui/ObserveTipCard'
import StepStatusCard from './ui/StepStatusCard'

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

// 画布尺寸
const W = 720
const H = 400
const PAD_L = 62
const PAD_R = 40
const PAD_T = 44
const PAD_B = 52

/** 求函数值（mathjs 解析） */
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

/** 数值搜索可行 δ：找最大 δ 使 x∈[a−δ,a+δ]∩定义域 内 |f(x)−L|<ε（δ 不唯一） */
function feasibleDelta(f: (x: number) => number, a: number, L: number, eps: number, domain: [number, number]): number {
  if (!Number.isFinite(L)) return 0
  const ext = (domain[1] - domain[0]) * 0.5
  const hi = Math.max(0.1, Math.min(a - (domain[0] - ext), (domain[1] + ext) - a))
  if (hi <= 0) return 0
  const ok = (d: number): boolean => {
    const SAMPLES = 240
    for (let i = 0; i <= SAMPLES; i++) {
      const x = a - d + ((2 * d) / SAMPLES) * i
      const y = f(x)
      if (Number.isNaN(y) || Math.abs(y - L) >= eps) return false
    }
    return true
  }
  let lo = 0
  let hiBound = hi
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hiBound) / 2
    if (ok(mid)) lo = mid
    else hiBound = mid
  }
  return lo
}

export default function EpsilonDeltaDemo() {
  const navigate = useNavigate()
  const { transform, handlers } = usePanZoom()
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [config, setConfig] = useState<KnowledgeConfig | null>(null)
  const [loadError, setLoadError] = useState('')
  const [caseId, setCaseId] = useState('')
  const [epsilon, setEpsilon] = useState(0.6)
  /** 可拖拽 a 覆盖值（null 用案例预设 anchor） */
  const [aOverride, setAOverride] = useState<number | null>(null)
  /** 显示辅助线（ε 带 / δ 带） */
  const [showGuides, setShowGuides] = useState(true)
  /** 突出有效曲线段（δ 内满足条件的曲线高亮） */
  const [showBand, setShowBand] = useState(true)
  const [step, setStep] = useState(4)
  const [playing, setPlaying] = useState(false)

  // 加载统一接口配置
  useEffect(() => {
    fetch('/api/knowledge/epsilon-delta')
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

  // 播放：步进 1→4 循环
  useEffect(() => {
    if (!playing) return
    const timer = setInterval(() => setStep((s) => (s >= 4 ? 1 : s + 1)), 2000)
    return () => clearInterval(timer)
  }, [playing])

  const activeCase = useMemo(() => config?.cases.find((c) => c.id === caseId) ?? config?.cases[0], [config, caseId])

  const derived = useMemo(() => {
    if (!activeCase) return null
    const f = makeFn(activeCase.expr)
    const a = aOverride ?? activeCase.anchor ?? 1
    const L = f(a)
    const delta = feasibleDelta(f, a, L, epsilon, activeCase.domain)
    return { f, a, L, delta }
  }, [activeCase, epsilon, aOverride])

  if (loadError) {
    return (
      <div className="flex flex-col h-full bg-[#f5f7fa]">
        <DemoHeader breadcrumb={['高等数学（上册）', '函数、极限与连续', 'ε−δ 极限定义']} onBreadcrumbClick={() => navigate('/')} />
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
        <DemoHeader breadcrumb={['高等数学（上册）', '函数、极限与连续', 'ε−δ 极限定义']} onBreadcrumbClick={() => navigate('/')} />
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">配置加载中…</div>
      </div>
    )
  }

  const { f, a, L, delta } = derived
  const [dMin, dMax] = activeCase.domain
  const [yMin, yMax] = activeCase.yRange
  const sx = (x: number) => PAD_L + ((x - dMin) / (dMax - dMin)) * (W - PAD_L - PAD_R)
  const sy = (y: number) => H - PAD_B - ((y - yMin) / (yMax - yMin)) * (H - PAD_T - PAD_B)
  // 可视范围（曲线铺满视图 / 虚线与带贯穿全屏）
  const visMapMin = -transform.tx / transform.scale
  const visMapMax = (W - transform.tx) / transform.scale
  const visYMapMin = (H - transform.ty) / transform.scale
  const visYMapMax = -transform.ty / transform.scale
  const visWorldXMin = dMin + ((visMapMin - PAD_L) / (W - PAD_L - PAD_R)) * (dMax - dMin)
  const visWorldXMax = dMin + ((visMapMax - PAD_L) / (W - PAD_L - PAD_R)) * (dMax - dMin)
  const grid = calcViewportGrid(transform, W, H, [dMin, dMax], [yMin, yMax], PAD_L, PAD_R, PAD_T, PAD_B)
  const coord = {
    sx,
    sy,
    fromSx: (mx: number) => dMin + ((mx - PAD_L) / (W - PAD_L - PAD_R)) * (dMax - dMin),
    fromSy: (my: number) => yMin + ((H - PAD_B - my) / (H - PAD_T - PAD_B)) * (yMax - yMin),
  }

  // 曲线采样
  const curvePts: string[] = []
  const inBandPts: string[] = []
  const N = 160
  let curveStarted = false
  for (let i = 0; i <= N; i++) {
    const x = visWorldXMin + ((visWorldXMax - visWorldXMin) * i) / N
    const y = f(x)
    if (!Number.isFinite(y)) continue
    // 首个有效点用 M 起笔（避免定义域外 NaN 导致 path 以 L 开头而整条不显示）
    curvePts.push((curveStarted ? 'L' : 'M') + sx(x).toFixed(1) + ' ' + sy(y).toFixed(1))
    curveStarted = true
    if (showBand && step >= 4 && Math.abs(x - a) < delta) inBandPts.push((inBandPts.length === 0 ? 'M' : 'L') + sx(x).toFixed(1) + ' ' + sy(y).toFixed(1))
  }

  return (
    <div className="flex flex-col h-full bg-[#f5f7fa]">
      <DemoHeader breadcrumb={['高等数学（上册）', '函数、极限与连续', config.title]} onBreadcrumbClick={() => navigate('/')} />

      <div className="flex-1 min-h-0 flex gap-4 p-4 md:p-5">
        {/* 左：深色画板 */}
        <section className="flex-1 min-w-0 bg-slate-900 rounded-2xl p-4 md:p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">{config.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{activeCase.name} · a = {a.toFixed(2)} · L = {Number.isFinite(L) ? L.toFixed(2) : '—'}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300 shrink-0">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" />函数曲线</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-300/70" />ε 误差带</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-300/80" />δ 邻域</span>
            </div>
          </div>

          <div className="relative rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden flex-1 min-h-[380px]">
            <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-full cursor-grab active:cursor-grabbing" preserveAspectRatio="xMidYMid meet" {...handlers}>
          {/* 视口网格与坐标轴（无限延伸） */}
          {grid.verts.map((v, i) => (
            <line key={"v" + i} x1={v.pos} y1={0} x2={v.pos} y2={H} stroke={v.major ? "#334155" : "#1e293b"} strokeWidth={1} />
          ))}
          {grid.hors.map((h, i) => (
            <line key={"h" + i} x1={0} y1={h.pos} x2={W} y2={h.pos} stroke={h.major ? "#334155" : "#1e293b"} strokeWidth={1} />
          ))}
          {grid.axisX !== null ? <line x1={grid.axisX} y1={0} x2={grid.axisX} y2={H} stroke="#64748b" strokeWidth={1.5} /> : null}
          {grid.axisY !== null ? <line x1={0} y1={grid.axisY} x2={W} y2={grid.axisY} stroke="#64748b" strokeWidth={1.5} /> : null}
        <g transform={`translate(${transform.tx} ${transform.ty}) scale(${transform.scale})`}>
        
    
              {/* ε 误差带（L±ε 区域） */}
              {showGuides && step >= 2 && (
                <g>
                  <rect x={visMapMin} y={sy(L + epsilon)} width={visMapMax - visMapMin} height={sy(L - epsilon) - sy(L + epsilon)} fill="#38bdf8" opacity={0.12} />
                  <line x1={visMapMin} y1={sy(L + epsilon)} x2={visMapMax} y2={sy(L + epsilon)} stroke="#7dd3fc" strokeWidth={1.2} strokeDasharray="5 4" />
                  <line x1={visMapMin} y1={sy(L - epsilon)} x2={visMapMax} y2={sy(L - epsilon)} stroke="#7dd3fc" strokeWidth={1.2} strokeDasharray="5 4" />
                  <line x1={visMapMin} y1={sy(L)} x2={visMapMax} y2={sy(L)} stroke="#2563eb" strokeWidth={1.3} strokeDasharray="2 2" />
                </g>
              )}

              {/* δ 邻域（a±δ 竖带） */}
              {showGuides && step >= 3 && delta > 0 && (
                <g>
                  <rect x={sx(a - delta)} y={visYMapMin} width={sx(a + delta) - sx(a - delta)} height={visYMapMax - visYMapMin} fill="#fbbf24" opacity={0.1} />
                  <line x1={sx(a - delta)} y1={visYMapMin} x2={sx(a - delta)} y2={visYMapMax} stroke="#fcd34d" strokeWidth={1.2} strokeDasharray="5 4" />
                  <line x1={sx(a + delta)} y1={visYMapMin} x2={sx(a + delta)} y2={visYMapMax} stroke="#fcd34d" strokeWidth={1.2} strokeDasharray="5 4" />
                </g>
              )}

              {/* 函数曲线 */}
              {curvePts.length > 0 && <path d={curvePts.join(' ')} fill="none" stroke="#60a5fa" strokeWidth={2.6} strokeLinecap="round" />}
              {/* 验证步骤：δ 内曲线高亮绿色 */}
              {showBand && step >= 4 && inBandPts.length > 1 && (
                <path d={inBandPts.join(' ')} fill="none" stroke="#34d399" strokeWidth={3.2} strokeLinecap="round" />
              )}

              {/* 目标点 a：可沿曲线拖动（L / ε 带 / δ 邻域 / 可行 δ 联动） */}
              {step >= 1 && (
                <GeoPoint
                  label="a"
                  x={a}
                  y={L}
                  color="#2563eb"
                  constraint="curve"
                  curveY={f}
                  onMove={(wx) => setAOverride(Math.min(Math.max(wx, visWorldXMin + 0.1), visWorldXMax - 0.1))}
                  coord={coord}
                  transform={transform}
                  svgRef={svgRef}
                  labelDx={10}
                  labelDy={-10}
                />
              )}

              {/* 坐标刻度 */}
              <g fontSize={11} fill="#64748b">
                <text x={sx(a) - 3} y={sy(0) + 18} textAnchor="middle">a</text>
                <text x={sx(dMin) + 10} y={sy(L) - 6}>L</text>
                {showGuides && step >= 2 && <text x={sx(dMin) + 10} y={sy(L + epsilon) + 12} fontSize={10}>L+ε</text>}
                {showGuides && step >= 2 && <text x={sx(dMin) + 10} y={sy(L - epsilon) - 4} fontSize={10}>L−ε</text>}
              </g>
            </g>
        </svg>

            {/* 动态数据面板 */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 flex-wrap">
              {[
                { label: '趋近点', value: `a = ${a.toFixed(2)}` },
                { label: '极限值', value: Number.isFinite(L) ? `L = ${L.toFixed(2)}` : 'L = —' },
                { label: '误差 ε', value: epsilon.toFixed(2) },
                { label: '可行 δ', value: delta > 0 ? `≈ ${delta.toFixed(3)}` : '—' },
              ].map((item) => (
                <div key={item.label} className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/50 backdrop-blur-sm">
                  <div className="text-[10px] text-slate-400">{item.label}</div>
                  <div className="text-xs font-semibold text-slate-100 font-mono">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 右：控制面板（Card Stack：概念要点 / 实验控制 / 观察提示） */}
        <aside className="w-80 xl:w-96 shrink-0 hidden lg:flex flex-col gap-3 overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto">
          {/* 概念要点 */}
          <ConceptCard formula={'\\lim_{x \\to a} f(x) = L'}>
            {config.summary}
          </ConceptCard>

          {/* 实验控制 */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">实验控制</h3>
            <div className="mb-4">
              <SegmentedControl
                options={config.cases.map((c) => ({ id: c.id, label: c.name }))}
                value={caseId}
                onChange={(id) => { setCaseId(id); setEpsilon(0.6); setStep(4); setAOverride(null) }}
              />
            </div>
            <SliderRow
              label="挑战精度 ε"
              value={epsilon}
              min={0.05}
              max={0.8}
              step={0.05}
              onChange={setEpsilon}
              hint="ε 收紧时，可行 δ 会随之变小"
            />
            <div className="border-t border-gray-100 pt-1 mt-2">
              <SwitchRow label="显示辅助线" desc="ε 误差带与 δ 邻域虚线" checked={showGuides} onChange={setShowGuides} />
              <SwitchRow label="突出有效曲线段" desc="δ 邻域内满足条件的曲线高亮" checked={showBand} onChange={setShowBand} />
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-center mt-3">
              <span className="text-sm font-semibold text-purple-700">
                可行 δ ≈ {delta > 0 ? delta.toFixed(3) : '—'}{' '}
                <span className="text-[11px] font-normal text-purple-400">（δ 不唯一）</span>
              </span>
            </div>
          </section>

          {/* 观察提示 */}
          <ObserveTipCard
            tips={[
              { icon: '🎯', text: '拖动画布上的 a 点，或拖动背景平移 / 滚轮缩放，观察 L、ε 带与 δ 邻域联动。' },
              {
                icon: '🔍',
                text:
                  step >= 4
                    ? !Number.isFinite(L)
                      ? '当前 a 处函数无定义，请将目标点拖回函数定义域内。'
                      : delta > 0
                        ? `取 δ ≈ ${delta.toFixed(3)}，当 |x−a| < δ 时曲线全部落入 ε 带，定义成立。`
                        : '当前 ε 过小（超出采样精度），请适当增大 ε。'
                    : '推进步骤至「验证定义」，将检查 δ 邻域内曲线是否全部落入 ε 带。',
              },
              { icon: '⚠️', text: 'ε 越小可行 δ 越小——收紧 ε 试试，绿色高亮段会随之变窄。' },
            ]}
          />
          </div>
          <StepStatusCard stepDesc={config.steps[Math.min(step, 4) - 1]} />
        </aside>
      </div>

      <PlayerBar
        steps={config.steps}
        step={step}
        playing={playing}
        onPrev={() => setStep((s) => Math.max(1, s - 1))}
        onNext={() => setStep((s) => Math.min(4, s + 1))}
        onTogglePlay={() => setPlaying((p) => !p)}
        onReset={() => { setPlaying(false); setStep(1) }}
        stepDesc={config.steps[Math.min(step, 4) - 1]}
      />
    </div>
  )
}