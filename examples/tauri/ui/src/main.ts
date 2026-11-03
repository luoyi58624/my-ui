import '@demo/commons/mobile'
import { createApp } from 'vue'
import App from '@demo/App.vue'
import { router } from '@demo/router'
import { applyTheme } from '@demo/commons/theme/index.js'
import { sharedPinia } from '@demo/commons/state/shared'
import { installNativeOverlayBack } from './commons/overlay-back'
import { installNativeAppearance } from '@demo/commons/native-appearance'
import { installThemeState } from '@demo/commons/state/theme'
import { readThemeSnapshot } from '@demo/commons/theme/preferences'

applyTheme(readThemeSnapshot())
const app = createApp(App).use(sharedPinia).use(router)
const stopTheme = installThemeState(sharedPinia)
let stopOverlayBack = () => {},
  stopAppearance = () => {}
void router.isReady().then(() => {
  app.mount('#app')
  stopOverlayBack = installNativeOverlayBack(router)
  stopAppearance = installNativeAppearance()
})
import.meta.hot?.dispose(() => {
  stopOverlayBack()
  stopAppearance()
  stopTheme()
})
// ThemeSettings 启动时读取 Android 系统字重，并在返回前台时重新同步。
