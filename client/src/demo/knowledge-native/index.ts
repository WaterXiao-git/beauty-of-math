import { createElement, lazy, Suspense, type ComponentType } from 'react'
import { HIGH_MATH_CURRICULUM } from '../../course/highMathCurriculum.generated'

const NativeKnowledgeExperiment = lazy(() => import('./NativeKnowledgeExperiment'))

const nativeKnowledgeIds = HIGH_MATH_CURRICULUM.slice(1).reduce<string[]>(
  (ids, courseModule) => [...ids, ...courseModule.points.map(({ id }) => id)],
  [],
)

export const NATIVE_KNOWLEDGE_RENDERERS = Object.fromEntries(
  nativeKnowledgeIds.map((id) => {
    function DedicatedNativeExperiment() {
      return createElement(
        Suspense,
        { fallback: createElement('div', { className: 'flex h-screen items-center justify-center text-sm text-slate-500' }, '正在加载数学实验…') },
        createElement(NativeKnowledgeExperiment, { pointId: id }),
      )
    }
    DedicatedNativeExperiment.displayName = `NativeExperiment(${id})`
    return [id, DedicatedNativeExperiment]
  }),
) as Record<string, ComponentType>
