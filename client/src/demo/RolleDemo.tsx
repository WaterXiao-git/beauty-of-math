// ============================================================================
// 罗尔定理 Demo V2
//
// 页面职责：
//
// - 管理当前函数案例
// - 管理罗尔定理三个条件
// - 管理教学步骤
// - 管理自动播放
// - 管理 ξ 锁定状态
// - 将 Renderer / Controls 接入 ExperimentShell
//
// 页面结构：
//
// ExperimentShell
// ├── DemoHeader
// ├── Title / Subtitle / Legend
// ├── RolleCanvas
// ├── RolleControl
// └── PlayerBar
//
// RolleDemo 本身不再维护任何页面级布局。
// ============================================================================

import {
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import ExperimentShell from '../experiment-v2/ExperimentShell'

import RolleCanvas from './RolleCanvas'

import type {
  Conditions,
} from './RolleCanvas'

import RolleControl from './RolleControl'

import {
  CASES,
  LEGEND,
  STEPS,
  judgmentText,
} from './rolleData'

// ============================================================================
// 条件名称
// ============================================================================

const CONDITION_LABELS:
  Record<
    keyof Conditions,
    string
  > = {
    continuous:
      '闭区间连续',

    differentiable:
      '开区间可导',

    equalEndpoints:
      '端点函数值相等',
  }

// ============================================================================
// Demo
// ============================================================================

export default function RolleDemo() {
  const navigate =
    useNavigate()

  // ==========================================================================
  // 当前函数案例
  // ==========================================================================

  const [
    caseId,
    setCaseId,
  ] = useState(
    'x2-1',
  )

  const [
    canvasRevision,
    setCanvasRevision,
  ] = useState(0)

  // ==========================================================================
  // 罗尔定理条件
  // ==========================================================================

  const [
    conditions,
    setConditions,
  ] =
    useState<Conditions>({
      continuous: true,

      differentiable: true,

      equalEndpoints: true,
    })

  // ==========================================================================
  // 当前教学步骤
  //
  // 默认进入页面直接展示完整结论。
  // ==========================================================================

  const [
    step,
    setStep,
  ] = useState(
    STEPS.length,
  )

  // ==========================================================================
  // 播放状态
  // ==========================================================================

  const [
    playing,
    setPlaying,
  ] = useState(false)

  // ==========================================================================
  // ξ 锁定状态
  // ==========================================================================

  const [
    xiLocked,
    setXiLocked,
  ] = useState(false)

  // ==========================================================================
  // 当前案例
  // ==========================================================================

  const activeCase =
    CASES.find(
      (item) =>
        item.id ===
        caseId,
    ) ?? CASES[0]

  // ==========================================================================
  // 自动播放
  //
  // 根据 STEPS.length 动态循环，
  // 不依赖固定 4 步。
  // ==========================================================================

  useEffect(() => {
    if (!playing) {
      return
    }

    const timer =
      window.setInterval(
        () => {
          setStep(
            (
              currentStep,
            ) => {
              if (
                currentStep >=
                STEPS.length
              ) {
                return 1
              }

              return (
                currentStep +
                1
              )
            },
          )
        },
        1800,
      )

    return () => {
      window.clearInterval(
        timer,
      )
    }
  }, [playing])

  // ==========================================================================
  // 切换案例
  // ==========================================================================

  const handleSelectCase = (
    id: string,
  ) => {
    const nextCase =
      CASES.find(
        (item) =>
          item.id === id,
      )

    if (!nextCase) {
      return
    }

    setCaseId(id)

    /**
     * 不同案例天然具有不同端点关系。
     *
     * 例如：
     *
     * x³ - 1
     *
     * 默认就是：
     *
     * f(a) !== f(b)
     */
    setConditions(
      (
        previous,
      ) => ({
        ...previous,

        equalEndpoints:
          nextCase.naturallyEqual,
      }),
    )

    /**
     * 切换案例后：
     *
     * - 停止自动播放
     * - 展示完整步骤
     * - 解锁 ξ
     */
    setPlaying(false)

    setStep(
      STEPS.length,
    )

    setXiLocked(false)
  }

  // ==========================================================================
  // 切换定理条件
  // ==========================================================================

  const handleToggleCondition = (
    key: keyof Conditions,
  ) => {
    setConditions(
      (
        previous,
      ) => ({
        ...previous,

        [key]:
          !previous[key],
      }),
    )

    /**
     * 用户主动修改条件后，
     * 停止自动演示，
     * 方便观察图像变化。
     */
    setPlaying(false)
  }

  // ==========================================================================
  // 条件判断
  // ==========================================================================

  const judgmentOk =
    conditions.continuous &&
    conditions.differentiable &&
    conditions.equalEndpoints

  // ==========================================================================
  // 找出当前失效条件
  // ==========================================================================

  const brokenConditions =
    (
      Object.keys(
        CONDITION_LABELS,
      ) as Array<
        keyof Conditions
      >
    ).filter(
      (key) =>
        !conditions[key],
    )

  // ==========================================================================
  // 教学判断文本
  // ==========================================================================

  const judgment =
    judgmentText(
      judgmentOk,

      brokenConditions.map(
        (key) =>
          CONDITION_LABELS[
            key
          ],
      ),
    )

  // ==========================================================================
  // 上一步
  // ==========================================================================

  const handlePrev = () => {
    setPlaying(false)

    setStep(
      (
        currentStep,
      ) =>
        Math.max(
          1,

          currentStep -
            1,
        ),
    )
  }

  // ==========================================================================
  // 下一步
  // ==========================================================================

  const handleNext = () => {
    setPlaying(false)

    setStep(
      (
        currentStep,
      ) =>
        Math.min(
          STEPS.length,

          currentStep +
            1,
        ),
    )
  }

  // ==========================================================================
  // 播放 / 暂停
  // ==========================================================================

  const handleTogglePlay =
    () => {
      /**
       * 如果当前已经在最后一步，
       * 用户点击播放时从第一步重新开始，
       * 比直接等待 1.8 秒再跳回第一步更自然。
       */
      if (
        !playing &&
        step >=
          STEPS.length
      ) {
        setStep(1)
      }

      setPlaying(
        (
          current,
        ) =>
          !current,
      )
    }

  // ==========================================================================
  // 重置
  // ==========================================================================

  const handleReset = () => {
    setPlaying(false)

    setStep(1)

    setCaseId('x2-1')

    setConditions({
      continuous: true,
      differentiable: true,
      equalEndpoints: true,
    })

    setXiLocked(false)

    setCanvasRevision(
      (
        current,
      ) =>
        current + 1,
    )
  }

  // ==========================================================================
  // 页面
  // ==========================================================================

  return (
    <ExperimentShell
      // ======================================================================
      // 面包屑
      // ======================================================================

      breadcrumb={[
        '高等数学（上册）',
        '微分中值定理',
        '罗尔定理',
      ]}

      onBreadcrumbClick={(
        index,
      ) => {
        /**
         * 当前课程首页还没有独立章节 URL，
         * 因此前两级面包屑暂时都返回课程主页。
         */
        if (
          index === 0 ||
          index === 1
        ) {
          navigate('/')
        }
      }}

      // ======================================================================
      // 标题
      // ======================================================================

      title="罗尔定理"

      subtitle={
        activeCase.desc
      }

      // ======================================================================
      // 图例
      //
      // RolleCanvas 已经不再自己渲染图例。
      // ======================================================================

      legend={LEGEND.map(
        (item) => ({
          label:
            item.label,

          color:
            item.color,
        }),
      )}

      // ======================================================================
      // 左侧纯 Renderer
      //
      // 不再需要任何：
      //
      // [&>section]
      // [&>div]
      //
      // 兼容 CSS。
      // ======================================================================

      canvas={
        <RolleCanvas
          key={`${caseId}-${canvasRevision}`}
          case={
            activeCase
          }

          conditions={
            conditions
          }

          step={
            step
          }

          xiLocked={
            xiLocked
          }

          onToggleXiLock={() =>
            setXiLocked(
              (
                locked,
              ) =>
                !locked,
            )
          }
        />
      }

      // ======================================================================
      // 右侧控制区域
      //
      // RolleControl 已经返回普通 div +
      // ExperimentCard，
      //
      // 所以直接作为 sidebar slot 即可。
      // ======================================================================

      sidebar={
        <RolleControl
          caseId={
            caseId
          }

          onSelectCase={
            handleSelectCase
          }

          conditions={
            conditions
          }

          onToggleCondition={
            handleToggleCondition
          }

          judgmentOk={
            judgmentOk
          }

          judgmentText={
            judgment
          }
        />
      }

      // ======================================================================
      // 底部统一教学播放器
      // ======================================================================

      player={{
        steps:
          STEPS,

        step,

        playing,

        onPrev:
          handlePrev,

        onNext:
          handleNext,

        onTogglePlay:
          handleTogglePlay,

        onReset:
          handleReset,
      }}
    />
  )
}
