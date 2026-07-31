import { Router } from 'express'

import {
  classifyIntent,
} from '../agent/intentClassifier.js'

import {
  routeQuestion,
} from '../agent/questionRouter.js'

const router = Router()

function readQuestion(body: unknown): string {
  if (
    typeof body === 'object' &&
    body !== null &&
    'question' in body &&
    typeof body.question === 'string'
  ) {
    return body.question.trim()
  }

  return ''
}

/**
 * 第一层：
 * 只识别用户意图。
 */
router.post('/intent', (req, res) => {
  const question = readQuestion(req.body)

  if (!question) {
    return res.status(400).json({
      error: '问题不能为空',
    })
  }

  return res.json(
    classifyIntent(question),
  )
})

/**
 * 第一层 + 第二层：
 * 识别意图并匹配实验模块。
 */
router.post('/route', (req, res) => {
  const question = readQuestion(req.body)

  if (!question) {
    return res.status(400).json({
      error: '问题不能为空',
    })
  }

  return res.json(
    routeQuestion(question),
  )
})

export default router