import {
  chapters as higherMathematicsChapters,
  type CourseChapter,
  type CourseSection,
  type KnowledgePoint,
} from './courseData'

export interface UniversityCourse {
  id: string
  title: string
  subtitle: string
  chapters: CourseChapter[]
}

interface ChapterSeed {
  title: string
  sections: Array<{ title: string; points: string[] }>
}

const TEMPLATES = ['概念结构可视化', '参数联动演示', '几何关系动画', '计算过程演示']

function buildCourse(id: string, title: string, subtitle: string, seeds: ChapterSeed[]): UniversityCourse {
  const pointRows = seeds.flatMap((chapter, chapterIndex) =>
    chapter.sections.flatMap((section, sectionIndex) =>
      section.points.map((pointTitle, pointIndex) => ({
        id: `${id}-c${chapterIndex + 1}-s${sectionIndex + 1}-p${pointIndex + 1}`,
        title: pointTitle,
        chapterTitle: chapter.title,
        sectionTitle: section.title,
      })),
    ),
  )
  const indexByTitle = new Map(pointRows.map((point, index) => [point.title, index]))

  const chapters: CourseChapter[] = seeds.map((chapter, chapterIndex) => ({
    id: `${id}-c${chapterIndex + 1}`,
    title: chapter.title,
    sections: chapter.sections.map((section, sectionIndex) => ({
      id: `${id}-c${chapterIndex + 1}-s${sectionIndex + 1}`,
      title: `${chapterIndex + 1}.${sectionIndex + 1} ${section.title}`,
      points: section.points.map((pointTitle, pointIndex) => {
        const rowIndex = indexByTitle.get(pointTitle) ?? 0
        const previous = pointRows[rowIndex - 1]
        const next = pointRows[rowIndex + 1]
        const siblings = section.points.filter((titleValue) => titleValue !== pointTitle)
        const relatedTitles = [...siblings, previous?.title, next?.title]
          .filter((value): value is string => Boolean(value))
          .filter((value, index, values) => values.indexOf(value) === index)
          .slice(0, 6)
        const relatedIds = relatedTitles
          .map((titleValue) => pointRows[indexByTitle.get(titleValue) ?? -1]?.id)
          .filter((value): value is string => Boolean(value))

        return {
          id: `${id}-c${chapterIndex + 1}-s${sectionIndex + 1}-p${pointIndex + 1}`,
          title: pointTitle,
          status: rowIndex === 0 ? 'learning' : 'not-started',
          previewLevel: chapterIndex === 0 ? 'A' : chapterIndex < 3 ? 'B' : 'C',
          template: TEMPLATES[(chapterIndex + sectionIndex) % TEMPLATES.length],
          summary: `${pointTitle}是${title}中“${chapter.title}”模块的核心知识点，重点理解其定义、数学结构、典型计算方法，以及它与${relatedTitles.slice(0, 2).join('、') || section.title}之间的联系。`,
          goals: [
            `准确表述${pointTitle}的定义与适用条件`,
            `能够用图形、符号或算法解释${pointTitle}`,
            `能够运用${pointTitle}解决本课程的典型问题`,
          ],
          related: relatedTitles,
          relatedIds,
          prerequisiteIds: previous ? [previous.id] : [],
        } satisfies KnowledgePoint
      }),
    })),
  }))

  return { id, title, subtitle, chapters }
}

const basicMathematics = buildCourse('basic-mathematics', '基础数学与函数', '代数基础 · 函数 · 数列 · 三角与复数', [
  { title: '代数基础', sections: [
    { title: '集合与逻辑', points: ['集合运算', '命题与量词'] },
    { title: '方程与不等式', points: ['方程组', '不等式与绝对值'] },
  ] },
  { title: '函数及其图像', sections: [
    { title: '函数模型', points: ['函数的定义域与值域', '复合函数与反函数'] },
    { title: '函数变换', points: ['平移伸缩与对称', '单调性与奇偶性'] },
  ] },
  { title: '数列与级数基础', sections: [
    { title: '常见数列', points: ['等差数列', '等比数列'] },
    { title: '有限求和', points: ['递推关系', '数学归纳法'] },
  ] },
  { title: '三角与复数', sections: [
    { title: '三角函数', points: ['单位圆与三角函数', '和差公式'] },
    { title: '复数', points: ['复平面', '欧拉公式与棣莫弗公式'] },
  ] },
])

const linearAlgebra = buildCourse('linear-algebra', '线性代数', '矩阵 · 向量空间 · 线性变换 · 谱分解', [
  { title: '矩阵与线性方程组', sections: [
    { title: '矩阵运算', points: ['矩阵及其运算', '初等变换'] },
    { title: '线性方程组', points: ['高斯消元法', '解的存在性与结构'] },
  ] },
  { title: '行列式与矩阵分解', sections: [
    { title: '行列式', points: ['行列式的定义', '行列式的性质'] },
    { title: '矩阵分解', points: ['逆矩阵与伴随矩阵', 'LU 分解'] },
  ] },
  { title: '向量空间与线性变换', sections: [
    { title: '向量空间', points: ['线性相关与线性无关', '基、维数与坐标'] },
    { title: '线性映射', points: ['线性变换', '核与像'] },
  ] },
  { title: '特征值与正交性', sections: [
    { title: '谱理论', points: ['特征值与特征向量', '矩阵对角化'] },
    { title: '内积空间', points: ['正交投影', 'Gram-Schmidt 正交化'] },
  ] },
])

const probability = buildCourse('probability-statistics', '概率论与数理统计', '随机现象 · 分布 · 极限定理 · 统计推断', [
  { title: '概率基础', sections: [
    { title: '随机事件', points: ['样本空间与事件', '概率公理'] },
    { title: '条件概率', points: ['条件概率与独立性', '全概率公式与贝叶斯公式'] },
  ] },
  { title: '随机变量及其分布', sections: [
    { title: '一维随机变量', points: ['离散型随机变量', '连续型随机变量'] },
    { title: '数字特征', points: ['数学期望', '方差与协方差'] },
  ] },
  { title: '多维分布与极限定理', sections: [
    { title: '多维随机变量', points: ['联合分布与边缘分布', '条件分布'] },
    { title: '概率极限', points: ['大数定律', '中心极限定理'] },
  ] },
  { title: '数理统计', sections: [
    { title: '参数估计', points: ['点估计', '区间估计'] },
    { title: '假设检验', points: ['显著性检验', '回归与相关分析'] },
  ] },
])

const discreteMathematics = buildCourse('discrete-number-theory', '离散数学与数论', '逻辑 · 组合 · 图论 · 初等数论', [
  { title: '数理逻辑与集合', sections: [
    { title: '命题逻辑', points: ['命题联结词', '等值演算与范式'] },
    { title: '关系与映射', points: ['集合与关系', '等价关系与偏序关系'] },
  ] },
  { title: '组合数学', sections: [
    { title: '计数原理', points: ['排列与组合', '容斥原理'] },
    { title: '递推与生成函数', points: ['递推关系', '生成函数'] },
  ] },
  { title: '图论', sections: [
    { title: '图的结构', points: ['图、路与连通性', '树与生成树'] },
    { title: '图算法', points: ['最短路径', '匹配与网络流'] },
  ] },
  { title: '初等数论', sections: [
    { title: '整除理论', points: ['最大公因数与欧几里得算法', '同余与中国剩余定理'] },
    { title: '数论应用', points: ['素数与算术基本定理', 'RSA 公钥密码'] },
  ] },
])

const numericalAnalysis = buildCourse('numerical-optimization', '数值分析与优化', '误差 · 数值计算 · 线性代数算法 · 最优化', [
  { title: '误差与非线性方程', sections: [
    { title: '数值误差', points: ['误差、有效数字与稳定性', '条件数'] },
    { title: '方程求根', points: ['二分法与不动点迭代', '牛顿法与割线法'] },
  ] },
  { title: '插值、拟合与逼近', sections: [
    { title: '插值', points: ['拉格朗日插值', '分段插值与样条'] },
    { title: '函数逼近', points: ['最小二乘拟合', '正交多项式逼近'] },
  ] },
  { title: '数值积分与线性方程组', sections: [
    { title: '数值积分', points: ['牛顿-柯特斯公式', '高斯求积'] },
    { title: '线性系统', points: ['直接法与矩阵分解', '雅可比与高斯-赛德尔迭代'] },
  ] },
  { title: '最优化方法', sections: [
    { title: '无约束优化', points: ['梯度下降法', '牛顿优化法'] },
    { title: '约束优化', points: ['拉格朗日乘子法', 'KKT 条件'] },
  ] },
])

const analyticGeometry = buildCourse('geometry-topology', '解析几何与拓扑', '向量几何 · 二次曲线 · 曲面 · 拓扑结构', [
  { title: '空间向量与坐标', sections: [
    { title: '向量几何', points: ['向量的点积与叉积', '直线与平面'] },
    { title: '坐标变换', points: ['仿射坐标变换', '旋转与正交变换'] },
  ] },
  { title: '二次曲线与曲面', sections: [
    { title: '圆锥曲线', points: ['椭圆、双曲线与抛物线', '二次曲线标准化'] },
    { title: '二次曲面', points: ['椭球面与双曲面', '柱面与旋转曲面'] },
  ] },
  { title: '曲线与曲面几何', sections: [
    { title: '参数曲线', points: ['曲线的切向量', '曲率与挠率'] },
    { title: '参数曲面', points: ['切平面与法向量', '第一基本形式'] },
  ] },
  { title: '拓扑基础', sections: [
    { title: '拓扑空间', points: ['开集、闭集与邻域', '连续映射与同胚'] },
    { title: '全局性质', points: ['连通性与紧致性', '欧拉示性数'] },
  ] },
])

const appliedDynamics = buildCourse('applied-dynamics', '应用数学与动力系统', '微分方程 · 相图 · 混沌 · 数学建模', [
  { title: '常微分方程', sections: [
    { title: '一阶方程', points: ['可分离变量方程', '一阶线性方程'] },
    { title: '高阶方程', points: ['二阶线性方程', '线性方程组'] },
  ] },
  { title: '动力系统', sections: [
    { title: '相平面', points: ['平衡点与稳定性', '相图与零流线'] },
    { title: '分岔', points: ['一维分岔', '极限环与 Hopf 分岔'] },
  ] },
  { title: '非线性与混沌', sections: [
    { title: '离散动力系统', points: ['Logistic 映射', '倍周期分岔'] },
    { title: '混沌特征', points: ['Lyapunov 指数', '奇异吸引子'] },
  ] },
  { title: '数学建模', sections: [
    { title: '传播与增长', points: ['种群增长模型', '传染病 SIR 模型'] },
    { title: '连续介质模型', points: ['热传导方程', '波动方程'] },
  ] },
])

const higherMathematics: UniversityCourse = {
  id: 'higher-mathematics',
  title: '高等数学',
  subtitle: '函数 · 极限 · 微分 · 积分',
  chapters: higherMathematicsChapters,
}

export const courses: UniversityCourse[] = [
  higherMathematics,
  linearAlgebra,
  probability,
  discreteMathematics,
  numericalAnalysis,
  analyticGeometry,
  appliedDynamics,
  basicMathematics,
]

export const DEFAULT_COURSE_ID = higherMathematics.id

export function collectCoursePoints(course: UniversityCourse): KnowledgePoint[] {
  return course.chapters.flatMap((chapter) => chapter.sections.flatMap((section) => section.points))
}

export function findCourse(courseId: string | null | undefined): UniversityCourse {
  return courses.find((course) => course.id === courseId) ?? higherMathematics
}

export function findCourseOfPoint(pointId: string): UniversityCourse | undefined {
  return courses.find((course) => collectCoursePoints(course).some((point) => point.id === pointId || point.demoId === pointId))
}

export function findPointAcrossCourses(pointId: string): KnowledgePoint | undefined {
  for (const course of courses) {
    const point = collectCoursePoints(course).find((candidate) =>
      candidate.id === pointId || candidate.demoId === pointId || candidate.experimentPath === pointId,
    )
    if (point) return point
  }
  return undefined
}

export function findSectionInCourse(course: UniversityCourse, pointId: string): CourseSection | undefined {
  return course.chapters.flatMap((chapter) => chapter.sections).find((section) =>
    section.points.some((point) => point.id === pointId || point.demoId === pointId),
  )
}

export function findChapterInCourse(course: UniversityCourse, pointId: string): CourseChapter | undefined {
  return course.chapters.find((chapter) => chapter.sections.some((section) =>
    section.points.some((point) => point.id === pointId || point.demoId === pointId),
  ))
}

/** 按关联与先修边做最多两层广度遍历，为知识地图提供稳定的邻接节点。 */
export function collectRelatedPoints(course: UniversityCourse, source: KnowledgePoint, depth = 2, limit = 6): KnowledgePoint[] {
  const points = collectCoursePoints(course)
  const byId = new Map(points.map((point) => [point.id, point]))
  const byTitle = new Map(points.map((point) => [point.title, point]))
  const result: KnowledgePoint[] = []
  const seen = new Set([source.id])
  let frontier: KnowledgePoint[] = [source]

  for (let level = 0; level < depth && frontier.length > 0 && result.length < limit; level += 1) {
    const next: KnowledgePoint[] = []
    for (const point of frontier) {
      const neighbors = [
        ...(point.relatedIds ?? []).map((id) => byId.get(id)),
        ...(point.prerequisiteIds ?? []).map((id) => byId.get(id)),
        ...point.related.map((title) => byTitle.get(title)),
      ].filter((candidate): candidate is KnowledgePoint => Boolean(candidate))
      for (const candidate of neighbors) {
        if (seen.has(candidate.id)) continue
        seen.add(candidate.id)
        result.push(candidate)
        next.push(candidate)
        if (result.length >= limit) break
      }
      if (result.length >= limit) break
    }
    frontier = next
  }
  return result
}
