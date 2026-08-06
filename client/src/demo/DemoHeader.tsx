// 演示页顶部导航：Logo+副标题 / 章节下拉 / 面包屑 / 截图 / 紫色提问 / 帮助 / 头像
import { Link } from 'react-router-dom'

interface DemoHeaderProps {
  /** 面包屑路径 */
  breadcrumb: string[]
}

export default function DemoHeader({ breadcrumb }: DemoHeaderProps) {
  const last = breadcrumb.length - 1
  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-gray-100 shadow-sm shrink-0">
      {/* 左侧 */}
      <div className="flex items-center gap-4 md:gap-5 min-w-0">
        {/* Logo + 副标题 */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/25">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4 L20 18 H4 Z" />
              <circle cx="12" cy="14" r="1.6" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-base font-bold text-gray-900">数韵之美</div>
            <div className="text-[11px] text-gray-400 hidden sm:block">探索数学本质之美</div>
          </div>
        </Link>

        <div className="hidden lg:block w-px h-6 bg-gray-200" />

        {/* 章节选择下拉（占位） */}
        <button
          type="button"
          className="hidden lg:inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors shrink-0"
        >
          高等数学（上册）
          <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {/* 面包屑 */}
        <nav aria-label="面包屑" className="hidden md:flex items-center gap-1.5 min-w-0 text-sm">
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && (
                <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              )}
              <span className={`truncate ${i === last ? 'text-indigo-600 font-semibold' : 'text-gray-500'}`}>
                {item}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* 右侧操作区 */}
      <div className="flex items-center gap-2.5">
        {/* 截图模式 */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
          aria-label="截图模式"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18M3 9h18" />
          </svg>
          <span className="hidden sm:inline">截图</span>
        </button>

        {/* 紫色提问按钮 */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          提问
        </button>

        {/* 帮助 */}
        <button
          type="button"
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
          aria-label="帮助"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
            <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
          </svg>
        </button>

        {/* 头像 */}
        <button
          type="button"
          className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 border-2 border-white ring-1 ring-gray-200 flex items-center justify-center text-indigo-700 font-semibold text-sm hover:ring-indigo-300 transition-all"
          aria-label="个人中心"
        >
          学
        </button>
      </div>
    </header>
  )
}