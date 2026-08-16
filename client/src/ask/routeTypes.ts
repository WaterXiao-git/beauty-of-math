export interface RouteMatch {
  path: string
  title: string
  score: number
  matchedBy: string
}

export interface RouteResult {
  question: string
  intent: 'draw' | 'calculate' | 'explain' | 'demo' | 'find'
  branch: 'direct' | 'suggest' | 'answer' | 'ai' | 'no-match'
  confidence: number
  matches: RouteMatch[]
  params: Record<string, number>
  reason: string
}
