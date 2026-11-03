import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright'

// Android 真实触摸覆盖连续滚到顶部和下拉交接，页面由当前 Web PullRefresh 渲染。
assert(process.argv.slice(2).every(argument => argument === '--record'), '用法：node tests/android-refresh.device.mjs [--record]')
const application = JSON.parse(readFileSync(new URL('../examples/tauri/tauri.conf.json', import.meta.url))).identifier
const serial = process.env.ANDROID_SERIAL || execFileSync('adb', ['get-serialno'], { encoding: 'utf8', windowsHide: true }).trim()
assert(serial && serial !== 'unknown', '请连接设备或指定 ANDROID_SERIAL')
const args = ['-s', serial]
const adb = (...command) => execFileSync('adb', [...args, ...command], { encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024 }).trim()
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
const until = async (check, message) => {
  const start = Date.now()
  while (!await check()) { if (Date.now() - start > 15_000) throw Error(message); await pause(60) }
}
const output = mkdtempSync(join(tmpdir(), 'my-ui-web-refresh-')), reports = []
const screenshot = name => writeFileSync(join(output, name + '.png'), execFileSync('adb', [...args, 'exec-out', 'screencap', '-p'], { windowsHide: true, maxBuffer: 24 * 1024 * 1024 }))
let browser, port, pointer, recording, recordPid, video
try {
  adb('shell', 'am', 'force-stop', application)
  adb('shell', 'am', 'start', '-W', '-n', application + '/.MainActivity')
  const pid = adb('shell', 'pidof', application)
  port = adb('forward', 'tcp:0', 'localabstract:webview_devtools_remote_' + pid)
  await until(async () => {
    try { return (await (await fetch('http://127.0.0.1:' + port + '/json/list')).json()).length > 0 } catch { return false }
  }, '没有可调试的 WebView')
  browser = await chromium.connectOverCDP('http://127.0.0.1:' + port)
  const page = browser.contexts()[0].pages().find(page => page.url().includes('tauri.localhost'))
  await page.locator('[data-demo-tabbar]').waitFor()
  // 只切当前容器中的测试路由；独立 Activity 导航由专门的设备测试覆盖。
  await page.evaluate(() => { location.hash = '/example/pull-refresh' })
  await page.locator('[data-pull-refresh-example] .my-pull-refresh').waitFor()
  await page.locator('.my-pull-refresh').scrollIntoViewIfNeeded()
  await page.evaluate(() => {
    window.__refreshTrace = []
    window.__refreshNode = document.querySelector('.my-pull-refresh')
    window.__refreshMessages = document.querySelector('.my-pull-refresh-track')
    for (const type of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) {
      window.__refreshNode.addEventListener(type, event => window.__refreshTrace.push({ type, trusted: event.isTrusted, top: document.querySelector('.my-pull-refresh-viewport').scrollTop }), { passive: true })
    }
  })
  const state = () => page.evaluate(() => ({
    top: document.querySelector('.my-pull-refresh-viewport').scrollTop,
    phase: document.querySelector('.my-pull-refresh').dataset.state,
    count: Number(document.querySelector('[data-refresh-count]').textContent.match(/\d+/)?.[0] ?? 0),
    starts: window.__refreshTrace.filter(event => event.type === 'touchstart').length,
    cancels: window.__refreshTrace.filter(event => event.type === 'touchcancel').length,
    trusted: window.__refreshTrace.every(event => event.trusted),
  }))
  const reset = async top => {
    await until(async () => (await state()).phase === 'idle', '上次刷新尚未结束')
    await page.evaluate(value => { document.querySelector('.my-pull-refresh-viewport').scrollTop = value; window.__refreshTrace = [] }, top)
    await pause(120)
  }
  adb('shell', 'uiautomator', 'dump', '/sdcard/my-ui-web-refresh-bounds.xml')
  const xml = adb('shell', 'cat', '/sdcard/my-ui-web-refresh-bounds.xml')
  const web = [...xml.matchAll(/<node\b[^>]*>/g)].map(match => Object.fromEntries([...match[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(item => [item[1], item[2]]))).find(node => /WebView$/.test(node.class) && node.package === application)
  assert(web, '无法读取宿主 WebView 物理边界')
  const bounds = [...web.bounds.matchAll(/\d+/g)].map(match => Number(match[0]))
  const geometry = await page.locator('.my-pull-refresh-viewport').evaluate(element => { const box = element.getBoundingClientRect(); return { x: box.x, y: box.y, width: box.width, height: box.height, dpr: devicePixelRatio } })
  const x = Math.round(bounds[0] + (geometry.x + geometry.width * .72) * geometry.dpr)
  const screenY = y => Math.round(bounds[1] + y * geometry.dpr)
  let y
  const motion = (action, value) => adb('shell', 'input', 'touchscreen', 'motionevent', action, String(x), String(screenY(value)))
  const down = value => { y = value; pointer = () => motion('CANCEL', y); motion('DOWN', y) }
  const move = async value => {
    const from = y, steps = Math.max(1, Math.ceil(Math.abs(value - from) / 16))
    for (let i = 1; i <= steps; i++) { y = from + (value - from) * i / steps; motion('MOVE', y); await pause(16) }
  }
  const up = () => { motion('UP', y); pointer = undefined }
  const start = geometry.y + 28, bottom = geometry.y + geometry.height - 24
  if (process.argv.includes('--record')) {
    const existing = adb('shell', 'ps', '-A').split('\n').filter(line => line.includes('screenrecord')).map(line => line.trim().split(/\s+/)[1])
    video = '/sdcard/Download/my-ui-web-refresh-' + Date.now() + '.mp4'
    const child = spawn('adb', [...args, 'shell', 'screenrecord', '--time-limit', '90', video], { windowsHide: true, stdio: 'ignore' })
    recording = new Promise(resolve => child.once('exit', resolve))
    await pause(300)
    recordPid = adb('shell', 'ps', '-A').split('\n').filter(line => line.includes('screenrecord')).map(line => line.trim().split(/\s+/)[1]).find(pid => !existing.includes(pid))
  }
  await reset(80)
  down(start); await move(bottom)
  const held = await state()
  assert(held.top <= 1 && held.starts === 1 && held.cancels === 0 && held.trusted, '同一次真实触摸未连续滚到顶部：' + JSON.stringify(held))
  assert.equal(held.phase, 'ready', '到顶继续下拉没有进入可刷新状态')
  assert.equal(held.count, 0, '松手前提前刷新')
  screenshot('continuous-held'); up()
  await until(async () => (await state()).count === 1, '连续手势松手后未完成刷新')
  reports.push({ name: '同次触摸滚到顶部后继续下拉，松手只刷新一次', held, passed: true })
  await reset(0)
  down(start + 100); await move(bottom); await move(start + 105); up()
  await pause(500)
  assert.equal((await state()).count, 1, '未达到阈值的回推仍触发刷新')
  reports.push({ name: '超过阈值后回推取消，不误刷新', passed: true })
  await reset(0)
  down(start + 150); await move(bottom); await move(start + 20)
  const returned = await state()
  assert(returned.top > 0 && returned.starts === 1 && returned.cancels === 0 && returned.trusted, '下拉收回后同次触摸没有继续滚正文：' + JSON.stringify(returned))
  screenshot('pull-return-scroll'); up(); await pause(300)
  assert.equal((await state()).count, 1, '收回后正文滚动误触发刷新')
  reports.push({ name: '下拉收回后不抬手继续上推正文', held: returned, passed: true })
  await reset(300)
  down(start + 100); await move(start + 160); up(); await pause(300)
  assert.equal((await state()).count, 1, '尚未滚到顶部的手势误刷新')
  assert((await state()).top > 0, '普通滚动测试意外到顶')
  reports.push({ name: '列表中段保持普通浏览器滚动', passed: true })
  assert(await page.evaluate(() => window.__refreshNode === document.querySelector('.my-pull-refresh') && window.__refreshMessages === document.querySelector('.my-pull-refresh-track')), '下拉刷新重建了组件或正文')
  screenshot('finished')
} catch (error) {
  reports.push({ passed: false, error: String(error.stack || error) })
  screenshot('failure')
  process.exitCode = 1
} finally {
  try { pointer?.() } catch { /* 仅释放本测试未结束的触摸。 */ }
  if (recordPid) {
    try { adb('shell', 'kill', '-2', recordPid) } catch { /* 录屏已结束。 */ }
    await recording
    adb('pull', video, join(output, 'refresh.mp4'))
    adb('shell', 'rm', video)
  }
  await browser?.close()
  if (port) adb('forward', '--remove', 'tcp:' + port)
  writeFileSync(join(output, 'report.json'), JSON.stringify({ serial, reports }, null, 2))
  console.log(JSON.stringify({ output, reports }))
}
