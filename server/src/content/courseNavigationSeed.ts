import type { Chapter, KnowledgePoint } from './types.js'

const CATALOGED_AT = '2026-08-06T00:00:00.000Z'
const COURSE_ID = 'higher-mathematics-volume-1'

interface ChapterSeed {
  id: string
  parentChapterId: string | null
  code: string
  title: string
  description: string
  sortOrder: number
}

interface KnowledgePointSeed {
  id: string
  chapterId: string
  code: string
  title: string
  summary: string
  aliases: string[]
  tags: string[]
}

const chapterSeeds: ChapterSeed[] = [
  { id: 'chapter-functions-limits', parentChapterId: null, code: 'functions-limits-continuity', title: '函数、极限与连续', description: '研究函数关系、极限过程与连续性的基础章节。', sortOrder: 1 },
  { id: 'section-functions', parentChapterId: 'chapter-functions-limits', code: 'functions', title: '1.1 函数', description: '函数的概念、表示与基本性质。', sortOrder: 1 },
  { id: 'section-limits', parentChapterId: 'chapter-functions-limits', code: 'limits', title: '1.2 极限', description: '数列极限、函数极限及其运算体系。', sortOrder: 2 },
  { id: 'section-continuity', parentChapterId: 'chapter-functions-limits', code: 'continuity', title: '1.3 连续函数', description: '连续的概念与闭区间上连续函数的性质。', sortOrder: 3 },
  { id: 'chapter-derivatives', parentChapterId: null, code: 'derivatives-differentials', title: '导数与微分', description: '研究瞬时变化率和函数增量的线性近似。', sortOrder: 2 },
  { id: 'section-derivative-concept', parentChapterId: 'chapter-derivatives', code: 'derivative-concept', title: '2.1 导数的概念', description: '导数定义、几何意义和基本求导方法。', sortOrder: 1 },
  { id: 'section-differential-concept', parentChapterId: 'chapter-derivatives', code: 'differential-concept', title: '2.2 微分的概念', description: '微分的定义、几何意义与近似计算。', sortOrder: 2 },
  { id: 'chapter-mean-value-theorems', parentChapterId: null, code: 'mean-value-theorems-applications', title: '微分中值定理与导数的应用', description: '利用导数研究函数整体性质和数值迭代。', sortOrder: 3 },
  { id: 'section-differential-mvt', parentChapterId: 'chapter-mean-value-theorems', code: 'differential-mean-value-theorems', title: '3.1 微分中值定理', description: '罗尔、拉格朗日和柯西中值定理。', sortOrder: 1 },
  { id: 'section-taylor-formula', parentChapterId: 'chapter-mean-value-theorems', code: 'taylor-formula', title: '3.2 泰勒公式', description: '用多项式局部逼近光滑函数。', sortOrder: 2 },
  { id: 'section-function-graphing', parentChapterId: 'chapter-mean-value-theorems', code: 'function-graphing', title: '3.3 函数图形的描绘', description: '利用导数判断单调性、极值与凹凸性。', sortOrder: 3 },
  { id: 'section-newton-method', parentChapterId: 'chapter-mean-value-theorems', code: 'newton-method', title: '3.4 牛顿迭代法', description: '利用切线迭代求解函数零点。', sortOrder: 4 },
  { id: 'chapter-integrals', parentChapterId: null, code: 'integrals', title: '不定积分与定积分', description: '研究原函数、累积量与积分计算。', sortOrder: 4 },
  { id: 'section-indefinite-integral', parentChapterId: 'chapter-integrals', code: 'indefinite-integral', title: '4.1 不定积分', description: '原函数和不定积分的计算方法。', sortOrder: 1 },
  { id: 'section-definite-integral', parentChapterId: 'chapter-integrals', code: 'definite-integral', title: '4.2 定积分', description: '定积分定义、性质和几何应用。', sortOrder: 2 },
]

const knowledgePointSeeds: KnowledgePointSeed[] = [
  { id: 'function', chapterId: 'section-functions', code: 'function-concept', title: '函数的概念', summary: '函数描述两个变量之间的确定对应关系，由定义域、值域和对应法则共同确定。', aliases: ['函数', '函数三要素'], tags: ['函数', '代数'] },
  { id: 'function-representation', chapterId: 'section-functions', code: 'function-representation', title: '函数的表示法', summary: '函数可以通过解析式、表格和图像表示，不同表示方式描述同一个变量关系。', aliases: ['函数表示', '解析式与图像'], tags: ['函数', '图像'] },
  { id: 'function-properties', chapterId: 'section-functions', code: 'function-properties', title: '函数的性质', summary: '有界性、单调性、奇偶性和周期性刻画函数图像的整体特征。', aliases: ['单调性', '奇偶性', '周期性'], tags: ['函数', '性质'] },
  { id: 'limit-of-sequence', chapterId: 'section-limits', code: 'sequence-limit', title: '数列的极限', summary: '数列极限用 ε−N 语言严格描述数列项随项数增加而趋近确定常数的过程。', aliases: ['数列收敛', 'ε-N 定义'], tags: ['极限', '数列'] },
  { id: 'epsilon-delta', chapterId: 'section-limits', code: 'function-limit', title: '函数的极限', summary: '函数极限描述自变量趋近某点或无穷时函数值的趋近行为，是微积分的基础。', aliases: ['ε-δ 定义', '函数极限'], tags: ['微积分', '极限', '函数'] },
  { id: 'limit-laws', chapterId: 'section-limits', code: 'limit-laws', title: '极限的运算法则', summary: '在相应极限存在时，可以使用四则运算和复合运算法则计算函数极限。', aliases: ['极限运算', '极限四则运算'], tags: ['极限', '运算法则'] },
  { id: 'two-important-limits', chapterId: 'section-limits', code: 'two-important-limits', title: '两个重要极限', summary: '两个重要极限连接三角函数、指数函数与极限理论，是未定式求值的常用工具。', aliases: ['重要极限', 'sinx/x'], tags: ['极限', '指数', '三角函数'] },
  { id: 'infinitesimal', chapterId: 'section-limits', code: 'infinitesimal-infinite', title: '无穷小与无穷大', summary: '无穷小量与无穷大量用于描述变量的极限行为，等价无穷小是求极限的重要方法。', aliases: ['无穷小', '无穷大', '等价无穷小'], tags: ['极限', '无穷小'] },
  { id: 'continuity', chapterId: 'section-continuity', code: 'continuity-concept', title: '连续的概念', summary: '函数在一点连续意味着该点极限存在且等于函数值。', aliases: ['函数连续', '连续性'], tags: ['连续', '极限'] },
  { id: 'continuity-properties', chapterId: 'section-continuity', code: 'continuity-properties', title: '连续函数的性质', summary: '闭区间上的连续函数具有有界性、最值性、零点存在性和介值性。', aliases: ['介值定理', '零点定理'], tags: ['连续', '函数性质'] },
  { id: 'derivative', chapterId: 'section-derivative-concept', code: 'derivative-geometric-meaning', title: '导数', summary: '导数是函数在一点处的瞬时变化率，几何意义是曲线在该点的切线斜率。', aliases: ['导数的几何意义', '瞬时变化率'], tags: ['微积分', '导数', '切线'] },
  { id: 'differential', chapterId: 'section-differential-concept', code: 'differential', title: '微分', summary: '微分是函数增量的线性主部，可用于近似计算与误差估计。', aliases: ['函数微分', '线性主部'], tags: ['微积分', '微分'] },
  { id: 'rolle', chapterId: 'section-differential-mvt', code: 'differential-mean-value-theorem', title: '微分中值定理', summary: '微分中值定理揭示区间平均变化率与内部某点瞬时变化率之间的联系。', aliases: ['罗尔定理', '拉格朗日中值定理', '柯西中值定理'], tags: ['微积分', '中值定理', '导数'] },
  { id: 'taylor', chapterId: 'section-taylor-formula', code: 'taylor-formula', title: '泰勒公式', summary: '泰勒公式使用多项式在局部逼近光滑函数，并通过余项描述误差。', aliases: ['泰勒展开', '麦克劳林公式'], tags: ['微积分', '泰勒公式'] },
  { id: 'graphing', chapterId: 'section-function-graphing', code: 'function-graphing', title: '函数图形描绘', summary: '利用一阶和二阶导数分析函数单调性、极值、凹凸性和拐点。', aliases: ['函数作图', '导数应用'], tags: ['导数', '函数图像'] },
  { id: 'newton-method', chapterId: 'section-newton-method', code: 'newton-method', title: '牛顿迭代法', summary: '牛顿迭代法利用切线逐步逼近函数零点，是常用的数值求根方法。', aliases: ['牛顿法', '切线法'], tags: ['数值分析', '导数'] },
  { id: 'indefinite-integral', chapterId: 'section-indefinite-integral', code: 'indefinite-integral', title: '不定积分', summary: '不定积分是求原函数的运算，常用方法包括换元积分和分部积分。', aliases: ['原函数', '换元积分'], tags: ['微积分', '积分'] },
  { id: 'definite-integral', chapterId: 'section-definite-integral', code: 'definite-integral', title: '定积分', summary: '定积分是分割、近似求和再取极限的结果，可表示曲边图形的有向面积。', aliases: ['黎曼和', '牛顿莱布尼茨公式'], tags: ['微积分', '积分'] },
]

const publishedVersionIds: Readonly<Record<string, string>> = {
  'epsilon-delta': 'version:epsilon-delta:1.0.0',
  derivative: 'version:derivative:1.0.0',
  rolle: 'version:rolle:1.0.0',
}

export function createCourseNavigationChapters(): Chapter[] {
  return chapterSeeds.map((seed) => ({
    ...seed,
    courseId: COURSE_ID,
    status: 'published',
    createdAt: CATALOGED_AT,
    updatedAt: CATALOGED_AT,
  }))
}

export function createCourseNavigationKnowledgePoints(): KnowledgePoint[] {
  return knowledgePointSeeds.map((seed) => {
    const currentPublishedVersionId = publishedVersionIds[seed.id] ?? null
    return {
      ...seed,
      status: currentPublishedVersionId ? 'published' : 'cataloged',
      visibility: 'public',
      currentPublishedVersionId,
      createdAt: CATALOGED_AT,
      updatedAt: CATALOGED_AT,
    }
  })
}
