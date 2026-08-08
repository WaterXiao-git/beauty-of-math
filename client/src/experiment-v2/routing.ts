import type { KnowledgePoint } from '../course/courseData'

/**
 * 将实验路径或实验 ID 统一转换成标准实验 ID。
 *
 * 示例：
 * /calculus        -> calculus
 * calculus         -> calculus
 * /fourier/        -> fourier
 * /lorenz-attractor -> lorenz-attractor
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
 * /calculus -> /demo/calculus
 * fourier   -> /demo/fourier
 */
export function getExperimentDemoPath(pathOrId: string): string {
  const id = normalizeExperimentId(pathOrId)

  return `/demo/${encodeURIComponent(id)}`
}

/**
 * 获取一个课程知识点实际应该使用的 Demo ID。
 *
 * 优先级：
 *
 * 1. demoId
 * 2. experimentPath
 * 3. knowledgePoint.id
 *
 * 示例：
 *
 * 函数极限：
 * demoId = epsilon-delta
 * => epsilon-delta
 *
 * 连续：
 * experimentPath = /calculus
 * => calculus
 *
 * 尚未实现的极限运算法则：
 * id = limit-laws
 * => limit-laws
 */
export function getKnowledgePointDemoId(point: KnowledgePoint): string {
  if (point.demoId) {
    return normalizeExperimentId(point.demoId)
  }

  if (point.experimentPath) {
    return normalizeExperimentId(point.experimentPath)
  }

  return normalizeExperimentId(point.id)
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
 * => /demo/calculus
 *
 * 极限运算法则
 * => /demo/limit-laws
 */
export function getKnowledgePointDemoPath(point: KnowledgePoint): string {
  return getExperimentDemoPath(
    getKnowledgePointDemoId(point),
  )
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
 * /demo/fourier
 * => fourier
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