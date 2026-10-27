import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'

test('ImagePreview：真实触摸切页、双指缩放与拖动边界', { timeout: 180_000 }, async t => {
  const cacheDir = mkdtempSync(join(tmpdir(), 'my-ui-image-preview-'))
  let server, browser, context
  try {
    server = await createServer({
      configFile: fileURLToPath(new URL('../example/vite.config.ts', import.meta.url)),
      cacheDir, mode: 'test', logLevel: 'error',
      optimizeDeps: { entries: ['tests/image-preview.browser.html'] },
      server: { host: '127.0.0.1', port: 0, open: false, hmr: false, watch: null },
    })
    await server.listen()
    browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE_PATH ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH } : { channel: process.env.BROWSER_CHANNEL ?? 'chrome' }) })
    context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
    const page = await context.newPage(), errors = []
    page.setDefaultTimeout(10_000)
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(new URL('tests/image-preview.browser.html', server.resolvedUrls.local[0]).href)
    await page.waitForFunction(() => !!window.__imagePreviewTest)
    const cdp = await context.newCDPSession(page)
    const frame = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    const snapshot = () => page.evaluate(() => window.__imagePreviewTest.snapshot())
    const reset = props => page.evaluate(props => window.__imagePreviewTest.create(props), props ?? {})
    const update = props => page.evaluate(props => window.__imagePreviewTest.update(props), props)
    const point = (x, y, id = 1) => ({ x, y, id, radiusX: 4, radiusY: 4, force: 1 })
    let touchesActive = false
    const dispatch = async (type, points) => {
      const result = await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points })
      touchesActive = type === 'touchStart' || type === 'touchMove' || type === 'touchEnd' && points.length > 0
      return result
    }
    t.afterEach(async () => { if (touchesActive) await dispatch('touchCancel', []) })
    const center = async () => { const { viewport } = await snapshot(); return { x: viewport.x + viewport.width / 2, y: viewport.y + viewport.height / 2, width: viewport.width, height: viewport.height } }
    const move = async (from, to, steps = 12) => {
      for (let index = 1; index <= steps; index++) {
        await dispatch('touchMove', from.map((start, finger) => point(start.x + (to[finger].x - start.x) * index / steps, start.y + (to[finger].y - start.y) * index / steps, start.id)))
        await page.waitForTimeout(18)
      }
      await frame()
    }
    const drag = async (from, to, beforeRelease) => {
      await dispatch('touchStart', [from]); await move([from], [to]); await beforeRelease?.(); await dispatch('touchEnd', []); await page.waitForTimeout(320)
    }
    const pinch = async (startRadius, endRadius, beforeRelease) => {
      const at = await center(), from = [point(at.x - startRadius, at.y, 1), point(at.x + startRadius, at.y, 2)], to = [point(at.x - endRadius, at.y, 1), point(at.x + endRadius, at.y, 2)]
      await dispatch('touchStart', from); await move(from, to); await beforeRelease?.(); await dispatch('touchEnd', []); await page.waitForTimeout(320)
    }
    const waitIndex = index => page.waitForFunction(index => window.__imagePreviewTest.snapshot().index === index, index)

    await t.test('横滑时图片随手指移动，释放才切换且只通知一次', async () => {
      const before = await reset(), at = await center()
      await drag(point(at.x + at.width * .28, at.y), point(at.x - at.width * .28, at.y), async () => {
        const moving = await snapshot()
        assert.equal(moving.index, 0, '手指未释放就提交了新索引')
        assert.ok(Math.abs(moving.image.x - before.image.x) > 30 || moving.transforms.some(transform => Math.abs(transform.x) > 30), '图片没有跟随真实手指移动')
      })
      await waitIndex(1)
      assert.deepEqual((await snapshot()).events, [1])
      assert.equal((await snapshot()).opened, true, '拖动后的兼容点击关闭了预览')
    })
    await t.test('短拖回弹，首尾不循环，纵向拖动不误换图', async () => {
      await reset(); const at = await center()
      await drag(point(at.x, at.y), point(at.x - 14, at.y)); assert.equal((await snapshot()).index, 0)
      await drag(point(at.x - 70, at.y), point(at.x + 100, at.y)); assert.equal((await snapshot()).index, 0, '首张向右循环了')
      await drag(point(at.x, at.y - 90), point(at.x + 8, at.y + 100)); assert.equal((await snapshot()).index, 0, '纵拖误切图')
      await update({ startIndex: 2 }); await waitIndex(2)
      await drag(point(at.x + 90, at.y), point(at.x - 110, at.y)); assert.equal((await snapshot()).index, 2, '末张向左循环了')
    })
    await t.test('双指缩放真实改变图片尺寸，页面本身不缩放', async () => {
      const before = await reset()
      await pinch(35, 105, async () => {
        const moving = await snapshot()
        assert.ok(moving.scale > 2 && moving.image.width > before.image.width * 2, '双指仅更新显示数字或没有缩放图片')
      })
      const after = await snapshot()
      assert.ok(after.scale >= 2.7 && after.scale <= 3.3, `三倍捏合比例异常：${after.scale}`)
      assert.equal(after.index, 0)
      assert.equal(after.pageScale, before.pageScale, '双指触发了页面级缩放')
      assert.deepEqual(after.events, [], '双指缩放产生切图事件')
    })
    await t.test('放大后单指拖动只平移图片，不切页且限制在图像边界', async () => {
      await reset(); await pinch(35, 105); const before = await snapshot(), at = await center()
      await drag(point(at.x, at.y), point(at.x + 70, at.y + 45), async () => {
        const moving = await snapshot()
        assert.ok(moving.image.x > before.image.x + 20 && moving.image.y > before.image.y + 10, '放大图片没有跟手平移')
      })
      const after = await snapshot()
      assert.equal(after.index, 0); assert.deepEqual(after.events, [])
      assert.ok(Math.abs(after.scale - before.scale) < .03, '单指平移改变缩放倍数')
      for (let index = 0; index < 3; index++) await drag(point(at.x - 100, at.y - 140), point(at.x + 150, at.y + 160))
      const edge = await snapshot()
      assert.ok(edge.content.x <= edge.viewport.x + 2 && edge.content.y <= edge.viewport.y + 2, '平移越过图片实际内容边缘露出空白')
      assert.ok(edge.content.x + edge.content.width >= edge.viewport.x + edge.viewport.width - 2, '横向平移没有边界限制')
      assert.ok(edge.content.y + edge.content.height >= edge.viewport.y + edge.viewport.height - 2, '纵向平移没有边界限制')
    })
    await t.test('捏合抬起一根手指后平移连续，剩余手指不误切页', async () => {
      await reset(); const at = await center(), start = [point(at.x - 35, at.y, 1), point(at.x + 35, at.y, 2)], enlarged = [point(at.x - 100, at.y, 1), point(at.x + 100, at.y, 2)]
      await dispatch('touchStart', start); await move(start, enlarged)
      const before = await snapshot()
      await page.evaluate(() => {
        window.__previewPartialEnd = undefined
        document.querySelector('.my-image-preview-viewport').addEventListener('touchend', event => {
          window.__previewPartialEnd = { remaining: [...event.touches].map(touch => ({ x: touch.clientX, y: touch.clientY })), ended: [...event.changedTouches].map(touch => ({ x: touch.clientX, y: touch.clientY })) }
        }, { once: true })
      })
      await dispatch('touchEnd', [enlarged[1]])
      const released = await page.evaluate(() => window.__previewPartialEnd)
      assert.equal(released?.remaining.length, 1, `未正确抬起一指：${JSON.stringify(released)}`)
      assert.ok(Math.abs(released.remaining[0].x - enlarged[0].x) < 1, `CDP 抬起了错误的手指：${JSON.stringify(released)}`)
      await move([enlarged[0]], [point(enlarged[0].x + 65, at.y + 40, 1)])
      const moving = await snapshot()
      assert.ok(moving.content.x > before.content.x + 25 && moving.content.y > before.content.y + 15, '从双指变单指后不能连续平移')
      assert.ok(Math.abs(moving.scale - before.scale) < .03, `抬起一指时缩放发生跳变：${before.scale}/${moving.scale}`)
      await dispatch('touchEnd', []); await page.waitForTimeout(320)
      assert.equal((await snapshot()).index, 0); assert.deepEqual((await snapshot()).events, [])
    })
    await t.test('捏合限定在 1 到 maxZoom，还原后可继续滑动切图', async () => {
      await reset({ maxZoom: 2 }); await pinch(25, 120)
      assert.ok(Math.abs((await snapshot()).scale - 2) < .02, '超过 maxZoom')
      await pinch(110, 15); const restored = await snapshot()
      assert.ok(Math.abs(restored.scale - 1) < .02, '缩小到 1 倍以下或没有还原')
      const at = await center(); await drag(point(at.x + 100, at.y), point(at.x - 100, at.y)); await waitIndex(1)
      assert.equal((await snapshot()).scale, 1, '切图未恢复 1 倍')
    })
    await t.test('双点在两倍与原始比例间切换，不误关闭或换图', async tapTest => {
      await reset(); const at = await center()
      await page.evaluate(() => {
        window.__previewTapTrace = []; window.__previewTapObserver = new AbortController()
        for (const type of ['pointerdown', 'pointermove', 'pointerup', 'lostpointercapture', 'dblclick']) document.addEventListener(type, event => {
          window.__previewTapTrace.push({ type, pointerType: event.pointerType, x: event.clientX, y: event.clientY, target: event.target.className, scale: window.__imagePreviewTest.snapshot().scale })
        }, { signal: window.__previewTapObserver.signal })
      })
      tapTest.after(() => page.evaluate(() => window.__previewTapObserver.abort()))
      for (let repetition = 0; repetition < 2; repetition++) {
        for (let tap = 0; tap < 2; tap++) {
          await dispatch('touchStart', [point(at.x, at.y)]); await page.waitForTimeout(35); await dispatch('touchEnd', []); await page.waitForTimeout(70)
        }
        await page.waitForTimeout(320)
        const actual = await snapshot(), expected = repetition === 0 ? 2 : 1
        assert.ok(Math.abs(actual.scale - expected) < .03, `双点比例错误：${actual.scale}/${expected}；事件：${JSON.stringify(await page.evaluate(() => window.__previewTapTrace))}`)
        assert.equal((await snapshot()).opened, true); assert.equal((await snapshot()).index, 0)
        await page.waitForTimeout(350)
      }
    })
    await t.test('取消和外部更新中止旧手势，释放不会覆盖新索引', async () => {
      await reset(); const at = await center(), from = point(at.x + 100, at.y), to = point(at.x - 100, at.y)
      await dispatch('touchStart', [from]); await move([from], [to]); await dispatch('touchCancel', []); await page.waitForTimeout(320)
      assert.equal((await snapshot()).index, 0); assert.deepEqual((await snapshot()).events, [])
      await dispatch('touchStart', [from]); await move([from], [to]); await update({ startIndex: 2 }); await dispatch('touchEnd', []); await page.waitForTimeout(320)
      assert.equal((await snapshot()).index, 2, '旧手势释放覆盖外部指定的图片')
      assert.equal((await snapshot()).scale, 1)
      await dispatch('touchStart', [from]); await move([from], [to]); await page.evaluate(() => window.__imagePreviewTest.update({ images: [window.__imagePreviewTest.images[0]], startIndex: 0 })); await dispatch('touchEnd', []); await page.waitForTimeout(320)
      assert.equal((await snapshot()).index, 0); assert.equal((await snapshot()).count, '1/1')
    })
    await t.test('手势中卸载立即释放，重新打开后没有残留监听或返回记录', async () => {
      await reset(); const at = await center()
      await dispatch('touchStart', [point(at.x + 90, at.y)]); await move([point(at.x + 90, at.y)], [point(at.x - 100, at.y)])
      await page.evaluate(() => window.__imagePreviewTest.destroy()); await dispatch('touchEnd', []); await frame()
      assert.equal(await page.locator('.my-image-preview-overlay').count(), 0)
      assert.equal(await page.evaluate(() => MyUI.layers.dismissTop()), false)
      await reset(); await drag(point(at.x + 100, at.y), point(at.x - 100, at.y)); await waitIndex(1)
      assert.deepEqual((await snapshot()).events, [1], '重新挂载后手势监听重复')
    })
    assert.deepEqual(errors, [], '页面出现未处理异常')
  } finally {
    await context?.close(); await browser?.close(); await server?.close()
    // 仅移除本测试创建并验证归属的临时缓存。
    if (dirname(resolve(cacheDir)) === resolve(tmpdir()) && basename(cacheDir).startsWith('my-ui-image-preview-')) rmSync(cacheDir, { recursive: true, force: true })
  }
})
