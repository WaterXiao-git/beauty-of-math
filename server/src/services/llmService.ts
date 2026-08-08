// ============================================================================
// LLM 服务（架构图分支 B：answer 概念解释）
// 双模型协作：DeepSeek v4-flash 主模型 + Qwen 3.7-plus 备用模型（故障接管）
// 正常请求不执行复核（保证响应速度）；密钥仅存在于服务端环境变量，不下发前端
// ============================================================================
import { generateExplanationPrompt } from '../prompts/explain.js'
import { loadAgentAIConfig } from '../agent/ai/config.js'

export interface ExplanationResult {
  title: string
  summary: string
  keyPoints: string[]
  example: string
  source?: 'deepseek' | 'qwen' | 'local'
  model?: string
}

export interface LLMConfig {
  name: string
  apiKey: string
  baseUrl: string
  model: string
  timeoutMs: number
}

const sharedAIConfig = loadAgentAIConfig()
const deepSeekConfig = sharedAIConfig.enabled ? sharedAIConfig.primary : null
const qwenConfig = sharedAIConfig.enabled ? sharedAIConfig.reviewer : null

// 概念解释、临时实验生成与路由 Agent 共用同一份模型配置。
export const DEEPSEEK: LLMConfig = {
  name: 'DeepSeek',
  apiKey: deepSeekConfig?.apiKey ?? '',
  baseUrl: deepSeekConfig?.baseURL ?? 'https://api.deepseek.com/v1',
  model: deepSeekConfig?.model ?? 'deepseek-v4-flash',
  timeoutMs: deepSeekConfig?.timeoutMs ?? 8_000,
}
export const QWEN: LLMConfig = {
  name: 'Qwen',
  apiKey: qwenConfig?.apiKey ?? '',
  baseUrl: qwenConfig?.baseURL ?? 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  model: qwenConfig?.model ?? 'qwen3.7-plus',
  timeoutMs: qwenConfig?.timeoutMs ?? 20_000,
}

interface ChatMessage {
  role: 'system' | 'user'
  content: string
}

const LOCAL_EXPLANATIONS: Array<{
  matches: string[]
  content: ExplanationResult
}> = [
  {
    matches: ['罗尔定理', 'rolle'],
    content: {
      title: '罗尔定理：从端点等高到水平切线',
      summary: '罗尔定理说明：函数在闭区间连续、在开区间可导，并且两个端点函数值相等时，曲线内部至少有一点的切线是水平的。当前默认图像使用 f(x)=x²−1，在 [-1,1] 上两端等高，最低点 ξ=0 处的导数为 0。',
      keyPoints: [
        '闭区间 [a,b] 连续，保证曲线中间没有断裂。',
        '开区间 (a,b) 可导，保证内部每一点都有可讨论的切线。',
        '端点等高 f(a)=f(b)，配合前两个条件可推出至少一个 ξ 满足 f′(ξ)=0。',
        '定理只保证“至少存在”，不保证这个点唯一。',
      ],
      example: '在图中取 a=-1、b=1，则 f(-1)=f(1)=0；抛物线在 ξ=0 处达到最低点，水平切线斜率为 f′(0)=0。切换反例或关闭条件，可以观察结论为什么不再得到保证。',
    },
  },
  {
    matches: ['导数的几何意义', '导数几何', 'difference quotient'],
    content: {
      title: '导数的几何意义：割线趋近切线',
      summary: '导数是差商在 h 趋近 0 时的极限。图中的点 P 固定在 x₀，点 Q 位于 x₀+h；当 h 的绝对值逐渐变小时，割线 PQ 会趋近 P 点的切线，其斜率趋近 f′(x₀)。',
      keyPoints: [
        'h>0 表示 Q 从 x₀ 的右侧趋近，h<0 表示从左侧趋近。',
        '差商 [f(x₀+h)-f(x₀)]/h 是割线斜率。',
        '若左右差商趋向同一个有限值，函数才在 x₀ 处可导。',
      ],
      example: '分别点击“左侧趋近”和“右侧趋近”，比较 h=-0.8 与 h=0.8 时的割线。继续让 |h| 变小，两侧斜率会逐步接近同一条切线的斜率。',
    },
  },
  {
    matches: ['ε-δ', 'ε−δ', '极限定义'],
    content: {
      title: 'ε−δ 极限定义：把输出误差变成输入范围',
      summary: 'ε 控制函数值与目标 L 的允许误差，δ 控制自变量与 x₀ 的允许距离。极限成立意味着：无论给出多小的 ε，都能找到一个 δ，使 0<|x-x₀|<δ 时必有 |f(x)-L|<ε。',
      keyPoints: [
        '横向的 δ 邻域是条件，纵向的 ε 带是目标。',
        'δ 通常依赖于 ε；ε 变小时，所需的 δ 往往也会变小。',
        '条件排除 x=x₀，因此极限关注附近趋势，而不是点值本身。',
      ],
      example: '拖动 ε 滑块缩窄纵向误差带，再观察需要怎样缩小横向 δ 邻域，才能让邻域内的曲线全部落在 ε 带中。',
    },
  },
]

export function buildLocalExplanation(question: string, core: string): ExplanationResult {
  const normalizedContext = `${core}\n${question}`.toLowerCase()
  const matched = LOCAL_EXPLANATIONS.find(({ matches }) =>
    matches.some((keyword) => normalizedContext.includes(keyword.toLowerCase())),
  )
  if (matched) return matched.content

  const concept = core.trim() || '当前数学知识点'
  return {
    title: `${concept}：结合当前演示理解`,
    summary: `可以从“定义、图像、参数变化”三个层次理解${concept}：先明确研究对象、成立条件和目标结论，再观察图像中的关键量如何变化，最后把这些变化与公式或结论逐一对应。`,
    keyPoints: [
      '先确认定义中的对象、条件和结论，避免只记公式。',
      '逐个改变演示参数，观察哪些量随之变化、哪些关系保持不变。',
      '使用边界值、反例或左右两侧情况检查结论的适用范围。',
    ],
    example: `请在当前“${concept}”演示中一次只调整一个参数，记录调整前后的图像、数值和结论，再用定义解释哪些变化是必然的、哪些只来自当前案例。`,
  }
}

/** 调用单个模型（OpenAI 兼容 /chat/completions，供应商独立超时） */
export async function chat(cfg: LLMConfig, messages: ChatMessage[]): Promise<string> {
  const providerOptions = cfg.name === 'DeepSeek'
    ? { thinking: { type: 'disabled' } }
    : { enable_thinking: false }
  const baseUrl = cfg.baseUrl.replace(/\/$/, '')
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      temperature: 0.6,
      max_tokens: 800,
      stream: false,
      response_format: { type: 'json_object' },
      ...providerOptions,
    }),
    signal: AbortSignal.timeout(cfg.timeoutMs),
  })
  if (!res.ok) {
    throw new Error(`${cfg.name} HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  const content = data.choices?.[0]?.message?.content ?? ''
  if (!content) throw new Error(`${cfg.name} 返回为空`)
  return content
}

/** 解析模型 JSON 输出（容错：截取 JSON 块） */
function parseExplanation(content: string): ExplanationResult {
  let text = content.trim()
  const block = text.match(/\{[\s\S]*\}/)
  if (block) text = block[0]
  const parsed = JSON.parse(text) as Partial<ExplanationResult>
  if (!parsed.title || !parsed.summary) {
    throw new Error('模型输出缺少必要字段（title/summary）')
  }
  return {
    title: String(parsed.title),
    summary: String(parsed.summary),
    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.map(String).slice(0, 6) : [],
    example: String(parsed.example ?? ''),
  }
}

/** 生成概念解释：主模型优先，失败自动切换备用模型（故障接管） */
export async function generateExplanation(question: string, core: string): Promise<ExplanationResult> {
  const messages: ChatMessage[] = [
    { role: 'system', content: generateExplanationPrompt },
    { role: 'user', content: `问题：${question}${core ? `\n核心概念：${core}` : ''}` },
  ]

  const providers = [DEEPSEEK, QWEN].filter((p) => p.apiKey)
  if (providers.length === 0) {
    return { ...buildLocalExplanation(question, core), source: 'local' }
  }

  let lastError: unknown
  for (const provider of providers) {
    try {
      const content = await chat(provider, messages)
      const source = provider.name === 'DeepSeek' ? 'deepseek' : 'qwen'
      console.info(`[llm] ${provider.name} 调用成功 (${provider.model})`)
      return { ...parseExplanation(content), source, model: provider.model }
    } catch (err) {
      lastError = err
      console.warn(`[llm] ${provider.name} 调用失败，尝试备用模型:`, err)
    }
  }
  console.warn('[llm] 双模型均不可用，返回本地上下文解释:', lastError)
  return { ...buildLocalExplanation(question, core), source: 'local' }
}
