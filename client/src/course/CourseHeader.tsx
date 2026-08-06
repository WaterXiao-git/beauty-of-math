// 顶部导航栏：Logo + 面包屑 + 智能提问按钮 + 头像
import { Link } from 'react-router-dom'

interface CourseHeaderProps {
  /** 面包屑路径，如 ['首页', '高等数学（上册）', '函数、极限与连续', '函数的极限'] */
  breadcrumb: string[]
  /** 是否处于「AI 智能提问」页（按钮激活态） */
  askActive?: boolean
}

export default function CourseHeader({ breadcrumb, askActive = false }: CourseHeaderProps) {
  const last = breadcrumb.length - 1
  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-gray-100 shadow-sm shrink-0">
      {/* 左侧：Logo + 面包屑 */}
      <div className="flex items-center gap-4 md:gap-6 min-w-0">
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

        {/* 面包屑 */}
        <nav aria-label="面包屑" className="hidden md:flex items-center gap-1.5 min-w-0 text-sm">
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && (
                <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              )}
              <span
                className={`truncate ${
                  i === last
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {item}
              </span>
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