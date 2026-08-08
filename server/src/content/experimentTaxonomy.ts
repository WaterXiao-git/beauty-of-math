import { ALL_EXPERIMENT_MANIFESTS } from '../agent/manifests/allExperimentManifests.js'
import type { ExperimentKind } from '../agent/manifests/experimentManifest.js'
import { EXPERIMENT_MANIFEST } from '../data/experimentManifest.js'

export interface ExperimentTaxonomyMeta {
  id: string
  path: string
  title: string
  description: string
  difficulty: string
  topics: string[]
  tags: string[]
  keywords: string[]
  prerequisites: string[]
  hasAnimation: boolean
  hasSteps: boolean
  courseId: string
  courseName: string
  chapterId: string
  chapterName: string
  knowledgePointIds: string[]
  knowledgePointNames: string[]
}

export interface ExperimentTaxonomyNode {
  id: string
  name: string
  count: number
}

export interface ExperimentCourseNode extends ExperimentTaxonomyNode {
  chapterCount: number
}

export interface ExperimentChapterNode extends ExperimentTaxonomyNode {
  courseId: string
}

export interface ExperimentKnowledgePointNode extends ExperimentTaxonomyNode {
  courseId: string
  chapterId: string
}

const COURSE_NAMES: Record<string, string> = {
  foundational: '基础数学与函数',
  calculus: '高等数学',
  'linear-algebra': '线性代数',
  probability: '概率论与数理统计',
  discrete: '离散数学与数论',
  geometry: '解析几何与拓扑',
  numerical: '数值分析与优化',
  applied: '应用数学与动力系统',
}

const KIND_NAMES: Record<ExperimentKind, string> = {
  'function-graph': '函数与图像',
  'calculus-concept': '微积分概念',
  'integral-estimation': '积分与数值积分',
  geometry: '几何结构',
  transformation: '线性变换',
  'sequence-series': '数列与级数',
  'probability-statistics': '概率与统计',
  'linear-algebra': '矩阵与线性代数',
  'differential-equation': '微分方程',
  simulation: '随机模拟',
  'numerical-method': '数值方法',
  algebra: '代数',
  'number-theory': '数论',
  'discrete-math': '离散结构与算法',
  optimization: '优化方法',
  'signal-processing': '信号处理',
  'dynamical-system': '动力系统',
  topology: '拓扑结构',
  cryptography: '密码学',
  concept: '数学概念与应用',
  custom: '综合数学实验',
}

const TOPIC_NAMES: Record<string, string> = {
  algebra: '代数基础',
  geometry: '几何与空间',
  applied: '数学建模与应用',
  calculus: '微积分',
  'linear-algebra': '矩阵与向量',
  analysis: '数学分析',
  probability: '概率统计',
  discrete: '离散结构',
}

function courseIdFor(kind: ExperimentKind, topics: readonly string[]): string {
  if (kind === 'linear-algebra' || kind === 'transformation') return 'linear-algebra'
  if (kind === 'probability-statistics') return 'probability'
  if (kind === 'number-theory' || kind === 'discrete-math' || kind === 'cryptography') return 'discrete'
  if (kind === 'geometry' || kind === 'topology') return 'geometry'
  if (kind === 'numerical-method' || kind === 'optimization') return 'numerical'
  if (kind === 'calculus-concept' || kind === 'integral-estimation' || kind === 'differential-equation') return 'calculus'
  if (kind === 'signal-processing' || kind === 'dynamical-system') return 'applied'
  if (kind === 'simulation') return topics.includes('probability') ? 'probability' : 'applied'
  if (kind === 'function-graph' || kind === 'sequence-series' || kind === 'algebra') return 'foundational'

  if (topics.includes('linear-algebra')) return 'linear-algebra'
  if (topics.includes('probability')) return 'probability'
  if (topics.includes('calculus') || topics.includes('analysis')) return 'calculus'
  if (topics.includes('geometry')) return 'geometry'
  if (topics.includes('discrete')) return 'discrete'
  if (topics.includes('algebra')) return 'foundational'
  return 'applied'
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}

const catalogByPath = new Map(
  EXPERIMENT_MANIFEST.map((experiment) => [experiment.path, experiment]),
)

export const EXPERIMENT_TAXONOMY: readonly ExperimentTaxonomyMeta[] =
  ALL_EXPERIMENT_MANIFESTS.map((experiment) => {
    const catalog = catalogByPath.get(experiment.path)
    if (!catalog) {
      throw new Error(`实验目录缺少路径：${experiment.path}`)
    }

    const courseId = courseIdFor(experiment.agent.kind, experiment.topics)
    const chapterId = `${courseId}:${experiment.agent.kind}`
    const primaryTopic = experiment.topics[0] ?? experiment.agent.kind
    const knowledgePointId = `${chapterId}:${primaryTopic}`

    return {
      id: experiment.id,
      path: experiment.path,
      title: experiment.title,
      description: experiment.description,
      difficulty: catalog.difficulty,
      topics: [...experiment.topics],
      tags: unique([
        ...experiment.topics,
        KIND_NAMES[experiment.agent.kind],
        TOPIC_NAMES[primaryTopic] ?? primaryTopic,
      ]),
      keywords: unique([
        ...experiment.agent.aliases,
        ...experiment.agent.strongPhrases,
        ...experiment.agent.keywords,
      ]),
      prerequisites: [],
      hasAnimation: catalog.hasAnimation,
      hasSteps: catalog.hasSteps,
      courseId,
      courseName: COURSE_NAMES[courseId],
      chapterId,
      chapterName: KIND_NAMES[experiment.agent.kind],
      knowledgePointIds: [knowledgePointId],
      knowledgePointNames: [TOPIC_NAMES[primaryTopic] ?? KIND_NAMES[experiment.agent.kind]],
    }
  })

function countBy<T extends { id: string; name: string }>(items: readonly T[]): ExperimentTaxonomyNode[] {
  const counts = new Map<string, ExperimentTaxonomyNode>()
  for (const item of items) {
    const current = counts.get(item.id)
    counts.set(item.id, {
      id: item.id,
      name: item.name,
      count: (current?.count ?? 0) + 1,
    })
  }
  return [...counts.values()].sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'))
}

export function getExperimentTaxonomyFacets() {
  const chapters = countBy(
    EXPERIMENT_TAXONOMY.map((item) => ({
      id: item.chapterId,
      name: item.chapterName,
    })),
  ).map((chapter): ExperimentChapterNode => ({
    ...chapter,
    courseId: EXPERIMENT_TAXONOMY.find((item) => item.chapterId === chapter.id)!.courseId,
  }))

  const courses = countBy(
    EXPERIMENT_TAXONOMY.map((item) => ({
      id: item.courseId,
      name: item.courseName,
    })),
  ).map((course): ExperimentCourseNode => ({
    ...course,
    chapterCount: chapters.filter((chapter) => chapter.courseId === course.id).length,
  }))

  const knowledgePoints = countBy(
    EXPERIMENT_TAXONOMY.map((item) => ({
      id: item.knowledgePointIds[0],
      name: item.knowledgePointNames[0],
    })),
  ).map((point): ExperimentKnowledgePointNode => {
    const experiment = EXPERIMENT_TAXONOMY.find((item) => item.knowledgePointIds[0] === point.id)!
    return {
      ...point,
      courseId: experiment.courseId,
      chapterId: experiment.chapterId,
    }
  })

  return {
    courses,
    chapters,
    knowledgePoints,
    unclassifiedCount: EXPERIMENT_TAXONOMY.filter((item) => !item.courseId).length,
  }
}
