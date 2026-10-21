import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright'

// 真机触摸必须经过 Android 视图层；浏览器注入触摸无法覆盖原生刷新宿主。
assert(process.argv.slice(2).every(argument => argument === '--record'), '用法：node tests/android-refresh.device.mjs [--record]')
const application = JSON.parse(readFileSync(new URL('../example/src-tauri/tauri.conf.json', import.meta.url))).identifier
const serial = process.env.ANDROID_SERIAL || execFileSync('adb', ['get-serialno'], { encoding: 'utf8', windowsHide: true }).trim()
assert(serial && serial !== 'unknown', '请连接一台已授权 USB 调试的手机，或指定 ANDROID_SERIAL')
const adbArguments = ['-s', serial]
const adb = (...args) => execFileSync('adb', [...adbArguments, ...args], { encoding: 'utf8', windowsHide: true, maxBuffer: 12 * 1024 * 1024 }).trim()
const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
const output = mkdtempSync(join(tmpdir(), 'my-ui-android-refresh-')), reports = []
let browser, port, recording, remoteRecording, pointer
const until = async (check, message) => {
  const started = Date.now()
  while (!await check()) { if (Date.now() - started > 15_000) throw Error(message); await pause(50) }
}
const screenshot = name => writeFileSync(join(output, name + '.png'), execFileSync('adb', [...adbArguments, 'exec-out', 'screencap', '-p'], { windowsHide: true, maxBuffer: 24 * 1024 * 1024 }))
const hierarchy = () => adb('shell', 'dumpsys', 'activity', application)
const identity = () => [...new Set([...hierarchy().matchAll(/(?:MaterialToolbar|BottomNavigationView|RustWebView)\{([0-9a-f]+)/g)].map(match => match[1]))].sort().join(',')
const indicator = () => [...new Set(hierarchy().split('\n').filter(line => line.includes('CircleImageView{')))].find(line => /CircleImageView\{[^ ]+ V/.test(line))

try {
  assert(adb('shell', 'dumpsys', 'power').includes('mWakefulness=Awake'), '请保持手机解锁、亮屏')
  // 冷启动只重置示例页面栈，不清除应用数据。
  adb('shell', 'am', 'force-stop', application)
  adb('shell', 'am', 'start', '-W', '-n', application + '/.MainActivity')
  let pid
  await until(() => { pid = adb('shell', 'pidof', application); return !!pid }, '示例进程没有启动')
  port = adb('forward', 'tcp:0', 'localabstract:webview_devtools_remote_' + pid)
  await until(async () => {
    try { return (await (await fetch('http://127.0.0.1:' + port + '/json/list', { signal: AbortSignal.timeout(2000) })).json()).length > 0 } catch { return false }
  }, '没有找到可调试的 WebView，请安装 Android 调试包')
  browser = await chromium.connectOverCDP('http://127.0.0.1:' + port)
  const context = browser.contexts()[0], parent = context.pages().find(page => page.url().includes('tauri.localhost'))
  await parent.waitForFunction(() => !!window.__TAURI_INTERNALS__ && !!document.querySelector('[data-native-layout="true"]'))
  const created = context.waitForEvent('page')
  await parent.evaluate(() => window.__TAURI_INTERNALS__.invoke('plugin:native-components|push', { path: 'index.html#/page-refresh', title: '连续刷新手势验证' }))
  const page = await created, errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.locator('.refresh-demo[data-native-layout="true"] .nc-page-body[data-native-refresh="true"]').waitFor()
  await until(() => adb('shell', 'dumpsys', 'activity', 'activities').split('\n').some(line => line.includes('topResumedActivity=') && line.includes(application + '/.NativePageActivity')), '刷新子页未进入前台，设备可能被其他测试占用')
  await page.evaluate(() => {
    window.refreshEvents = []; window.refreshTouches = []
    window.addEventListener('native-components', event => { if (event.detail.action === 'refresh') window.refreshEvents.push({ ...event.detail, time: performance.now() }) })
    const scroll = document.querySelector('.refresh-demo .nc-page-scroll')
    for (const type of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) scroll.addEventListener(type, event => {
      window.refreshTouches.push({ type, top: scroll.scrollTop, y: event.touches[0]?.clientY, time: performance.now() })
    }, { passive: true })
  })
  const state = () => page.evaluate(() => ({
    top: document.querySelector('.refresh-demo .nc-page-scroll').scrollTop,
    busy: document.querySelector('.refresh-demo').getAttribute('aria-busy') === 'true',
    count: Number(/已更新 (\d+) 次/.exec(document.querySelector('.refresh-demo-intro p').textContent)?.[1] ?? 0),
    events: window.refreshEvents.length,
    starts: window.refreshTouches.filter(event => event.type === 'touchstart').length,
    cancels: window.refreshTouches.filter(event => event.type === 'touchcancel').length,
    height: innerHeight,
  }))
  const reset = async top => {
    await until(async () => !(await state()).busy, '上一次刷新尚未完成')
    await page.evaluate(value => { const scroll = document.querySelector('.refresh-demo .nc-page-scroll'); scroll.scrollTo({ top: value, behavior: 'instant' }); window.refreshTouches = [] }, top)
    await until(async () => Math.abs((await state()).top - top) < 1, '正文没有滚到测试起点')
    await pause(120)
  }
  await until(() => {
    assert.equal(adb('shell', 'pidof', application), pid, '示例进程在检查期间被重新启动')
    try { adb('shell', 'uiautomator', 'dump', '/sdcard/my-ui-refresh-bounds.xml'); return true } catch { return false }
  }, '窗口尚未稳定，无法读取 WebView 边界')
  const xml = adb('shell', 'cat', '/sdcard/my-ui-refresh-bounds.xml')
  const nodes = [...xml.matchAll(/<node\b[^>]*>/g)].map(match => Object.fromEntries([...match[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(item => [item[1], item[2]])))
  const web = nodes.find(node => /WebView$/.test(node.class) && node.package === application)
  assert(web, '找不到当前页面的 WebView 边界')
  const bounds = [...web.bounds.matchAll(/\d+/g)].map(match => Number(match[0])), dpr = await page.evaluate(() => devicePixelRatio)
  const x = Math.round(bounds[0] + (bounds[2] - bounds[0]) * .72), screenY = y => Math.round(bounds[1] + y * dpr)
  const motion = (action, y) => adb('shell', 'input', 'touchscreen', 'motionevent', action, String(x), String(screenY(y)))
  let y
  const down = value => { y = value; pointer = () => motion('CANCEL', y); motion('DOWN', y) }
  const move = async value => {
    const from = y, steps = Math.max(1, Math.ceil(Math.abs(value - from) / 18))
    for (let step = 1; step <= steps; step++) { y = from + (value - from) * step / steps; motion('MOVE', y); await pause(20) }
  }
  const up = () => { motion('UP', y); pointer = undefined }
  const initial = await state(), views = identity(), start = Math.min(140, initial.height * .22), bottom = initial.height - 80
  if (process.argv.includes('--record')) {
    remoteRecording = '/sdcard/Download/my-ui-refresh-' + Date.now() + '.mp4'
    const child = spawn('adb', [...adbArguments, 'shell', 'screenrecord', '--time-limit', '45', remoteRecording], { windowsHide: true, stdio: 'ignore' })
    recording = new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', code => code === 0 ? resolve() : reject(Error('录屏失败'))) })
    recording.catch(() => {})
  }

  await reset(120); down(start); await move(bottom)
  let held = await state()
  assert(held.top <= 1 && held.starts === 1 && held.events === 0, '滚到顶部后接力失败，或未松手就触发刷新：' + JSON.stringify(held))
  assert(indicator(), '到顶继续下拉未拉出原生刷新器')
  screenshot('scroll-to-refresh-held'); up()
  await until(async () => (await state()).count === 1, '松手后没有完成第一次刷新')
  reports.push({ name: '一次按下滚到顶后继续拉出刷新器，松手才刷新', held, passed: true })
  console.log(JSON.stringify(reports.at(-1)))

  await reset(0); down(start); await move(start + 160)
  assert((await state()).events === 1 && indicator(), '下拉过程提前刷新或没有展开指示器')
  await move(Math.max(30, start - 70)); held = await state()
  assert(held.top > 10 && held.starts === 1 && held.cancels === 0 && held.events === 1, '回推后未继续原滚动手势：' + JSON.stringify(held))
  screenshot('return-to-scroll-held'); up(); await pause(350)
  assert.equal((await state()).events, 1, '已收回刷新器仍在松手时刷新')
  reports.push({ name: '下拉超过阈值后推回，同一触摸继续滚正文且松手不刷新', held, passed: true })
  console.log(JSON.stringify(reports.at(-1)))

  await reset(100); down(initial.height * .43); await move(initial.height * .43 - 100); await move(bottom)
  held = await state()
  assert(held.top <= 1 && held.starts === 1 && held.events === 1 && indicator(), '先上滑再反向下拉不能交接：' + JSON.stringify(held))
  up(); await until(async () => (await state()).count === 2, '反向连续拖动没有刷新')
  reports.push({ name: '起手向上滚动再反向下拉，仍可到顶接力刷新', held, passed: true })
  console.log(JSON.stringify(reports.at(-1)))

  await reset(0); down(start); await move(start + 140); await move(start - 40); await move(start + 120); await move(start - 60)
  held = await state()
  assert(held.top > 5 && held.starts === 1 && held.cancels === 0 && held.events === 2, '多次交接重建触摸或误刷新：' + JSON.stringify(held))
  up(); await pause(350)
  assert.equal((await state()).events, 2, '多次回推收回后仍触发刷新')
  reports.push({ name: '同一次触摸多次交接，导航、WebView 和视口保持不变', held, passed: true })
  console.log(JSON.stringify(reports.at(-1)))

  await reset(0)
  await page.getByRole('button', { name: '打开弹窗', exact: true }).click()
  await page.getByRole('heading', { name: '稍作停留', exact: true }).waitFor()
  await page.waitForFunction(() => !document.querySelector('.refresh-demo .nc-page-body').hasAttribute('data-native-refresh'))
  assert.equal((await state()).events, 2, '弹窗打开时意外发起刷新')
  await page.getByRole('button', { name: '继续浏览', exact: true }).click()
  await page.locator('.refresh-demo .nc-page-body[data-native-refresh="true"]').waitFor()
  await reset(120)
  adb('shell', 'input', 'swipe', String(x), String(screenY(start)), String(x), String(screenY(bottom)), '550')
  await until(async () => (await state()).count === 3, '弹窗恢复后快速拖动到顶不能接力刷新')
  const fast = await state()
  assert.equal(fast.starts, 1, '快速拖动重建了网页触摸序列')
  reports.push({ name: '弹窗暂停后恢复，550ms 连续拖动到顶仍可刷新', state: fast, passed: true })
  assert.equal(identity(), views, '刷新手势重建了导航或 WebView')
  assert.equal((await state()).height, initial.height, '刷新手势改变了正文视口')
  assert.deepEqual(errors, [], '网页发生异常')
  screenshot('finished')
  writeFileSync(join(output, 'report.json'), JSON.stringify({ reports, errors, trace: await page.evaluate(() => window.refreshTouches) }, null, 2))
  console.log(JSON.stringify({ passed: true, total: reports.length, reports, output }))
} catch (error) {
  console.error(JSON.stringify({ passed: false, error: String(error), reports, output }))
  process.exitCode = 1
} finally {
  try { pointer?.() } catch { /* 失败时释放自己尚未结束的触摸。 */ }
  await browser?.close()
  if (port) adb('forward', '--remove', 'tcp:' + port)
  if (recording) {
    try {
      await recording
      adb('pull', remoteRecording, join(output, 'refresh-handoff.mp4'))
      if (/^\/sdcard\/Download\/my-ui-refresh-\d+\.mp4$/.test(remoteRecording)) adb('shell', 'rm', remoteRecording)
      console.log('连续刷新手势录屏：' + join(output, 'refresh-handoff.mp4'))
    } catch (error) { console.error('录屏未完成：' + error) }
  }
}
