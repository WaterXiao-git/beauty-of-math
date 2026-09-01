import type {
  ExperimentComputation,
  ExperimentRegistration,
} from './model'
import { judgePrediction } from './prediction'
import { computeExperiment, createInitialParameterValues } from './runtime'
import type {
  ParameterValue,
  ParameterValues,
  PredictionJudgement,
  PredictionResponse,
  PredictionSpec,
} from './schema'

export interface LearningSession<SceneData = unknown> {
  step: number
  params: ParameterValues
  prediction: PredictionSpec
  response: PredictionResponse | null
  reason: string
  judgement: PredictionJudgement | null
  computation: ExperimentComputation<SceneData>
  counterexampleId: string | null
}

export function createLearningSession<Config, SceneData>(
  registration: ExperimentRegistration<Config, SceneData>,
): LearningSession<SceneData> {
  const params = createInitialParameterValues(registration)
  return {
    step: 2,
    params,
    prediction: registration.model.buildPrediction(registration.config.modelConfig, params),
    response: null,
    reason: '',
    judgement: null,
    computation: computeExperiment(registration, params),
    counterexampleId: null,
  }
}

export function submitLearningPrediction<SceneData>(
  session: LearningSession<SceneData>,
  response: PredictionResponse,
  reason = '',
): LearningSession<SceneData> {
  return {
    ...session,
    step: 3,
    response,
    reason: reason.trim(),
    judgement: judgePrediction(session.prediction, response),
  }
}

export function selectLearningStep<SceneData>(
  session: LearningSession<SceneData>,
  step: number,
): LearningSession<SceneData> {
  const safeStep = Math.max(1, Math.min(7, Math.round(step)))
  if (safeStep > 2 && !session.judgement) {
    throw new Error('请先提交预测，再开始实验操作')
  }
  return { ...session, step: safeStep }
}

export function updateLearningParameter<Config, SceneData>(
  registration: ExperimentRegistration<Config, SceneData>,
  session: LearningSession<SceneData>,
  key: string,
  value: ParameterValue,
): LearningSession<SceneData> {
  if (!session.judgement) throw new Error('请先提交预测，再调整实验参数')
  const params = { ...session.params, [key]: value }
  return {
    ...session,
    params,
    counterexampleId: null,
    computation: computeExperiment(registration, params),
  }
}

export function activateCounterexample<Config, SceneData>(
  registration: ExperimentRegistration<Config, SceneData>,
  session: LearningSession<SceneData>,
  counterexampleId: string,
): LearningSession<SceneData> {
  if (!session.judgement) throw new Error('请先提交预测，再切换反例')
  const counterexample = registration.model.counterexamples(registration.config.modelConfig)
    .find(({ id }) => id === counterexampleId)
  if (!counterexample) throw new Error(`未知反例：${counterexampleId}`)
  const params = { ...session.params, ...counterexample.parameterOverrides }
  return {
    ...session,
    step: 7,
    params,
    counterexampleId,
    computation: computeExperiment(registration, params, counterexampleId),
  }
}
