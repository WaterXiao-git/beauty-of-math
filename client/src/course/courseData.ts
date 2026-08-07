// ============================================================================
// 课程平台数据层：类型定义 + 示例课程数据 + 真实实验入口映射
// 设计依据：课程主界面设计规格（浅色三栏 · 蓝色主色 #2563EB）
// 数据策略：已有实验数据（experiments/catalog）直接挂接入口，课程结构用示例
// ============================================================================

import { experiments } from '../experiments/catalog'

// ---------- 类型 ----------

/** 学习状态：已掌握 / 学习中 / 未学习 */
export type KnowledgeStatus = 'mastered' | 'learning' | 'not-started'

/** 预览等级 A/B/C */
export type PreviewLevel = 'A' | 'B' | 'C'

/** 知识点（三级节点） */
export interface KnowledgePoint {
  id: string
  title: string
  status: KnowledgeStatus
  previewLevel: PreviewLevel
  /** 推荐可视化模板 */
  template: string
  /** 知识点简介 */
  summary: string
  /** 学习目标清单 */
  goals: string[]
  /** 知识地图上的关联节点标题 */
  related: string[]
  /** 关联的真实实验路由（有则「进入演示」跳转真实页面） */
  experimentPath?: string
  /** 统一演示页 id（对应 /demo/:id 与后端 /api/knowledge/:id）；未配置则显示「建设中」占位 */
  demoId?: string
}

/** 小节（二级节点） */
export interface CourseSection {
  id: string
  title: string
  points: KnowledgePoint[]
}

/** 章节（一级节点） */
export interface CourseChapter {
  id: string
  title: string
  sections: CourseSection[]
}

// ---------- 状态 / 等级元数据（语义 token） ----------

export const STATUS_META: Record<
  KnowledgeStatus,
  { label: string; dot: string; text: string; bg: string; border: string }
> = {
  mastered: {
    label: '已掌握',
    dot: 'bg-emerald-500',
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  learning: {
    label: '学习中',
    dot: 'bg-blue-500',
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  'not-started': {
    label: '未学习',
    dot: 'bg-amber-400',
    text: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
}

export const LEVEL_META: Record<PreviewLevel, { label: string; badge: string }> = {
  A: { label: 'A', badge: 'bg-emerald-100 text-emerald-700' },
  B: { label: 'B', badge: 'bg-yellow-100 text-yellow-700' },
  C: { label: 'C', badge: 'bg-orange-100 text-orange-700' },
}

// ---------- 课程数据（示例：高等数学（上册）） ----------

export const COURSE_TITLE = '高等数学（上册）'
export const COURSE_SUBTITLE = '函数 · 极限 · 连续'

/** 默认选中的知识点（对应设计规格中的「函数的极限」） */
export const DEFAULT_POINT_ID = 'limit-of-function'

export const chapters: CourseChapter[] = [
  {
    id: 'ch1',
    title: '函数与极限',
    sections: [
      {
        id: 'ch1-s1',
        title: '1.1 函数',
        points: [
          {
            id: 'function',
            title: '函数',
            status: 'mastered',
            previewLevel: 'A',
            template: '函数图像可视化',
            summary:
              '函数是描述两个变量之间依赖关系的数学模型：对定义域内的每一个 x，通过对应法则 f 唯一确定一个 y。本知识点涵盖函数的定义域、值域、单调性、奇偶性等基本性质。',
            goals: ['理解函数的概念与三要素（定义域、值域、对应法则）', '掌握基本初等函数的图像与性质', '会求复合函数与反函数'],
            related: ['函数的极限', '数列的极限', '连续函数'],
            experimentPath: '/linear-function',
            demoId: 'function-plot',
          },
          {
            id: 'quadratic-function',
            title: '二次函数',
            status: 'not-started',
            previewLevel: 'B',
            template: '抛物线参数联动',
            summary:
              '二次函数 y = ax² + bx + c（a≠0）的图像是抛物线：a 决定开口方向与陡缓，顶点与对称轴由 x = −b/2a 确定，判别式 Δ 决定实根个数。',
            goals: ['理解抛物线开口与 a 的关系', '会求顶点与对称轴', '用判别式判断实根'],
            related: ['函数'],
            demoId: 'quadratic-function',
          },
          {
            id: 'absolute-value-function',
            title: '绝对值函数',
            status: 'not-started',
            previewLevel: 'B',
            template: 'V 形折线可视化',
            summary:
              '绝对值函数 y = a|x−h| + k 的图像是 V 形折线：顶点 (h,k)，a 决定开口与陡缓，零点为 a|x−h|+k=0 的解。',
            goals: ['理解 V 形图像与顶点', '掌握 a/h/k 对图像的影响', '会求零点'],
            related: ['函数'],
            demoId: 'absolute-value-function',
          },
          {
            id: 'exponential-log-function',
            title: '指数与对数函数',
            status: 'not-started',
            previewLevel: 'B',
            template: '反函数对称可视化',
            summary:
              'y = aˣ 与 y = logₐ(x) 互为反函数，图像关于直线 y=x 对称；a>1 递增，0<a<1 递减。',
            goals: ['理解互为反函数', '掌握底数与增减性', '认识 y=x 对称'],
            related: ['函数'],
            demoId: 'exponential-log-function',
          },
          {
            id: 'rational-function',
            title: '反比例函数',
            status: 'not-started',
            previewLevel: 'B',
            template: '渐近线动态演示',
            summary:
              'y = a/(x−h) + k 的图像是双曲线，x=h 为垂直渐近线、y=k 为水平渐近线。',
            goals: ['理解双曲线图像', '掌握渐近线', '理解平移'],
            related: ['函数'],
            demoId: 'rational-function',
          },
          {
            id: 'inverse-function',
            title: '反函数',
            status: 'not-started',
            previewLevel: 'C',
            template: '反函数对称可视化',
            summary:
              'f 与 f⁻¹ 互为反函数时，图像关于 y=x 对称，且 f(f⁻¹(x)) = x。',
            goals: ['理解反函数概念', '认识 y=x 对称', '掌握复合还原'],
            related: ['函数'],
            demoId: 'inverse-function',
          },
        ],
      },
      {
        id: 'ch1-s2',
        title: '1.2 数列的极限',
        points: [
          {
            id: 'limit-of-sequence',
            title: '数列的极限',
            status: 'mastered',
            previewLevel: 'A',
            template: '数列收敛动画',
            summary:
              '当项数 n 无限增大时，数列 {aₙ} 的项无限趋近于一个确定常数 A，则称 A 为该数列的极限。数列极限是函数极限的先导概念，通过「ε−N 语言」严格刻画。',
            goals: ['理解数列极限的 ε−N 定义', '掌握收敛数列的性质（唯一性、有界性、保号性）', '会用夹逼准则与单调有界准则求极限'],
            related: ['函数的极限', '两个重要极限'],
          },
        ],
      },
      {
        id: 'ch1-s3',
        title: '1.3 函数的极限',
        points: [
          {
            id: 'limit-of-function',
            title: '函数的极限',
            status: 'learning',
            previewLevel: 'B',
            template: 'ε−δ 可视化',
            summary:
              '当自变量 x 无限趋近于 x₀（或趋向无穷）时，函数 f(x) 的取值无限趋近于一个确定常数 A，则称 A 为 f(x) 在 x→x₀ 时的极限。极限是微积分大厦的基石，导数与积分都由极限定义。',
            goals: [
              '理解函数极限的 ε−δ 语言描述',
              '掌握 x→x₀ 与 x→∞ 两类极限的定义与几何意义',
              '理解左极限与右极限的关系',
              '会用极限定义证明简单函数的极限',
            ],
            related: ['函数', '数列的极限', '极限的运算法则', '两个重要极限', '无穷小与无穷大', '连续函数'],
            experimentPath: '/calculus',
            demoId: 'epsilon-delta',
          },
        ],
      },
      {
        id: 'ch1-s4',
        title: '1.4 无穷小与无穷大',
        points: [
          {
            id: 'infinitesimal',
            title: '无穷小与无穷大',
            status: 'not-started',
            previewLevel: 'B',
            template: '无穷小量动态演示',
            summary:
              '极限为 0 的变量称为无穷小量，其绝对值无限增大的变量称为无穷大量。无穷小是极限理论的重要工具，等价无穷小代换是求极限的常用技巧。',
            goals: ['理解无穷小与无穷大的概念及相互关系', '掌握无穷小的比较（高阶、低阶、同阶、等价）', '会用等价无穷小代换求极限'],
            related: ['函数的极限', '极限的运算法则'],
          },
        ],
      },
      {
        id: 'ch1-s5',
        title: '1.5 极限的运算法则',
        points: [
          {
            id: 'limit-laws',
            title: '极限的运算法则',
            status: 'not-started',
            previewLevel: 'B',
            template: '运算律可视化',
            summary:
              '极限满足四则运算法则与复合运算法则：在极限存在的条件下，和的极限等于极限的和，积的极限等于极限的积，商的极限（分母不为 0）等于极限的商。',
            goals: ['掌握极限的四则运算法则', '掌握复合函数极限运算法则', '会求 0/0 型、∞/∞ 型未定式的极限'],
            related: ['函数的极限', '两个重要极限', '无穷小与无穷大'],
          },
        ],
      },
      {
        id: 'ch1-s6',
        title: '1.6 两个重要极限',
        points: [
          {
            id: 'two-important-limits',
            title: '两个重要极限',
            status: 'not-started',
            previewLevel: 'C',
            template: '重要极限动画',
            summary:
              '两个重要极限：lim(x→0) sin x / x = 1 与 lim(x→∞) (1 + 1/x)ˣ = e。它们是连接三角、指数函数与极限理论的桥梁，也是许多未定式求值的关键。',
            goals: ['牢记两个重要极限的形式', '理解其几何与数值意义', '会凑型用重要极限求极限'],
            related: ['函数的极限', '极限的运算法则', '数列的极限'],
          },
        ],
      },
      {
        id: 'ch1-s7',
        title: '1.7 函数的连续性',
        points: [
          {
            id: 'continuity',
            title: '连续函数',
            status: 'not-started',
            previewLevel: 'B',
            template: '连续性直观演示',
            summary:
              '函数在某点连续，即该点极限存在且等于函数值：lim(x→x₀) f(x) = f(x₀)。连续函数具有介值性、最值性等优良性质，是分析学研究的核心对象。',
            goals: ['理解函数连续的定义（极限与函数值相等）', '掌握间断点的分类（第一类、第二类）', '会用闭区间上连续函数的性质解题'],
            related: ['函数的极限', '无穷小与无穷大'],
            experimentPath: '/calculus',
          },
        ],
      },
    ],
  },
  {
    id: 'ch2',
    title: '导数与微分',
    sections: [
      {
        id: 'ch2-s1',
        title: '2.1 导数的概念',
        points: [
          {
            id: 'derivative',
            title: '导数',
            status: 'not-started',
            previewLevel: 'B',
            template: '切线斜率动画',
            summary:
              '导数是函数在一点处的瞬时变化率，几何意义为曲线在该点的切线斜率。导数由极限定义，是微积分的核心运算之一。',
            goals: ['理解导数的定义与几何意义', '掌握基本求导公式', '会求复合函数、隐函数与参数方程的导数'],
            related: ['函数的极限', '连续函数'],
            experimentPath: '/calculus',
            demoId: 'derivative',
          },
        ],
      },
      {
        id: 'ch2-s2',
        title: '2.2 微分的概念',
        points: [
          {
            id: 'differential',
            title: '微分',
            status: 'not-started',
            previewLevel: 'C',
            template: '微分近似动画',
            summary:
              '微分是函数增量的线性主部：Δy ≈ dy = f′(x)dx。微分用于近似计算与误差估计，是积分运算的逆过程的桥梁。',
            goals: ['理解微分的概念与几何意义', '掌握微分运算法则与一阶微分形式不变性', '会用微分做近似计算'],
            related: ['导数', '函数的极限'],
          },
        ],
      },
    ],
  },
  {
    id: 'ch3',
    title: '微分中值定理与导数的应用',
    sections: [
      {
        id: 'ch3-s1',
        title: '3.1 微分中值定理',
        points: [
          {
            id: 'mean-value-theorem',
            title: '微分中值定理',
            status: 'not-started',
            previewLevel: 'C',
            template: '罗尔定理演示',
            summary:
              '罗尔定理、拉格朗日中值定理与柯西中值定理统称微分中值定理，它们揭示了函数在区间上的平均变化率与内部某点瞬时变化率的关系。',
            goals: ['掌握三个中值定理的条件与结论', '理解其几何意义', '会用中值定理证明等式与不等式'],
            related: ['导数', '连续函数'],
            demoId: 'rolle',
          },
        ],
      },
      {
        id: 'ch3-s2',
        title: '3.2 泰勒公式',
        points: [
          {
            id: 'taylor',
            title: '泰勒公式',
            status: 'not-started',
            previewLevel: 'C',
            template: '泰勒展开可视化',
            summary:
              '泰勒公式用多项式逼近函数：f(x) = f(x₀) + f′(x₀)(x−x₀) + … + f⁽ⁿ⁾(x₀)(x−x₀)ⁿ/n! + Rₙ(x)。级数项的无限累加可以精确表达光滑函数。',
            goals: ['理解泰勒公式的推导思想', '掌握常用函数的麦克劳林展开', '会用泰勒公式求极限与近似值'],
            related: ['导数', '极限的运算法则'],
            experimentPath: '/taylor',
          },
        ],
      },
      {
        id: 'ch3-s3',
        title: '3.3 函数图形的描绘',
        points: [
          {
            id: 'graphing',
            title: '函数图形描绘',
            status: 'not-started',
            previewLevel: 'C',
            template: '导数与图形联动',
            summary:
              '借助一阶、二阶导数分析函数的单调性、凹凸性与极值点，从而精确描绘函数图形：f′ 定单调，f″ 定凹凸。',
            goals: ['掌握用导数判断单调性与凹凸性', '会求函数的极值与最值', '能综合描绘函数图形'],
            related: ['导数', '连续函数'],
          },
        ],
      },
      {
        id: 'ch3-s4',
        title: '3.4 牛顿迭代法',
        points: [
          {
            id: 'newton-method',
            title: '牛顿迭代法',
            status: 'not-started',
            previewLevel: 'C',
            template: '迭代收敛可视化',
            summary:
              '牛顿迭代法用切线逼近函数零点：xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ)。在收敛条件下具有二阶收敛速度，是数值求解方程的重要方法。',
            goals: ['理解牛顿迭代的几何原理', '掌握迭代公式与收敛条件', '会估计迭代误差'],
            related: ['导数', '函数的极限'],
            experimentPath: '/newton-method',
          },
        ],
      },
    ],
  },
  {
    id: 'ch4',
    title: '不定积分与定积分',
    sections: [
      {
        id: 'ch4-s1',
        title: '4.1 不定积分',
        points: [
          {
            id: 'indefinite-integral',
            title: '不定积分',
            status: 'not-started',
            previewLevel: 'C',
            template: '积分几何意义可视化',
            summary:
              '不定积分是导数的逆运算：∫ f(x) dx = F(x) + C。掌握换元积分法与分部积分法是计算不定积分的两大核心技能。',
            goals: ['理解原函数与不定积分的概念', '掌握换元积分法', '掌握分部积分法'],
            related: ['导数', '微分'],
            experimentPath: '/calculus',
          },
        ],
      },
      {
        id: 'ch4-s2',
        title: '4.2 定积分',
        points: [
          {
            id: 'definite-integral',
            title: '定积分',
            status: 'not-started',
            previewLevel: 'B',
            template: '曲边梯形面积动画',
            summary:
              '定积分是函数在区间上的累加极限：∫ₐᵇ f(x) dx。几何上表示曲边梯形的面积，牛顿—莱布尼茨公式将其与不定积分联系起来。',
            goals: ['理解定积分的定义（分割—求和—取极限）', '掌握牛顿—莱布尼茨公式', '会用定积分求面积与体积'],
            related: ['不定积分', '函数的极限'],
            experimentPath: '/calculus',
          },
        ],
      },
    ],
  },
]

// ---------- 查询工具 ----------

/** 按 id 查找知识点 */
export function findPoint(id: string): KnowledgePoint | undefined {
  for (const ch of chapters) {
    for (const sec of ch.sections) {
      const p = sec.points.find((pp) => pp.id === id)
      if (p) return p
    }
  }
  return undefined
}

/** 获取知识点所在的小节 */
export function findSectionOf(pointId: string): CourseSection | undefined {
  for (const ch of chapters) {
    for (const sec of ch.sections) {
      if (sec.points.some((pp) => pp.id === pointId)) return sec
    }
  }
  return undefined
}

/** 获取知识点所在的章节 */
export function findChapterOf(pointId: string): CourseChapter | undefined {
  for (const ch of chapters) {
    if (ch.sections.some((sec) => sec.points.some((pp) => pp.id === pointId))) return ch
  }
  return undefined
}

/** 依据真实实验目录补齐入口信息（仅在需要枚举实验时使用） */
export function getExperimentByPath(path: string) {
  return experiments.find((e) => e.path === path)
}