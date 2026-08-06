// 课程主界面：顶部 Header + 三栏布局（章节目录 | 知识地图+卡片网格 | 知识点详情）
import { useMemo, useState } from 'react'
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
  const [selectedPointId, setSelectedPointId] = useState(DEFAULT_POINT_ID)

  const point = findPoint(selectedPointId) ?? findPoint(DEFAULT_POINT_ID)!
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

  return (
    <div className="flex flex-col h-full bg-[#f5f7fa]">
      <CourseHeader breadcrumb={breadcrumb} />

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