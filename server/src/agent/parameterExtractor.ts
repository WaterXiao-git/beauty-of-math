export type ExperimentParameterValue =
  | string
  | number
  | boolean

export type ExperimentInitialParameters =
  Record<string, ExperimentParameterValue>

/**
 * 当前 Native Demo 尚未定义从 Agent 路由接收初始参数的协议。
 */
export function extractExperimentInitialParameters(
  _question: string,
  _experimentId: string,
): ExperimentInitialParameters {
  return {}
}
