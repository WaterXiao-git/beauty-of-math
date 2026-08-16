import type { ComponentType } from 'react'

import { Link, useParams } from 'react-router-dom'

import {
  chapters,
  COURSE_TITLE,
  findPoint,
  type KnowledgePoint,
} from '../course/courseData'
import ExperimentCard from '../experiment-v2/ExperimentCard'
import ExperimentShell from '../experiment-v2/ExperimentShell'
import { normalizeExperimentId } from '../experiment-v2/routing'
import { OWNED_EXPERIMENT_RENDERERS } from '../owned-experiments/renderers'

export function getOwnedRenderer(id: string): ComponentType | null {
  const normalizedId = normalizeExperimentId(id)

  return Object.hasOwn(OWNED_EXPERIMENT_RENDERERS, normalizedId)
    ? OWNED_EXPERIMENT_RENDERERS[
      normalizedId as keyof typeof OWNED_EXPERIMENT_RENDERERS
    ]
    : null
}

function findPointLocation(pointId: string): {
  chapterTitle: string
  sectionTitle: string
} | null {
  for (const chapter of chapters) {
    for (const section of chapter.sections) {
      if (section.points.some((point) => point.id === pointId)) {
        return {
          chapterTitle: chapter.title,
          sectionTitle: section.title,
        }
      }
    }
  }

  return null
}

function getPointBreadcrumb(point: KnowledgePoint): string[] {
  const location = findPointLocation(point.id)

  return location
    ? [COURSE_TITLE, location.chapterTitle, location.sectionTitle, point.title]
    : [COURSE_TITLE, point.title]
}

function DemoPlaceholder({ point }: { point: KnowledgePoint }) {
  const aiQuestion = encodeURIComponent(
    `请讲解“${point.title}”，重点说明：${point.goals.join('；')}`,
  )

  return (
    <ExperimentShell
      breadcrumb={getPointBreadcrumb(point)}
      title={point.title}
      subtitle={point.summary}
      canvasScrollable
      canvas={
        <div className="flex min-h-[520px] w-full items-center justify-center p-6">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-3xl shadow-sm">
              ∑
            </div>

            <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
              实验待建设
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600">
              该知识点内容可学习，交互实验将在后续版本建设。
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={`/ask?question=${aiQuestion}`}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-500"
              >
                ＋ AI 讲解
              </Link>

              <Link
                to={`/?point=${encodeURIComponent(point.id)}`}
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
          <ExperimentCard title="概念说明">
            <p className="text-sm leading-7 text-slate-600">
              {point.summary}
            </p>
          </ExperimentCard>

          <ExperimentCard title="学习目标">
            <ul className="space-y-3">
              {point.goals.map((goal, index) => (
                <li
                  key={`${point.id}-goal-${index}`}
                  className="flex items-start gap-2 text-sm leading-6 text-slate-600"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </ExperimentCard>

          <ExperimentCard title="实验状态">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                待建设
              </span>
            </div>
          </ExperimentCard>
        </>
      }
    />
  )
}

function RetiredContent({ routeId }: { routeId: string }) {
  return (
    <ExperimentShell
      breadcrumb={[COURSE_TITLE, '内容已下线']}
      title="内容已下线"
      subtitle={`该实验或知识点不在当前正式范围内：${routeId}`}
      canvas={
        <div className="flex min-h-[480px] w-full items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="mb-4 text-5xl">⌁</div>
            <h2 className="text-xl font-bold text-slate-900">内容已下线</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              此地址不再提供实验内容。
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                返回知识地图
              </Link>
              <Link
                to="/experiments"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                浏览全部实验
              </Link>
            </div>
          </div>
        </div>
      }
      sidebar={
        <ExperimentCard title="路由信息">
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
            {routeId}
          </code>
        </ExperimentCard>
      }
    />
  )
}

function decodeRouteId(rawId: string): string {
  try {
    return normalizeExperimentId(decodeURIComponent(rawId))
  } catch {
    return normalizeExperimentId(rawId)
  }
}

export default function DemoPage() {
  const { pointId = '' } = useParams<{ pointId: string }>()
  const routeId = decodeRouteId(pointId)
  const DirectRenderer = getOwnedRenderer(routeId)

  if (DirectRenderer) {
    return <DirectRenderer />
  }

  const point = findPoint(routeId)

  if (point) {
    const PointRenderer = point.rendererId
      ? getOwnedRenderer(point.rendererId)
      : null

    return PointRenderer ? <PointRenderer /> : <DemoPlaceholder point={point} />
  }

  return <RetiredContent routeId={routeId} />
}
