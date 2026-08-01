import type {
  AgentCapability,
  ExperimentKind,
  ParameterSchemaId,
} from './experimentManifest.js'

/**
 * 单个实验的人工 Agent 补丁。
 *
 * 这里只存储不能通过通用分类规则可靠推断的内容，
 * 例如自然语言别名、强语义短语和搜索关键词。
 *
 * 不要在这里复制完整 Manifest。
 */
export interface ExperimentAgentOverride {
  aliases?: readonly string[]
  strongPhrases?: readonly string[]
  keywords?: readonly string[]

  capabilities?:
    readonly AgentCapability[]

  kind?: ExperimentKind

  parameterSchema?:
    ParameterSchemaId

  enabled?: boolean
}

/**
 * key 使用实验 path，而不是 title。
 *
 * path 在实验目录中唯一且稳定，
 * 标题以后可能被修改。
 */
export const MANUAL_EXPERIMENT_AGENT_OVERRIDES:
  Readonly<
    Record<
      string,
      ExperimentAgentOverride
    >
  > = {
    '/fractions': {
      aliases: [
        '分数',
        '分数概念',
        '分数比较',
        '分数运算',
        '几分之几',
      ],

      strongPhrases: [
        '理解分子和分母',
        '用饼图表示几分之几',
        '比较两个分数的大小',
        '分数的加减乘除',
      ],

      keywords: [
        '分子',
        '分母',
        '几分之几',
        '分数大小',
        '通分',
        '约分',
        '饼图表示',
      ],
    },

    '/matrix-decomposition': {
      aliases: [
        '矩阵拆分',
        '矩阵因子分解',
      ],

      strongPhrases: [
        '矩阵拆成更容易计算的几个部分',
        '把矩阵拆成几个部分',
        '矩阵分解为多个部分',
        '比较 lu qr 和 svd',
        'lu qr 和 svd',
      ],

      keywords: [
        '矩阵拆分',
        '因子分解',
        'lu',
        'qr',
        'svd',
      ],
    },

    '/interpolation': {
      aliases: [
        '插值',
        '曲线插值',
        '数据插值',
      ],

      strongPhrases: [
        '离散采样点估计中间值',
        '估计中间位置的函数值',
        '有限个点补出连续曲线',
        '通过已知点构造连续曲线',
      ],

      keywords: [
        '离散采样点',
        '中间值',
        '中间位置',
        '补出曲线',
        '已知点',
        '插值曲线',
      ],
    },

    '/modular-arithmetic': {
      aliases: [
        '取模运算',
        '钟表算术',
        '余数运算',
      ],

      strongPhrases: [
        '钟表算术为什么会循环',
        '整数除以同一个数后的余数关系',
        '两个整数的余数关系',
      ],

      keywords: [
        '钟表算术',
        '循环算术',
        '余数关系',
        '取模',
        '余数',
        '同余',
      ],
    },

    '/lorenz-attractor': {
      aliases: [
        '蝴蝶吸引子',
        '洛伦兹混沌',
      ],

      strongPhrases: [
        '经典蝴蝶形混沌轨迹',
        '蝴蝶形混沌轨迹',
        '三个变量相互作用形成的混沌系统',
        '三变量混沌系统',
      ],

      keywords: [
        '蝴蝶形',
        '混沌轨迹',
        '蝴蝶吸引子',
        '三变量混沌',
        '三个变量',
      ],
    },

    '/signal-processing': {
      aliases: [
        '数字信号处理',
        '时频分析',
      ],

      strongPhrases: [
        '把时域波形转换到频域观察',
        '时域波形转换到频域',
        '观察滤波前后频谱变化',
        '滤波前后频谱有什么变化',
      ],

      keywords: [
        '时域波形',
        '频域观察',
        '滤波前后',
        '频谱变化',
        '滤波',
        '频谱',
      ],
    },

    '/markov-chain': {
      aliases: [
        '状态转移链',
        '马氏链',
      ],

      strongPhrases: [
        '下一状态只依赖当前状态',
        '用状态转移矩阵展示随机跳转',
        '状态转移矩阵展示随机跳转',
      ],

      keywords: [
        '下一状态',
        '当前状态',
        '状态转移',
        '转移矩阵',
        '随机跳转',
        '无记忆性',
      ],
    },

    '/numerical-integration': {
      aliases: [
        '数值求积',
        '积分数值近似',
      ],

      strongPhrases: [
        '梯形法和辛普森法估算曲线下面积',
        '使用梯形法和辛普森法',
        '比较不同数值积分方法',
      ],

      keywords: [
        '梯形法',
        '辛普森法',
        '数值求积',
        '曲线下面积',
        '积分估算',
      ],
    },

    '/linear-system': {
      aliases: [
        '一次方程组',
        '联立一次方程',
      ],

      strongPhrases: [
        '画出两条直线并找到它们的交点',
        '两条直线并找到交点',
        '两个一次方程联立求解',
        '一次方程联立求解',
      ],

      keywords: [
        '两条直线',
        '直线交点',
        '一次方程',
        '联立求解',
        '方程联立',
      ],
    },

    '/wave-equation': {
      aliases: [
        '波传播方程',
        '弦振动方程',
      ],

      strongPhrases: [
        '观察绳子上的波怎样随时间传播',
        '绳子上的波随时间传播',
        '振动传播对应的偏微分模型',
        '展示振动传播的偏微分模型',
      ],

      keywords: [
        '绳子上的波',
        '波随时间传播',
        '振动传播',
        '弦振动',
        '偏微分模型',
      ],
    },

    '/fourier': {
      aliases: [
        '频率分解',
        '正弦分解',
      ],

      strongPhrases: [
        '把复杂波形拆成不同频率的正弦成分',
        '复杂波形拆成正弦成分',
        '用不同频率的正弦基函数表示信号',
        '正弦基函数表示信号',
      ],

      keywords: [
        '正弦成分',
        '频率分解',
        '正弦分解',
        '正弦基函数',
        '不同频率',
      ],
    },

    '/tower-of-hanoi': {
      aliases: [
        '河内塔',
        '圆盘搬运问题',
      ],

      strongPhrases: [
        '三个柱子移动圆盘的递归问题',
        '每次只能移动一个圆盘',
        '移动一个圆盘完成全部搬运',
      ],

      keywords: [
        '三个柱子',
        '移动圆盘',
        '一个圆盘',
        '圆盘搬运',
        '递归搬运',
      ],
    },

    '/knot-theory': {
      aliases: [
        '绳结拓扑',
        '结理论',
      ],

      strongPhrases: [
        '绳结在连续变形下是否等价',
        '连续变形下判断绳结等价',
        '不同绳结的拓扑性质',
        '研究绳结的拓扑性质',
      ],

      keywords: [
        '绳结',
        '连续变形',
        '拓扑等价',
        '绳结拓扑',
        '拓扑性质',
      ],
    },
  }
