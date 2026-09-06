import CartesianPlane from './shared/CartesianPlane'
import FunctionExperimentLayout from './shared/FunctionExperimentLayout'
import { curvePath } from './shared/math'
import { useTeachingPlayer, type TeachingStep } from './shared/useTeachingPlayer'
type Family='power'|'exp'|'log'|'trig';type State={family:Family;compare:boolean;features:boolean}
const initial:State={family:'power',compare:false,features:false}
const steps:TeachingStep<State>[]=[
 {id:'power',title:'幂函数族',desc:'观察 x、x²、√x 的定义域和形态。',state:{family:'power',compare:false,features:false}},
 {id:'exponential',title:'指数与对数',desc:'比较互为反函数的 eˣ 与 ln x。',state:{family:'exp',compare:true}},
 {id:'trigonometric',title:'三角函数',desc:'观察 sin x 的周期、零点和有界性。',state:{family:'trig',compare:false}},
 {id:'features',title:'归纳核心特征',desc:'叠加关键点，比较各函数族的定义域、值域与变化趋势。',state:{family:'log',compare:true,features:true}},
]
const options:[Family,string][]=[['power','幂函数'],['exp','指数'],['log','对数'],['trig','三角']]
export default function ElementaryFunctionsExperiment(){const{state,setState,step,player}=useTeachingPlayer(initial,steps);const defs:Record<Family,(x:number)=>number>={power:x=>.16*x*x-1,exp:x=>Math.exp(x/2)-1.5,log:x=>x>0?Math.log(x):-99,trig:x=>1.6*Math.sin(x)};const fn=defs[state.family];return <FunctionExperimentLayout pointId="hm-01-11" player={player} observation={`${steps[step-1].desc} 当前函数族：${options.find(([id])=>id===state.family)?.[1]}。`} legend={[{label:'当前函数',color:'#2563eb'},{label:'反函数/参照',color:'#a855f7'},{label:'关键特征',color:'#f59e0b'}]} controls={<div className="grid grid-cols-2 gap-2">{options.map(([id,label])=><button key={id} type="button" onClick={()=>setState({...state,family:id})} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${state.family===id?'border-indigo-500 bg-indigo-50 text-indigo-700':'border-slate-200 text-slate-600'}`}>{label}</button>)}</div>} canvas={<CartesianPlane testId="elementary-functions-scene"><path d={curvePath(fn)} fill="none" stroke="#2563eb" strokeWidth="5"/>{state.compare&&<path d={curvePath(state.family==='exp'?(x)=>x>0?2*Math.log(x):-99:(x)=>Math.exp(x/2)-1.5)} fill="none" stroke="#a855f7" strokeWidth="4" strokeDasharray="8 6"/>}{state.features&&<><line x1="450" y1="54" x2="450" y2="446" stroke="#f59e0b" strokeDasharray="6 5"/><text x="500" y="90" fill="#b45309" fontSize="18">定义域边界 / 渐近线</text></>}</CartesianPlane>}/>}
