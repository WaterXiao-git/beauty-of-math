// 统一知识点接口：GET /api/knowledge（列表摘要）/ GET /api/knowledge/:id（完整配置）
import { Router, Request, Response } from 'express'
import { listKnowledge, getKnowledgeById } from '../services/knowledgeService.js'

const router = Router()

// 知识点列表（精简摘要：用于目录/课程导航）
router.get('/', (_req: Request, res: Response) => {
  try {
    res.json(listKnowledge())
  } catch (error) {
    console.error('Error listing knowledge:', error)
    res.status(500).json({ error: 'Failed to list knowledge points' })
  }
})

// 单个知识点完整配置（案例/参数/步骤/模板绑定）
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const config = getKnowledgeById(id)
    if (!config) {
      res.status(404).json({ error: `Knowledge point not found: ${id}` })
      return
    }
    res.json(config)
  } catch (error) {
    console.error('Error fetching knowledge point:', error)
    res.status(500).json({ error: 'Failed to fetch knowledge point' })
  }
})

export default router