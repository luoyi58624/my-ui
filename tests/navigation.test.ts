import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

let instance = 0
async function withRuntime(run: (api: any) => Promise<void>) {
  const previous = new Map(['window', 'document', 'navigator'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  let href = 'http://localhost/index.html#home', state: any = { retained: true }
  const calls: { command: string; args?: any }[] = [], tabs: any[] = [], assigned: string[] = [], changes: string[] = []
  const entries: { href: string; state: any }[] = []
  let response: () => unknown = () => undefined
  const agent = { userAgent: 'Android' }
  const runtime = Object.assign(new EventTarget(), {
    __TAURI__: { core: { invoke: (command: string, args?: any) => { calls.push({ command, args }); return Promise.resolve().then(response) } } },
    location: { get href() { return href }, assign: (url: string) => { assigned.push(url); href = url } },
    history: {
      get state() { return state },
      pushState(next: any, _: string, url: string) { entries.push({ href, state }); href = url; state = next; changes.push('push') },
      replaceState(next: any, _: string, url: string) { href = url; state = next; changes.push('replace') },
      back() { const previous = entries.pop(); if (previous) { href = previous.href; state = previous.state }; changes.push('back') },
    },
    open: (...args: any[]) => tabs.push(args),
  })
  let navigated = 0
  runtime.addEventListener('popstate', () => { navigated++ })
  for (const [key, value] of Object.entries({ window: runtime, document: { title: 'my-ui 示例' }, navigator: agent }))
    Object.defineProperty(globalThis, key, { configurable: true, value })
  try {
    const source = readFileSync(new URL('../example/src/navigation.ts', import.meta.url), 'utf8')
    const js = new Bun.Transpiler({ loader: 'ts' }).transformSync(source) + '\n// instance ' + ++instance
    const api = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'))
    await run({ ...api, calls, tabs, assigned, changes, runtime, agent, get navigated() { return navigated }, setUrl: (url: string) => { href = url }, respond: (next: () => unknown) => { response = next } })
  } finally {
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else Reflect.deleteProperty(globalThis, key)
    }
  }
}

test('Android 传递目标地址和标题，连续点击共用一次原生跳转', () => withRuntime(async api => {
  let finish!: () => void
  api.respond(() => new Promise<void>(resolve => { finish = resolve }))
  const first = api.openPage('#example/button', { title: 'Button 按钮' }), second = api.openPage('#example/button', { title: 'Button 按钮' })
  assert.equal(first, second)
  await Promise.resolve(); await Promise.resolve()
  assert.deepEqual(api.calls, [{ command: 'open_page', args: { path: 'index.html#example/button', title: 'Button 按钮' } }])
  assert.equal(api.runtime.location.href, 'http://localhost/index.html#home')
  assert.deepEqual(api.changes, [])
  finish(); await first
}))

test('桌面 App 也通过统一命令新建窗口，省略标题沿用页面标题', () => withRuntime(async api => {
  api.agent.userAgent = 'Windows NT 10.0'
  assert.equal(api.isNativeApp(), true)
  await api.openPage('native-page.html?source=desktop#note')
  assert.deepEqual(api.calls, [{ command: 'open_page', args: { path: 'native-page.html?source=desktop#note', title: 'my-ui 示例' } }])
  assert.equal(api.tabs.length, 0)
  assert.equal(api.changes.length, 0)
}))

test('不同页面可以并行创建，不会因另一个窗口正在打开而丢失请求', () => withRuntime(async api => {
  const finish: (() => void)[] = []
  api.respond(() => new Promise<void>(resolve => { finish.push(resolve) }))
  const first = api.openPage('#example/button'), second = api.openPage('#example/image')
  assert.notEqual(first, second)
  await Promise.resolve(); await Promise.resolve()
  assert.deepEqual(api.calls.map((call: any) => call.args.path), ['index.html#example/button', 'index.html#example/image'])
  finish.forEach(resolve => resolve())
  await Promise.all([first, second])
}))

test('原生新页面从创建时继承当前实际模式和背景，主题仍由共享状态管理', () => withRuntime(async api => {
  Object.assign(document, { documentElement: { dataset: { theme: 'dark' }, style: { getPropertyValue: () => '#0d1015' } } })
  await api.openPage('#example/button')
  assert.deepEqual(api.calls[0].args.appearance, { dark: true, background: '#0d1015' })
}))

test('创建失败保留错误并释放进行中请求，下次能够重试', () => withRuntime(async api => {
  api.respond(() => { throw new Error('创建窗口失败') })
  await assert.rejects(api.openPage('#example/image'), /创建窗口失败/)
  api.respond(() => undefined)
  await api.openPage('#example/image')
  assert.equal(api.calls.length, 2)
}))

test('关闭原生子页只发原生关闭命令，不改网页返回历史', () => withRuntime(async api => {
  await api.closePage()
  assert.deepEqual(api.calls, [{ command: 'close_page', args: undefined }])
  assert.deepEqual(api.changes, [])
}))

test('普通网页同页跳转只入栈一次并通知路由，返回恢复上一页', () => withRuntime(async api => {
  api.runtime.__TAURI__ = undefined
  await api.openPage('#example/button')
  assert.equal(api.runtime.location.href, 'http://localhost/index.html#example/button')
  assert.equal(api.runtime.history.state.retained, true)
  assert.equal(api.runtime.history.state.myUiPageParent, 'http://localhost/index.html#home')
  assert.equal(api.navigated, 1)
  await api.openPage('#example/button')
  assert.deepEqual(api.changes, ['push'])
  await api.closePage()
  assert.deepEqual(api.changes, ['push', 'back'])
  assert.equal(api.runtime.location.href, 'http://localhost/index.html#home')
  assert.deepEqual(api.calls, [])
}))

test('网页直接进入详情时替换为回退地址，不增加返回记录', () => withRuntime(async api => {
  api.runtime.__TAURI__ = undefined
  api.setUrl('http://localhost/index.html#example/image')
  await api.closePage()
  assert.equal(api.runtime.location.href, 'http://localhost/index.html#home')
  assert.deepEqual(api.changes, ['replace'])
  assert.equal(api.navigated, 1)
}))

test('网页独立 HTML 打开另一标签，跨文档回退正常加载目标文档', () => withRuntime(async api => {
  api.runtime.__TAURI__ = undefined
  await api.openPage('native-page.html')
  assert.deepEqual(api.tabs, [['http://localhost/native-page.html', '_blank', 'noopener']])
  api.setUrl('http://localhost/native-page.html')
  await api.closePage('./index.html#native-navigation')
  assert.deepEqual(api.assigned, ['http://localhost/index.html#native-navigation'])
}))

test('外站、脚本地址与嵌入凭据地址不会交给原生创建窗口', () => withRuntime(async api => {
  for (const path of ['https://example.com/', '//example.com/', 'javascript:alert(1)', 'data:text/html,hello', 'http://user:password@localhost/index.html'])
    await assert.rejects(api.openPage(path), /应用内地址/)
  assert.deepEqual(api.calls, [])
}))

test('子窗口标记只在 App 内生效，父窗口和普通网页保持独立', () => withRuntime(async api => {
  assert.equal(api.isChildPage(), false)
  api.setUrl('http://localhost/index.html?pageWindow=1#example/button')
  assert.equal(api.isChildPage(), true)
  api.runtime.__TAURI__ = undefined
  assert.equal(api.isChildPage(), false)
}))

test('主窗口与所有子窗口仍拥有核心、共享状态和 Android 字重权限', () => {
  for (const file of ['default.json', 'mobile.json']) {
    const config = JSON.parse(readFileSync(new URL('../example/src-tauri/capabilities/' + file, import.meta.url), 'utf8'))
    assert.ok(config.windows.includes('main') && config.windows.includes('native-page-*'))
    assert.ok(config.permissions.includes(file === 'default.json' ? 'store:default' : 'system-font-weight:default'))
  }
})
