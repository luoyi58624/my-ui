import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const exampleRoot = decodeURIComponent(new URL('.', import.meta.url).pathname).replace(/^\/(\w:)/, '$1')
const projectRoot = decodeURIComponent(new URL('..', import.meta.url).pathname).replace(/^\/(\w:)/, '$1')

export default defineConfig(({ mode }) => ({
  root: mode === 'test' ? projectRoot : exampleRoot,
  clearScreen: false,
  publicDir: exampleRoot + 'public',
  resolve: {
    alias: [
      { find: '/packages', replacement: projectRoot + 'packages' },
      { find: 'tauri-plugin-native-components', replacement: exampleRoot + 'node_modules/tauri-plugin-native-components' },
      // 使用库自带的常用语言集合，避免代码示例加载全部语法。
      { find: /^highlight\.js$/, replacement: 'highlight.js/lib/common' },
    ],
    dedupe: ['vue'],
  },
  // 本地插件直接分发 Vue 源码，避免开发预构建缓存旧组件出口。
  optimizeDeps: { exclude: ['tauri-plugin-native-components'] },
  server: {
    fs: { allow: [projectRoot] },
    // Rust 编译与生成文件交给 Tauri 监听，避免反复刷新示例。
    watch: { ignored: ['**/src-tauri/**'] },
  },
  build: {
    outDir: projectRoot + 'dist',
    emptyOutDir: true,
    rolldownOptions: {
      input: { main: exampleRoot + 'index.html', nativePage: exampleRoot + 'native-page.html', nativeTheme: exampleRoot + 'src/native-theme.ts' },
      output: { entryFileNames: chunk => chunk.name === 'nativeTheme' ? 'native-theme.js' : 'assets/[name]-[hash].js' },
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
