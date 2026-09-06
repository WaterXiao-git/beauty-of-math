import { HIGH_MATH_CURRICULUM } from '../../course/highMathCurriculum.generated'
import type { NativeExperimentDefinition, NativeSceneModule } from './types'

type Seed = readonly [formula: string, primary: string, secondary: string]
type Profile = { module: NativeSceneModule; seeds: readonly Seed[]; verbs: readonly [string,string,string,string] }

const profiles: Record<string, Profile> = {
  'hm-02': { module:'limit', verbs:['标出','推进','收紧','检验'], seeds:[
    ['aₙ=1+(-1)ⁿ/(n+1)','项数 n','误差 ε'],['lim(x→x₀) f(x)=L','横向距离 δ','误差 ε'],['lim(x→∞) f(x)=L','观察范围 R','误差 ε'],['f(x₀⁻), f(x₀⁺)','逼近距离 h','左右差值'],['α→0, 1/α→∞','无穷小 α','倒数尺度'],['极限只由去心邻域决定','邻域半径 δ','函数扰动'],['lim(f±g), lim(fg), lim(f/g)','运算进度','分母安全量'],['lim sin x/x=1','逼近尺度','误差放大'],['sin x~x (x→0)','缩放倍数','比值误差'],['g(x)≤f(x)≤h(x)','夹逼宽度','扰动频率'],['aₙ↑ 且 aₙ≤M','项数 n','上界 M'],
  ]},
  'hm-03': { module:'continuity', verbs:['定位','靠近','连接','验证'], seeds:[
    ['lim(x→x₀)f(x)=f(x₀)','观察点 x₀','邻域半径'],['f(x₀⁻)=f(x₀)=f(x₀⁺)','观察点 x₀','单侧距离'],['f 在 [a,b] 上连续','区间长度','网格密度'],['极限存在但函数值错位','间断位置','补点高度'],['左右极限不相等','间断位置','跳跃高度'],['|f(x)|→∞','渐近位置','增长尺度'],['sin(1/(x-x₀))','间断位置','观察尺度'],['连续函数的和、积、复合','组合参数','扰动幅度'],['f(a)f(b)<0 ⇒ ∃ξ','曲线高度','端点水平'],['f(a)<μ<f(b)','目标值 μ','区间宽度'],['连续闭区间函数必取最值','曲线高度','区间宽度'],
  ]},
  'hm-04': { module:'derivative', verbs:['选取','缩短','展开','核对'], seeds:[
    ["f'(x₀)=lim Δy/Δx",'观察点 x₀','增量 h'],['割线 h→0 变为切线','观察点 x₀','割线跨度'],['f′₋(x₀), f′₊(x₀)','观察点 x₀','单侧跨度'],['左右导数相等才可导','尖点位置','平滑尺度'],['导数是切线斜率','切点 x₀','局部尺度'],['v(t)=s′(t)','时刻 t','时间增量'],['(u±v)′, (uv)′, (u/v)′','公式序号','系数'],['(f∘g)′=f′(g)g′','输入 x','内层系数'],['F(x,y)=0 ⇒ y′=-Fₓ/Fᵧ','曲线尺度','切点参数'],['dy/dx=(dy/dt)/(dx/dt)','参数 t','轨迹尺度'],['f⁽ⁿ⁾(x)','导数阶数 n','观察点'],['dy=f′(x)dx','观察点 x','微小量 dx'],['f(x)≈f(x₀)+f′(x₀)(x-x₀)','中心 x₀','邻域宽度'],['Δy≈dy','观察点 x₀','增量 Δx'],
  ]},
  'hm-05': { module:'application', verbs:['核对条件','移动参照','显示证据','完成判断'], seeds:[
    ["f(a)=f(b) ⇒ f'(ξ)=0",'区间位置','弦线高度'],["f'(ξ)=[f(b)-f(a)]/(b-a)",'切点候选','区间宽度'],["f'(ξ)/g'(ξ)=Δf/Δg",'切点候选','函数比例'],["lim f/g=lim f'/g'",'逼近尺度','表达式阶数'],["f'>0 增，f'<0 减",'分界位置','符号阈值'],["f'(x)=0 且变号",'驻点位置','曲线幅度'],['比较端点与驻点函数值','区间位置','曲线高度'],["f''>0 凹，f''<0 凸",'观察点','曲率尺度'],["f'' 变号处为拐点",'候选点','变号幅度'],['垂直/水平/斜渐近线','渐近位置','渐近高度'],['定义域→截距→单调→凹凸','描图进度','曲线参数'],['κ=|y″|/(1+y′²)^(3/2)','曲线位置','弯曲尺度'],['R=1/κ','密切点','曲率半径'],['目标函数在约束下取最优','设计变量','约束尺度'],
  ]},
  'hm-06': { module:'antiderivative', verbs:['找到','移动常数','执行变换','反求导验证'], seeds:[
    ["F'(x)=f(x)",'积分常数 C','函数尺度'],['∫f(x)dx=F(x)+C','积分常数 C','曲线间距'],['∫xⁿdx=xⁿ⁺¹/(n+1)+C','幂指数 n','积分常数 C'],['u=g(x), du=g′(x)dx','代换尺度','积分常数 C'],['∫u dv=uv-∫v du','拆分比例','积分常数 C'],['有理式→多项式+部分分式','分式系数','分母间距'],['三角恒等式化简后积分','频率系数','相位'],['x=a sin θ 或 a tan θ','代换尺度 a','角参数 θ'],
  ]},
  'hm-07': { module:'integral', verbs:['划分区间','构造微元','累加逼近','核对公式'], seeds:[
    ['∫ₐᵇf(x)dx=lim Σf(ξᵢ)Δxᵢ','分割位置','区间端点'],['Sₙ=Σf(ξᵢ)Δx','分割数 n','区间端点'],['上和−下和→0','分割密度','振幅'],['线性、保序、区间可加','系数','分点位置'],['∫f=f(ξ)(b-a)','平均高度','区间宽度'],["Φ(x)=∫ₐˣf(t)dt, Φ'=f",'上限 x','起点 a'],['∫ₐᵇf=F(b)−F(a)','上限 b','下限 a'],['u=g(x) 且同步换限','代换系数','边界位置'],['∫u dv=[uv]ₐᵇ−∫v du','拆分比例','边界位置'],['∫ₐ∞f=lim(R→∞)∫ₐᴿf','截断上限 R','衰减指数'],
  ]},
  'hm-08': { module:'integral-application', verbs:['建立微元','移动边界','累积总量','解释结果'], seeds:[
    ['A=∫(上函数−下函数)dx','积分上限','积分下限'],['A=1/2∫r²dθ','角上限','曲线尺度'],['V=π∫R²dx','旋转半径','积分长度'],['V=∫A(x)dx','截面尺度','积分长度'],["L=∫√(1+y'²)dx",'曲线幅度','积分长度'],['W=∫F(x)dx','位移终点','力的尺度'],['P=∫ρgy·w(y)dy','水深','容器宽度'],['F=G∫dm/r²','物体间距','密度'],['f̄=1/(b-a)∫ₐᵇf','区间中心','区间宽度'],
  ]},
  'hm-09': { module:'ode', verbs:['读取方向场','调节系数','选择积分曲线','核对方程'], seeds:[
    ["F(x,y,y',…)=0",'方程系数','初始高度'],["y'=g(x)h(y)",'增长率','初始值'],["y'=F(y/x)",'齐次系数','初始值'],["y'+P(x)y=Q(x)",'线性系数','初始值'],["y'+Py=Qyⁿ",'指数 n','初始值'],["y^{(n)}=f(x)",'降阶次数','初始斜率'],["y''+py'+qy=0",'特征参数','初始值'],['y=y通解+y特解','特解幅度','积分常数'],["y(x₀)=y₀, y'(x₀)=v₀",'初值位置','初始高度'],['增长/冷却/振动模型','模型系数','初始状态'],
  ]},
  'hm-10': { module:'space', verbs:['建立坐标','旋转视角','标记关系','验证方程'], seeds:[
    ['P(x,y,z)','观察角度','点的高度'],['a+b, λa','观察角度','向量尺度'],['a·b=|a||b|cosθ','观察角度','夹角'],['a×b','观察角度','平面尺度'],['[a,b,c]=a·(b×c)','观察角度','体积尺度'],['Ax+By+Cz+D=0','观察角度','平面偏移'],['(x-x₀)/l=(y-y₀)/m=(z-z₀)/n','观察角度','直线偏移'],['方向向量与法向量的关系','观察角度','位置参数'],['F(x,y,z)=0','观察角度','曲面尺度'],['r(t)=(x(t),y(t),z(t))','观察角度','参数 t'],['椭球/锥面/双曲面','观察角度','截面尺度'],
  ]},
  'hm-11': { module:'multivariable', verbs:['选取方向','移动取样点','显示变化率','验证几何关系'], seeds:[
    ['z=f(x,y)','方向角','等高线密度'],['lim(x,y→x₀,y₀)f(x,y)','路径方向','邻域半径'],['极限值=函数值','路径方向','邻域半径'],['fₓ, fᵧ','切片方向','取样位置'],['dz=fₓdx+fᵧdy','dx','dy'],['链式依赖图逐路径相乘','路径权重','输入变化'],['F(x,y,z)=0 的隐式偏导','切面方向','取样位置'],['Dᵤf=∇f·u','方向角','步长'],['∇f=(fₓ,fᵧ)','方向角','梯度尺度'],['∇f=0','候选点 x','候选点 y'],['约束曲线上的极值','约束尺度','候选位置'],['∇f=λ∇g','约束尺度','乘子 λ'],
  ]},
  'hm-12': { module:'multiple-integral', verbs:['划分区域','变换坐标','累积体元','解释总量'], seeds:[
    ['∬ᴰf(x,y)dA','网格密度','曲面高度'],['∫ₐᵇdx∫φ₁^φ₂ fdy','网格密度','边界位置'],['∫∫f(r,θ)rdrdθ','径向密度','角度范围'],['∭Ωf dV','体元密度','高度'],['dV=r dr dθ dz','径向密度','高度'],['dV=ρ²sinφ dρdφdθ','径向密度','极角'],['质量/质心/转动惯量','网格密度','密度系数'],
  ]},
  'hm-13': { module:'field-integral', verbs:['定向路径','采样场量','累积积分','验证整体公式'], seeds:[
    ['∫ᴸf ds','路径弯曲度','采样密度'],['∫ᴸPdx+Qdy','路径弯曲度','场旋转度'],['∬ˢf dS','曲面尺度','采样密度'],['∬ˢF·n dS','曲面尺度','场强'],['∮∂D Pdx+Qdy=∬D(Qₓ−Pᵧ)dA','区域尺度','场旋转度'],['∯∂ΩF·n dS=∭ΩdivF dV','曲面尺度','场散度'],['∮∂S F·dr=∬S curlF·n dS','曲面尺度','场旋度'],['∫路径 F·dr 仅依赖端点','路径弯曲度','端点位置'],['F=∇φ','等势线密度','场强'],
  ]},
  'hm-14': { module:'series', verbs:['写出部分和','增加项数','比较误差','判断收敛'], seeds:[
    ['Σaₙ 与部分和 Sₙ','项数 n','项的衰减率'],['Σaₙ, aₙ≥0','项数 n','p 指数'],['Σ(-1)ⁿaₙ','项数 n','衰减率'],['Σ|aₙ| 与 Σaₙ','项数 n','衰减率'],['Σaₙ(x-x₀)ⁿ','项数 n','自变量 x'],['R=1/limsup |aₙ|^(1/n)','项数 n','半径 R'],['f(x)=Σaₙxⁿ','项数 n','展开位置'],['f(x)=Σf⁽ⁿ⁾(x₀)(x-x₀)ⁿ/n!','项数 n','展开中心'],['周期函数=常数+正弦余弦谐波','谐波数 n','基频'],
  ]},
}

function makeSteps(title:string, verbs:readonly[string,string,string,string], formula:string):readonly[string,string,string,string]{
  return [`${verbs[0]}“${title}”`,`${verbs[1]}并观察`,`${verbs[2]}：${formula}`,`${verbs[3]}“${title}”`] as const
}

export const NATIVE_KNOWLEDGE_DEFINITIONS: readonly NativeExperimentDefinition[] = HIGH_MATH_CURRICULUM.slice(1).flatMap((courseModule) => {
  const profile=profiles[courseModule.id]
  if(!profile||profile.seeds.length!==courseModule.points.length)throw new Error(`实验规格数量与课程目录不一致：${courseModule.id}`)
  return courseModule.points.map((point,index)=>{
    const [formula,primary,secondary]=profile.seeds[index]
    return {id:point.id,module:profile.module,point:index,formula,parameter:{label:primary,min:-4,max:6,initial:1.5,step:.1},secondary:{label:secondary,min:.15,max:3.5,initial:1,step:.05},steps:makeSteps(point.title,profile.verbs,formula),signature:`native-${point.id}`} satisfies NativeExperimentDefinition
  })
})

const signatures=new Set(NATIVE_KNOWLEDGE_DEFINITIONS.map(item=>item.signature))
if(signatures.size!==NATIVE_KNOWLEDGE_DEFINITIONS.length)throw new Error('Native 实验签名必须唯一')
