// ============================================================================
// Experiment V2 - Legacy Experiment Runtime
//
// 作用：
//
// 让约 300 个历史实验逐步迁移到统一 Experiment V2，
// 同时保证迁移过程中所有实验仍然可以通过：
//
// /demo/:experimentId
//
// 正常运行。
//
//
// ----------------------------------------------------------------------------
// 两种运行模式
// ----------------------------------------------------------------------------
//
// 1. Legacy Compatibility Mode
//
// 老实验没有：
//
// export const experimentV2 = true
//
// 则：
//
// LegacyExperimentRuntime
// └── ExperimentShell
//     └── 原 Legacy Experiment
//
//
// 2. Native V2 Mode
//
// 已迁移实验声明：
//
// export const experimentV2 = true
//
// 则：
//
// LegacyExperimentRuntime
// └── Experiment Component
//     └── 自己的 ExperimentShell
//
//
// 这样避免：
//
// ExperimentShell
// └── ExperimentShell
//
// 双层页面结构。
// ============================================================================

import {
  useEffect,
  useState,
} from 'react'

import type {
  ComponentType,
} from 'react'

import {
  experiments,
} from '../experiments/catalog'

import ExperimentShell from './ExperimentShell'

import {
  normalizeExperimentId,
} from './routing'

import {
  getLegacyExperimentLoader,
  type ExperimentModule,
  type ExperimentModuleLoader,
} from './legacyExperimentRegistry'

// ============================================================================
// Props
// ============================================================================

interface LegacyExperimentRuntimeProps {
  experimentId: string
}

// ============================================================================
// Catalog Metadata
// ============================================================================

function getExperimentMetadata(
  experimentId: string,
) {
  const normalizedId =
    normalizeExperimentId(
      experimentId,
    )

  return experiments.find(
    (
      experiment,
    ) =>
      normalizeExperimentId(
        experiment.path,
      ) ===
      normalizedId,
  )
}

// ============================================================================
// Loading
// ============================================================================

function ExperimentLoading({
  experimentId,
}: {
  experimentId: string
}) {
  return (
    <ExperimentShell
      breadcrumb={[
        '实验库',
        '正在加载',
      ]}
      title="正在加载实验"
      subtitle={
        `正在载入 ${experimentId}`
      }
      canvas={
        <div
          className="
            flex
            h-full
            min-h-[420px]
            w-full
            items-center
            justify-center
          "
        >
          <div
            className="
              text-center
            "
          >
            <div
              className="
                mx-auto
                h-9
                w-9
                animate-spin
                rounded-full
                border-2
                border-slate-700
                border-t-indigo-400
              "
            />

            <p
              className="
                mt-3
                text-sm
                text-slate-500
              "
            >
              正在加载实验…
            </p>
          </div>
        </div>
      }
    />
  )
}

// ============================================================================
// Not Found
// ============================================================================

function ExperimentNotFound({
  experimentId,
}: {
  experimentId: string
}) {
  return (
    <ExperimentShell
      breadcrumb={[
        '实验库',
        '实验未找到',
      ]}
      title="实验未找到"
      subtitle={
        `没有找到实验「${experimentId}」对应的可视化组件`
      }
      canvas={
        <div
          className="
            flex
            h-full
            min-h-[420px]
            items-center
            justify-center
            p-8
          "
        >
          <div
            className="
              max-w-md
              text-center
            "
          >
            <div
              className="
                text-5xl
              "
            >
              🔍
            </div>

            <h3
              className="
                mt-4
                text-lg
                font-bold
                text-slate-900
              "
            >
              未找到该实验
            </h3>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-500
              "
            >
              当前实验 ID
              没有匹配到
              client/src/experiments
              中的正式实验组件。
            </p>
          </div>
        </div>
      }
    />
  )
}

// ============================================================================
// Load Error
// ============================================================================

function ExperimentLoadError({
  experimentId,
  error,
}: {
  experimentId: string

  error: string
}) {
  return (
    <ExperimentShell
      breadcrumb={[
        '实验库',
        '加载失败',
      ]}
      title="实验加载失败"
      subtitle={
        experimentId
      }
      canvas={
        <div
          className="
            flex
            h-full
            min-h-[420px]
            items-center
            justify-center
            p-8
          "
        >
          <div
            className="
              max-w-md
              text-center
            "
          >
            <div
              className="
                text-5xl
              "
            >
              ⚠️
            </div>

            <h3
              className="
                mt-4
                text-lg
                font-bold
                text-slate-900
              "
            >
              无法加载实验
            </h3>

            <p
              className="
                mt-2
                break-words
                text-sm
                leading-6
                text-slate-500
              "
            >
              {error}
            </p>
          </div>
        </div>
      }
    />
  )
}

// ============================================================================
// Legacy Compatibility Shell
//
// 只有尚未完成 V2 化的实验才会进入这里。
// ============================================================================

function LegacyCompatibilityView({
  ExperimentComponent,
  experimentId,
}: {
  ExperimentComponent:
    ComponentType

  experimentId: string
}) {
  const metadata =
    getExperimentMetadata(
      experimentId,
    )

  const title =
    metadata?.title ??
    experimentId

  const description =
    metadata?.description ??
    '数学交互可视化实验'

  return (
    <ExperimentShell
      breadcrumb={[
        '实验库',
        title,
      ]}

      title={
        title
      }

      subtitle={
        description
      }

      /**
       * Legacy Experiment
       * 通常还保留自己的：
       *
       * - 卡片
       * - 参数区域
       * - 图表
       *
       * 因此暂时允许滚动。
       */
      canvasScrollable

      // ======================================================================
      // Legacy Experiment
      // ======================================================================

      canvas={
        <div
          className="
            legacy-experiment-surface
            min-h-full
            w-full
            bg-slate-50
            p-3

            md:p-4
          "
        >
          <ExperimentComponent />
        </div>
      }

    />
  )
}

// ============================================================================
// Runtime
// ============================================================================

function LoadedLegacyExperimentRuntime({
  normalizedId,
  moduleLoader,
}: {
  normalizedId: string
  moduleLoader: ExperimentModuleLoader
}) {
  // ==========================================================================
  // Module State
  // ==========================================================================

  const [
    experimentModule,
    setExperimentModule,
  ] =
    useState<ExperimentModule | null>(
      null,
    )

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    loadError,
    setLoadError,
  ] = useState('')

  // ==========================================================================
  // 动态加载实验
  //
  // import.meta.glob 默认产生：
  //
  // () => import(...)
  //
  // 所以依旧保留 Vite code splitting。
  // ==========================================================================

  useEffect(() => {
    let cancelled =
      false

    moduleLoader()
      .then(
        (
          loadedModule,
        ) => {
          if (
            cancelled
          ) {
            return
          }

          if (
            !loadedModule.default
          ) {
            throw new Error(
              `实验 ${normalizedId} 没有 default export`,
            )
          }

          setExperimentModule(
            loadedModule,
          )

          setLoading(false)
        },
      )
      .catch(
        (
          error:
            unknown,
        ) => {
          if (
            cancelled
          ) {
            return
          }

          setLoadError(
            error instanceof Error
              ? error.message
              : String(error),
          )

          setLoading(false)
        },
      )

    return () => {
      cancelled =
        true
    }
  }, [
    moduleLoader,
    normalizedId,
  ])

  // ==========================================================================
  // Loading
  // ==========================================================================

  if (loading) {
    return (
      <ExperimentLoading
        experimentId={
          normalizedId
        }
      />
    )
  }

  // ==========================================================================
  // Error
  // ==========================================================================

  if (
    loadError
  ) {
    return (
      <ExperimentLoadError
        experimentId={
          normalizedId
        }
        error={
          loadError
        }
      />
    )
  }

  if (
    !experimentModule
  ) {
    return (
      <ExperimentLoading
        experimentId={
          normalizedId
        }
      />
    )
  }

  const ExperimentComponent =
    experimentModule.default

  // ==========================================================================
  // Native Experiment V2
  //
  // 实验只需要：
  //
  // export const experimentV2 = true
  //
  // 即可告诉 Runtime：
  //
  // “我已经自己管理 ExperimentShell，
  //  不要再给我套一层。”
  // ==========================================================================

  if (
    experimentModule.experimentV2 ===
    true
  ) {
    return (
      <ExperimentComponent />
    )
  }

  // ==========================================================================
  // Legacy Compatibility Mode
  // ==========================================================================

  return (
    <LegacyCompatibilityView
      ExperimentComponent={
        ExperimentComponent
      }
      experimentId={
        normalizedId
      }
    />
  )
}

export default function LegacyExperimentRuntime({
  experimentId,
}: LegacyExperimentRuntimeProps) {
  const normalizedId =
    normalizeExperimentId(
      experimentId,
    )

  const moduleLoader =
    getLegacyExperimentLoader(
      normalizedId,
    )

  if (!moduleLoader) {
    return (
      <ExperimentNotFound
        experimentId={
          normalizedId
        }
      />
    )
  }

  return (
    <LoadedLegacyExperimentRuntime
      key={
        normalizedId
      }
      normalizedId={
        normalizedId
      }
      moduleLoader={
        moduleLoader
      }
    />
  )
}
