import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createTauriStateStorage } from '../packages/vue/state/tauri'

// 使用实际的官方 JS Store/事件绑定，只把原生 IPC 替换成可检查的应用资源表。
async function withNative(run: (context: ReturnType<typeof createRuntime>) => Promise<void>) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window')
  const context = createRuntime()
  Object.defineProperty(globalThis, 'window', { configurable: true, value: context.window })
  try { await run(context) }
  finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous)
    else Reflect.deleteProperty(globalThis, 'window')
  }
}
function createRuntime() {
  let next = 0, failLoad = false
  const paths = new Map<string, number>()
  const stores = new Map<number, Map<string, unknown>>()
  const callbacks = new Map<number, (event: unknown) => void>()
  const listeners = new Map<number, { event: string; handler: number }>()
  const calls: { command: string; args: any }[] = []
  function notify(rid: number, key: string, value: unknown, exists: boolean) {
    for (const [id, listener] of listeners) callbacks.get(listener.handler)?.({ event: listener.event, id, payload: { resourceId: rid, key, value, exists } })
  }
  const runtime = {
    transformCallback(callback: (event: unknown) => void) { const id = ++next; callbacks.set(id, callback); return id },
    async invoke(command: string, args: any) {
      calls.push({ command, args })
      if (command === 'plugin:store|load') {
        if (failLoad) throw new Error('原生存储权限不足')
        let rid = paths.get(args.path)
        if (!rid) { rid = ++next; paths.set(args.path, rid); stores.set(rid, new Map()) }
        return rid
      }
      if (command === 'plugin:event|listen') { const id = ++next; listeners.set(id, args); return id }
      if (command === 'plugin:event|unlisten') { listeners.delete(args.eventId); return }
      const store = stores.get(args.rid)
      assert.ok(store, '使用了错误的原生资源句柄')
      if (command === 'plugin:store|get') return [store.get(args.key) ?? null, store.has(args.key)]
      if (command === 'plugin:store|set') { store.set(args.key, args.value); notify(args.rid, args.key, args.value, true); return }
      if (command === 'plugin:store|delete') { const removed = store.delete(args.key); notify(args.rid, args.key, null, false); return removed }
      if (command === 'plugin:store|save') return
      throw new Error('未预期的 IPC：' + command)
    },
  }
  return {
    window: { __TAURI_INTERNALS__: runtime, __TAURI_EVENT_PLUGIN_INTERNALS__: { unregisterListener: () => {} } },
    calls, stores, paths, listeners, notify,
    failLoad(value: boolean) { failLoad = value },
  }
}

test('原生适配器合并并发加载，JSON 值不双重编码，显式 flush 调用实际保存', async () => withNative(async native => {
  const storage = createTauriStateStorage('shared.json')
  assert.deepEqual(await Promise.all([storage.getItem('a'), storage.getItem('b')]), [null, null])
  assert.equal(native.calls.filter(call => call.command === 'plugin:store|load').length, 1)
  await storage.setItem('profile', JSON.stringify({ name: '小蓝', tags: [1, 2] }))
  assert.equal(await storage.getItem('profile'), JSON.stringify({ name: '小蓝', tags: [1, 2] }))
  assert.deepEqual(native.stores.values().next().value!.get('profile'), { name: '小蓝', tags: [1, 2] })
  await storage.setItem('empty', 'null')
  assert.equal(await storage.getItem('empty'), 'null')
  await storage.flush!()
  assert.equal(native.calls.at(-1)!.command, 'plugin:store|save')
}))

test('两个 WebView 适配器复用原生资源，变更双向通知且不同文件隔离', async () => withNative(async native => {
  const a = createTauriStateStorage('same.json'), b = createTauriStateStorage('same.json'), other = createTauriStateStorage('other.json')
  const eventsA: (string | null)[] = [], eventsB: (string | null)[] = [], eventsOther: (string | null)[] = []
  const stops = await Promise.all([a.subscribe(key => eventsA.push(key)), b.subscribe(key => eventsB.push(key)), other.subscribe(key => eventsOther.push(key))])
  await a.setItem('count', '3')
  assert.equal(await b.getItem('count'), '3')
  assert.deepEqual(eventsA, ['count']); assert.deepEqual(eventsB, ['count']); assert.deepEqual(eventsOther, [])
  await b.removeItem('count')
  assert.equal(await a.getItem('count'), null)
  assert.deepEqual(eventsA, ['count', 'count'])
  stops.forEach(stop => stop()); await Promise.resolve(); await Promise.resolve()
  assert.equal(native.listeners.size, 0)
}))

test('失败的原生加载不会永久缓存拒绝，下一次操作能够重试', async () => withNative(async native => {
  const storage = createTauriStateStorage('retry.json')
  native.failLoad(true)
  await assert.rejects(storage.getItem('note'), /权限不足/)
  native.failLoad(false)
  await storage.setItem('note', JSON.stringify('恢复'))
  assert.equal(await storage.getItem('note'), JSON.stringify('恢复'))
  assert.equal(native.calls.filter(call => call.command === 'plugin:store|load').length, 2)
}))

test('首页和原生子页均拥有 Store 权限，原生应用已注册对应插件', () => {
  const capability = JSON.parse(readFileSync(new URL('../example/src-tauri/capabilities/default.json', import.meta.url), 'utf8'))
  assert.ok(capability.windows.includes('main') && capability.windows.includes('native-page-*'))
  assert.ok(capability.permissions.includes('store:default'))
  const source = readFileSync(new URL('../example/src-tauri/src/lib.rs', import.meta.url), 'utf8')
  assert.match(source, /\.plugin\(tauri_plugin_store::Builder::default\(\)\.build\(\)\)/)
})
