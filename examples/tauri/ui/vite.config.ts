import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// examples/tauri/ui 是桌面与 Android 壳的前端：四栏目、Tabbar 与详情路由在这里启动，
// 组件示例页仍只有一份，位于 examples/vue/src，通过 @demo 别名直接引用。
const appRoot = decodeURIComponent(new URL('.', import.meta.url).pathname).replace(/^\/(\w:)/, '$1')
const repoRoot = decodeURIComponent(new URL('../../../', import.meta.url).pathname).replace(/^\/(\w:)/, '$1')
const demoRoot = repoRoot + 'examples/vue/src/'
const othersRoot = repoRoot + 'examples/others/'
const nativeComponentsRoot = decodeURIComponent(new URL('../../../../../tauri/plugins/tauri-plugin-native-components', import.meta.url).pathname).replace(/^\/(\w:)/, '$1')

// 原生子页入口在 examples/others，开发时按原地址直接读取，脚本指向本项目的 main.ts。
let readTextFile: ((path: string, encoding: 'utf8') => string) | undefined
async function readNativePage() {
  if (!readTextFile) {
    // 非字面量模块名让类型检查跳过 node 内置模块解析。
    const builtin = 'node:' + 'fs'
    readTextFile = (await import(builtin)).readFileSync
  }
  return readTextFile!(othersRoot + 'native-page.html', 'utf8')
}

export default defineConfig(({ mode }) => {
  // 浏览器回归以仓库为根目录，示例应用入口同时可从 /examples/tauri/ui/index.html 访问。
  const isTest = mode === 'test'
  return {
    root: isTest ? repoRoot : appRoot,
    clearScreen: false,
    publicDir: appRoot + 'public',
    resolve: {
      alias: [
        { find: '/packages', replacement: repoRoot + 'packages' },
        { find: '/lib', replacement: repoRoot + 'lib' },
        // 组件示例页、文档组件与共享示例逻辑只有一份，统一在 examples/vue/src。
        { find: '@demo', replacement: demoRoot },
        { find: '@shell', replacement: appRoot + 'src' },
        // 回归服务以仓库为根目录，真实 HTML 入口仍需加载本项目的绝对模块地址。
        ...(isTest ? [
          { find: '/src', replacement: appRoot + 'src' },
          // 测试入口位于仓库根目录，和组件示例页及插件共用同一个路由实例。
          { find: /^vue-router$/, replacement: appRoot + 'node_modules/vue-router/dist/vue-router.mjs' },
        ] : []),
        // 本地插件直接读取源码，新增或更名组件后不再命中 Bun 安装副本的旧出口。
        { find: 'tauri-plugin-native-components', replacement: nativeComponentsRoot },
        // 使用库自带的常用语言集合，避免代码示例加载全部语法。
        { find: /^highlight\.js$/, replacement: 'highlight.js/lib/common' },
      ],
      dedupe: ['vue', 'vue-router', 'pinia'],
    },
    // 本地插件直接分发 Vue 源码，避免开发预构建缓存旧组件出口；
    // 插件自己的 @tauri-apps/api 位于仓库外，显式预构建，避免首次进入详情时才优化并整页刷新。
    optimizeDeps: { exclude: ['tauri-plugin-native-components'], include: ['@tauri-apps/api/core'] },
    server: {
      fs: { allow: [repoRoot, nativeComponentsRoot] },
      // Rust 编译与生成文件交给 Tauri 守护，避免监听大量构建产物（也避开 Windows 文件占用报错）。
      watch: { ignored: ['**/tauri/**', '**/dist/**'] },
      // Android 页面使用 Tauri 虚拟域名，热更新连接直接走 USB 转发的开发地址。
      hmr: isTest ? undefined : { host: loadEnv(mode, repoRoot, 'TAURI_').TAURI_DEV_HOST || '127.0.0.1', clientPort: 5177 },
    },
    build: { outDir: appRoot + 'dist', emptyOutDir: true },
    plugins: [
      vue(),
      {
        name: 'my-ui-native-page',
        configureServer(server) {
          // Android 子 Activity 打开 native-page.html 时加载同一个应用入口。
          server.middlewares.use((request, response, next) => {
            const pathname = new URL((request as { url?: string }).url ?? '/', 'http://127.0.0.1').pathname.slice(1)
            if (pathname !== 'native-page.html') return next()
            void readNativePage().then(html => {
              response.setHeader('Content-Type', 'text/html; charset=utf-8')
              response.setHeader('Cache-Control', 'no-store')
              response.end(html)
            }, (error: Error) => next(error))
          })
        },
      },
      {
        name: 'my-ui-dev-server-identity',
        configureServer(server) {
          // 仅在开发环境确认项目身份，避免误用同端口的其他应用。
          server.middlewares.use('/__my-ui/dev-server', (_request, response) => {
            response.setHeader('Content-Type', 'application/json; charset=utf-8')
            response.setHeader('Cache-Control', 'no-store')
            response.end(JSON.stringify({ app: 'my-ui', root: repoRoot }))
          })
        },
      },
      {
        name: 'my-ui-core-reload',
        handleHotUpdate(context) {
          // 核心是同页单例；编辑 JS 后完整刷新，避免遗留旧控制器与监听。
          if (/[\\/]lib[\\/]my-ui\.js$/.test(context.file)) {
            context.server.ws.send({ type: 'full-reload' })
            return []
          }
        },
      },
    ],
  }
})
