import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtempSync, rmSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'

test('Web 下拉刷新：触摸边界、浏览器滚动和示例接入', { timeout: 240_000 }, async (t) => {
  const cacheDir = mkdtempSync(join(tmpdir(), 'my-ui-pull-refresh-'))
  let server, browser, context
  try {
    server = await createServer({
      configFile: fileURLToPath(new URL('../examples/vue/vite.config.ts', import.meta.url)),
      cacheDir, mode: 'test', logLevel: 'error',
      optimizeDeps: { entries: ['examples/vue/index.html', 'tests/pull-refresh.fixture.html'] },
      server: { host: '127.0.0.1', port: 0, open: false, hmr: false, watch: null },
    })
    await server.listen()
    browser = await chromium.launch({ headless: true, channel: 'chrome' })
    context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
    const page = await context.newPage()
    page.setDefaultTimeout(10_000)
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(new URL('tests/pull-refresh.fixture.html', server.resolvedUrls.local[0]).href)
    await page.locator('#subject').waitFor()
    const snapshot = () => page.evaluate(() => window.__pullRefreshTest.snapshot())
    const set = (value) => page.evaluate((value) => window.__pullRefreshTest.set(value), value)
    const reset = () => page.evaluate(() => window.__pullRefreshTest.reset())
    const settled = () => page.waitForFunction(() => document.querySelector('#subject')?.dataset.state === 'idle')
    const frame = () => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    // 合成事件用于可重复的取消/多指边界；滚动效果另用 CDP 的真实触摸序列验证。
    const send = (type, x = 0, y = 0, options = {}) => page.evaluate(({ type, x, y, options }) => {
      const target = document.querySelector(options.selector ?? '#drag-zone')
      const rect = target.getBoundingClientRect()
      const touch = new Touch({ identifier: 1, target, clientX: rect.left + 24 + x, clientY: 36 + y })
      const touches = type === 'touchend' || type === 'touchcancel' ? [] : [touch]
      if (options.multi) touches.push(new Touch({ identifier: 2, target, clientX: 80, clientY: 70 }))
      const event = new TouchEvent(type, { bubbles: true, cancelable: options.cancelable !== false, touches, targetTouches: touches, changedTouches: [touch] })
      target.dispatchEvent(event)
      return event.defaultPrevented
    }, { type, x, y, options })
    const drag = async (distance, options = {}) => {
      await send('touchstart', 0, 0, options)
      await send('touchmove', 0, distance, options)
      await frame()
      await send('touchend', 0, distance, options)
    }

    await t.test('短距离回弹，不刷新、不销毁内容', async () => {
      await page.locator('#content-input').fill('保留的草稿')
      await drag(24)
      await settled()
      assert.equal((await snapshot()).requests, 0)
      assert.equal(await page.locator('#content-input').inputValue(), '保留的草稿')
    })
    await t.test('达到阈值后按顺序只触发一次，外部完成复位', async () => {
      await reset()
      await drag(250)
      assert.deepEqual((await snapshot()).events, ['value:true', 'refresh'])
      assert.equal(await page.locator('#subject').getAttribute('aria-busy'), 'true')
      await drag(250)
      await page.evaluate(() => window.__pullRefreshTest.refresh())
      assert.equal((await snapshot()).requests, 1)
      await set({ refreshing: false })
      await settled()
      assert.equal(await page.locator('#subject').getAttribute('aria-busy'), 'false')
    })
    await t.test('外部 loading 只展示状态，不递归发起请求', async () => {
      await reset()
      await set({ refreshing: true })
      assert.equal(await page.locator('#subject').getAttribute('data-state'), 'refreshing')
      assert.equal((await snapshot()).requests, 0)
      await set({ refreshing: false })
      await settled()
      await page.evaluate(() => window.__pullRefreshTest.refresh())
      assert.equal((await snapshot()).requests, 1)
    })
    await t.test('同步完成和立即失败都退出 loading，并允许再次刷新', async () => {
      for (const completion of ['sync', 'rejected']) {
        await reset()
        await set({ completion })
        for (let count = 1; count <= 3; count++) {
          await page.evaluate(() => window.__pullRefreshTest.refresh())
          await settled()
          assert.equal((await snapshot()).refreshing, false)
          assert.equal((await snapshot()).requests, count, completion)
        }
      }
    })
    await t.test('禁用时手势和主动刷新都不发请求', async () => {
      await reset()
      await set({ disabled: true })
      await drag(250)
      await page.evaluate(() => window.__pullRefreshTest.refresh())
      assert.equal((await snapshot()).requests, 0)
      assert.equal(await page.locator('#subject').getAttribute('data-state'), 'idle')
    })
    await t.test('连续 move 不重渲染 Vue 插槽，回拉低于阈值后不刷新', async () => {
      await reset()
      const before = (await snapshot()).renders
      await send('touchstart')
      for (let y = 10; y <= 250; y += 10) await send('touchmove', 0, y)
      await frame()
      assert.equal(await page.locator('#subject').getAttribute('data-state'), 'ready')
      assert.equal((await snapshot()).renders, before)
      await send('touchmove', 0, 20)
      await send('touchend', 0, 20)
      await settled()
      assert.equal((await snapshot()).requests, 0)
    })
    await t.test('取消和多指均回弹且释放滚动锁', async () => {
      for (const mode of ['cancel', 'multi']) {
        await reset()
        await send('touchstart')
        await send('touchmove', 0, 250)
        await frame()
        if (mode === 'cancel') await send('touchcancel', 0, 250)
        else await send('touchmove', 0, 260, { multi: true })
        await send('touchend', 0, 260)
        await settled()
        assert.equal((await snapshot()).requests, 0, mode)
        assert.equal(await page.locator('.my-pull-refresh-viewport').evaluate((element) => element.style.overflowY), '')
      }
    })
    await t.test('不可取消的触摸只观察位移，不尝试 preventDefault', async () => {
      await reset()
      await send('touchstart')
      assert.equal(await send('touchmove', 0, 250, { cancelable: false }), false)
      await send('touchend', 0, 250, { cancelable: false })
      assert.equal((await snapshot()).requests, 1)
    })
    await t.test('非顶部、嵌套滚动、横向和输入框不被接管', async () => {
      for (const mode of ['scrolled', 'nested', 'horizontal', 'input']) {
        await reset()
        const options = mode === 'nested' ? { selector: '#nested > div' } : mode === 'input' ? { selector: '#content-input' } : {}
        if (mode === 'scrolled') await page.locator('.my-pull-refresh-viewport').evaluate((element) => { element.scrollTop = 100 })
        if (mode === 'nested') await page.locator('#nested').evaluate((element) => { element.scrollTop = 50 })
        await send('touchstart', 0, 0, options)
        const prevented = await send('touchmove', mode === 'horizontal' ? 180 : 0, 140, options)
        await send('touchend', 0, 140, options)
        assert.equal(prevented, false, mode)
        assert.equal((await snapshot()).requests, 0, mode)
      }
    })
    await t.test('禁用和尺寸变化中止当前手势，下一次仍能刷新', async () => {
      for (const mode of ['disabled', 'resize']) {
        await reset()
        await send('touchstart')
        await send('touchmove', 0, 250)
        await frame()
        if (mode === 'disabled') await set({ disabled: true })
        else await page.evaluate(() => window.dispatchEvent(new Event('resize')))
        await send('touchend', 0, 250)
        await settled()
        assert.equal((await snapshot()).requests, 0, mode)
        await set({ disabled: false })
        await drag(250)
        assert.equal((await snapshot()).requests, 1, mode)
      }
    })
    await t.test('卸载取消待执行帧，重新挂载没有重复监听', async () => {
      await reset()
      await send('touchstart')
      await send('touchmove', 0, 250)
      await set({ mounted: false })
      await frame()
      assert.equal((await snapshot()).requests, 0)
      await reset()
      await drag(250)
      assert.equal((await snapshot()).requests, 1)
    })
    await t.test('减少动态效果仍能刷新并完成复位', async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await reset()
      await drag(250)
      await set({ refreshing: false })
      await settled()
      assert.equal((await snapshot()).requests, 1)
      await page.emulateMedia({ reducedMotion: 'no-preference' })
    })
    await t.test('普通 HTML 共用组件，短内容也能刷新并释放实例', async () => {
      const result = await page.evaluate(async () => {
        const events = []
        const instance = MyUI.create('PullRefresh', {
          onChange: (value) => events.push(value),
          onRefresh: () => events.push('refresh'),
        }, { attributes: { style: { height: '180px' } }, slots: { default: '没有更多记录' } })
        document.body.append(instance.element)
        const started = instance.exposed.refresh()
        await Promise.resolve()
        const busy = instance.element.getAttribute('aria-busy')
        instance.update({ value: false })
        instance.destroy()
        return { started, busy, events, connected: instance.element.isConnected }
      })
      assert.deepEqual(result, { started: true, busy: 'true', events: [true, 'refresh'], connected: false })
    })

    const cdp = await context.newCDPSession(page)
    const realDrag = async (x, from, to, beforeRelease) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: from, id: 1 }] })
      for (let i = 1; i <= 16; i++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: from + (to - from) * i / 16, id: 1 }] })
        await page.waitForTimeout(16)
      }
      await beforeRelease?.()
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    }
    const realMove = async (x, from, to, steps = 16) => {
      for (let i = 1; i <= steps; i++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: from + (to - from) * i / steps, id: 1 }] })
        await page.waitForTimeout(20)
      }
    }
    const scrollSnapshot = () => page.locator('.my-pull-refresh-viewport').evaluate((element) => ({
      top: element.scrollTop,
      overflow: element.style.overflowY,
      offset: new DOMMatrixReadOnly(getComputedStyle(element.firstElementChild).transform).m42,
      state: element.parentElement.dataset.state,
    }))
    await t.test('真实触摸：正常上滑保留浏览器滚动，非顶部下滑不误刷新', async () => {
      await reset()
      await realDrag(160, 340, 90)
      const scroller = page.locator('.my-pull-refresh-viewport')
      await page.waitForFunction(() => document.querySelector('.my-pull-refresh-viewport').scrollTop > 100)
      assert.equal((await snapshot()).requests, 0)
      await page.waitForTimeout(300)
      const before = await scroller.evaluate((element) => element.scrollTop)
      await realDrag(160, 150, 210)
      assert.ok(await scroller.evaluate((element) => element.scrollTop) < before)
      assert.equal((await snapshot()).requests, 0)
    })
    await t.test('真实触摸：同一手指从正文滚到顶，继续下拉直接刷新', async () => {
      await reset()
      await realDrag(320, 340, 240)
      await page.waitForTimeout(300)
      assert.ok((await scrollSnapshot()).top > 30, '必须先由真实触摸滚离顶部')
      const before = (await snapshot()).renders
      await page.evaluate(() => {
        window.__refreshMoveEvents = []
        document.querySelector('.my-pull-refresh-viewport').addEventListener('touchmove', (event) => {
          window.__refreshMoveEvents.push({ trusted: event.isTrusted, cancelable: event.cancelable })
        }, { passive: true })
      })
      await realDrag(320, 180, 760, async () => {
        const state = await scrollSnapshot()
        assert.equal(state.top, 0)
        assert.equal(state.state, 'ready')
        assert.equal(state.overflow, 'hidden')
        assert.ok(state.offset >= 64)
        assert.equal((await snapshot()).renders, before)
        const events = await page.evaluate(() => window.__refreshMoveEvents)
        assert.ok(events.every(event => event.trusted))
        assert.ok(events.some(event => !event.cancelable), '必须覆盖浏览器接管后的不可取消事件')
      })
      assert.equal((await snapshot()).requests, 1)
      assert.equal((await scrollSnapshot()).overflow, '')
    })
    await t.test('真实触摸：越顶下拉再回拉，未抬手也恢复正文滚动', async () => {
      await reset()
      await realDrag(320, 340, 240)
      await page.waitForTimeout(300)
      assert.ok((await scrollSnapshot()).top > 30)
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 320, y: 180, id: 1 }] })
      await realMove(320, 180, 700)
      assert.equal((await scrollSnapshot()).state, 'ready')
      await realMove(320, 700, 580, 6)
      assert.equal((await scrollSnapshot()).top, 0, '收回刷新区域期间正文不能一起上滚')
      await realMove(320, 580, 40, 24)
      const state = await scrollSnapshot()
      assert.equal(state.offset, 0)
      assert.equal(state.overflow, '')
      assert.ok(state.top > 50, '同一触摸回拉后应由浏览器恢复正文滚动')
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      assert.equal((await snapshot()).requests, 0)
    })
    await t.test('真实触摸：嵌套滚动到顶不触发外层刷新', async () => {
      await reset()
      const nested = await page.locator('#nested').boundingBox()
      const x = nested.x + 30, y = nested.y + nested.height - 10
      await realDrag(x, y, y - 100)
      await page.waitForTimeout(300)
      assert.ok(await page.locator('#nested').evaluate((element) => element.scrollTop) > 20)
      await realDrag(x, nested.y + 15, nested.y + 300)
      assert.equal(await page.locator('#nested').evaluate((element) => element.scrollTop), 0)
      assert.equal((await scrollSnapshot()).offset, 0)
      assert.equal((await snapshot()).requests, 0)
    })
    await t.test('真实触摸：取消下拉后下一次手势恢复浏览器滚动', async () => {
      await reset()
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 320, y: 40, id: 1 }] })
      await realMove(320, 40, 280)
      assert.equal((await scrollSnapshot()).state, 'ready')
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] })
      await settled()
      assert.equal((await scrollSnapshot()).overflow, '')
      await realDrag(320, 340, 180)
      assert.ok((await scrollSnapshot()).top > 50)
      assert.equal((await snapshot()).requests, 0)
    })
    await t.test('真实触摸：短内容也能下拉刷新', async () => {
      await reset()
      await page.locator('.test-row, #controls, #nested').evaluateAll((elements) => elements.forEach(element => element.remove()))
      assert.equal(await page.locator('.my-pull-refresh-viewport').evaluate((element) => element.scrollHeight === element.clientHeight), true)
      await realDrag(320, 40, 280)
      assert.equal((await snapshot()).requests, 1)
    })
    await t.test('真实触摸：顶部下拉刷新，拖动按钮不误点，普通点击可用', async () => {
      await reset()
      const button = await page.locator('#content-button').boundingBox()
      await realDrag(button.x + 12, button.y + 12, button.y + 280)
      assert.equal((await snapshot()).requests, 1)
      assert.equal((await snapshot()).clicks, 0)
      await set({ refreshing: false })
      await settled()
      await page.locator('#content-button').tap()
      assert.equal((await snapshot()).clicks, 1)
    })
    await t.test('示例目录、刷新反馈及可复制代码可用', { skip: process.env.MY_UI_PULL_REFRESH_FIXTURE_ONLY === '1' }, async () => {
      await page.goto(new URL('examples/vue/index.html#/home', server.resolvedUrls.local[0]).href)
      await page.locator('[data-demo-link="pull-refresh"]').click()
      await page.waitForURL((url) => url.hash === '#/example/pull-refresh')
      await page.locator('.my-pull-refresh').waitFor()
      assert.ok(await page.locator('.my-pull-refresh-viewport').evaluate((element) => element.scrollHeight > element.clientHeight))
      await page.locator('[data-refresh-button]').click()
      await page.waitForFunction(() => document.querySelector('.my-pull-refresh').getAttribute('aria-busy') === 'true')
      await page.waitForFunction(() => document.querySelector('.my-pull-refresh').dataset.state === 'idle')
      assert.match(await page.locator('[data-refresh-count]').textContent(), /已刷新 1 次/)
      assert.equal(await page.locator('[data-message-id="1001"]').count(), 1)
      mkdirSync(new URL('../qa/pull-refresh/', import.meta.url), { recursive: true })
      await page.screenshot({ path: fileURLToPath(new URL('../qa/pull-refresh/mobile.png', import.meta.url)), fullPage: true })
      await page.locator('.my-pull-refresh').scrollIntoViewIfNeeded()
      const viewport = await page.locator('.my-pull-refresh-viewport').boundingBox()
      await realDrag(viewport.x + 40, viewport.y + 280, viewport.y + 180)
      await page.waitForTimeout(300)
      assert.ok((await scrollSnapshot()).top > 30, '真实示例必须先由触摸滚离顶部')
      await realDrag(viewport.x + 40, viewport.y + 35, viewport.y + 350, async () => {
        assert.equal(await page.locator('.my-pull-refresh').getAttribute('data-state'), 'ready')
        assert.equal((await scrollSnapshot()).top, 0)
        await page.screenshot({ path: fileURLToPath(new URL('../qa/pull-refresh/pulled.png', import.meta.url)) })
      })
      await page.screenshot({ path: fileURLToPath(new URL('../qa/pull-refresh/loading.png', import.meta.url)) })
      await page.waitForFunction(() => document.querySelector('.my-pull-refresh').dataset.state === 'idle')
      assert.match(await page.locator('[data-refresh-count]').textContent(), /已刷新 2 次/)
      await page.setViewportSize({ width: 1280, height: 900 })
      await page.locator('[data-demo-page="example/pull-refresh"]').evaluate((element) => { element.scrollTop = 0 })
      await frame()
      await page.screenshot({ path: fileURLToPath(new URL('../qa/pull-refresh/desktop.png', import.meta.url)), fullPage: true })
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, '示例横向溢出')
      await page.locator('.doc-example .demo-code-files > summary').click()
      await page.waitForFunction(() => document.querySelector('.doc-example .demo-code-files code')?.textContent.includes('PullRefresh'))
      const code = await page.locator('.doc-example .demo-code-files code').textContent()
      assert.ok(code.includes('@refresh="refreshInbox"'))
      assert.ok(!code.includes('../../../components/DemoExample.vue'), '复制代码保留了文档容器依赖')
      await page.goto(new URL('examples/vue/index.html#/code/pull-refresh', server.resolvedUrls.local[0]).href)
      await page.waitForFunction(() => document.querySelector('.code-page code')?.textContent.includes('PullRefresh'))
    })
    assert.deepEqual(errors, [], '浏览器运行错误')
  } finally {
    await context?.close()
    await browser?.close()
    await server?.close()
    if (dirname(resolve(cacheDir)) === resolve(tmpdir()) && basename(cacheDir).startsWith('my-ui-pull-refresh-')) rmSync(cacheDir, { recursive: true, force: true })
  }
})
