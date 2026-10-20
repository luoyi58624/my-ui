import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const configFile = fileURLToPath(new URL('../example/vite.config.ts', import.meta.url))
const config = JSON.parse(readFileSync(new URL('../example/src-tauri/tauri.conf.json', import.meta.url), 'utf8'))
const normalize = path => process.platform === 'win32' ? resolve(path).toLowerCase() : resolve(path)

/** 复用当前项目的开发服务；端口空闲时才创建由本次启动负责的 Vite。 */
export async function ensureDevServer({ url = config.build.devUrl, viteOptions = {}, log = console.log } = {}) {
  const address = new URL(url)
  async function matchesProject() {
    try {
      const response = await fetch(new URL('/__my-ui/dev-server', address), { signal: AbortSignal.timeout(1500) })
      if (!response.ok) return false
      const identity = await response.json()
      return identity.app === 'my-ui' && typeof identity.root === 'string' && normalize(identity.root) === normalize(projectRoot)
    } catch { return false }
  }
  if (await matchesProject()) {
    log('复用当前项目的开发服务：' + address.origin)
    return { reused: true }
  }
  const { createServer } = await import('vite')
  const server = await createServer({
    configFile,
    ...viteOptions,
    server: { ...viteOptions.server, host: address.hostname, port: Number(address.port), strictPort: true }
  })
  try { await server.listen() }
  catch (error) {
    await server.close()
    // 两个入口同时启动时，后到者也只复用已经通过身份检查的同项目服务。
    if (await matchesProject()) {
      log('复用当前项目的开发服务：' + address.origin)
      return { reused: true }
    }
    throw new Error('无法启动开发服务：' + error.message + '。如果该端口被其他项目占用，请先处理占用；现有进程未被关闭。', { cause: error })
  }
  log('已启动当前项目的开发服务。')
  server.printUrls()
  return { reused: false, server }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { server } = await ensureDevServer()
    if (server) {
      // 退出只清理本次创建的服务，复用的服务始终由原会话管理。
      const stop = async () => { await server.close(); process.exit(0) }
      process.once('SIGINT', stop)
      process.once('SIGTERM', stop)
    }
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
