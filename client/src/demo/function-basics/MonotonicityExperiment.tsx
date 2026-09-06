import CartesianPlane from './shared/CartesianPlane'
import FunctionExperimentLayout, { RangeControl } from './shared/FunctionExperimentLayout'
import { curvePath, sx, sy } from './shared/math'
import { useTeachingPlayer, type TeachingStep } from './shared/useTeachingPlayer'
type State = { left: number; right: number; showSecant: boolean; showSign: boolean }
const initial: State = { left: -3, right: 2, showSecant: false, showSign: false }
const steps: TeachingStep<State>[] = [
  { id: 'interval', title: '选择区间', desc: '选取两个横坐标作为观察区间。', state: { left: -3, right: 2, showSecant: false, showSign: false } },
  { id: 'values', title: '比较函数值', desc: '比较左、右端点函数值的大小。', state: { left: -2.5, right: -.5, showSecant: true } },
  { id: 'sign', title: '检查变化率', desc: '显示导数符号带，定位增区间与减区间。', state: { left: -2, right: 2, showSign: true } },
  { id: 'conclude', title: '验证单调区间', desc: '让区间跨过极值点，验证单调性不能跨区间拼接。', state: { left: -3, right: 3, showSecant: true, showSign: true } },
]
export default function MonotonicityExperiment() {
  const { state, setState, step, player } = useTeachingPlayer(initial, steps)
  const fn = (x: number) => .12 * x ** 3 - .75 * x
  const rising = fn(state.right) > fn(state.left)
  return <FunctionExperimentLayout pointId="hm-01-03" player={player} observation={`${steps[step - 1].desc} 端点总体变化：${rising ? '上升' : '下降'}。`} legend={[{ label: '函数', color: '#2563eb' }, { label: '割线', color: '#f43f5e' }, { label: "f'(x) 符号", color: '#10b981' }]}
    controls={<div className="space-y-5"><RangeControl label="区间左端" value={state.left} min={-4} max={state.right - .2} onChange={(left) => setState({ ...state, left })} /><RangeControl label="区间右端" value={state.right} min={state.left + .2} max={4} onChange={(right) => setState({ ...state, right })} /></div>}
    canvas={<CartesianPlane testId="monotonicity-scene"><path d={curvePath(fn)} fill="none" stroke="#2563eb" strokeWidth="5" />{state.showSecant && <line x1={sx(state.left)} y1={sy(fn(state.left))} x2={sx(state.right)} y2={sy(fn(state.right))} stroke="#f43f5e" strokeWidth="4" />}{[state.left, state.right].map((x) => <circle key={x} cx={sx(x)} cy={sy(fn(x))} r="8" fill="#f43f5e" />)}{state.showSign && <g><rect x={sx(-4)} y="420" width={sx(-1.44)-sx(-4)} height="18" rx="9" fill="#10b981"/><rect x={sx(-1.44)} y="420" width={sx(1.44)-sx(-1.44)} height="18" fill="#f59e0b"/><rect x={sx(1.44)} y="420" width={sx(4)-sx(1.44)} height="18" rx="9" fill="#10b981"/><text x="70" y="410" fill="#475569" fontSize="14">f′(x)： +　　−　　+</text></g>}</CartesianPlane>} />
}
