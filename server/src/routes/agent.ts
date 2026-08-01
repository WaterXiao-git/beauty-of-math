import { Router } from 'express'

import {
  classifyIntent,
} from '../agent/intentClassifier.js'

import {
  routeQuestionWithAI,
} from '../agent/ai/agentCoordinator.js'

import {
  loadAgentAIConfig,
} from '../agent/ai/config.js'

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
router.post('/route', async (req, res) => {
  const question = readQuestion(req.body)

  if (!question) {
    return res.status(400).json({
      error: '问题不能为空',
    })
  }

  try {
    return res.json(
      await routeQuestionWithAI(question),
    )
  } catch {
    return res.status(500).json({
      error: '实验路由服务暂时不可用',
    })
  }
})

/**
 * 仅暴露可公开的配置状态，不返回密钥或完整环境配置。
 */
router.get('/status', (_req, res) => {
  const config = loadAgentAIConfig()

  return res.json({
    enabled: config.enabled,
    primaryModel: config.primary?.model ?? null,
    reviewerModel: config.reviewer?.model ?? null,
    tools: {
      searchExperiments: 'planned',
      createExperiment: 'planned-approval-required',
    },
  })
})

export default router
