import type {
  ComponentType,
  ReactNode,
} from 'react'

import {
  createElement,
} from 'react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import {
  chapters,
  COURSE_TITLE,
  findPoint,
  type KnowledgePoint,
} from '../course/courseData'

import ExperimentCard from '../experiment-v2/ExperimentCard'

import ExperimentShell from '../experiment-v2/ExperimentShell'

import LegacyExperimentRuntime from '../experiment-v2/LegacyExperimentRuntime'

import {
  hasLegacyExperiment,
} from '../experiment-v2/legacyExperimentRegistry'

import {
  resolveKnowledgeExperiment,
  type KnowledgeExperimentResolution,
} from '../experiment-v2/knowledgeExperimentMap'

import {
  normalizeExperimentId,
} from '../experiment-v2/routing'

import DerivativeDemo from './DerivativeDemo'
import EpsilonDeltaDemo from './EpsilonDeltaDemo'
import RolleDemo from './RolleDemo'

import {
  DifferentialDemo,
  GraphingDemo,
  InfinitesimalDemo,
  LimitLawsDemo,
  TwoImportantLimitsDemo,
} from './knowledge/CoreCalculusSupplementDemos'

// ============================================================================
// Native Demo Registry
//
// 专门为课程知识点制作的 Renderer。
// 这些 Demo 优先于 experiments/* 中的通用实验。
// ============================================================================

const nativeDemoRegistry:
  Record<
    string,
    ComponentType
  > = {
  // ==========================================================================
  // Existing
  // ==========================================================================

  'epsilon-delta':
    EpsilonDeltaDemo,

  derivative:
    DerivativeDemo,

  rolle:
    RolleDemo,

  // ==========================================================================
  // Core Calculus Supplement
  // ==========================================================================

  'limit-laws':
    LimitLawsDemo,

  'two-important-limits':
    TwoImportantLimitsDemo,

  infinitesimal:
    InfinitesimalDemo,

  differential:
    DifferentialDemo,

  graphing:
    GraphingDemo,
}

// ============================================================================
// Native Demo resolver
// ============================================================================

function getNativeDemo(
  id: string,
):
  ComponentType | null {
  const normalizedId =
    normalizeExperimentId(
      id,
    )

  return (
    nativeDemoRegistry[
      normalizedId
    ] ??
    null
  )
}

// ============================================================================
// Knowledge Point location
// ============================================================================

function findPointLocation(
  pointId: string,
): {
  chapterTitle: string
  sectionTitle: string
} | null {
  for (
    const chapter
    of chapters
  ) {
    for (
      const section
      of chapter.sections
    ) {
      const found =
        section.points.some(
          (
            point,
          ) =>
            point.id ===
            pointId,
        )

      if (
        found
      ) {
        return {
          chapterTitle:
            chapter.title,

          sectionTitle:
            section.title,
        }
      }
    }
  }

  return null
}

// ============================================================================
// Breadcrumb
// ============================================================================

function getPointBreadcrumb(
  point:
    KnowledgePoint,
): string[] {
  const location =
    findPointLocation(
      point.id,
    )

  if (
    !location
  ) {
    return [
      COURSE_TITLE,
      point.title,
    ]
  }

  return [
    COURSE_TITLE,

    location.chapterTitle,

    location.sectionTitle,

    point.title,
  ]
}

// ============================================================================
// Resolution label
// ============================================================================

function getResolutionLabel(
  resolution:
    KnowledgeExperimentResolution | null,
): string {
  if (
    !resolution
  ) {
    return '未找到可复用实验'
  }

  switch (
    resolution.source
  ) {
    case 'demo-id':
      return '专用 Demo'

    case 'explicit-map':
      return '知识点映射'

    case 'experiment-path':
      return '课程实验入口'

    case 'same-id':
      return '同名实验'

    default:
      return '未知来源'
  }
}

// ============================================================================
// Missing Renderer Placeholder
//
// 只有：
//
// Native Demo
// 显式映射
// experimentPath
// 同名 Experiment
//
// 全部找不到时才会进入这里。
// ============================================================================

function DemoPlaceholder({
  point,
  resolution = null,
}: {
  point:
    KnowledgePoint

  resolution?:
    KnowledgeExperimentResolution | null
}) {
  const breadcrumb =
    getPointBreadcrumb(
      point,
    )

  const resolutionLabel =
    getResolutionLabel(
      resolution,
    )

  const aiQuestion =
    encodeURIComponent(
      `请讲解“${point.title}”，重点说明：${point.goals.join(
        '；',
      )}`,
    )

  return (
    <ExperimentShell
      breadcrumb={
        breadcrumb
      }
      title={
        point.title
      }
      subtitle={
        point.summary
      }
      canvasScrollable
      canvas={
        <div className="flex min-h-[520px] w-full items-center justify-center p-6">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-3xl shadow-sm">
              ∑
            </div>

            <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
              {point.title}
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600">
              当前知识点已经完成 Experiment V2
              页面接入，但目前没有找到与该知识点数学内容匹配的专用可视化
              Renderer。
            </p>

            <p className="mt-2 max-w-lg text-sm leading-7 text-slate-400">
              页面结构已经完成，后续只需要实现或关联
              SVG、Canvas、Plotly 或 WebGL
              数学可视化内容，不需要重新设计整个实验页面。
            </p>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
              Renderer 解析状态：
              {' '}
              <span className="font-medium text-slate-700">
                {resolutionLabel}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={`/ask?question=${aiQuestion}`}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-500"
              >
                ＋ AI 讲解
              </Link>

              <Link
                to={`/?point=${encodeURIComponent(
                  point.id,
                )}`}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                返回知识点
              </Link>
            </div>
          </div>
        </div>
      }
      sidebar={
        <>
          <ExperimentCard
            title="概念说明"
          >
            <p className="text-sm leading-7 text-slate-600">
              {point.summary}
            </p>
          </ExperimentCard>

          <ExperimentCard
            title="学习目标"
          >
            <ul className="space-y-3">
              {point.goals.map(
                (
                  goal,
                  index,
                ) => (
                  <li
                    key={
                      `${point.id}-goal-${index}`
                    }
                    className="flex items-start gap-2 text-sm leading-6 text-slate-600"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />

                    <span>
                      {goal}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </ExperimentCard>

          <ExperimentCard
            title="推荐可视化模板"
          >
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="text-sm font-semibold text-indigo-700">
                {point.template}
              </div>

              <p className="mt-2 text-xs leading-6 text-indigo-500">
                Renderer
                应围绕该数学概念设计，而不是为了消除占位页而强行复用内容不匹配的实验。
              </p>
            </div>
          </ExperimentCard>

          <ExperimentCard
            title="实验状态"
          >
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-700">
                  Renderer
                </span>

                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  待实现
                </span>
              </div>

              <p className="mt-3 text-xs leading-6 text-slate-600">
                Experiment V2 页面骨架已经完成，目前只缺与
                “{point.title}”
                对应的数学可视化 Renderer。
              </p>
            </div>
          </ExperimentCard>
        </>
      }
    />
  )
}

// ============================================================================
// Unknown route
// ============================================================================

function DemoNotFound({
  routeId,
}: {
  routeId: string
}) {
  return (
    <ExperimentShell
      breadcrumb={[
        COURSE_TITLE,
        '实验',
      ]}
      title="未找到实验"
      subtitle={`无法解析实验或知识点：${routeId}`}
      canvas={
        <div className="flex min-h-[480px] w-full items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="mb-4 text-5xl">
              🔍
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              未找到对应实验
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              当前 URL
              中的知识点或实验 ID
              无法在课程数据和实验库中找到。
            </p>

            <Link
              to="/experiments"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              返回实验库
            </Link>
          </div>
        </div>
      }
      sidebar={
        <ExperimentCard
          title="路由信息"
        >
          <div className="space-y-2 text-sm text-slate-600">
            <div>
              Route ID：
              {' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                {routeId}
              </code>
            </div>

            <p className="text-xs leading-6 text-slate-500">
              请检查课程知识点 ID、
              experimentPath、
              demoId
              或实验目录名称是否正确。
            </p>
          </div>
        </ExperimentCard>
      }
    />
  )
}

// ============================================================================
// Decode route
// ============================================================================

function decodeRouteId(
  rawId: string,
): string {
  try {
    return normalizeExperimentId(
      decodeURIComponent(
        rawId,
      ),
    )
  } catch {
    return normalizeExperimentId(
      rawId,
    )
  }
}

// ============================================================================
// Render resolved experiment
// ============================================================================

function renderResolvedExperiment(
  experimentId: string,
): ReactNode | null {
  const normalizedId =
    normalizeExperimentId(
      experimentId,
    )

  // ==========================================================================
  // Native Demo
  // ==========================================================================

  const NativeDemo =
    getNativeDemo(
      normalizedId,
    )

  if (
    NativeDemo
  ) {
    return createElement(
      NativeDemo,
    )
  }

  // ==========================================================================
  // experiments/*
  // ==========================================================================

  if (
    hasLegacyExperiment(
      normalizedId,
    )
  ) {
    return (
      <LegacyExperimentRuntime
        experimentId={
          normalizedId
        }
      />
    )
  }

  return null
}

// ============================================================================
// Demo Page
//
// Resolution:
//
// /demo/:pointId
//
// 1. Native Demo
//
// 2. KnowledgePoint
//      ↓
//    knowledgeExperimentMap
//
// 3. Direct Experiment
//
// 4. Missing Renderer
//
// 5. Not Found
// ============================================================================

export default function DemoPage() {
  const {
    pointId = '',
  } =
    useParams<{
      pointId:
        string
    }>()

  const routeId =
    decodeRouteId(
      pointId,
    )

  // ==========================================================================
  // 1. Direct Native Demo
  //
  // 这里现在包括：
  //
  // epsilon-delta
  // derivative
  // rolle
  // limit-laws
  // two-important-limits
  // infinitesimal
  // differential
  // graphing
  //
  // 因此：
  //
  // /demo/two-important-limits
  //
  // 会在这里直接进入真正 Renderer，
  // 不再显示 Placeholder。
  // ==========================================================================

  const directNative =
    getNativeDemo(
      routeId,
    )

  if (
    directNative
  ) {
    return createElement(
      directNative,
    )
  }

  // ==========================================================================
  // 2. KnowledgePoint
  // ==========================================================================

  const point =
    findPoint(
      routeId,
    )

  if (
    point
  ) {
    const resolution =
      resolveKnowledgeExperiment(
        point,
      )

    if (
      resolution
    ) {
      const rendered =
        renderResolvedExperiment(
          resolution.experimentId,
        )

      if (
        rendered
      ) {
        return rendered
      }

      return (
        <DemoPlaceholder
          point={
            point
          }
          resolution={
            resolution
          }
        />
      )
    }

    return (
      <DemoPlaceholder
        point={
          point
        }
      />
    )
  }

  // ==========================================================================
  // 3. Direct Experiment
  //
  // /demo/fourier
  // /demo/calculus
  // /demo/taylor
  // ...
  // ==========================================================================

  const directExperiment =
    renderResolvedExperiment(
      routeId,
    )

  if (
    directExperiment
  ) {
    return directExperiment
  }

  // ==========================================================================
  // 4. Unknown
  // ==========================================================================

  return (
    <DemoNotFound
      routeId={
        routeId
      }
    />
  )
}
