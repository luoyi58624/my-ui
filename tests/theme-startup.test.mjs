import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { applyTheme, createTheme } from '../examples/vue/src/commons/theme/index.js'

const bootstrap = readFileSync(new URL('../examples/vue/public/theme-init.js', import.meta.url), 'utf8')
function start({ settings, cached, inherited, systemDark = false, storageBlocked = false } = {}) {
  const values = new Map(), root = { dataset: {}, style: { setProperty: (key, value) => values.set(key, value), getPropertyValue: key => values.get(key) || '' } }
  const storage = new Map([['my-ui:theme', settings && JSON.stringify(settings)], ['my-ui:theme-render', cached && JSON.stringify(cached)]])
  runInNewContext(bootstrap, { document: { documentElement: root }, window: { __NATIVE_ROUTER_APPEARANCE__: inherited }, matchMedia: () => ({ matches: systemDark }), localStorage: { getItem(key) { if (storageBlocked) throw Error('blocked'); return storage.get(key) || null } } })
  return { root, values }
}

test('主脚本尚未加载时就恢复暗色与已保存配色，不经过浅色首帧', () => {
  const { root, values } = start({ settings: { mode: 'dark' }, cached: { mode: 'dark', variables: { '--background': '#171512', '--card-background': '#302c29', '--primary': '#ffbc8c' } } })
  assert.equal(root.dataset.theme, 'dark');assert.equal(values.get('--background'), '#171512');assert.equal(values.get('--card-background'), '#302c29');assert.equal(values.get('--primary'), '#ffbc8c')
  assert.equal(root.style.backgroundColor, 'var(--background)')
})

test('跟随系统时忽略旧模式的渲染快照，避免从错误配色切换', () => {
  const { root, values } = start({ settings: { mode: 'system' }, systemDark: false, cached: { mode: 'dark', variables: { '--background': '#171512' } } })
  assert.equal(root.dataset.theme, 'light');assert.equal(values.get('--background'), '#f2f3f5')
  assert.equal(start({ settings: { mode: 'system' }, systemDark: true }).root.dataset.theme, 'dark')
})

test('原生父页面传入的实际外观优先于旧快照，禁用本地存储也能正确首屏', () => {
  const inherited = { dark: true, background: '#0d1015' }
  for (const storageBlocked of [false, true]) {
    const { root, values } = start({ inherited, storageBlocked, settings: { mode: 'light' } })
    assert.equal(root.dataset.theme, 'dark');assert.equal(values.get('--background'), '#0d1015')
  }
})

test('完整主题渲染保存同一套变量，重建页面可在模块执行前无损恢复', () => {
  const previous = new Map(['document', 'window', 'localStorage'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  const data = new Map(), values = new Map(), root = { dataset: {}, style: { setProperty: (key, value) => values.set(key, value) } }
  const settings = { mode: 'dark', fontWeight: 600, dark: { style: 'warm', color: 'orange' } }
  let stop
  try {
    for (const [key, value] of Object.entries({ document: { documentElement: root }, window: {}, localStorage: { setItem: (key, value) => data.set(key, value) } })) Object.defineProperty(globalThis, key, { configurable: true, value })
    stop = applyTheme(settings)
    const next = start({ settings, cached: JSON.parse(data.get('my-ui:theme-render')) })
    assert.deepEqual(next.values, values);assert.equal(next.values.get('--background'), createTheme(settings).colors.background)
  } finally {
    stop?.();for (const [key, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, key, descriptor);else Reflect.deleteProperty(globalThis, key) }
  }
})
