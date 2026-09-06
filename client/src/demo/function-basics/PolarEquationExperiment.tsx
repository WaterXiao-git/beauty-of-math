import FunctionExperimentLayout, { RangeControl } from './shared/FunctionExperimentLayout'
import { VIEW_H,VIEW_W } from './shared/math'
import { useTeachingPlayer, type TeachingStep } from './shared/useTeachingPlayer'
type State={theta:number;trace:boolean;radius:boolean;full:boolean}
const initial:State={theta:0,trace:false,radius:false,full:false}
const steps:TeachingStep<State>[]=[
 {id:'angle',title:'旋转极角 θ',desc:'从极轴出发确定射线方向。',state:{theta:.8,trace:false,radius:false,full:false}},
 {id:'radius',title:'计算极径 r',desc:'用 r=2+2cosθ 决定射线上的距离。',state:{theta:1.5,radius:true}},
 {id:'trace',title:'描出极坐标点',desc:'角度连续变化时留下心形线轨迹。',state:{theta:4.3,radius:true,trace:true}},
 {id:'close',title:'闭合整条曲线',desc:'扫描 0 到 2π，验证首尾连接。',state:{theta:6.28,radius:true,trace:true,full:true}},
]
const cx=450,cy=250,scale=72
export default function PolarEquationExperiment(){const{state,setState,step,player}=useTeachingPlayer(initial,steps);const r=(t:number)=>2+2*Math.cos(t);const end=state.full?Math.PI*2:state.theta;const path=Array.from({length:181},(_,i)=>end*i/180).map((t,i)=>`${i?'L':'M'} ${cx+scale*r(t)*Math.cos(t)} ${cy-scale*r(t)*Math.sin(t)}`).join(' ');const rr=r(state.theta),px=cx+scale*rr*Math.cos(state.theta),py=cy-scale*rr*Math.sin(state.theta);return <FunctionExperimentLayout pointId="hm-01-10" player={player} observation={`${steps[step-1].desc} θ=${state.theta.toFixed(2)}，r=${rr.toFixed(2)}。`} legend={[{label:'心形线 r=2+2cosθ',color:'#2563eb'},{label:'极径',color:'#f43f5e'}]} controls={<RangeControl label="极角 θ" value={state.theta} min={0} max={6.28} step={.01} onChange={(theta)=>setState({...state,theta,trace:true})}/>} canvas={<svg data-testid="polar-equation-scene" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-full min-h-[430px] w-full"><rect width={VIEW_W} height={VIEW_H} fill="#fbfdff"/>{[1,2,3,4].map(n=><circle key={n} cx={cx} cy={cy} r={n*scale} fill="none" stroke="#e2e8f0"/>)}{Array.from({length:12},(_,i)=>i*Math.PI/6).map(t=><line key={t} x1={cx} y1={cy} x2={cx+290*Math.cos(t)} y2={cy-290*Math.sin(t)} stroke="#e2e8f0"/>)}{state.trace&&<path d={path} fill="#dbeafe" fillOpacity=".45" stroke="#2563eb" strokeWidth="5"/>}{state.radius&&<line x1={cx} y1={cy} x2={px} y2={py} stroke="#f43f5e" strokeWidth="4"/>}<circle cx={px} cy={py} r="9" fill="#f43f5e"/></svg>}/>}
