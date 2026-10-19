import './mobile'
import { createApp } from 'vue'
import App from './App.vue'
import NativePage from './NativePage.vue'
import { applyTheme } from './theme/index.js'
import { sharedPinia } from './stores/shared'

applyTheme()
const nativePage = window.location.pathname.endsWith('/native-page.html')
document.documentElement.classList.toggle('my-native-page', nativePage)
createApp(nativePage ? NativePage : App).use(sharedPinia).mount('#app')
// ThemeSettings 启动时读取 Android 系统字重，并在返回前台时重新同步。
