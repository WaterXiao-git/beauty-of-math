import assert from 'node:assert/strict'
import path from 'node:path'
import test from 'node:test'

test('工作树缺少 server/.env 时复用主项目的 server/.env', async () => {
  const previousNodeEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  const environmentModule = await import('./environment.js')
  if (previousNodeEnv === undefined) {
    delete process.env.NODE_ENV
  } else {
    process.env.NODE_ENV = previousNodeEnv
  }

  const resolveDevelopmentEnvPath = (
    environmentModule as Record<string, unknown>
  ).resolveDevelopmentEnvPath

  assert.equal(typeof resolveDevelopmentEnvPath, 'function')
  if (typeof resolveDevelopmentEnvPath !== 'function') return

  const projectRoot = path.join('D:', 'math-project')
  const worktreeEnvPath = path.join(
    projectRoot,
    '.worktrees',
    'feature-branch',
    'server',
    '.env',
  )
  const sharedEnvPath = path.join(projectRoot, 'server', '.env')

  const resolved = resolveDevelopmentEnvPath(
    worktreeEnvPath,
    (candidate: string) => candidate === sharedEnvPath,
  )

  assert.equal(resolved, sharedEnvPath)
})
