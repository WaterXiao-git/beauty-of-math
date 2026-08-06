// 演示页顶部导航：课程抽屉 / 面包屑 / 截图 / 带上下文提问 / 帮助
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import DrawerSidebar from '../course/DrawerSidebar'
import { chapters, findPoint } from '../course/courseData'

interface DemoHeaderProps {
  breadcrumb: string[]
  onBreadcrumbClick?: (index: number) => void
}

async function captureVisibleScreen() {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    window.print()
    return
  }

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false,
  })

  try {
    const video = document.createElement('video')
    video.srcObject = stream
    video.muted = true
    await video.play()

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) throw new Error('浏览器无法创建截图画布')
    context.drawImage(video, 0, 0)

    const link = document.createElement('a')
    link.download = `数韵之美-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } finally {
    stream.getTracks().forEach((track) => track.stop())
  }
}

export default function DemoHeader({ breadcrumb, onBreadcrumbClick }: DemoHeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [navigationOpen, setNavigationOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [captureError, setCaptureError] = useState('')
  const last = breadcrumb.length - 1
  const routeId = location.pathname.startsWith('/demo/')
    ? decodeURIComponent(location.pathname.slice('/demo/'.length))
    : location.pathname === '/rolle'
      ? 'rolle'
      : ''
  const currentPoint = findPoint(routeId)

  const selectPoint = (pointId: string) => {
    const point = findPoint(pointId)
    setNavigationOpen(false)
    if (!point) return
    if (point.demoId) {
      navigate(`/demo/${point.demoId}`)
    } else if (point.experimentPath) {
      navigate(point.experimentPath)
    } else {
      navigate(`/?point=${encodeURIComponent(point.id)}`)
    }
  }

  const askPath = `/ask?question=${encodeURIComponent(
    `请结合当前演示讲解${currentPoint?.title ?? breadcrumb[last] ?? '这个知识点'}`,
  )}`

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-3 shadow-sm md:px-6">
        <div className="flex min-w-0 items-center gap-3 md:gap-5">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-md shadow-indigo-500/25">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4 L20 18 H4 Z" />
                <circle cx="12" cy="14" r="1.6" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div className="hidden leading-tight sm:block">
              <div className="text-base font-bold text-gray-900">数韵之美</div>
              <div className="text-[11px] text-gray-400">探索数学本质之美</div>
            </div>
          </Link>

          <div className="hidden h-6 w-px bg-gray-200 lg:block" />

          <button
            type="button"
            onClick={() => setNavigationOpen(true)}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="hidden md:inline">章节与知识点</span>
          </button>

          <nav aria-label="面包屑" className="hidden min-w-0 items-center gap-1.5 text-sm xl:flex">
            {breadcrumb.map((item, index) => (
              <span key={`${item}-${index}`} className="flex min-w-0 items-center gap-1.5">
                {index > 0 && <span className="text-gray-300">›</span>}
                {index < last && onBreadcrumbClick ? (
                  <button
                    type="button"
                    onClick={() => onBreadcrumbClick(index)}
                    className="truncate text-gray-500 transition hover:text-indigo-600 hover:underline"
                  >
                    {item}
                  </button>
                ) : (
                  <span className={`truncate ${index === last ? 'font-semibold text-indigo-600' : 'text-gray-500'}`}>
                    {item}
                  </span>
                )}
              </span>
            ))}
          </nav>
        </div>

        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCaptureError('')
              captureVisibleScreen().catch(() => setCaptureError('截图已取消或当前浏览器不支持。'))
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600"
            aria-label="截图当前演示"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18M3 9h18" />
            </svg>
            <span className="hidden sm:inline">截图</span>
          </button>

          <Link
            to={askPath}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-indigo-600 px-4 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700"
          >
            <span className="text-base">＋</span>
            提问
          </Link>

          <button
            type="button"
            onClick={() => setHelpOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600"
            aria-label="演示帮助"
            aria-expanded={helpOpen}
          >
            ?
          </button>

          {helpOpen && (
            <div className="absolute right-0 top-12 z-40 w-72 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 shadow-xl">
              <div className="font-bold text-slate-800">演示页使用提示</div>
              <p className="mt-1">调整右侧参数观察图像变化，使用步骤栏逐步播放；课程目录可随时切换知识点。</p>
            </div>
          )}
          {captureError && (
            <div className="absolute right-0 top-12 z-40 w-64 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 shadow">
              {captureError}
            </div>
          )}
        </div>
      </header>

      <DrawerSidebar
        open={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        selectedPointId={currentPoint?.id ?? ''}
        onSelectPoint={selectPoint}
        chapters={chapters}
      />
    </>
  )
}
