import {
  HIGH_MATH_COURSE_META,
  HIGH_MATH_CURRICULUM,
} from './highMathCurriculum.generated.js'

import type { Chapter, KnowledgePoint } from './types.js'

const CATALOGED_AT = '2026-08-30T00:00:00.000Z'
export const HIGH_MATH_COURSE_ID = HIGH_MATH_COURSE_META.id

const MODULE_DESCRIPTIONS = [
  '通过函数规则、坐标和参数变化研究函数图像及其基本性质。',
  '通过数值逼近与误差观察研究数列极限和函数极限。',
  '研究函数在点与区间上的连续性，以及不同类型的间断。',
  '研究瞬时变化率、切线、高阶导数和局部线性近似。',
  '利用微分中值定理和导数分析函数形态与最优化问题。',
  '研究原函数、不定积分及常用积分方法。',
  '从黎曼和出发研究定积分、基本公式和反常积分。',
  '利用定积分解决面积、体积、弧长和物理量计算问题。',
  '研究微分方程的解、初值条件和实际应用模型。',
  '建立空间向量、直线、平面和曲面的几何关系。',
  '研究多元函数的极限、连续、偏导数和极值。',
  '研究二重积分、三重积分及其坐标变换。',
  '研究曲线积分、曲面积分以及三大积分公式。',
  '研究数项级数、幂级数和傅里叶级数的收敛与展开。',
] as const

function pointSummary(moduleTitle: string, pointTitle: string): string {
  return `“${pointTitle}”是“${moduleTitle}”模块中的独立交互实验，通过参数、图像和分步观察理解其定义、条件与结论。`
}

export function createCourseNavigationChapters(): Chapter[] {
  return HIGH_MATH_CURRICULUM.flatMap((module, moduleIndex) => {
    const rootId = `chapter:${module.id}`
    const sectionId = `section:${module.id}`

    return [
      {
        id: rootId,
        courseId: HIGH_MATH_COURSE_ID,
        parentChapterId: null,
        code: module.id,
        title: module.title,
        description: MODULE_DESCRIPTIONS[moduleIndex],
        status: 'published',
        sortOrder: moduleIndex + 1,
        createdAt: CATALOGED_AT,
        updatedAt: CATALOGED_AT,
      },
      {
        id: sectionId,
        courseId: HIGH_MATH_COURSE_ID,
        parentChapterId: rootId,
        code: `${module.id}-experiments`,
        title: `${moduleIndex + 1}.1 ${module.title}`,
        description: `${module.title}知识点与实验目录。`,
        status: 'published',
        sortOrder: 1,
        createdAt: CATALOGED_AT,
        updatedAt: CATALOGED_AT,
      },
    ]
  })
}

export function createCourseNavigationKnowledgePoints(): KnowledgePoint[] {
  return HIGH_MATH_CURRICULUM.flatMap((module) =>
    module.points.map((point) => ({
      id: point.id,
      chapterId: `section:${module.id}`,
      code: point.id,
      title: point.title,
      summary: pointSummary(module.title, point.title),
      aliases: [point.title],
      tags: ['高等数学', module.title],
      status: 'published' as const,
      visibility: 'public' as const,
      currentPublishedVersionId: `version:${point.id}:1.0.0`,
      createdAt: CATALOGED_AT,
      updatedAt: CATALOGED_AT,
    })),
  )
}
