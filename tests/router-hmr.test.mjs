import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'

// 使用真实开发服务触发热更新，覆盖普通浏览器回归未开启 HMR 的场景。
test('开发热更新后，目录、Tab 和返回仍由同一个路由驱动', { timeout: 90_000 }, async t => {
  const cacheDir = mkdtempSync(join(tmpdir(), 'my-ui-router-hmr-'))
  let server, browser
  try {
    server = await createServer({
      configFile: fileURLToPath(new URL('../example/vite.config.ts', import.meta.url)),
      cacheDir, mode: 'development', logLevel: 'error',
      server: { host: '127.0.0.1', port: 0, open: false, watch: null },
    })
    await server.listen()
    browser = await chromium.launch({ headless: true, channel: 'chrome' })
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    let revision = 0
    page.on('domcontentloaded', () => { revision++ })
    page.on('console', message => { if (message.text().includes('[vite] hot updated:')) revision++ })
    const url = new URL('#/home', server.resolvedUrls.local[0]).href

    for (const path of ['/src/demo/catalog.ts', '/src/navigation.ts', '/src/router.ts']) {
      await t.test(path, async () => {
        await page.goto(url)
        await page.locator('[data-demo-link="button"]').waitFor()
        const module = await server.moduleGraph.getModuleByUrl(path)
        assert.ok(module, '待更新模块没有进入实际页面')
        const before = revision
        await server.reloadModule(module)
        const deadline = Date.now() + 10_000
        while (revision === before && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 20))
        assert.ok(revision > before, '页面没有收到开发更新')

        await page.locator('[data-demo-link="button"]').click()
        await page.waitForURL('**/#/example/button')
        await page.locator('[data-demo-page="example/button"]:not([inert])').waitFor({ timeout: 5000 })
        assert.equal(await page.locator('.demo-top .nc-heading h1').textContent(), 'Button 按钮')
        await page.locator('.demo-top [aria-label^="返回"]').click()
        await page.locator('[data-demo-page="home"]:not([inert])').waitFor()
        await page.locator('.nc-tabs-navigation button').nth(1).click()
        await page.waitForURL('**/#/native')
        await page.locator('[data-demo-page="native"]:not([inert])').waitFor({ timeout: 5000 })
        await page.locator('.nc-tabs-navigation button').nth(0).click()
        await page.locator('[data-showcase-entry]').click()
        await page.locator('.showcase-layout .hero').waitFor({ timeout: 5000 })
        await page.locator('[aria-label="返回组件目录"]').click()
        await page.locator('[data-demo-page="home"]:not([inert])').waitFor()
      })
    }
  } finally {
    await browser?.close()
    await server?.close()
    if (dirname(resolve(cacheDir)) === resolve(tmpdir()) && basename(cacheDir).startsWith('my-ui-router-hmr-')) rmSync(cacheDir, { recursive: true, force: true })
  }
})
