import test from 'node:test'
import assert from 'node:assert/strict'

import {
  analyzeQuestion,
} from './questionAnalyzer.js'

test('拆分比较意图和多个数学知识点', () => {
  const result = analyzeQuestion(
    '请帮我比较一次函数和二次函数的图像变化',
  )

  assert.equal(
    result.knowledgeText,
    '一次函数和二次函数的图像变化',
  )
  assert.deepEqual(
    result.knowledgeTerms,
    [
      '一次函数',
      '二次函数的图像变化',
    ],
  )
  assert.ok(
    result.removedPhrases.includes('比较'),
  )
})

test('移除页面操作词并保留完整知识点', () => {
  const result = analyzeQuestion(
    '打开加减乘除可视化实验',
  )

  assert.equal(
    result.knowledgeText,
    '加减乘除',
  )
})

test('解释问句只保留知识点', () => {
  const result = analyzeQuestion(
    '什么是黎曼和',
  )

  assert.equal(
    result.knowledgeText,
    '黎曼和',
  )
  assert.deepEqual(
    result.knowledgeTerms,
    ['黎曼和'],
  )
})

test('纯知识点输入保持不变', () => {
  const result = analyzeQuestion('分数')

  assert.equal(result.knowledgeText, '分数')
  assert.deepEqual(
    result.knowledgeTerms,
    ['分数'],
  )
})

test('只有操作意图时知识文本为空', () => {
  const result = analyzeQuestion(
    '请帮我动态展示一下',
  )

  assert.equal(result.knowledgeText, '')
  assert.deepEqual(result.knowledgeTerms, [])
})
