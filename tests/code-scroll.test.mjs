import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'

test('代码完整展开，鼠标位于代码区域时仍能滚动整页', { timeout: 90_000 }, async (t) => {
  const cacheDir = mkdtempSync(join(tmpdir(), 'my-ui-code-scroll-'))
  let server, browser
  try {
    server = await createServer({
      configFile: fileURLToPath(new URL('../example/vite.config.ts', import.meta.url)),
      cacheDir,
      optimizeDeps: { entries: ['example/index.html', 'tests/code-font-weight.browser.html'] },
      mode: 'test',
      logLevel: 'error',
      server: { host: '127.0.0.1', port: 0, open: false, hmr: false, watch: null }
    })
    await server.listen()
    browser = await chromium.launch({ headless: true, channel: 'chrome' })
    for (const width of [390, 1280]) {
      await t.test(`${width}px 页面实际滚轮操作`, async () => {
        const page = await browser.newPage({
          viewport: { width, height: 844 },
          reducedMotion: 'reduce'
        })
        try {
          await page.goto(
            new URL(
              'tests/code-font-weight.browser.html?frame=1#/guide/quick-start',
              server.resolvedUrls.local[0]
            ).href
          )
          const scroller = page.locator('.guide-page .demo-scroll')
          const short = page.locator('.guide-page .demo-code pre').first()
          await short.waitFor()
          // 使用浏览器真实滚轮，不能用 scrollTo 代替用户滚动来掩盖事件或滚动链问题。
          const wheelPage = async (code, delta) => {
            await code.evaluate((element) => {
              const outer = element.closest('.demo-scroll')
              outer.scrollTop +=
                element.getBoundingClientRect().top - outer.getBoundingClientRect().top - 80
            })
            const bounds = await code.boundingBox()
            await page.mouse.move(
              Math.min(width - 20, bounds.x + 60),
              Math.min(780, Math.max(100, bounds.y + 40))
            )
            const before = await scroller.evaluate((element) => element.scrollTop)
            await page.mouse.wheel(0, delta)
            await page.waitForFunction(
              ({ before, delta }) => {
                const current = document.querySelector('.guide-page .demo-scroll').scrollTop
                return delta > 0 ? current > before + 1 : current < before - 1
              },
              { before, delta },
              { timeout: 3000 }
            )
            assert.equal(
              await code.evaluate((element) => element.scrollTop),
              0,
              '代码区发生了内部垂直滚动'
            )
          }
          await wheelPage(short, 240)
          const example = page.locator('#guide-quick-start-first-component')
          assert.equal(
            await example.locator('details').evaluate((element) => element.open),
            true,
            '指南代码没有默认展开'
          )
          const long = example.locator('.demo-code pre')
          await long.waitFor()
          const metrics = await long.evaluate((element) => ({
            maxHeight: getComputedStyle(element).maxHeight,
            overflowY: getComputedStyle(element).overflowY,
            height: element.clientHeight,
            scrollHeight: element.scrollHeight
          }))
          assert.equal(metrics.maxHeight, 'none')
          assert.equal(metrics.overflowY, 'hidden')
          assert.ok(metrics.height > 540, '长代码没有完整展开')
          assert.ok(metrics.scrollHeight <= metrics.height + 1, '代码区仍有隐藏的垂直溢出')
          await wheelPage(long, 240)
          await wheelPage(long, -160)
          if (width === 390) {
            await long.evaluate((element) => {
              const outer = element.closest('.demo-scroll')
              outer.scrollTop +=
                element.getBoundingClientRect().top - outer.getBoundingClientRect().top - 80
            })
            const bounds = await long.boundingBox()
            await page.mouse.move(bounds.x + 60, bounds.y + 40)
            const before = await scroller.evaluate((element) => element.scrollTop)
            await page.mouse.wheel(220, 0)
            await page.waitForFunction(
              () =>
                document.querySelector('#guide-quick-start-first-component .demo-code pre')
                  .scrollLeft > 0,
              undefined,
              { timeout: 3000 }
            )
            assert.equal(
              await scroller.evaluate((element) => element.scrollTop),
              before,
              '横向滚动改变了整页的垂直位置'
            )
          }
        } finally {
          await page.close()
        }
      })
    }
  } finally {
    await browser?.close()
    await server?.close()
    if (
      dirname(resolve(cacheDir)) === resolve(tmpdir()) &&
      basename(cacheDir).startsWith('my-ui-code-scroll-')
    )
      rmSync(cacheDir, { recursive: true, force: true })
  }
})
