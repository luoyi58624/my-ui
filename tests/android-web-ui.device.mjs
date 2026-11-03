import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright'

const application = JSON.parse(readFileSync(new URL('../examples/tauri/tauri.conf.json', import.meta.url))).identifier
const serial = process.env.ANDROID_SERIAL || execFileSync('adb', ['get-serialno'], { encoding: 'utf8', windowsHide: true }).trim()
assert(serial && serial !== 'unknown', '请连接已授权设备或指定 ANDROID_SERIAL')
const adb = (...args) => execFileSync('adb', ['-s', serial, ...args], { encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024 }).trim()
const output = mkdtempSync(join(tmpdir(), 'my-ui-web-window-')), reports = []
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
const until = async (check, message) => { const start = Date.now(); while (!await check()) { if (Date.now() - start > 15_000) throw Error(message); await pause(80) } }
const screenshot = name => writeFileSync(join(output, name + '.png'), execFileSync('adb', ['-s', serial, 'exec-out', 'screencap', '-p'], { windowsHide: true, maxBuffer: 24 * 1024 * 1024 }))
let browser, port
try {
  adb('shell', 'am', 'force-stop', application)
  adb('shell', 'am', 'start', '-W', '-n', application + '/.MainActivity')
  port = adb('forward', 'tcp:0', 'localabstract:webview_devtools_remote_' + adb('shell', 'pidof', application))
  await until(async () => { try { return (await (await fetch('http://127.0.0.1:' + port + '/json/list')).json()).length > 0 } catch { return false } }, '没有可调试的 WebView')
  browser = await chromium.connectOverCDP('http://127.0.0.1:' + port)
  const context = browser.contexts()[0], main = context.pages().find(page => page.url().includes('tauri.localhost'))
  await main.locator('[data-demo-tabbar]').waitFor()
  await main.evaluate(() => { window.__tabbar = document.querySelector('[data-demo-tabbar]'); window.__home = document.querySelector('[data-demo-page=home]'); window.__home.scrollTop = 300 })
  const initialScroll = await main.evaluate(() => window.__home.scrollTop)
  const select = async (label, route) => { await main.locator('[data-demo-tabbar]').getByRole('button', { name: label, exact: true }).click(); await main.waitForFunction(route => location.hash === '#/' + route, route) }
  await select('消息', 'messages')
  for (let i = 0; i < 3; i++) await main.getByRole('button', { name: /^点一下/ }).click()
  await select('设置', 'settings')
  const toggle = main.locator('[data-settings-home]').getByRole('switch').first()
  await toggle.click()
  assert.equal(await toggle.getAttribute('aria-checked'), 'true')
  const tabs = [['首页', 'home'], ['应用', 'native'], ['消息', 'messages'], ['设置', 'settings']]
  for (let i = 0; i < 24; i++) {
    await select(...tabs[i % 4])
    assert(await main.evaluate(() => window.__tabbar === document.querySelector('[data-demo-tabbar]')), '快速切换重建了底栏')
  }
  await select('消息', 'messages')
  assert.match(await main.getByRole('button', { name: /^点一下/ }).textContent(), /3/)
  await select('设置', 'settings')
  assert.equal(await toggle.getAttribute('aria-checked'), 'true', '设置开关状态丢失')
  await select('首页', 'home')
  assert.equal(await main.evaluate(() => window.__home.scrollTop), initialScroll, '首页目录滚动状态丢失')
  const activities = adb('shell', 'dumpsys', 'activity', 'activities').split('\n').filter(line => line.includes('Hist  #') && line.includes(application + '/'))
  assert.equal(activities.length, 1, 'Tab 切换创建了额外 Activity')
  reports.push({ name: '24次快速Tab切换保留计数、开关、目录滚动和同一底栏', passed: true })
  const created = context.waitForEvent('page')
  await main.locator('[data-demo-link=input]').click()
  const inputPage = await created
  await inputPage.waitForURL(url => url.hash === '#/example/input' && url.searchParams.get('pageWindow') === '1')
  const input = inputPage.getByRole('textbox', { name: '搜索', exact: true })
  await input.waitFor()
  await inputPage.evaluate(() => window.__inputIdentity = crypto.randomUUID())
  const full = await inputPage.evaluate(() => innerHeight)
  // CDP 附加上下文没有 Playwright hasTouch 标记，使用真实 Android 点击打开 IME。
  await input.scrollIntoViewIfNeeded()
  adb('shell', 'uiautomator', 'dump', '/sdcard/my-ui-window-bounds.xml')
  const xml = adb('shell', 'cat', '/sdcard/my-ui-window-bounds.xml')
  const web = [...xml.matchAll(/<node\b[^>]*>/g)].map(match => Object.fromEntries([...match[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(item => [item[1], item[2]]))).find(node => /WebView$/.test(node.class) && node.package === application)
  assert(web, '无法读取输入页面的 WebView 边界')
  const bounds = [...web.bounds.matchAll(/\d+/g)].map(match => Number(match[0]))
  const inputPoint = await input.evaluate(element => { const box = element.getBoundingClientRect(); return { x: (box.x + box.width / 2) * devicePixelRatio, y: (box.y + box.height / 2) * devicePixelRatio } })
  adb('shell', 'input', 'tap', String(Math.round(bounds[0] + inputPoint.x)), String(Math.round(bounds[1] + inputPoint.y)))
  await until(() => inputPage.evaluate(height => innerHeight < height - 100, full), '真实键盘打开后 WebView 没有让出空间')
  await input.fill('retain-native-page-input')
  const keyboard = await inputPage.evaluate(() => ({ height: innerHeight, visual: visualViewport.height, input: document.activeElement.getBoundingClientRect().bottom, header: document.querySelector('.my-app-bar').getBoundingClientRect().bottom }))
  assert(keyboard.input <= keyboard.visual && keyboard.header > 0, '键盘遮住输入框或顶栏')
  screenshot('keyboard-visible')
  adb('shell', 'input', 'keyevent', '4')
  await until(() => inputPage.evaluate(height => Math.abs(innerHeight - height) <= 1, full), '键盘关闭后视口没有恢复')
  const identity = await inputPage.evaluate(() => window.__inputIdentity)
  const nestedCreated = context.waitForEvent('page')
  await inputPage.evaluate(() => window.__TAURI_INTERNALS__.invoke('plugin:native-components|push', { path: 'index.html#/shared-state', title: '输入状态返回验证' }))
  const nested = await nestedCreated
  await nested.locator('.native-page').waitFor()
  await nested.evaluate(() => window.__TAURI_INTERNALS__.invoke('plugin:native-components|back')).catch(error => { if (!/closed|destroyed/.test(error.message)) throw error })
  await inputPage.waitForFunction(() => document.visibilityState === 'visible')
  assert.equal(await input.inputValue(), 'retain-native-page-input')
  assert.equal(await inputPage.evaluate(() => window.__inputIdentity), identity)
  reports.push({ name: '真实IME避让及恢复，原生子页往返保留输入和WebView实例', passed: true, full, keyboard })
  screenshot('input-restored')
  await inputPage.evaluate(() => window.__TAURI_INTERNALS__.invoke('plugin:native-components|back')).catch(error => { if (!/closed|destroyed/.test(error.message)) throw error })
  await main.waitForFunction(() => document.visibilityState === 'visible')
  assert.equal(await main.evaluate(() => location.hash), '#/home')
} catch (error) {
  reports.push({ passed: false, error: String(error.stack || error) }); screenshot('failure'); process.exitCode = 1
} finally {
  await browser?.close()
  if (port) adb('forward', '--remove', 'tcp:' + port)
  writeFileSync(join(output, 'report.json'), JSON.stringify({ serial, reports }, null, 2))
  console.log(JSON.stringify({ output, reports }))
}
