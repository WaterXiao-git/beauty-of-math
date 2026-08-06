// 深色交互式画板：SVG 曲线 / 端点 / 中值点 / 辅助线 / 公式浮层 / 动态数据面板
import MathFormula from '../components/MathFormula/MathFormula'
import { usePanZoom } from './usePanZoom'
import { calcViewportGrid } from './viewport'
import type { RolleCase } from './rolleData'
import { LEGEND } from './rolleData'

export interface Conditions {
  continuous: boolean
  differentiable: boolean
  equalEndpoints: boolean
}

interface RolleCanvasProps {
  case: RolleCase
  conditions: Conditions
  /** 播放步进 1-4 */
  step: number
  xiLocked: boolean
  onToggleXiLock: () => void
}

// SVG 画布尺寸
const W = 720
const H = 400
const PAD_L = 62
const PAD_R = 40
const PAD_T = 44
const PAD_B = 52

export default function RolleCanvas({ case: c, conditions, step, xiLocked, onToggleXiLock }: RolleCanvasProps) {
  const { transform, handlers } = usePanZoom()
  const [a, b] = c.domain
  const [yMin, yMax] = c.yRange
  const breakX = (a + b) / 2
  const allSatisfied = conditions.continuous && conditions.differentiable && conditions.equalEndpoints

  // 坐标映射
  const sx = (x: number) => PAD_L + ((x - a) / (b - a)) * (W - PAD_L - PAD_R)
  const sy = (y: number) => H - PAD_B - ((y - yMin) / (yMax - yMin)) * (H - PAD_T - PAD_B)
  const grid = calcViewportGrid(transform, W, H, [a, b], [yMin, yMax], PAD_L, PAD_R, PAD_T, PAD_B)

  // 曲线采样（支持连续性破坏：断口）
  const N = 120
  const gapW = conditions.continuous ? 0 : (b - a) / 60
  const pathLeft: string[] = []
  const pathRight: string[] = []
  for (let i = 0; i <= N; i++) {
    const x = a + ((b - a) * i) / N
    const y = c.fn(x)
    if (!Number.isFinite(y)) continue
    const cmd = (i === 0 ? 'M' : 'L') + sx(x).toFixed(1) + ' ' + sy(y).toFixed(1)
    if (!conditions.continuous && Math.abs(x - breakX) < gapW) continue // 断口
    if (x < breakX) pathLeft.push(cmd)
    else pathRight.push(cmd)
  }
  const curveLeft = pathLeft.join(' ')
  const curveRight = pathRight.join(' ')

  const fa = c.fn(a)
  const fb = c.fn(b)
  const xi = c.xi
  const fxi = xi != null ? c.fn(xi) : 0

  // 等高时水平虚线（y=f(a)）
  const showEqualLine = conditions.equalEndpoints && step >= 2
  // 中值点 + 水平切线（条件全满足且步进到扫描阶段）
  const showXi = xi != null && allSatisfied && step >= 3

  return (
    <section className="flex-1 min-w-0 bg-slate-900 rounded-2xl p-4 md:p-6 flex flex-col gap-4">
      {/* 画板头部 + 图例 */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">{c.name === '双谷曲线' ? '罗尔定理' : c.name}</h2>
          <p className="text-xs text-slate-400 mt-1">{c.desc}</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-300 shrink-0">
          {LEGEND.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* 画布 */}
      <div className="relative rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden flex-1 min-h-[380px]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full cursor-grab active:cursor-grabbing" preserveAspectRatio="xMidYMid meet" {...handlers}>
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
        

          {/* 端点水平虚线（f(a)=f(b)） */}
          {showEqualLine && (
            <line
              x1={sx(a)} y1={sy(fa)} x2={sx(b)} y2={sy(fa)}
              stroke="#94a3b8" strokeWidth={1.4} strokeDasharray="7 5"
            />
          )}

          {/* 水平切线（过 ξ，粉色实线） */}
          {showXi && (
            <line
              x1={sx(a)} y1={sy(fxi)} x2={sx(b)} y2={sy(fxi)}
              stroke="#f472b6" strokeWidth={2}
            />
          )}

          {/* 函数曲线（亮蓝） */}
          {curveLeft && <path d={curveLeft} fill="none" stroke="#60a5fa" strokeWidth={2.6} strokeLinecap="round" />}
          {curveRight && <path d={curveRight} fill="none" stroke="#60a5fa" strokeWidth={2.6} strokeLinecap="round" />}

          {/* 连续性破坏：断口空心圆 */}
          {!conditions.continuous && (
            <circle cx={sx(breakX)} cy={sy(c.fn(breakX))} r={5} fill="#0f172a" stroke="#60a5fa" strokeWidth={2} />
          )}
          {/* 可导性破坏：尖角菱形标记 */}
          {!conditions.differentiable && (
            <path
              d={`M${sx(breakX) - 6},${sy(c.fn(breakX))} l6,-8 l6,8 l-6,8 z`}
              fill="#fbbf24" opacity={0.9}
            />
          )}

          {/* 端点 A / B（亮蓝圆点） */}
          {step >= 1 && (
            <g>
              <circle cx={sx(a)} cy={sy(fa)} r={6} fill="#60a5fa" stroke="#0f172a" strokeWidth={2} />
              <circle cx={sx(b)} cy={sy(fb)} r={6} fill="#60a5fa" stroke="#0f172a" strokeWidth={2} />
              <text x={sx(a) - 14} y={sy(fa) - 10} fontSize={13} fontWeight={700} fill="#93c5fd">A</text>
              <text x={sx(b) + 6} y={sy(fb) - 10} fontSize={13} fontWeight={700} fill="#93c5fd">B</text>
            </g>
          )}

          {/* 中值点 ξ（粉紫点 + 绿圈） */}
          {showXi && (
            <g>
              <circle
                cx={sx(xi)} cy={sy(fxi)} r={xiLocked || step >= 4 ? 9 : 7}
                fill="#c084fc" stroke="#34d399" strokeWidth={2.4}
              />
              <text x={sx(xi) + 12} y={sy(fxi) + 4} fontSize={13} fontWeight={700} fill="#e9d5ff">ξ</text>
            </g>
          )}

          {/* 坐标轴刻度标签 */}
          <g fontSize={11} fill="#64748b">
            <text x={sx(a) - 4} y={sy(0) + 18} textAnchor="middle">a</text>
            <text x={sx(b) - 4} y={sy(0) + 18} textAnchor="middle">b</text>
            <text x={sx(0) + 6} y={sy(0) - 6}>0</text>
          </g>
        </g>
        </svg>

        {/* 公式浮层（左上角） */}
        <div className="absolute top-3 left-3 px-3.5 py-2.5 rounded-xl bg-slate-900/85 border border-slate-700/60 backdrop-blur-sm shadow-lg">
          <MathFormula
            formula={'f(a)=f(b) \\Rightarrow \\exists \\xi \\in (a,b),\\; f\'(\\xi)=0'}
            displayMode={false}
            className="text-white [&_.katex]:text-white"
          />
        </div>

        {/* 锁定 ξ 按钮（右上角） */}
        <button
          type="button"
          onClick={onToggleXiLock}
          className={`absolute top-3 right-3 px-3 h-8 rounded-lg text-xs font-medium border backdrop-blur-sm transition-colors ${
            xiLocked
              ? 'bg-indigo-600/80 border-indigo-400 text-white'
              : 'bg-slate-900/70 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
          }`}
        >
          {xiLocked ? '🔒 已锁定 ξ' : '锁定 ξ'}
        </button>

        {/* 动态数据面板（左下角） */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 flex-wrap">
          {[
            { label: '左端点', value: `a = ${a.toFixed(2)}` },
            { label: '右端点', value: `b = ${b.toFixed(2)}` },
            {
              label: '函数值差',
              value: conditions.equalEndpoints ? `f(a)=f(b)=${fa.toFixed(2)}` : `f(a)=${fa.toFixed(2)} ≠ f(b)=${fb.toFixed(2)}`,
            },
            { label: '中值点', value: showXi ? `ξ = ${(xi ?? 0).toFixed(2)}` : '—' },
          ].map((item) => (
            <div key={item.label} className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/50 backdrop-blur-sm">
              <div className="text-[10px] text-slate-400">{item.label}</div>
              <div className="text-xs font-semibold text-slate-100 font-mono">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
