import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import experimentsRouter from './routes/experiments.js'
import bugsRouter from './routes/bugs.js'
import knowledgeRouter from './routes/knowledge.js'
import routeRouter from './routes/route.js'
import answerRouter from './routes/answer.js'
import generateRouter from './routes/generate.js'

const app = express()
const PORT = process.env.PORT || 3001

// 简单的管理员密码（生产环境应使用更安全的认证方式）
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mathviz2025'

app.use(cors())
app.use(express.json())

app.use('/api/experiments', experimentsRouter)
app.use('/api/bugs', bugsRouter)
app.use('/api/knowledge', knowledgeRouter)
app.use('/api/route', routeRouter)
app.use('/api/answer', answerRouter)
app.use('/api/generate', generateRouter)

// 管理员认证接口
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: Buffer.from(`admin:${Date.now()}`).toString('base64') })
  } else {
    res.status(401).json({ error: 'Invalid password' })
  }
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
