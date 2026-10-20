import assert from 'node:assert/strict'
import { installNativeOverlayBack } from '../example/src/overlay-back'
import test from 'node:test'

const settle = async () => { for (let i = 0; i < 16; i++) await Promise.resolve() }
async function withRuntime(run: (api: any) => Promise<void>) {
  const previous = new Map(['window', 'navigator', 'MyUI', 'isTauri'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  const runtime = Object.assign(new EventTarget(), { __TAURI__: { core: { invoke: (command: string, args: any) => {
    calls.push({ command, ...args })
    return respond(args.enabled)
  } } } })
  const calls: { command: string; enabled: boolean }[] = []
  let respond = (_: boolean): Promise<void> => Promise.resolve(), listener: ((active: boolean) => void) | undefined
  const layers = { subscribe(next: typeof listener) { listener = next; next?.(false); return () => { listener = undefined } } }
  const agent = { userAgent: 'Android' }
  for (const [key, value] of Object.entries({ window: runtime, navigator: agent, MyUI: { layers } }))
    Object.defineProperty(globalThis, key, { configurable: true, value })
  Object.defineProperty(runtime, '__TAURI_INTERNALS__', { get: () => runtime.__TAURI__?.core })
  Object.defineProperty(globalThis, 'isTauri', { configurable: true, get: () => Boolean(runtime.__TAURI__) })
  try {
    await run({ installNativeOverlayBack, calls, runtime, agent, emit: (active: boolean) => listener?.(active), respond: (next: typeof respond) => { respond = next } })
  } finally {
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else Reflect.deleteProperty(globalThis, key)
    }
  }
}

test('当前 WebView 的弹层打开和退出完成分别启用、释放原生返回', () => withRuntime(async api => {
  const stop = api.installNativeOverlayBack()
  await settle(); api.emit(true); await settle(); api.emit(false); await settle()
  assert.deepEqual(api.calls, [false, true, false].map(enabled => ({ command: 'plugin:native-components|set_back_handler', enabled })))
  stop(); await settle()
}))

test('异步桥接串行并合并最新状态，旧请求不能覆盖新弹层状态', () => withRuntime(async api => {
  let finish!: () => void
  api.respond(() => new Promise<void>(resolve => { finish = resolve }))
  const stop = api.installNativeOverlayBack()
  api.emit(true); api.emit(false); api.emit(true)
  assert.deepEqual(api.calls.map((call: any) => call.enabled), [false])
  api.respond(() => Promise.resolve()); finish(); await settle()
  assert.deepEqual(api.calls.map((call: any) => call.enabled), [false, true])
  stop(); await settle()
  assert.equal(api.calls.at(-1).enabled, false)
}))

test('卸载取消订阅并在未完成的启用请求后恢复原生返回', () => withRuntime(async api => {
  const stop = api.installNativeOverlayBack(); await settle()
  let finish!: () => void
  api.respond(() => new Promise<void>(resolve => { finish = resolve }))
  api.emit(true); stop(); api.emit(true)
  api.respond(() => Promise.resolve()); finish(); await settle()
  assert.deepEqual(api.calls.map((call: any) => call.enabled), [false, true, false])
}))

test('页面隐藏后释放，恢复时重新同步仍打开的弹层', () => withRuntime(async api => {
  const stop = api.installNativeOverlayBack(); await settle(); api.emit(true); await settle()
  api.runtime.dispatchEvent(new Event('pagehide')); await settle()
  api.runtime.dispatchEvent(new Event('pageshow')); await settle()
  assert.deepEqual(api.calls.map((call: any) => call.enabled), [false, true, false, true])
  stop(); await settle()
}))

test('浏览器和桌面壳不接管系统返回', () => withRuntime(async api => {
  api.agent.userAgent = 'Windows NT 10.0'; api.installNativeOverlayBack()()
  api.agent.userAgent = 'Android'; api.runtime.__TAURI__ = undefined; api.installNativeOverlayBack()()
  await settle(); assert.deepEqual(api.calls, [])
}))

test('桥接失败不产生未处理拒绝，下次恢复页面可重试', () => withRuntime(async api => {
  const original = console.error, errors: any[] = []
  console.error = (...args) => errors.push(args)
  try {
    api.respond(() => Promise.reject(new Error('bridge unavailable')))
    const stop = api.installNativeOverlayBack(); await settle()
    assert.equal(errors.length, 1)
    api.respond(() => Promise.resolve()); api.runtime.dispatchEvent(new Event('pageshow')); await settle()
    assert.equal(api.calls.length, 2)
    stop(); await settle()
  } finally { console.error = original }
}))
