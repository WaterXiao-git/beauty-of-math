import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'

const localEnvPath = fileURLToPath(
  new URL('../../.env', import.meta.url),
)

// 本地开发以 server/.env 为唯一配置源，避免终端中遗留的旧密钥覆盖新文件。
// 生产环境只使用部署平台注入的环境变量。
if (process.env.NODE_ENV !== 'production') {
  config({
    path: localEnvPath,
    override: true,
    quiet: true,
  })
}
