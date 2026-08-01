import type {
  AgentToolName,
} from './types.js'

export interface AgentToolPolicy {
  name: AgentToolName
  status: 'planned' | 'available-preview'
  approvalRequired: boolean
  description: string
}

/**
 * 这里先定义稳定的工具边界，后续 Skill 只需要实现对应适配器。
 * Agent 当前不能执行这些工具。
 */
export const AGENT_TOOL_POLICIES:
  readonly AgentToolPolicy[] = [
    {
      name: 'search-experiments',
      status: 'planned',
      approvalRequired: false,
      description: '从扩展知识库搜索更多已有实验。',
    },
    {
      name: 'create-experiment',
      status: 'available-preview',
      approvalRequired: true,
      description: '生成当前浏览器可预览的临时实验，必须由用户主动确认。',
    },
  ]
