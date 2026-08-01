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

const GENERATOR_SYSTEM_PROMPT = `你是数学教学可视化实验设计器。请把用户需求转换成一个临时、可交互的数学实验配置。
只允许三种 renderer.type：cartesian-2d、polar-2d、arithmetic-blocks。
禁止输出 React、JavaScript、HTML、URL、文件路径或 Markdown，只输出一个 JSON 对象。

JSON 字段必须完整：
version 固定为 1；title、description、gradeLevel、formulaLatex；
parameters 是最多 6 个滑块，每项为 {id,label,min,max,step,defaultValue,unit}，id 只能是小写字母开头；
renderer 三选一：
1. {type:"cartesian-2d",expression,xMin,xMax,yMin,yMax,samples}
2. {type:"polar-2d",expression,thetaMin,thetaMax,radiusMax,samples}
3. {type:"arithmetic-blocks",operation,left,right}，operation 只能是 addition|subtraction|multiplication|division，数字为 0 到 24 的整数；
steps 为 1 到 8 项，每项 {title,description,parameterValues}；
knowledgePoints 为 1 到 8 条简短且可验证的数学知识。

表达式使用 mathjs 语法，只能包含数字、x 或 theta、参数 id、pi、e，以及 sin/cos/tan/asin/acos/atan/sqrt/abs/exp/log/ln/floor/ceil/round/min/max/pow。幂使用 ^，不要使用 Math. 前缀。
坐标与参数范围应适合课堂观察。samples 在 100 到 800 之间。
如果问题属于基础四则运算，使用 arithmetic-blocks；极坐标方程使用 polar-2d；其他显式函数使用 cartesian-2d。
内容必须使用中文，数学结论必须保守、准确。`

const REVIEW_SYSTEM_PROMPT = `你是数学教学实验审核员。检查草案的数学正确性、可渲染性、参数范围和课堂表达，并输出修正后的完整 JSON 配置。
必须保持 version=1，只能使用 cartesian-2d、polar-2d、arithmetic-blocks，禁止输出代码、Markdown 或额外说明。
表达式只能使用草案协议列出的安全 mathjs 标识符。无法确定的数学结论应删除或改为保守表述。`

const GENERATION_TIMEOUT_MS = 20_000

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
  })

  const spec = parseDynamicExperimentSpec(
    unwrapSpec(response),
  )

  if (!spec) {
    throw new Error(
      `${provider.provider} returned an invalid experiment spec`,
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
  })

  const spec = parseDynamicExperimentSpec(
    unwrapSpec(response),
  )

  if (!spec) {
    throw new Error(
      `${provider.provider} returned an invalid reviewed spec`,
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
    spec,
    generation: {
      models,
      reviewed,
      fallback,
      temporary: true,
    },
  }
}
