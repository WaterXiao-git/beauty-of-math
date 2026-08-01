import type {
  ExperimentMatchCandidate,
} from './experimentMatcher.js'

const MATH_TERM_PATTERN = /(?:数学|算术|数轴|加法|减法|乘法|除法|分数|小数|比例|方程|不等式|函数|图像|曲线|曲面|坐标|极坐标|参数|几何|三角|圆|椭圆|抛物线|双曲线|向量|矩阵|行列式|概率|统计|分布|积分|微分|导数|极限|级数|数列|集合|组合|排列|图论|算法|定理|公式|轨迹|斜率|面积|体积|角度|对称|变换|收敛|发散|拟合|回归|聚类|拓扑|分形|混沌|四维|高维|超立方体|投影)/i

const MATH_SYMBOL_PATTERN = /(?:[=^∫∑Σ√∞πθ]|\b[a-z]\s*=|\d\s*[+*/-]\s*\d)/i

const MATH_FUNCTION_PATTERN = /\b(?:sin|cos|tan|asin|acos|atan|sqrt|log|ln|exp|abs)\s*\(/i

const VISUAL_REQUEST_PATTERN = /(?:可视化|画(?:出|一个|一幅|一下)?|绘制|作图|图像|图形|曲线|曲面|坐标|轨迹|动画|演示|模拟|参数.{0,8}变化|交互实验|动态实验|方块|数轴)/i

export function isLikelyMathRoutingRequest(
  question: string,
  candidates:
    readonly ExperimentMatchCandidate[] = [],
): boolean {
  const normalized = question.trim()

  return Boolean(
    normalized &&
    (
      candidates.length > 0 ||
      MATH_TERM_PATTERN.test(normalized) ||
      MATH_SYMBOL_PATTERN.test(normalized) ||
      MATH_FUNCTION_PATTERN.test(normalized)
    )
  )
}

/**
 * 防止把天气、闲聊等非数学问题交给实验生成模型。
 *
 * 已有实验候选是最可靠的领域信号；未命中时再检查常见数学术语、
 * 表达式符号和函数写法。它只负责保守准入，不判断具体渲染器。
 */
export function isGeneratableMathExperimentRequest(
  question: string,
  candidates:
    readonly ExperimentMatchCandidate[] = [],
): boolean {
  const normalized = question.trim()

  if (!normalized) {
    return false
  }

  const hasMathSignal =
    isLikelyMathRoutingRequest(
      normalized,
      candidates,
    )
  const hasVisualSignal =
    VISUAL_REQUEST_PATTERN.test(normalized) ||
    MATH_SYMBOL_PATTERN.test(normalized) ||
    MATH_FUNCTION_PATTERN.test(normalized)

  return hasMathSignal && hasVisualSignal
}
