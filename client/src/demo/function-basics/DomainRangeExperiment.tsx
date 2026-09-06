import CartesianPlane from './shared/CartesianPlane'
import FunctionExperimentLayout, { RangeControl } from './shared/FunctionExperimentLayout'
import { curvePath, sx, sy } from './shared/math'
import { useTeachingPlayer, type TeachingStep } from './shared/useTeachingPlayer'

type State = { left: number; right: number; showDomain: boolean; showRange: boolean }
const initial: State = { left: -3, right: 3, showDomain: false, showRange: false }
const steps: TeachingStep<State>[] = [
  { id: 'domain', title: '选定定义域', desc: '在 x 轴上选定允许输入的区间。', state: { left: -3, right: 3, showDomain: true, showRange: false } },
  { id: 'inputs', title: '扫描输入', desc: '移动区间端点，观察哪些 x 能进入函数。', state: { left: -4, right: 2, showDomain: true } },
  { id: 'project', title: '投影值域', desc: '把曲线上的输出投影到 y 轴。', state: { showRange: true } },
  { id: 'verify', title: '核对端点', desc: '比较端点函数值并读出完整值域。', state: { left: -2, right: 3, showDomain: true, showRange: true } },
]

export default function DomainRangeExperiment() {
  const { state, setState, step, player } = useTeachingPlayer(initial, steps)
  const fn = (x: number) => 0.18 * (x - 0.5) ** 2 - 1.4
  const samples = Array.from({ length: 101 }, (_, i) => fn(state.left + (state.right - state.left) * i / 100))
  const minY = Math.min(...samples); const maxY = Math.max(...samples)
  return <FunctionExperimentLayout pointId="hm-01-01" player={player} observation={steps[step - 1].desc} legend={[{ label: '函数曲线', color: '#2563eb' }, { label: '定义域', color: '#f59e0b' }, { label: '值域', color: '#10b981' }]}
    controls={<div className="space-y-5"><RangeControl label="定义域左端点" value={state.left} min={-5} max={state.right - .2} onChange={(left) => setState({ ...state, left })} /><RangeControl label="定义域右端点" value={state.right} min={state.left + .2} max={5} onChange={(right) => setState({ ...state, right })} /></div>}
    canvas={<CartesianPlane testId="domain-range-scene"><path d={curvePath(fn)} fill="none" stroke="#cbd5e1" strokeWidth="3" /><path d={curvePath(fn, state.left, state.right)} fill="none" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />{state.showDomain && <line x1={sx(state.left)} y1={sy(0)} x2={sx(state.right)} y2={sy(0)} stroke="#f59e0b" strokeWidth="9" opacity=".65" />}{state.showRange && <line x1={sx(0)} y1={sy(minY)} x2={sx(0)} y2={sy(maxY)} stroke="#10b981" strokeWidth="9" opacity=".65" />}{[state.left, state.right].map((x) => <g key={x}><circle cx={sx(x)} cy={sy(fn(x))} r="8" fill="#ef4444" /><line x1={sx(x)} y1={sy(fn(x))} x2={sx(x)} y2={sy(0)} stroke="#f59e0b" strokeDasharray="6 5" /></g>)}</CartesianPlane>} />
}
