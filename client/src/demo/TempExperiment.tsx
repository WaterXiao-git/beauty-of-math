// 临时交互实验页：/temp/:specId
// spec 存于 SessionStorage（仅当前会话预览，不写源码/不注册永久路由）
// 渲染采用 iframe srcDoc 自包含 HTML（SVG），sandbox 隔离，无外部资源
import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import DemoHeader from './DemoHeader'

interface TempPoint { x: number; y: number }
interface TempSpec {
  id: string
  question: string
  title: string
  formula: string
  template: 'cartesian' | 'polar' | 'arithmetic'
  domain: [number, number]
  steps: { id: string; title: string; desc: string }[]
  params: Record<string, number>
  points: TempPoint[]
  createdAt: number
}

// ---------- 自包含 HTML 生成（纯 SVG，无外部依赖） ----------

function svgCartesian(spec: TempSpec): string {
  const W = 820, H = 520, PAD = 56
  const xs = spec.points.map((p) => p.x)
  const ys = spec.points.map((p) => p.y)
  const xMin = spec.domain[0], xMax = spec.domain[1]
  const yMin = Math.min(...ys, -1) * 1.1, yMax = Math.max(...ys, 1) * 1.1
  const sx = (x: number) => PAD + ((x - xMin) / (xMax - xMin)) * (W - PAD * 2)
  const sy = (y: number) => H - PAD - ((y - yMin) / (yMax - yMin)) * (H - PAD * 2)
  const path = spec.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ')
  const grid = []
  for (let g = Math.ceil(xMin); g <= Math.floor(xMax); g++) {
    grid.push(`<line x1="${sx(g)}" y1="${PAD}" x2="${sx(g)}" y2="${H - PAD}" stroke="#eef2f7"/>`)
  }
  for (let g = Math.ceil(yMin); g <= Math.floor(yMax); g++) {
    grid.push(`<line x1="${PAD}" y1="${sy(g)}" x2="${W - PAD}" y2="${sy(g)}" stroke="#eef2f7"/>`)
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;font-family:system-ui,sans-serif;background:#fff}
  .bar{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:1px solid #eef2f7;font-size:13px;color:#334155}
  .bar b{color:#1d4ed8}</style></head><body>
  <div class="bar"><span><b>${spec.title}</b>　y = ${spec.formula}</span><span>${spec.points.length} 采样点</span></div>
  <svg viewBox="0 0 ${W} ${H}" width="100%" height="calc(100% - 41px)" xmlns="http://www.w3.org/2000/svg">
    ${grid.join('')}
    <line x1="${PAD}" y1="${sy(0)}" x2="${W - PAD}" y2="${sy(0)}" stroke="#94a3b8" stroke-width="1.4"/>
    <line x1="${sx(0)}" y1="${PAD}" x2="${sx(0)}" y2="${H - PAD}" stroke="#94a3b8" stroke-width="1.4"/>
    <path d="${path}" fill="none" stroke="#2563eb" stroke-width="2.6" stroke-linecap="round"/>
    <text x="${W - 40}" y="${sy(0) - 10}" font-size="13" fill="#64748b">x</text>
    <text x="${sx(0) + 10}" y="${PAD + 14}" font-size="13" fill="#64748b">y</text>
  </svg></body></html>`
}

function svgPolar(spec: TempSpec): string {
  const W = 820, H = 520
  const cx = W / 2, cy = H / 2
  const rs = spec.points.map((p) => Math.abs(p.y))
  const rMax = (Math.max(...rs, 1) || 1) * 1.05
  const scale = Math.min(W, H) * 0.42 / rMax
  const pts = spec.points
    .filter((p) => p.y >= 0)
    .map((p) => {
      const r = p.y * scale
      const x = cx + r * Math.cos(p.x)
      const y = cy - r * Math.sin(p.x)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const circles = [0.25, 0.5, 0.75, 1].map((f) => `<circle cx="${cx}" cy="${cy}" r="${(rMax * f * scale).toFixed(1)}" fill="none" stroke="#eef2f7"/>`).join('')
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;font-family:system-ui,sans-serif;background:#fff}
  .bar{display:flex;justify-content:space-between;padding:10px 16px;border-bottom:1px solid #eef2f7;font-size:13px;color:#334155}
  .bar b{color:#1d4ed8}</style></head><body>
  <div class="bar"><span><b>${spec.title}</b>　r = ${spec.formula}</span><span>极坐标</span></div>
  <svg viewBox="0 0 ${W} ${H}" width="100%" height="calc(100% - 41px)" xmlns="http://www.w3.org/2000/svg">
    ${circles}
    <line x1="0" y1="${cy}" x2="${W}" y2="${cy}" stroke="#e2e8f0"/>
    <line x1="${cx}" y1="0" x2="${cx}" y2="${H}" stroke="#e2e8f0"/>
    <polyline points="${pts}" fill="none" stroke="#2563eb" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg></body></html>`
}

function htmlArithmetic(spec: TempSpec): string {
  const steps = spec.steps.map((s, i) => `<li><span class="n">${i + 1}</span>${s.title}：${s.desc}</li>`).join('')
  const params = Object.entries(spec.params).map(([k, v]) => `${k} = ${v}`).join('　')
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;font-family:system-ui,sans-serif;background:#fff;color:#334155}
  .wrap{padding:28px 32px}
  h2{color:#1d4ed8;margin:0 0 6px}
  .expr{font-size:22px;font-weight:700;padding:18px 20px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;margin:14px 0}
  .steps{list-style:none;padding:0}
  .steps li{display:flex;align-items:center;gap:10px;padding:8px 0;font-size:14px}
  .n{width:22px;height:22px;border-radius:50%;background:#2563eb;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700}
  .params{font-size:12px;color:#64748b;margin-top:8px}</style></head><body><div class="wrap">
  <h2>${spec.title}</h2>
  <div class="expr">${spec.formula}</div>
  <ul class="steps">${steps}</ul>
  <div class="params">${params}</div>
  </div></body></html>`
}

function buildHtml(spec: TempSpec): string {
  if (spec.template === 'polar') return svgPolar(spec)
  if (spec.template === 'arithmetic') return htmlArithmetic(spec)
  return svgCartesian(spec)
}

// ---------- 页面 ----------

export default function TempExperiment() {
  const { specId = '' } = useParams()

  const spec = useMemo<TempSpec | null>(() => {
    if (!specId) return null
    const raw = sessionStorage.getItem(`temp-spec:${specId}`)
    if (!raw) return null
    try {
      return JSON.parse(raw) as TempSpec
    } catch {
      return null
    }
  }, [specId])

  if (!spec) {
    return (
      <div className="flex flex-col h-full bg-[#f5f7fa]">
        <DemoHeader breadcrumb={['临时实验']} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md text-center">
            <div className="text-4xl mb-3">⏳</div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">临时实验不存在或已过期</h2>
            <p className="text-sm text-gray-500 mb-6">临时实验仅保存在当前浏览器会话中（SessionStorage），关闭页面或更换浏览器后将不可用。</p>
            <Link to="/ask" className="inline-flex items-center justify-center px-5 h-10 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
              返回提问
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const html = buildHtml(spec)

  return (
    <div className="flex flex-col h-full bg-[#f5f7fa]">
      <DemoHeader breadcrumb={['临时实验', spec.title]} />
      <div className="flex-1 min-h-0 p-4 md:p-5">
        <iframe
          srcDoc={html}
          sandbox="allow-scripts"
          title={spec.title}
          className="w-full h-full rounded-xl border border-gray-200 bg-white shadow-sm"
        />
      </div>
    </div>
  )
}