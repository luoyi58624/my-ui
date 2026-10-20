import './mobile'
import { createApp } from 'vue'
import App from './App.vue'
import NativePage from './NativePage.vue'
import { applyTheme } from './theme/index.js'
import { sharedPinia } from './stores/shared'
import { installNativeOverlayBack } from './overlay-back'
import { installNativeAppearance } from './native-appearance'
import { installThemeState } from './stores/theme'
import { readThemeSnapshot } from './theme/preferences'

applyTheme(readThemeSnapshot())
const nativePage = window.location.pathname.endsWith('/native-page.html')
document.documentElement.classList.toggle('my-native-page', nativePage)
const app = createApp(nativePage ? NativePage : App).use(sharedPinia)
const stopTheme = installThemeState(sharedPinia)
app.mount('#app')
const stopOverlayBack = installNativeOverlayBack()
const stopAppearance = installNativeAppearance()
import.meta.hot?.dispose(() => { stopOverlayBack(); stopAppearance(); stopTheme() })
// ThemeSettings 启动时读取 Android 系统字重，并在返回前台时重新同步。
