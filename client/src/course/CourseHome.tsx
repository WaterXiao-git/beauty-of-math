// 课程主界面：顶部 Header + 三栏布局（章节目录 | 知识地图+卡片网格 | 知识点详情）
import { useEffect, useMemo, useState } from 'react'
import CourseHeader from './CourseHeader'
import ChapterSidebar from './ChapterSidebar'
import KnowledgeMap from './KnowledgeMap'
import KnowledgeCards from './KnowledgeCards'
import KnowledgeDetail from './KnowledgeDetail'
import {
  chapters,
  COURSE_TITLE,
  DEFAULT_POINT_ID,
  findChapterOf,
  findPoint,
  findSectionOf,
} from './courseData'
import type { KnowledgePoint } from './courseData'

/** 主界面选中知识点缓存 key：从演示返回时恢复上次浏览的章节/知识点 */
const SELECTION_CACHE_KEY = 'mathviz.course.selectedPointId'

/** 读取缓存：缓存值必须是当前课程中存在的知识点，否则回退默认（1.1 函数） */
function loadCachedSelection(): string {
  try {
    const cached = localStorage.getItem(SELECTION_CACHE_KEY)
    if (cached && findPoint(cached)) return cached
  } catch {
    // 隐私模式等场景下 localStorage 不可用，忽略
  }
  return DEFAULT_POINT_ID
}

/** 收集全部知识点，用于知识地图关联节点查找 */
function collectAllPoints(): KnowledgePoint[] {
  const all: KnowledgePoint[] = []
  for (const ch of chapters) {
    for (const sec of ch.sections) {
      all.push(...sec.points)
    }
  }
  return all
}

export default function CourseHome() {
  const [selectedPointId, setSelectedPointId] = useState(loadCachedSelection)

  // 选中变化时持久化：从演示返回主界面、或刷新页面后恢复原章节
  useEffect(() => {
    try {
      localStorage.setItem(SELECTION_CACHE_KEY, selectedPointId)
    } catch {
      // localStorage 不可用时忽略
    }
  }, [selectedPointId])

  // 双保险兜底：默认知识点优先，缺失时取课程首个知识点（避免课程数据调整时崩溃）
  const fallbackPoint = findPoint(DEFAULT_POINT_ID) ?? chapters[0]?.sections[0]?.points[0]
  const point = findPoint(selectedPointId) ?? fallbackPoint!
  const section = findSectionOf(point.id)
  const chapter = findChapterOf(point.id)

  // 知识地图关联节点（按标题匹配全局知识点）
  const relatedPoints = useMemo(() => {
    const all = collectAllPoints()
    return point.related
      .map((title) => all.find((p) => p.title === title))
      .filter((p): p is KnowledgePoint => Boolean(p))
  }, [point])

  // 卡片网格：当前小节内的知识点
  const sectionPoints = section?.points ?? []

  // 面包屑：首页 > 课程 > 章节 > 小节 > 知识点
  const breadcrumb = [
    '首页',
    COURSE_TITLE,
    chapter?.title ?? '',
    section?.title ?? '',
    point.title,
  ].filter(Boolean)

  // 面包屑点击：回到对应层级（index 0=首页, 1=课程, 2=章节, 3=小节）
  const handleBreadcrumbClick = (index: number) => {
    if (index <= 1) {
      // 首页 / 课程：回到默认知识点
      setSelectedPointId(DEFAULT_POINT_ID)
      return
    }
    if (index === 2 && chapter) {
      // 章节：选中该章第一个知识点
      const first = chapter.sections[0]?.points[0]
      if (first) setSelectedPointId(first.id)
      return
    }
    if (index === 3 && section) {
      // 小节：选中该小节第一个知识点
      const first = section.points[0]
      if (first) setSelectedPointId(first.id)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#f5f7fa]">
      <CourseHeader breadcrumb={breadcrumb} onBreadcrumbClick={handleBreadcrumbClick} />

      <div className="flex-1 min-h-0 flex gap-4 p-4 md:p-5">
        {/* 左：章节目录 */}
        <ChapterSidebar
          chapters={chapters}
          selectedPointId={point.id}
          onSelectPoint={setSelectedPointId}
        />

        {/* 中：知识地图 + 知识点导航 */}
        <main className="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto">
          <KnowledgeMap
            point={point}
            relatedPoints={relatedPoints}
            onSelectPoint={setSelectedPointId}
          />
          <KnowledgeCards
            points={sectionPoints}
            selectedPointId={point.id}
            onSelectPoint={setSelectedPointId}
          />
        </main>

        {/* 右：知识点详情 */}
        <KnowledgeDetail point={point} />
      </div>
    </div>
  )
}