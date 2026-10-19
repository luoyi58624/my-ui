import './mobile'
import { createApp } from 'vue'
import App from './App.vue'
import { applyTheme } from './theme/index.js'

applyTheme()
createApp(App).mount('#app')
// ThemeSettings 启动时读取 Android 系统字重，并在返回前台时重新同步。
