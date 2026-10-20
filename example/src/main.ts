import './mobile'
import { createApp } from 'vue'
import DemoRoot from './DemoRoot.vue'
import { router } from './router'
import { applyTheme } from './theme/index.js'
import { sharedPinia } from './stores/shared'
import { installNativeOverlayBack } from './overlay-back'
import { installNativeAppearance } from './native-appearance'
import { installThemeState } from './stores/theme'
import { readThemeSnapshot } from './theme/preferences'

applyTheme(readThemeSnapshot())
const app = createApp(DemoRoot).use(sharedPinia).use(router)
const stopTheme = installThemeState(sharedPinia)
let stopOverlayBack = () => {}, stopAppearance = () => {}
void router.isReady().then(() => {
  app.mount('#app')
  stopOverlayBack = installNativeOverlayBack()
  stopAppearance = installNativeAppearance()
})
import.meta.hot?.dispose(() => { stopOverlayBack(); stopAppearance(); stopTheme() })
// ThemeSettings 启动时读取 Android 系统字重，并在返回前台时重新同步。
