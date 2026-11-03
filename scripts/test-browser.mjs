import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'

// 必须显式选择模块，避免一次修复默认启动整个浏览器测试集。
const arguments_ = process.argv.slice(2)
const modules = arguments_.filter(value => !value.startsWith('--'))
const viewportValue = arguments_.find(value => value.startsWith('--viewport='))?.slice(11) ?? '1280x900'
const match = /^(\d+)x(\d+)$/.exec(viewportValue)
if (!modules.length || !match || arguments_.some(value => value.startsWith('--') && !value.startsWith('--viewport=') && value !== '--reduced-motion')) {
  console.error('用法：bun run test:browser native-core floating [--viewport=390x844] [--reduced-motion]')
  process.exit(1)
}
for (const name of modules) {
  if (!/^[a-z0-9-]+$/.test(name) || !existsSync(new URL(`../tests/${name}.browser.html`, import.meta.url))) {
    console.error(`没有浏览器测试模块：${name}`)
    process.exit(1)
  }
}

let server, browser
let failed = false
const cacheDir = mkdtempSync(join(tmpdir(), 'my-ui-browser-'))
try {
  server = await createServer({
    configFile: fileURLToPath(new URL('../examples/vue/vite.config.ts', import.meta.url)),
    // 多个开发服务共用预构建目录会混入不同的 Vue 实例，测试缓存按进程隔离。
    cacheDir,
    optimizeDeps: { entries: ['examples/tauri/ui/index.html', ...modules.map(name => `tests/${name}.browser.html`)] },
    mode: 'test', logLevel: 'error', server: { host: '127.0.0.1', port: 0, open: false, hmr: false, watch: null },
  })
  await server.listen()
  browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_EXECUTABLE_PATH
      ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH }
      : { channel: process.env.BROWSER_CHANNEL ?? 'chrome' }),
  })
  for (const name of modules) {
    const context = await browser.newContext({
      viewport: { width: Number(match[1]), height: Number(match[2]) },
      reducedMotion: arguments_.includes('--reduced-motion') ? 'reduce' : 'no-preference',
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    try {
      await page.goto(new URL(`tests/${name}.browser.html`, server.resolvedUrls.local[0]).href)
      const trigger = await page.locator('#run').count()
        ? page.locator('#run') : page.getByRole('button', { name: /^运行.*回归$/ })
      await trigger.click()
      await page.waitForFunction(() => [...document.querySelectorAll('pre')].some(node => {
        try {
          const result = JSON.parse(node.textContent)
          return result && (Array.isArray(result.reports) || Array.isArray(result.results) || result.error)
        } catch { return false }
      }), undefined, { timeout: 120_000 })
      const result = await page.locator('pre').evaluateAll(nodes => {
        for (const node of nodes) {
          try {
            const result = JSON.parse(node.textContent)
            if (result && (result.reports || result.results || result.error)) return result
          } catch { /* 页面可以同时展示其他非 JSON 输出。 */ }
        }
      })
      const cases = result.reports ?? result.results ?? []
      const passed = cases.length > 0 && !result.error && result.pass !== false && result.passed !== false && !errors.length
        && cases.every(item => item.pass !== false && item.passed !== false)
        && (result.total === undefined || cases.length === result.total)
      if (!passed) failed = true
      console.log(JSON.stringify({ module: name, passed, cases: cases.length, ...(passed ? {} : { result, errors }) }))
    } catch (error) {
      failed = true
      const progress = await page.locator('pre').allTextContents().catch(() => [])
      console.error(JSON.stringify({ module: name, passed: false, error: String(error), progress, errors }))
    } finally { await context.close() }
  }
} catch (error) {
  failed = true
  console.error(String(error))
} finally {
  await browser?.close()
  await server?.close()
  if (dirname(resolve(cacheDir)) === resolve(tmpdir()) && basename(cacheDir).startsWith('my-ui-browser-')) rmSync(cacheDir, { recursive: true, force: true })
}
if (failed) process.exitCode = 1
