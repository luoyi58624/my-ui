import './commons/mobile'
import { createApp } from 'vue'
import App from './App.vue'
import { initialHash, router } from './router'
import { applyTheme } from './commons/theme/index.js'
import { sharedPinia } from './commons/state/shared'
import { installThemeState } from './commons/state/theme'
import { readThemeSnapshot } from './commons/theme/preferences'

applyTheme(readThemeSnapshot())
const app = createApp(App).use(sharedPinia).use(router)
const stopTheme = installThemeState(sharedPinia)
void router.isReady().then(async () => {
  if (!initialHash) await router.replace('/showcase')
  app.mount('#app')
})
import.meta.hot?.dispose(() => {
  stopTheme()
})
// ThemeSettings 启动时读取 Android 系统字重，并在返回前台时重新同步。
