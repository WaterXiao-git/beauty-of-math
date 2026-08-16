import { useEffect, useMemo, useState } from 'react'

import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'
import type { StepItem } from '../PlayerBar'

interface Point {
  x: number
  y: number
}

interface Series {
  color: string
  dashed?: boolean
  id: string
  opacity?: number
  points: Point[]
}

const WIDTH = 820
const HEIGHT = 470
const PAD = 58

function sample(fn: (x: number) => number, min: number, max: number, count = 240): Point[] {
  return Array.from({ length: count + 1 }, (_, index) => {
    const x = min + ((max - min) * index) / count
    return { x, y: fn(x) }
  })
}

function usePlayer(steps: StepItem[]) {
  const [step, setStep] = useState(1)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setInterval(() => {
      setStep((current) => {
        if (current >= steps.length) {
          setPlaying(false)
          return current
        }
        return current + 1
      })
    }, 1200)
    return () => window.clearInterval(timer)
  }, [playing, steps.length])

  return {
    steps,
    step,
    playing,
    onPrev: () => setStep((current) => Math.max(1, current - 1)),
    onNext: () => setStep((current) => Math.min(steps.length, current + 1)),
    onTogglePlay: () => {
      if (step >= steps.length) setStep(1)
      setPlaying((current) => !current)
    },
    onReset: () => {
      setPlaying(false)
      setStep(1)
    },
  }
}

function RangeControl({ label, max, min, onChange, step, value }: {
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  step: number
  value: number
}) {
  return (
    <label className="block text-sm text-slate-600">
      <span className="mb-2 flex justify-between gap-3">
        <span>{label}</span>
        <strong className="text-indigo-600">{value}</strong>
      </span>
      <input
        className="w-full accent-indigo-600"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
    </label>
  )
}

function ChoiceGroup<T extends string>({ choices, onChange, value }: {
  choices: readonly { label: string; value: T }[]
  onChange: (value: T) => void
  value: T
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {choices.map((choice) => (
        <button
          key={choice.value}
          className={value === choice.value
            ? 'rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm'
            : 'rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-indigo-50'}
          onClick={() => onChange(choice.value)}
          type="button"
        >
          {choice.label}
        </button>
      ))}
    </div>
  )
}

function Plot({ children, series, xMax, xMin, yMax, yMin }: {
  children?: React.ReactNode
  series: Series[]
  xMax: number
  xMin: number
  yMax: number
  yMin: number
}) {
  const sx = (x: number) => PAD + ((x - xMin) / (xMax - xMin)) * (WIDTH - PAD * 2)
  const sy = (y: number) => HEIGHT - PAD - ((y - yMin) / (yMax - yMin)) * (HEIGHT - PAD * 2)
  const pathFor = (points: Point[]) => points.map(({ x, y }, index) =>
    `${index === 0 ? 'M' : 'L'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`,
  ).join(' ')

  return (
    <svg className="h-full min-h-[410px] w-full" role="img" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <rect fill="#f8fafc" height={HEIGHT} rx="18" width={WIDTH} />
      {Array.from({ length: 9 }, (_, index) => xMin + ((xMax - xMin) * index) / 8).map((x) => (
        <line key={`x-${x}`} stroke="#dbe4f0" x1={sx(x)} x2={sx(x)} y1={PAD} y2={HEIGHT - PAD} />
      ))}
      {Array.from({ length: 9 }, (_, index) => yMin + ((yMax - yMin) * index) / 8).map((y) => (
        <line key={`y-${y}`} stroke="#dbe4f0" x1={PAD} x2={WIDTH - PAD} y1={sy(y)} y2={sy(y)} />
      ))}
      {yMin <= 0 && yMax >= 0 && <line stroke="#64748b" strokeWidth="2" x1={PAD} x2={WIDTH - PAD} y1={sy(0)} y2={sy(0)} />}
      {xMin <= 0 && xMax >= 0 && <line stroke="#64748b" strokeWidth="2" x1={sx(0)} x2={sx(0)} y1={PAD} y2={HEIGHT - PAD} />}
      {series.map((item) => (
        <path
          key={item.id}
          d={pathFor(item.points)}
          fill="none"
          opacity={item.opacity}
          stroke={item.color}
          strokeDasharray={item.dashed ? '9 7' : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
      ))}
      {children}
    </svg>
  )
}

type NewtonCase = 'square-root' | 'cubic' | 'cosine'

const NEWTON_CASES: Record<NewtonCase, {
  derivative: (x: number) => number
  fn: (x: number) => number
  formula: string
  label: string
  root: number
}> = {
  'square-root': { derivative: (x) => 2 * x, fn: (x) => x * x - 2, formula: 'f(x) = x² − 2', label: '求 √2', root: Math.SQRT2 },
  cubic: { derivative: (x) => 3 * x * x - 1, fn: (x) => x ** 3 - x - 1, formula: 'f(x) = x³ − x − 1', label: '三次方程', root: 1.324717957 },
  cosine: { derivative: (x) => -Math.sin(x) - 1, fn: (x) => Math.cos(x) - x, formula: 'f(x) = cos x − x', label: '余弦不动点', root: 0.739085133 },
}

const NEWTON_STEPS: StepItem[] = [
  { id: 'start', title: '选择初始值', desc: '从横轴上的 x₀ 出发，找到函数图像上的点。' },
  { id: 'tangent', title: '作切线', desc: '用当前点的导数确定切线方向。' },
  { id: 'intercept', title: '取得新近似', desc: '切线与 x 轴交点就是下一次近似。' },
  { id: 'repeat', title: '重复并收敛', desc: '重复作切线，近似值逐步靠近函数零点。' },
]

function newtonSequence(current: typeof NEWTON_CASES[NewtonCase], initial: number) {
  const values = [initial]
  for (let index = 0; index < 5; index += 1) {
    const x = values.at(-1) ?? initial
    const derivative = current.derivative(x)
    if (Math.abs(derivative) < 0.08) break
    const next = x - current.fn(x) / derivative
    if (!Number.isFinite(next) || Math.abs(next) > 4) break
    values.push(next)
  }
  return values
}

export function NewtonMethodDemo() {
  const [caseKey, setCaseKey] = useState<NewtonCase>('square-root')
  const [initial, setInitial] = useState(2.6)
  const player = usePlayer(NEWTON_STEPS)
  const current = NEWTON_CASES[caseKey]
  const values = newtonSequence(current, initial)
  const visibleIterations = player.step === 1 ? 0 : player.step === 2 ? 1 : player.step === 3 ? 2 : values.length - 1
  const sx = (x: number) => PAD + ((x + 3) / 6) * (WIDTH - PAD * 2)
  const sy = (y: number) => HEIGHT - PAD - ((y + 4) / 10) * (HEIGHT - PAD * 2)
  const latest = values[Math.min(visibleIterations, values.length - 1)]

  return (
    <ExperimentShell
      breadcrumb={['高等数学（上册）', '微分中值定理与导数的应用', '牛顿迭代法']}
      canvas={(
        <Plot series={[{ color: '#4f46e5', id: 'function', points: sample(current.fn, -3, 3) }]} xMax={3} xMin={-3} yMax={6} yMin={-4}>
          {values.slice(0, visibleIterations).map((x, index) => {
            const y = current.fn(x)
            const next = values[index + 1]
            return (
              <g key={`${x}-${index}`}>
                <line stroke="#f43f5e" strokeDasharray="7 5" strokeWidth="2.5" x1={sx(x)} x2={sx(x)} y1={sy(0)} y2={sy(y)} />
                <line stroke="#f43f5e" strokeWidth="3" x1={sx(x)} x2={sx(next)} y1={sy(y)} y2={sy(0)} />
                <circle cx={sx(x)} cy={sy(y)} fill="#fff" r="7" stroke="#f43f5e" strokeWidth="4" />
                <text fill="#be123c" fontSize="13" fontWeight="700" x={sx(next) + 6} y={sy(0) - 10}>x{index + 1}</text>
              </g>
            )
          })}
          <circle cx={sx(current.root)} cy={sy(0)} fill="#10b981" r="9" stroke="#fff" strokeWidth="4" />
        </Plot>
      )}
      legend={[{ color: '#4f46e5', label: '函数曲线' }, { color: '#f43f5e', label: '切线迭代' }, { color: '#10b981', label: '真实零点' }]}
      player={player}
      sidebar={(
        <>
          <ExperimentCard title="选择方程"><ChoiceGroup choices={(Object.entries(NEWTON_CASES) as [NewtonCase, typeof NEWTON_CASES[NewtonCase]][]).map(([value, item]) => ({ label: item.label, value }))} onChange={setCaseKey} value={caseKey} /></ExperimentCard>
          <ExperimentCard title="迭代参数"><RangeControl label="初始值 x₀" max={3} min={0.4} onChange={setInitial} step={0.1} value={initial} /><div className="mt-4 rounded-xl bg-indigo-50 p-3 text-center font-mono text-sm font-bold text-indigo-700">{current.formula}</div></ExperimentCard>
          <ExperimentCard title="迭代公式"><div className="rounded-xl bg-slate-50 p-3 text-center font-mono text-sm text-slate-700">xₙ₊₁ = xₙ − f(xₙ) / f′(xₙ)</div><p className="mt-3 text-sm leading-6 text-slate-600">当前近似 x ≈ {latest.toFixed(7)}，误差约 {Math.abs(latest - current.root).toExponential(2)}。</p></ExperimentCard>
        </>
      )}
      subtitle="把函数图像上的切线与横轴交点作为下一次近似，观察迭代如何收敛到零点。"
      title="牛顿迭代法"
    />
  )
}

type PrimitiveCase = 'linear' | 'cosine' | 'quadratic'

const PRIMITIVE_CASES: Record<PrimitiveCase, {
  derivativeFormula: string
  fn: (x: number) => number
  formula: string
  label: string
  primitive: (x: number) => number
}> = {
  linear: { derivativeFormula: '(x² + C)′ = 2x', fn: (x) => 2 * x, formula: '∫2x dx = x² + C', label: '2x', primitive: (x) => x * x },
  cosine: { derivativeFormula: '(sin x + C)′ = cos x', fn: Math.cos, formula: '∫cos x dx = sin x + C', label: 'cos x', primitive: Math.sin },
  quadratic: { derivativeFormula: '(x³ + C)′ = 3x²', fn: (x) => 3 * x * x, formula: '∫3x² dx = x³ + C', label: '3x²', primitive: (x) => x ** 3 },
}

const PRIMITIVE_STEPS: StepItem[] = [
  { id: 'integrand', title: '观察被积函数', desc: '被积函数 f(x) 是要反求导数的函数。' },
  { id: 'primitive', title: '寻找一个原函数', desc: '找到满足 F′(x)=f(x) 的函数 F。' },
  { id: 'constant', title: '改变积分常数', desc: '竖直平移不改变导数，因此有一族原函数。' },
  { id: 'verify', title: '求导验证', desc: '对 F(x)+C 求导，结果仍然是 f(x)。' },
]

export function IndefiniteIntegralDemo() {
  const [caseKey, setCaseKey] = useState<PrimitiveCase>('cosine')
  const [constant, setConstant] = useState(1)
  const player = usePlayer(PRIMITIVE_STEPS)
  const current = PRIMITIVE_CASES[caseKey]
  const family = [-2, -1, 0, 1, 2]
  const showPrimitive = player.step >= 2
  const showFamily = player.step >= 3

  return (
    <ExperimentShell
      breadcrumb={['高等数学（上册）', '不定积分与定积分', '不定积分']}
      canvas={(
        <Plot
          series={[
            { color: '#0ea5e9', id: 'integrand', points: sample(current.fn, -3, 3) },
            ...(showFamily ? family.filter((value) => value !== constant).map((value) => ({ color: '#c4b5fd', id: `family-${value}`, opacity: 0.42, points: sample((x) => current.primitive(x) + value, -3, 3) })) : []),
            ...(showPrimitive ? [{ color: '#7c3aed', id: 'primitive', points: sample((x) => current.primitive(x) + constant, -3, 3) }] : []),
          ]}
          xMax={3}
          xMin={-3}
          yMax={5}
          yMin={-5}
        />
      )}
      legend={[{ color: '#0ea5e9', label: '被积函数 f(x)' }, { color: '#7c3aed', label: '原函数 F(x)+C' }, { color: '#c4b5fd', label: '原函数族' }]}
      player={player}
      sidebar={(
        <>
          <ExperimentCard title="选择被积函数"><ChoiceGroup choices={(Object.entries(PRIMITIVE_CASES) as [PrimitiveCase, typeof PRIMITIVE_CASES[PrimitiveCase]][]).map(([value, item]) => ({ label: item.label, value }))} onChange={setCaseKey} value={caseKey} /></ExperimentCard>
          <ExperimentCard title="积分常数"><RangeControl label="积分常数 C" max={2} min={-2} onChange={setConstant} step={1} value={constant} /><div className="mt-4 rounded-xl bg-indigo-50 p-3 text-center font-mono text-sm font-bold text-indigo-700">{current.formula}</div></ExperimentCard>
          <ExperimentCard title="求导验证" action={player.step >= 4 ? <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">验证成立</span> : undefined}><p className="text-sm leading-6 text-slate-600">F′(x) = f(x)。常数 C 的导数为 0，所以所有竖直平移曲线都有相同导数。</p><div className="mt-3 rounded-xl bg-slate-50 p-3 text-center font-mono text-sm text-slate-700">{current.derivativeFormula}</div></ExperimentCard>
        </>
      )}
      subtitle="从求导的逆过程理解原函数族，并观察积分常数 C 为什么不可省略。"
      title="不定积分"
    />
  )
}

type IntegralCase = 'square' | 'sine' | 'arch'

const INTEGRAL_CASES: Record<IntegralCase, {
  antiderivative: (x: number) => number
  fn: (x: number) => number
  formula: string
  label: string
}> = {
  square: { antiderivative: (x) => x ** 3 / 3 + x, fn: (x) => x * x + 1, formula: 'f(x) = x² + 1', label: '二次函数' },
  sine: { antiderivative: (x) => 2 * x - Math.cos(x), fn: (x) => 2 + Math.sin(x), formula: 'f(x) = 2 + sin x', label: '正弦函数' },
  arch: { antiderivative: (x) => 3 * x - x ** 3 / 12, fn: (x) => 3 - x * x / 4, formula: 'f(x) = 3 − x²/4', label: '拱形函数' },
}

const INTEGRAL_STEPS: StepItem[] = [
  { id: 'interval', title: '确定积分区间', desc: '在横轴上固定积分下限 a 和上限 b。' },
  { id: 'partition', title: '分割区间', desc: '把 [a,b] 分成 n 个宽度相同的小区间。' },
  { id: 'sum', title: '计算黎曼和', desc: '用每个小矩形面积近似对应的曲边面积。' },
  { id: 'limit', title: '取分割极限', desc: 'n 增大时黎曼和趋近定积分的精确值。' },
]

export function DefiniteIntegralDemo() {
  const [caseKey, setCaseKey] = useState<IntegralCase>('square')
  const [parts, setParts] = useState(8)
  const [left, setLeft] = useState(-1)
  const [right, setRight] = useState(2)
  const player = usePlayer(INTEGRAL_STEPS)
  const current = INTEGRAL_CASES[caseKey]
  const a = Math.min(left, right - 0.5)
  const b = Math.max(right, left + 0.5)
  const visibleParts = player.step === 1 ? 1 : player.step === 2 ? Math.min(parts, 4) : parts
  const width = (b - a) / visibleParts
  const rectangles = useMemo(() => Array.from({ length: visibleParts }, (_, index) => {
    const x = a + index * width
    const midpoint = x + width / 2
    return { height: current.fn(midpoint), x }
  }), [a, current, visibleParts, width])
  const approximation = rectangles.reduce((sum, rectangle) => sum + rectangle.height * width, 0)
  const exact = current.antiderivative(b) - current.antiderivative(a)
  const sx = (x: number) => PAD + ((x + 3) / 6) * (WIDTH - PAD * 2)
  const sy = (y: number) => HEIGHT - PAD - ((y + 1) / 6) * (HEIGHT - PAD * 2)

  return (
    <ExperimentShell
      breadcrumb={['高等数学（上册）', '不定积分与定积分', '定积分']}
      canvas={(
        <Plot series={[{ color: '#2563eb', id: 'function', points: sample(current.fn, -3, 3) }]} xMax={3} xMin={-3} yMax={5} yMin={-1}>
          {player.step >= 2 && rectangles.map((rectangle, index) => (
            <rect
              key={`${rectangle.x}-${index}`}
              fill="#a78bfa"
              height={Math.max(0, sy(0) - sy(rectangle.height))}
              opacity="0.38"
              stroke="#7c3aed"
              width={sx(rectangle.x + width) - sx(rectangle.x)}
              x={sx(rectangle.x)}
              y={sy(rectangle.height)}
            />
          ))}
          <line stroke="#f59e0b" strokeDasharray="8 6" strokeWidth="2.5" x1={sx(a)} x2={sx(a)} y1={sy(0)} y2={sy(current.fn(a))} />
          <line stroke="#f59e0b" strokeDasharray="8 6" strokeWidth="2.5" x1={sx(b)} x2={sx(b)} y1={sy(0)} y2={sy(current.fn(b))} />
          <text fill="#b45309" fontWeight="700" x={sx(a) - 5} y={sy(0) + 24}>a</text>
          <text fill="#b45309" fontWeight="700" x={sx(b) - 5} y={sy(0) + 24}>b</text>
        </Plot>
      )}
      legend={[{ color: '#2563eb', label: '函数曲线' }, { color: '#a78bfa', label: '黎曼和矩形' }, { color: '#f59e0b', label: '积分区间' }]}
      player={player}
      sidebar={(
        <>
          <ExperimentCard title="选择函数"><ChoiceGroup choices={(Object.entries(INTEGRAL_CASES) as [IntegralCase, typeof INTEGRAL_CASES[IntegralCase]][]).map(([value, item]) => ({ label: item.label, value }))} onChange={setCaseKey} value={caseKey} /></ExperimentCard>
          <ExperimentCard title="积分区间与分割"><div className="space-y-5"><RangeControl label="积分下限 a" max={1} min={-2.5} onChange={setLeft} step={0.5} value={left} /><RangeControl label="积分上限 b" max={2.5} min={-1} onChange={setRight} step={0.5} value={right} /><RangeControl label="分割份数 n" max={40} min={2} onChange={setParts} step={1} value={parts} /></div></ExperimentCard>
          <ExperimentCard title="面积计算" action={<span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-600">{current.formula}</span>}><div className="grid grid-cols-2 gap-2 text-center text-sm"><div className="rounded-xl bg-violet-50 p-3 text-violet-700"><span className="block text-xs">黎曼和</span><strong>{approximation.toFixed(4)}</strong></div><div className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><span className="block text-xs">精确积分</span><strong>{exact.toFixed(4)}</strong></div></div><p className="mt-3 text-sm leading-6 text-slate-600">当前误差：{Math.abs(approximation - exact).toExponential(2)}。增加 n，矩形总面积会逼近定积分。</p></ExperimentCard>
        </>
      )}
      subtitle="把区间分割成小矩形，用黎曼和观察曲边面积如何趋近定积分。"
      title="定积分"
    />
  )
}
