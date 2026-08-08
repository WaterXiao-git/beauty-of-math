import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import MathFormula from '../../components/MathFormula/MathFormula'
import ParameterPanel from '../../components/ParameterPanel/ParameterPanel'
import ExperimentCard from '../../experiment-v2/ExperimentCard'
import ExperimentShell from '../../experiment-v2/ExperimentShell'

import {
  loadDynamicExperimentPreview,
} from '../../services/dynamicExperiment'

import DynamicVisualization from './DynamicVisualization'

const RENDERER_LABELS = {
  'cartesian-2d': '直角坐标交互图',
  'polar-2d': '极坐标交互图',
  'arithmetic-blocks': '算术方块演示',
  'sandboxed-html': 'AI 交互画布',
} as const

export default function DynamicExperimentPage() {
  const navigate = useNavigate()
  const [response] = useState(
    () => loadDynamicExperimentPreview(),
  )
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const spec = response?.spec ?? null
  const [parameterValues, setParameterValues] =
    useState<Record<string, number>>(() => ({
      ...Object.fromEntries(
        response?.spec.parameters.map((parameter) => [
          parameter.id,
          parameter.defaultValue,
        ]) ?? [],
      ),
      ...(response?.spec.steps[0]?.parameterValues ?? {}),
    }))

  useEffect(() => {
    if (!isPlaying || !spec) return

    const timer = window.setInterval(() => {
      setCurrentStep((previous) => {
        if (previous >= spec.steps.length - 1) {
          setIsPlaying(false)
          return previous
        }

        const nextStep = previous + 1
        setParameterValues((values) => ({
          ...values,
          ...spec.steps[nextStep].parameterValues,
        }))
        if (nextStep >= spec.steps.length - 1) {
          setIsPlaying(false)
        }
        return nextStep
      })
    }, 1_800)

    return () => window.clearInterval(timer)
  }, [isPlaying, spec])

  const sliderParameters = useMemo(
    () =>
      spec?.parameters.map((parameter) => ({
        key: parameter.id,
        label: parameter.label,
        value:
          parameterValues[parameter.id] ??
          parameter.defaultValue,
        min: parameter.min,
        max: parameter.max,
        step: parameter.step,
        unit: parameter.unit,
      })) ?? [],
    [parameterValues, spec],
  )

  if (!response || !spec) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">
            临时实验已失效
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            临时实验只保存在当前浏览器会话中，请重新描述并生成。
          </p>
          <button
            type="button"
            onClick={() => navigate('/ask')}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white"
          >
            返回智能提问
          </button>
        </div>
      </div>
    )
  }

  const setStep = (nextStep: number) => {
    const boundedStep = Math.min(
      spec.steps.length - 1,
      Math.max(0, nextStep),
    )
    setIsPlaying(false)
    setCurrentStep(boundedStep)
    setParameterValues((previous) => ({
      ...previous,
      ...spec.steps[boundedStep].parameterValues,
    }))
  }

  const resetExperiment = () => {
    setIsPlaying(false)
    setCurrentStep(0)
    setParameterValues({
      ...Object.fromEntries(
        spec.parameters.map((parameter) => [
          parameter.id,
          parameter.defaultValue,
        ]),
      ),
      ...(spec.steps[0]?.parameterValues ?? {}),
    })
  }

  return (
    <ExperimentShell
      breadcrumb={[
        '临时实验',
        'AI 生成',
        spec.title,
      ]}
      title={spec.title}
      subtitle={spec.description}
      legend={[
        {
          label: RENDERER_LABELS[spec.renderer.type],
          color: '#6366f1',
        },
        {
          label: '当前会话临时预览',
          color: '#a855f7',
        },
      ]}
      canvasScrollable
      canvas={
        <div className="flex min-h-full w-full flex-col gap-4 p-3 text-slate-800 md:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                数学模型
              </div>
              <MathFormula
                formula={spec.formulaLatex}
                className="mt-1 overflow-x-auto text-lg text-slate-800 md:text-xl"
              />
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-purple-600 ring-1 ring-purple-100">
              AI 临时实验 · 未保存
            </span>
          </div>

          <div className="min-h-[420px] flex-1">
            <DynamicVisualization
              renderer={spec.renderer}
              parameters={parameterValues}
            />
          </div>
        </div>
      }
      sidebar={
        <>
          {sliderParameters.length > 0 && (
            <ParameterPanel
              title="案例与参数"
              params={sliderParameters}
              onChange={(key, value) => {
                setIsPlaying(false)
                setParameterValues((previous) => ({
                  ...previous,
                  [key]: value,
                }))
              }}
              className="shadow-sm"
            />
          )}

          <ExperimentCard
            title="当前教学步骤"
            action={
              <span className="text-xs font-semibold text-indigo-600">
                {currentStep + 1}/{spec.steps.length}
              </span>
            }
          >
            <div className="rounded-xl bg-indigo-50 p-3">
              <div className="text-sm font-semibold text-slate-800">
                {spec.steps[currentStep].title}
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                {spec.steps[currentStep].description}
              </p>
            </div>
          </ExperimentCard>

          <ExperimentCard title="知识点">
            <ul className="space-y-2 text-sm leading-6 text-slate-600">
              {spec.knowledgePoints.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="font-bold text-indigo-500">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </ExperimentCard>

          <ExperimentCard title="实验信息">
            <p className="text-xs leading-5 text-slate-500">
              该实验由 Agent 即时生成，在隔离画布中运行且不会写入项目文件。
              {response.generation.reviewed
                ? ' 数学内容已经备用模型复核。'
                : ' 使用时请结合课堂内容复核数学结论。'}
            </p>
          </ExperimentCard>
        </>
      }
      player={{
        steps: spec.steps.map((step, index) => ({
          id: `generated-step-${index + 1}`,
          title: step.title,
          desc: step.description,
        })),
        step: currentStep + 1,
        playing: isPlaying,
        onPrev: () => setStep(currentStep - 1),
        onNext: () => setStep(currentStep + 1),
        onTogglePlay: () => {
          if (currentStep >= spec.steps.length - 1) setStep(0)
          setIsPlaying((value) => !value)
        },
        onReset: resetExperiment,
      }}
    />
  )
}
