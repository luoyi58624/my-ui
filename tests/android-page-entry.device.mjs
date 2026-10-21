import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright'

assert(process.argv.slice(2).every(value => ['--record', '--attach'].includes(value)), '用法：node tests/android-page-entry.device.mjs [--record] [--attach]')
const application = JSON.parse(readFileSync(new URL('../example/src-tauri/tauri.conf.json', import.meta.url))).identifier
const serial = process.env.ANDROID_SERIAL || execFileSync('adb', ['get-serialno'], { encoding: 'utf8', windowsHide: true }).trim()
assert(serial && serial !== 'unknown', '请连接一台已授权 USB 调试的手机，或指定 ANDROID_SERIAL')
const adbArguments = ['-s', serial]
const adb = (...args) => execFileSync('adb', [...adbArguments, ...args], { encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024 }).trim()
const binary = (...args) => execFileSync('adb', [...adbArguments, ...args], { windowsHide: true, maxBuffer: 24 * 1024 * 1024 })
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
const output = mkdtempSync(join(tmpdir(), 'my-ui-page-entry-')), reports = []
const screenshot = name => writeFileSync(join(output, name + '.png'), binary('exec-out', 'screencap', '-p'))
const until = async (check, message) => {
  const start = Date.now()
  while (!await check()) { if (Date.now() - start > 15_000) throw Error(message); await pause(60) }
}
const windowState = () => adb('shell', 'dumpsys', 'window', 'windows').split(/\n(?=  Window #\d+)/)
  .find(value => value.split('\n')[0].includes(application + '/' + application + '.NativePageActivity')) ?? ''
const foreground = () => adb('shell', 'dumpsys', 'activity', 'activities').split('\n').find(value => value.includes('topResumedActivity=')) ?? ''
const hierarchy = activity => adb('shell', 'dumpsys', 'activity', application).split(/\n(?=\s*ACTIVITY )/)
  .find(value => value.includes('ACTIVITY ' + application + '/.' + activity + ' ')) ?? ''
let browser, port, recording, recordPid, remoteRecording

try {
  assert(adb('shell', 'dumpsys', 'power').includes('mWakefulness=Awake'), '请保持手机解锁、亮屏')
  // 默认重置示例的页面栈；共享真机时可连接已打开的首页，均保留应用数据。
  if (!process.argv.includes('--attach')) {
    adb('shell', 'am', 'force-stop', application)
    adb('shell', 'am', 'start', '-W', '-n', application + '/.MainActivity')
  }
  const pid = adb('shell', 'pidof', application)
  port = adb('forward', 'tcp:0', 'localabstract:webview_devtools_remote_' + pid)
  await until(async () => {
    try { return (await (await fetch('http://127.0.0.1:' + port + '/json/list', { signal: AbortSignal.timeout(2000) })).json()).length > 0 } catch { return false }
  }, '没有找到可调试的 WebView，请先安装 Android 调试包')
  browser = await chromium.connectOverCDP('http://127.0.0.1:' + port)
  const context = browser.contexts()[0], parent = context.pages().find(page => page.url().includes('tauri.localhost'))
  await until(async () => {
    let actual
    try { actual = adb('shell', 'pidof', application) } catch { throw Error('初始化期间应用进程已退出，请检查启动日志') }
    assert.equal(actual, pid, '初始化期间应用进程发生重启，请检查启动日志')
    return await parent.locator('[data-native-layout="true"]').count() > 0
  }, '首页原生页面壳未就绪')
  const parentIdentity = await parent.evaluate(() => window.__entryIdentity = crypto.randomUUID())
  await pause(500)

  await context.addInitScript(() => {
    window.__entryReady = []
    const stringify = JSON.stringify
    // Tauri 的 invoke 不可改写；只观察 Android IPC 序列化，并延迟目标回调。
    JSON.stringify = function (value, ...arguments_) {
      if (value?.cmd?.startsWith('plugin:native-components|')) {
        const { cmd: command, payload: args, callback } = value
        if (command === 'plugin:native-components|page_ready') {
          const navigation = document.querySelector('.nc-page-navbar')
          window.__entryReady.push({
            frame: args.frame,
            native: !!document.querySelector('[data-native-layout="true"]'),
            navigation: navigation ? getComputedStyle(navigation).display : null,
            frames: [...document.querySelectorAll('iframe')].map(frame => ({ url: frame.contentDocument?.URL, state: frame.contentDocument?.readyState })),
          })
        }
        if (new URL(location.href).searchParams.has('entryHold') && !window.__entryWillHold
          && command === 'plugin:native-components|update' && args.surface?.kind === 'layout' && args.surface.visible) {
          // 原生已创建导航，故意延迟网页收到确认，放大录屏中的重复标题窗口。
          window.__entryWillHold = true
          const callbacks = window.__TAURI_INTERNALS__.callbacks, original = callbacks.get(callback)
          callbacks.set(callback, result => {
            window.__entryHeld = true
            window.__releaseEntry = () => original(result)
          })
        }
      }
      return stringify.call(this, value, ...arguments_)
    }
  })

  if (process.argv.includes('--record')) {
    let previous = []
    try { previous = adb('shell', 'pidof', 'screenrecord').split(/\s+/) } catch { /* 没有其他录屏。 */ }
    remoteRecording = '/sdcard/Download/my-ui-page-entry-' + Date.now() + '.mp4'
    const child = spawn('adb', [...adbArguments, 'shell', 'screenrecord', '--time-limit', '45', '--size', '628x1380', remoteRecording], { windowsHide: true, stdio: 'ignore' })
    recording = new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', code => code === 0 ? resolve() : reject(Error('录屏失败'))) })
    recording.catch(() => {})
    await until(() => {
      try { recordPid = adb('shell', 'pidof', 'screenrecord').split(/\s+/).find(value => !previous.includes(value)); return !!recordPid } catch { return false }
    }, '录屏未启动')
  }

  const open = async (path, name, held = false) => {
    assert(foreground().includes(application + '/.MainActivity'), '设备已离开示例首页，可能被其他会话占用')
    assert.equal(adb('shell', 'pidof', application), pid, '测试过程中示例进程被重新启动')
    const created = context.waitForEvent('page'), errors = [], start = Date.now()
    await parent.evaluate(path => window.__TAURI_INTERNALS__.invoke('plugin:native-components|push', { path, title: '首帧回归' }), path)
    const page = await created
    page.on('pageerror', error => errors.push(error.message))
    await until(() => windowState().includes('mDrawState=HAS_DRAWN'), '新页没有立即开始入场')
    const entryElapsed = Date.now() - start
    if (held) {
      await page.waitForFunction(() => window.__entryHeld === true)
      assert.equal(await page.evaluate(() => document.querySelector('.nc-page-navbar') && getComputedStyle(document.querySelector('.nc-page-navbar')).display !== 'none'), true)
      await pause(350)
      assert(windowState().includes('mDrawState=HAS_DRAWN'), '正文准备期间仍然阻塞 Activity 入场')
      assert(/RustWebView\{[^\n]*alpha=0\.0/.test(hierarchy('NativePageActivity')), '网页导航仍可见时暴露了交接中的 WebView')
      screenshot(name + '-held')
      await page.evaluate(() => window.__releaseEntry())
    }
    await page.waitForSelector('[data-native-layout="true"]')
    await until(() => /RustWebView\{[^\n]*alpha=1\.0/.test(hierarchy('NativePageActivity')), '正文首帧完成后仍然隐藏 WebView')
    await pause(600)
    const ready = await page.evaluate(() => window.__entryReady)
    assert(ready.length && ready.every(value => value.native && value.navigation === 'none'), '网页导航仍可见时确认了首帧：' + JSON.stringify(ready))
    assert(ready.every(value => value.frames.every(frame => frame.state === 'complete' && frame.url !== 'about:blank')), 'iframe 内容尚未加载就确认了首帧')
    const samples = await page.evaluate(async () => {
      const frames = []
      for (let index = 0; index < 15; index++) {
        await new Promise(requestAnimationFrame)
        frames.push({ height: innerHeight, navigation: getComputedStyle(document.querySelector('.nc-page-navbar')).display, top: document.querySelector('.nc-page-body').getBoundingClientRect().top })
      }
      return frames
    })
    assert(samples.every(value => value.navigation === 'none' && value.top === 0 && value.height === samples[0].height), '入场后正文仍在改变导航占位或视口')
    assert.deepEqual(errors, [])
    screenshot(name)
    reports.push({ name, passed: true, held, entryElapsed, elapsed: Date.now() - start, ready, samples })
    console.log(JSON.stringify({ name, passed: true, held, entryElapsed }))
    await page.evaluate(() => window.__TAURI_INTERNALS__.invoke('plugin:native-components|back')).catch(error => {
      if (!/Target.*closed|Execution context was destroyed/.test(error.message)) throw error
    })
    await until(() => foreground().includes(application + '/.MainActivity'), '返回后没有恢复首页 Activity')
    assert.equal(await parent.evaluate(() => window.__entryIdentity), parentIdentity, '返回重建了首页 WebView')
    await pause(600)
  }

  await open('index.html#/example/button', 'simple-page')
  await open('index.html?entryHold=1#/showcase', 'complex-page-held', true)
  await open('index.html#/showcase', 'complex-page-repeat')
  await open('index.html#/html', 'html-page')
  const size = [...adb('shell', 'wm', 'size').matchAll(/(\d+)x(\d+)/g)].at(-1)
  const width = Number(size[1]), height = Number(size[2])
  let bottomIdentity
  for (const [index, route] of [[1, 'native'], [2, 'messages'], [3, 'profile'], [0, 'home']]) {
    adb('shell', 'input', 'tap', String(Math.round(width * (index + .5) / 4)), String(height - 112))
    await parent.waitForFunction(route => location.hash === '#/' + route, route)
    const bottom = hierarchy('MainActivity').match(/BottomNavigationView\{([a-f0-9]+) V[^\n]*alpha=1\.0/)
    assert(bottom, '切换 ' + route + ' 后底栏消失')
    bottomIdentity ??= bottom[1]
    assert.equal(bottom[1], bottomIdentity, '切换 Tab 重建了底栏')
    assert(await parent.locator('[data-native-layout="true"] > .nc-page-navigation [data-native="true"]').count(), '底栏失去 Page 页面壳绑定')
  }
  reports.push({ name: 'bottom-navigation-survives-tabs-and-back', passed: true })
} catch (error) {
  reports.push({ passed: false, error: error.stack })
  screenshot('failure')
  process.exitCode = 1
} finally {
  if (recordPid) {
    try { adb('shell', 'kill', '-2', recordPid) } catch { /* 只停止本次创建的录屏进程。 */ }
    await recording?.catch(error => { reports.push({ recordingError: error.message }); process.exitCode = 1 })
    adb('pull', remoteRecording, join(output, 'page-entry.mp4'))
    adb('shell', 'rm', remoteRecording)
  }
  await browser?.close()
  if (port) adb('forward', '--remove', 'tcp:' + port)
  writeFileSync(join(output, 'report.json'), JSON.stringify({ serial, reports }, null, 2))
  console.log(JSON.stringify({ output, reports: reports.map(({ name, passed, error }) => ({ name, passed, error })) }))
}
