// ============================================================================
// LLM 服务（架构图分支 B：answer 概念解释）
// 双模型协作：DeepSeek v4-flash 主模型 + Qwen 3.7-plus 备用模型（故障接管）
// 正常请求不执行复核（保证响应速度）；密钥仅存在于服务端环境变量，不下发前端
// ============================================================================
import { generateExplanationPrompt } from '../prompts/explain.js'

export interface ExplanationResult {
  title: string
  summary: string
  keyPoints: string[]
  example: string
}

export interface LLMConfig {
  name: string
  apiKey: string
  baseUrl: string
  model: string
}

// 主模型：DeepSeek；备用模型：Qwen（OpenAI 兼容协议）
export const DEEPSEEK: LLMConfig = {
  name: 'DeepSeek',
  apiKey: process.env.DEEPSEEK_API_KEY ?? '',
  baseUrl: process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com',
  model: process.env.DEEPSEEK_MODEL ?? 'deepseek-chat',
}
export const QWEN: LLMConfig = {
  name: 'Qwen',
  apiKey: process.env.QWEN_API_KEY ?? '',
  baseUrl: process.env.QWEN_BASE_URL ?? 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  model: process.env.QWEN_MODEL ?? 'qwen-plus',
}

interface ChatMessage {
  role: 'system' | 'user'
  content: string
}

/** 调用单个模型（OpenAI 兼容 /chat/completions，30s 超时） */
export async function chat(cfg: LLMConfig, messages: ChatMessage[]): Promise<string> {
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      temperature: 0.6,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(30000),
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
    throw new Error('未配置 LLM API Key（DEEPSEEK_API_KEY 或 QWEN_API_KEY）')
  }

  let lastError: unknown
  for (const provider of providers) {
    try {
      const content = await chat(provider, messages)
      return parseExplanation(content)
    } catch (err) {
      lastError = err
      console.warn(`[llm] ${provider.name} 调用失败，尝试备用模型:`, err)
    }
  }
  throw lastError instanceof Error ? lastError : new Error('LLM 调用失败')
}