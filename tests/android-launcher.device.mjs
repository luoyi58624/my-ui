import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// 覆盖开发工具的显式启动与桌面启动器交替进入同一任务，手机需解锁并使用手势导航。
const application = JSON.parse(
  readFileSync(new URL('../examples/tauri/tauri.conf.json', import.meta.url))
).identifier
const serial =
  process.env.ANDROID_SERIAL ||
  execFileSync('adb', ['get-serialno'], { encoding: 'utf8', windowsHide: true }).trim()
assert(serial && serial !== 'unknown', '请连接一台已授权 USB 调试的手机，或指定 ANDROID_SERIAL')
const output = mkdtempSync(join(tmpdir(), 'my-ui-android-launcher-'))
const adbArguments = ['-s', serial],
  ports = [],
  clients = [],
  reports = []
const adb = (...args) =>
  execFileSync('adb', [...adbArguments, ...args], {
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024
  }).trim()
const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
const until = async (check, message) => {
  const started = Date.now()
  while (!(await check())) {
    if (Date.now() - started > 15_000) throw Error(message)
    await pause(100)
  }
}
const top = () =>
  adb('shell', 'dumpsys', 'activity', 'activities')
    .split('\n')
    .find((line) => line.includes('topResumedActivity='))
    ?.trim() ?? ''
const stack = () =>
  adb('shell', 'dumpsys', 'activity', 'activities')
    .split('\n')
    .filter((line) => line.includes('Hist  #') && line.includes(application + '/'))
    .map((line) => line.trim())
const at = (activity) => top().includes(application + '/.' + activity)
const screenshot = (name) =>
  writeFileSync(
    join(output, name + '.png'),
    execFileSync('adb', [...adbArguments, 'exec-out', 'screencap', '-p'], {
      windowsHide: true,
      maxBuffer: 24 * 1024 * 1024
    })
  )

async function connect(target) {
  const socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.onopen = resolve
    socket.onerror = reject
  })
  let sequence = 0
  const pending = new Map()
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data),
      request = pending.get(message.id)
    if (!request) return
    pending.delete(message.id)
    clearTimeout(request.timer)
    message.error ? request.reject(Error(message.error.message)) : request.resolve(message.result)
  }
  socket.onclose = () => {
    for (const request of pending.values()) {
      clearTimeout(request.timer)
      request.reject(Error('WebView 调试连接已关闭'))
    }
    pending.clear()
  }
  const client = {
    async evaluate(expression) {
      const id = ++sequence
      const response = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id)
          reject(Error('WebView 调试超时'))
        }, 7000)
        pending.set(id, { resolve, reject, timer })
        socket.send(
          JSON.stringify({
            id,
            method: 'Runtime.evaluate',
            params: { expression, returnByValue: true }
          })
        )
      })
      if (response.exceptionDetails) throw Error(response.exceptionDetails.text)
      return response.result.value
    },
    close() {
      socket.close()
    }
  }
  clients.push(client)
  return client
}

try {
  assert(adb('shell', 'dumpsys', 'power').includes('mWakefulness=Awake'), '请保持手机解锁、亮屏')
  // 不清除应用数据；刻意保留开发工具不带 MAIN/LAUNCHER 的启动方式，复现录屏的入口差异。
  adb('shell', 'am', 'force-stop', application)
  adb('shell', 'am', 'start', '-W', '-n', application + '/.MainActivity')
  await until(() => at('MainActivity'), '显式启动没有进入首页')
  const processId = adb('shell', 'pidof', application)
  const port = adb('forward', 'tcp:0', 'localabstract:webview_devtools_remote_' + processId)
  ports.push(port)
  let mainTarget
  await until(async () => {
    try {
      const targets = await (
        await fetch('http://127.0.0.1:' + port + '/json/list', {
          signal: AbortSignal.timeout(2500)
        })
      ).json()
      mainTarget = targets.find(
        (item) =>
          item.url.startsWith('http://tauri.localhost/') && !item.url.includes('pageWindow=')
      )
      return !!mainTarget
    } catch {
      return false
    }
  }, '没有找到可调试的首页 WebView')
  const main = await connect(mainTarget)
  await until(
    () => main.evaluate('!!document.querySelector("[data-demo-link=button]")'),
    '首页尚未加载'
  )
  const token = 'launcher-' + Date.now()
  await main.evaluate(
    'globalThis.__launcherRegressionToken=' +
      JSON.stringify(token) +
      ';document.querySelector("[data-demo-link=button]").click()'
  )
  await until(() => at('NativePageActivity'), '没有打开原生子页')
  const parentActivity = top()
  let parentTarget
  await until(async () => {
    const targets = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json()
    parentTarget = targets.find((item) =>
      item.url.includes('pageWindow=1#/example/button')
    )
    return !!parentTarget
  }, '没有找到第一层组件文档的 WebView')
  const parent = await connect(parentTarget)
  await until(
    () =>
      parent.evaluate(
        '!!document.querySelector("[data-demo-page=\\"example/button\\"] .my-button")'
      ),
    '第一层组件示例尚未加载'
  )
  await parent.evaluate(
    'globalThis.__launcherRegressionToken=' +
      JSON.stringify(token) +
      ';window.__TAURI_INTERNALS__.invoke("plugin:native-components|push", {path:"index.html#/shared-state",title:"共享状态"})'
  )
  await until(
    () => at('NativePageActivity') && top() !== parentActivity,
    '没有打开第二层共享状态页'
  )
  await pause(600)
  const child = top(),
    original = stack()
  assert.equal(original.length, 3, '初始页面栈应包含首页、导航文档与共享状态页')
  const launcher = adb(
    'shell',
    'cmd',
    'package',
    'resolve-activity',
    '--brief',
    '-a',
    'android.intent.action.MAIN',
    '-c',
    'android.intent.category.LAUNCHER',
    application
  )
    .split('\n')
    .at(-1)
    .trim()
  assert(launcher.startsWith(application + '/'), '没有找到应用启动入口')
  for (let round = 1; round <= 3; round++) {
    adb('shell', 'input', 'keyevent', 'KEYCODE_HOME')
    await until(() => !top().includes(application + '/'), '没有切换到桌面')
    adb(
      'shell',
      'am',
      'start',
      '-W',
      '-a',
      'android.intent.action.MAIN',
      '-c',
      'android.intent.category.LAUNCHER',
      '-f',
      '0x10200000',
      '-n',
      launcher
    )
    await pause(700)
    assert.equal(top(), child, '桌面重进没有恢复同一个子页：' + JSON.stringify(stack()))
    assert.deepEqual(stack(), original, '桌面重进增加或丢失了页面')
    assert.equal(
      await main.evaluate('globalThis.__launcherRegressionToken'),
      token,
      '首页 WebView 被重建'
    )
    reports.push({ name: `第 ${round} 次桌面重进保留子页、首页实例与完整返回栈`, passed: true })
  }
  screenshot('child-restored')
  const size = [...adb('shell', 'wm', 'size').matchAll(/(\d+)x(\d+)/g)].at(-1)
  assert(size, '读取手机分辨率失败')
  const width = Number(size[1]),
    y = Math.round(Number(size[2]) * 0.55)
  const motion = (action, x) =>
    adb('shell', 'input', 'touchscreen', 'motionevent', action, String(Math.round(x)), String(y))
  motion('DOWN', 1)
  for (const x of [width * 0.1, width * 0.25, width * 0.38, width * 0.2, width * 0.05, 1]) {
    await pause(70)
    motion('MOVE', x)
  }
  motion('UP', 1)
  await pause(500)
  assert.equal(top(), child, '取消侧滑后关闭或替换了共享状态页')
  assert.deepEqual(stack(), original, '取消侧滑改变了原生页面栈')
  reports.push({ name: '重进后取消侧滑保留两层子页', passed: true })
  const backGesture = () =>
    adb(
      'shell',
      'input',
      'swipe',
      '1',
      String(y),
      String(Math.round(width * 0.72)),
      String(y),
      '1000'
    )
  backGesture()
  await until(
    () => top() === parentActivity && stack().length === 2,
    '重进后提交侧滑没有回到原有导航文档'
  )
  assert.equal(
    await parent.evaluate('globalThis.__launcherRegressionToken'),
    token,
    '导航文档 WebView 被重建'
  )
  reports.push({ name: '第一次侧滑只关闭共享状态页，保留原有导航文档', passed: true })
  screenshot('parent-restored')
  backGesture()
  await until(() => at('MainActivity') && stack().length === 1, '第二次侧滑没有回到唯一首页')
  assert.equal(stack().length, 1, '返回后仍残留重复首页或子页')
  assert.equal(
    await main.evaluate('globalThis.__launcherRegressionToken'),
    token,
    '返回时丢失首页实例'
  )
  assert.equal(await main.evaluate('location.hash'), '#/home', '原生返回改变了首页路由')
  reports.push({ name: '侧滑提交返回原有首页，不退出到桌面或留下重复页面', passed: true })
  screenshot('back-finished')
  // 桌面入口在任务不存在时也必须能冷启动，不能只修复已有任务的恢复。
  adb('shell', 'am', 'force-stop', application)
  adb(
    'shell',
    'am',
    'start',
    '-W',
    '-a',
    'android.intent.action.MAIN',
    '-c',
    'android.intent.category.LAUNCHER',
    '-n',
    launcher
  )
  await until(() => at('MainActivity') && stack().length === 1, '桌面入口冷启动没有进入唯一首页')
  const coldPort = adb(
    'forward',
    'tcp:0',
    'localabstract:webview_devtools_remote_' + adb('shell', 'pidof', application)
  )
  ports.push(coldPort)
  let coldTarget
  await until(async () => {
    try {
      const targets = await (
        await fetch('http://127.0.0.1:' + coldPort + '/json/list', {
          signal: AbortSignal.timeout(2500)
        })
      ).json()
      coldTarget = targets.find(
        (item) =>
          item.url.startsWith('http://tauri.localhost/') && !item.url.includes('pageWindow=')
      )
      return !!coldTarget
    } catch {
      return false
    }
  }, '桌面冷启动后没有创建首页 WebView')
  const cold = await connect(coldTarget)
  await until(
    () => cold.evaluate('!!document.querySelector("[data-demo-link=button]")'),
    '桌面冷启动后首页没有完成渲染'
  )
  reports.push({ name: '桌面入口冷启动创建唯一首页并正常渲染', passed: true })
  screenshot('cold-launcher')
  const result = { passed: true, serial, total: reports.length, reports, output }
  writeFileSync(join(output, 'result.json'), JSON.stringify(result, null, 2))
  console.log(JSON.stringify(result))
} catch (error) {
  screenshot('failure')
  const result = { passed: false, error: String(error), stack: stack(), reports, output }
  writeFileSync(join(output, 'result.json'), JSON.stringify(result, null, 2))
  console.error(JSON.stringify(result))
  process.exitCode = 1
} finally {
  for (const client of clients) client.close()
  for (const port of ports) adb('forward', '--remove', 'tcp:' + port)
}
