import type {
  ExperimentManifest,
} from './experimentManifest.js'

/**
 * 第一批 Manifest。
 *
 * 当前先迁移已经通过测试的 5 个实验，
 * 确保重构前后的匹配行为保持一致。
 *
 * 后续通过生成脚本逐步覆盖完整实验目录。
 */
export const CORE_EXPERIMENT_MANIFESTS:
  readonly ExperimentManifest[] = [
    {
      id: 'function-transform',
      path: '/function-transform',
      title: '函数图像变换',

      description:
        '观察平移、伸缩、翻折等操作对函数图像的影响。',

      topics: [
        'algebra',
        'geometry',
        'function',
      ],

      agent: {
        enabled: true,
        kind: 'transformation',
        parameterSchema: 'transformation',

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

        capabilities: [
          'visualize',
          'explain',
          'compare',
          'find-experiment',
        ],
      },
    },

    {
      id: 'epsilon-delta',
      path: '/epsilon-delta',
      title: 'ε-δ 极限',

      description:
        '通过 ε 邻域和 δ 邻域理解函数极限的严格定义。',

      topics: [
        'calculus',
        'analysis',
        'limit',
      ],

      agent: {
        enabled: true,
        kind: 'calculus-concept',
        parameterSchema: 'calculus-limit',

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

        capabilities: [
          'visualize',
          'explain',
          'compare',
          'find-experiment',
        ],
      },
    },

    {
      id: 'derivative-definition',
      path: '/calculus',
      title: '导数定义与切线',

      description:
        '通过割线趋近切线理解导数、斜率和瞬时变化率。',

      topics: [
        'calculus',
        'derivative',
        'function',
      ],

      agent: {
        enabled: true,
        kind: 'calculus-concept',
        parameterSchema: 'function',

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

        capabilities: [
          'visualize',
          'explain',
          'calculate',
          'compare',
          'find-experiment',
        ],
      },
    },

    {
      id: 'riemann-sum',
      path: '/riemann-sum',
      title: '黎曼和',

      description:
        '使用矩形面积逼近曲线下方面积和定积分。',

      topics: [
        'calculus',
        'integration',
        'numerical-method',
      ],

      agent: {
        enabled: true,
        kind: 'integral-estimation',
        parameterSchema: 'integral-estimation',

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

        /**
         * 不再把“黎曼和”重复放入 keywords。
         * 标题本身已经属于高权重信号。
         */
        keywords: [
          '定积分',
          '积分',
          '矩形',
          '面积',
          '分割',
          '逼近',
          '取样',
        ],

        capabilities: [
          'visualize',
          'explain',
          'calculate',
          'compare',
          'find-experiment',
        ],
      },
    },

    {
      id: 'solid-of-revolution',
      path: '/solid-of-revolution',
      title: '旋转体体积',

      description:
        '展示平面区域绕坐标轴旋转形成的立体及其体积。',

      topics: [
        'calculus',
        'geometry',
        'three-dimensional',
      ],

      agent: {
        enabled: true,
        kind: 'geometry',
        parameterSchema: 'solid-of-revolution',

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

        capabilities: [
          'visualize',
          'explain',
          'calculate',
          'compare',
          'find-experiment',
        ],
      },
    },
  ]