import CartesianPlane from './shared/CartesianPlane'
import FunctionExperimentLayout, { RangeControl } from './shared/FunctionExperimentLayout'
import { curvePath } from './shared/math'
import { useTeachingPlayer, type TeachingStep } from './shared/useTeachingPlayer'
type State = { period: number; overlay: boolean; mismatch: boolean; marks: boolean }
const initial: State = { period: 4, overlay: false, mismatch: false, marks: false }
const steps: TeachingStep<State>[] = [
  { id: 'repeat', title: '观察重复图样', desc: '先寻找波形重复出现的候选距离。', state: { period: 4, overlay: false, mismatch: false, marks: true } },
  { id: 'shift', title: '平移候选周期', desc: '把 f(x+T) 平移到同一坐标系。', state: { period: 4, overlay: true } },
  { id: 'error', title: '测量重合误差', desc: '显示候选周期下两条曲线的最大偏差。', state: { period: 3.4, mismatch: true, overlay: true } },
  { id: 'verify', title: '锁定最小正周期', desc: '恢复 T=4，验证曲线完全重合。', state: { period: 4, mismatch: true, overlay: true, marks: true } },
]
export default function PeriodicityExperiment() {
  const { state, setState, step, player } = useTeachingPlayer(initial, steps)
  const fn = (x: number) => 1.5 * Math.sin(Math.PI * x / 2)
  const error = Math.abs(3 * Math.sin(Math.PI * state.period / 4))
  return <FunctionExperimentLayout pointId="hm-01-05" player={player} observation={`${steps[step - 1].desc} 最大重合误差约 ${error.toFixed(3)}。`} legend={[{ label: 'f(x)', color: '#2563eb' }, { label: 'f(x+T)', color: '#f43f5e' }]}
    controls={<RangeControl label="候选周期 T" value={state.period} min={1} max={6} onChange={(period) => setState({ ...state, period, overlay: true, mismatch: true })} />}
    canvas={<CartesianPlane testId="periodicity-scene"><path d={curvePath(fn)} fill="none" stroke="#2563eb" strokeWidth="5" />{state.overlay && <path d={curvePath((x) => fn(x + state.period))} fill="none" stroke="#f43f5e" strokeWidth="4" strokeDasharray="9 6" />}{state.marks && <g><line x1="210" y1="100" x2="527" y2="100" stroke="#f59e0b" strokeWidth="3" markerEnd="url(#arrow)"/><text x="350" y="88" fill="#b45309" fontSize="18">T = {state.period.toFixed(1)}</text></g>}{state.mismatch && <text x="70" y="445" fill={error < .01 ? '#059669' : '#dc2626'} fontSize="18" fontWeight="700">重合误差：{error.toFixed(3)}</text>}</CartesianPlane>} />
}
