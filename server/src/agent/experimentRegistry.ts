import type { MathIntent } from './intentClassifier.js'

export type RoutableMathIntent = Exclude<
  MathIntent,
  'unknown'
>

export interface ExperimentRouteDefinition {
  /**
   * 稳定的模块 ID，不随页面标题变化。
   */
  id: string

  /**
   * 前端 React Router 路径。
   */
  path: string

  title: string

  /**
   * 数学知识点的常见别名。
   */
  aliases: readonly string[]

  /**
   * 一旦命中，通常可以较确定地定位模块。
   */
  strongPhrases: readonly string[]

  /**
   * 只能作为辅助信号，单独出现时权重较低。
   */
  keywords: readonly string[]

  /**
   * 该模块可以支持的用户意图。
   */
  supportedIntents: readonly RoutableMathIntent[]
}

/**
 * 第二层 MVP 只登记五个典型模块。
 *
 * 暂时不要把全部实验页面迁移进来。
 */
export const EXPERIMENT_REGISTRY:
  readonly ExperimentRouteDefinition[] = [
    {
      id: 'function-transform',
      path: '/function-transform',
      title: '函数图像变换',

      aliases: [
        '函数变换',
        '函数参数变化',
        '图像变换',
        '图像平移',
        '图像伸缩',
        '图像翻折',
        '函数平移',
        '函数伸缩',
      ],

      strongPhrases: [
        '观察参数对函数图像的影响',
        '改变参数观察图像',
        '函数图像的平移',
        '函数图像的伸缩',
        '函数图像的翻折',
      ],

      keywords: [
        '函数',
        '参数',
        '平移',
        '伸缩',
        '翻折',
        '振幅',
        '周期',
        '相位',
      ],

      supportedIntents: [
        'visualize',
        'explain',
        'compare',
        'find-experiment',
      ],
    },

    {
      id: 'epsilon-delta',
      path: '/epsilon-delta',
      title: 'ε-δ 极限',

      aliases: [
        'epsilon delta',
        'epsilon-delta',
        'ε-δ',
        '极限定义',
        '函数极限定义',
        '极限的严格定义',
        '邻域定义',
      ],

      strongPhrases: [
        '用ε-δ解释极限',
        '用epsilon delta解释极限',
        '极限的ε-δ定义',
        'ε邻域和δ邻域',
        'epsilon邻域和delta邻域',
        '通过邻域理解极限',
      ],

      keywords: [
        '极限',
        '邻域',
        'epsilon',
        'delta',
        '趋近',
        '误差',
      ],

      supportedIntents: [
        'visualize',
        'explain',
        'compare',
        'find-experiment',
      ],
    },

    {
      id: 'derivative-definition',
      path: '/calculus',
      title: '导数定义与切线',

      aliases: [
        '导数定义',
        '割线趋近切线',
        '割线和切线',
        '切线斜率',
        '差商',
        '瞬时变化率',
      ],

      strongPhrases: [
        '割线如何变成切线',
        '割线趋近切线',
        '差商趋近导数',
        '导数的几何意义',
        '切线斜率的极限',
      ],

      keywords: [
        '导数',
        '割线',
        '切线',
        '斜率',
        '差商',
        '变化率',
      ],

      supportedIntents: [
        'visualize',
        'explain',
        'calculate',
        'compare',
        'find-experiment',
      ],
    },

    {
      id: 'riemann-sum',
      path: '/riemann-sum',
      title: '黎曼和',

      aliases: [
        '定积分逼近',
        '矩形面积逼近',
        '黎曼积分',
        '矩形法',
        '左端点和',
        '右端点和',
        '中点和',
      ],

      strongPhrases: [
        '用矩形逼近定积分',
        '用矩形逼近面积',
        '黎曼和逼近定积分',
        '左端点黎曼和',
        '右端点黎曼和',
        '中点黎曼和',
      ],

      keywords: [
        '定积分',
        '积分',
        '矩形',
        '面积',
        '分割',
        '逼近',
        '取样',
      ],

      supportedIntents: [
        'visualize',
        'explain',
        'calculate',
        'compare',
        'find-experiment',
      ],
    },

    {
      id: 'solid-of-revolution',
      path: '/solid-of-revolution',
      title: '旋转体体积',

      aliases: [
        '旋转体',
        '旋转体积',
        '圆盘法',
        '垫片法',
        '柱壳法',
        '曲线旋转形成的立体',
      ],

      strongPhrases: [
        '绕x轴旋转',
        '绕y轴旋转',
        '平面区域旋转成立体',
        '计算旋转体体积',
        '展示旋转形成的立体',
      ],

      keywords: [
        '旋转',
        '体积',
        '立体',
        '圆盘',
        '垫片',
        '柱壳',
        '三维',
      ],

      supportedIntents: [
        'visualize',
        'explain',
        'calculate',
        'compare',
        'find-experiment',
      ],
    },
  ]