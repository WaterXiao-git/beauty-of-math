// 罗尔定理交互演示页：深色画板（左）+ 控制面板（右）+ 底部播放控制条
import { useEffect, useState } from 'react'
import DemoHeader from './DemoHeader'
import { useNavigate } from 'react-router-dom'
import RolleCanvas from './RolleCanvas'
import type { Conditions } from './RolleCanvas'
import RolleControl from './RolleControl'
import PlayerBar from './PlayerBar'
import StepStatusCard from './ui/StepStatusCard'
import { CASES, STEPS, judgmentText, stepDescription } from './rolleData'

const CONDITION_LABELS: Record<keyof Conditions, string> = {
  continuous: '闭区间连续',
  differentiable: '开区间可导',
  equalEndpoints: '端点函数值相等',
}

export default function RolleDemo() {
  const navigate = useNavigate()
  const [caseId, setCaseId] = useState('double-valley')
  const [conditions, setConditions] = useState<Conditions>({
    continuous: true,
    differentiable: true,
    equalEndpoints: true,
  })
  const [step, setStep] = useState(4)
  const [playing, setPlaying] = useState(false)
  const [xiLocked, setXiLocked] = useState(false)
  /** 可拖拽区间端点 [a, b]（切案例重置为案例默认 domain） */
  const [domain, setDomain] = useState<[number, number]>(() => [CASES[0].domain[0], CASES[0].domain[1]])

  const activeCase = CASES.find((c) => c.id === caseId) ?? CASES[0]

  // 播放：自动推进步进 1→4 循环
  useEffect(() => {
    if (!playing) return
    const timer = setInterval(() => {
      setStep((s) => (s >= 4 ? 1 : s + 1))
    }, 1800)
    return () => clearInterval(timer)
  }, [playing])

  // 切换案例：等高开关跟随该函数是否天然等高
  const handleSelectCase = (id: string) => {
    const next = CASES.find((c) => c.id === id)
    if (!next) return
    setCaseId(id)
    setConditions((prev) => ({ ...prev, equalEndpoints: next.naturallyEqual }))
    setDomain([next.domain[0], next.domain[1]])
    setPlaying(false)
    setStep(4)
  }

  const handleToggleCondition = (key: keyof Conditions) => {
    setConditions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const judgmentOk = conditions.continuous && conditions.differentiable && conditions.equalEndpoints
  const broken = (Object.keys(CONDITION_LABELS) as (keyof Conditions)[]).filter((k) => !conditions[k])
  const judgment = judgmentText(judgmentOk, broken.map((k) => CONDITION_LABELS[k]))

  return (
    <div className="flex flex-col h-full bg-[#f5f7fa]">
      <DemoHeader breadcrumb={['高等数学（上册）', '第三章 微分中值定理', '罗尔定理']} onBreadcrumbClick={() => navigate('/')} />

      <div className="flex-1 min-h-0 flex gap-4 p-4 md:p-5">
        {/* 左：深色交互画板 */}
        <RolleCanvas
          case={activeCase}
          conditions={conditions}
          step={step}
          xiLocked={xiLocked}
          onToggleXiLock={() => setXiLocked((v) => !v)}
          domain={domain}
          onMoveEndpoint={(index, wx) => {
            const xMin = activeCase.domain[0]
            const xMax = activeCase.domain[1]
            setDomain((prev) => {
              if (index === 0) return [Math.min(Math.max(wx, xMin + 0.05), prev[1] - 0.1), prev[1]]
              return [prev[0], Math.max(Math.min(wx, xMax - 0.05), prev[0] + 0.1)]
            })
          }}
        />

        {/* 右：参数控制与定理条件面板 */}
        <RolleControl
          caseId={caseId}
          onSelectCase={handleSelectCase}
          conditions={conditions}
          onToggleCondition={handleToggleCondition}
          judgmentOk={judgmentOk}
          judgmentText={judgment}
        />
      </div>

      {/* 底：播放控制栏 */}
      {/* 底部行：播放条 + 当前步骤卡（同一高度） */}
      <div className="flex h-20 shrink-0 gap-4 px-4 md:px-5">
        <PlayerBar
          steps={STEPS}
          step={step}
          playing={playing}
          onPrev={() => setStep((s) => Math.max(1, s - 1))}
          onNext={() => setStep((s) => Math.min(4, s + 1))}
          onTogglePlay={() => setPlaying((p) => !p)}
          onReset={() => {
            setPlaying(false)
            setStep(1)
          }}
          stepDesc={stepDescription(step)}
        />
        <StepStatusCard stepDesc={stepDescription(step)} />
      </div>
    </div>
  )
}