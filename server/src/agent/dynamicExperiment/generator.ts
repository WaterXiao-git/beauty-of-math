import {
  loadAgentAIConfig,
} from '../ai/config.js'

import {
  OpenAICompatibleProvider,
} from '../ai/openAICompatibleProvider.js'

import type {
  AgentModelProvider,
} from '../ai/types.js'

import type {
  DynamicExperimentResponse,
  DynamicExperimentSpec,
} from './types.js'

import {
  parseDynamicExperimentSpec,
} from './validator.js'

import {
  createKnownDynamicExperiment,
} from './knownExperimentTemplates.js'

import {
  validateExperimentAlignment,
} from './alignment.js'

const GENERATOR_SYSTEM_PROMPT = `你是数学教学可视化实验设计器。请把用户需求转换成一个临时、可交互的数学实验配置。
优先使用结构化渲染器；无法由固定渲染器表达的几何、算法、统计、物理或高维可视化，使用 sandboxed-html 生成原生 HTML/SVG/Canvas 交互图。只输出一个 JSON 对象，不要输出 Markdown。

JSON 字段必须完整：
version 固定为 1；title、description、gradeLevel、formulaLatex；
parameters 是最多 6 个滑块，每项为 {id,label,min,max,step,defaultValue,unit}，id 只能是小写字母开头；
renderer 四选一：
1. {type:"cartesian-2d",expression,xMin,xMax,yMin,yMax,samples}
2. {type:"polar-2d",expression,thetaMin,thetaMax,radiusMax,samples}
3. {type:"arithmetic-blocks",operation,left,right}，operation 只能是 addition|subtraction|multiplication|division，数字为 0 到 24 的整数；
4. {type:"sandboxed-html",document,height}。document 是可直接放入 body 的 HTML 片段，可包含 style、svg、canvas 和 script，长度不超过 50000 字符，height 为 320 到 1000。不得依赖外部资源或网络库。交互参数变化会通过 window message 发送：{type:"mathviz:parameters",parameters}，脚本必须监听该消息并重新绘制。
steps 为 1 到 8 项，每项 {title,description,parameterValues}；
knowledgePoints 为 1 到 8 条简短且可验证的数学知识。

表达式使用 mathjs 语法，只能包含数字、x 或 theta、参数 id、pi、e，以及 sin/cos/tan/asin/acos/atan/sqrt/abs/exp/log/ln/floor/ceil/round/min/max/pow。幂使用 ^，不要使用 Math. 前缀。
坐标与参数范围应适合课堂观察。samples 在 100 到 800 之间。
如果问题属于基础四则运算，使用 arithmetic-blocks；极坐标方程使用 polar-2d；其他显式函数使用 cartesian-2d；其余需要自由绘图的内容使用 sandboxed-html。自由绘图应使用响应式尺寸、白色背景、蓝紫主色、清晰图例和参数反馈，视觉上接近现有数学实验页。
参数范围包含会改变函数类型、产生退化或导致未定义的特殊值时，必须在步骤和知识点中明确说明。
内容必须使用中文，数学结论必须保守、准确。`

const REVIEW_SYSTEM_PROMPT = `你是数学教学实验审核员。检查草案的数学正确性、可渲染性、参数范围和课堂表达，并输出修正后的完整 JSON 配置。
必须保持 version=1，只能使用 cartesian-2d、polar-2d、arithmetic-blocks、sandboxed-html，禁止输出 Markdown 或额外说明。
必须逐项对照原始用户问题，确保标题、数学公式、渲染器、交互参数、步骤和知识点描述的是同一个主题。三维、高维、算法、模拟或离散结构不得退化为无关的二维函数曲线。
表达式只能使用草案协议列出的安全 mathjs 标识符。无法确定的数学结论应删除或改为保守表述。`

const GENERATION_TIMEOUT_MS = 20_000

function enrichTeachingEdgeCases(
  spec: DynamicExperimentSpec,
): DynamicExperimentSpec {
  if (spec.renderer.type !== 'cartesian-2d') {
    return spec
  }

  const expression = spec.renderer.expression
    .replace(/\s+/g, '')

  const quadraticParameter =
    spec.parameters.find((parameter) => {
      const term = `${parameter.id}*x^2`
      const reversedTerm = `x^2*${parameter.id}`

      return (
        parameter.min <= 0 &&
        parameter.max >= 0 &&
        (
          expression.includes(term) ||
          expression.includes(reversedTerm)
        )
      )
    })

  if (!quadraticParameter) {
    return spec
  }

  const zeroPattern = new RegExp(
    `${quadraticParameter.id}\\s*=\\s*0`,
    'i',
  )
  const alreadyExplained = [
    ...spec.knowledgePoints,
    ...spec.steps.map((step) => step.description),
  ].some((text) => zeroPattern.test(text))

  if (alreadyExplained) {
    return spec
  }

  const defaultValues = Object.fromEntries(
    spec.parameters.map((parameter) => [
      parameter.id,
      parameter.defaultValue,
    ]),
  )
  const parameterLabel = quadraticParameter.id
  const edgeCaseStep: DynamicExperimentSpec['steps'][number] = {
    title: '检查退化情况',
    description:
      `将 ${parameterLabel}=0，此时二次项消失，图像不再是抛物线。`,
    parameterValues: {
      ...defaultValues,
      [quadraticParameter.id]: 0,
    },
  }
  const edgeCaseKnowledge =
    `当 ${parameterLabel}=0 时，二次项消失，函数会退化为更低次数的函数，不能再称为二次函数。`

  return {
    ...spec,
    steps: spec.steps.length >= 8
      ? [...spec.steps.slice(0, 7), edgeCaseStep]
      : [...spec.steps, edgeCaseStep],
    knowledgePoints:
      spec.knowledgePoints.length >= 8
        ? [
            ...spec.knowledgePoints.slice(0, 7),
            edgeCaseKnowledge,
          ]
        : [
            ...spec.knowledgePoints,
            edgeCaseKnowledge,
          ],
  }
}

export class DynamicExperimentGenerationError
extends Error {
  readonly code:
    | 'not-configured'
    | 'generation-failed'

  constructor(
    code:
      | 'not-configured'
      | 'generation-failed',
    message: string,
  ) {
    super(message)
    this.name = 'DynamicExperimentGenerationError'
    this.code = code
  }
}

interface DynamicExperimentGeneratorOptions {
  primary?: AgentModelProvider | null
  reviewer?: AgentModelProvider | null
}

function configuredProviders(): {
  primary: AgentModelProvider | null
  reviewer: AgentModelProvider | null
} {
  const config = loadAgentAIConfig()

  return {
    primary: config.enabled
      ? config.primary
        ? new OpenAICompatibleProvider({
            ...config.primary,
            timeoutMs: Math.max(
              config.primary.timeoutMs,
              GENERATION_TIMEOUT_MS,
            ),
          })
        : config.reviewer
          ? new OpenAICompatibleProvider({
              ...config.reviewer,
              timeoutMs: Math.max(
                config.reviewer.timeoutMs,
                GENERATION_TIMEOUT_MS,
              ),
            })
          : null
      : null,
    reviewer:
      config.enabled && config.primary && config.reviewer
        ? new OpenAICompatibleProvider({
            ...config.reviewer,
            timeoutMs: Math.max(
              config.reviewer.timeoutMs,
              GENERATION_TIMEOUT_MS,
            ),
          })
        : null,
  }
}

function unwrapSpec(value: unknown): unknown {
  if (
    typeof value === 'object' &&
    value !== null &&
    'spec' in value
  ) {
    return value.spec
  }

  return value
}

async function requestGeneratedSpec(
  provider: AgentModelProvider,
  question: string,
): Promise<DynamicExperimentSpec> {
  const response = await provider.completeJSON({
    systemPrompt: GENERATOR_SYSTEM_PROMPT,
    userPrompt: JSON.stringify({
      task: '生成临时交互式数学实验配置',
      question,
    }),
    maxTokens: 4_500,
  })

  const spec = parseDynamicExperimentSpec(
    unwrapSpec(response),
  )

  if (!spec) {
    throw new Error(
      `${provider.provider} returned an invalid experiment spec`,
    )
  }

  const alignment = validateExperimentAlignment(question, spec)
  if (!alignment.valid) {
    throw new Error(
      `${provider.provider} returned a mismatched experiment: ${alignment.reason}`,
    )
  }

  return spec
}

async function requestReviewedSpec(
  provider: AgentModelProvider,
  question: string,
  draft: DynamicExperimentSpec,
): Promise<DynamicExperimentSpec> {
  const response = await provider.completeJSON({
    systemPrompt: REVIEW_SYSTEM_PROMPT,
    userPrompt: JSON.stringify({
      task: '审核并修正动态实验配置',
      question,
      draft,
    }),
    maxTokens: 4_500,
  })

  const spec = parseDynamicExperimentSpec(
    unwrapSpec(response),
  )

  if (!spec) {
    throw new Error(
      `${provider.provider} returned an invalid reviewed spec`,
    )
  }
  const alignment = validateExperimentAlignment(question, spec)
  if (!alignment.valid) {
    throw new Error(
      `${provider.provider} returned a mismatched reviewed experiment: ${alignment.reason}`,
    )
  }

  return spec
}

/**
 * 用户明确点击“生成临时实验”后调用。
 * 配置只返回给当前浏览器，不创建文件、不注册永久路由。
 */
export async function generateDynamicExperiment(
  question: string,
  options: DynamicExperimentGeneratorOptions = {},
): Promise<DynamicExperimentResponse> {
  const knownExperiment =
    createKnownDynamicExperiment(question)

  if (knownExperiment) {
    return {
      question,
      spec: knownExperiment,
      generation: {
        models: [],
        reviewed: false,
        fallback: false,
        temporary: true,
      },
    }
  }

  const defaults = configuredProviders()
  const primary = options.primary === undefined
    ? defaults.primary
    : options.primary
  const reviewer = options.reviewer === undefined
    ? defaults.reviewer
    : options.reviewer

  if (!primary) {
    throw new DynamicExperimentGenerationError(
      'not-configured',
      '动态实验生成模型尚未配置。',
    )
  }

  const models: string[] = []
  let fallback = primary.provider === 'qwen'
  let spec: DynamicExperimentSpec

  try {
    spec = await requestGeneratedSpec(
      primary,
      question,
    )
    models.push(`${primary.provider}/${primary.model}`)
  } catch {
    if (!reviewer) {
      throw new DynamicExperimentGenerationError(
        'generation-failed',
        '模型未能生成可安全渲染的实验配置。',
      )
    }

    try {
      spec = await requestGeneratedSpec(
        reviewer,
        question,
      )
      models.push(`${reviewer.provider}/${reviewer.model}`)
      fallback = true
    } catch {
      throw new DynamicExperimentGenerationError(
        'generation-failed',
        '两个模型都未能生成可安全渲染的实验配置。',
      )
    }
  }

  let reviewed = false

  if (!fallback && reviewer && reviewer !== primary) {
    try {
      spec = await requestReviewedSpec(
        reviewer,
        question,
        spec,
      )
      models.push(`${reviewer.provider}/${reviewer.model}`)
      reviewed = true
    } catch {
      // 草案已经通过本地校验，复核服务失败时仍可安全预览。
    }
  }

  return {
    question,
    spec: enrichTeachingEdgeCases(spec),
    generation: {
      models,
      reviewed,
      fallback,
      temporary: true,
    },
  }
}
