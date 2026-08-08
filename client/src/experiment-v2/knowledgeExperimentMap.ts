import type {
  KnowledgePoint,
} from '../course/courseData'

import {
  experiments,
} from '../experiments/catalog'

import {
  normalizeExperimentId,
} from './routing'

// ============================================================================
// Knowledge Point → Experiment V2
//
// 作用：
//
// /demo/:pointId
//      ↓
// KnowledgePoint
//      ↓
// resolveKnowledgeExperiment()
//      ↓
// 已有 Native V2 / Legacy V2 Renderer
//
// 解析优先级：
//
// 1. point.demoId
// 2. 显式知识点映射
// 3. point.experimentPath
// 4. 知识点 id 与实验 id 同名
// 5. null —— 确实没有 Renderer
//
// ============================================================================

// ============================================================================
// Resolution
// ============================================================================

export type KnowledgeExperimentSource =
  | 'demo-id'
  | 'explicit-map'
  | 'experiment-path'
  | 'same-id'

export interface KnowledgeExperimentResolution {
  experimentId: string

  source:
    KnowledgeExperimentSource
}

// ============================================================================
// Catalog
//
// 将：
//
// /linear-function
// /calculus
// /fourier
//
// 转换为：
//
// linear-function
// calculus
// fourier
//
// 后续所有映射都必须最终指向真实存在于 catalog 中的实验。
// ============================================================================

const availableExperimentIds =
  new Set(
    experiments.map(
      (
        experiment,
      ) =>
        normalizeExperimentId(
          experiment.path,
        ),
    ),
  )

// ============================================================================
// 显式知识点映射
//
// 这里只记录：
//
// KnowledgePoint.id
// 与
// Experiment.id
//
// 明显不一致的情况。
//
// 如果二者本来同名，不需要写在这里。
// ============================================================================

export const knowledgeExperimentMap:
  Readonly<Record<string, string>> = {
  // --------------------------------------------------------------------------
  // 函数
  // --------------------------------------------------------------------------

  function:
    'linear-function',

  'function-representation':
    'function-transform',

  'function-properties':
    'function-transform',

  // --------------------------------------------------------------------------
  // 极限
  // --------------------------------------------------------------------------

  /**
   * 数列极限可以先复用数列实验。
   *
   * 后续如果增加专门 ε-N Renderer，
   * 再把这里替换为新的 experiment id。
   */
  'limit-of-sequence':
    'sequences',

  // --------------------------------------------------------------------------
  // 注意：
  //
  // two-important-limits 暂时故意不映射。
  //
  // 因为目前实验库没有真正对应：
  //
  // lim(x→0) sin(x)/x = 1
  //
  // 与
  //
  // lim(x→∞) (1 + 1/x)^x = e
  //
  // 的专用 Renderer。
  //
  // 不应该为了消灭 Placeholder，
  // 强行指向一个数学内容不匹配的实验。
  // --------------------------------------------------------------------------
}

// ============================================================================
// Helpers
// ============================================================================

export function hasExperimentId(
  experimentId: string,
): boolean {
  return availableExperimentIds.has(
    normalizeExperimentId(
      experimentId,
    ),
  )
}

export function getExplicitKnowledgeExperimentId(
  pointId: string,
): string | null {
  const normalizedPointId =
    normalizeExperimentId(
      pointId,
    )

  const mapped =
    knowledgeExperimentMap[
      normalizedPointId
    ]

  if (!mapped) {
    return null
  }

  const experimentId =
    normalizeExperimentId(
      mapped,
    )

  if (
    !availableExperimentIds.has(
      experimentId,
    )
  ) {
    return null
  }

  return experimentId
}

// ============================================================================
// Resolver
// ============================================================================

export function resolveKnowledgeExperiment(
  point:
    KnowledgePoint,
):
  KnowledgeExperimentResolution | null {
  // ==========================================================================
  // 1. Dedicated Demo
  //
  // 例如：
  //
  // limit-of-function
  //      ↓
  // epsilon-delta
  //
  // derivative
  //      ↓
  // derivative
  //
  // demoId 优先级最高，因为它通常代表专门为课程知识点制作的 Renderer。
  // ==========================================================================

  if (
    point.demoId
  ) {
    const experimentId =
      normalizeExperimentId(
        point.demoId,
      )

    /**
     * demoId 可能对应：
     *
     * demo native registry
     *
     * 而不一定出现在 experiments/catalog。
     *
     * 因此这里不要求 catalog 中必须存在。
     */
    return {
      experimentId,

      source:
        'demo-id',
    }
  }

  // ==========================================================================
  // 2. Explicit mapping
  // ==========================================================================

  const explicitId =
    getExplicitKnowledgeExperimentId(
      point.id,
    )

  if (
    explicitId
  ) {
    return {
      experimentId:
        explicitId,

      source:
        'explicit-map',
    }
  }

  // ==========================================================================
  // 3. experimentPath
  //
  // 例如：
  //
  // continuity
  //      ↓
  // /calculus
  //      ↓
  // calculus
  // ==========================================================================

  if (
    point.experimentPath
  ) {
    const experimentId =
      normalizeExperimentId(
        point.experimentPath,
      )

    if (
      availableExperimentIds.has(
        experimentId,
      )
    ) {
      return {
        experimentId,

        source:
          'experiment-path',
      }
    }
  }

  // ==========================================================================
  // 4. Same ID
  //
  // 如果课程知识点叫：
  //
  // mean-value-theorem
  //
  // 而实验库恰好也存在：
  //
  // /mean-value-theorem
  //
  // 就自动匹配。
  //
  // 这样以后增加课程知识点时，
  // 很多情况完全不需要手工维护映射表。
  // ==========================================================================

  const sameId =
    normalizeExperimentId(
      point.id,
    )

  if (
    availableExperimentIds.has(
      sameId,
    )
  ) {
    return {
      experimentId:
        sameId,

      source:
        'same-id',
    }
  }

  // ==========================================================================
  // 5. Missing Renderer
  //
  // 到这里才真正说明：
  //
  // 这个知识点目前没有可以复用的数学 Renderer。
  //
  // two-important-limits 当前就属于这里。
  // ==========================================================================

  return null
}

// ============================================================================
// Convenience API
// ============================================================================

export function resolveKnowledgeExperimentId(
  point:
    KnowledgePoint,
): string | null {
  return (
    resolveKnowledgeExperiment(
      point,
    )?.experimentId ??
    null
  )
}

// ============================================================================
// Diagnostics
//
// 后面可以用于批量检查：
//
// 哪些课程知识点已经有 Renderer
// 哪些知识点仍然缺 Renderer
// ============================================================================

export function canResolveKnowledgeExperiment(
  point:
    KnowledgePoint,
): boolean {
  return (
    resolveKnowledgeExperiment(
      point,
    ) !==
    null
  )
}

export function getAvailableExperimentIds():
  string[] {
  return Array.from(
    availableExperimentIds,
  ).sort()
}