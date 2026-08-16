import {
  normalizeQuestion,
} from './intentClassifier.js'

export interface QuestionAnalysisResult {
  originalText: string
  normalizedText: string
  knowledgeText: string
  knowledgeTerms: string[]
  removedPhrases: string[]
}

interface ExtractionRule {
  pattern: RegExp
}

/**
 * 只移除明确表达操作或界面动作的短语，
 * 不删除“函数”“方程”“原理”等可能属于知识点的词。
 */
const EXTRACTION_RULES: readonly ExtractionRule[] = [
  { pattern: /(?:请|麻烦)?帮我/g },
  { pattern: /(?:我)?想(?:看|学|了解)/g },

  {
    pattern:
      /(?:打开|进入|跳转到?|找到|查找|搜索|推荐)(?:一下)?/g,
  },
  {
    pattern:
      /(?:实验页面|实验模块|实验|模块|页面)/g,
  },

  {
    pattern:
      /(?:动态演示|动态展示|可视化|演示一下|展示一下|演示|展示|画出|绘制|作图|模拟一下|模拟|观察一下|观察)/g,
  },
  {
    pattern:
      /(?:怎么理解|如何理解|什么是|为什么|解释一下|解释|讲解一下|讲解|说明一下|说明)/g,
  },
  {
    pattern:
      /(?:计算一下|计算|求出|求解|算一下|解方程)/g,
  },
  {
    pattern:
      /(?:有什么区别|有何区别|比较一下|比较|对比一下|对比)/g,
  },

  { pattern: /(?:相关的|对应的|请|一下)/g },
]

const KNOWLEDGE_TERM_SEPARATOR =
  /(?:\s*(?:以及|还有|、|vs\.?|versus)\s*|(?<=.{2})\s*[和与]\s*(?=.{2}))/iu

function addUniquePhrase(
  phrases: string[],
  value: string,
): void {
  const normalizedValue = value.trim()

  if (
    normalizedValue &&
    !phrases.includes(normalizedValue)
  ) {
    phrases.push(normalizedValue)
  }
}

/**
 * 从自然语言问题中拆出用于实验检索的数学知识文本。
 *
 * 意图分类仍然读取完整问题；知识文本只用于语义召回，
 * 因而不会因为移除“比较”“展示”等词丢失用户操作意图。
 */
export function analyzeQuestion(
  question: string,
): QuestionAnalysisResult {
  const normalizedText = normalizeQuestion(question)
  const removedPhrases: string[] = []
  let knowledgeText = normalizedText

  for (const rule of EXTRACTION_RULES) {
    knowledgeText = knowledgeText.replace(
      rule.pattern,
      (matchedPhrase) => {
        addUniquePhrase(
          removedPhrases,
          matchedPhrase,
        )

        return ' '
      },
    )
  }

  knowledgeText = knowledgeText
    .replace(/\s+/g, ' ')
    .trim()

  const knowledgeTerms = Array.from(
    new Set(
      knowledgeText
        .split(KNOWLEDGE_TERM_SEPARATOR)
        .map((term) => term.trim())
        .filter((term) => term.length >= 2),
    ),
  )

  return {
    originalText: question,
    normalizedText,
    knowledgeText,
    knowledgeTerms,
    removedPhrases,
  }
}
