import type { RouteDecisionResult } from './routeDecision.js'

/**
 * 明确属于数学可视化、但没有可靠预设实验时，应保留“确认生成”入口。
 * 模型可以否定弱候选，但不能把一个可生成的新实验需求降级成死路。
 */
export function promoteGeneratableNoMatch(
  decision: RouteDecisionResult,
  generationAllowed: boolean,
): RouteDecisionResult {
  if (!generationAllowed || decision.decision !== 'no-match') {
    return decision
  }

  return {
    ...decision,
    decision: 'ai',
    reason: 'ai-clarification',
    message: '没有足够匹配的预设实验，可以确认生成与原始需求一致的临时交互实验。',
  }
}
