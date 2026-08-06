// 规则优先路由接口：POST /api/route
// 输入自然语言数学问题，返回意图 / 分支决策 / 候选实验 / 参数
import { Router, Request, Response } from 'express'
import { routeQuestion } from '../services/routeService.js'

const router = Router()

router.post('/', (req: Request, res: Response) => {
  try {
    const { question } = req.body ?? {}
    if (!question || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({ error: 'question is required' })
      return
    }
    const result = routeQuestion(question)
    res.json(result)
  } catch (error) {
    console.error('Error routing question:', error)
    res.status(500).json({ error: 'Failed to route question' })
  }
})

export default router