import { applyTheme, createTheme } from './theme/index.js'
import { readThemeSnapshot, saveThemeSnapshot, themeStateKey, type ThemeSettingsState } from './theme/preferences'
import { sharedStorage } from './state/storage'
import { installNativeAppearance } from './native-appearance'

// 原生 HTML 直接接入同一份存储，不加载 Vue 或 Pinia。
let settings = readThemeSnapshot(), generation = 0, disposed = false
let stopTheme = applyTheme(settings)
const stopAppearance = installNativeAppearance()
const fields: (keyof ThemeSettingsState)[] = ['mode', 'backdropBlur', 'fontWeight', 'light', 'dark']
const keys = fields.map(themeStateKey)
function render() { stopTheme = applyTheme(settings); saveThemeSnapshot(settings) }
async function refresh() {
  const current = ++generation
  const values = await Promise.all(keys.map(key => sharedStorage.getItem(key)))
  if (disposed || generation !== current) return
  const next = { ...settings }
  fields.forEach((field, index) => { if (values[index] !== null) Object.assign(next, { [field]: JSON.parse(values[index]!) }) })
  createTheme(next)
  settings = next
  render()
}
const report = (error: unknown) => console.error('同步 HTML 示例主题失败', error)
document.querySelector<HTMLButtonElement>('#theme')!.onclick = () => {
  generation++
  settings.mode = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  render()
  void Promise.resolve(sharedStorage.setItem(themeStateKey('mode'), JSON.stringify(settings.mode)))
    .then(() => sharedStorage.flush?.()).catch(report)
}
const resume = () => { void refresh().catch(report) }
window.addEventListener('focus', resume)
void Promise.resolve(sharedStorage.subscribe(key => { if (key === null || keys.includes(key)) resume() }))
  .then(stop => {
    if (disposed) { stop(); return }
    window.addEventListener('pagehide', () => { disposed = true; generation++; stop(); stopTheme(); stopAppearance(); window.removeEventListener('focus', resume) }, { once: true })
    return refresh()
  }).catch(report)
