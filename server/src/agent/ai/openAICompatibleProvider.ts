import type {
  AgentModelConfig,
} from './config.js'

import type {
  AgentModelProvider,
  AgentModelRequest,
} from './types.js'

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: unknown
    }
  }>
}
function readTextContent(
  content: unknown,
): string {
  if (typeof content === 'string') {
    return content
  }

  if (!Array.isArray(content)) {
    return ''
  }

  return content
    .map((part) => {
      if (
        typeof part === 'object' &&
        part !== null &&
        'text' in part &&
        typeof part.text === 'string'
      ) {
        return part.text
      }

      return ''
    })
    .join('')
}

function parseJSONContent(
  content: string,
): unknown {
  const trimmed = content.trim()
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')

  return JSON.parse(withoutFence)
}

export class OpenAICompatibleProvider
implements AgentModelProvider {
  readonly provider: 'deepseek' | 'qwen'
  readonly model: string

  private readonly config: AgentModelConfig

  constructor(config: AgentModelConfig) {
    this.config = config
    this.provider = config.provider
    this.model = config.model
  }

  async completeJSON(
    request: AgentModelRequest,
  ): Promise<unknown> {
    const controller = new AbortController()
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.timeoutMs,
    )

    try {
      const baseURL =
        this.config.baseURL.replace(/\/$/, '')

      const providerOptions =
        this.provider === 'deepseek'
          ? {
              thinking: {
                type: 'disabled',
              },
            }
          : {
              enable_thinking: false,
            }

      const response = await fetch(
        `${baseURL}/chat/completions`,
        {
          method: 'POST',
          headers: {
            Authorization:
              `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: [
              {
                role: 'system',
                content: request.systemPrompt,
              },
              {
                role: 'user',
                content: request.userPrompt,
              },
            ],
            response_format: {
              type: 'json_object',
            },
            temperature: 0.1,
            max_tokens: 700,
            stream: false,
            ...providerOptions,
          }),
          signal: controller.signal,
        },
      )

      if (!response.ok) {
        throw new Error(
          `${this.provider} request failed with status ${response.status}`,
        )
      }

      const body =
        await response.json() as ChatCompletionResponse

      const content = readTextContent(
        body.choices?.[0]?.message?.content,
      )

      if (!content) {
        throw new Error(
          `${this.provider} returned empty content`,
        )
      }

      return parseJSONContent(content)
    } finally {
      clearTimeout(timeout)
    }
  }
}
