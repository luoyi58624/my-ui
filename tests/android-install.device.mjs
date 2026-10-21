import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright'
import { installAndroid } from '../scripts/install-android.mjs'

// 实际覆盖安装前台、后台和子页中的应用，持续观察首次启动，不能用第二次打开代替通过。
const apk = process.argv[2]
assert(apk && process.argv.length === 3, '用法：node tests/android-install.device.mjs <debug-apk>')
const application = JSON.parse(readFileSync(new URL('../example/src-tauri/tauri.conf.json', import.meta.url))).identifier
const serial = process.env.ANDROID_SERIAL || execFileSync('adb', ['get-serialno'], { encoding: 'utf8', windowsHide: true }).trim()
const output = mkdtempSync(join(tmpdir(), 'my-ui-install-entry-')), reports = []
const adb = args => execFileSync('adb', args, { encoding: 'utf8', windowsHide: true, maxBuffer: 24 * 1024 * 1024 }).trim()
const device = (...args) => adb(['-s', serial, ...args])
const pid = () => { try { return device('shell', 'pidof', application) } catch { return '' } }
const top = () => device('shell', 'dumpsys', 'activity', 'activities').split('\n').find(line => line.includes('topResumedActivity=')) ?? ''
const hierarchy = () => device('shell', 'dumpsys', 'activity', application)
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
const until = async (check, message) => {
  const started = Date.now()
  while (!await check()) { if (Date.now() - started > 15_000) throw Error(message); await pause(150) }
}
const ports = []
let browser
async function connect() {
  const processId = pid()
  assert(processId, '安装后的首次启动已退出')
  const port = device('forward', 'tcp:0', 'localabstract:webview_devtools_remote_' + processId)
  ports.push(port)
  await until(async () => {
    assert.equal(pid(), processId, '首次启动期间进程退出或重启')
    try { return (await (await fetch('http://127.0.0.1:' + port + '/json/list', { signal: AbortSignal.timeout(1500) })).json()).some(item => item.url.startsWith('http://tauri.localhost/')) } catch { return false }
  }, '没有找到首次启动的首页 WebView')
  browser = await chromium.connectOverCDP('http://127.0.0.1:' + port)
  const page = browser.contexts()[0].pages().find(item => item.url().startsWith('http://tauri.localhost/') && !item.url().includes('pageWindow='))
  assert(page, '首次启动没有创建首页 WebView')
  await page.waitForSelector('[data-demo-tabbar]', { timeout: 15_000 })
  return { page, processId }
}

try {
  assert(device('shell', 'dumpsys', 'power').includes('mWakefulness=Awake'), '请保持手机解锁、亮屏')
  device('shell', 'am', 'start', '-W', '-a', 'android.intent.action.MAIN', '-c', 'android.intent.category.LAUNCHER', '-n', application + '/.LauncherActivity')
  let { page } = await connect()
  for (const state of ['foreground', 'background', 'child-page']) {
    if (state === 'background') device('shell', 'input', 'keyevent', 'KEYCODE_HOME')
    if (state === 'child-page') {
      await page.evaluate(() => window.__TAURI_INTERNALS__.invoke('plugin:native-components|push', { path: 'index.html#/showcase', title: '安装回归' }))
      await until(() => top().includes('/.NativePageActivity'), '没有进入待覆盖安装的子页')
    }
    await browser.close(); browser = undefined
    const started = device('shell', 'date', '+%m-%dT%H:%M:%S.000').replace('T', ' ')
    installAndroid({ apk, environment: { ANDROID_SERIAL: serial }, adb, log() {} })
    const connected = await connect()
    page = connected.page
    const processId = connected.processId, observed = Date.now()
    while (Date.now() - observed < 7000) {
      assert.equal(pid(), processId, '首次启动完成后进程退出或重启：' + state)
      assert(top().includes('/.MainActivity'), '首次启动意外离开首页：' + state)
      await pause(250)
    }
    assert(await page.locator('[data-demo-tabbar]').isVisible(), '首次启动后 Web 底部导航栏不可见')
    assert(!/BottomNavigationView\{|MaterialToolbar\{/.test(hierarchy()), '首次启动仍创建了原生 UI 控件')
    const logs = device('logcat', '-d', '-v', 'threadtime', '-t', started)
    writeFileSync(join(output, state + '.log'), logs)
    assert(!logs.split('\n').some(line => line.includes('ShellPackageUpdate') && line.includes('launching the base intent')), '安装后系统仍在自动重复启动任务')
    assert(!logs.split('\n').some(line => new RegExp('\\s' + processId + '\\s').test(line) && /FATAL EXCEPTION|FORTIFY:|Fatal signal/.test(line)), '首次启动存在崩溃日志')
    writeFileSync(join(output, state + '.png'), execFileSync('adb', ['-s', serial, 'exec-out', 'screencap', '-p'], { windowsHide: true, maxBuffer: 24 * 1024 * 1024 }))
    reports.push({ state, passed: true, processId, observedMilliseconds: Date.now() - observed })
    console.log(JSON.stringify(reports.at(-1)))
  }
  writeFileSync(join(output, 'report.json'), JSON.stringify({ passed: true, serial, reports, output }, null, 2))
  console.log(JSON.stringify({ passed: true, total: reports.length, output }))
} catch (error) {
  writeFileSync(join(output, 'failure.json'), JSON.stringify({ passed: false, error: String(error), reports, top: top(), output }, null, 2))
  console.error(JSON.stringify({ passed: false, error: String(error), output }))
  process.exitCode = 1
} finally {
  await browser?.close()
  for (const port of ports) device('forward', '--remove', 'tcp:' + port)
}
