// 概念解释接口：POST /api/answer
// 输入问题，由双模型（DeepSeek 主 + Qwen 备）生成结构化解释卡片
import { Router, Request, Response } from 'express'
import { generateExplanation } from '../services/llmService.js'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
  try {
    const { question, core } = req.body ?? {}
    if (!question || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({ error: 'question is required' })
      return
    }
    const explanation = await generateExplanation(question.trim(), typeof core === 'string' ? core : '')
    res.json(explanation)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate explanation'
    console.error('Error generating explanation:', error)
    res.status(500).json({ error: message })
  }
})

export default router