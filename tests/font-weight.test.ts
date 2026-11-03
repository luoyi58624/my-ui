import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

let instance = 0
async function withRuntime(run: (context: any) => Promise<void>) {
  const names = ['window', 'navigator', 'localStorage'] as const
  const descriptors = names.map(name => Object.getOwnPropertyDescriptor(globalThis, name))
  const storage = new Map<string, string>()
  const calls: string[] = []
  const warnings: unknown[][] = []
  const previousWarn = console.warn
  let response: () => unknown = () => 600
  const bridge = { core: { invoke: (command: string) => { calls.push(command); return Promise.resolve().then(response) } } }
  Object.defineProperties(globalThis, {
    window: { configurable: true, value: { __TAURI__: bridge } },
    navigator: { configurable: true, value: { userAgent: 'Android' } },
    localStorage: { configurable: true, value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    } },
  })
  console.warn = (...args) => { warnings.push(args) }
  try {
    // Bun 会合并仅查询参数不同的文件模块，独立源码 URL 用于隔离每项测试的缓存。
    const source = readFileSync(new URL('../examples/vue/src/commons/font-weight.ts', import.meta.url), 'utf8')
    const js = new Bun.Transpiler({ loader: 'ts' }).transformSync(source) + '\n// instance ' + ++instance
    const api = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'))
    await run({ ...api, calls, storage, warnings, bridge, respond: (next: () => unknown) => { response = next } })
  } finally {
    console.warn = previousWarn
    names.forEach((name, index) => {
      if (descriptors[index]) Object.defineProperty(globalThis, name, descriptors[index]!)
      else Reflect.deleteProperty(globalThis, name)
    })
  }
}

function deferred() {
  let resolve!: (value: number) => void
  const promise = new Promise<number>(done => { resolve = done })
  return { promise, resolve }
}

test('一次读取只调用 getWght，并发调用共用采集结果', async () => withRuntime(async api => {
  const a = api.readSystemFontWeight(), b = api.readSystemFontWeight()
  assert.equal(a, b)
  assert.deepEqual(await Promise.all([a, b]), [600, 600])
  assert.deepEqual(api.calls, ['plugin:android-system-font-weight|getWght'])
  assert.equal(await api.readSystemFontWeight(), 600)
  assert.equal(api.calls.length, 1)
}))

test('强制刷新替换缓存，后续普通读取取得新值', async () => withRuntime(async api => {
  assert.equal(await api.readSystemFontWeight(), 600)
  api.respond(() => 700)
  assert.equal(await api.readSystemFontWeight(true), 700)
  assert.equal(await api.readSystemFontWeight(), 700)
  assert.equal(api.calls.length, 2)
}))

test('刷新中的旧请求迟到时，不能重新污染缓存', async () => withRuntime(async api => {
  const old = deferred()
  api.respond(() => old.promise)
  const first = api.readSystemFontWeight()
  await Promise.resolve(); await Promise.resolve()
  api.respond(() => 700)
  assert.equal(await api.readSystemFontWeight(true), 700)
  old.resolve(500)
  assert.equal(await first, 500)
  assert.equal(await api.readSystemFontWeight(), 700)
}))

test('权限拒绝或异常返回不会缓存为 400，下一次读取能够重试', async () => withRuntime(async api => {
  api.respond(() => { throw new Error('not allowed by ACL') })
  assert.equal(await api.readSystemFontWeight(), null)
  assert.equal(api.warnings.length, 1)
  api.respond(() => 1001)
  assert.equal(await api.readSystemFontWeight(), null)
  api.respond(() => 590)
  assert.equal(await api.readSystemFontWeight(), 590)
}))

test('启动采集迟到时，不覆盖用户实际修改的字重', async () => withRuntime(async api => {
  const result = deferred()
  api.respond(() => result.promise)
  let value = 400
  const sync = api.createSystemFontWeightSync((weight: number) => { value = weight })
  const starting = sync.sync()
  sync.customize(800)
  result.resolve(600)
  assert.equal(await starting, null)
  assert.equal(value, 800)
  assert.equal(api.storage.get('my-ui:font-weight-customized'), '1')
  api.respond(() => 610)
  assert.equal(await sync.restore(), 610)
  assert.equal(value, 610)
  assert.equal(api.storage.has('my-ui:font-weight-customized'), false)
  assert.equal(await api.readSystemFontWeight(), 610)
}))

test('手动模式不会被返回前台的同步覆盖，恢复后重新跟随系统', async () => withRuntime(async api => {
  api.storage.set('my-ui:font-weight-customized', '1')
  let value = 800
  const sync = api.createSystemFontWeightSync((weight: number) => { value = weight })
  assert.equal(await sync.sync(true), null)
  assert.equal(api.calls.length, 0)
  assert.equal(value, 800)
  assert.equal(await sync.restore(), 600)
  api.respond(() => 650)
  assert.equal(await sync.sync(true), 650)
  assert.equal(value, 650)
}))

test('返回前台的新结果优先，较早的启动同步迟到时不回退页面字重', async () => withRuntime(async api => {
  let value = 400
  const sync = api.createSystemFontWeightSync((weight: number) => { value = weight })
  const old = deferred()
  api.respond(() => old.promise)
  const starting = sync.sync()
  await Promise.resolve(); await Promise.resolve()
  api.respond(() => 700)
  assert.equal(await sync.sync(true), 700)
  old.resolve(500)
  assert.equal(await starting, null)
  assert.equal(value, 700)
}))

test('原生读取失败时恢复操作保留当前值，卸载后不再应用异步结果', async () => withRuntime(async api => {
  let value = 800
  const sync = api.createSystemFontWeightSync((weight: number) => { value = weight })
  sync.customize(value)
  api.respond(() => null)
  assert.equal(await sync.restore(), null)
  assert.equal(value, 800)
  const result = deferred()
  api.respond(() => result.promise)
  const pending = sync.sync(true)
  sync.dispose()
  result.resolve(600)
  assert.equal(await pending, null)
  assert.equal(value, 800)
}))

test('普通网页不调用原生插件，恢复使用示例默认字重', async () => withRuntime(async api => {
  Reflect.deleteProperty(window, '__TAURI__')
  assert.equal(await api.readSystemFontWeight(), null)
  let value = 800
  const sync = api.createSystemFontWeightSync((weight: number) => { value = weight })
  assert.equal(await sync.restore(), 400)
  assert.equal(value, 400)
  assert.equal(api.calls.length, 0)
}))

test('Tauri 默认权限声明必须是集合，Android 主窗口实际引用该集合', () => {
  const root = new URL('../examples/tauri/', import.meta.url)
  const cargo = Bun.TOML.parse(readFileSync(new URL('Cargo.toml', root), 'utf8'))
  const plugin = new URL(cargo.dependencies['tauri-plugin-android-system-font-weight'].path + '/', root)
  const permission = Bun.TOML.parse(readFileSync(new URL('permissions/default.toml', plugin), 'utf8'))
  assert.deepEqual(permission.default.permissions, ['allow-getRawData', 'allow-getWght'])
  assert.equal(permission.permission, undefined)
  const capability = JSON.parse(readFileSync(new URL('capabilities/mobile.json', root), 'utf8'))
  assert.deepEqual(capability.platforms, ['android'])
  assert.ok(capability.windows.includes('main'))
  assert.ok(capability.permissions.includes('android-system-font-weight:default'))
})
