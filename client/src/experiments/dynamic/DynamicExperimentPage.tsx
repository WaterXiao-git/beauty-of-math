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
  const [parameterValues, setParameterValues] =
    useState<Record<string, number>>(() => ({
      ...Object.fromEntries(
        response?.spec.parameters.map(
          (parameter) => [
            parameter.id,
            parameter.defaultValue,
          ],
        ) ?? [],
      ),
      ...(response?.spec.steps[0]?.parameterValues ?? {}),
    }))

  const spec = response?.spec ?? null

  useEffect(() => {
    if (!isPlaying || !spec) {
      return
    }

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
      <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h1 className="text-xl font-bold text-slate-800">
          临时实验已失效
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          请返回首页重新描述并生成实验。
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white"
        >
          返回首页
        </button>
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

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {spec.title}
            </h1>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
              AI 临时实验 · 未保存
            </span>
          </div>
          <p className="mt-1 text-slate-500">
            {spec.description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPlaying((value) => !value)}
          className={`rounded-xl px-5 py-3 font-semibold text-white shadow-lg transition-colors ${
            isPlaying
              ? 'bg-rose-500 shadow-rose-200'
              : 'bg-emerald-500 shadow-emerald-200'
          }`}
        >
          {isPlaying ? '暂停动画' : '播放动画'}
        </button>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
              数学公式
            </h2>
            <MathFormula
              formula={spec.formulaLatex}
              className="mt-6 overflow-x-auto text-center text-2xl"
            />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-800">
                图形演示
              </h2>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                {RENDERER_LABELS[spec.renderer.type]}
              </span>
            </div>
            <DynamicVisualization
              renderer={spec.renderer}
              parameters={parameterValues}
            />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              演示步骤
            </h2>
            <div className="space-y-3">
              {spec.steps.map((item, index) => (
                <button
                  key={`${item.title}-${index}`}
                  type="button"
                  onClick={() => setStep(index)}
                  className={`flex w-full gap-3 rounded-xl border p-4 text-left transition-colors ${
                    currentStep === index
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-200 bg-slate-50 hover:bg-white'
                  }`}
                >
                  <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    currentStep === index
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-semibold text-slate-800">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-slate-600">
                      {item.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          {sliderParameters.length > 0 && (
            <ParameterPanel
              title="调整参数"
              params={sliderParameters}
              onChange={(key, value) => {
                setIsPlaying(false)
                setParameterValues((previous) => ({
                  ...previous,
                  [key]: value,
                }))
              }}
            />
          )}

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
              步骤控制
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStep(currentStep - 1)}
                disabled={currentStep === 0}
                className="rounded-lg bg-slate-100 px-3 py-2.5 font-medium text-slate-700 disabled:opacity-40"
              >
                上一步
              </button>
              <button
                type="button"
                onClick={() => setStep(currentStep + 1)}
                disabled={
                  currentStep === spec.steps.length - 1
                }
                className="rounded-lg bg-slate-100 px-3 py-2.5 font-medium text-slate-700 disabled:opacity-40"
              >
                下一步
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep(0)
                setParameterValues(
                  Object.fromEntries(
                    spec.parameters.map((parameter) => [
                      parameter.id,
                      parameter.defaultValue,
                    ]),
                  ),
                )
              }}
              className="mt-2 w-full rounded-lg bg-slate-100 px-3 py-2.5 font-medium text-slate-700"
            >
              重置
            </button>
          </section>

          <section className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
              知识点
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
              {spec.knowledgePoints.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="text-indigo-500">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-xs leading-relaxed text-purple-800">
            该实验由 Agent 即时生成，并在独立浏览器画布中运行，未写入项目文件。
            {response.generation.reviewed
              ? ' 数学内容已由备用模型复核。'
              : ' 使用前请结合课堂内容复核数学结论。'}
          </section>
        </aside>
      </div>
    </div>
  )
}
