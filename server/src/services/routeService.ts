// ============================================================================
// 规则优先路由核心（架构图第 3 层「本地路由核心」）
// 数学意图识别 + 300 实验 Manifest 召回（自研规则评分：子串/包含/拼音/公共子串）
// + 候选评分 + 参数提取。核心设计：能明确命中实验则完全不调用大模型（AI）。
// 注：Fuse.js 7.5 对中文/拉丁串 score 恒为 1.0（返回全部不匹配），故弃用，
//     改由可解释的规则评分（规则优先原则）。
// ============================================================================
import { pinyin } from 'pinyin-pro'
import { EXPERIMENT_MANIFEST } from '../data/experimentManifest.js'
import type { ExperimentManifestItem } from '../data/experimentManifest.js'

export type IntentType = 'draw' | 'calculate' | 'explain' | 'demo' | 'find'
export type RouteBranch = 'direct' | 'suggest' | 'answer' | 'ai' | 'no-match'

export interface RouteMatch {
  path: string
  title: string
  /** 置信度 0-1 */
  score: number
  /** 命中方式：exact 精确 / include 包含 / pinyin 拼音 / lcs 公共子串 / desc 描述 */
  matchedBy: string
}

export interface RouteResult {
  question: string
  intent: IntentType
  branch: RouteBranch
  confidence: number
  matches: RouteMatch[]
  params: Record<string, number>
  reason: string
}

// ---------- 意图识别（关键词规则） ----------
const INTENT_RULES: { intent: IntentType; keywords: string[] }[] = [
  { intent: 'draw', keywords: ['画', '绘制', 'plot', '图形', '图像', '曲线', '几何'] },
  { intent: 'calculate', keywords: ['计算', '求', '多少', '值', '求导', '导数', '积分', '求和', '方程'] },
  { intent: 'explain', keywords: ['什么是', '是什么', '为什么', '解释', '说明', '概念', '理解', '区别', '定义', '原理', '意义', '怎么理解'] },
  { intent: 'demo', keywords: ['演示', '实验', '试试', '可视化', '交互', '展示'] },
]

export function detectIntent(question: string): IntentType {
  const counts = new Map<IntentType, number>()
  for (const rule of INTENT_RULES) {
    const hit = rule.keywords.filter((kw) => question.toLowerCase().includes(kw)).length
    if (hit > 0) counts.set(rule.intent, hit)
  }
  if (counts.size === 0) return 'find'
  const priority: IntentType[] = ['draw', 'calculate', 'explain', 'demo']
  for (const p of priority) {
    if (counts.get(p) === Math.max(...counts.values())) return p
  }
  return 'find'
}

// ---------- 核心词提取（只删引导短语，保留中文字符序列） ----------
const STOP_PHRASES = [
  '演示一下', '画一下', '画出', '画一个', '什么是', '是什么', '为什么', '解释一下', '解释说明',
  '计算一下', '求一下', '怎么理解', '如何理解', '等于多少', '是多少', '展示一下',
  '能不能', '帮我', '请', '试试', '可视化', '演示', '画', '计算', '求', '解释', '展示',
].sort((a, b) => b.length - a.length)

/** 常见英文数学术语 -> 中文（用于英文提问的召回） */
const ENGLISH_MAP: [string, string][] = [
  ['golden ratio', '黄金分割'],
  ['fourier transform', '傅里叶变换'],
  ['monte carlo', '蒙特卡洛'],
  ['fourier', '傅里叶'],
  ['bayes', '贝叶斯'],
  ['taylor', '泰勒'],
  ['newton', '牛顿'],
  ['polar', '极坐标'],
  ['fractal', '分形'],
  ['sine', '正弦'],
  ['cosine', '余弦'],
  ['clt', '中心极限'],
  ['graph', '图论'],
  ['plot', '绘制'],
]

/** 提取字符串中最长的连续中文字符串（>=2 字） */
export function extractCoreTerms(question: string): string {
  let core = question
  for (const phrase of STOP_PHRASES) {
    core = core.split(phrase).join(' ')
  }
  core = core.replace(/\d+/g, ' ').replace(/[^\u4e00-\u9fa5]+/g, ' ')
  const runs = core.match(/[\u4e00-\u9fa5]{2,}/g)
  if (!runs || runs.length === 0) return ''
  return runs.sort((a, b) => b.length - a.length)[0]
}

/** 最长公共子串长度 */
function longestCommonSubstr(a: string, b: string): number {
  let best = 0
  const short = a.length <= b.length ? a : b
  const long = a.length <= b.length ? b : a
  for (let i = 0; i < short.length; i++) {
    for (let j = i + 2; j <= short.length; j++) {
      if (j - i <= best) continue
      if (long.includes(short.slice(i, j))) best = j - i
    }
  }
  return best
}

// ---------- 知识点路由（统一演示页，架构图分支 A/B 的知识点入口） ----------
const KNOWLEDGE_ROUTES: { keywords: string[]; pointId: string; title: string }[] = [
  { keywords: ['函数的极限', '极限', 'epsilon', 'ε'], pointId: 'limit-of-function', title: '函数的极限（ε−δ 定义）' },
  { keywords: ['导数', '微分', '切线', '斜率'], pointId: 'derivative', title: '导数的几何意义' },
  { keywords: ['罗尔', '中值定理'], pointId: 'mean-value-theorem', title: '罗尔定理' },
]
// ---------- 参数提取（基础规则：变量 = 数字） ----------
export function extractParams(question: string): Record<string, number> {
  const params: Record<string, number> = {}
  const regex = /([a-zA-Z])\s*=\s*(-?\d+(?:\.\d+)?)/g
  let m: RegExpExecArray | null
  while ((m = regex.exec(question)) !== null) {
    const key = m[1]
    const value = parseFloat(m[2])
    if (!Number.isNaN(value) && !(key in params)) params[key] = value
  }
  return params
}

// ---------- 自研规则评分（候选 = 全量扫描 300 条 Manifest） ----------
interface IndexedItem extends ExperimentManifestItem {
  pinyinFull: string
  pinyinAbbr: string
}

let indexedItems: IndexedItem[] | null = null

function buildIndex() {
  if (indexedItems) return
  indexedItems = EXPERIMENT_MANIFEST.map((item) => {
    const syllables = pinyin(item.title, { toneType: 'none', type: 'array' }) as string[]
    return {
      ...item,
      pinyinFull: syllables.join(''),
      pinyinAbbr: syllables.map((s) => s[0] ?? '').join(''),
    }
  })
}

function scoreItem(item: IndexedItem, core: string, question: string): { score: number; matchedBy: string } | null {
  const title = item.title
  // 1. 标题精确等于核心词
  if (core && title === core) return { score: 1, matchedBy: 'exact' }
  // 2. 标题包含核心词（主题词直接命中）
  if (core && title.includes(core) && core.length >= 2) return { score: 0.92, matchedBy: 'include' }
  // 3. 核心词包含标题（短标题是核心词的组成部分，如「函数」之于「函数的极限」）
  if (core && core.includes(title) && title.length >= 2) return { score: 0.78, matchedBy: 'include' }

  // 4. 拼音匹配（中文 query 转全拼/首字母）
  const corePinyin = core ? pinyin(core, { toneType: 'none', type: 'array' }).join('') : ''
  if (corePinyin) {
    if (item.pinyinFull === corePinyin) return { score: 1, matchedBy: 'pinyin' }
    if (item.pinyinFull.includes(corePinyin)) return { score: 0.85, matchedBy: 'pinyin' }
    const abbr = pinyin(core, { toneType: 'none', type: 'array' }).map((s: string) => s[0] ?? '').join('')
    if (abbr.length >= 3 && item.pinyinAbbr.includes(abbr)) return { score: 0.7, matchedBy: 'pinyin' }
  }

  // 5. 最长公共子串覆盖标题比例（模糊但可解释）
  if (core) {
    const lcs = longestCommonSubstr(core, title)
    if (lcs >= 2) {
      const ratio = lcs / title.length
      const s = Math.min(0.75, 0.4 + ratio * 0.35)
      return { score: s, matchedBy: 'lcs' }
    }
  }

  // 6. 描述包含核心词
  if (core && core.length >= 2 && item.description.includes(core)) return { score: 0.55, matchedBy: 'desc' }

  // 7. 英文 query 直接匹配标题（fourier → fourier 系列）
  const qLower = question.toLowerCase()
  if (/^[a-z0-9 ]+$/.test(qLower.trim()) && title.toLowerCase().includes(qLower.trim())) {
    return { score: 0.85, matchedBy: 'include' }
  }
  return null
}

// ---------- 主路由 ----------
export function routeQuestion(question: string): RouteResult {
  // 英文术语映射为中文后再路由
  let q = question.trim()
  const qLower = q.toLowerCase()
  for (const [en, zh] of ENGLISH_MAP) {
    if (qLower.includes(en)) {
      q = q.replace(new RegExp(en, 'i'), zh)
      break
    }
  }
  if (!q) {
    return { question, intent: 'find', branch: 'no-match', confidence: 0, matches: [], params: {}, reason: '问题为空' }
  }

  const intent = detectIntent(q)
  const params = extractParams(q)
  buildIndex()

  const core = extractCoreTerms(q)

  // 知识点优先：核心词命中知识点（短关键词包含，最长匹配优先）-> 路由到统一演示页
  let knowledgeHit: { pointId: string; title: string } | undefined
  let bestKwLen = 0
  if (core) {
    for (const k of KNOWLEDGE_ROUTES) {
      for (const kw of k.keywords) {
        if (core.includes(kw) && kw.length > bestKwLen) {
          bestKwLen = kw.length
          knowledgeHit = k
        }
      }
    }
  }

  // 全量扫描评分
  const matches: RouteMatch[] = []
  for (const item of indexedItems!) {
    const r = scoreItem(item, core, q)
    if (r) matches.push({ path: item.path, title: item.title, score: Math.round(r.score * 100) / 100, matchedBy: r.matchedBy })
  }
  matches.sort((a, b) => b.score - a.score)

  // 知识点命中：视为高置信 direct（进入统一演示页）
  if (knowledgeHit) {
    matches.unshift({ path: `/demo/${knowledgeHit.pointId}`, title: knowledgeHit.title, score: 1, matchedBy: 'knowledge' })
  }

  const top = matches[0]
  const topScore = top?.score ?? 0

  // 分支决策（架构图第 4 层）
  let branch: RouteBranch
  let reason: string
  if (top && topScore >= 0.85) {
    branch = 'direct'
    reason = `高置信命中实验「${top.title}」（置信度 ${(topScore * 100).toFixed(0)}%），直接加载`
  } else if (top && topScore >= 0.6) {
    branch = 'suggest'
    reason = `中置信候选「${top.title}」（置信度 ${(topScore * 100).toFixed(0)}%），请用户确认`
  } else if (intent === 'explain') {
    branch = 'answer'
    reason = '识别为概念解释类问题，交由大模型生成结构化解释卡片'
  } else if (top) {
    branch = 'ai'
    reason = '未高置信命中，触发受约束生成：本地模板优先 + 大模型生成配置'
  } else {
    branch = 'no-match'
    reason = '未命中任何实验且不适合可视化，说明原因并提供替代学习路径'
  }

  return {
    question: q,
    intent,
    branch,
    confidence: topScore,
    matches: matches.slice(0, 5),
    params,
    reason,
  }
}