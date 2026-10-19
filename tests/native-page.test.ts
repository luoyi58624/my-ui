import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

let instance = 0
async function withRuntime(run: (api: any) => Promise<void>) {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  const calls: string[] = []
  let response: () => unknown = () => undefined
  const runtime = { __TAURI__: { core: { invoke: (command: string) => { calls.push(command); return Promise.resolve().then(response) } } } }
  const agent = { userAgent: 'Android' }
  Object.defineProperty(globalThis, 'window', { configurable: true, value: runtime })
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: agent })
  try {
    const source = readFileSync(new URL('../example/src/native-page.ts', import.meta.url), 'utf8')
    const js = new Bun.Transpiler({ loader: 'ts' }).transformSync(source) + '\n// instance ' + ++instance
    const api = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'))
    await run({ ...api, calls, agent, runtime, respond: (next: () => unknown) => { response = next } })
  } finally {
    for (const [name, previous] of [['window', previousWindow], ['navigator', previousNavigator]] as const) {
      if (previous) Object.defineProperty(globalThis, name, previous)
      else Reflect.deleteProperty(globalThis, name)
    }
  }
}

test('Android 原生打开只发送应用命令，连续激活不会重复创建 Activity', async () => withRuntime(async api => {
  let resolve!: () => void
  api.respond(() => new Promise<void>(done => { resolve = done }))
  const first = api.openNativePage(), second = api.openNativePage()
  assert.equal(first, second)
  await Promise.resolve(); await Promise.resolve()
  assert.deepEqual(api.calls, ['open_native_page'])
  resolve()
  await Promise.all([first, second])
  api.respond(() => undefined)
  await api.openNativePage()
  assert.equal(api.calls.length, 2)
}))

test('创建失败后保留错误，下一次可以重新打开', async () => withRuntime(async api => {
  api.respond(() => { throw new Error('Android version unsupported') })
  await assert.rejects(api.openNativePage(), /Android version unsupported/)
  api.respond(() => undefined)
  await api.openNativePage()
  assert.equal(api.calls.length, 2)
}))

test('返回使用原生关闭命令，不操作浏览器历史', async () => withRuntime(async api => {
  await api.closeNativePage()
  assert.deepEqual(api.calls, ['close_native_page'])
}))

test('普通浏览器与桌面壳不会发起 Android 原生页面命令', async () => withRuntime(async api => {
  api.agent.userAgent = 'Windows NT 10.0'
  assert.equal(api.canOpenNativePage(), false)
  await assert.rejects(api.openNativePage(), /Android App/)
  await assert.rejects(api.closeNativePage(), /Android App/)
  api.agent.userAgent = 'Android'
  api.runtime.__TAURI__ = undefined
  assert.equal(api.canOpenNativePage(), false)
  await assert.rejects(api.openNativePage(), /Android App/)
  assert.deepEqual(api.calls, [])
}))

test('独立原生页继续拥有核心与系统字重权限', () => {
  for (const file of ['default.json', 'mobile.json']) {
    const config = JSON.parse(readFileSync(new URL('../example/src-tauri/capabilities/' + file, import.meta.url), 'utf8'))
    assert.ok(config.windows.includes('main'))
    assert.ok(config.windows.includes('native-page-*'))
  }
})
