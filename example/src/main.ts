import './commons/mobile'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { applyTheme } from './commons/theme/index.js'
import { sharedPinia } from './commons/state/shared'
import { installNativeOverlayBack } from './commons/overlay-back'
import { installNativeAppearance } from './commons/native-appearance'
import { installThemeState } from './commons/state/theme'
import { readThemeSnapshot } from './commons/theme/preferences'

applyTheme(readThemeSnapshot())
const app = createApp(App).use(sharedPinia).use(router)
const stopTheme = installThemeState(sharedPinia)
let stopOverlayBack = () => {},
  stopAppearance = () => {}
void router.isReady().then(() => {
  app.mount('#app')
  stopOverlayBack = installNativeOverlayBack()
  stopAppearance = installNativeAppearance()
})
import.meta.hot?.dispose(() => {
  stopOverlayBack()
  stopAppearance()
  stopTheme()
})
// ThemeSettings 启动时读取 Android 系统字重，并在返回前台时重新同步。
