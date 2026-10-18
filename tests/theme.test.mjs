import '../lib/my-ui.js'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const { createTheme, defaultThemeOptions, themeColors, themeStyles, contrastRatio, applyTheme } = globalThis.MyUI

function withBrowser(run) {
  const previousDocument = globalThis.document, previousWindow = globalThis.window
  const values = new Map(), listeners = new Set()
  const root = { style: { setProperty(name, value) { values.set(name, value) } }, dataset: {} }
  const media = { matches: false, addEventListener(type, fn) { if (type === 'change') listeners.add(fn) }, removeEventListener(type, fn) { if (type === 'change') listeners.delete(fn) } }
  const change = matches => { media.matches = matches; for (const fn of [...listeners]) fn({ matches }) }
  globalThis.document = { documentElement: root }
  globalThis.window = { matchMedia() { return media } }
  try { run({ root, values, listeners, change }) } finally {
    applyTheme({ mode: 'light' })()
    if (previousDocument === undefined) delete globalThis.document
    else globalThis.document = previousDocument
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
}

test('独立明暗主题保存各自主色和风格，解析不修改输入配置', () => {
  const options = { mode: 'light', light: { color: 'pink', style: 'warm' }, dark: { color: 'orange', style: 'clear' } }
  const before = structuredClone(options)
  const light = createTheme(options), dark = createTheme({ ...options, mode: 'dark' })
  assert.equal(light.primary, themeColors.find(x => x.id === 'pink').light)
  assert.equal(dark.primary, themeColors.find(x => x.id === 'orange').dark)
  assert.equal(light.colors.background, themeStyles.find(x => x.id === 'warm').light.background)
  assert.equal(dark.colors.background, themeStyles.find(x => x.id === 'clear').dark.background)
  assert.deepEqual(options, before)
  assert.notEqual(createTheme().primary, createTheme({ mode: 'dark' }).primary)
  assert.deepEqual(createTheme(), createTheme(defaultThemeOptions))
})

test('静态明暗阴影与主题默认数据同步，首屏回退不会改变容器层级', () => {
  const css = readFileSync(new URL('../lib/my-ui.css', import.meta.url), 'utf8')
  const blocks = { light: css.match(/:root\s*\{([^}]+)\}/)?.[1], dark: css.match(/:root\[data-theme="dark"\]\s*\{([^}]+)\}/)?.[1] }
  const normalize = value => value.replace(/\s+/g, ' ').replace(/(?:\d*\.\d+)/g, number => String(Number(number)))
  for (const mode of ['light', 'dark']) for (const [field, property] of [['smallShadow', 'small-shadow'], ['shadow', 'shadow'], ['popupShadow', 'popup-shadow'], ['modalShadow', 'modal-shadow']]) {
    assert.equal(normalize(blocks[mode]?.split('--' + property + ':')[1]?.split(';')[0].trim()), normalize(createTheme({ mode }).colors[field]))
  }
})

test('所有精选主色在三组风格中保持普通文字可读性', () => {
  let checked = 0
  for (const style of themeStyles) for (const mode of ['light', 'dark']) for (const preset of themeColors) {
    if (!preset[mode]) continue
    const theme = createTheme({ mode, [mode]: { color: preset.id, style: style.id } })
    for (const role of ['background', 'cardBackground', 'fill', 'selectedBackground', 'hover', 'press']) {
      assert.ok(contrastRatio(theme.primary, theme.colors[role]) >= 4.5, mode + '/' + style.id + '/' + preset.id + '/' + role)
    }
    assert.ok(contrastRatio(theme['primary-text'], theme.primary) >= 4.5)
    for (const role of ['background', 'cardBackground', 'fill']) {
      assert.ok(contrastRatio(theme.colors.text, theme.colors[role]) >= 4.5)
      assert.ok(contrastRatio(theme.colors.textSecondary, theme.colors[role]) >= 4.5)
    }
    checked++
  }
  assert.equal(checked, 72)
})

test('亮黄与亮橙等预设仅供暗色主题，错误配置在切换前拒绝', () => {
  for (const color of ['yellow', 'amber', 'orange', 'lime']) {
    assert.throws(() => createTheme({ light: { color } }), TypeError)
    assert.equal(createTheme({ mode: 'dark', dark: { color } }).color, color)
  }
  assert.throws(() => createTheme({ mode: 'auto' }), TypeError)
  assert.throws(() => createTheme({ light: { style: 'unknown' } }), TypeError)
})

test('自定义 HEX 保留原色与简写，分别覆写背景且不改另一份主题', () => {
  const theme = createTheme({ light: { primary: ' #AbC ', background: '#eee', cardBackground: '#fff', shadow: 'none' }, dark: { primary: '#f3db82' } })
  assert.equal(theme.primary, '#aabbcc')
  assert.equal(theme.colors.background, '#eeeeee')
  assert.equal(theme.colors.shadow, 'none')
  assert.equal(createTheme({ mode: 'dark', light: { primary: '#abc' }, dark: { primary: '#f3db82' } }).primary, '#f3db82')
  for (const primary of ['#ffea00', '#00ff00', '#ffffff', '#000000']) assert.equal(createTheme({ primary }).primary, primary)
  assert.ok(contrastRatio('#ffe066', '#ffffff') < 4.5)
})

test('填充按钮的黑白文字在自定义颜色下保持可读性', () => {
  let seed = 13897
  for (let index = 0; index < 256; index++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    const primary = '#' + (seed & 0xffffff).toString(16).padStart(6, '0')
    const theme = createTheme({ primary })
    assert.equal(theme.primary, primary)
    assert.ok(contrastRatio(theme['primary-text'], primary) >= 4.5)
  }
})

test('主题入口同步整份层级数据，改变主色不会改变已选风格', () => withBrowser(({ root, values }) => {
  applyTheme({ mode: 'dark', dark: { color: 'green', style: 'warm' } })
  assert.equal(root.dataset.theme, 'dark')
  assert.equal(root.dataset.themeStyle, 'warm')
  const background = values.get('--background'), fill = values.get('--fill')
  applyTheme({ mode: 'dark', dark: { color: 'orange', style: 'warm' } })
  assert.equal(values.get('--background'), background)
  assert.equal(values.get('--fill'), fill)
  assert.equal(values.get('--selected-background'), themeStyles.find(x => x.id === 'warm').dark.selectedBackground)
  assert.equal(values.get('--primary'), themeColors.find(x => x.id === 'orange').dark)
}))

test('四档阴影跟随明暗风格独立切换，局部覆写不会串到其他档位或备用主题', () => withBrowser(({ values }) => {
  const fields = { smallShadow: '--small-shadow', shadow: '--shadow', popupShadow: '--popup-shadow', modalShadow: '--modal-shadow' }
  for (const mode of ['light', 'dark']) for (const style of themeStyles) {
    applyTheme({ mode, [mode]: { style: style.id } })
    for (const [field, property] of Object.entries(fields)) assert.equal(values.get(property), style[mode][field])
  }
  const options = { light: { smallShadow: 'none', modalShadow: '0 8px 20px #0003' }, dark: { modalShadow: 'none' } }
  applyTheme(options)
  assert.equal(values.get('--small-shadow'), 'none')
  assert.equal(values.get('--modal-shadow'), '0 8px 20px #0003')
  assert.equal(values.get('--popup-shadow'), createTheme().colors.popupShadow)
  applyTheme({ ...options, mode: 'dark' })
  assert.equal(values.get('--small-shadow'), createTheme({ mode: 'dark' }).colors.smallShadow)
  assert.equal(values.get('--modal-shadow'), 'none')
  const before = [...values]
  for (const value of ['', 12, null]) assert.throws(() => applyTheme({ dark: { smallShadow: value } }), TypeError)
  assert.deepEqual([...values], before)
}))

test('跟随系统会更新整份主题，重复应用与旧清理函数不会留下或误删监听', () => withBrowser(({ root, values, listeners, change }) => {
  const options = { mode: 'system', light: { color: 'pink' }, dark: { color: 'yellow' } }
  const first = applyTheme(options)
  assert.equal(root.dataset.theme, 'light')
  assert.equal(listeners.size, 1)
  options.dark.color = 'green'
  change(true)
  assert.equal(root.dataset.theme, 'dark')
  assert.equal(values.get('--primary'), themeColors.find(x => x.id === 'yellow').dark)
  const second = applyTheme({ mode: 'system' })
  first()
  assert.equal(listeners.size, 1)
  change(false)
  assert.equal(root.dataset.theme, 'light')
  second()
  assert.equal(listeners.size, 0)
  applyTheme({ mode: 'dark' })
  change(false)
  assert.equal(root.dataset.theme, 'dark')
  assert.equal(listeners.size, 0)
}))

test('非法的当前或备用主题不会修改样式，也不会关闭现有系统监听', () => withBrowser(({ values, listeners, root, change }) => {
  const stop = applyTheme({ mode: 'system' })
  const before = [...values]
  for (const primary of ['red', '#12345678', '#ggg', '', 'rgb(0,0,0)']) {
    assert.throws(() => applyTheme({ dark: { primary } }), TypeError)
    assert.deepEqual([...values], before)
    assert.equal(listeners.size, 1)
  }
  change(true)
  assert.equal(root.dataset.theme, 'dark')
  stop()
}))

test('背景模糊偏好跨明暗模式保留，关闭时使用 none 且不改变颜色', () => withBrowser(({ values, change }) => {
  assert.equal(createTheme().backdropBlur, true)
  const stop = applyTheme({ mode: 'system', backdropBlur: false })
  assert.equal(values.get('--overlay-backdrop-filter'), 'none')
  change(true)
  assert.equal(values.get('--overlay-backdrop-filter'), 'none')
  const darkColors = [...values].filter(([key]) => key !== '--overlay-backdrop-filter')
  applyTheme({ mode: 'dark', backdropBlur: true })
  assert.equal(values.get('--overlay-backdrop-filter'), 'blur(4px)')
  assert.deepEqual([...values].filter(([key]) => key !== '--overlay-backdrop-filter'), darkColors)
  stop()
}))

test('非法背景模糊配置不会覆盖当前主题与系统监听', () => withBrowser(({ values, listeners }) => {
  const stop = applyTheme({ mode: 'system', backdropBlur: false })
  const before = [...values]
  for (const backdropBlur of [null, 'false', 0, 'blur(4px)']) {
    assert.throws(() => applyTheme({ backdropBlur }), TypeError)
    assert.deepEqual([...values], before)
    assert.equal(listeners.size, 1)
  }
  stop()
}))

test('全局字重保留四档默认，变细平移、增粗保留更粗档位', () => withBrowser(({ values }) => {
  assert.equal(createTheme().fontWeight, 400)
  for (const [fontWeight, expected] of [[100, [100, 200, 300, 400]], [350, [350, 450, 550, 650]], [400, [400, 500, 600, 700]], [475.5, [475.5, 500, 600, 700]], [800, [800, 800, 800, 800]], [1000, [1000, 1000, 1000, 1000]]]) {
    applyTheme({ fontWeight })
    assert.deepEqual(['--font-weight', '--font-weight-action', '--font-weight-subtitle', '--font-weight-title'].map(key => Number(values.get(key))), expected)
  }
}))

test('字重跨系统明暗切换保留，主题快照不受外部修改影响', () => withBrowser(({ values, change }) => {
  const options = { mode: 'system', fontWeight: 473 }
  const stop = applyTheme(options)
  options.fontWeight = 1000
  change(true)
  assert.equal(values.get('--font-weight'), '473')
  change(false)
  assert.equal(values.get('--font-weight'), '473')
  stop()
}))

test('非法字重不破坏当前主题或系统监听', () => withBrowser(({ values, listeners }) => {
  const stop = applyTheme({ mode: 'system', fontWeight: 473 })
  const before = [...values]
  for (const fontWeight of [99, 1001, NaN, Infinity, '400', null]) {
    assert.throws(() => applyTheme({ fontWeight }), TypeError)
    assert.deepEqual([...values], before)
    assert.equal(listeners.size, 1)
  }
  stop()
}))
