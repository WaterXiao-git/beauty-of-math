// 抽屉式/可折叠侧边栏（Off-canvas Drawer）：固定定位、可滑出隐藏/展开
// 用法：open 控制滑入滑出，onClose 关闭；选中态与 CourseHome 知识点联动
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CourseChapter } from './courseData'

interface DrawerSidebarProps {
  /** 是否展开显示 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 当前选中的知识点 id */
  selectedPointId: string
  /** 选中知识点回调 */
  onSelectPoint: (pointId: string) => void
  /** 当前课程目录；允许使用后端发布数据覆盖后的结果 */
  chapters: CourseChapter[]
}

interface DrawerItem {
  id: string
  title: string
  /** 小节编号，如 1.1 */
  num: string
}

interface DrawerGroup {
  id: string
  label: string
  items: DrawerItem[]
}

/** 中文数字（用于「第一章」等分组标题） */
const CN_NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

/** 提取小节编号前缀（"1.1 函数" -> num="1.1", name="函数"） */
function splitSectionTitle(title: string): { num: string; name: string } {
  const m = title.match(/^(\d+(?:\.\d+)*)\s*(.*)$/)
  return m ? { num: m[1], name: m[2] } : { num: '', name: title }
}

export default function DrawerSidebar({
  open,
  onClose,
  selectedPointId,
  onSelectPoint,
  chapters,
}: DrawerSidebarProps) {
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 180)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])

  // 按章节分组展平：章节 -> 小节(编号) -> 知识点
  const groups = useMemo<DrawerGroup[]>(
    () =>
      chapters.map((ch, idx) => {
        const items: DrawerItem[] = []
        for (const sec of ch.sections) {
          const { num } = splitSectionTitle(sec.title)
          for (const p of sec.points) {
            items.push({ id: p.id, title: p.title, num })
          }
        }
        return {
          id: ch.id,
          label: `第${CN_NUM[idx] ?? idx + 1}章 ${ch.title}`,
          items,
        }
      }),
    [chapters],
  )

  // 搜索过滤（标题 / 编号 / 章节名）
  const q = query.trim().toLowerCase()
  const filteredGroups = useMemo(() => {
    if (!q) return groups
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (it) =>
            it.title.toLowerCase().includes(q) ||
            it.num.toLowerCase().includes(q) ||
            g.label.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.items.length > 0)
  }, [groups, q])

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      {/* 遮罩：点击关闭 */}
      <div
        className={`absolute inset-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* 抽屉主体 */}
      <aside
        className={`absolute left-0 top-0 flex h-dvh w-[min(420px,92vw)] flex-col border-r border-gray-100 bg-white p-5 shadow-2xl transition-transform duration-300 ease-out md:p-6 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="章节与知识点"
      >
        {/* 头部：标题 + 关闭按钮 */}
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-gray-900">章节与知识点</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
            aria-label="关闭侧边栏"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 搜索栏 */}
        <div className="relative mt-5 shrink-0">
          <svg
            className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索章节、知识点或关键词"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
        </div>

        {/* 目录列表 */}
        <nav className="flex-1 overflow-y-auto mt-2 -mr-2 pr-2" aria-label="章节目录">
          {filteredGroups.map((group) => (
            <div key={group.id}>
              {/* 分组标题 */}
              <div className="text-xs font-medium text-gray-500 mb-2 mt-4 first:mt-2">{group.label}</div>
              {/* 列表项 */}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isSelected = item.id === selectedPointId
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectPoint(item.id)
                        onClose()
                      }}
                      aria-current={isSelected}
                      className={`w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-sm transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-600 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{item.title}</span>
                      <span className={`text-sm shrink-0 ml-3 ${isSelected ? 'text-indigo-400' : 'text-gray-400'}`}>
                        {item.num}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* 空状态 */}
          {filteredGroups.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
              未找到匹配的知识点
            </div>
          )}
        </nav>
      </aside>
    </div>
  )
}
