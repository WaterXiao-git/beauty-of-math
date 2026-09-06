import CartesianPlane from './shared/CartesianPlane'
import FunctionExperimentLayout, { RangeControl } from './shared/FunctionExperimentLayout'
import { curvePath, sx, sy } from './shared/math'
import { useTeachingPlayer, type TeachingStep } from './shared/useTeachingPlayer'

type State = { a: number; sampleCount: number; showPoints: boolean; showCurve: boolean }
const initial: State = { a: .5, sampleCount: 5, showPoints: false, showCurve: false }
const steps: TeachingStep<State>[] = [
  { id: 'rule', title: '读出对应法则', desc: '先确认 y=ax²-1 如何把输入变成输出。', state: { showPoints: false, showCurve: false, sampleCount: 5 } },
  { id: 'table', title: '生成数值表', desc: '选取有限个 x，计算对应的 y。', state: { sampleCount: 7, showPoints: false } },
  { id: 'points', title: '描出坐标点', desc: '把数值对标到平面中。', state: { sampleCount: 9, showPoints: true, showCurve: false } },
  { id: 'curve', title: '连接成图像', desc: '增加采样并观察点列形成连续曲线。', state: { sampleCount: 31, showPoints: true, showCurve: true } },
]

export default function FunctionGraphExperiment() {
  const { state, setState, step, player } = useTeachingPlayer(initial, steps)
  const fn = (x: number) => state.a * x * x - 1
  const xs = Array.from({ length: state.sampleCount }, (_, i) => -3 + 6 * i / (state.sampleCount - 1))
  return <FunctionExperimentLayout pointId="hm-01-02" player={player} observation={`${steps[step - 1].desc} 当前使用 ${state.sampleCount} 个样本点。`} legend={[{ label: '坐标点', color: '#f43f5e' }, { label: '函数图像', color: '#2563eb' }]}
    controls={<div className="space-y-4"><RangeControl label="二次项系数 a" value={state.a} min={-.7} max={.7} onChange={(a) => setState({ ...state, a })} /><div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-500">{xs.slice(0, 3).map((x) => <span key={x}>({x.toFixed(1)}, {fn(x).toFixed(1)})</span>)}</div></div>}
    canvas={<CartesianPlane testId="function-graph-scene">{state.showCurve && <path d={curvePath(fn)} fill="none" stroke="#2563eb" strokeWidth="5" />}{(state.showPoints || step === 2) && xs.map((x) => <circle key={x} cx={sx(x)} cy={sy(fn(x))} r={state.sampleCount > 20 ? 3 : 7} fill="#f43f5e" />)}{step === 1 && <text x="92" y="95" fill="#4338ca" fontSize="25" fontWeight="700">y = {state.a.toFixed(1)}x² − 1</text>}</CartesianPlane>} />
}
