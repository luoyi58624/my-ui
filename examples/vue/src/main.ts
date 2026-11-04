import './commons/mobile'
import { createApp, h } from 'vue'
import App from './App.vue'
import ShowcaseLayout from './components/ShowcaseLayout.vue'
import { applyTheme } from './commons/theme/index.js'
import { sharedPinia } from './commons/state/shared'
import { installThemeState } from './commons/state/theme'
import { readThemeSnapshot } from './commons/theme/preferences'

applyTheme(readThemeSnapshot())
const section = location.hash.replace(/^#(?:\/showcase#|showcase-)?/, '')
const app = createApp({
  render: () => h(App, null, () => h(ShowcaseLayout, { section })),
}).use(sharedPinia)
const stopTheme = installThemeState(sharedPinia)
app.mount('#app')
import.meta.hot?.dispose(() => {
  stopTheme()
})
// ThemeSettings 启动时读取 Android 系统字重，并在返回前台时重新同步。
