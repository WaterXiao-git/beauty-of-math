// 统一实验页顶部导航：
// 课程抽屉 / 面包屑 / 截图 / 带上下文提问 / 帮助

import { useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import DrawerSidebar from '../course/DrawerSidebar'

import type { KnowledgePoint } from '../course/courseData'
import {
  collectCoursePoints,
  courses,
  DEFAULT_COURSE_ID,
  findCourse,
  findCourseOfPoint,
  findPointAcrossCourses,
} from '../course/courseCatalog'

import {
  getExperimentIdFromDemoPath,
  normalizeExperimentId,
} from '../experiment-v2/routing'

import {
  captureVisibleScreen,
  toggleDocumentFullscreen,
} from './screenCapture'

interface DemoHeaderProps {
  breadcrumb: string[]

  onBreadcrumbClick?: (
    index: number,
  ) => void

  onOpenAssistant?: () => void

  onEnterCaptureMode?: () => void

  fullscreen?: boolean

  onToggleFullscreen?: () => void
}

/**
 * 根据当前 /demo/:id 路由，
 * 尝试找到真正对应的课程知识点。
 *
 * 支持三种情况：
 *
 * 1. routeId 就是知识点 id
 *
 *    /demo/limit-laws
 *
 * 2. routeId 是知识点 demoId
 *
 *    /demo/epsilon-delta
 *
 *    对应：
 *    limit-of-function
 *
 * 3. routeId 是旧实验 path 转换后的 id
 *
 *    /demo/calculus
 *
 *    对应：
 *    experimentPath = /calculus
 */
function resolveKnowledgePoint(
  routeId: string | null,
): KnowledgePoint | undefined {
  if (!routeId) {
    return undefined
  }

  /*
   * 第一优先级：
   * URL 本身就是知识点 ID。
   */
  const directPoint = findPointAcrossCourses(routeId)

  if (directPoint) {
    return directPoint
  }

  /*
   * 第二优先级：
   * 查找：
   *
   * demoId === routeId
   *
   * 或：
   *
   * experimentPath === routeId
   */
  for (const course of courses) {
    for (const point of collectCoursePoints(course)) {
        if (
          point.demoId &&
          normalizeExperimentId(
            point.demoId,
          ) === routeId
        ) {
          return point
        }

        if (
          point.experimentPath &&
          normalizeExperimentId(
            point.experimentPath,
          ) === routeId
        ) {
          return point
        }
      }
  }

  return undefined
}

/**
 * Experiment V2 通用顶部导航。
 *
 * 所有 /demo/* 页面最终都使用这一套 Header。
 */
export default function DemoHeader({
  breadcrumb,
  onBreadcrumbClick,
  onOpenAssistant,
  onEnterCaptureMode,
  fullscreen = false,
  onToggleFullscreen,
}: DemoHeaderProps) {
  const location =
    useLocation()

  const navigate =
    useNavigate()

  const [
    navigationOpen,
    setNavigationOpen,
  ] = useState(false)

  const [navigationCourseOverride, setNavigationCourseOverride] = useState<string | null>(null)

  const [
    helpOpen,
    setHelpOpen,
  ] = useState(false)

  const [
    captureError,
    setCaptureError,
  ] = useState('')

  /*
   * 统一从：
   *
   * /demo/:id
   *
   * 提取当前实验 ID。
   *
   * 示例：
   *
   * /demo/epsilon-delta
   * → epsilon-delta
   *
   * /demo/fourier
   * → fourier
   */
  const routeId =
    getExperimentIdFromDemoPath(
      location.pathname,
    )

  const displayedBreadcrumb = breadcrumb.length > 1
    ? [
        breadcrumb.some((item) => item.includes('临时实验')) ? '临时实验' : '实验库',
        breadcrumb[breadcrumb.length - 1],
      ]
    : breadcrumb
  const last = displayedBreadcrumb.length - 1

  /*
   * 找到这个 Demo 真正对应的课程知识点。
   */
  const currentPoint =
    resolveKnowledgePoint(
      routeId,
    )

  const currentCourse = currentPoint ? findCourseOfPoint(currentPoint.id) : undefined
  const navigationCourse = findCourse(navigationCourseOverride ?? currentCourse?.id ?? DEFAULT_COURSE_ID)

  /**
   * 从「章节与知识点」抽屉选择知识点。
   *
   * 章节目录是知识导航，而不是实验切换器。
   * 从演示页选择知识点时统一回到知识地图页，
   * 由用户在知识详情中决定是否进入对应演示。
   */
  const selectPoint = (
    pointId: string,
  ) => {
    const point = findPointAcrossCourses(pointId)
    const pointCourse = point ? findCourseOfPoint(point.id) : undefined

    setNavigationOpen(false)

    if (!point) {
      return
    }

    navigate(`/?course=${encodeURIComponent(pointCourse?.id ?? navigationCourse.id)}&point=${encodeURIComponent(point.id)}`)
  }

  /**
   * 当前演示对应的 AI 提问 URL。
   *
   * 例如：
   *
   * /demo/epsilon-delta
   *
   * →
   *
   * /ask?question=
   * 请结合当前演示讲解函数的极限
   */
  const currentTitle =
    currentPoint?.title ??
    displayedBreadcrumb[last] ??
    '这个知识点'

  const askPath =
    `/ask?question=${encodeURIComponent(
      `请结合当前演示讲解${currentTitle}`,
    )}`

  return (
    <>
      {/* =====================================
          顶部导航栏
         ===================================== */}
      <header
        className="
          flex
          h-16
          shrink-0
          items-center
          justify-between
          border-b
          border-gray-100
          bg-white
          px-3
          shadow-sm

          md:px-6
        "
      >
        {/* =====================================
            左侧
           ===================================== */}
        <div
          className="
            flex
            min-w-0
            items-center
            gap-3

            md:gap-5
          "
        >
          {/* Logo */}
          <Link
            to="/"
            className="
              flex
              shrink-0
              items-center
              gap-2.5
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-gradient-to-br
                from-indigo-600
                to-indigo-500
                shadow-md
                shadow-indigo-500/25
              "
            >
              <svg
                className="
                  h-5
                  w-5
                  text-white
                "
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 4 L20 18 H4 Z" />

                <circle
                  cx="12"
                  cy="14"
                  r="1.6"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </div>

            <div
              className="
                hidden
                leading-tight

                sm:block
              "
            >
              <div
                className="
                  text-base
                  font-bold
                  text-gray-900
                "
              >
                数韵之美
              </div>

              <div
                className="
                  text-[11px]
                  text-gray-400
                "
              >
                探索数学本质之美
              </div>
            </div>
          </Link>

          {/* 分隔线 */}
          <div
            className="
              hidden
              h-6
              w-px
              bg-gray-200

              lg:block
            "
          />

          {/* 章节目录 */}
          <button
            type="button"
            onClick={() =>
              setNavigationOpen(true)
            }
            className="
              inline-flex
              h-9
              shrink-0
              items-center
              gap-2
              rounded-lg
              border
              border-gray-200
              bg-white
              px-3
              text-sm
              font-semibold
              text-gray-600
              transition-all

              hover:border-indigo-300
              hover:bg-indigo-50
              hover:text-indigo-600
            "
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>

            <span
              className="
                hidden

                md:inline
              "
            >
              课程目录
            </span>
          </button>

          {/* =====================================
              面包屑
             ===================================== */}
          <nav
            aria-label="面包屑"
            className="
              hidden
              min-w-0
              items-center
              gap-1.5
              text-sm

              xl:flex
            "
          >
            {displayedBreadcrumb[0] !== '首页' && (
              <>
                <Link
                  to="/"
                  className="truncate text-gray-500 transition hover:text-indigo-600 hover:underline"
                >
                  首页
                </Link>
                <span className="text-gray-300">›</span>
              </>
            )}
            {displayedBreadcrumb.map(
              (
                item,
                index,
              ) => (
                <span
                  key={`${item}-${index}`}
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-1.5
                  "
                >
                  {index > 0 && (
                    <span
                      className="
                        text-gray-300
                      "
                    >
                      ›
                    </span>
                  )}

                  {index <
                    last &&
                  onBreadcrumbClick ? (
                    <button
                      type="button"
                      onClick={() =>
                        onBreadcrumbClick(
                          index,
                        )
                      }
                      className="
                        truncate
                        text-gray-500
                        transition

                        hover:text-indigo-600
                        hover:underline
                      "
                    >
                      {item}
                    </button>
                  ) : index < last ? (
                    <Link
                      to={
                        item === '首页'
                          ? '/'
                          : item === '实验库' || item === '全部可视化实验'
                            ? '/experiments'
                            : `/experiments?q=${encodeURIComponent(item)}`
                      }
                      className="truncate text-gray-500 transition hover:text-indigo-600 hover:underline"
                    >
                      {item}
                    </Link>
                  ) : (
                    <span
                      className={[
                        'truncate',
                        index ===
                        last
                          ? 'font-semibold text-indigo-600'
                          : 'text-gray-500',
                      ].join(
                        ' ',
                      )}
                    >
                      {item}
                    </span>
                  )}
                </span>
              ),
            )}
          </nav>
        </div>

        {/* =====================================
            右侧操作
           ===================================== */}
        <div
          className="
            relative
            flex
            items-center
            gap-2
          "
        >
          {/* 截图 */}
          <button
            type="button"
            onClick={() => {
              setCaptureError('')

              if (onEnterCaptureMode) {
                onEnterCaptureMode()
                return
              }

              captureVisibleScreen()
                .catch(() =>
                  setCaptureError(
                    '截图已取消或当前浏览器不支持。',
                  ),
                )
            }}
            className="
              inline-flex
              h-9
              items-center
              gap-1.5
              rounded-lg
              border
              border-gray-200
              px-3
              text-sm
              font-medium
              text-gray-600
              transition-all

              hover:border-indigo-300
              hover:bg-indigo-50/50
              hover:text-indigo-600
            "
            aria-label="截图当前演示"
            title="截图"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
              />

              <path d="M9 3v18M3 9h18" />
            </svg>

            <span
              className="
                hidden

                sm:inline
              "
            >
              截图
            </span>
          </button>

          {/* 全屏 */}
          <button
            type="button"
            onClick={() => {
              const toggle = onToggleFullscreen ?? toggleDocumentFullscreen
              void toggle()
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition-all hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600"
            aria-label={fullscreen ? '退出全屏' : '全屏演示'}
            title={fullscreen ? '退出全屏' : '全屏'}
          >
            <span aria-hidden="true">{fullscreen ? '↙' : '⛶'}</span>
            <span className="hidden lg:inline">{fullscreen ? '退出全屏' : '全屏'}</span>
          </button>

          {/* AI 提问 */}
          {onOpenAssistant ? (
            <button
              type="button"
              onClick={onOpenAssistant}
              className="
              inline-flex
              h-9
              items-center
              gap-1.5
              rounded-full
              bg-indigo-600
              px-4
              text-sm
              font-semibold
              text-white
              shadow-md
              shadow-indigo-500/20
              transition-all

              hover:bg-indigo-700
              hover:shadow-lg
              hover:shadow-indigo-500/25
            "
            >
              <span className="text-base">＋</span>
              <span className="hidden sm:inline">提问</span>
            </button>
          ) : (
            <Link
              to={askPath}
              className="
                inline-flex
                h-9
                items-center
                gap-1.5
                rounded-full
                bg-indigo-600
                px-4
                text-sm
                font-semibold
                text-white
                shadow-md
                shadow-indigo-500/20
                transition-all
                hover:bg-indigo-700
                hover:shadow-lg
                hover:shadow-indigo-500/25
              "
            >
              <span className="text-base">＋</span>
              <span className="
                hidden

                sm:inline
              "
              >提问</span>
            </Link>
          )}

          {/* 帮助 */}
          <button
            type="button"
            onClick={() =>
              setHelpOpen(
                (open) =>
                  !open,
              )
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-gray-200
              text-sm
              font-semibold
              text-gray-500
              transition-all

              hover:border-indigo-300
              hover:bg-indigo-50/50
              hover:text-indigo-600
            "
            aria-label="演示帮助"
            aria-expanded={
              helpOpen
            }
            title="帮助"
          >
            ?
          </button>

          {/* 帮助浮层 */}
          {helpOpen && (
            <div
              className="
                absolute
                right-0
                top-12
                z-40
                w-72
                rounded-xl
                border
                border-slate-200
                bg-white
                p-4
                text-sm
                leading-6
                text-slate-600
                shadow-xl
              "
            >
              <div
                className="
                  font-bold
                  text-slate-800
                "
              >
                演示页使用提示
              </div>

              <p className="mt-1">
                调整右侧参数观察数学对象变化；
                使用底部步骤栏逐步学习；
                点击「章节与知识点」可以切换到其他实验。
              </p>

              <p
                className="
                  mt-2
                  text-xs
                  text-slate-400
                "
              >
                所有实验统一使用
                MathViz Experiment V2
                工作台。
              </p>
            </div>
          )}

          {/* 截图错误 */}
          {captureError && (
            <div
              className="
                absolute
                right-0
                top-12
                z-40
                w-64
                rounded-lg
                bg-rose-50
                px-3
                py-2
                text-xs
                text-rose-600
                shadow
              "
            >
              {captureError}
            </div>
          )}
        </div>
      </header>

      {/* =====================================
          章节与知识点抽屉
         ===================================== */}
      <DrawerSidebar
        open={navigationOpen}
        onClose={() =>
          setNavigationOpen(false)
        }
        selectedPointId={
          currentPoint?.id ?? ''
        }
        onSelectPoint={
          selectPoint
        }
        chapters={navigationCourse.chapters}
        courses={courses}
        selectedCourseId={navigationCourse.id}
        onSelectCourse={setNavigationCourseOverride}
      />
    </>
  )
}
