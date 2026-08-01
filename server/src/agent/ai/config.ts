export interface AgentModelConfig {
  provider: 'deepseek' | 'qwen'
  apiKey: string
  baseURL: string
  model: string
  timeoutMs: number
}
export interface AgentAIConfig {
  enabled: boolean
  primary: AgentModelConfig | null
  reviewer: AgentModelConfig | null
}

function readPositiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : fallback
}

function isExplicitlyDisabled(
  value: string | undefined,
): boolean {
  return ['0', 'false', 'off', 'no'].includes(
    value?.trim().toLowerCase() ?? '',
  )
}

export function loadAgentAIConfig(
  environment: NodeJS.ProcessEnv = process.env,
): AgentAIConfig {
  const deepSeekKey =
    environment.DEEPSEEK_API_KEY?.trim() ?? ''

  const qwenKey = (
    environment.QWEN_API_KEY ??
    environment.DASHSCOPE_API_KEY ??
    ''
  ).trim()

  const primary = deepSeekKey
    ? {
        provider: 'deepseek' as const,
        apiKey: deepSeekKey,
        baseURL:
          environment.DEEPSEEK_BASE_URL?.trim() ||
          'https://api.deepseek.com/v1',
        model:
          environment.DEEPSEEK_MODEL?.trim() ||
          'deepseek-v4-flash',
        timeoutMs: readPositiveInteger(
          environment.DEEPSEEK_TIMEOUT_MS,
          4_500,
        ),
      }
    : null

  const reviewer = qwenKey
    ? {
        provider: 'qwen' as const,
        apiKey: qwenKey,
        baseURL:
          environment.QWEN_BASE_URL?.trim() ||
          'https://dashscope.aliyuncs.com/compatible-mode/v1',
        model:
          environment.QWEN_MODEL?.trim() ||
          'qwen3.7-plus',
        timeoutMs: readPositiveInteger(
          environment.QWEN_TIMEOUT_MS,
          4_500,
        ),
      }
    : null

  return {
    enabled:
      !isExplicitlyDisabled(
        environment.AGENT_AI_ENABLED,
      ) &&
      (primary !== null || reviewer !== null),
    primary,
    reviewer,
  }
}
