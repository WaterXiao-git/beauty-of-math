// 导数的几何意义演示（需求 4.2）：配置来自统一接口 /api/knowledge/derivative
// 固定点 P + 移动点 Q，观察 h→0 时割线斜率趋近切线斜率（差商极限）
import { useEffect, useMemo, useRef, useState } from 'react'
import { compile, derivative as mathDerivative } from 'mathjs'
import DemoHeader from './DemoHeader'
import { useNavigate } from 'react-router-dom'
import PlayerBar from './PlayerBar'
import type { StepItem } from './PlayerBar'
import { usePanZoom } from './usePanZoom'
import GeoPoint from './geoboard/GeoPoint'
import GeoLine from './geoboard/GeoLine'
import { buildWorldMap, calcViewportGrid } from './viewport'
import ConceptCard from './ui/ConceptCard'
import SegmentedControl from './ui/SegmentedControl'
import SliderRow from './ui/SliderRow'
import SwitchRow from './ui/SwitchRow'
import ObserveTipCard from './ui/ObserveTipCard'
import GridTicks from './ui/GridTicks'
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
  const navigate = useNavigate()
  const { transform, handlers } = usePanZoom()
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [config, setConfig] = useState<KnowledgeConfig | null>(null)
  const [loadError, setLoadError] = useState('')
  const [caseId, setCaseId] = useState('')
  const [x0, setX0] = useState(0)
  const [h, setH] = useState(0.8)
  const [step, setStep] = useState(4)
  const [playing, setPlaying] = useState(false)
  /** 显示辅助线（Δx / Δy 虚线标注） */
  const [showAux, setShowAux] = useState(true)

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
    // 可视世界 x 范围（曲线与拖拽边界 = 屏幕边缘，Desmos 风格）
    const visXMin = xMin + ((-transform.tx / transform.scale - PAD_L) / (W - PAD_L - PAD_R)) * (xMax - xMin)
    const visXMax = xMin + (((W - transform.tx) / transform.scale - PAD_L) / (W - PAD_L - PAD_R)) * (xMax - xMin)
    const x0v = Math.min(Math.max(x0, visXMin + 0.1), visXMax - 0.1)
    const hh = Math.min(Math.max(0.05, h), Math.max(0.05, visXMax - x0v - 0.05))
    const yP = f(x0v)
    const yQ = f(x0v + hh)
    const secantSlope = (yQ - yP) / hh
    const tangentSlope = fp(x0v)
    return { f, fp, x0: x0v, h: hh, yP, yQ, secantSlope, tangentSlope, diff: Math.abs(secantSlope - tangentSlope) }
  }, [activeCase, x0, h, transform])

  if (loadError) {
    return (
      <div className="flex flex-col h-full bg-[#f5f7fa]">
        <DemoHeader breadcrumb={['高等数学（上册）', '导数与微分', '导数的几何意义']} onBreadcrumbClick={() => navigate('/')} />
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
        <DemoHeader breadcrumb={['高等数学（上册）', '导数与微分', '导数的几何意义']} onBreadcrumbClick={() => navigate('/')} />
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">配置加载中…</div>
      </div>
    )
  }

  const { f, x0: x0v, h: hh, yP, yQ, secantSlope, tangentSlope, diff } = derived
  const [xMin, xMax] = activeCase.domain
  const [yMin, yMax] = activeCase.yRange
  const map = buildWorldMap([xMin, xMax], [yMin, yMax], W, H, PAD_L, PAD_R, PAD_T, PAD_B)
  const sx = map.sx
  const sy = map.sy
  const coord = { sx, sy, fromSx: map.fromSx, fromSy: map.fromSy }
  const grid = calcViewportGrid(transform, W, H, [xMin, xMax], [yMin, yMax], PAD_L, PAD_R, PAD_T, PAD_B)

  // 曲线采样（可视世界范围，铺满视图；首个有效点 M 起笔）
  const visWorldXMin = map.fromSx(-transform.tx / transform.scale)
  const visWorldXMax = map.fromSx((W - transform.tx) / transform.scale)
  const curvePts: string[] = []
  const N = 160
  let curveStarted = false
  for (let i = 0; i <= N; i++) {
    const x = visWorldXMin + ((visWorldXMax - visWorldXMin) * i) / N
    const y = f(x)
    if (!Number.isFinite(y)) continue
    curvePts.push((curveStarted ? 'L' : 'M') + sx(x).toFixed(1) + ' ' + sy(y).toFixed(1))
    curveStarted = true
  }

    return (
    <div className="flex flex-col h-full bg-[#f5f7fa]">
      <DemoHeader breadcrumb={['高等数学（上册）', '导数与微分', config.title]} onBreadcrumbClick={() => navigate('/')} />

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
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full cursor-grab active:cursor-grabbing" preserveAspectRatio="xMidYMid meet" ref={svgRef} {...handlers}>
          {/* 视口网格与坐标轴（无限延伸） */}
          {grid.verts.map((v, i) => (
            <line key={"v" + i} x1={v.pos} y1={0} x2={v.pos} y2={H} stroke={v.major ? "#334155" : "#1e293b"} strokeWidth={1} />
          ))}
          {grid.hors.map((h, i) => (
            <line key={"h" + i} x1={0} y1={h.pos} x2={W} y2={h.pos} stroke={h.major ? "#334155" : "#1e293b"} strokeWidth={1} />
          ))}
          {grid.axisX !== null ? <line x1={grid.axisX} y1={0} x2={grid.axisX} y2={H} stroke="#64748b" strokeWidth={1.5} /> : null}
          {grid.axisY !== null ? <line x1={0} y1={grid.axisY} x2={W} y2={grid.axisY} stroke="#64748b" strokeWidth={1.5} /> : null}
          <GridTicks grid={grid} />
        <g transform={`translate(${transform.tx} ${transform.ty}) scale(${transform.scale})`}>
        
    
              {/* Δx / Δy 标注（虚线三角形） */}
              {showAux && step >= 2 && (
                <g stroke="#94a3b8" strokeWidth={1.1} strokeDasharray="5 4">
                  <line x1={sx(x0v + hh)} y1={sy(yP)} x2={sx(x0v)} y2={sy(yP)} />
                  <line x1={sx(x0v + hh)} y1={sy(yP)} x2={sx(x0v + hh)} y2={sy(yQ)} />
                </g>
              )}

              {/* 函数曲线 */}
              {curvePts.length > 0 && <path d={curvePts.join(' ')} fill="none" stroke="#60a5fa" strokeWidth={2.6} strokeLinecap="round" />}

              {/* 切线（粉色，贯穿可视区域，step>=4） */}
              {step >= 4 && (
                <GeoLine x1={x0v} y1={yP} x2={x0v + 1} y2={yP + tangentSlope} color="#f472b6" width={2.2} coord={coord} transform={transform} W={W} H={H} />
              )}

              {/* 割线（亮蓝，贯穿可视区域，step>=2） */}
              {step >= 2 && (
                <GeoLine x1={x0v} y1={yP} x2={x0v + hh} y2={yQ} color="#38bdf8" coord={coord} transform={transform} W={W} H={H} />
              )}

              {/* P 点 / Q 点（可沿曲线拖动，割线/切线/数值联动） */}
              <GeoPoint
                label="P" x={x0v} y={yP} color="#60a5fa"
                constraint="curve" curveY={f}
                onMove={(wx) => setX0(wx)}
                coord={coord} transform={transform} svgRef={svgRef} labelDx={-12}
              />
              {step >= 1 && (
                <GeoPoint
                  label="Q" x={x0v + hh} y={yQ} color="#fbbf24"
                  constraint="curve" curveY={f}
                  onMove={(wx) => setH(wx - x0v)}
                  coord={coord} transform={transform} svgRef={svgRef}
                />
              )}

              {/* Δx / Δy 文字 */}
              {showAux && step >= 2 && (
                <g fontSize={11} fill="#cbd5e1">
                  <text x={sx(x0v) + (sx(x0v + hh) - sx(x0v)) / 2 - 6} y={sy(yP) + 16}>Δx = h</text>
                  <text x={sx(x0v + hh) + 8} y={(sy(yP) + sy(yQ)) / 2 + 4}>Δy</text>
                </g>
              )}
            </g>
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

        {/* 右：控制面板（Card Stack：概念要点 / 实验控制 / 观察提示） */}
        <aside className="w-80 xl:w-96 shrink-0 hidden lg:flex flex-col gap-4 overflow-y-auto [&>*]:shrink-0">
          {/* 概念要点 */}
          <ConceptCard formula={"f'(x_0) = \\lim_{h \\to 0} \\frac{f(x_0+h)-f(x_0)}{h}"}>
            {config.summary}
          </ConceptCard>

          {/* 实验控制 */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">实验控制</h3>
            <div className="mb-4">
              <SegmentedControl
                options={config.cases.map((c) => ({ id: c.id, label: c.name }))}
                value={caseId}
                onChange={(id) => { setCaseId(id); setH(0.8); setX0(activeCase?.anchor ?? 0); setStep(4) }}
              />
            </div>
            <SliderRow
              label="固定点 x₀"
              value={x0v}
              min={Math.round((xMin + 0.3) * 10) / 10}
              max={Math.round((xMax - 0.3) * 10) / 10}
              step={0.1}
              onChange={setX0}
            />
            <SliderRow
              label="步长 h（h ≠ 0）"
              value={hh}
              min={0.05}
              max={2}
              step={0.05}
              onChange={setH}
              hint="h 减小时，Q 沿曲线靠近 P，割线逼近切线"
            />
            <div className="border-t border-gray-100 pt-1 mt-1">
              <SwitchRow label="显示辅助线" desc="Δx / Δy 虚线标注" checked={showAux} onChange={setShowAux} />
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-center mt-3">
              <span className="text-sm font-semibold text-purple-700">f′(x₀) = {tangentSlope.toFixed(3)}</span>
            </div>
          </section>

          {/* 观察提示 */}
          <ObserveTipCard
            tips={[
              { icon: '🎯', text: '拖动 P 点（改 x₀）或 Q 点（改 h），观察割线逼近切线。' },
              {
                icon: '🔍',
                text:
                  `割线斜率 ${secantSlope.toFixed(3)}，切线斜率 ${tangentSlope.toFixed(3)}，差值 ${diff.toFixed(3)}。` +
                  (diff < 0.15 ? ' h 足够小时割线已趋近切线，差商趋近导数。' : ' 继续减小 h，割线将趋近切线。'),
              },
              { icon: '⚠️', text: 'h 越小割线越接近切线——点「播放」让 h 自动递减，观察极限过程。' },
            ]}
          />
        </aside>
      </div>

      {/* 底部行：播放条 + 当前步骤卡（同一高度） */}
      <div className="flex h-20 shrink-0 gap-4 px-4 md:px-5">
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
        <StepStatusCard stepDesc={config.steps[Math.min(step, 4) - 1]} />
      </div>
    </div>
  )
}