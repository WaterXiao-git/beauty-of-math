import CartesianPlane from './shared/CartesianPlane'
import FunctionExperimentLayout, { RangeControl } from './shared/FunctionExperimentLayout'
import { curvePath, sx, sy } from './shared/math'
import { useTeachingPlayer, type TeachingStep } from './shared/useTeachingPlayer'
type State = { mix: number; x: number; reflect: boolean; compare: boolean }
const initial: State = { mix: 0, x: 2, reflect: false, compare: false }
const steps: TeachingStep<State>[] = [
  { id: 'point', title: '选择对称点', desc: '在 x 与 -x 处选取一对横坐标。', state: { x: 2, reflect: false, compare: false } },
  { id: 'reflect', title: '关于纵轴反射', desc: '把右侧曲线映射到左侧。', state: { reflect: true } },
  { id: 'values', title: '比较函数值', desc: '同时读出 f(x)、f(-x) 与 -f(x)。', state: { compare: true } },
  { id: 'judge', title: '判断奇偶性', desc: '加入奇函数成分，观察对称关系何时被破坏。', state: { mix: .35, reflect: true, compare: true } },
]
export default function ParityExperiment() {
  const { state, setState, step, player } = useTeachingPlayer(initial, steps)
  const fn = (x: number) => .12 * x * x + state.mix * x - 1
  const verdict = Math.abs(state.mix) < .01 ? '偶函数' : '非奇非偶函数'
  return <FunctionExperimentLayout pointId="hm-01-04" player={player} observation={`${steps[step - 1].desc} 当前判断：${verdict}。`} legend={[{ label: 'f(x)', color: '#2563eb' }, { label: '纵轴反射', color: '#a855f7' }, { label: '配对点', color: '#f43f5e' }]}
    controls={<div className="space-y-5"><RangeControl label="奇函数成分系数" value={state.mix} min={-1} max={1} onChange={(mix) => setState({ ...state, mix })} /><RangeControl label="配对横坐标 x" value={state.x} min={.3} max={4} onChange={(x) => setState({ ...state, x })} /></div>}
    canvas={<CartesianPlane testId="parity-scene"><path d={curvePath(fn)} fill="none" stroke="#2563eb" strokeWidth="5" />{state.reflect && <path d={curvePath((x) => fn(-x))} fill="none" stroke="#a855f7" strokeWidth="4" strokeDasharray="8 6" />}{[-state.x, state.x].map((x) => <circle key={x} cx={sx(x)} cy={sy(fn(x))} r="8" fill="#f43f5e" />)}{state.compare && <text x="75" y="90" fill="#334155" fontSize="18">f(x)={fn(state.x).toFixed(2)}　f(-x)={fn(-state.x).toFixed(2)}　-f(x)={(-fn(state.x)).toFixed(2)}</text>}</CartesianPlane>} />
}
