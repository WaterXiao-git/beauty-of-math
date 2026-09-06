import type { ComponentType } from 'react'
import { FUNCTION_BASICS_RENDERERS } from '../demo/function-basics'
import { NATIVE_KNOWLEDGE_RENDERERS } from '../demo/knowledge-native'
import {
  OWNED_EXPERIMENT_CATALOG,
  type OwnedExperimentId,
} from './catalog.generated'

export const OWNED_EXPERIMENT_RENDERERS = {
  ...FUNCTION_BASICS_RENDERERS,
  ...NATIVE_KNOWLEDGE_RENDERERS,
} as unknown as Record<OwnedExperimentId, ComponentType>

if (Object.keys(OWNED_EXPERIMENT_RENDERERS).length !== OWNED_EXPERIMENT_CATALOG.length) {
  throw new Error('Native 实验 Renderer 数量与正式实验目录不一致')
}
