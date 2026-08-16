import type {
  DynamicExperimentSpec,
  DynamicRendererType,
} from './types.js'

interface ConceptRule {
  question: RegExp
  output: RegExp
}

const CONCEPT_RULES: ConceptRule[] = [
  { question: /超立方体|四维立方体|tesseract/i, output: /超立方体|四维立方体|tesseract/i },
  { question: /矩阵|线性变换/i, output: /矩阵|线性变换/i },
  { question: /导数|切线|变化率/i, output: /导数|切线|变化率/i },
  { question: /积分|黎曼和/i, output: /积分|黎曼和/i },
  { question: /极限|ε\s*[-−]?\s*δ|epsilon\s*delta/i, output: /极限|ε|δ|epsilon|delta/i },
  { question: /傅里叶/i, output: /傅里叶|频谱|谐波/i },
  { question: /概率|随机|蒙特卡洛|抛硬币|掷骰/i, output: /概率|随机|蒙特卡洛|硬币|骰/i },
  { question: /排序/i, output: /排序|冒泡|插入|选择|归并|快速排序/i },
  { question: /最短路径|dijkstra|a\s*\*/i, output: /最短路径|dijkstra|a\s*\*/i },
  { question: /广度优先|深度优先|bfs|dfs|图遍历/i, output: /广度优先|深度优先|bfs|dfs|图遍历/i },
  { question: /分形|曼德勃罗|Julia|谢尔宾斯基/i, output: /分形|曼德勃罗|Julia|谢尔宾斯基/i },
  { question: /向量|点积|叉积/i, output: /向量|点积|叉积/i },
  { question: /复数|复平面/i, output: /复数|复平面/i },
  { question: /椭圆|抛物线|双曲线|圆锥曲线/i, output: /椭圆|抛物线|双曲线|圆锥曲线/i },
  { question: /三角形|多边形|圆(?!锥)/i, output: /三角形|多边形|圆(?!锥)/i },
  { question: /摆|振动|波动|粒子|扩散/i, output: /摆|振动|波动|粒子|扩散/i },
  { question: /回归|拟合/i, output: /回归|拟合/i },
  { question: /加密|密码|rsa/i, output: /加密|密码|rsa/i },
]

function expectedRenderer(question: string): DynamicRendererType | null {
  if (
    /极坐标|r\s*=|心形线|玫瑰线|阿基米德螺线/i.test(question)
  ) {
    return 'polar-2d'
  }

  if (
    /三维|3d|四维|4d|高维|立体|曲面|空间图形|超立方体|投影|算法|排序|搜索|最短路径|遍历|图论|网络流|模拟|随机投|抛硬币|掷骰|蒙特卡洛|分形|矩阵变换|线性变换|复平面|摆|振动|粒子|扩散/i.test(question)
  ) {
    return 'sandboxed-html'
  }

  if (
    /(?:演示|计算|展示|用方块)?\s*\d+(?:\.\d+)?\s*(?:加|减|乘|除|[+*/-])\s*\d+(?:\.\d+)?/i.test(question)
  ) {
    return 'arithmetic-blocks'
  }

  if (
    /y\s*=|f\s*\([^)]*\)\s*=|函数图像|曲线|抛物线|双曲线|指数函数|对数函数/i.test(question)
  ) {
    return 'cartesian-2d'
  }

  return null
}

function searchableSpecText(spec: DynamicExperimentSpec): string {
  return [
    spec.title,
    spec.description,
    spec.formulaLatex,
    ...spec.steps.flatMap((step) => [step.title, step.description]),
    ...spec.knowledgePoints,
  ].join('\n')
}

export interface ExperimentAlignmentResult {
  valid: boolean
  reason: string | null
}

/**
 * 验证“用户需求—渲染器—教学内容”是否一致。
 * Schema 合法只能说明配置可运行，这一层防止用无关二维公式包装复杂需求。
 */
export function validateExperimentAlignment(
  question: string,
  spec: DynamicExperimentSpec,
): ExperimentAlignmentResult {
  const requiredRenderer = expectedRenderer(question)

  if (requiredRenderer && spec.renderer.type !== requiredRenderer) {
    return {
      valid: false,
      reason: `需求需要 ${requiredRenderer}，模型却返回 ${spec.renderer.type}`,
    }
  }

  const output = searchableSpecText(spec)
  const missingConcept = CONCEPT_RULES.find(
    (rule) => rule.question.test(question) && !rule.output.test(output),
  )

  if (missingConcept) {
    return {
      valid: false,
      reason: '生成内容未覆盖用户问题中的核心数学概念',
    }
  }

  return { valid: true, reason: null }
}
