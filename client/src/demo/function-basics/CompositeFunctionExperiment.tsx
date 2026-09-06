import CartesianPlane from './shared/CartesianPlane'
import FunctionExperimentLayout, { RangeControl } from './shared/FunctionExperimentLayout'
import { curvePath, sx, sy } from './shared/math'
import { useTeachingPlayer, type TeachingStep } from './shared/useTeachingPlayer'
type State={x:number;showG:boolean;showF:boolean;showComposite:boolean}
const initial:State={x:1,showG:false,showF:false,showComposite:false}
const steps:TeachingStep<State>[]=[
 {id:'input',title:'输入 x',desc:'从一个输入值开始追踪运算链。',state:{x:1,showG:false,showF:false,showComposite:false}},
 {id:'inner',title:'先经过 g',desc:'计算中间量 u=g(x)。',state:{x:1.8,showG:true}},
 {id:'outer',title:'再进入 f',desc:'把 u 作为 f 的输入得到最终输出。',state:{showF:true}},
 {id:'compose',title:'形成复合图像',desc:'显示 f(g(x)) 并与两个基础函数比较。',state:{showG:true,showF:true,showComposite:true}},
]
export default function CompositeFunctionExperiment(){const{state,setState,step,player}=useTeachingPlayer(initial,steps);const g=(x:number)=>.6*x-1;const f=(x:number)=>.22*x*x-.5;const c=(x:number)=>f(g(x));const u=g(state.x),y=f(u);return <FunctionExperimentLayout pointId="hm-01-07" player={player} observation={`${steps[step-1].desc} ${state.x.toFixed(1)} → ${u.toFixed(2)} → ${y.toFixed(2)}`} legend={[{label:'g(x)',color:'#10b981'},{label:'f(x)',color:'#a855f7'},{label:'f(g(x))',color:'#2563eb'}]} controls={<RangeControl label="输入 x" value={state.x} min={-4} max={4} onChange={(x)=>setState({...state,x})}/>} canvas={<CartesianPlane testId="composite-function-scene">{state.showG&&<path d={curvePath(g)} fill="none" stroke="#10b981" strokeWidth="4"/>}{state.showF&&<path d={curvePath(f)} fill="none" stroke="#a855f7" strokeWidth="4" strokeDasharray="8 6"/>}{state.showComposite&&<path d={curvePath(c)} fill="none" stroke="#2563eb" strokeWidth="6"/>}<g><circle cx={sx(state.x)} cy={sy(0)} r="7" fill="#f59e0b"/><path d={`M ${sx(state.x)} ${sy(0)} L ${sx(state.x)} ${sy(u)} L ${sx(u)} ${sy(u)} L ${sx(u)} ${sy(y)}`} fill="none" stroke="#f43f5e" strokeWidth="3" strokeDasharray="6 5"/><text x="80" y="85" fill="#334155" fontSize="20">x → g(x) → f(g(x))</text></g></CartesianPlane>}/>}
