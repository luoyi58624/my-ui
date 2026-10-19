import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const exampleRoot = decodeURIComponent(new URL('.', import.meta.url).pathname).replace(/^\/(\w:)/, '$1')
const projectRoot = decodeURIComponent(new URL('..', import.meta.url).pathname).replace(/^\/(\w:)/, '$1')

export default defineConfig(({ mode }) => ({
  root: mode === 'test' ? projectRoot : exampleRoot,
  clearScreen: false,
  publicDir: exampleRoot + 'public',
  resolve: {
    alias: { '/packages': projectRoot + 'packages' },
    dedupe: ['vue'],
  },
  server: {
    fs: { allow: [projectRoot] },
    // Rust 编译与生成文件交给 Tauri 监听，避免反复刷新示例。
    watch: { ignored: ['**/src-tauri/**'] },
  },
  build: {
    outDir: projectRoot + 'dist',
    emptyOutDir: true,
    rolldownOptions: {
      input: { main: exampleRoot + 'index.html', nativePage: exampleRoot + 'native-page.html' },
    },
  },
  plugins: [
    vue(),
    {
      name: 'my-ui-core-reload',
      handleHotUpdate(context) {
        // 核心是同页单例；编辑 JS 后完整刷新，避免遗留旧控制器与监听。
        if (/[\\/]packages[\\/]core[\\/]my-ui\.js$/.test(context.file)) {
          context.server.ws.send({ type: 'full-reload' })
          return []
        }
      },
    },
  ],
}))
