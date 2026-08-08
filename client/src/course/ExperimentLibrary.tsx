import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
  useSearchParams,
} from 'react-router-dom'

import {
  experiments,
} from '../experiments/catalog'

import {
  getExperimentDemoPath,
} from '../experiment-v2/routing'

import {
  fetchExperimentCatalog,
  type ExperimentTaxonomyChapter,
  type ExperimentTaxonomyCourse,
  type ExperimentTaxonomyKnowledgePoint,
  type PublishedExperiment,
} from '../services/contentCatalog'

const DIFFICULTY_LABELS:
  Record<string, string> = {
    beginner: '入门级',
    elementary: '基础级',
    intermediate: '中级',
    advanced: '高级',
    expert: '专业级',
  }

const DIFFICULTY_STYLES:
  Record<string, string> = {
    beginner:
      'bg-emerald-50 text-emerald-700',

    elementary:
      'bg-blue-50 text-blue-700',

    intermediate:
      'bg-amber-50 text-amber-700',

    advanced:
      'bg-violet-50 text-violet-700',

    expert:
      'bg-rose-50 text-rose-700',
  }

/**
 * 后端实验目录不可用时，
 * 使用本地 experiments catalog。
 */
function getLocalFallback(
  q: string,
  difficulty: string,
  limit: number,
): PublishedExperiment[] {
  const keyword =
    q
      .trim()
      .toLocaleLowerCase('zh-CN')

  return experiments
    .filter(
      (item) =>
        !difficulty ||
        item.difficulty ===
          difficulty,
    )
    .filter((item) => {
      if (!keyword) {
        return true
      }

      return [
        item.title,
        item.description,
        item.path,
        ...item.topics,
      ]
        .join(' ')
        .toLocaleLowerCase(
          'zh-CN',
        )
        .includes(keyword)
    })
    .slice(0, limit)
    .map(
      (
        item,
        index,
      ) => ({
        id:
          item.path.slice(1) ||
          String(index + 1),

        path:
          item.path,

        title:
          item.title,

        description:
          item.description,

        topics:
          item.topics,

        difficulty:
          item.difficulty,

        hasAnimation:
          item.hasAnimation,

        hasSteps:
          item.hasSteps,
      }),
    )
}

/**
 * 全部正式数学实验浏览页。
 *
 * 重要：
 *
 * 这里不再直接打开旧实验路径：
 *
 * /fourier
 * /calculus
 * /probability
 *
 * 而是全部转换成：
 *
 * /demo/fourier
 * /demo/calculus
 * /demo/probability
 *
 * 从而保证 300 个实验都经过
 * Experiment V2 统一运行时。
 */
export default function ExperimentLibrary() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [
    query,
    setQuery,
  ] = useState(() => searchParams.get('q') ?? '')

  const [
    difficulty,
    setDifficulty,
  ] = useState(() => searchParams.get('difficulty') ?? '')

  const [courseId, setCourseId] = useState(() => searchParams.get('courseId') ?? '')
  const [chapterId, setChapterId] = useState(() => searchParams.get('chapterId') ?? '')
  const [knowledgePointId, setKnowledgePointId] = useState(() => searchParams.get('knowledgePointId') ?? '')
  const [courses, setCourses] = useState<ExperimentTaxonomyCourse[]>([])
  const [chapters, setChapters] = useState<ExperimentTaxonomyChapter[]>([])
  const [knowledgePoints, setKnowledgePoints] = useState<ExperimentTaxonomyKnowledgePoint[]>([])

  const [
    visibleLimit,
    setVisibleLimit,
  ] = useState(12)

  const [
    items,
    setItems,
  ] =
    useState<
      PublishedExperiment[]
    >([])

  const [
    total,
    setTotal,
  ] = useState(
    experiments.length,
  )

  const [
    source,
    setSource,
  ] =
    useState<
      | 'loading'
      | 'api'
      | 'fallback'
    >('loading')

  const updateUrlFilters = (
    values: Record<string, string>,
    clear: string[] = [],
  ) => {
    const next = new URLSearchParams(searchParams)
    for (const key of clear) next.delete(key)
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setSearchParams(next)
  }

  /**
   * 从后端读取统一实验目录。
   *
   * 后端不可用时，
   * 自动回退本地 catalog。
   */
  useEffect(() => {
    const controller =
      new AbortController()

    const timer =
      window.setTimeout(
        () => {
          setSource(
            'loading',
          )

          fetchExperimentCatalog(
            {
              q: query,
              difficulty,
              courseId,
              chapterId,
              knowledgePointId,

              limit:
                Math.min(
                  visibleLimit,
                  experiments.length,
                ),
            },

            controller.signal,
          )
            .then(
              (
                result,
              ) => {
                setItems(
                  result.items,
                )

                setTotal(
                  result.total,
                )

                setCourses(result.facets.taxonomy.courses)
                setChapters(result.facets.taxonomy.chapters)
                setKnowledgePoints(result.facets.taxonomy.knowledgePoints)

                setSource(
                  'api',
                )
              },
            )
            .catch(
              (
                error:
                  unknown,
              ) => {
                if (
                  error instanceof
                    DOMException &&
                  error.name ===
                    'AbortError'
                ) {
                  return
                }

                const fallback =
                  getLocalFallback(
                    query,
                    difficulty,
                    visibleLimit,
                  )

                setItems(
                  fallback,
                )

                setTotal(
                  getLocalFallback(
                    query,
                    difficulty,
                    experiments.length,
                  ).length,
                )

                setSource(
                  'fallback',
                )
              },
            )
        },
        180,
      )

    return () => {
      window.clearTimeout(
        timer,
      )

      controller.abort()
    }
  }, [
    difficulty,
    courseId,
    chapterId,
    knowledgePointId,
    query,
    visibleLimit,
  ])

  /**
   * 难度筛选。
   */
  const difficultyOptions =
    useMemo(
      () => [
        '',
        'beginner',
        'elementary',
        'intermediate',
        'advanced',
        'expert',
      ],
      [],
    )

  const updateDifficulty = (
    value: string,
  ) => {
    setDifficulty(value)
    updateUrlFilters({ difficulty: value })

    setVisibleLimit(12)
  }

  const selectCourse = (value: string) => {
    setCourseId(value)
    setChapterId('')
    setKnowledgePointId('')
    updateUrlFilters({ courseId: value }, ['chapterId', 'knowledgePointId'])
    setVisibleLimit(12)
  }

  const visibleChapters = chapters.filter(
    (chapter) => !courseId || chapter.courseId === courseId,
  )
  const visibleKnowledgePoints = knowledgePoints.filter(
    (point) =>
      (!courseId || point.courseId === courseId) &&
      (!chapterId || point.chapterId === chapterId),
  )

  return (
    <section
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm

        md:p-6
      "
    >
      {/* =====================================
          标题 + 搜索
         ===================================== */}
      <div
        className="
          flex
          flex-col
          gap-4

          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >
        {/* 标题 */}
        <div>
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <h2
              className="
                text-xl
                font-bold
                text-slate-900
              "
            >
              全部可视化实验
            </h2>

            <span
              className="
                rounded-full
                bg-indigo-50
                px-2.5
                py-1
                text-xs
                font-semibold
                text-indigo-600
              "
            >
              {total} 个结果
            </span>
          </div>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            搜索并打开已有数学实验；
            所有实验统一进入
            Experiment V2
            可视化工作台。
          </p>
        </div>

        {/* 搜索 */}
        <label
          className="
            relative
            block
            w-full

            lg:w-80
          "
        >
          <span className="sr-only">
            搜索实验
          </span>

          <svg
            className="
              absolute
              left-3.5
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              text-slate-400
            "
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle
              cx="11"
              cy="11"
              r="7"
            />

            <path d="m20 20-3.5-3.5" />
          </svg>

          <input
            value={query}
            onChange={(
              event,
            ) => {
              setQuery(
                event.target
                  .value,
              )

              setVisibleLimit(
                12,
              )
            }}
            className="
              h-11
              w-full
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              pl-10
              pr-4
              text-sm
              outline-none
              transition

              focus:border-indigo-400
              focus:bg-white
              focus:ring-4
              focus:ring-indigo-100
            "
            placeholder="搜索分数、极限、曲线……"
          />
        </label>
      </div>

      {courses.length > 0 && (
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-800">课程分类</h3>
            <span className="text-xs text-slate-400">课程 → 章节 → 知识点 → 实验</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => selectCourse('')}
              className={`rounded-xl border p-3 text-left transition ${
                courseId === ''
                  ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-100'
                  : 'border-slate-200 hover:border-indigo-200'
              }`}
            >
              <div className="text-sm font-bold text-slate-800">全部实验</div>
              <div className="mt-1 text-xs text-slate-500">{experiments.length} 个有效实验</div>
            </button>
            {courses.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => selectCourse(course.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  courseId === course.id
                    ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-100'
                    : 'border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="text-sm font-bold text-slate-800">{course.name}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {course.chapterCount} 个章节 · {course.count} 个实验
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {source === 'api' && (
        <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 md:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600">
            章节
            <select
              value={chapterId}
              onChange={(event) => {
                setChapterId(event.target.value)
                setKnowledgePointId('')
                updateUrlFilters(
                  { chapterId: event.target.value },
                  ['knowledgePointId'],
                )
                setVisibleLimit(12)
              }}
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 outline-none focus:border-indigo-400"
            >
              <option value="">全部章节</option>
              {visibleChapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {courseId
                    ? chapter.name
                    : `${courses.find((course) => course.id === chapter.courseId)?.name ?? ''} · ${chapter.name}`}
                  （{chapter.count}）
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600">
            知识点
            <select
              value={knowledgePointId}
              onChange={(event) => {
                setKnowledgePointId(event.target.value)
                updateUrlFilters({ knowledgePointId: event.target.value })
                setVisibleLimit(12)
              }}
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 outline-none focus:border-indigo-400"
            >
              <option value="">全部知识点</option>
              {visibleKnowledgePoints.map((point) => (
                <option key={point.id} value={point.id}>
                  {chapterId
                    ? point.name
                    : `${chapters.find((chapter) => chapter.id === point.chapterId)?.name ?? ''} · ${point.name}`}
                  （{point.count}）
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* =====================================
          难度筛选
         ===================================== */}
      <div
        className="
          mt-4
          flex
          flex-wrap
          gap-2
        "
        aria-label="按难度筛选"
      >
        {difficultyOptions.map(
          (value) => (
            <button
              key={
                value ||
                'all'
              }
              type="button"
              onClick={() =>
                updateDifficulty(
                  value,
                )
              }
              aria-pressed={
                difficulty ===
                value
              }
              className={[
                'rounded-full',
                'px-3',
                'py-1.5',
                'text-xs',
                'font-semibold',
                'transition-all',

                difficulty ===
                value
                  ? [
                      'bg-indigo-600',
                      'text-white',
                      'shadow-sm',
                    ].join(
                      ' ',
                    )
                  : [
                      'bg-slate-100',
                      'text-slate-600',
                      'hover:bg-slate-200',
                    ].join(
                      ' ',
                    ),
              ].join(' ')}
            >
              {value
                ? DIFFICULTY_LABELS[
                    value
                  ]
                : '全部难度'}
            </button>
          ),
        )}

        {/* 数据来源状态 */}
        <span
          className="
            ml-auto
            self-center
            text-xs
            text-slate-400
          "
        >
          {source ===
          'loading'
            ? '正在同步…'
            : source ===
                'api'
              ? '后端目录已同步'
              : '当前使用本地目录'}
        </span>
      </div>

      {/* =====================================
          实验列表
         ===================================== */}
      {items.length > 0 ? (
        <div
          className="
            mt-5
            grid
            grid-cols-1
            gap-3

            md:grid-cols-2

            xl:grid-cols-3
          "
        >
          {items.map(
            (item) => {
              /**
               * 最关键的变化：
               *
               * 旧：
               * /fourier
               *
               * 新：
               * /demo/fourier
               */
              const demoPath =
                getExperimentDemoPath(
                  item.path,
                )

              return (
                <Link
                  key={item.id}
                  to={demoPath}
                  className="
                    group
                    flex
                    min-h-44
                    flex-col
                    rounded-xl
                    border
                    border-slate-200
                    p-4
                    transition-all
                    duration-200

                    hover:-translate-y-0.5
                    hover:border-indigo-300
                    hover:shadow-md
                  "
                >
                  {/* 标题 */}
                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-3
                    "
                  >
                    <h3
                      className="
                        font-bold
                        text-slate-800
                        transition

                        group-hover:text-indigo-600
                      "
                    >
                      {item.title}
                    </h3>

                    <span
                      className={[
                        'shrink-0',
                        'rounded-md',
                        'px-2',
                        'py-1',
                        'text-[11px]',
                        'font-semibold',

                        DIFFICULTY_STYLES[
                          item
                            .difficulty
                        ] ??
                          'bg-slate-100 text-slate-600',
                      ].join(
                        ' ',
                      )}
                    >
                      {DIFFICULTY_LABELS[
                        item.difficulty
                      ] ??
                        item.difficulty}
                    </span>
                  </div>

                  {/* 描述 */}
                  <p
                    className="
                      mt-2
                      line-clamp-3
                      flex-1
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    {
                      item.description
                    }
                  </p>

                  {/* 实验能力 */}
                  <div
                    className="
                      mt-3
                      flex
                      flex-wrap
                      items-center
                      gap-1.5
                    "
                  >
                    {item.hasAnimation && (
                      <span
                        className="
                          rounded-md
                          bg-blue-50
                          px-2
                          py-1
                          text-[10px]
                          font-medium
                          text-blue-600
                        "
                      >
                        动画
                      </span>
                    )}

                    {item.hasSteps && (
                      <span
                        className="
                          rounded-md
                          bg-emerald-50
                          px-2
                          py-1
                          text-[10px]
                          font-medium
                          text-emerald-600
                        "
                      >
                        分步教学
                      </span>
                    )}
                  </div>

                  {/* Topic + 打开 */}
                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      gap-2
                    "
                  >
                    {item.topics
                      .slice(
                        0,
                        2,
                      )
                      .map(
                        (
                          topic,
                        ) => (
                          <span
                            key={
                              topic
                            }
                            className="
                              max-w-24
                              truncate
                              rounded
                              bg-slate-100
                              px-2
                              py-1
                              text-[11px]
                              text-slate-500
                            "
                            title={
                              topic
                            }
                          >
                            {
                              topic
                            }
                          </span>
                        ),
                      )}

                    <span
                      className="
                        ml-auto
                        shrink-0
                        text-sm
                        font-semibold
                        text-indigo-600
                        transition

                        group-hover:translate-x-0.5
                      "
                    >
                      进入演示 →
                    </span>
                  </div>
                </Link>
              )
            },
          )}
        </div>
      ) : source ===
        'loading' ? (
        /* =====================================
            Loading Skeleton
           ===================================== */
        <div
          className="
            mt-5
            grid
            grid-cols-1
            gap-3

            md:grid-cols-3
          "
        >
          {[0, 1, 2].map(
            (item) => (
              <div
                key={item}
                className="
                  h-44
                  animate-pulse
                  rounded-xl
                  bg-slate-100
                "
              />
            ),
          )}
        </div>
      ) : (
        /* =====================================
            无结果
           ===================================== */
        <div
          className="
            mt-5
            rounded-xl
            border
            border-dashed
            border-slate-300
            py-12
            text-center
            text-sm
            text-slate-500
          "
        >
          没有找到匹配实验，
          请尝试更短的关键词或切换难度。
        </div>
      )}

      {/* =====================================
          加载更多
         ===================================== */}
      {items.length <
        total &&
        visibleLimit <
          experiments.length && (
          <div
            className="
              mt-5
              text-center
            "
          >
            <button
              type="button"
              onClick={() =>
                setVisibleLimit(
                  (
                    value,
                  ) =>
                    Math.min(
                      value +
                        24,
                      experiments.length,
                    ),
                )
              }
              className="
                rounded-lg
                border
                border-indigo-200
                px-5
                py-2.5
                text-sm
                font-semibold
                text-indigo-600
                transition-all

                hover:border-indigo-300
                hover:bg-indigo-50
              "
            >
              再显示 24 个
            </button>
          </div>
        )}
    </section>
  )
}
