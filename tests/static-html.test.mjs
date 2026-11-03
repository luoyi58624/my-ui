import assert from 'node:assert/strict'
import test from 'node:test'
import { chromium } from 'playwright'

// 禁用页面脚本后验证真实示例，防止样式再次依赖运行时补充标记。
test('HTML + class 静态组件', { timeout: 60_000 }, async suite => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_EXECUTABLE_PATH
      ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH }
      : { channel: process.env.BROWSER_CHANNEL ?? 'chrome' }),
  })
  suite.after(() => browser.close())

  for (const width of [390, 1280]) {
    await suite.test(`${width}px 下无需脚本即可展示和操作`, async () => {
      const context = await browser.newContext({
        javaScriptEnabled: false,
        reducedMotion: 'no-preference',
        viewport: { width, height: 900 },
      })
      try {
        const page = await context.newPage()
        const errors = [], scripts = []
        page.on('pageerror', error => errors.push(error.message))
        page.on('request', request => {
          if (request.resourceType() === 'script') scripts.push(request.url())
        })
        await page.goto(new URL('../examples/others/components.html', import.meta.url).href)
        assert.deepEqual(await page.evaluate(() => ({
          scripts: document.scripts.length,
          markers: [...document.querySelectorAll('*')].some(node =>
            [...node.attributes].some(attribute => attribute.name.startsWith('data-my'))),
          overflow: document.documentElement.scrollWidth > innerWidth,
        })), { scripts: 0, markers: false, overflow: false })

        const style = await page.evaluate(() => {
          const button = document.querySelector('.my-button')
          const tag = document.querySelector('.my-tag')
          const avatar = document.querySelector('.my-avatar')
          const badge = document.querySelector('.my-badge-indicator')
          const card = document.querySelector('.my-card')
          return {
            buttonHeight: button.getBoundingClientRect().height,
            buttonRadius: parseFloat(getComputedStyle(button).borderRadius),
            buttonBackground: getComputedStyle(button).backgroundColor,
            tagHeight: tag.getBoundingClientRect().height,
            tagBackground: getComputedStyle(tag).backgroundColor,
            inputHeight: document.querySelector('input.my-input').getBoundingClientRect().height,
            avatarWidth: avatar.getBoundingClientRect().width,
            badgePosition: getComputedStyle(badge).position,
            cardBackground: getComputedStyle(card).backgroundColor,
            spinnerAnimation: getComputedStyle(document.querySelector('.my-spinner')).animationName,
            skeletonAnimation: getComputedStyle(document.querySelector('.my-skeleton-visual')).animationName,
          }
        })
        assert.ok(style.buttonHeight >= 44 && style.buttonRadius > 0)
        assert.notEqual(style.buttonBackground, 'rgba(0, 0, 0, 0)')
        assert.ok(style.tagHeight >= 24 && style.avatarWidth >= 32)
        assert.notEqual(style.tagBackground, 'rgba(0, 0, 0, 0)')
        assert.ok(style.inputHeight >= 44)
        assert.equal(style.badgePosition, 'absolute')
        assert.notEqual(style.cardBackground, 'rgba(0, 0, 0, 0)')
        assert.notEqual(style.spinnerAnimation, 'none')
        assert.notEqual(style.skeletonAnimation, 'none')

        // 减少动态效果同时关闭全局平滑滚动，避免原生焦点滚动干扰自动点击。
        await page.emulateMedia({ reducedMotion: 'reduce' })
        const name = page.getByRole('textbox', { name: '姓名', exact: true })
        const note = page.getByRole('textbox', { name: '备注', exact: true })
        const notification = page.getByRole('switch', { name: '接收消息通知' })
        const tips = page.getByRole('checkbox', { name: '使用技巧' })
        const daily = page.getByRole('radio', { name: '每天汇总' })
        const weekly = page.getByRole('radio', { name: '每周汇总' })
        await name.fill('静态页面')
        await note.fill('浏览器原生输入')
        await notification.uncheck()
        await tips.check()
        await weekly.check()
        assert.equal(await name.inputValue(), '静态页面')
        assert.equal(await notification.isChecked(), false)
        assert.equal(await tips.isChecked(), true)
        assert.equal(await daily.isChecked(), false)
        assert.equal(await weekly.isChecked(), true)
        assert.equal(await page.getByRole('checkbox', { name: '暂未开放' }).isDisabled(), true)
        assert.equal(await page.getByRole('button', { name: '不可操作' }).isDisabled(), true)
        assert.ok(await page.getByRole('textbox', { name: '禁用输入框', exact: true }).evaluate(node =>
          parseFloat(getComputedStyle(node).opacity) < 1))

        await page.getByRole('button', { name: '恢复默认' }).click()
        assert.equal(await name.inputValue(), '小蓝')
        assert.equal(await note.inputValue(), '用 HTML 和 class 组合页面。')
        assert.equal(await notification.isChecked(), true)
        assert.equal(await tips.isChecked(), false)
        assert.equal(await daily.isChecked(), true)
        await notification.focus()
        await page.keyboard.press('Space')
        assert.equal(await notification.isChecked(), false)

        assert.deepEqual(await page.evaluate(() => {
          const host = document.createElement('div')
          host.innerHTML = '<input type="checkbox"><span class="my-green">普通内容</span><span class="my-is-disabled">普通状态</span>'
          document.querySelector('.my-card').append(host)
          const result = {
            appearance: getComputedStyle(host.firstChild).appearance,
            tagColor: getComputedStyle(host.children[1]).getPropertyValue('--tag-color'),
            opacity: getComputedStyle(host.lastChild).opacity,
          }
          host.remove()
          return result
        }), { appearance: 'auto', tagColor: '', opacity: '1' })

        const code = page.locator('details').first()
        await code.locator('summary').click()
        assert.equal(await code.getAttribute('open'), '')
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
        await page.emulateMedia({ reducedMotion: 'reduce' })
        assert.equal(await page.locator('.my-spinner').evaluate(node => getComputedStyle(node).animationName), 'none')
        assert.equal(await page.locator('.my-skeleton-visual').evaluate(node => getComputedStyle(node).animationName), 'none')
        assert.deepEqual(errors, [])
        assert.deepEqual(scripts, [])
      } finally {
        await context.close()
      }
    })
  }
})
