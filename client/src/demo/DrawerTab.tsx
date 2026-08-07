// 收起态左侧「目录」触角：点击弹出抽屉侧边栏（演示页 / 旧实验外壳共用）
export default function DrawerTab({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="打开章节目录"
      title="章节目录"
      className="fixed left-0 top-1/2 -translate-y-1/2 z-40 h-16 w-8 flex items-center justify-center rounded-r-xl bg-white/90 backdrop-blur-sm border border-l-0 border-gray-200 shadow-md hover:bg-indigo-600 hover:border-indigo-600 hover:translate-x-1 transition-all group"
    >
      <svg
        className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  )
}
