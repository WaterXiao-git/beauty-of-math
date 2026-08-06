import ExperimentLibrary from './ExperimentLibrary'
import type { CourseChapter } from './courseData'

interface CourseOverviewProps {
  chapters: CourseChapter[]
  syncedPointCount: number
  contentSource: 'loading' | 'api' | 'fallback'
  onSelectPoint: (pointId: string) => void
  onOpenNavigation: () => void
}

export default function CourseOverview({
  chapters,
  syncedPointCount,
  contentSource,
  onSelectPoint,
  onOpenNavigation,
}: CourseOverviewProps) {
  const allPoints = chapters.flatMap((chapter) =>
    chapter.sections.flatMap((section) => section.points),
  )
  const learningPoint = allPoints.find((point) => point.status === 'learning') ?? allPoints[0]

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 p-4 md:p-6 lg:p-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 px-6 py-8 text-white shadow-xl md:px-10 md:py-10">
          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-indigo-100">
              高等数学（上册） · 交互式课程
              <span className={`h-1.5 w-1.5 rounded-full ${contentSource === 'api' ? 'bg-emerald-400' : 'bg-amber-300'}`} />
              {contentSource === 'loading' ? '正在同步' : contentSource === 'api' ? '内容服务已连接' : '本地内容模式'}
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">从知识结构出发，理解微积分</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-100/80 md:text-base">
              按章节浏览知识点、查看关联关系，并进入可调参数、可分步讲解的数学实验。目录与正式发布版本保持同步。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {learningPoint && (
                <button
                  type="button"
                  onClick={() => onSelectPoint(learningPoint.id)}
                  className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
                >
                  继续学习：{learningPoint.title} →
                </button>
              )}
              <button
                type="button"
                onClick={onOpenNavigation}
                className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
              >
                打开章节目录
              </button>
            </div>
          </div>

          <div className="relative mt-8 grid max-w-2xl grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur">
              <div className="text-2xl font-black">{chapters.length}</div>
              <div className="mt-1 text-xs text-indigo-200">课程章节</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur">
              <div className="text-2xl font-black">{allPoints.length}</div>
              <div className="mt-1 text-xs text-indigo-200">课程知识点</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur">
              <div className="text-2xl font-black">{syncedPointCount}</div>
              <div className="mt-1 text-xs text-indigo-200">正式发布版本</div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">课程章节</h2>
              <p className="mt-1 text-sm text-slate-500">选择章节后进入该章第一个知识点，也可以从左侧抽屉精确定位。</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {chapters.map((chapter, index) => {
              const points = chapter.sections.flatMap((section) => section.points)
              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => points[0] && onSelectPoint(points[0].id)}
                  className="group rounded-2xl border border-slate-200 p-5 text-left transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 font-black text-indigo-600">
                      {index + 1}
                    </span>
                    <span className="text-xs font-medium text-slate-400">{points.length} 个知识点</span>
                  </div>
                  <h3 className="mt-4 font-bold text-slate-800 transition group-hover:text-indigo-600">{chapter.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {points.slice(0, 3).map((point) => point.title).join(' · ')}
                  </p>
                </button>
              )
            })}
          </div>
        </section>

        <ExperimentLibrary />
      </div>
    </main>
  )
}
