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
 * 只识别正式白名单中 8 个自研高数实验的高置信结构特征。
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
      experimentId: 'epsilon-delta',
      score: 64,
      signal: '结构:ε-δ 极限定义',
    })
  }

  if (
    /极限.*(?:和|差|积|商|四则|运算)|(?:和|差|积|商).*(?:极限|运算法则)/.test(text)
  ) {
    addHint(hints, {
      experimentId: 'limit-laws',
      score: 60,
      signal: '结构:极限四则运算',
    })
  }

  if (/两个重要极限|重要极限/.test(text)) {
    addHint(hints, {
      experimentId: 'two-important-limits',
      score: 64,
      signal: '结构:两个重要极限',
    })
  }

  if (/无穷小|趋近于零/.test(text)) {
    addHint(hints, {
      experimentId: 'infinitesimal',
      score: 60,
      signal: '结构:无穷小量',
    })
  }

  if (/割线.*切线|切线.*割线|导数.*(?:切线|割线)/.test(text)) {
    addHint(hints, {
      experimentId: 'derivative',
      score: 64,
      signal: '结构:割线逼近切线',
    })
  }

  if (/微分.*(?:线性近似|函数增量)|(?:线性近似|函数增量).*微分/.test(text)) {
    addHint(hints, {
      experimentId: 'differential',
      score: 64,
      signal: '结构:微分线性近似',
    })
  }

  if (/罗尔定理|水平切线/.test(text)) {
    addHint(hints, {
      experimentId: 'rolle',
      score: 64,
      signal: '结构:罗尔定理',
    })
  }

  if (/函数作图|函数图形|单调性|极值|凹凸性/.test(text)) {
    addHint(hints, {
      experimentId: 'graphing',
      score: 60,
      signal: '结构:函数单调性极值凹凸性',
    })
  }

  return hints
}
