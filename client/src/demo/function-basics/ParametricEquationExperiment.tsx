import FunctionExperimentLayout, { RangeControl } from './shared/FunctionExperimentLayout'
import { VIEW_H,VIEW_W } from './shared/math'
import { useTeachingPlayer, type TeachingStep } from './shared/useTeachingPlayer'
type State={t:number;trace:boolean;tangent:boolean;components:boolean}
const initial:State={t:0,trace:false,tangent:false,components:false}
const steps:TeachingStep<State>[]=[
 {id:'parameter',title:'推动参数 t',desc:'参数 t 同时控制横坐标和纵坐标。',state:{t:.8,trace:false,tangent:false,components:false}},
 {id:'components',title:'分解 x(t), y(t)',desc:'分别读取两个随 t 变化的坐标分量。',state:{t:1.8,components:true}},
 {id:'trace',title:'留下运动轨迹',desc:'累积此前位置形成参数曲线。',state:{t:4.6,trace:true}},
 {id:'tangent',title:'观察运动方向',desc:'显示速度向量与当前切线方向。',state:{t:5.5,trace:true,tangent:true,components:true}},
]
const px=(x:number)=>450+x*120,py=(y:number)=>250-y*120
export default function ParametricEquationExperiment(){const{state,setState,step,player}=useTeachingPlayer(initial,steps);const x=(t:number)=>2.3*Math.cos(t);const y=(t:number)=>1.45*Math.sin(t);const samples=Array.from({length:121},(_,i)=>state.trace?state.t*i/120:2*Math.PI*i/120);const d=samples.map((t,i)=>`${i?'L':'M'} ${px(x(t))} ${py(y(t))}`).join(' ');return <FunctionExperimentLayout pointId="hm-01-09" player={player} observation={`${steps[step-1].desc} 当前 P(t)=(${x(state.t).toFixed(2)}, ${y(state.t).toFixed(2)})。`} legend={[{label:'参数轨迹',color:'#2563eb'},{label:'运动点',color:'#f43f5e'},{label:'速度方向',color:'#10b981'}]} controls={<RangeControl label="参数 t" value={state.t} min={0} max={6.28} step={.01} onChange={(t)=>setState({...state,t,trace:true})}/>} canvas={<svg data-testid="parametric-equation-scene" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-full min-h-[430px] w-full"><rect width={VIEW_W} height={VIEW_H} fill="#fbfdff"/><line x1="60" y1="250" x2="840" y2="250" stroke="#94a3b8"/><line x1="450" y1="50" x2="450" y2="450" stroke="#94a3b8"/><path d={d} fill="none" stroke="#2563eb" strokeWidth="6"/><circle cx={px(x(state.t))} cy={py(y(state.t))} r="10" fill="#f43f5e"/>{state.components&&<><line x1={px(x(state.t))} y1={py(y(state.t))} x2={px(x(state.t))} y2="250" stroke="#f59e0b" strokeDasharray="6 5"/><line x1={px(x(state.t))} y1={py(y(state.t))} x2="450" y2={py(y(state.t))} stroke="#a855f7" strokeDasharray="6 5"/></>}{state.tangent&&<line x1={px(x(state.t))-50*(-2.3*Math.sin(state.t))} y1={py(y(state.t))+50*(1.45*Math.cos(state.t))} x2={px(x(state.t))+50*(-2.3*Math.sin(state.t))} y2={py(y(state.t))-50*(1.45*Math.cos(state.t))} stroke="#10b981" strokeWidth="4"/>}</svg>}/>}
