import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// 只操作本示例与其返回桌面的过程；手机需保持解锁、竖屏并使用手势导航。
const application = JSON.parse(readFileSync(new URL('../example/src-tauri/tauri.conf.json', import.meta.url))).identifier
const serial = process.env.ANDROID_SERIAL || execFileSync('adb', ['get-serialno'], { encoding: 'utf8', windowsHide: true }).trim()
assert(serial && serial !== 'unknown', '请连接一台已授权 USB 调试的手机，或指定 ANDROID_SERIAL')
assert(process.argv.slice(2).every(argument => argument === '--record'), '用法：node tests/android-back.device.mjs [--record]')
const adbArguments = ['-s', serial]
const adb = (...args) => execFileSync('adb', [...adbArguments, ...args], { encoding: 'utf8', windowsHide: true, maxBuffer: 8 * 1024 * 1024 }).trim()
const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
const until = async (check, message) => {
  const started = Date.now()
  while (!await check()) {
    if (Date.now() - started > 15_000) throw Error(message)
    await pause(100)
  }
}
const top = () => adb('shell', 'dumpsys', 'activity', 'activities').split('\n').find(line => line.includes('topResumedActivity=')) ?? ''
const at = activity => top().includes(application + '/.' + activity)
const launchHome = () => {
  // 各阶段使用独立冷启动，避免系统结束上一根 Activity 时复用即将退出的旧进程。
  adb('shell', 'am', 'force-stop', application)
  return adb('shell', 'am', 'start', '-W', '-a', 'android.intent.action.MAIN', '-c', 'android.intent.category.LAUNCHER', '-n', application + '/.MainActivity')
}
const reports = [], clients = []
const output = mkdtempSync(join(tmpdir(), 'my-ui-android-back-'))
const ports = []
let recording, remoteRecording

async function connect(url) {
  const socket = new WebSocket(url)
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
  let sequence = 0
  const pending = new Map()
  socket.onmessage = event => {
    const message = JSON.parse(event.data), request = pending.get(message.id)
    if (!request) return
    pending.delete(message.id); clearTimeout(request.timer)
    message.error ? request.reject(Error(message.error.message)) : request.resolve(message.result)
  }
  socket.onclose = () => {
    for (const request of pending.values()) { clearTimeout(request.timer); request.reject(Error('WebView 调试连接已关闭')) }
    pending.clear()
  }
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence, timer = setTimeout(() => { pending.delete(id); reject(Error('WebView 调试超时：' + method)) }, 7000)
    pending.set(id, { resolve, reject, timer })
    socket.send(JSON.stringify({ id, method, params }))
  })
  const client = {
    async evaluate(expression) {
      const response = await send('Runtime.evaluate', { expression, returnByValue: true })
      if (response.exceptionDetails) throw Error(response.exceptionDetails.text)
      return response.result.value
    },
    close() { socket.close() }
  }
  clients.push(client)
  return client
}
const layerActive = client => client.evaluate('(()=>{let active=false;const stop=MyUI.layers.subscribe(value=>{active=value});stop();return active})()')
const screenshot = name => writeFileSync(join(output, name + '.png'), execFileSync('adb', [...adbArguments, 'exec-out', 'screencap', '-p'], { windowsHide: true, maxBuffer: 24 * 1024 * 1024 }))
async function bindHome() {
  const processId = adb('shell', 'pidof', application)
  const port = adb('forward', 'tcp:0', 'localabstract:webview_devtools_remote_' + processId)
  ports.push(port)
  let target
  await until(async () => {
    try {
      const targets = await (await fetch('http://127.0.0.1:' + port + '/json/list', { signal: AbortSignal.timeout(2500) })).json()
      target = targets.find(item => item.url.startsWith('http://tauri.localhost/') && !item.url.includes('pageWindow='))
      return !!target
    } catch { return false }
  }, '没有找到可调试的首页 WebView，请先运行 dev:android')
  const client = await connect(target.webSocketDebuggerUrl)
  await until(() => client.evaluate('typeof window.__NATIVE_COMPONENTS_DISMISS__ === "function" && !!document.querySelector("[data-demo-link=button]")'), '首页脚本尚未完成加载')
  return client
}

try {
  assert(adb('shell', 'dumpsys', 'power').includes('mWakefulness=Awake'), '手机未唤醒，请保持解锁、亮屏后运行真机回归')
  // 重启示例以保证根 Activity、WebView 历史和弹层都处于同一初始条件，不清除应用数据。
  launchHome()
  await until(() => at('MainActivity'), '示例首页未进入前台')
  let main = await bindHome()
  assert.equal(await layerActive(main), false, '初始首页存在弹层')
  assert.equal(await main.evaluate('history.length'), 1, '首页已有额外网页历史，不能作为根页面验证')
  const size = [...adb('shell', 'wm', 'size').matchAll(/(\d+)x(\d+)/g)].at(-1)
  assert(size, '读取手机分辨率失败')
  const width = Number(size[1]), height = Number(size[2]), y = Math.round(height * .55)
  assert(width < height, '请将手机切换到竖屏')
  const motion = (action, x) => adb('shell', 'input', 'touchscreen', 'motionevent', action, String(Math.round(x)), String(y))
  const cancel = async name => {
    motion('DOWN', 1)
    for (const x of [width * .1, width * .25, width * .38]) { await pause(70); motion('MOVE', x) }
    screenshot(name + '-progress')
    for (const x of [width * .2, width * .05, 1]) { await pause(70); motion('MOVE', x) }
    motion('UP', 1)
    await pause(500)
  }
  const back = async name => {
    const swipe = spawn('adb', [...adbArguments, 'shell', 'input', 'swipe', '1', String(y), String(Math.round(width * .72)), String(y), '1000'], { windowsHide: true, stdio: 'ignore' })
    const finished = new Promise((resolve, reject) => { swipe.once('error', reject); swipe.once('exit', code => code === 0 ? resolve() : reject(Error('发送返回手势失败'))) })
    await pause(420)
    screenshot(name + '-progress')
    await finished
    await pause(500)
  }
  if (process.argv.includes('--record')) {
    remoteRecording = '/sdcard/Download/my-ui-native-back-' + Date.now() + '.mp4'
    const child = spawn('adb', [...adbArguments, 'shell', 'screenrecord', '--time-limit', '45', remoteRecording], { windowsHide: true, stdio: 'ignore' })
    recording = new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', code => code === 0 ? resolve() : reject(Error('录屏失败'))) })
    recording.catch(() => {})
    await pause(400)
  }

  await cancel('home-cancel')
  assert(at('MainActivity'), '取消首页返回手势后离开了应用')
  reports.push({ name: '首页取消返回后保持原页', passed: true })
  await back('home-back')
  assert(!top().includes(application + '/'), '首页无弹层时返回仍被应用吞掉')
  screenshot('home-back-finished')
  reports.push({ name: '首页无弹层时系统返回桌面', passed: true })

  launchHome()
  await until(() => at('MainActivity'), '没有恢复首页')
  // 系统允许结束根 Activity；恢复时重新绑定当前进程，避免沿用已销毁的 WebView。
  main = await bindHome()
  await main.evaluate('void MyUI.popup.showAlert({title:"系统返回回归",message:"返回先关闭弹层，取消手势保持弹层"})')
  await until(() => layerActive(main), '测试弹层没有打开')
  await pause(350)
  await cancel('overlay-cancel')
  assert(await layerActive(main), '取消返回手势时误关闭了弹层')
  assert(at('MainActivity'), '弹层打开时取消返回离开了首页')
  reports.push({ name: '取消手势不关闭弹层', passed: true })
  await back('overlay-back')
  await until(async () => !await layerActive(main), '提交返回后未释放弹层')
  assert(at('MainActivity'), '关闭弹层的返回手势穿透到了桌面')
  reports.push({ name: '提交返回只关闭最上层弹层', passed: true })
  await back('overlay-released')
  assert(!top().includes(application + '/'), '弹层关闭后仍拦截首页返回')
  reports.push({ name: '弹层关闭后重新交还系统返回', passed: true })

  launchHome()
  await until(() => at('MainActivity'), '没有恢复首页')
  main = await bindHome()
  await main.evaluate('document.querySelector("[data-demo-link=button]").click()')
  await until(() => at('NativePageActivity'), '组件入口没有创建原生子页')
  await pause(600)
  await cancel('child-cancel')
  assert(at('NativePageActivity'), '取消子页返回手势后关闭了子页')
  await back('child-back')
  await until(() => at('MainActivity'), '子页返回没有回到首页')
  assert.equal(await main.evaluate('location.hash'), '#/home', '原生子页返回修改了首页路由')
  reports.push({ name: '子页使用系统返回，取消与提交均保持正确页面栈', passed: true })
  screenshot('finished')
  console.log(JSON.stringify({ passed: true, serial, total: reports.length, reports, output }))
} catch (error) {
  console.error(JSON.stringify({ passed: false, error: String(error), reports, output }))
  process.exitCode = 1
} finally {
  for (const client of clients) client.close()
  for (const port of ports) adb('forward', '--remove', 'tcp:' + port)
  if (recording) {
    try {
      await recording
      adb('pull', remoteRecording, join(output, 'native-back.mp4'))
      if (/^\/sdcard\/Download\/my-ui-native-back-\d+\.mp4$/.test(remoteRecording)) adb('shell', 'rm', remoteRecording)
      console.log('返回过程录屏：' + join(output, 'native-back.mp4'))
    } catch (error) { console.error('录屏未完成：' + error) }
  }
}
