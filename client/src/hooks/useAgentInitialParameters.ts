import {
  useLocation,
} from 'react-router-dom'

export type AgentInitialParameterValue =
  | string
  | number
  | boolean

export type AgentInitialParameters = Record<
  string,
  AgentInitialParameterValue
>

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function useAgentInitialParameters():
  AgentInitialParameters {
  const location = useLocation()
  const state = location.state

  if (
    !isRecord(state) ||
    !isRecord(state.initialParameters)
  ) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(state.initialParameters).filter(
      (
        entry,
      ): entry is [string, AgentInitialParameterValue] =>
        typeof entry[1] === 'string' ||
        typeof entry[1] === 'number' ||
        typeof entry[1] === 'boolean',
    ),
  )
}

export function readInitialNumber(
  parameters: AgentInitialParameters,
  key: string,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const value = parameters[key]

  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, value))
    : fallback
}
