import type { KnowledgePoint } from '../course/courseData'

/**
 * 将实验路径或实验 ID 统一转换成标准实验 ID。
 *
 * 示例：
 * /epsilon-delta   -> epsilon-delta
 * derivative       -> derivative
 * /limit-laws/     -> limit-laws
 */
export function normalizeExperimentId(pathOrId: string): string {
  return pathOrId
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
}

/**
 * 根据实验路径或实验 ID 生成统一 Demo V2 路径。
 *
 * 示例：
 * /epsilon-delta -> /demo/epsilon-delta
 * derivative     -> /demo/derivative
 */
export function getExperimentDemoPath(pathOrId: string): string {
  const id = normalizeExperimentId(pathOrId)

  return `/demo/${encodeURIComponent(id)}`
}

/**
 * 获取课程知识点对应的统一 Demo V2 地址。
 *
 * 所有「进入演示」最终都应该通过这个函数生成地址。
 *
 * 示例：
 *
 * 函数极限
 * => /demo/epsilon-delta
 *
 * 连续
 * => null
 *
 * 极限运算法则
 * => /demo/limit-laws
 */
export function getKnowledgePointDemoPath(point: KnowledgePoint): string | null {
  return point.rendererId
    ? `/demo/${encodeURIComponent(point.rendererId)}`
    : null
}

/**
 * 判断当前 pathname 是否属于统一 Demo V2 页面。
 */
export function isDemoPath(pathname: string): boolean {
  return pathname.startsWith('/demo/')
}

/**
 * 从 /demo/:id URL 中提取实验 ID。
 *
 * 示例：
 * /demo/epsilon-delta
 * => epsilon-delta
 */
export function getExperimentIdFromDemoPath(
  pathname: string,
): string | null {
  if (!isDemoPath(pathname)) {
    return null
  }

  const rawId = pathname.slice('/demo/'.length)

  if (!rawId) {
    return null
  }

  try {
    return normalizeExperimentId(
      decodeURIComponent(rawId),
    )
  } catch {
    return normalizeExperimentId(rawId)
  }
}
