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

import {
  DynamicExperimentGenerationError,
  generateDynamicExperiment,
} from '../agent/dynamicExperiment/generator.js'

import {
  isGeneratableMathExperimentRequest,
} from '../agent/mathDomainGuard.js'

import {
  routeQuestion,
} from '../agent/questionRouter.js'

const router = Router()

const generationRequestTimes = new Map<string, number>()
const GENERATION_COOLDOWN_MS = 3_000

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
    const result = await routeQuestionWithAI(question)

    return res.json({
      ...result,
      generationAllowed:
        isGeneratableMathExperimentRequest(
          question,
          result.experiments,
        ),
    })
  } catch {
    return res.status(500).json({
      error: '实验路由服务暂时不可用',
    })
  }
})

/**
 * 用户明确确认后，生成仅在当前浏览器预览的临时实验配置。
 * 不写文件、不注册永久路由；通用绘图代码只在前端隔离画布中运行。
 */
router.post('/generate', async (req, res) => {
  const question = readQuestion(req.body)

  if (!question) {
    return res.status(400).json({
      error: '问题不能为空',
    })
  }

  if (question.length > 500) {
    return res.status(400).json({
      error: '问题过长，请控制在 500 个字符以内',
    })
  }

  const ruleResult = routeQuestion(question)

  if (
    !isGeneratableMathExperimentRequest(
      question,
      ruleResult.experiments,
    )
  ) {
    return res.status(422).json({
      error: '只能为数学教学相关问题生成临时实验',
    })
  }

  const clientKey = req.ip || 'unknown'
  const now = Date.now()
  const lastRequest =
    generationRequestTimes.get(clientKey) ?? 0

  if (now - lastRequest < GENERATION_COOLDOWN_MS) {
    return res.status(429).json({
      error: '动态实验生成请求过于频繁，请稍后再试',
    })
  }

  generationRequestTimes.set(clientKey, now)

  try {
    return res.json(
      await generateDynamicExperiment(question),
    )
  } catch (error) {
    if (
      error instanceof DynamicExperimentGenerationError
    ) {
      return res.status(
        error.code === 'not-configured' ? 503 : 422,
      ).json({
        error: error.message,
      })
    }

    return res.status(500).json({
      error: '动态实验生成服务暂时不可用',
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
      createExperiment: 'available-preview-approval-required',
    },
  })
})

export default router
