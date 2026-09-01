import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { findChapterOf } from '../../course/courseData'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'
import type { StepItem } from '../../demo/PlayerBar'
import {
  activateCounterexample,
  createLearningSession,
  selectLearningStep,
  submitLearningPrediction,
  updateLearningParameter,
} from '../learningSession'
import type { ExperimentComputation, ExperimentRegistration } from '../model'
import type { PredictionResponse } from '../schema'
import ObservationPanel from './ObservationPanel'
import ParameterControls from './ParameterControls'
import PredictionComparison from './PredictionComparison'
import PredictionPanel from './PredictionPanel'
import ValidationPanel from './ValidationPanel'

const steps: StepItem[] = [
  { id: 'question', title: '提出问题', desc: '明确本实验要研究的数学问题。' },
  { id: 'prediction', title: '学生预测', desc: '先提交可自动判定的预测。' },
  { id: 'explore', title: '调整变量', desc: '改变有明确数学含义的参数。' },
  { id: 'observe', title: '观察结果', desc: '同步读取图像和关键数值。' },
  { id: 'validate', title: '检查条件', desc: '逐项核对定理或结论的成立条件。' },
  { id: 'conclude', title: '输出结论', desc: '对比预测、实际结果和原因。' },
  { id: 'counterexample', title: '切换反例', desc: '破坏关键条件并观察结论如何失效。' },
]

export default function ExperimentRuntimePage<Config, SceneData>({
  registration,
  renderScene,
}: {
  registration: ExperimentRegistration<Config, SceneData>
  renderScene: (scene: SceneData, computation: ExperimentComputation<SceneData>) => ReactNode
}) {
  const [session, setSession] = useState(() => createLearningSession(registration))
  const [playing, setPlaying] = useState(false)
  const parameterSpecs = useMemo(
    () => registration.model.parameters(registration.config.modelConfig),
    [registration],
  )
  const counterexamples = useMemo(
    () => registration.model.counterexamples(registration.config.modelConfig),
    [registration],
  )

  useEffect(() => {
    if (!playing || !session.judgement || session.step >= steps.length) return
    const timer = window.setTimeout(() => setSession((current) => selectLearningStep(current, current.step + 1)), 1500)
    return () => window.clearTimeout(timer)
  }, [playing, session.judgement, session.step])

  const chooseStep = (next: number) => {
    if (next > 2 && !session.judgement) return
    setSession((current) => selectLearningStep(current, next))
  }
  const handlePrediction = (response: PredictionResponse, reason: string) => {
    setSession((current) => submitLearningPrediction(current, response, reason))
  }
  const chapter = findChapterOf(registration.config.id)
  const unlocked = Boolean(session.judgement)

  return <ExperimentShell
    breadcrumb={['高等数学', chapter?.title ?? '实验', registration.config.title]}
    title={registration.config.title}
    subtitle={registration.config.question}
    canvas={unlocked
      ? renderScene(session.computation.scene, session.computation)
      : <div className="flex h-full min-h-[420px] items-center justify-center bg-slate-50">
        <div className="max-w-sm rounded-2xl border border-dashed border-indigo-200 bg-white px-6 py-8 text-center">
          <p className="text-base font-bold text-slate-800">先提交预测</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">提交后开放实验参数、动态图像和实际数学结果。</p>
        </div>
      </div>}
    sidebar={<>
      <ExperimentCard title="提出问题"><p className="text-sm leading-7 text-slate-600">{registration.config.question}</p></ExperimentCard>
      <ExperimentCard title="学生预测"><PredictionPanel spec={session.prediction} submitted={unlocked} onSubmit={handlePrediction} /></ExperimentCard>
      <ExperimentCard title="实验参数"><ParameterControls specs={parameterSpecs} values={session.params} disabled={!unlocked} onChange={(key, value) => setSession((current) => updateLearningParameter(registration, current, key, value))} /></ExperimentCard>
      {unlocked && <ExperimentCard title="当前公式"><p className="rounded-xl bg-slate-50 px-3 py-2 text-center font-mono text-sm font-semibold text-indigo-700">{session.computation.formula.text}</p></ExperimentCard>}
      {unlocked && session.step >= 4 && <ExperimentCard title="当前观察"><ObservationPanel observations={session.computation.observations} /></ExperimentCard>}
      {unlocked && session.step >= 5 && <ExperimentCard title="条件验证"><ValidationPanel conditions={session.computation.conditions} verification={session.computation.verification} /></ExperimentCard>}
      {session.judgement && session.step >= 6 && <ExperimentCard title="实验结论"><PredictionComparison judgement={session.judgement} computation={session.computation} reason={session.reason} /></ExperimentCard>}
      {unlocked && session.step >= 7 && <ExperimentCard title="反例检验"><div className="space-y-2">{counterexamples.map((counterexample) => <button key={counterexample.id} type="button" onClick={() => setSession((current) => activateCounterexample(registration, current, counterexample.id))} className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${session.counterexampleId === counterexample.id ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-600'}`}><span className="font-semibold">{counterexample.label}</span><span className="mt-1 block text-xs leading-5">{counterexample.explanation}</span></button>)}</div></ExperimentCard>}
    </>}
    player={{
      steps,
      step: session.step,
      playing,
      onPrev: () => chooseStep(session.step - 1),
      onNext: () => chooseStep(session.step + 1),
      onTogglePlay: () => unlocked && setPlaying((current) => !current),
      onReset: () => { setPlaying(false); setSession(createLearningSession(registration)) },
      onStepSelect: chooseStep,
    }}
  />
}
