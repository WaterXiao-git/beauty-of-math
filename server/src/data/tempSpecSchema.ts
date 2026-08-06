// ============================================================================
// 临时实验 Schema（前后端双端校验的统一结构，架构图分支 C / DynamicExperimentSpec）
// 仅当前会话预览：不写入源码、不注册永久路由，避免污染正式实验库
// ============================================================================

/** 可视化模板类型 */
export type TempTemplate = 'cartesian' | 'polar' | 'arithmetic'

export interface TempStep {
  id: string
  title: string
  desc: string
}

export interface TempPoint {
  x: number
  y: number
}

/** 临时交互实验配置 */
export interface DynamicExperimentSpec {
  id: string
  /** 问题原文（溯源） */
  question: string
  title: string
  /** 数学表达式（mathjs 可解析，如 "sin(x) + x/3"） */
  formula: string
  /** 可视化模板 */
  template: TempTemplate
  /** 定义域 [min, max] */
  domain: [number, number]
  /** 视图范围（可选，缺省自动） */
  yRange?: [number, number]
  /** 教学步骤 */
  steps: TempStep[]
  /** 关键参数（如 a=2） */
  params: Record<string, number>
  /** 服务端预采样点（iframe 内纯渲染，不解析公式，保证隔离与性能） */
  points: TempPoint[]
  /** 生成时间戳 */
  createdAt: number
}

/** 模板描述（本地模板库，生成时优先使用） */
export interface TempTemplateInfo {
  id: TempTemplate
  name: string
  desc: string
  /** 默认公式骨架 */
  defaultFormula: string
  defaultDomain: [number, number]
  defaultSteps: TempStep[]
}

export const TEMP_TEMPLATES: TempTemplateInfo[] = [
  {
    id: 'cartesian',
    name: '直角坐标曲线',
    desc: '在直角坐标系中绘制 y=f(x) 的函数曲线，支持网格与坐标轴',
    defaultFormula: 'sin(x)',
    defaultDomain: [-6.28, 6.28],
    defaultSteps: [
      { id: 'formula', title: '观察公式', desc: '查看生成的函数表达式 y = f(x)' },
      { id: 'curve', title: '绘制曲线', desc: '在直角坐标系中采样并绘制函数曲线' },
      { id: 'explore', title: '探索性质', desc: '观察单调性、极值、周期性等性质' },
    ],
  },
  {
    id: 'polar',
    name: '极坐标曲线',
    desc: '在极坐标系中绘制 r=f(θ) 的曲线，展示花瓣、螺旋等图形',
    defaultFormula: 'cos(3*t)',
    defaultDomain: [0, 6.283185307179586],
    defaultSteps: [
      { id: 'formula', title: '观察公式', desc: '查看极坐标方程 r = f(θ)' },
      { id: 'curve', title: '绘制曲线', desc: '按角度采样半径并绘制极坐标曲线' },
      { id: 'explore', title: '探索性质', desc: '观察对称性、花瓣数量等特征' },
    ],
  },
  {
    id: 'arithmetic',
    name: '四则运算可视化',
    desc: '用数轴/条形图可视化表达式的逐步计算过程',
    defaultFormula: '(x + 2) * 3',
    defaultDomain: [0, 10],
    defaultSteps: [
      { id: 'expr', title: '表达式', desc: '查看生成的计算表达式' },
      { id: 'compute', title: '逐步计算', desc: '按运算顺序可视化计算过程' },
      { id: 'result', title: '结果', desc: '展示最终结果与中间步骤' },
    ],
  },
]