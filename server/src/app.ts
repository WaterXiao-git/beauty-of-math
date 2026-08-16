import cors from 'cors'
import express from 'express'

import agentRouter from './routes/agent.js'
import answerRouter from './routes/answer.js'
import bugsRouter from './routes/bugs.js'
import contentRouter from './routes/content.js'
import knowledgeRouter from './routes/knowledge.js'

const app = express()
const adminPassword = process.env.ADMIN_PASSWORD || 'mathviz2025'

app.use(cors())
app.use(express.json())

app.use('/api/bugs', bugsRouter)
app.use('/api/agent', agentRouter)
app.use('/api/knowledge', knowledgeRouter)
app.use('/api/answer', answerRouter)
app.use('/api/content', contentRouter)

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body
  if (password === adminPassword) {
    res.json({ success: true, token: Buffer.from(`admin:${Date.now()}`).toString('base64') })
  } else {
    res.status(401).json({ error: 'Invalid password' })
  }
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default app
