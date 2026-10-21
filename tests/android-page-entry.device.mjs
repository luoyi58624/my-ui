import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright'

// 实际创建子 Activity，验证 Web 首帧、安全视口以及返回后保留父 WebView。
assert(process.argv.slice(2).every(value => value === '--attach'), '用法：node tests/android-page-entry.device.mjs [--attach]')
const application = JSON.parse(readFileSync(new URL('../example/src-tauri/tauri.conf.json', import.meta.url))).identifier
const serial = process.env.ANDROID_SERIAL || execFileSync('adb', ['get-serialno'], { encoding: 'utf8', windowsHide: true }).trim()
assert(serial && serial !== 'unknown', '请连接已授权设备或指定 ANDROID_SERIAL')
const adbArguments = ['-s', serial]
const adb = (...args) => execFileSync('adb', [...adbArguments, ...args], { encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024 }).trim()
const output = mkdtempSync(join(tmpdir(), 'my-ui-page-entry-')), reports = []
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
const until = async (check, message) => {
  const start = Date.now()
  while (!await check()) { if (Date.now() - start > 15_000) throw Error(message); await pause(80) }
}
const foreground = () => adb('shell', 'dumpsys', 'activity', 'activities').split('\n').find(line => /topResumedActivity=|mResumedActivity:/.test(line)) ?? ''
const hierarchy = () => adb('shell', 'dumpsys', 'activity', application)
const screenshot = name => writeFileSync(join(output, name + '.png'), execFileSync('adb', [...adbArguments, 'exec-out', 'screencap', '-p'], { windowsHide: true, maxBuffer: 24 * 1024 * 1024 }))
let browser, port
try {
  assert(Number(adb('shell', 'getprop', 'ro.build.version.sdk')) >= 32, '此测试验证 Android 12L+ 多 Activity；旧版运行 android-navigation-compat.device.mjs')
  if (!process.argv.includes('--attach')) {
    adb('shell', 'am', 'force-stop', application)
    adb('shell', 'am', 'start', '-W', '-n', application + '/.MainActivity')
  }
  const pid = adb('shell', 'pidof', application)
  const logStart = Number(adb('shell', 'date', '+%s'))
  port = adb('forward', 'tcp:0', 'localabstract:webview_devtools_remote_' + pid)
  await until(async () => {
    try { return (await (await fetch('http://127.0.0.1:' + port + '/json/list')).json()).length > 0 } catch { return false }
  }, '没有可调试的 WebView，请安装 Android 调试包')
  browser = await chromium.connectOverCDP('http://127.0.0.1:' + port)
  const context = browser.contexts()[0], parent = context.pages().find(page => page.url().includes('tauri.localhost') && !page.url().includes('pageWindow='))
  await parent.locator('[data-demo-tabbar]').waitFor()
  const identity = await parent.evaluate(() => window.__entryIdentity = crypto.randomUUID())
  await context.addInitScript(() => {
    window.__entryReady = []
    const stringify = JSON.stringify
    // 只观察 IPC：首帧确认时必须已有可见的 Web 页面和完整 iframe。
    JSON.stringify = function (value, ...args) {
      if (value?.cmd === 'plugin:native-components|page_ready') {
        const header = document.querySelector('.my-app-bar')
        window.__entryReady.push({
          frame: value.payload.frame,
          header: !!header && getComputedStyle(header).display !== 'none',
          frames: [...document.querySelectorAll('iframe')].map(frame => ({ url: frame.contentDocument?.URL, state: frame.contentDocument?.readyState })),
        })
      }
      return stringify.call(this, value, ...args)
    }
  })
  for (const path of ['/example/button', '/showcase', '/shared-state', '/html']) {
    assert(foreground().includes(application + '/.MainActivity'), '设备离开了父 Activity')
    const created = context.waitForEvent('page')
    await parent.evaluate(path => window.__TAURI_INTERNALS__.invoke('plugin:native-components|push', { path: 'index.html#' + path, title: '首帧回归' }), path)
    const child = await created, errors = []
    child.on('pageerror', error => errors.push(error.message))
    await child.waitForURL(url => url.searchParams.get('pageWindow') === '1' && url.hash === '#' + path)
    await child.locator('.my-app-bar').first().waitFor()
    assert.equal(await child.locator('[data-demo-tabbar]:visible').count(), 0, '子 Activity 错误显示了首页主 Tab')
    await until(() => foreground().includes(application + '/.NativePageActivity'), '没有创建独立子 Activity')
    await child.waitForFunction(() => window.__entryReady?.length > 0)
    await until(() => {
      const block = hierarchy().split(/\n(?=\s*ACTIVITY )/).find(value => value.includes('ACTIVITY ' + application + '/.NativePageActivity ')) ?? ''
      return /RustWebView\{[^\n]*alpha=1\.0/.test(block)
    }, '子页面首帧完成后 WebView 仍隐藏')
    const ready = await child.evaluate(() => window.__entryReady)
    assert(ready.every(frame => frame.header), 'Web 页面尚未挂载就发送了首帧确认')
    assert(ready.every(frame => frame.frames.every(item => item.state === 'complete' && item.url !== 'about:blank')), 'iframe 未完成加载就确认了首帧')
    assert(!/MaterialToolbar\{|BottomNavigationView\{/.test(hierarchy()), '仍创建了原生 UI 导航栏')
    const frames = await child.evaluate(async () => {
      const samples = []
      for (let index = 0; index < 12; index++) {
        await new Promise(requestAnimationFrame)
        const header = document.querySelector('.my-app-bar').getBoundingClientRect()
        samples.push({ width: innerWidth, height: innerHeight, top: header.top, bottom: header.bottom })
      }
      return samples
    })
    assert(frames.every(frame => frame.height === frames[0].height && frame.top >= 0 && frame.bottom <= frame.height), '首帧后视口继续跳动或顶栏超出视口')
    assert.deepEqual(errors, [])
    const timeouts = adb('logcat', '-d', '-v', 'epoch', '-s', 'NativePageFrame:W', '*:S').split('\n')
      .filter(line => Number(line.match(/^\s*(\d+\.\d+)/)?.[1]) >= logStart && line.includes('准备超时'))
    assert.deepEqual(timeouts, [], '子页依赖首帧超时才显示，不能视作握手成功')
    screenshot(path.replaceAll('/', '-'))
    await child.evaluate(() => window.__TAURI_INTERNALS__.invoke('plugin:native-components|back')).catch(error => {
      if (!/Target.*closed|Execution context was destroyed/.test(error.message)) throw error
    })
    await until(() => foreground().includes(application + '/.MainActivity'), '返回未恢复父 Activity')
    assert.equal(await parent.evaluate(() => window.__entryIdentity), identity, '返回重建了父 WebView')
    reports.push({ path, passed: true, ready, frames })
  }
  await parent.evaluate(() => window.__entryTabbar = document.querySelector('[data-demo-tabbar]'))
  for (const [label, route] of [['应用', 'native'], ['消息', 'messages'], ['设置', 'settings'], ['首页', 'home']]) {
    await parent.locator('[data-demo-tabbar]').getByRole('button', { name: label, exact: true }).click()
    await parent.waitForFunction(route => location.hash === '#/' + route, route)
    assert(await parent.evaluate(() => window.__entryTabbar === document.querySelector('[data-demo-tabbar]')), 'Tab 切换重建了 Web 底栏')
    assert(foreground().includes(application + '/.MainActivity'), 'Tab 切换错误创建了子 Activity')
  }
  reports.push({ name: 'tab-switch-retains-parent', passed: true })
} catch (error) {
  reports.push({ passed: false, error: String(error.stack || error) })
  process.exitCode = 1
} finally {
  await browser?.close()
  if (port) adb('forward', '--remove', 'tcp:' + port)
  writeFileSync(join(output, 'report.json'), JSON.stringify({ serial, reports }, null, 2))
  console.log(JSON.stringify({ output, reports }))
}
