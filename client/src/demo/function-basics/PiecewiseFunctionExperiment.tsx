import CartesianPlane from './shared/CartesianPlane'
import FunctionExperimentLayout, { RangeControl } from './shared/FunctionExperimentLayout'
import { curvePath, sx, sy } from './shared/math'
import { useTeachingPlayer, type TeachingStep } from './shared/useTeachingPlayer'
type State={breakpoint:number;showRules:boolean;showEndpoints:boolean;probe:number}
const initial:State={breakpoint:0,showRules:false,showEndpoints:false,probe:-1}
const steps:TeachingStep<State>[]=[
 {id:'split',title:'划分定义域',desc:'用分界点把定义域切成两段。',state:{breakpoint:0,showRules:false,showEndpoints:false,probe:-1}},
 {id:'rules',title:'分别应用规则',desc:'左侧使用直线，右侧使用二次函数。',state:{showRules:true}},
 {id:'endpoints',title:'判断端点归属',desc:'通过空心点和实心点辨认等号属于哪一段。',state:{showEndpoints:true}},
 {id:'probe',title:'跨段验证',desc:'移动探针跨过分界点，确认规则随区间切换。',state:{probe:1.6,showRules:true,showEndpoints:true}},
]
export default function PiecewiseFunctionExperiment(){const{state,setState,step,player}=useTeachingPlayer(initial,steps);const left=(x:number)=>.55*x+1;const right=(x:number)=>.18*(x-1)**2-.5;const val=state.probe<state.breakpoint?left(state.probe):right(state.probe);return <FunctionExperimentLayout pointId="hm-01-08" player={player} observation={`${steps[step-1].desc} 探针落在${state.probe<state.breakpoint?'左':'右'}段，函数值 ${val.toFixed(2)}。`} legend={[{label:'左段规则',color:'#2563eb'},{label:'右段规则',color:'#a855f7'},{label:'分界点',color:'#f59e0b'}]} controls={<div className="space-y-5"><RangeControl label="分界点 c" value={state.breakpoint} min={-2} max={2} onChange={(breakpoint)=>setState({...state,breakpoint})}/><RangeControl label="探针 x" value={state.probe} min={-4} max={4} onChange={(probe)=>setState({...state,probe})}/></div>} canvas={<CartesianPlane testId="piecewise-function-scene"><line x1={sx(state.breakpoint)} y1="54" x2={sx(state.breakpoint)} y2="446" stroke="#f59e0b" strokeWidth="3" strokeDasharray="7 6"/>{state.showRules&&<><path d={curvePath(left,-5,state.breakpoint)} fill="none" stroke="#2563eb" strokeWidth="5"/><path d={curvePath(right,state.breakpoint,5)} fill="none" stroke="#a855f7" strokeWidth="5"/></>}{state.showEndpoints&&<><circle cx={sx(state.breakpoint)} cy={sy(left(state.breakpoint))} r="9" fill="white" stroke="#2563eb" strokeWidth="4"/><circle cx={sx(state.breakpoint)} cy={sy(right(state.breakpoint))} r="8" fill="#a855f7"/></>}<circle cx={sx(state.probe)} cy={sy(val)} r="9" fill="#f43f5e"/></CartesianPlane>}/>}
