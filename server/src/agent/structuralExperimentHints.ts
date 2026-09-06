import {
  normalizeQuestion,
} from './intentClassifier.js'

export interface StructuralExperimentHint {
  experimentId: string
  score: number
  signal: string
}

function addHint(
  hints: Map<string, StructuralExperimentHint>,
  hint: StructuralExperimentHint,
): void {
  const existing = hints.get(hint.experimentId)

  if (!existing || hint.score > existing.score) {
    hints.set(hint.experimentId, hint)
  }
}

/**
 * 识别十四模块自研高数实验中的高置信结构特征。
 */
export function inferStructuralExperimentHints(
  question: string,
): ReadonlyMap<string, StructuralExperimentHint> {
  const text = normalizeQuestion(question)
  const hints = new Map<string, StructuralExperimentHint>()

  if (!text) {
    return hints
  }

  if (
    /(?:ε|epsilon).*(?:δ|delta)|(?:δ|delta).*(?:ε|epsilon)|误差带|δ邻域|epsilon-delta/.test(text)
  ) {
    addHint(hints, {
      experimentId: 'hm-02-02',
      score: 64,
      signal: '结构:ε-δ 极限定义',
    })
  }

  if (
    /(?:极限的(?:和|差|积|商)|(?:和|差|积|商)的极限|极限.{0,12}(?:加减乘除|四则运算|运算法则))/.test(text)
  ) {
    addHint(hints, {
      experimentId: 'hm-02-07',
      score: 60,
      signal: '结构:极限四则运算',
    })
  }

  if (/数列.{0,8}极限|极限数列/.test(text)) {
    addHint(hints, {
      experimentId: 'hm-02-01',
      score: 60,
      signal: '结构:数列极限',
    })
  }

  if (/函数.{0,8}极限|极限函数/.test(text)) {
    addHint(hints, {
      experimentId: 'hm-02-02',
      score: 60,
      signal: '结构:函数极限',
    })
  }

  if (/两个重要极限|重要极限/.test(text)) {
    addHint(hints, {
      experimentId: 'hm-02-08',
      score: 64,
      signal: '结构:两个重要极限',
    })
  }

  if (/无穷小|趋近于零/.test(text)) {
    addHint(hints, {
      experimentId: 'hm-02-05',
      score: 60,
      signal: '结构:无穷小量',
    })
  }

  if (/割线.*切线|切线.*割线|导数.*(?:切线|割线)/.test(text)) {
    addHint(hints, {
      experimentId: 'hm-04-05',
      score: 64,
      signal: '结构:割线逼近切线',
    })
  }

  if (/微分.*(?:线性近似|函数增量)|(?:线性近似|函数增量).*微分/.test(text)) {
    addHint(hints, {
      experimentId: 'hm-04-14',
      score: 64,
      signal: '结构:微分线性近似',
    })
  }

  if (/罗尔定理|水平切线/.test(text)) {
    addHint(hints, {
      experimentId: 'hm-05-01',
      score: 64,
      signal: '结构:罗尔定理',
    })
  }

  if (/泰勒(?:展开|公式|级数)|麦克劳林(?:展开|公式|级数)/.test(text)) {
    addHint(hints, {
      experimentId: 'hm-14-08',
      score: 64,
      signal: '结构:泰勒展开',
    })
  }

  if (
    /(?:定积分|曲线下|曲线与.{0,8}围成).{0,16}面积|面积.{0,16}(?:定积分|积分)/.test(text)
  ) {
    addHint(hints, {
      experimentId: 'hm-08-01',
      score: 68,
      signal: '结构:定积分计算平面图形面积',
    })
  }

  if (/连续.{0,12}(?:但|却|不一定).{0,8}(?:不可导|不 可导)|不可导.{0,12}连续/.test(text)) {
    addHint(hints, {
      experimentId: 'hm-04-04',
      score: 60,
      signal: '结构:连续与可导关系',
    })
  }

  if (/函数作图|函数图形|单调性|极值|凹凸性/.test(text)) {
    addHint(hints, {
      experimentId: 'hm-05-11',
      score: 60,
      signal: '结构:函数单调性极值凹凸性',
    })
  }

  return hints
}
