import { createApp } from 'vue'
import App from './App.vue'
import { applyTheme } from './theme/index.js'


applyTheme()
createApp(App).mount('#app')
