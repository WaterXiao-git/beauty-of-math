// ============================================================================
// 罗尔定理交互演示页：案例函数 / 播放步进 / 面板文案
// 数学自洽：默认案例「双谷曲线」f(x)=x⁴−x² 在 [-1,1] 满足三条件，ξ=0
// ============================================================================

// ---------- 函数案例 ----------
export interface RolleCase {
  id: string
  name: string
  /** 函数 f(x) */
  fn: (x: number) => number
  /** 定义域 [a, b] */
  domain: [number, number]
  /** 视图 y 范围 [min, max] */
  yRange: [number, number]
  /** 该函数是否天然满足 f(a)=f(b) */
  naturallyEqual: boolean
  /** 预设中值点 ξ（条件满足时） */
  xi: number | null
  /** 简介（画板头部描述） */
  desc: string
}

export const CASES: RolleCase[] = [
  {
    id: 'x3-1',
    name: 'x³−1',
    fn: (x) => x * x * x - 1,
    domain: [-1, 1],
    yRange: [-2.4, 0.8],
    naturallyEqual: false,
    xi: null,
    desc: '单调函数端点值不相等，作为罗尔定理的反例演示',
  },
  {
    id: 'sin',
    name: 'sin x',
    fn: (x) => Math.sin(x),
    domain: [0, Math.PI],
    yRange: [-0.3, 1.4],
    naturallyEqual: true,
    xi: Math.PI / 2,
    desc: '在 [0, π] 上两端等高，内部存在水平切线',
  },
  {
    id: 'double-valley',
    name: '双谷曲线',
    fn: (x) => x ** 4 - x ** 2,
    domain: [-1, 1],
    yRange: [-0.7, 1.0],
    naturallyEqual: true,
    xi: 0,
    desc: '当满足三条件时，曲线内部至少出现一条水平切线',
  },
]

// ---------- 播放步进 ----------
export interface StepInfo {
  id: string
  title: string
  desc: string
}

export const STEPS: StepInfo[] = [
  { id: 'cont', title: '检查连续性', desc: '验证函数在闭区间 [a, b] 上连续' },
  { id: 'endpoints', title: '比较端点', desc: '确认端点函数值相等：f(a) = f(b)' },
  { id: 'scan', title: '扫描内部', desc: '在开区间 (a, b) 内寻找水平切线的位置' },
  { id: 'conclude', title: '结论成立', desc: '存在 ξ ∈ (a, b)，使得 f′(ξ) = 0' },
]

/** 当前激活步骤的补充说明（播放条右侧描述框） */
export function stepDescription(step: number): { title: string; desc: string } {
  if (step === 4) {
    return { title: '锁定 ξ', desc: '在导数为 0 的点处作水平切线，构成定理结论' }
  }
  return { title: STEPS[step - 1].title, desc: STEPS[step - 1].desc }
}

// ---------- 图例 ----------
export const LEGEND = [
  { color: '#60a5fa', label: '端点' },
  { color: '#34d399', label: '中值点' },
  { color: '#f472b6', label: '水平切线' },
]

// ---------- 定理条件 ----------
export const THEOREM_TEXT =
  '若函数 f 在闭区间 [a, b] 上连续，在开区间 (a, b) 内可导，且 f(a) = f(b)，则至少存在一点 ξ ∈ (a, b)，使得 f′(ξ) = 0。'

export const CONDITION_FORMULA = '连续 + 可导 + 端点等高'

// ---------- 教学判断 ----------
export function judgmentText(ok: boolean, broken: string[]): string {
  if (ok) {
    return '三个条件均满足：本例出现水平切线，对应 f′(ξ) = 0。'
  }
  if (broken.length > 0) {
    return `条件被破坏（${broken.join('、')}）：罗尔定理不适用，结论无法保证成立。`
  }
  return '端点函数值不相等：罗尔定理条件不满足，结论不成立。'
}