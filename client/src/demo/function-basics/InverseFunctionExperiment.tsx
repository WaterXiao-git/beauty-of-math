import CartesianPlane from './shared/CartesianPlane'
import FunctionExperimentLayout, { RangeControl } from './shared/FunctionExperimentLayout'
import { curvePath, sx, sy } from './shared/math'
import { useTeachingPlayer, type TeachingStep } from './shared/useTeachingPlayer'
type State = { x: number; reflect: boolean; pairs: boolean; horizontal: boolean }
const initial: State = { x: 1, reflect: false, pairs: false, horizontal: false }
const steps: TeachingStep<State>[] = [
  { id: 'mapping', title: '建立一一对应', desc: '跟踪 x 经过 f 后得到 y。', state: { x: 1, reflect: false, pairs: true, horizontal: false } },
  { id: 'swap', title: '交换输入输出', desc: '把点 (x,y) 交换为 (y,x)。', state: { x: 1.6, reflect: false, pairs: true } },
  { id: 'reflect', title: '关于 y=x 对称', desc: '显示反函数曲线与原函数的镜像关系。', state: { reflect: true } },
  { id: 'test', title: '检验可逆性', desc: '用水平线检验每个输出是否只对应一个输入。', state: { reflect: true, horizontal: true } },
]
export default function InverseFunctionExperiment() {
  const { state, setState, step, player } = useTeachingPlayer(initial, steps)
  const fn = (x: number) => .55 * x + .7; const inv = (x: number) => (x - .7) / .55; const y = fn(state.x)
  return <FunctionExperimentLayout pointId="hm-01-06" player={player} observation={`${steps[step - 1].desc} 当前点 (${state.x.toFixed(1)}, ${y.toFixed(1)}) ↔ (${y.toFixed(1)}, ${state.x.toFixed(1)})。`} legend={[{label:'原函数',color:'#2563eb'},{label:'反函数',color:'#a855f7'},{label:'y=x',color:'#94a3b8'}]}
    controls={<RangeControl label="输入 x" value={state.x} min={-3} max={3} onChange={(x)=>setState({...state,x,pairs:true})}/>} canvas={<CartesianPlane testId="inverse-function-scene"><path d={curvePath(fn)} fill="none" stroke="#2563eb" strokeWidth="5"/><path d={curvePath((x)=>x)} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="7 6"/>{state.reflect&&<path d={curvePath(inv)} fill="none" stroke="#a855f7" strokeWidth="5"/>}{state.pairs&&<><circle cx={sx(state.x)} cy={sy(y)} r="8" fill="#f43f5e"/><circle cx={sx(y)} cy={sy(state.x)} r="8" fill="#f59e0b"/><line x1={sx(state.x)} y1={sy(y)} x2={sx(y)} y2={sy(state.x)} stroke="#64748b" strokeDasharray="5 5"/></>}{state.horizontal&&<line x1={sx(-5)} y1={sy(y)} x2={sx(5)} y2={sy(y)} stroke="#10b981" strokeWidth="3"/>}</CartesianPlane>}/>
}
