import {
  normalizeQuestion,
} from './intentClassifier.js'

export interface StructuralExperimentHint {
  experimentId: string
  score: number
  signal: string
}

function hasAny(
  text: string,
  pattern: RegExp,
): boolean {
  return pattern.test(text)
}

function addHint(
  hints: Map<string, StructuralExperimentHint>,
  hint: StructuralExperimentHint,
): void {
  const existing = hints.get(hint.experimentId)

  if (!existing || hint.score > existing.score) {
    hints.set(hint.experimentId, hint)
  }
}

function readFunctionExpression(
  text: string,
): string {
  return text.match(
    /\by\s*=\s*([-+*/().\d\s*x^²]+)/i,
  )?.[1]?.trim() ?? ''
}

/**
 * 从公式、图形名称和教学表现方式中识别高精度结构特征。
 *
 * 这层不依赖用户记住实验标题，专门覆盖“用方块演示 23-8”、
 * “画 3/4 的饼图”等自然表达。规则只负责召回已有实验，仍由
 * routeDecision 决定直接进入、推荐确认或交给 AI。
 */
export function inferStructuralExperimentHints(
  question: string,
): ReadonlyMap<string, StructuralExperimentHint> {
  const text = normalizeQuestion(question)
  const hints = new Map<string, StructuralExperimentHint>()

  if (!text) {
    return hints
  }

  const hasFractionLiteral =
    /(?:^|[^\d.])\d+\s*\/\s*\d+(?=$|[^\d.])/.test(text)
  const fractionLiteralCount =
    text.match(/\d+\s*\/\s*\d+/g)?.length ?? 0
  const hasFractionContext = hasAny(
    text,
    /分数|分子|分母|几分之几|饼图|条形图|通分|约分/,
  )

  if (
    (
      hasFractionContext &&
      (hasFractionLiteral || /分数|几分之几|分子|分母/.test(text))
    ) ||
    (
      fractionLiteralCount >= 2 &&
      /比较|大小|大于|小于|谁更/.test(text)
    )
  ) {
    addHint(hints, {
      experimentId: 'fractions',
      score: 60,
      signal: '结构:分数表达与分数教学图示',
    })
  }

  const hasSymbolicArithmetic =
    /-?\d+(?:\.\d+)?\s*[+\-−*×x÷]\s*-?\d+(?:\.\d+)?/i.test(text) ||
    (
      /-?\d+(?:\.\d+)?\s*\/\s*-?\d+(?:\.\d+)?/.test(text) &&
      /除法|除以|相除|方块|积木|数轴|算|运算/.test(text)
    )
  const hasVerbalArithmetic =
    /-?\d+(?:\.\d+)?\s*(?:加上|加|减去|减|乘以|乘|除以|除)\s*-?\d+(?:\.\d+)?/.test(text)

  if (
    (hasSymbolicArithmetic || hasVerbalArithmetic) &&
    !(hasFractionLiteral && hasFractionContext) &&
    !/\by\s*=/i.test(text)
  ) {
    addHint(hints, {
      experimentId: 'basic-arithmetic',
      score: 58,
      signal: '结构:双操作数基础算式',
    })
  }

  if (
    /(?:三角形|正方形|长方形|矩形|圆形?|平行四边形|梯形)/.test(text) &&
    /面积|周长|边长|半径|形状变化/.test(text) &&
    !/相似三角形|球面三角形|帕斯卡三角/.test(text)
  ) {
    addHint(hints, {
      experimentId: 'geometry-shapes',
      score: 58,
      signal: '结构:基础图形与面积周长',
    })
  }

  if (
    /椭圆|双曲线|抛物线/.test(text) &&
    /焦点|准线|离心率|标准方程|渐近线|轨迹/.test(text) &&
    !/椭圆曲线/.test(text)
  ) {
    addHint(hints, {
      experimentId: 'conic-sections',
      score: 62,
      signal: '结构:圆锥曲线特征量',
    })
  }

  const functionExpression = readFunctionExpression(text)

  if (functionExpression && /x/i.test(functionExpression)) {
    const isQuadratic =
      /x\s*\^\s*2|x²|x\s*\*\s*x/i.test(functionExpression)

    addHint(hints, {
      experimentId: isQuadratic
        ? 'quadratic-function'
        : 'linear-function',
      score: 60,
      signal: isQuadratic
        ? '结构:显式二次函数公式'
        : '结构:显式一次函数公式',
    })
  }

  if (
    /心形线|玫瑰线|阿基米德螺线|极坐标方程/.test(text) ||
    /(?:^|\s)r\s*=\s*[^\s]{1,40}(?:theta|θ)/i.test(text)
  ) {
    addHint(hints, {
      experimentId: 'polar',
      score: 62,
      signal: '结构:极坐标典型曲线或方程',
    })
  }

  if (/最短路径|最短路/.test(text)) {
    addHint(hints, {
      experimentId: 'dijkstra',
      score: 60,
      signal: '结构:图上的最短路径问题',
    })
  }

  if (
    /抛硬币|掷硬币|投硬币|硬币正面|硬币反面/.test(text) &&
    /模拟|重复|统计|频率|概率|趋近|收敛|次数/.test(text)
  ) {
    addHint(hints, {
      experimentId: 'law-large-numbers',
      score: 62,
      signal: '结构:重复硬币试验与频率稳定',
    })
  }

  if (
    /莫比乌斯带|莫比乌斯环/.test(text) &&
    !/莫比乌斯函数/.test(text)
  ) {
    addHint(hints, {
      experimentId: 'mobius',
      score: 64,
      signal: '结构:莫比乌斯带或莫比乌斯环',
    })
  }

  if (/克莱因瓶/.test(text)) {
    addHint(hints, {
      experimentId: 'torus-klein',
      score: 64,
      signal: '结构:环面与克莱因瓶',
    })
  }

  if (/洛伦兹吸引子|lorenz attractor|蝴蝶效应/.test(text)) {
    addHint(hints, {
      experimentId: 'lorenz-attractor',
      score: 64,
      signal: '结构:洛伦兹吸引子与蝴蝶效应',
    })
  }

  if (/混沌系统|混沌理论/.test(text)) {
    addHint(hints, {
      experimentId: 'chaos',
      score: 62,
      signal: '结构:混沌系统与混沌理论',
    })
  }

  if (/分形树|毕达哥拉斯树/.test(text)) {
    addHint(hints, {
      experimentId: 'pythagoras-tree',
      score: 62,
      signal: '结构:递归分形树',
    })
  }

  if (/\brsa\b/i.test(text) && /加密|解密|公钥|私钥/.test(text)) {
    addHint(hints, {
      experimentId: 'rsa-cipher',
      score: 64,
      signal: '结构:RSA 公钥加密过程',
    })
  }

  if (
    /复数/.test(text) &&
    /复平面|乘法|除法|欧拉公式|幅角|模长/.test(text)
  ) {
    addHint(hints, {
      experimentId: 'complex',
      score: 62,
      signal: '结构:复数在复平面上的运算',
    })
  }

  if (/广度优先|深度优先|\bbfs\b|\bdfs\b/i.test(text)) {
    addHint(hints, {
      experimentId: 'bfs-dfs',
      score: 64,
      signal: '结构:图的 BFS 或 DFS 遍历',
    })
  }

  if (
    /点积|叉积/.test(text) &&
    /向量|夹角|投影|面积|几何意义/.test(text)
  ) {
    addHint(hints, {
      experimentId: 'dot-cross-product',
      score: 64,
      signal: '结构:向量点积叉积的几何意义',
    })
  }

  if (/逻辑回归|logistic regression/i.test(text)) {
    addHint(hints, {
      experimentId: 'logistic-regression',
      score: 64,
      signal: '结构:逻辑回归分类模型',
    })
  }

  if (
    /球面/.test(text) &&
    /三角形|大圆|测地线|内角和/.test(text)
  ) {
    addHint(hints, {
      experimentId: 'spherical-geometry',
      score: 62,
      signal: '结构:球面上的非欧几何',
    })
  }

  if (
    /傅里叶/.test(text) &&
    /绘图|画出|画一个|绘制|轮廓|任意图形/.test(text)
  ) {
    addHint(hints, {
      experimentId: 'fourier-drawing',
      score: 62,
      signal: '结构:傅里叶旋转圆绘图',
    })
  }

  if (
    /排队|呼叫|到达事件|到达率/.test(text) &&
    /等待|间隔|次数|过程|模拟/.test(text)
  ) {
    addHint(hints, {
      experimentId: 'poisson-process',
      score: 58,
      signal: '结构:随机到达与排队建模',
    })
  }

  if (
    /随机(?:投|撒|取|生成)?点|随机采样/.test(text) &&
    /(?:估计|计算|逼近).{0,8}(?:pi|π|圆周率)/i.test(text)
  ) {
    addHint(hints, {
      experimentId: 'monte-carlo',
      score: 62,
      signal: '结构:随机采样估计圆周率',
    })
  }

  return hints
}
