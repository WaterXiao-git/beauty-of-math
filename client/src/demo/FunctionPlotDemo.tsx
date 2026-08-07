// 参数化函数画布演示（function-plot 模板）：配置来自统一接口 /api/knowledge/:id
// 支持形状：linear(y=kx+b 截距点/斜率三角形可拖) / quadratic(顶点/对称轴/根) / absolute(顶点/零点)
// 参数滑块由 case.params 自动生成（范围来自 paramRanges）
import { useEffect, useMemo, useRef, useState } from 'react'
import { compile } from 'mathjs'
import DemoHeader from './DemoHeader'
import { useNavigate, useParams } from 'react-router-dom'
import PlayerBar from './PlayerBar'
import type { StepItem } from './PlayerBar'
import { usePanZoom } from './usePanZoom'
import GeoPoint from './geoboard/GeoPoint'
import { buildWorldMap, calcViewportGrid, refineCurve } from './viewport'
import ConceptCard from './ui/ConceptCard'
import SegmentedControl from './ui/SegmentedControl'
import SliderRow from './ui/SliderRow'
import SwitchRow from './ui/SwitchRow'
import ObserveTipCard from './ui/ObserveTipCard'
import GridTicks from './ui/GridTicks'
import StepStatusCard from './ui/StepStatusCard'

type Shape = 'linear' | 'quadratic' | 'absolute' | 'exp-log' | 'rational' | 'inverse-pair' | 'piecewise' | 'composite'

interface ParamRange {
  label?: string
  min: number
  max: number
  step: number
}

interface DemoCase {
  id: string
  name: string
  expr: string
  /** 第二条曲线表达式（参数化，如对数 log(x, base)） */
  expr2?: string
  /** 分段函数定义（shape=piecewise；每段表达式与区间，参数化） */
  pieces?: { expr: string; from?: number | null; to?: number | null }[]
  /** 概念要点公式（KaTeX） */
  formula?: string
  /** 画布图例 */
  legend?: { color: string; label: string }[]
  /** 数据面板项（expr 用 mathjs 基于 params 求值；text 静态文本） */
  dataItems?: { label: string; expr?: string; text?: string }[]
  /** 观察提示（text 支持 {参数名} 插值） */
  tips?: { icon?: string; text: string }[]
  domain: [number, number]
  yRange: [number, number]
  params?: Record<string, number>
  paramRanges?: Record<string, ParamRange>
  shape?: Shape
  markers?: {
    xIntercept?: boolean
    yIntercept?: boolean
    slopeTriangle?: boolean
    vertex?: boolean
    axis?: boolean
    roots?: boolean
  }
  anchor?: number | null
  desc?: string
}
interface KnowledgeConfig {
  id: string
  title: string
  summary: string
  /** 概念要点公式（KaTeX，case 未指定时用） */
  formula?: string
  /** 画布图例 */
  legend?: { color: string; label: string }[]
  /** 数据面板项（expr 用 mathjs 基于 params 求值；text 静态，支持 {参数名} 插值） */
  dataItems?: { label: string; expr?: string; text?: string }[]
  /** 观察提示（text 支持 {参数名} 插值） */
  tips?: { icon?: string; text: string }[]
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
  const { pointId = 'function-plot' } = useParams()
  const { transform, handlers } = usePanZoom()
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [config, setConfig] = useState<KnowledgeConfig | null>(null)
  const [loadError, setLoadError] = useState('')
  const [caseId, setCaseId] = useState('')
  const [params, setParams] = useState<Record<string, number>>({})
  const [showTri, setShowTri] = useState(true)
  const [step, setStep] = useState(4)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    fetch('/api/knowledge/' + pointId)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((cfg: KnowledgeConfig) => {
        setConfig(cfg)
        setCaseId(cfg.defaultCase)
        const def = cfg.cases.find((c) => c.id === cfg.defaultCase) ?? cfg.cases[0]
        setParams(def?.params ?? {})
      })
      .catch((e) => setLoadError(String(e)))
  }, [pointId])

  useEffect(() => {
    if (!playing) return
    const timer = setInterval(() => setStep((s) => (s >= 4 ? 1 : s + 1)), 2000)
    return () => clearInterval(timer)
  }, [playing])

  const activeCase = useMemo(() => config?.cases.find((c) => c.id === caseId) ?? config?.cases[0], [config, caseId])

  const derived = useMemo(() => {
    if (!activeCase) return null
    const f = makeParamFn(activeCase.expr, params)
    const f2 = activeCase.expr2 ? makeParamFn(activeCase.expr2, params) : null
    const xMin = activeCase.domain[0]
    const xMax = activeCase.domain[1]
    const yMin = activeCase.yRange[0]
    const yMax = activeCase.yRange[1]
    const shape = activeCase.shape ?? 'linear'
    const p = params
    // 线性
    const slope = shape === 'linear' ? (p.k ?? 1) : NaN
    const yIntercept = p.b ?? p.c ?? 0
    const xIntercept =
      shape === 'linear'
        ? slope === 0
          ? null
          : -yIntercept / slope
        : shape === 'quadratic'
          ? null // 二次的根单独算
          : null
    // 二次
    const a = p.a ?? NaN
    const b = p.b ?? NaN
    const c = p.c ?? NaN
    const vertexX = shape === 'quadratic' && a !== 0 ? -b / (2 * a) : NaN
    const vertexY = Number.isFinite(vertexX) ? f(vertexX) : NaN
    const delta = shape === 'quadratic' ? b * b - 4 * a * c : NaN
    const roots =
      shape === 'quadratic' && Number.isFinite(delta)
        ? delta < 0
          ? []
          : delta === 0
            ? [-b / (2 * a)]
            : [(-b - Math.sqrt(delta)) / (2 * a), (-b + Math.sqrt(delta)) / (2 * a)]
        : shape === 'absolute'
          ? (() => {
              const aa = p.a ?? 1
              const h = p.h ?? 0
              const k = p.k ?? 0
              const r = -k / aa
              if (!Number.isFinite(r) || r < 0) return []
              return [h - r, h + r]
            })()
          : []
    const trend = shape === 'linear' ? (slope > 0 ? '单调递增' : slope < 0 ? '单调递减' : '常函数') : ''
    const openUp = shape === 'quadratic' && a > 0
    return { f, f2, xMin, xMax, yMin, yMax, shape, slope, yIntercept, xIntercept, vertexX, vertexY, delta, roots, trend, openUp, a, b, c }
  }, [activeCase, params])

  if (loadError) {
    return (
      <div className="flex flex-col h-full bg-[#f5f7fa]">
        <DemoHeader breadcrumb={['高等数学（上册）', '函数与极限', '函数图像']} onBreadcrumbClick={() => navigate('/')} />
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
        <DemoHeader breadcrumb={['高等数学（上册）', '函数与极限', '函数图像']} onBreadcrumbClick={() => navigate('/')} />
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">配置加载中…</div>
      </div>
    )
  }

  const { f, f2, xMin, xMax, yMin, yMax, shape, slope, yIntercept, xIntercept, vertexX, vertexY, delta, roots, trend, openUp } = derived
  const markers = activeCase.markers ?? {}
  const map = buildWorldMap([xMin, xMax], [yMin, yMax], W, H, PAD_L, PAD_R, PAD_T, PAD_B)
  const sx = map.sx
  const sy = map.sy
  const coord = { sx, sy, fromSx: map.fromSx, fromSy: map.fromSy }
  const grid = calcViewportGrid(transform, W, H, [xMin, xMax], [yMin, yMax], PAD_L, PAD_R, PAD_T, PAD_B)

  // 曲线采样（可视世界范围）
  const visMapMin = -transform.tx / transform.scale
  const visMapMax = (W - transform.tx) / transform.scale
  const visYMapMin = (H - transform.ty) / transform.scale
  const visYMapMax = -transform.ty / transform.scale
  const visWorldXMin = map.fromSx(visMapMin)
  const visWorldXMax = map.fromSx(visMapMax)
  const yLimit = Math.max(Math.abs(yMin), Math.abs(yMax)) * 40 + 100
  const rationalH = shape === 'rational' ? (params.h ?? 0) : null
  // 分段函数：按 pieces 逐段采样（段间断开）；否则整体采样
  const segments: { fn: (x: number) => number; from: number; to: number }[] = activeCase.pieces && shape === 'piecewise'
    ? activeCase.pieces.map((p) => ({ fn: makeParamFn(p.expr, params), from: p.from ?? visWorldXMin, to: p.to ?? visWorldXMax }))
    : [{ fn: f, from: visWorldXMin, to: visWorldXMax }]
  // 曲线采样：均匀采样 + 曲率自适应细分（Desmos 式，弯曲处加密）
  const N = 300
  const refineTol = (yMax - yMin) / 300
  const curvePts: string[] = []
  let curveStarted = false
  for (const seg of segments) {
    const segPts: { x: number; y: number }[] = []
    let prevX: number | null = null
    const flushSeg = () => {
      if (segPts.length === 0) return
      const refined = refineCurve(segPts, seg.fn, refineTol)
      for (const p of refined) {
        curvePts.push((curveStarted ? 'L' : 'M') + sx(p.x).toFixed(1) + ' ' + sy(p.y).toFixed(1))
        curveStarted = true
      }
      segPts.length = 0
    }
    for (let i = 0; i <= N; i++) {
      const x = seg.from + ((seg.to - seg.from) * i) / N
      if (rationalH !== null && prevX !== null && (prevX - rationalH) * (x - rationalH) < 0) {
        flushSeg() // 跨垂直渐近线，断开
      }
      const y = seg.fn(x)
      if (!Number.isFinite(y) || Math.abs(y) > yLimit) {
        flushSeg() // 无定义/超限点，断开（避免正负无穷连线）
        continue
      }
      prevX = x
      segPts.push({ x, y })
    }
    flushSeg()
  }
  const curvePts2: string[] = []
  if (f2) {
    const pts2: { x: number; y: number }[] = []
    for (let i = 0; i <= N; i++) {
      const x = visWorldXMin + ((visWorldXMax - visWorldXMin) * i) / N
      const y = f2(x)
      if (!Number.isFinite(y) || Math.abs(y) > yLimit) continue
      pts2.push({ x, y })
    }
    if (pts2.length > 0) {
      const refined2 = refineCurve(pts2, f2, refineTol)
      let started = false
      for (const p of refined2) {
        curvePts2.push((started ? 'L' : 'M') + sx(p.x).toFixed(1) + ' ' + sy(p.y).toFixed(1))
        started = true
      }
    }
  }

  const setParam = (key: string, value: number) => setParams((prev) => ({ ...prev, [key]: value }))

  // 数据面板项：dataItems 配置优先（expr 基于 params 求值 / text 静态），否则按 shape 兜底
  const panelItems: { label: string; value: string }[] = []
  if (config.dataItems && config.dataItems.length > 0) {
    for (const it of config.dataItems) {
      let value = it.text ?? '—'
      if (it.expr) {
        try {
          const v = compile(it.expr).evaluate(params)
          value = Number.isFinite(v) ? (Number.isInteger(v) ? String(v) : v.toFixed(2)) : '—'
        } catch {
          value = '—'
        }
      }
      panelItems.push({ label: it.label, value })
    }
  } else if (shape === 'linear') {
    panelItems.push(
      { label: '斜率 k', value: slope.toFixed(2) },
      { label: 'y 截距', value: yIntercept.toFixed(2) },
      { label: 'x 截距', value: xIntercept !== null ? xIntercept.toFixed(2) : '不存在' },
      { label: '单调性', value: trend },
    )
  } else if (shape === 'quadratic') {
    panelItems.push(
      { label: '开口', value: Number.isFinite(openUp) ? (openUp ? '向上' : '向下') : '—' },
      { label: '顶点', value: Number.isFinite(vertexY) ? `(${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})` : '—' },
      { label: '判别式 Δ', value: Number.isFinite(delta) ? delta.toFixed(2) : '—' },
      { label: '实根', value: roots.length > 0 ? roots.map((r) => r.toFixed(2)).join('、') : '无' },
    )
  } else if (shape === 'absolute') {
    panelItems.push(
      { label: '顶点', value: `(${(params.h ?? 0).toFixed(2)}, ${(params.k ?? 0).toFixed(2)})` },
      { label: '开口', value: (params.a ?? 1) > 0 ? '向上' : '向下' },
      { label: '零点', value: roots.length > 0 ? roots.map((r) => r.toFixed(2)).join('、') : '无' },
      { label: '陡缓', value: `|a| = ${Math.abs(params.a ?? 1).toFixed(2)}` },
    )
  } else if (shape === 'exp-log') {
    const base = params.base ?? 2
    panelItems.push(
      { label: '底数 a', value: base.toFixed(2) },
      { label: '指数 aˣ', value: base > 1 ? '递增' : base < 1 ? '递减' : '常数' },
      { label: '对数 logₐx', value: base > 1 ? '递增' : base < 1 ? '递减' : '—' },
      { label: '关系', value: '互为反函数' },
    )
  } else if (shape === 'rational') {
    panelItems.push(
      { label: '垂直渐近线', value: `x = ${(params.h ?? 0).toFixed(2)}` },
      { label: '水平渐近线', value: `y = ${(params.k ?? 0).toFixed(2)}` },
      { label: '定义域', value: `x ≠ ${(params.h ?? 0).toFixed(2)}` },
      { label: '系数 a', value: (params.a ?? 1).toFixed(2) },
    )
  } else if (shape === 'inverse-pair') {
    panelItems.push(
      { label: '函数', value: activeCase.name.split(' 与 ')[0] },
      { label: '反函数', value: activeCase.name.split(' 与 ')[1] ?? '—' },
      { label: '关系', value: '关于 y=x 对称' },
      { label: '复合', value: 'f(f⁻¹(x)) = x' },
    )
  } else if (shape === 'piecewise') {
    panelItems.push(
      { label: '分段数', value: String(activeCase.pieces?.length ?? 1) },
      { label: '定义域', value: '[' + xMin.toFixed(1) + ', ' + xMax.toFixed(1) + ']' },
      { label: '类型', value: '分段函数' },
    )
  } else if (shape === 'composite') {
    panelItems.push(
      { label: '表达式', value: activeCase.name },
      { label: '结构', value: 'y = f(g(x))' },
      { label: '求值', value: '先内层 g 后外层 f' },
    )
  }

  // 观察提示：tips 配置优先（{参数名} 插值），否则 shape 兜底
  const observeTips = config.tips && config.tips.length > 0
    ? config.tips.map((t) => ({
        icon: t.icon ?? '✨',
        text: t.text.replace(/\{(\w+)\}/g, (_m: string, key: string) => (params[key] ?? 0).toFixed(2)),
      }))
    : []

  // 教学判断文案
  const judgmentText =
    shape === 'linear'
      ? slope === 0
        ? `k=0：y = ${yIntercept.toFixed(1)} 为水平直线，与 x 轴无交点。`
        : `斜率 ${slope.toFixed(2)}（${trend}），y 截距 (0, ${yIntercept.toFixed(1)})，x 截距 (${xIntercept?.toFixed(2)}, 0)。`
      : shape === 'quadratic'
        ? Number.isFinite(vertexY)
          ? `顶点 (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})，开口${openUp ? '向上' : '向下'}，Δ = ${delta.toFixed(2)}（${delta > 0 ? '两实根' : delta === 0 ? '重根' : '无实根'}）。`
          : 'a = 0 时退化为直线，请调整 a。'
        : shape === 'exp-log'
          ? `底数 a = ${(params.base ?? 2).toFixed(2)}（${(params.base ?? 2) > 1 ? 'a>1 两函数递增' : '0<a<1 两函数递减'}），指数与对数互为反函数，图像关于 y=x 对称。`
          : shape === 'rational'
            ? `中心 (${(params.h ?? 0).toFixed(2)}, ${(params.k ?? 0).toFixed(2)})，渐近线 x = ${(params.h ?? 0).toFixed(2)}、y = ${(params.k ?? 0).toFixed(2)}，图像为双曲线。`
            : shape === 'inverse-pair'
              ? '函数与反函数图像关于直线 y=x 对称，且 f(f⁻¹(x)) = x。'
              : shape === 'piecewise'
                ? '分段函数在各段内分别定义，需关注分段点处的取值与连续性（左右极限是否相等）。'
                : shape === 'composite'
                  ? '复合函数 y = f(g(x))：先计算内层 g(x)，再代入外层 f(u)，注意 g(x) 需落在外层定义域内。'
                  : `顶点 (${(params.h ?? 0).toFixed(2)}, ${(params.k ?? 0).toFixed(2)})，a = ${(params.a ?? 1).toFixed(2)}（${(params.a ?? 1) > 0 ? '开口向上' : '开口向下'}）。`

  return (
    <div className="flex flex-col h-full bg-[#f5f7fa]">
      <DemoHeader breadcrumb={['高等数学（上册）', '函数与极限', config.title]} onBreadcrumbClick={() => navigate('/')} />

      <div className="flex-1 min-h-0 flex gap-4 p-4 md:p-5">
        {/* 左：深色画板 */}
        <section className="flex-1 min-w-0 bg-slate-900 rounded-2xl p-4 md:p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">{config.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{activeCase.name} · {Object.entries(params).map(([k, v]) => `${k} = ${v.toFixed(2)}`).join(' · ')}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300 shrink-0">
              {config.legend && config.legend.length > 0 ? (
                config.legend.map((l, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                    {l.label}
                  </span>
                ))
              ) : (
                <>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" />曲线</span>
              {shape === 'quadratic' && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400" />顶点</span>}
              {shape === 'quadratic' && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />根</span>}
              {shape === 'absolute' && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-300" />顶点/零点</span>}
              {shape === 'linear' && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-400" />斜率三角形</span>}
              {shape === 'exp-log' && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400" />指数 aˣ</span>}
              {shape === 'exp-log' && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-400" />对数 logₐx</span>}
              {shape === 'rational' && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" />曲线</span>}
              {shape === 'rational' && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400" />渐近线</span>}
              {shape === 'inverse-pair' && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400" />函数 f</span>}
              {shape === 'inverse-pair' && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-400" />反函数 f⁻¹</span>}
                </>
              )}
            </div>
          </div>

          <div className="relative rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden flex-1 min-h-[380px]">
            <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-full cursor-grab active:cursor-grabbing" preserveAspectRatio="xMidYMid meet" {...handlers}>
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
                {/* 二次：对称轴虚线 */}
                {shape === 'quadratic' && markers.axis && Number.isFinite(vertexX) && (
                  <line x1={sx(vertexX)} y1={visYMapMin} x2={sx(vertexX)} y2={visYMapMax} stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="6 4" />
                )}
                {/* 线性：斜率三角形 */}
                {shape === 'linear' && markers.slopeTriangle && showTri && step >= 3 && (
                  <g>
                    <polygon
                      points={`${sx(0)},${sy(yIntercept)} ${sx(1)},${sy(yIntercept)} ${sx(1)},${sy(yIntercept + slope)}`}
                      fill="#a78bfa" opacity={0.15} stroke="#a78bfa" strokeWidth={1}
                    />
                    <text x={(sx(0) + sx(1)) / 2} y={sy(yIntercept) + 16} fontSize={10} fill="#c4b5fd" textAnchor="middle">Δx=1</text>
                    <text x={sx(1) + 6} y={(sy(yIntercept) + sy(yIntercept + slope)) / 2} fontSize={10} fill="#c4b5fd">Δy=k</text>
                  </g>
                )}

                {/* rational：垂直/水平渐近线 */}
                {shape === 'rational' && (
                  <>
                    <line x1={sx(params.h ?? 0)} y1={visYMapMin} x2={sx(params.h ?? 0)} y2={visYMapMax} stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="6 4" />
                    <line x1={visMapMin} y1={sy(params.k ?? 0)} x2={visMapMax} y2={sy(params.k ?? 0)} stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="6 4" />
                  </>
                )}

                {/* 指数对数/反函数对：y=x 对称虚线 */}
                {(shape === 'exp-log' || shape === 'inverse-pair') && (
                  <line x1={sx(visWorldXMin)} y1={sy(visWorldXMin)} x2={sx(visWorldXMax)} y2={sy(visWorldXMax)} stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="6 4" />
                )}

                {/* 函数曲线（exp-log/inverse-pair 双曲线：靛蓝 + 粉） */}
                {curvePts.length > 0 && <path d={curvePts.join(' ')} fill="none" stroke={shape === 'exp-log' || shape === 'inverse-pair' ? '#6366f1' : '#60a5fa'} strokeWidth={2.6} strokeLinecap="round" />}
                {(shape === 'exp-log' || shape === 'inverse-pair') && curvePts2.length > 0 && <path d={curvePts2.join(' ')} fill="none" stroke="#ec4899" strokeWidth={2.6} strokeLinecap="round" />}

                {/* 二次：顶点（可拖，反解 b/c）+ 根 + y 截距 */}
                {shape === 'quadratic' && markers.vertex && Number.isFinite(vertexY) && (
                  <GeoPoint
                    label="V" x={vertexX} y={vertexY} color="#fb7185"
                    constraint="free"
                    onMove={(wx, wy) => {
                      if (!Number.isFinite(derived.a) || derived.a === 0) return
                      const b2 = -2 * derived.a * wx
                      const c2 = wy - derived.a * wx * wx - b2 * wx
                      const rb = activeCase.paramRanges?.b
                      const rc = activeCase.paramRanges?.c
                      setParams((prev) => ({
                        ...prev,
                        b: rb ? clamp(b2, rb.min, rb.max) : b2,
                        c: rc ? clamp(c2, rc.min, rc.max) : c2,
                      }))
                    }}
                    coord={coord} transform={transform} svgRef={svgRef} labelDx={10} labelDy={-10}
                  />
                )}
                {shape === 'quadratic' && markers.roots && roots.map((r, i) => (
                  <circle key={i} cx={sx(r)} cy={sy(0)} r={5} fill="#34d399" stroke="#0f172a" strokeWidth={2} />
                ))}
                {shape === 'quadratic' && markers.yIntercept && (
                  <circle cx={sx(0)} cy={sy(yIntercept)} r={4.5} fill="#c084fc" stroke="#0f172a" strokeWidth={1.5} />
                )}

                {/* 绝对值：顶点（可拖，改 h/k）+ 零点 */}
                {shape === 'absolute' && markers.vertex && (
                  <GeoPoint
                    label="V" x={params.h ?? 0} y={params.k ?? 0} color="#fb7185"
                    constraint="free"
                    onMove={(wx, wy) => {
                      const rh = activeCase.paramRanges?.h
                      const rk = activeCase.paramRanges?.k
                      setParams((prev) => ({
                        ...prev,
                        h: rh ? clamp(wx, rh.min, rh.max) : wx,
                        k: rk ? clamp(wy, rk.min, rk.max) : wy,
                      }))
                    }}
                    coord={coord} transform={transform} svgRef={svgRef} labelDx={10} labelDy={-10}
                  />
                )}
                {shape === 'absolute' && markers.roots && roots.map((r, i) => (
                  <circle key={i} cx={sx(r)} cy={sy(0)} r={5} fill="#34d399" stroke="#0f172a" strokeWidth={2} />
                ))}

                {/* rational：中心点（可拖，改 h/k） */}
                {shape === 'rational' && (
                  <GeoPoint
                    label="O" x={params.h ?? 0} y={params.k ?? 0} color="#fb7185"
                    constraint="free"
                    onMove={(wx, wy) => {
                      const rh = activeCase.paramRanges?.h
                      const rk = activeCase.paramRanges?.k
                      setParams((prev) => ({
                        ...prev,
                        h: rh ? clamp(wx, rh.min, rh.max) : wx,
                        k: rk ? clamp(wy, rk.min, rk.max) : wy,
                      }))
                    }}
                    coord={coord} transform={transform} svgRef={svgRef} labelDx={10} labelDy={-10}
                  />
                )}

                {/* 线性：y 截距点（可拖，改 b）与 x 截距点（可拖，改斜率） */}
                {shape === 'linear' && markers.yIntercept && step >= 2 && (
                  <GeoPoint
                    label="B" x={0} y={yIntercept} color="#c084fc"
                    constraint="yAxis"
                    onMove={(_wx, wy) => setParam('b', clamp(wy, yMin + 0.2, yMax - 0.2))}
                    coord={coord} transform={transform} svgRef={svgRef} labelDx={8} labelDy={-10}
                  />
                )}
                {shape === 'linear' && markers.xIntercept && xIntercept !== null && Math.abs(yIntercept) > 0.05 && step >= 2 && (
                  <GeoPoint
                    label="X" x={xIntercept} y={0} color="#fbbf24"
                    constraint="xAxis"
                    onMove={(wx) => {
                      if (Math.abs(wx) > 0.05) setParam('k', clamp(-yIntercept / wx, -5, 5))
                    }}
                    coord={coord} transform={transform} svgRef={svgRef} labelDx={-14} labelDy={14}
                  />
                )}

                {/* 坐标刻度标签 */}
                <g fontSize={11} fill="#64748b">
                  <text x={sx(0) - 8} y={sy(0) - 8} textAnchor="middle">0</text>
                  {shape === 'quadratic' && Number.isFinite(vertexX) && (
                    <text x={sx(vertexX)} y={sy(0) + 18} textAnchor="middle">x₀</text>
                  )}
                  {shape === 'linear' && <text x={sx(0) - 26} y={sy(yIntercept) + 4} textAnchor="middle">b</text>}
                </g>
              </g>
            </svg>

            {/* 动态数据面板 */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 flex-wrap">
              {panelItems.map((item) => (
                <div key={item.label} className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/50 backdrop-blur-sm">
                  <div className="text-[10px] text-slate-400">{item.label}</div>
                  <div className="text-xs font-semibold text-slate-100 font-mono">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 右：控制面板（Card Stack） */}
        <aside className="w-80 xl:w-96 shrink-0 hidden lg:flex flex-col gap-4 overflow-y-auto [&>*]:shrink-0">
          {/* 概念要点 */}
          <ConceptCard formula={activeCase.formula ?? config.formula ?? (shape === 'linear' ? 'y = kx + b' : shape === 'quadratic' ? 'y = ax^2 + bx + c' : shape === 'absolute' ? 'y = a|x-h| + k' : shape === 'exp-log' ? 'y = a^x \\iff x = \\log_a y' : shape === 'rational' ? 'y = \\frac{a}{x-h} + k' : shape === 'inverse-pair' ? 'y = f(x) \\iff x = f^{-1}(y)' : shape === 'composite' ? 'y = f(g(x))' : 'y = f_i(x), x \\in D_i')}>
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
                  setParams(next?.params ?? {})
                  setStep(4)
                }}
              />
            </div>
            {Object.entries(params).map(([key, value]) => {
              const range = activeCase.paramRanges?.[key]
              if (!range) return null
              return (
                <SliderRow
                  key={key}
                  label={range.label ?? key}
                  value={value}
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  onChange={(v) => setParam(key, v)}
                />
              )
            })}
            {shape === 'linear' && (
              <div className="border-t border-gray-100 pt-1 mt-1">
                <SwitchRow label="显示斜率三角形" desc="Δx=1, Δy=k 的直角三角形" checked={showTri} onChange={setShowTri} />
              </div>
            )}
            <div className="px-3.5 py-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-center mt-3">
              <span className="text-sm font-semibold text-purple-700">{judgmentText}</span>
            </div>
          </section>

          {/* 观察提示 */}
          <ObserveTipCard
            tips={
              observeTips.length > 0
                ? observeTips
                : [
              {
                icon: '📈',
                text:
                  shape === 'quadratic'
                    ? `顶点 (${Number.isFinite(vertexY) ? vertexX.toFixed(2) + ', ' + vertexY.toFixed(2) : '—'})，Δ = ${Number.isFinite(delta) ? delta.toFixed(2) : '—'}。`
                    : shape === 'absolute'
                      ? `顶点 (${(params.h ?? 0).toFixed(2)}, ${(params.k ?? 0).toFixed(2)})，a 决定开口与陡缓。`
                      : judgmentText,
              },
              { icon: '🖱️', text: shape === 'linear' ? '拖 y 截距点改 b，拖 x 截距点改斜率；或拖动背景平移 / 滚轮缩放。' : '拖动背景平移 / 滚轮缩放观察曲线；调节参数滑块看图像变化。' },
              { icon: '🎯', text: shape === 'quadratic' ? 'Δ 决定与 x 轴交点：Δ>0 两实根、Δ=0 重根、Δ<0 无实根。' : shape === 'absolute' ? '零点 = 使 a|x−h|+k=0 的 x，即 x = h ± √(−k/a)（a≠0 且 −k/a≥0）。' : shape === 'exp-log' ? '换底公式 logₐx = ln x / ln a；两曲线关于 y=x 对称，互为反函数。' : shape === 'rational' ? 'x→h 时 |y|→∞（垂直渐近线），x→∞ 时 y→k（水平渐近线）。' : shape === 'inverse-pair' ? '反函数图像关于 y=x 对称；拖背景平移观察对称性。' : shape === 'piecewise' ? '分段点 x₀ 处：左右极限与 f(x₀) 相等则连续，否则间断。' : shape === 'composite' ? '复合求值顺序：x → g(x) → f(g(x))；观察内层值域是否落入外层定义域。' : 'x 截距 = −b/k：拖 x 截距点可直观验证该关系。' },
              ]
            }
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
