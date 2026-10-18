import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({ plugins: [vue(), {
  name: 'my-ui-core-reload',
  handleHotUpdate(context) {
    // 核心是同页单例；编辑 JS 后完整刷新，避免遗留旧控制器与监听。
    if (/[\\/]lib[\\/]my-ui\.js$/.test(context.file)) {
      context.server.ws.send({ type: 'full-reload' })
      return []
    }
  },
}] })
