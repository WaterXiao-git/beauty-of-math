import { useEffect, useMemo, useState } from 'react'

import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'
import type { StepItem } from '../PlayerBar'

interface Point {
  x: number
  y: number
}

interface Series {
  label: string
  color: string
  points: Point[]
  dashed?: boolean
}

const WIDTH = 820
const HEIGHT = 470
const PAD = 56

function sample(fn: (x: number) => number, min = -4, max = 4, count = 240): Point[] {
  return Array.from({ length: count + 1 }, (_, index) => {
    const x = min + ((max - min) * index) / count
    return { x, y: fn(x) }
  })
}

function pathFor(points: Point[], xMin: number, xMax: number, yMin: number, yMax: number) {
  const sx = (x: number) => PAD + ((x - xMin) / (xMax - xMin)) * (WIDTH - PAD * 2)
  const sy = (y: number) => HEIGHT - PAD - ((y - yMin) / (yMax - yMin)) * (HEIGHT - PAD * 2)
  let drawing = false
  return points.map(({ x, y }) => {
    if (!Number.isFinite(y) || y < yMin * 3 || y > yMax * 3) {
      drawing = false
      return ''
    }
    const command = drawing ? 'L' : 'M'
    drawing = true
    return `${command}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`
  }).join(' ')
}

function Plot({
  series,
  xMin = -4,
  xMax = 4,
  yMin = -4,
  yMax = 4,
  children,
}: {
  series: Series[]
  xMin?: number
  xMax?: number
  yMin?: number
  yMax?: number
  children?: React.ReactNode
}) {
  const sx = (x: number) => PAD + ((x - xMin) / (xMax - xMin)) * (WIDTH - PAD * 2)
  const sy = (y: number) => HEIGHT - PAD - ((y - yMin) / (yMax - yMin)) * (HEIGHT - PAD * 2)
  const xTicks = Array.from({ length: 9 }, (_, index) => xMin + ((xMax - xMin) * index) / 8)
  const yTicks = Array.from({ length: 9 }, (_, index) => yMin + ((yMax - yMin) * index) / 8)

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full min-h-[410px] w-full" role="img">
      <rect width={WIDTH} height={HEIGHT} fill="#f8fafc" rx="18" />
      {xTicks.map((x) => <line key={`x-${x}`} x1={sx(x)} x2={sx(x)} y1={PAD} y2={HEIGHT - PAD} stroke="#dbe4f0" />)}
      {yTicks.map((y) => <line key={`y-${y}`} x1={PAD} x2={WIDTH - PAD} y1={sy(y)} y2={sy(y)} stroke="#dbe4f0" />)}
      {yMin <= 0 && yMax >= 0 && <line x1={PAD} x2={WIDTH - PAD} y1={sy(0)} y2={sy(0)} stroke="#64748b" strokeWidth="1.8" />}
      {xMin <= 0 && xMax >= 0 && <line x1={sx(0)} x2={sx(0)} y1={PAD} y2={HEIGHT - PAD} stroke="#64748b" strokeWidth="1.8" />}
      {series.map((item) => (
        <path
          key={item.label}
          d={pathFor(item.points, xMin, xMax, yMin, yMax)}
          fill="none"
          stroke={item.color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={item.dashed ? '10 8' : undefined}
        />
      ))}
      {children}
    </svg>
  )
}

function RangeControl({ label, value, min, max, step, onChange, suffix = '' }: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  suffix?: string
}) {
  return (
    <label className="block text-sm text-slate-600">
      <span className="mb-2 flex justify-between"><span>{label}</span><strong className="text-indigo-600">{value}{suffix}</strong></span>
      <input className="w-full accent-indigo-600" type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

function ChoiceGroup<T extends string>({ value, choices, onChange }: {
  value: T
  choices: readonly { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {choices.map((choice) => (
        <button
          key={choice.value}
          type="button"
          onClick={() => onChange(choice.value)}
          className={value === choice.value
            ? 'rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm'
            : 'rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-indigo-50'}
        >
          {choice.label}
        </button>
      ))}
    </div>
  )
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

const FUNCTION_STEPS: StepItem[] = [
  { id: 'domain', title: '观察定义域', desc: '先确认哪些输入属于函数的定义域。' },
  { id: 'rule', title: '应用对应法则', desc: '每个输入经过同一个对应法则得到输出。' },
  { id: 'unique', title: '检查唯一性', desc: '一个输入不能同时对应两个不同输出。' },
  { id: 'judge', title: '完成判断', desc: '三要素完整且满足唯一对应，才构成函数。' },
]

type MappingCase = 'valid' | 'duplicate' | 'missing'

export function FunctionConceptDemo() {
  const [mappingCase, setMappingCase] = useState<MappingCase>('valid')
  const player = usePlayer(FUNCTION_STEPS)
  const inputs = [-2, -1, 0, 1, 2]
  const outputs = [0, 1, 4]
  const leftX = 220
  const rightX = 600
  const yForInput = (index: number) => 92 + index * 70
  const yForOutput = (value: number) => 130 + outputs.indexOf(value) * 100
  const edges = inputs.flatMap((value, index) => {
    if (mappingCase === 'missing' && value === 0) return []
    const base = [{ from: index, to: value * value }]
    return mappingCase === 'duplicate' && value === 1 ? [...base, { from: index, to: 4 }] : base
  })
  const valid = mappingCase === 'valid'

  return (
    <ExperimentShell
      breadcrumb={['高等数学（上册）', '函数、极限与连续', '函数的概念']}
      title="函数的概念"
      subtitle="通过集合间的对应关系，理解定义域、值域、对应法则和唯一性。"
      legend={[{ label: '输入', color: '#3b82f6' }, { label: '输出', color: '#8b5cf6' }, { label: valid ? '有效对应' : '问题对应', color: valid ? '#10b981' : '#f43f5e' }]}
      canvas={(
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full min-h-[410px] w-full">
          <rect width={WIDTH} height={HEIGHT} rx="18" fill="#f8fafc" />
          <ellipse cx={leftX} cy="235" rx="115" ry="190" fill="#eff6ff" stroke="#93c5fd" strokeWidth="3" />
          <ellipse cx={rightX} cy="235" rx="115" ry="190" fill="#f5f3ff" stroke="#c4b5fd" strokeWidth="3" />
          <text x={leftX} y="34" textAnchor="middle" fill="#1d4ed8" fontWeight="700">定义域 X</text>
          <text x={rightX} y="34" textAnchor="middle" fill="#6d28d9" fontWeight="700">陪域 Y</text>
          {edges.slice(0, player.step + 1).map((edge, index) => (
            <line key={`${edge.from}-${edge.to}-${index}`} x1={leftX + 25} y1={yForInput(edge.from)} x2={rightX - 25} y2={yForOutput(edge.to)} stroke={valid ? '#10b981' : '#fb7185'} strokeWidth="3" markerEnd="url(#arrow)" />
          ))}
          <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill={valid ? '#10b981' : '#fb7185'} /></marker></defs>
          {inputs.map((value, index) => <g key={value}><circle cx={leftX} cy={yForInput(index)} r="21" fill="#fff" stroke="#3b82f6" strokeWidth="3" /><text x={leftX} y={yForInput(index) + 6} textAnchor="middle" fill="#1e3a8a" fontWeight="700">{value}</text></g>)}
          {outputs.map((value) => <g key={value}><circle cx={rightX} cy={yForOutput(value)} r="23" fill="#fff" stroke="#8b5cf6" strokeWidth="3" /><text x={rightX} y={yForOutput(value) + 6} textAnchor="middle" fill="#5b21b6" fontWeight="700">{value}</text></g>)}
          <rect x="315" y="390" width="190" height="48" rx="14" fill={valid ? '#ecfdf5' : '#fff1f2'} stroke={valid ? '#6ee7b7' : '#fda4af'} />
          <text x="410" y="420" textAnchor="middle" fill={valid ? '#047857' : '#be123c'} fontWeight="700">{valid ? '✓ 这是函数：y = x²' : '× 不满足函数定义'}</text>
        </svg>
      )}
      sidebar={(
        <>
          <ExperimentCard title="对应关系">
            <ChoiceGroup value={mappingCase} onChange={setMappingCase} choices={[
              { value: 'valid', label: '唯一对应' },
              { value: 'duplicate', label: '一对多' },
              { value: 'missing', label: '存在遗漏' },
            ]} />
          </ExperimentCard>
          <ExperimentCard title="函数判定" action={<span className={`rounded-full px-2 py-1 text-xs font-bold ${valid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{valid ? '成立' : '不成立'}</span>}>
            <p className="text-sm leading-6 text-slate-600">{valid ? '定义域中的每一个输入都有且只有一个输出。值域为 {0, 1, 4}。' : mappingCase === 'duplicate' ? '输入 1 同时指向两个输出，违反唯一性。' : '输入 0 没有输出，对应法则没有覆盖整个定义域。'}</p>
          </ExperimentCard>
          <ExperimentCard title="三要素"><ul className="space-y-2 text-sm text-slate-600"><li>• 定义域：允许输入的集合</li><li>• 值域：实际输出的集合</li><li>• 对应法则：从输入得到输出的方法</li></ul></ExperimentCard>
        </>
      )}
      player={player}
    />
  )
}

type FunctionKey = 'square' | 'linear' | 'absolute'
const FUNCTIONS: Record<FunctionKey, { label: string; formula: string; fn: (x: number) => number }> = {
  square: { label: '二次函数', formula: 'f(x) = x² − 1', fn: (x) => x * x - 1 },
  linear: { label: '一次函数', formula: 'f(x) = 1.5x + 1', fn: (x) => 1.5 * x + 1 },
  absolute: { label: '绝对值函数', formula: 'f(x) = |x|', fn: Math.abs },
}
const REPRESENTATION_STEPS: StepItem[] = [
  { id: 'formula', title: '读取解析式', desc: '解析式直接说明输入与输出的计算规则。' },
  { id: 'table', title: '生成数值表', desc: '选取若干输入，计算对应的函数值。' },
  { id: 'plot', title: '描出坐标点', desc: '把表格中的有序数对放入坐标系。' },
  { id: 'connect', title: '形成图像', desc: '连续连接所有点，得到函数的整体形态。' },
]

export function FunctionRepresentationDemo() {
  const [functionKey, setFunctionKey] = useState<FunctionKey>('square')
  const [selectedX, setSelectedX] = useState(1)
  const player = usePlayer(REPRESENTATION_STEPS)
  const current = FUNCTIONS[functionKey]
  const table = [-2, -1, 0, 1, 2].map((x) => ({ x, y: current.fn(x) }))
  const showTable = player.step >= 2
  const showPoints = player.step >= 3
  const showCurve = player.step >= 4
  const sx = (x: number) => PAD + ((x + 4) / 8) * (WIDTH - PAD * 2)
  const sy = (y: number) => HEIGHT - PAD - ((y + 4) / 10) * (HEIGHT - PAD * 2)

  return (
    <ExperimentShell
      breadcrumb={['高等数学（上册）', '函数、极限与连续', '函数的表示法']}
      title="函数的表示法"
      subtitle="让解析式、数值表和图像同步变化，观察三种表示如何描述同一个函数。"
      legend={[{ label: '函数图像', color: '#4f46e5' }, { label: '当前输入', color: '#f43f5e' }]}
      canvas={(
        <div className="grid h-full gap-4 p-3 lg:grid-cols-[1fr_220px]">
          <Plot series={showCurve ? [{ label: current.label, color: '#4f46e5', points: sample(current.fn) }] : []} yMin={-4} yMax={6}>
            {showPoints && table.map(({ x, y }) => <circle key={x} cx={sx(x)} cy={sy(y)} r="6" fill="#4f46e5" stroke="#fff" strokeWidth="3" />)}
            {showPoints && <line x1={sx(selectedX)} x2={sx(selectedX)} y1={sy(-4)} y2={sy(current.fn(selectedX))} stroke="#fb7185" strokeDasharray="7 6" strokeWidth="2" />}
            {showPoints && <circle cx={sx(selectedX)} cy={sy(current.fn(selectedX))} r="8" fill="#fff" stroke="#f43f5e" strokeWidth="4" />}
          </Plot>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-4 rounded-xl bg-indigo-50 p-3 text-center font-mono font-bold text-indigo-700">{current.formula}</div>
            {showTable ? <table className="w-full text-center text-sm"><thead><tr className="text-slate-400"><th>x</th><th>f(x)</th></tr></thead><tbody>{table.map((row) => <tr key={row.x} className={row.x === selectedX ? 'bg-rose-50 font-bold text-rose-600' : 'text-slate-600'}><td className="py-2">{row.x}</td><td>{row.y}</td></tr>)}</tbody></table> : <p className="py-8 text-center text-sm text-slate-400">下一步生成数值表</p>}
          </div>
        </div>
      )}
      sidebar={(
        <>
          <ExperimentCard title="选择函数"><ChoiceGroup value={functionKey} onChange={setFunctionKey} choices={(Object.entries(FUNCTIONS) as [FunctionKey, typeof FUNCTIONS[FunctionKey]][]).map(([value, item]) => ({ value, label: item.label }))} /></ExperimentCard>
          <ExperimentCard title="联动输入"><RangeControl label="x" value={selectedX} min={-2} max={2} step={1} onChange={setSelectedX} /><div className="mt-4 rounded-xl bg-slate-50 p-3 text-center font-mono text-sm text-slate-700">({selectedX}, {current.fn(selectedX)})</div></ExperimentCard>
          <ExperimentCard title="表示法关系"><p className="text-sm leading-6 text-slate-600">解析式给出规则，表格列出样本，图像展示整体。改变任意一处时，其余表示必须保持一致。</p></ExperimentCard>
        </>
      )}
      player={player}
    />
  )
}

type PropertyKey = 'square' | 'cube' | 'sine' | 'logistic'
const PROPERTY_FUNCTIONS: Record<PropertyKey, { label: string; formula: string; fn: (x: number) => number; properties: string[] }> = {
  square: { label: 'x²', formula: 'f(x)=x²', fn: (x) => x * x, properties: ['偶函数', '下有界', '分区间单调'] },
  cube: { label: 'x³', formula: 'f(x)=x³', fn: (x) => x ** 3, properties: ['奇函数', '严格递增', '无界'] },
  sine: { label: 'sin x', formula: 'f(x)=2sin x', fn: (x) => 2 * Math.sin(x), properties: ['奇函数', '周期 2π', '有界'] },
  logistic: { label: 'S 曲线', formula: 'f(x)=4/(1+e⁻ˣ)−2', fn: (x) => 4 / (1 + Math.exp(-x)) - 2, properties: ['严格递增', '有界', '非周期'] },
}
const PROPERTY_STEPS: StepItem[] = [
  { id: 'shape', title: '观察整体图像', desc: '先从图像形状形成直观判断。' },
  { id: 'symmetry', title: '检查对称性', desc: '比较 f(−x) 与 f(x)、−f(x)。' },
  { id: 'change', title: '检查增减与周期', desc: '比较输入增大时的函数值，并寻找重复图形。' },
  { id: 'bound', title: '总结函数性质', desc: '结合值域判断函数是否有界。' },
]

export function FunctionPropertiesDemo() {
  const [functionKey, setFunctionKey] = useState<PropertyKey>('sine')
  const player = usePlayer(PROPERTY_STEPS)
  const current = PROPERTY_FUNCTIONS[functionKey]
  return (
    <ExperimentShell
      breadcrumb={['高等数学（上册）', '函数、极限与连续', '函数的性质']}
      title="函数的性质"
      subtitle="从图像中识别有界性、单调性、奇偶性和周期性。"
      legend={[{ label: current.formula, color: '#4f46e5' }, { label: '对称参考', color: '#f59e0b' }]}
      canvas={<Plot series={[{ label: current.label, color: '#4f46e5', points: sample(current.fn, -6, 6) }, ...(player.step >= 2 ? [{ label: 'reflection', color: '#f59e0b', points: sample((x) => current.fn(-x), -6, 6), dashed: true }] : [])]} xMin={-6} xMax={6} yMin={-4} yMax={4} />}
      sidebar={(
        <>
          <ExperimentCard title="典型函数"><ChoiceGroup value={functionKey} onChange={setFunctionKey} choices={(Object.entries(PROPERTY_FUNCTIONS) as [PropertyKey, typeof PROPERTY_FUNCTIONS[PropertyKey]][]).map(([value, item]) => ({ value, label: item.label }))} /></ExperimentCard>
          <ExperimentCard title="性质结论"><div className="flex flex-wrap gap-2">{current.properties.map((property) => <span key={property} className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">✓ {property}</span>)}</div></ExperimentCard>
          <ExperimentCard title="判断方法"><p className="text-sm leading-6 text-slate-600">对称性看 f(−x)，单调性比较区间内函数值，周期性寻找最小重复距离，有界性检查图像能否被水平线夹住。</p></ExperimentCard>
        </>
      )}
      player={player}
    />
  )
}

type SequenceKey = 'reciprocal' | 'alternating' | 'geometric'
const SEQUENCES: Record<SequenceKey, { label: string; limit: number; term: (n: number) => number }> = {
  reciprocal: { label: 'aₙ = 1/n', limit: 0, term: (n) => 1 / n },
  alternating: { label: 'aₙ = (−1)ⁿ/n', limit: 0, term: (n) => ((n % 2 ? -1 : 1) / n) },
  geometric: { label: 'aₙ = (1/2)ⁿ', limit: 0, term: (n) => 0.5 ** n },
}
const SEQUENCE_STEPS: StepItem[] = [
  { id: 'terms', title: '观察数列项', desc: '项数增加时，散点逐渐靠近候选极限。' },
  { id: 'epsilon', title: '给定 ε', desc: '以极限 A 为中心画出宽度为 2ε 的误差带。' },
  { id: 'find-n', title: '寻找 N', desc: '找到使后续所有项都进入误差带的位置。' },
  { id: 'verify', title: '验证定义', desc: '当 n>N 时均有 |aₙ−A|<ε，数列收敛。' },
]

export function SequenceLimitDemo() {
  const [sequenceKey, setSequenceKey] = useState<SequenceKey>('alternating')
  const [epsilon, setEpsilon] = useState(0.18)
  const player = usePlayer(SEQUENCE_STEPS)
  const current = SEQUENCES[sequenceKey]
  const terms = Array.from({ length: 40 }, (_, index) => ({ n: index + 1, value: current.term(index + 1) }))
  const threshold = terms.find(({ n }) => terms.slice(n).every(({ value }) => Math.abs(value - current.limit) < epsilon))?.n ?? 40
  const sx = (n: number) => 62 + ((n - 1) / 39) * 700
  const sy = (value: number) => 235 - value * 165

  return (
    <ExperimentShell
      breadcrumb={['高等数学（上册）', '函数、极限与连续', '数列的极限']}
      title="数列的极限"
      subtitle="用 ε–N 语言观察数列尾项如何稳定进入极限附近。"
      legend={[{ label: '数列项', color: '#4f46e5' }, { label: 'ε 误差带', color: '#38bdf8' }, { label: 'N', color: '#f59e0b' }]}
      canvas={(
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full min-h-[410px] w-full">
          <rect width={WIDTH} height={HEIGHT} rx="18" fill="#f8fafc" />
          <rect x="56" y={sy(epsilon)} width="712" height={sy(-epsilon) - sy(epsilon)} fill="#bae6fd" opacity="0.5" />
          <line x1="56" x2="768" y1={sy(0)} y2={sy(0)} stroke="#0284c7" strokeWidth="2.5" strokeDasharray="8 6" />
          <line x1={sx(threshold)} x2={sx(threshold)} y1="48" y2="415" stroke="#f59e0b" strokeWidth="3" strokeDasharray="8 6" />
          <text x={sx(threshold) + 8} y="68" fill="#b45309" fontWeight="700">N = {threshold}</text>
          {terms.map(({ n, value }) => <circle key={n} cx={sx(n)} cy={sy(value)} r={n > threshold ? 5 : 6} fill={n > threshold ? '#10b981' : '#4f46e5'} opacity={player.step === 1 && n > 16 ? 0.18 : 1} />)}
          <text x="70" y={sy(epsilon) - 10} fill="#0284c7">A + ε</text><text x="70" y={sy(-epsilon) + 22} fill="#0284c7">A − ε</text>
        </svg>
      )}
      sidebar={(
        <>
          <ExperimentCard title="选择数列"><ChoiceGroup value={sequenceKey} onChange={setSequenceKey} choices={(Object.entries(SEQUENCES) as [SequenceKey, typeof SEQUENCES[SequenceKey]][]).map(([value, item]) => ({ value, label: item.label }))} /></ExperimentCard>
          <ExperimentCard title="误差要求"><RangeControl label="ε" value={epsilon} min={0.05} max={0.5} step={0.01} onChange={setEpsilon} /><div className="mt-4 rounded-xl bg-indigo-50 p-3 text-center text-sm text-indigo-700">当前可取 <strong>N = {threshold}</strong></div></ExperimentCard>
          <ExperimentCard title="ε–N 判断" action={<span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">收敛</span>}><p className="text-sm leading-6 text-slate-600">对任意 ε&gt;0，都能找到一个 N，使 n&gt;N 时 |aₙ−0|&lt;ε。</p></ExperimentCard>
        </>
      )}
      player={player}
    />
  )
}

type ContinuityCase = 'continuous' | 'removable' | 'jump' | 'infinite'
const CONTINUITY_CASES: Record<ContinuityCase, { label: string; conclusion: string }> = {
  continuous: { label: '连续', conclusion: '左右极限 = 函数值，连续' },
  removable: { label: '可去间断', conclusion: '极限存在，但不等于函数值' },
  jump: { label: '跳跃间断', conclusion: '左右极限存在但不相等' },
  infinite: { label: '无穷间断', conclusion: '函数值趋向无穷，极限不存在' },
}
const CONTINUITY_STEPS: StepItem[] = [
  { id: 'left', title: '从左侧靠近', desc: '观察 x→x₀⁻ 时函数值的变化。' },
  { id: 'right', title: '从右侧靠近', desc: '观察 x→x₀⁺ 时函数值的变化。' },
  { id: 'value', title: '比较函数值', desc: '把左右极限与 f(x₀) 放在一起比较。' },
  { id: 'classify', title: '判断连续性', desc: '根据三者关系判断连续或间断类型。' },
]

function continuitySeries(kind: ContinuityCase, x0: number): Series[] {
  if (kind === 'continuous') return [{ label: 'f', color: '#4f46e5', points: sample((x) => 0.25 * (x - x0) ** 2 + 0.5 * (x - x0) + 0.5) }]
  if (kind === 'removable') return [{ label: 'f', color: '#4f46e5', points: sample((x) => Math.abs(x - x0) < 0.035 ? Number.NaN : 0.7 * (x - x0) + 1) }]
  if (kind === 'jump') return [{ label: 'left', color: '#4f46e5', points: sample((x) => x < x0 ? 0.4 * x - 1 : Number.NaN) }, { label: 'right', color: '#8b5cf6', points: sample((x) => x >= x0 ? 0.4 * x + 1 : Number.NaN) }]
  return [{ label: 'left', color: '#4f46e5', points: sample((x) => Math.abs(x - x0) < 0.03 ? Number.NaN : 1 / (x - x0)) }]
}

export function ContinuityDemo() {
  const [kind, setKind] = useState<ContinuityCase>('removable')
  const [x0, setX0] = useState(0)
  const player = usePlayer(CONTINUITY_STEPS)
  const current = CONTINUITY_CASES[kind]
  const visibleSeries = continuitySeries(kind, x0).map((series) => ({
    ...series,
    points: player.step === 1 ? series.points.map((point) => point.x < x0 ? point : { ...point, y: Number.NaN }) : series.points,
  }))
  const showComparison = player.step >= 3
  const showConclusion = player.step >= 4
  const sx = (x: number) => PAD + ((x + 4) / 8) * (WIDTH - PAD * 2)
  const sy = (y: number) => HEIGHT - PAD - ((y + 4) / 8) * (HEIGHT - PAD * 2)
  const holeY = kind === 'removable' ? 1 : kind === 'jump' ? 0.4 * x0 - 1 : 0.5

  return (
    <ExperimentShell
      breadcrumb={['高等数学（上册）', '函数、极限与连续', '连续的概念']}
      title="连续的概念"
      subtitle="从左右极限与函数值的关系，辨认连续点和三类常见间断。"
      legend={[{ label: '函数曲线', color: '#4f46e5' }, { label: '考察点 x₀', color: '#f59e0b' }]}
      canvas={(
        <Plot series={visibleSeries}>
          <line x1={sx(x0)} x2={sx(x0)} y1="52" y2="414" stroke="#f59e0b" strokeDasharray="8 6" strokeWidth="2.5" />
          {showComparison && kind === 'removable' && <><circle cx={sx(x0)} cy={sy(holeY)} r="9" fill="#fff" stroke="#4f46e5" strokeWidth="4" /><circle cx={sx(x0)} cy={sy(2.7)} r="7" fill="#f43f5e" /></>}
          {showComparison && kind === 'jump' && <><circle cx={sx(x0)} cy={sy(0.4 * x0 - 1)} r="8" fill="#fff" stroke="#4f46e5" strokeWidth="4" /><circle cx={sx(x0)} cy={sy(0.4 * x0 + 1)} r="8" fill="#8b5cf6" /></>}
          {showComparison && kind === 'continuous' && <circle cx={sx(x0)} cy={sy(0.5)} r="8" fill="#10b981" />}
        </Plot>
      )}
      sidebar={(
        <>
          <ExperimentCard title="间断类型"><ChoiceGroup value={kind} onChange={setKind} choices={(Object.entries(CONTINUITY_CASES) as [ContinuityCase, typeof CONTINUITY_CASES[ContinuityCase]][]).map(([value, item]) => ({ value, label: item.label }))} /></ExperimentCard>
          <ExperimentCard title="考察位置"><RangeControl label="x₀" value={x0} min={-2} max={2} step={0.1} onChange={setX0} /></ExperimentCard>
          <ExperimentCard title="连续性判断" action={showConclusion ? <span className={`rounded-full px-2 py-1 text-xs font-bold ${kind === 'continuous' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{kind === 'continuous' ? '连续' : '间断'}</span> : undefined}><p className="text-sm leading-6 text-slate-600">{showConclusion ? current.conclusion : '完成左右逼近和函数值比较后，再给出连续性判断。'}</p>{showConclusion && <div className="mt-3 rounded-xl bg-slate-50 p-3 text-center font-mono text-sm">{kind === 'continuous' ? 'lim f(x) = f(x₀)' : kind === 'removable' ? 'lim f(x) 存在，但 ≠ f(x₀)' : kind === 'jump' ? 'lim₋ f(x) ≠ lim₊ f(x)' : 'lim f(x) 不是有限值'}</div>}</ExperimentCard>
        </>
      )}
      player={player}
    />
  )
}

type TheoremKey = 'zero' | 'intermediate' | 'extrema'
const THEOREMS: Record<TheoremKey, { label: string; title: string; conclusion: string }> = {
  zero: { label: '零点定理', title: 'f(a)·f(b)<0', conclusion: '区间内部至少存在一个零点 ξ。' },
  intermediate: { label: '介值定理', title: 'μ 介于 f(a), f(b) 之间', conclusion: '至少存在 ξ，使 f(ξ)=μ。' },
  extrema: { label: '最值定理', title: '闭区间上连续', conclusion: '函数一定能取得最大值和最小值。' },
}
const CONTINUITY_PROPERTY_STEPS: StepItem[] = [
  { id: 'interval', title: '选择闭区间', desc: '先固定连续函数所在的闭区间 [a,b]。' },
  { id: 'condition', title: '检查定理条件', desc: '确认连续性及端点值等前提。' },
  { id: 'locate', title: '定位特殊点', desc: '在图像上寻找零点、介值点或极值点。' },
  { id: 'conclude', title: '得到存在性结论', desc: '定理保证点存在，不一定直接给出精确位置。' },
]

export function ContinuityPropertiesDemo() {
  const [theorem, setTheorem] = useState<TheoremKey>('zero')
  const player = usePlayer(CONTINUITY_PROPERTY_STEPS)
  const current = THEOREMS[theorem]
  const fn = (x: number) => 0.18 * x ** 3 - 0.9 * x + 0.3
  const points = sample(fn, -3, 3)
  const sx = (x: number) => PAD + ((x + 3) / 6) * (WIDTH - PAD * 2)
  const sy = (y: number) => HEIGHT - PAD - ((y + 3) / 6) * (HEIGHT - PAD * 2)
  const markers = theorem === 'zero'
    ? [{ x: 0.34, y: 0, label: 'ξ' }]
    : theorem === 'intermediate'
      ? [{ x: -1.55, y: fn(-1.55), label: 'ξ' }]
      : [
          { x: -Math.sqrt(5 / 3), y: fn(-Math.sqrt(5 / 3)), label: '最大值' },
          { x: Math.sqrt(5 / 3), y: fn(Math.sqrt(5 / 3)), label: '最小值' },
        ]
  const showCondition = player.step >= 2
  const showMarkers = player.step >= 3
  const showConclusion = player.step >= 4

  return (
    <ExperimentShell
      breadcrumb={['高等数学（上册）', '函数、极限与连续', '连续函数的性质']}
      title="连续函数的性质"
      subtitle="把闭区间上的连续性转化为零点、介值和最值的存在性保证。"
      legend={[{ label: '连续函数', color: '#4f46e5' }, { label: '定理保证的点', color: '#10b981' }]}
      canvas={(
        <Plot series={[{ label: 'f', color: '#4f46e5', points }]} xMin={-3} xMax={3} yMin={-3} yMax={3}>
          <rect x={sx(-2.5)} y="56" width={sx(2.5) - sx(-2.5)} height="358" fill="#dbeafe" opacity="0.22" />
          <line x1={sx(-2.5)} x2={sx(-2.5)} y1="56" y2="414" stroke="#60a5fa" strokeDasharray="8 6" />
          <line x1={sx(2.5)} x2={sx(2.5)} y1="56" y2="414" stroke="#60a5fa" strokeDasharray="8 6" />
          {showMarkers && markers.map((marker) => <g key={marker.label}><circle cx={sx(marker.x)} cy={sy(marker.y)} r="10" fill="#10b981" stroke="#fff" strokeWidth="4" /><text x={sx(marker.x) + 13} y={sy(marker.y) - 12} fill="#047857" fontWeight="700">{marker.label}</text></g>)}
        </Plot>
      )}
      sidebar={(
        <>
          <ExperimentCard title="选择定理"><ChoiceGroup value={theorem} onChange={setTheorem} choices={(Object.entries(THEOREMS) as [TheoremKey, typeof THEOREMS[TheoremKey]][]).map(([value, item]) => ({ value, label: item.label }))} /></ExperimentCard>
          <ExperimentCard title="成立条件"><div className="rounded-xl bg-indigo-50 p-4 text-center font-mono font-bold text-indigo-700">{current.title}</div>{showCondition ? <ul className="mt-3 space-y-2 text-sm text-slate-600"><li>✓ 定义在闭区间 [a,b]</li><li>✓ 在 [a,b] 上连续</li></ul> : <p className="mt-3 text-sm text-slate-400">下一步检查定理前提</p>}</ExperimentCard>
          <ExperimentCard title="教学结论" action={showConclusion ? <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">条件满足</span> : undefined}><p className="text-sm leading-6 text-slate-600">{showConclusion ? current.conclusion : '定位图像中的特殊点后，再形成定理结论。'}</p></ExperimentCard>
        </>
      )}
      player={player}
    />
  )
}

type TaylorFunction = 'sin' | 'cos' | 'exp'
const TAYLOR_FUNCTIONS: Record<TaylorFunction, { label: string; fn: (x: number) => number; derivative: (order: number, center: number) => number }> = {
  sin: { label: 'sin x', fn: Math.sin, derivative: (order, center) => [Math.sin, Math.cos, (x: number) => -Math.sin(x), (x: number) => -Math.cos(x)][order % 4](center) },
  cos: { label: 'cos x', fn: Math.cos, derivative: (order, center) => [Math.cos, (x: number) => -Math.sin(x), (x: number) => -Math.cos(x), Math.sin][order % 4](center) },
  exp: { label: 'eˣ', fn: Math.exp, derivative: (_order, center) => Math.exp(center) },
}
const factorial = (value: number) => Array.from({ length: value }, (_, index) => index + 1).reduce((total, item) => total * item, 1)
const TAYLOR_STEPS: StepItem[] = [
  { id: 'center', title: '选择展开中心', desc: '多项式首先在 x₀ 处与原函数相等。' },
  { id: 'slope', title: '匹配低阶导数', desc: '增加一次项后，切线斜率也保持一致。' },
  { id: 'order', title: '提高展开阶数', desc: '更多导数信息让多项式在中心附近更贴合。' },
  { id: 'error', title: '观察余项误差', desc: '离中心越远，有限阶近似的余项通常越明显。' },
]

export function TaylorDemo() {
  const [functionKey, setFunctionKey] = useState<TaylorFunction>('sin')
  const [order, setOrder] = useState(5)
  const [center, setCenter] = useState(0)
  const player = usePlayer(TAYLOR_STEPS)
  const current = TAYLOR_FUNCTIONS[functionKey]
  const effectiveOrder = Math.min(order, player.step === 1 ? 0 : player.step === 2 ? 1 : order)
  const polynomial = useMemo(() => (x: number) => Array.from({ length: effectiveOrder + 1 }, (_, n) => current.derivative(n, center) * ((x - center) ** n) / factorial(n)).reduce((sum, term) => sum + term, 0), [center, current, effectiveOrder])
  const probe = center + 1.5
  const error = Math.abs(current.fn(probe) - polynomial(probe))
  const sx = (x: number) => PAD + ((x + 4) / 8) * (WIDTH - PAD * 2)

  return (
    <ExperimentShell
      breadcrumb={['高等数学（上册）', '微分中值定理与导数的应用', '泰勒公式']}
      title="泰勒公式"
      subtitle="用函数在一点的各阶导数，构造局部多项式并观察余项误差。"
      legend={[{ label: '原函数', color: '#4f46e5' }, { label: `${effectiveOrder} 阶泰勒多项式`, color: '#f43f5e' }]}
      canvas={(
        <Plot series={[{ label: 'source', color: '#4f46e5', points: sample(current.fn) }, { label: 'taylor', color: '#f43f5e', points: sample(polynomial) }]} yMin={-4} yMax={4}>
          <line x1={sx(center)} x2={sx(center)} y1="52" y2="414" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="8 6" />
          <text x={sx(center) + 8} y="72" fill="#b45309" fontWeight="700">展开中心 x₀</text>
        </Plot>
      )}
      sidebar={(
        <>
          <ExperimentCard title="选择函数"><ChoiceGroup value={functionKey} onChange={setFunctionKey} choices={(Object.entries(TAYLOR_FUNCTIONS) as [TaylorFunction, typeof TAYLOR_FUNCTIONS[TaylorFunction]][]).map(([value, item]) => ({ value, label: item.label }))} /></ExperimentCard>
          <ExperimentCard title="展开参数"><div className="space-y-5"><RangeControl label="展开阶数 n" value={order} min={1} max={9} step={1} onChange={setOrder} /><RangeControl label="展开中心 x₀" value={center} min={-1} max={1} step={0.1} onChange={setCenter} /></div></ExperimentCard>
          <ExperimentCard title="余项误差" action={<span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-600">n={effectiveOrder}</span>}><p className="text-sm leading-6 text-slate-600">在 x=x₀+1.5 处：</p><div className="mt-3 rounded-xl bg-slate-50 p-3 text-center font-mono font-bold text-slate-700">|Rₙ(x)| ≈ {error.toExponential(2)}</div></ExperimentCard>
        </>
      )}
      player={player}
    />
  )
}
