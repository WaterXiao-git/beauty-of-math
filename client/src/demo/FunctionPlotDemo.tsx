// 一次函数图像演示（function-plot 模板试点）：配置来自统一接口 /api/knowledge/function-plot
// 参数化表达式 y = k*x + b；k/b 由滑块或拖拽截距点（y 截距点改 b / x 截距点改斜率）控制
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
  /** 参数化表达式的默认参数（k/b） */
  params?: { k: number; b: number }
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

/** 参数化函数求值：y = expr({ x, ...params }) */
function makeParamFn(expr: string, params: Record<string, number>) {
  const compiled = compile(expr)
  return (x: number): number => {
    try {
      const v = compiled.evaluate({ x, ...params })
      return Number.isFinite(v) ? v : NaN
    } catch {
      return NaN
    }
  }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)

export default function FunctionPlotDemo() {
  const navigate = useNavigate()
  const { transform, handlers } = usePanZoom()
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [config, setConfig] = useState<KnowledgeConfig | null>(null)
  const [loadError, setLoadError] = useState('')
  const [caseId, setCaseId] = useState('')
  const [k, setK] = useState(1)
  const [b, setB] = useState(0)
  const [step, setStep] = useState(4)
  const [playing, setPlaying] = useState(false)
  /** 显示斜率三角形（Δx=1, Δy=k） */
  const [showTri, setShowTri] = useState(true)

  // 加载统一接口配置
  useEffect(() => {
    fetch('/api/knowledge/function-plot')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((cfg: KnowledgeConfig) => {
        setConfig(cfg)
        setCaseId(cfg.defaultCase)
        const def = cfg.cases.find((c) => c.id === cfg.defaultCase) ?? cfg.cases[0]
        setK(def?.params?.k ?? 1)
        setB(def?.params?.b ?? 0)
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
    const params = { k, b }
    const f = makeParamFn(activeCase.expr, params)
    const xMin = activeCase.domain[0]
    const xMax = activeCase.domain[1]
    const yMin = activeCase.yRange[0]
    const yMax = activeCase.yRange[1]
    const yIntercept = b
    const xIntercept = k === 0 ? null : -b / k
    const trend = k > 0 ? '单调递增' : k < 0 ? '单调递减' : '常函数'
    return { f, xMin, xMax, yMin, yMax, yIntercept, xIntercept, trend }
  }, [activeCase, k, b])

  if (loadError) {
    return (
      <div className="flex flex-col h-full bg-[#f5f7fa]">
        <DemoHeader breadcrumb={['高等数学（上册）', '函数与极限', '一次函数图像']} onBreadcrumbClick={() => navigate('/')} />
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
        <DemoHeader breadcrumb={['高等数学（上册）', '函数与极限', '一次函数图像']} onBreadcrumbClick={() => navigate('/')} />
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">配置加载中…</div>
      </div>
    )
  }

  const { f, xMin, xMax, yMin, yMax, xIntercept, trend } = derived
  const sx = (x: number) => PAD_L + ((x - xMin) / (xMax - xMin)) * (W - PAD_L - PAD_R)
  const sy = (y: number) => H - PAD_B - ((y - yMin) / (yMax - yMin)) * (H - PAD_T - PAD_B)
  const coord = {
    sx,
    sy,
    fromSx: (mx: number) => xMin + ((mx - PAD_L) / (W - PAD_L - PAD_R)) * (xMax - xMin),
    fromSy: (my: number) => yMin + ((H - PAD_B - my) / (H - PAD_T - PAD_B)) * (yMax - yMin),
  }
  const grid = calcViewportGrid(transform, W, H, [xMin, xMax], [yMin, yMax], PAD_L, PAD_R, PAD_T, PAD_B)

  // 曲线采样（可视世界范围，铺满视图）
  const visWorldXMin = xMin + ((-transform.tx / transform.scale - PAD_L) / (W - PAD_L - PAD_R)) * (xMax - xMin)
  const visWorldXMax = xMin + (((W - transform.tx) / transform.scale - PAD_L) / (W - PAD_L - PAD_R)) * (xMax - xMin)
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
      <DemoHeader breadcrumb={['高等数学（上册）', '函数与极限', config.title]} onBreadcrumbClick={() => navigate('/')} />

      <div className="flex-1 min-h-0 flex gap-4 p-4 md:p-5">
        {/* 左：深色画板 */}
        <section className="flex-1 min-w-0 bg-slate-900 rounded-2xl p-4 md:p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">{config.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{activeCase.name} · y = {k.toFixed(2)}x {b >= 0 ? '+' : '−'} {Math.abs(b).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300 shrink-0">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" />直线</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-300" />x 截距</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />y 截距</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-400" />斜率三角形</span>
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
                {/* 斜率三角形（Δx=1, Δy=k） */}
                {showTri && step >= 3 && (
                  <g>
                    <polygon
                      points={`${sx(0)},${sy(b)} ${sx(1)},${sy(b)} ${sx(1)},${sy(b + k)}`}
                      fill="#a78bfa" opacity={0.15} stroke="#a78bfa" strokeWidth={1}
                    />
                    <text x={(sx(0) + sx(1)) / 2} y={sy(b) + 16} fontSize={10} fill="#c4b5fd" textAnchor="middle">Δx=1</text>
                    <text x={sx(1) + 6} y={(sy(b) + sy(b + k)) / 2} fontSize={10} fill="#c4b5fd">Δy=k</text>
                  </g>
                )}

                {/* 函数直线 */}
                {curvePts.length > 0 && <path d={curvePts.join(' ')} fill="none" stroke="#60a5fa" strokeWidth={2.6} strokeLinecap="round" />}

                {/* y 截距点 (0, b)：沿 y 轴拖动改 b */}
                {step >= 2 && (
                  <GeoPoint
                    label="B" x={0} y={b} color="#34d399"
                    constraint="yAxis"
                    onMove={(_wx, wy) => setB(clamp(wy, yMin + 0.2, yMax - 0.2))}
                    coord={coord} transform={transform} svgRef={svgRef} labelDx={8} labelDy={-10}
                  />
                )}

                {/* x 截距点 (−b/k, 0)：沿 x 轴拖动改斜率 k（b≠0 且 k≠0 时） */}
                {step >= 2 && xIntercept !== null && Math.abs(b) > 0.05 && (
                  <GeoPoint
                    label="X" x={xIntercept} y={0} color="#fbbf24"
                    constraint="xAxis"
                    onMove={(wx) => {
                      if (Math.abs(wx) > 0.05) setK(clamp(-b / wx, -5, 5))
                    }}
                    coord={coord} transform={transform} svgRef={svgRef} labelDx={-14} labelDy={14}
                  />
                )}

                {/* 坐标刻度标签 */}
                <g fontSize={11} fill="#64748b">
                  <text x={sx(0) - 8} y={sy(0) - 8} textAnchor="middle">0</text>
                  <text x={sx(1) + 4} y={sy(0) - 8} textAnchor="middle">1</text>
                  {xIntercept !== null && Math.abs(b) > 0.05 && (
                    <text x={sx(xIntercept)} y={sy(0) + 18} textAnchor="middle">x₀</text>
                  )}
                  <text x={sx(0) - 26} y={sy(b) + 4} textAnchor="middle">b</text>
                </g>
              </g>
            </svg>

            {/* 动态数据面板 */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 flex-wrap">
              {[
                { label: '斜率 k', value: k.toFixed(2) },
                { label: 'y 截距 b', value: b.toFixed(2) },
                { label: 'x 截距', value: xIntercept !== null ? xIntercept.toFixed(2) : '不存在' },
                { label: '单调性', value: trend },
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
        <aside className="w-80 xl:w-96 shrink-0 hidden lg:flex flex-col gap-4 overflow-y-auto">
          {/* 概念要点 */}
          <ConceptCard formula={"y = kx + b"}>
            {config.summary}
          </ConceptCard>

          {/* 实验控制 */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">实验控制</h3>
            <div className="mb-4">
              <SegmentedControl
                options={config.cases.map((c) => ({ id: c.id, label: c.name }))}
                value={caseId}
                onChange={(id) => {
                  const next = config.cases.find((c) => c.id === id)
                  setCaseId(id)
                  setK(next?.params?.k ?? 1)
                  setB(next?.params?.b ?? 0)
                  setStep(4)
                }}
              />
            </div>

            <SliderRow
              label="斜率 k"
              value={k}
              min={-4}
              max={4}
              step={0.1}
              onChange={setK}
              hint="k 为正上升 · k 为负下降 · |k| 越大越陡"
            />

            <SliderRow
              label="截距 b"
              value={b}
              min={-4}
              max={4}
              step={0.1}
              onChange={setB}
              hint="直线与 y 轴交点 (0, b)"
            />
            <div className="border-t border-gray-100 pt-1 mt-1">
              <SwitchRow label="显示斜率三角形" desc="Δx=1, Δy=k 的直角三角形" checked={showTri} onChange={setShowTri} />
            </div>
          </section>

          {/* 观察提示 */}
          <ObserveTipCard
            tips={[
              {
                icon: '📈',
                text:
                  k === 0
                    ? `k=0：y = ${b.toFixed(1)} 为水平直线，与 x 轴无交点。`
                    : `斜率 ${k.toFixed(2)}（${trend}），y 截距 (0, ${b.toFixed(1)})，x 截距 (${xIntercept?.toFixed(2)}, 0)。`,
              },
              { icon: '🖱️', text: '拖 y 截距点改 b，拖 x 截距点改斜率；或拖动背景平移 / 滚轮缩放。' },
              { icon: '🎯', text: 'x 截距 = −b/k：拖动 x 截距点可直观验证该关系。' },
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
          onReset={() => { setPlaying(false); setStep(1) }}
          stepDesc={config.steps[Math.min(step, 4) - 1]}
        />
        <StepStatusCard stepDesc={config.steps[Math.min(step, 4) - 1]} />
      </div>
    </div>
  )
}
