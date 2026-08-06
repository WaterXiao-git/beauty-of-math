// 顶部导航栏：Logo + 面包屑（可点击回退层级）+ 智能提问按钮 + 头像
import { Link } from 'react-router-dom'

interface CourseHeaderProps {
  /** 面包屑路径，如 ['首页', '高等数学（上册）', '函数、极限与连续', '函数的极限'] */
  breadcrumb: string[]
  /** 是否处于「AI 智能提问」页（按钮激活态） */
  askActive?: boolean
  /** 面包屑项点击回调（index 0=首页, 1=课程, 2=章节, 3=小节, 4=知识点）；不传则纯文本 */
  onBreadcrumbClick?: (index: number) => void
  /** 打开隐藏的章节与知识点抽屉 */
  onOpenNavigation?: () => void
}

export default function CourseHeader({
  breadcrumb,
  askActive = false,
  onBreadcrumbClick,
  onOpenNavigation,
}: CourseHeaderProps) {
  const last = breadcrumb.length - 1
  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-gray-100 shadow-sm shrink-0">
      {/* 左侧：Logo + 面包屑 */}
      <div className="flex items-center gap-4 md:gap-6 min-w-0">
        {onOpenNavigation && (
          <button
            type="button"
            onClick={onOpenNavigation}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            aria-label="打开章节与知识点"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="hidden sm:inline">课程目录</span>
          </button>
        )}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          {/* 蓝色几何 Logo */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/25">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              {/* 几何三角 + 圆，代表数学之美 */}
              <path d="M12 4 L20 18 H4 Z" />
              <circle cx="12" cy="14" r="1.6" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">数韵之美</span>
        </Link>

        {/* 面包屑：非末项可点击回到对应层级 */}
        <nav aria-label="面包屑" className="hidden md:flex items-center gap-1.5 min-w-0 text-sm">
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && (
                <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              )}
              {i < last && onBreadcrumbClick ? (
                <button
                  type="button"
                  onClick={() => onBreadcrumbClick(i)}
                  className="truncate text-gray-500 hover:text-blue-600 hover:underline transition-colors"
                >
                  {item}
                </button>
              ) : i === 0 && i < last ? (
                <Link
                  to="/"
                  className="truncate text-gray-500 transition-colors hover:text-blue-600 hover:underline"
                >
                  {item}
                </Link>
              ) : (
                <span className={`truncate ${i === last ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                  {item}
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* 右侧：智能提问 + 头像 */}
      <div className="flex items-center gap-3">
        <Link
          to="/ask"
          aria-current={askActive ? 'page' : undefined}
          className={`flex items-center gap-1.5 px-4 h-9 rounded-full text-sm font-medium transition-colors ${
            askActive
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
            <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
          </svg>
          智能提问
        </Link>
        {/* 头像 */}
        <button
          type="button"
          className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-white ring-1 ring-gray-200 flex items-center justify-center text-blue-700 font-semibold text-sm hover:ring-blue-300 transition-all"
          aria-label="个人中心"
        >
          学
        </button>
      </div>
    </header>
  )
}
