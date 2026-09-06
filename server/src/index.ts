import './config/environment.js'

import app from './app.js'
import { warmSemanticIndex } from './agent/semanticQuestionRouter.js'

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  void warmSemanticIndex().catch(() => {
    console.warn('语义索引预热未完成，当前使用规则回退；请检查千问配置及 /api/agent/status。')
  })
})
