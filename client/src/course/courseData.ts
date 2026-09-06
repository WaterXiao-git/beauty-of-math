// 高等数学课程数据：由客户确认的十四模块、150 个知识点构建。

import type { OwnedExperimentId } from '../owned-experiments/catalog.generated'
import {
  HIGH_MATH_COURSE_META,
  HIGH_MATH_CURRICULUM,
} from './highMathCurriculum.generated'

export type KnowledgeStatus = 'mastered' | 'learning' | 'not-started'
export type PreviewLevel = 'A' | 'B' | 'C'

export interface KnowledgePoint {
  id: string
  title: string
  status: KnowledgeStatus
  previewLevel: PreviewLevel
  template: string
  summary: string
  goals: string[]
  related: string[]
  relatedIds?: string[]
  prerequisiteIds?: string[]
  rendererId?: OwnedExperimentId
  backendId?: string
  contentVersion?: string
  source?: 'catalog' | 'published'
}

export interface CourseSection {
  id: string
  title: string
  points: KnowledgePoint[]
}

export interface CourseChapter {
  id: string
  title: string
  sections: CourseSection[]
}

export const STATUS_META: Record<
  KnowledgeStatus,
  { label: string; dot: string; text: string; bg: string; border: string }
> = {
  mastered: {
    label: '已掌握',
    dot: 'bg-emerald-500',
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  learning: {
    label: '学习中',
    dot: 'bg-blue-500',
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  'not-started': {
    label: '未学习',
    dot: 'bg-amber-400',
    text: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
}

export const LEVEL_META: Record<PreviewLevel, { label: string; badge: string }> = {
  A: { label: 'A', badge: 'bg-emerald-100 text-emerald-700' },
  B: { label: 'B', badge: 'bg-yellow-100 text-yellow-700' },
  C: { label: 'C', badge: 'bg-orange-100 text-orange-700' },
}

export const COURSE_TITLE = HIGH_MATH_COURSE_META.title
export const COURSE_SUBTITLE = HIGH_MATH_COURSE_META.subtitle

const MODULE_FOCUS = [
  '联动函数规则、参数与坐标图像，观察定义域、值域和整体形态如何变化。',
  '跟踪数列或函数的逼近过程，用误差带和数值差理解极限。',
  '比较函数在目标点左右两侧的行为，辨认连续与各类间断。',
  '联动割线、切线、变化率和线性近似，理解导数与微分。',
  '同时观察函数及其导数信息，把定理条件和图像结论对应起来。',
  '联动被积函数、原函数族与积分常数，理解积分运算。',
  '通过分割、求和与取极限观察定积分的形成和计算。',
  '把几何或物理对象切分为微元，再观察累加产生的整体量。',
  '联动方向场、初值和解曲线，观察微分方程解随参数变化。',
  '使用二维投影表现三维对象，观察向量、直线、平面和曲面的空间关系。',
  '联动三维曲面、等高线和方向箭头，理解多元函数的局部变化。',
  '把平面或空间区域划分为小单元，观察重积分的累加过程。',
  '沿路径或曲面移动微元，观察方向、法向量和积分结果的关系。',
  '动态增加部分和或展开阶数，比较收敛、发散与逼近误差。',
] as const

function buildPoint(
  moduleIndex: number,
  pointIndex: number,
): KnowledgePoint {
  const module = HIGH_MATH_CURRICULUM[moduleIndex]
  const point = module.points[pointIndex]
  const previous = module.points[pointIndex - 1]
  const next = module.points[pointIndex + 1]
  const relatedPoints = [previous, next].filter(
    (candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate),
  )

  return {
    id: point.id,
    title: point.title,
    status: moduleIndex === 0 && pointIndex === 0 ? 'learning' : 'not-started',
    previewLevel: moduleIndex < 3 ? 'A' : moduleIndex < 8 ? 'B' : 'C',
    template: `${point.title}交互可视化`,
    summary: `${point.title}是“${module.title}”中的核心知识点。本实验${MODULE_FOCUS[moduleIndex]}`,
    goals: [
      `理解“${point.title}”的定义、条件与数学含义`,
      `能从动态图像和数值变化中识别“${point.title}”的关键特征`,
      `能够利用实验观察解释相关公式或结论`,
    ],
    related: relatedPoints.map(({ title }) => title),
    relatedIds: relatedPoints.map(({ id }) => id),
    prerequisiteIds: previous ? [previous.id] : [],
    rendererId: point.id as OwnedExperimentId,
    source: 'catalog',
  }
}

export const courseChapters: CourseChapter[] = HIGH_MATH_CURRICULUM.map(
  (module, moduleIndex) => ({
    id: module.id,
    title: module.title,
    sections: [
      {
        id: `${module.id}-s1`,
        title: `${moduleIndex + 1}.1 ${module.title}`,
        points: module.points.map((_, pointIndex) => buildPoint(moduleIndex, pointIndex)),
      },
    ],
  }),
)

for (const chapter of courseChapters) Object.freeze(chapter)
Object.freeze(courseChapters)

/** @deprecated Use courseChapters for the formal course scope. */
export const chapters = courseChapters

export function findPoint(id: string): KnowledgePoint | undefined {
  for (const chapter of courseChapters) {
    for (const section of chapter.sections) {
      const point = section.points.find((candidate) => candidate.id === id)
      if (point) return point
    }
  }
  return undefined
}

export function findSectionOf(pointId: string): CourseSection | undefined {
  for (const chapter of courseChapters) {
    for (const section of chapter.sections) {
      if (section.points.some((point) => point.id === pointId)) return section
    }
  }
  return undefined
}

export function findChapterOf(pointId: string): CourseChapter | undefined {
  return courseChapters.find((chapter) =>
    chapter.sections.some((section) =>
      section.points.some((point) => point.id === pointId),
    ),
  )
}
