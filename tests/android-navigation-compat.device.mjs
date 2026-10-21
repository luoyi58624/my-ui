import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// 在不支持 Tauri 多窗口的设备上验证真实路由、原生返回与保活，不清除应用数据。
const application = JSON.parse(readFileSync(new URL('../example/src-tauri/tauri.conf.json', import.meta.url))).identifier
const serial = process.env.ANDROID_SERIAL || execFileSync('adb', ['get-serialno'], { encoding: 'utf8', windowsHide: true }).trim()
assert(serial && serial !== 'unknown', '请连接设备或指定 ANDROID_SERIAL')
assert(process.argv.slice(2).every(value => value === '--record'), '用法：node tests/android-navigation-compat.device.mjs [--record]')
const adb = (...args) => execFileSync('adb', ['-s', serial, ...args], { encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024 }).trim()
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
const until = async (check, message) => {
  const start = Date.now()
  while (!await check()) { if (Date.now() - start > 20000) throw Error(message); await pause(80) }
}
const output = mkdtempSync(join(tmpdir(), 'my-ui-nav-compat-')), reports = []
const screenshot = name => writeFileSync(join(output, name + '.png'), execFileSync('adb', ['-s', serial, 'exec-out', 'screencap', '-p'], { windowsHide: true, maxBuffer: 24 * 1024 * 1024 }))
const activities = () => adb('shell', 'dumpsys', 'activity', 'activities')
const foreground = () => activities().split('\n').find(line => /topResumedActivity=|mResumedActivity:/.test(line)) || ''
const footer = () => adb('shell', 'dumpsys', 'activity', application).match(/BottomNavigationView\{([a-f0-9]+) [^\n]*/)?.[1]
const webViewParent = () => {
  const lines = adb('shell', 'dumpsys', 'activity', application).split('\n'), index = lines.findIndex(line => line.includes('RustWebView{'))
  assert(index >= 0, '主 WebView 不存在')
  const indent = lines[index].match(/^\s*/)[0].length
  return lines.slice(0, index).reverse().find(line => line.trim() && line.match(/^\s*/)[0].length < indent)?.match(/\{([a-f0-9]+)/)?.[1]
}
const launch = () => adb('shell', 'am', 'start', '-W', '-a', 'android.intent.action.MAIN', '-c', 'android.intent.category.LAUNCHER', '-n', application + '/.LauncherActivity')
let socket, port, sequence = 0, recording, recordPid, video
const requests = new Map()
const evaluate = expression => new Promise((resolve, reject) => {
  const id = ++sequence, timer = setTimeout(() => { requests.delete(id); reject(Error('WebView 读取超时')) }, 10000)
  requests.set(id, { timer, reject, resolve })
  socket.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, returnByValue: true, awaitPromise: true } }))
})
const route = path => evaluate('location.hash === ' + JSON.stringify('#' + path))
const openInput = async () => {
  await evaluate('document.querySelector("[data-demo-link=input]").click()')
  await until(async () => await route('/example/input') && await evaluate('!!document.querySelector(".demo-detail:not([inert]) input")'), '旧版详情未打开')
  await pause(200)
}
const systemBack = () => adb('shell', 'input', 'keyevent', '4')

try {
  const sdk = Number(adb('shell', 'getprop', 'ro.build.version.sdk'))
  const logStart = Number(adb('shell', 'date', '+%s'))
  assert(sdk < 32, '本检查面向 API 32 以下设备；新版独立 Activity 使用 android-page-entry.device.mjs 验证')
  adb('shell', 'am', 'force-stop', application)
  launch()
  const pid = adb('shell', 'pidof', application)
  port = adb('forward', 'tcp:0', 'localabstract:webview_devtools_remote_' + pid)
  let target
  await until(async () => {
    try { target = (await (await fetch('http://127.0.0.1:' + port + '/json/list')).json()).find(item => item.url.includes('tauri.localhost')); return !!target }
    catch { return false }
  }, '没有可调试的主 WebView，请安装调试包')
  // 旧版 WebView 不支持 Playwright 的浏览器上下文命令，直接使用目标调试协议。
  socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
  socket.onmessage = event => {
    const message = JSON.parse(event.data), request = requests.get(message.id)
    if (!request) return
    requests.delete(message.id); clearTimeout(request.timer)
    if (message.error || message.result.exceptionDetails) request.reject(Error(JSON.stringify(message.error || message.result.exceptionDetails)))
    else request.resolve(message.result.result.value)
  }
  socket.onclose = () => {
    for (const request of requests.values()) { clearTimeout(request.timer); request.reject(Error('WebView 已关闭')) }
    requests.clear()
  }
  await until(() => evaluate('!!document.querySelector("[data-demo-link=input]") && typeof __NATIVE_COMPONENTS_DISMISS__ === "function"'), '首页未就绪')
  assert.equal(await evaluate('window.__TAURI_INTERNALS__.invoke("plugin:app|supports_multiple_windows")'), false)
  assert.equal(await evaluate('history.state.back'), null)
  const bottom = footer()
  const parent = webViewParent()
  assert(bottom, '原生底栏没有就绪')
  assert(parent, 'WebView 父布局没有就绪')
  await evaluate('window.__compat = { app: document.querySelector(".demo-app"), bar: document.querySelector(".nc-app-tabbar"), home: document.querySelector("[data-demo-page=home]") }; __compat.home.scrollTop = 380')
  await pause(150)
  const scroll = await evaluate('__compat.home.scrollTop')
  await evaluate(`(() => {
    window.__compat.frames = [];
    const sample = () => {
      const view = location.hash === '#/shared-state' ? document.querySelector('.native-page.nc-page') : document.querySelector('.demo-view:not([inert])');
      const head = view?.querySelector('.demo-top, .nc-page-navbar'), body = view?.querySelector('.demo-page, .nc-page-body');
      if (head && body) __compat.frames.push({ route: location.hash, header: head.getBoundingClientRect().height, body: body.getBoundingClientRect().top, viewport: innerHeight });
      __compat.frame = requestAnimationFrame(sample);
    }; sample();
  })()`)
  if (process.argv.includes('--record')) {
    const recorders = () => adb('shell', 'ps', '-A').split('\n').filter(line => line.includes('screenrecord')).map(line => line.trim().split(/\s+/)[1])
    const previous = recorders()
    video = '/sdcard/Download/my-ui-navigation-frames-' + Date.now() + '.mp4'
    const child = spawn('adb', ['-s', serial, 'shell', 'screenrecord', '--time-limit', '30', video], { windowsHide: true, stdio: 'ignore' })
    recording = new Promise(resolve => child.once('exit', resolve))
    await pause(250); recordPid = recorders().find(pid => !previous.includes(pid))
  }

  await openInput()
  assert(foreground().includes('.MainActivity'), '旧版导航错误创建子 Activity')
  assert(!activities().includes(application + '/.NativePageActivity'), '旧版仍进入 Tauri 多窗口路径')
  assert(await evaluate('__compat.bar.hidden && document.querySelector(".demo-app") === __compat.app'))
  await evaluate('window.__compat.input = document.querySelector(".demo-detail:not([inert]) input"); __compat.input.value = "legacy-state"; __compat.input.dispatchEvent(new Event("input", {bubbles:true}))')
  screenshot('legacy-detail')
  reports.push({ name: '旧版 Android 自动使用同窗口详情，不创建子 Activity', passed: true })

  await evaluate('void MyUI.popup.showAlert({title:"返回检查",message:"先关闭弹层，再返回页面"})')
  await pause(350)
  systemBack()
  await until(() => evaluate('(()=>{let active; const stop=MyUI.layers.subscribe(value=>active=value); stop(); return !active})()'), '系统返回未关闭弹层')
  assert(await route('/example/input'), '关闭弹层时返回穿透到了目录')
  reports.push({ name: '系统返回优先关闭弹层，保留详情', passed: true })

  await pause(200); systemBack()
  await until(() => route('/home'), '系统返回没有回到目录')
  assert(foreground().includes('.MainActivity'), '详情返回误退出主 Activity')
  assert.equal(await evaluate('__compat.home.scrollTop'), scroll)
  assert.equal(footer(), bottom, '返回重建了原生底栏')
  assert(await evaluate('document.querySelector(".demo-app") === __compat.app && !__compat.bar.hidden'))
  await openInput()
  assert(await evaluate('document.querySelector(".demo-detail:not([inert]) input") === __compat.input && __compat.input.value === "legacy-state"'))
  reports.push({ name: '系统返回保留 App、底栏、目录滚动和详情输入实例', passed: true })

  // 从原生目录详情进入独立父路由，再连续返回原详情和原目录。
  systemBack(); await until(() => route('/home'), '重新进入后无法返回')
  await evaluate('document.querySelector(".nc-app-tabbar [aria-label=原生]").click()')
  await until(() => route('/native'), '原生目录未打开')
  await evaluate('document.querySelector("[data-demo-link=native-navigation]").click()')
  await until(() => evaluate('!!document.querySelector(".demo-detail:not([inert]) .native-navigation-actions")'), '原生页面文档未加载')
  await evaluate('[...document.querySelectorAll(".demo-detail:not([inert]) .native-navigation-actions button")].find(node=>node.textContent.includes("打开原生页面")).click()')
  await until(() => route('/shared-state'), '多层页面未打开')
  await pause(200); systemBack()
  await until(() => route('/example/native-navigation'), '多层系统返回未恢复详情')
  assert(await evaluate('document.querySelector(".demo-app") === __compat.app && __compat.input.value === "legacy-state"'))
  await pause(200); systemBack()
  await until(() => route('/native'), '连续返回未回到目录')
  assert.equal(footer(), bottom, '跨父路由返回重建了底栏')
  assert.equal(webViewParent(), parent, '跨页面容器返回重新挂载了 WebView')
  reports.push({ name: '跨父路由的多层页面连续返回，仍保留详情状态', passed: true })
  // 覆盖最后一次交接的超时窗口，不能在兜底放行之前就判为成功。
  await pause(600)
  const frames = await evaluate('cancelAnimationFrame(__compat.frame); __compat.frames')
  writeFileSync(join(output, 'frames.json'), JSON.stringify(frames, null, 2))
  assert(frames.length > 20, '逐帧采样不足')
  const displaced = frames.filter(frame => frame.header > .5 || Math.abs(frame.body) > .5)
  assert.deepEqual(displaced, [], '导航交接中出现重复 Web 导航占位或正文位移')
  const timeouts = adb('logcat', '-d', '-v', 'epoch', '-s', 'NativePageFrame:W', '*:S').split('\n')
    .filter(line => Number(line.match(/^\s*(\d+\.\d+)/)?.[1]) >= logStart && line.includes('准备超时'))
  assert.deepEqual(timeouts, [], '绘制交接依赖超时放行，未等待到稳定帧')
  reports.push({ name: '逐帧无重复导航占位和正文下移，原生绘制确认未超时', passed: true, frames: frames.length })

  // 独立验证直达链接：替换根入口再刷新，不伪造一条上一页记录。
  await evaluate('history.replaceState(null,"","#/example/button"); location.reload()')
  await until(() => evaluate('!!document.querySelector(".demo-detail:not([inert]) .my-button") && typeof __NATIVE_COMPONENTS_DISMISS__ === "function"'), '直达详情未加载')
  assert.equal(await evaluate('history.state.back'), null)
  await evaluate('document.querySelector(".demo-view:not([inert]) .demo-top [aria-label=返回组件列表]").click()')
  await until(() => route('/home'), '直达详情的顶栏返回未回到目录')
  assert.equal(await evaluate('history.state.back'), null)
  assert.equal(await evaluate('__NATIVE_COMPONENTS_DISMISS__()'), false)
  screenshot('legacy-home')
  reports.push({ name: '直达详情返回目录，不误关主 Activity 或增加返回历史', passed: true })

  await pause(250); systemBack()
  await until(() => !foreground().includes(application + '/'), '根页面仍拦截系统返回')
  reports.push({ name: '根页面没有可返回内容时交还系统，正常退出到桌面', passed: true })
  launch()
  writeFileSync(join(output, 'report.json'), JSON.stringify({ serial, sdk, reports }, null, 2))
  console.log(JSON.stringify({ output, serial, sdk, reports }))
} catch (error) {
  screenshot('failure')
  console.error(JSON.stringify({ output, error: String(error.stack || error), reports }))
  process.exitCode = 1
} finally {
  if (recordPid) {
    try { adb('shell', 'kill', '-2', recordPid) } catch { /* 本轮录屏已经结束。 */ }
    await recording
    adb('pull', video, join(output, 'navigation.mp4'))
    // 模拟器可能在录屏进程退出后短暂占用文件，只重试清理本轮文件。
    await until(() => { try { adb('shell', 'rm', '-f', video); return true } catch { return false } }, '本轮录屏文件仍被模拟器占用')
  }
  socket?.close()
  if (port) adb('forward', '--remove', 'tcp:' + port)
}
