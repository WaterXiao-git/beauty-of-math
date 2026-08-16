import { Router } from 'express'

import {
  getPublishedCourseTree,
  getPublishedKnowledgePoint,
  getPublishedKnowledgePointVersion,
  listPublishedCourses,
  listPublishedKnowledgePointVersions,
} from '../services/contentCatalogService.js'

const router = Router()

router.get('/courses', (_req, res) => {
  res.json(listPublishedCourses())
})

router.get('/courses/:courseId/tree', (req, res) => {
  const tree = getPublishedCourseTree(
    String(req.params.courseId),
  )

  if (!tree) {
    res.status(404).json({
      error: 'Published course not found',
    })
    return
  }

  res.json(tree)
})

router.get('/knowledge-points/:knowledgePointId', (req, res) => {
  const detail = getPublishedKnowledgePoint(
    String(req.params.knowledgePointId),
  )

  if (!detail) {
    res.status(404).json({
      error: 'Published knowledge point not found',
    })
    return
  }

  res.json(detail)
})

router.get(
  '/knowledge-points/:knowledgePointId/versions',
  (req, res) => {
    const versions = listPublishedKnowledgePointVersions(
      String(req.params.knowledgePointId),
    )

    if (!versions) {
      res.status(404).json({
        error: 'Published knowledge point not found',
      })
      return
    }

    res.json(versions)
  },
)

router.get(
  '/knowledge-points/:knowledgePointId/versions/:contentVersion',
  (req, res) => {
    const bundle = getPublishedKnowledgePointVersion(
      String(req.params.knowledgePointId),
      String(req.params.contentVersion),
    )

    if (!bundle) {
      res.status(404).json({
        error: 'Published knowledge point version not found',
      })
      return
    }

    res.json(bundle)
  },
)

export default router
