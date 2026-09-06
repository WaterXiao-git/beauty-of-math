import ExperimentRuntimePage from '../../experiment-core/components/ExperimentRuntimePage'
import { getExperimentRegistration } from '../../experiment-core/registry'
import KnowledgeSceneRenderer from '../../experiment-core/renderers/KnowledgeSceneRenderer'

export default function NativeKnowledgeExperiment({ pointId }: { pointId: string }) {
  const registration = getExperimentRegistration(pointId)
  if (!registration) return null

  return <ExperimentRuntimePage
    registration={registration}
    renderScene={(scene) => <KnowledgeSceneRenderer scene={scene} />}
  />
}
