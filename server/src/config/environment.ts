import { config } from 'dotenv'
import { existsSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const localEnvPath = fileURLToPath(
  new URL('../../.env', import.meta.url),
)

export function resolveDevelopmentEnvPath(
  preferredEnvPath: string,
  pathExists: (candidate: string) => boolean = existsSync,
): string {
  if (pathExists(preferredEnvPath)) return preferredEnvPath

  let ancestor = dirname(preferredEnvPath)
  while (dirname(ancestor) !== ancestor) {
    if (basename(ancestor) === '.worktrees') {
      const sharedEnvPath = resolve(
        dirname(ancestor),
        'server',
        '.env',
      )
      return pathExists(sharedEnvPath)
        ? sharedEnvPath
        : preferredEnvPath
    }
    ancestor = dirname(ancestor)
  }

  return preferredEnvPath
}

// 本地开发以 server/.env 为唯一配置源，避免终端中遗留的旧密钥覆盖新文件。
// 生产环境只使用部署平台注入的环境变量。
if (process.env.NODE_ENV !== 'production') {
  config({
    path: resolveDevelopmentEnvPath(localEnvPath),
    override: true,
    quiet: true,
  })
}
