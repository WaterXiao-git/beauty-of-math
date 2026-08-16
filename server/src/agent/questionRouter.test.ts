import test from 'node:test'
import assert from 'node:assert/strict'

import {
  routeQuestion,
} from './questionRouter.js'

test('组合识别解释意图和导数模块', () => {
  const result = routeQuestion(
    '为什么割线逼近切线可以说明导数',
  )

  assert.equal(result.intent.primaryIntent, 'explain')
  assert.equal(result.experiments[0]?.id, 'derivative')
})

test('组合识别可视化意图和极限运算法则模块', () => {
  const result = routeQuestion(
    '动态展示极限的和差积商如何变化',
  )

  assert.equal(result.intent.primaryIntent, 'visualize')
  assert.equal(result.experiments[0]?.id, 'limit-laws')
})

test('只有知识点名称时仍然可以匹配实验', () => {
  const result = routeQuestion('罗尔定理')

  assert.equal(result.intent.primaryIntent, 'unknown')
  assert.equal(result.intent.needsAI, true)
  assert.equal(result.experiments[0]?.id, 'rolle')
})

test('无关问题没有实验候选', () => {
  const result = routeQuestion('今天天气怎么样')

  assert.equal(result.experiments.length, 0)
})

test('混合意图保留 needsAI 标记', () => {
  const result = routeQuestion(
    '画出函数图形并解释它的单调性',
  )

  assert.equal(result.intent.needsAI, true)

  const intents = result.intent.candidates.map(
    (candidate) => candidate.intent,
  )

  assert.ok(intents.includes('visualize'))
  assert.ok(intents.includes('explain'))
})

test('明确问题产生 direct 决策', () => {
  const result = routeQuestion(
    '动态演示割线逼近切线的过程',
  )

  assert.equal(result.routeDecision.decision, 'direct')
  assert.equal(result.routeDecision.target?.id, 'derivative')
})

test('返回去除实验标题干扰后的操作意图', () => {
  const result = routeQuestion('打开导数的几何意义实验')

  assert.equal(result.intent.primaryIntent, 'find-experiment')
  assert.equal(result.intent.needsAI, false)
  assert.equal(result.routeDecision.decision, 'direct')
})

test('只有知识点时产生 suggest 决策', () => {
  const result = routeQuestion('罗尔定理')

  assert.equal(result.routeDecision.decision, 'suggest')
})

test('无关问题产生 no-match 决策', () => {
  const result = routeQuestion('今天天气怎么样')

  assert.equal(result.routeDecision.decision, 'no-match')
})

test('函数图形核心词产生作图实验建议', () => {
  const result = routeQuestion('函数图形')

  assert.equal(result.experiments[0]?.id, 'graphing')
  assert.equal(result.routeDecision.decision, 'suggest')
})

test('路由结果返回拆分后的知识文本', () => {
  const result = routeQuestion(
    '请帮我比较导数和微分的图形含义',
  )

  assert.equal(result.analysis.knowledgeText, '导数和微分的图形含义')

  const candidateIds = result.experiments.map(
    (candidate) => candidate.id,
  )

  assert.ok(candidateIds.includes('derivative'))
  assert.ok(candidateIds.includes('differential'))
})

test('自研实验不从路由注入初始参数', () => {
  const result = routeQuestion(
    '打开导数实验，用割线逼近切线，令 h=0.1',
  )

  assert.equal(result.routeDecision.target?.id, 'derivative')
  assert.deepEqual(
    result.routeDecision.target?.initialParameters,
    {},
  )
})

test('微分实验不从路由注入初始参数', () => {
  const result = routeQuestion(
    '打开微分实验，展示函数增量和线性近似',
  )

  assert.equal(result.routeDecision.target?.id, 'differential')
  assert.deepEqual(
    result.routeDecision.target?.initialParameters,
    {},
  )
})
