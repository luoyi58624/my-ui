import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { computed, createApp, nextTick, ref } from 'vue'
import { createPinia, defineStore, disposePinia, type Pinia } from 'pinia'
import { createSharedStatePlugin, sharedStateKey, type SharedStateStorage } from '../packages/vue/state'

const owned: Pinia[] = []
afterEach(() => { for (const pinia of owned.splice(0)) disposePinia(pinia) })
const key = (field: string) => sharedStateKey('demo', field)
const pause = async () => { for (let i = 0; i < 25; i++) { await Promise.resolve(); await nextTick() } }
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => { resolve = done })
  return { promise, resolve }
}
function memory() {
  const values = new Map<string, string>()
  const listeners = new Set<(key: string | null) => void>()
  const writes: [string, string][] = []
  let read: ((key: string, value: string | null) => Promise<string | null>) | undefined
  let write: ((key: string, value: string) => Promise<void>) | undefined
  const storage: SharedStateStorage = {
    async getItem(key) { const value = values.get(key) ?? null; return read ? read(key, value) : value },
    async setItem(key, value) {
      await write?.(key, value)
      values.set(key, value); writes.push([key, value]); listeners.forEach(listener => listener(key))
    },
    async removeItem(key) { values.delete(key); listeners.forEach(listener => listener(key)) },
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener) } },
  }
  return { storage, values, listeners, writes, read: (next: typeof read) => { read = next }, write: (next: typeof write) => { write = next } }
}
function useTestStore(storage: SharedStateStorage, shared: boolean | { key?: string; pick?: readonly string[] } = true) {
  const pinia = createPinia().use(createSharedStatePlugin({ storage }))
  owned.push(pinia)
  createApp({ render: () => null }).use(pinia)
  const store = defineStore('demo', { state: () => ({ note: '初始备注', count: 0, detail: { tags: ['初始'] }, transient: false }), shared })(pinia)
  return { store, pinia }
}

test('恢复缓存不写入默认值；刷新或新页面可继续读取已保存数据', async () => {
  const cache = memory()
  cache.values.set(key('note'), JSON.stringify('已保存的备注'))
  const { store } = useTestStore(cache.storage)
  await store.$shared!.ready
  assert.equal(store.note, '已保存的备注')
  assert.equal(store.count, 0)
  assert.equal(cache.writes.length, 0)
  store.count = 12
  await store.$shared!.flush()
  const other = useTestStore(cache.storage).store
  await other.$shared!.ready
  assert.equal(other.note, store.note)
  assert.equal(other.count, 12)
})

test('两个真实 Pinia 实例双向同步，不发生写回循环', async () => {
  const cache = memory(), a = useTestStore(cache.storage).store, b = useTestStore(cache.storage).store
  await Promise.all([a.$shared!.ready, b.$shared!.ready])
  a.note = '来自首页'
  await a.$shared!.flush(); await pause()
  assert.equal(b.note, '来自首页')
  b.count = 7
  await b.$shared!.flush(); await pause()
  assert.equal(a.count, 7)
  assert.equal(cache.writes.length, 2)
  assert.equal(cache.listeners.size, 2)
})

test('直接修改或删除本地数据会更新内存；删除恢复独立的初始值', async () => {
  const cache = memory(), { store } = useTestStore(cache.storage)
  await store.$shared!.ready
  await cache.storage.setItem(key('note'), JSON.stringify('本地直接更新'))
  await pause()
  assert.equal(store.note, '本地直接更新')
  await cache.storage.removeItem(key('note')); await pause()
  assert.equal(store.note, '初始备注')
  await cache.storage.setItem(key('detail'), JSON.stringify({ tags: ['新的'] })); await pause()
  assert.deepEqual([...store.detail.tags], ['新的'])
  await cache.storage.removeItem(key('detail')); await pause()
  assert.deepEqual([...store.detail.tags], ['初始'])
  assert.equal(cache.writes.length, 2)
})

test('两个页面同时修改不同字段，不会用整份旧快照覆盖对方', async () => {
  const cache = memory(), a = useTestStore(cache.storage).store, b = useTestStore(cache.storage).store
  await Promise.all([a.$shared!.ready, b.$shared!.ready])
  a.note = '新备注'; b.count = 9
  await Promise.all([a.$shared!.flush(), b.$shared!.flush()]); await pause()
  assert.equal(a.count, 9); assert.equal(b.note, '新备注')
  assert.equal(cache.values.get(key('note')), JSON.stringify('新备注'))
  assert.equal(cache.values.get(key('count')), '9')
})

test('同时修改同一字段时收敛到存储中的最后结果，不提供原子递增', async () => {
  const cache = memory(), a = useTestStore(cache.storage).store, b = useTestStore(cache.storage).store
  await Promise.all([a.$shared!.ready, b.$shared!.ready])
  a.count = 1; b.count = 2
  await Promise.all([a.$shared!.flush(), b.$shared!.flush()]); await pause()
  const final = JSON.parse(cache.values.get(key('count'))!)
  assert.equal(a.count, final); assert.equal(b.count, final)
  assert.equal(cache.writes.length, 2)
})

test('同一轮连续编辑合并保存，异步保存过程中仍保持最新编辑', async () => {
  const cache = memory(), { store } = useTestStore(cache.storage)
  await store.$shared!.ready
  store.count = 1; store.count = 2; store.count = 3
  await store.$shared!.flush()
  assert.deepEqual(cache.writes, [[key('count'), '3']])
  const gate = deferred<void>()
  cache.write(async (_key, value) => { if (value === '4') await gate.promise })
  store.count = 4; await pause()
  store.count = 5; store.count = 6
  gate.resolve()
  await store.$shared!.flush()
  assert.equal(store.count, 6)
  assert.equal(cache.values.get(key('count')), '6')
  assert.deepEqual(cache.writes.map(item => item[1]), ['3', '4', '6'])
})

test('首次读取迟到时，不覆盖用户已经输入的值', async () => {
  const cache = memory(), gate = deferred<string | null>()
  cache.values.set(key('note'), JSON.stringify('旧缓存'))
  let first = true
  cache.read(async (field, value) => {
    if (field === key('note') && first) { first = false; return gate.promise }
    return value
  })
  const { store } = useTestStore(cache.storage)
  await pause()
  store.note = '用户的新输入'
  gate.resolve(JSON.stringify('旧缓存'))
  await store.$shared!.flush()
  assert.equal(store.note, '用户的新输入')
  assert.equal(cache.values.get(key('note')), JSON.stringify('用户的新输入'))
})

test('较早的读取不能覆盖较新的存储通知', async () => {
  const cache = memory(), { store } = useTestStore(cache.storage)
  await store.$shared!.ready
  const gate = deferred<string | null>()
  let first = true
  cache.read(async (field, value) => {
    if (field === key('note') && first) { first = false; return gate.promise }
    return value
  })
  const older = store.$shared!.refresh()
  await pause()
  await cache.storage.setItem(key('note'), JSON.stringify('最新缓存')); await pause()
  gate.resolve(JSON.stringify('过期读取')); await older
  assert.equal(store.note, '最新缓存')
})

test('收到过期通知时重新读取缓存，不应用通知中的历史内容', async () => {
  const cache = memory(), { store } = useTestStore(cache.storage)
  await store.$shared!.ready
  cache.values.set(key('count'), '20')
  cache.listeners.forEach(listener => listener(key('count')))
  cache.values.set(key('count'), '30')
  cache.listeners.forEach(listener => listener(key('count')))
  await pause()
  assert.equal(store.count, 30)
  assert.equal(cache.writes.length, 0)
})

test('重新刷新补齐后台遗漏的通知；全部清空恢复初始状态', async () => {
  const cache = memory(), { store } = useTestStore(cache.storage)
  await store.$shared!.ready
  cache.values.set(key('count'), '8')
  assert.equal(store.count, 0)
  await store.$shared!.refresh()
  assert.equal(store.count, 8)
  cache.values.clear(); cache.listeners.forEach(listener => listener(null)); await pause()
  assert.equal(store.count, 0)
  assert.equal(cache.writes.length, 0)
})

test('按字段选择共享范围，嵌套对象和数组正确替换而不残留旧属性', async () => {
  const cache = memory(), a = useTestStore(cache.storage, { pick: ['detail'] }).store, b = useTestStore(cache.storage, { pick: ['detail'] }).store
  await Promise.all([a.$shared!.ready, b.$shared!.ready])
  a.transient = true; a.note = '本页内容'; a.detail.tags.push('第二条')
  await a.$shared!.flush(); await pause()
  assert.deepEqual([...b.detail.tags], ['初始', '第二条'])
  assert.equal(b.transient, false); assert.equal(b.note, '初始备注')
  await cache.storage.setItem(key('detail'), JSON.stringify({ tags: [] })); await pause()
  assert.deepEqual([...a.detail.tags], []); assert.deepEqual([...b.detail.tags], [])
  assert.deepEqual([...cache.values.keys()], [key('detail')])
})

test('Pinia $patch 与 $reset 可以持续同步，未开启的 store 完全不订阅', async () => {
  const cache = memory(), shared = useTestStore(cache.storage).store
  const local = useTestStore(cache.storage, false).store
  assert.equal(local.$shared, undefined)
  await shared.$shared!.ready
  shared.$patch({ note: '修改', count: 4 }); await shared.$shared!.flush()
  shared.$reset(); await shared.$shared!.flush()
  assert.equal(cache.values.get(key('count')), '0')
  assert.equal(cache.values.get(key('note')), JSON.stringify('初始备注'))
  assert.equal(cache.listeners.size, 1)
})

test('Setup store 同样支持 shared，派生 getter 不进入缓存', async () => {
  const cache = memory(), pinia = createPinia().use(createSharedStatePlugin({ storage: cache.storage }))
  owned.push(pinia); createApp({ render: () => null }).use(pinia)
  const store = defineStore('demo', () => {
    const count = ref(0), doubled = computed(() => count.value * 2)
    return { count, doubled }
  }, { shared: true })(pinia)
  await store.$shared!.ready
  store.count = 3; await store.$shared!.flush()
  assert.equal(store.doubled, 6)
  assert.deepEqual([...cache.values.keys()], [key('count')])
})

test('缓存损坏不覆盖当前状态，错误可观察，修复后可恢复同步', async () => {
  const cache = memory()
  cache.values.set(key('note'), '{bad json'); cache.values.set(key('count'), '6')
  const { store } = useTestStore(cache.storage)
  const error = computed(() => store.$shared?.error?.message)
  await store.$shared!.ready
  assert.equal(store.note, '初始备注'); assert.equal(store.count, 6)
  assert.ok(error.value)
  await cache.storage.setItem(key('note'), JSON.stringify('已修复'))
  await store.$shared!.refresh()
  assert.equal(store.note, '已修复'); assert.equal(error.value, undefined)
})

test('保存失败保留用户输入与待写数据，可显式重试，不假报保存成功', async () => {
  const cache = memory(), { store } = useTestStore(cache.storage)
  await store.$shared!.ready
  cache.write(async () => { throw new Error('磁盘不可用') })
  store.note = '离线编辑'
  await pause()
  await assert.rejects(store.$shared!.flush(), /磁盘不可用/)
  assert.equal(store.note, '离线编辑')
  assert.match(store.$shared!.error!.message, /磁盘不可用/)
  await store.$shared!.refresh()
  assert.equal(store.note, '离线编辑')
  assert.match(store.$shared!.error!.message, /磁盘不可用/)
  cache.write(undefined)
  await store.$shared!.flush()
  assert.equal(cache.values.get(key('note')), JSON.stringify('离线编辑'))
  assert.equal(store.$shared!.error, null)
})

test('不支持的运行时值与循环引用不会污染缓存，恢复普通值后可继续保存', async () => {
  const cache = memory(), { store } = useTestStore(cache.storage)
  await store.$shared!.ready
  const cyclic: any = { tags: [] }; cyclic.self = cyclic
  store.detail = cyclic
  await assert.rejects(store.$shared!.flush(), /circular|cyclic|cycle/i)
  assert.equal(cache.values.has(key('detail')), false)
  store.detail = { tags: ['恢复'] }
  await store.$shared!.flush()
  assert.equal(cache.values.get(key('detail')), JSON.stringify({ tags: ['恢复'] }))
  assert.equal(store.$shared!.error, null)
})

test('保存失败后新的编辑自动保存成功，会清除可响应错误', async () => {
  const cache = memory(), { store } = useTestStore(cache.storage)
  await store.$shared!.ready
  cache.write(async () => { throw new Error('暂时不可写') })
  store.count = 1; await pause()
  assert.ok(store.$shared!.error)
  cache.write(undefined)
  store.count = 2; await pause()
  assert.equal(cache.values.get(key('count')), '2')
  assert.equal(store.$shared!.error, null)
})

test('默认存储在 SSR 中不读写浏览器全局对象', () => {
  const pinia = createPinia().use(createSharedStatePlugin())
  owned.push(pinia); createApp({ render: () => null }).use(pinia)
  const store = defineStore('server', { state: () => ({ count: 1 }), shared: true })(pinia)
  assert.equal(store.$shared, undefined)
  store.count++
  assert.equal(store.count, 2)
})

test('订阅失败可重试；异步订阅在 store 销毁后完成也会立即释放', async () => {
  const cache = memory(), subscribe = cache.storage.subscribe
  let fail = true
  cache.storage.subscribe = listener => { if (fail) throw new Error('订阅失败'); return subscribe(listener) }
  const { store } = useTestStore(cache.storage)
  await store.$shared!.ready
  assert.match(store.$shared!.error!.message, /订阅失败/)
  fail = false; await store.$shared!.refresh()
  assert.equal(cache.listeners.size, 1)
  store.$dispose(); assert.equal(cache.listeners.size, 0)

  const gate = deferred<() => void>()
  let stopped = 0
  cache.storage.subscribe = () => gate.promise
  const late = useTestStore(cache.storage).store
  late.$dispose(); gate.resolve(() => { stopped++ })
  await late.$shared!.ready
  assert.equal(stopped, 1)
})

test('销毁整个 Pinia 或单个 store 后不再接收通知，迟到读取不修改已销毁状态', async () => {
  const cache = memory(), gate = deferred<string | null>()
  cache.read(async (field, value) => field === key('note') ? gate.promise : value)
  const { store, pinia } = useTestStore(cache.storage)
  await pause()
  disposePinia(pinia); owned.splice(owned.indexOf(pinia), 1)
  gate.resolve(JSON.stringify('迟到的缓存')); await store.$shared!.ready
  assert.equal(store.note, '初始备注'); assert.equal(cache.listeners.size, 0)
  store.note = '已销毁后的修改'; await pause()
  assert.equal(cache.writes.length, 0)
})

test('异步原生取消订阅失败可观察，不产生未处理的 Promise 拒绝', async () => {
  const cache = memory(), subscribe = cache.storage.subscribe
  cache.storage.subscribe = async listener => {
    const stop = await subscribe(listener)
    return async () => { stop(); throw new Error('取消订阅失败') }
  }
  const { store } = useTestStore(cache.storage)
  await store.$shared!.ready
  store.$dispose(); await pause()
  assert.equal(cache.listeners.size, 0)
  assert.match(store.$shared!.error!.message, /取消订阅失败/)
})

test('存储键编码隔离字段与 store，错误的 pick 提供明确错误', () => {
  assert.notEqual(sharedStateKey('a:b', 'c'), sharedStateKey('a', 'b:c'))
  assert.notEqual(sharedStateKey('中文', '字段'), sharedStateKey('中文', '字段', 'another:'))
  assert.throws(() => useTestStore(memory().storage, { pick: ['missing'] }), /共享字段不存在/)
})
