// 知识点服务层：列表摘要 / 详情查询（业务逻辑与路由、数据分离）
import { knowledgePoints } from '../data/knowledge.js'
import type { KnowledgeConfig } from '../data/knowledge.js'

/** 列表返回的精简摘要（不含案例/步骤完整内容，控制响应体积） */
export interface KnowledgeSummary {
  id: string
  title: string
  course: string
  chapter: string
  section?: string
  template: KnowledgeConfig['template']
  defaultCase: string
  meta: KnowledgeConfig['meta']
  version: number
}

/** 获取知识点精简列表 */
export function listKnowledge(): KnowledgeSummary[] {
  return knowledgePoints.map(({ cases: _cases, steps: _steps, conditions: _conditions, summary: _summary, goals: _goals, ...summary }) => summary)
}

/** 按 id 获取完整知识点配置；不存在返回 null */
export function getKnowledgeById(id: string): KnowledgeConfig | null {
  if (!id || typeof id !== 'string') return null
  return knowledgePoints.find((k) => k.id === id) ?? null
}