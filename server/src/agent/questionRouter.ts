import {
  classifyIntent,
  type IntentClassificationResult,
} from './intentClassifier.js'

import {
  matchExperiments,
  type ExperimentMatchCandidate,
} from './experimentMatcher.js'

import {
  decideRoute,
  refineIntentForMatchedExperiment,
  type RouteDecisionResult,
} from './routeDecision.js'

import {
  analyzeQuestion,
  type QuestionAnalysisResult,
} from './questionAnalyzer.js'

export interface QuestionRouteResult {
  question: string
  analysis: QuestionAnalysisResult
  intent: IntentClassificationResult
  experiments: ExperimentMatchCandidate[]
  routeDecision: RouteDecisionResult
}

/**
 * 组合三层处理：
 *
 * 第一层：识别用户意图
 * 第二层：匹配实验模块
 * 第三层：决定后续处理方式
 */
export function routeQuestion(
  question: string,
): QuestionRouteResult {
  const analysis = analyzeQuestion(question)

  const initialIntentResult =
    classifyIntent(question)

  const initialExperimentResult =
    matchExperiments(
      question,
      initialIntentResult.primaryIntent,
      3,
      analysis,
    )

  const intentResult =
    refineIntentForMatchedExperiment(
      initialIntentResult,
      initialExperimentResult
        .candidates[0] ?? null,
    )

  const experimentResult =
    matchExperiments(
      question,
      intentResult.primaryIntent,
      3,
      analysis,
    )

  const routeDecision = decideRoute(
    intentResult,
    experimentResult.candidates,
  )

  return {
    question,
    analysis,
    intent: intentResult,
    experiments: experimentResult.candidates,
    routeDecision,
  }
}
