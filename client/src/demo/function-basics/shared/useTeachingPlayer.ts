import { useCallback, useEffect, useMemo, useState } from 'react'
import type { StepItem } from '../../PlayerBar'
import type { ExperimentPlayerConfig } from '../../../experiment-v2/ExperimentShell'

export interface TeachingStep<T> extends StepItem {
  state: Partial<T>
}

export function useTeachingPlayer<T extends object>(initialState: T, teachingSteps: TeachingStep<T>[]) {
  const [state, setState] = useState(initialState)
  const [step, setStep] = useState(1)
  const [playing, setPlaying] = useState(false)
  const selectStep = useCallback((next: number) => {
    const safe = Math.max(1, Math.min(next, teachingSteps.length))
    setStep(safe)
    setState((current) => ({ ...current, ...teachingSteps[safe - 1].state }))
  }, [teachingSteps])

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      setStep((current) => {
        const next = current + 1
        if (next > teachingSteps.length) {
          setPlaying(false)
          return current
        }
        setState((old) => ({ ...old, ...teachingSteps[next - 1].state }))
        return next
      })
    }, 1400)
    return () => window.clearInterval(timer)
  }, [playing, teachingSteps])

  const player = useMemo<ExperimentPlayerConfig>(() => ({
    steps: teachingSteps.map(({ id, title, desc }) => ({ id, title, desc })),
    step,
    playing,
    onPrev: () => selectStep(step - 1),
    onNext: () => selectStep(step + 1),
    onStepSelect: selectStep,
    onTogglePlay: () => {
      if (step === teachingSteps.length) selectStep(1)
      setPlaying((current) => !current)
    },
    onReset: () => {
      setState(initialState)
      setStep(1)
      setPlaying(false)
    },
  }), [initialState, playing, selectStep, step, teachingSteps])

  return { state, setState, step, player }
}
