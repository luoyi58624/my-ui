import { defineConfig, loadEnv } from 'vite'
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
      // 浏览器测试以仓库为根目录，真实 HTML 入口仍需加载示例的绝对模块地址。
      ...(mode === 'test' ? [{ find: '/src', replacement: exampleRoot + 'src' }] : []),
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
    // Android 页面使用 Tauri 虚拟域名，热更新连接直接走 USB 转发的开发地址。
    hmr: mode === 'test' ? undefined : { host: loadEnv(mode, projectRoot, 'TAURI_').TAURI_DEV_HOST || '127.0.0.1', clientPort: 5178 },
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
      name: 'my-ui-dev-server-identity',
      configureServer(server) {
        // 仅在开发环境确认项目身份，避免误用同端口的其他应用。
        server.middlewares.use('/__my-ui/dev-server', (_request, response) => {
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.setHeader('Cache-Control', 'no-store')
          response.end(JSON.stringify({ app: 'my-ui', root: projectRoot }))
        })
      },
    },
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
