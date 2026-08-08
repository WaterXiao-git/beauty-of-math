// 临时实验生成接口：POST /api/generate
// 输入问题 -> 返回 DynamicExperimentSpec（含服务端预采样点，可存 SessionStorage 预览）
import { Router, Request, Response } from 'express'
import { generateTempExperiment } from '../services/generateService.js'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
  try {
    const { question } = req.body ?? {}
    if (!question || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({ error: 'question is required' })
      return
    }
    const spec = await generateTempExperiment(question.trim())
    res.json(spec)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate experiment'
    console.error('Error generating experiment:', error)
    res.status(500).json({ error: message })
  }
})

export default router
