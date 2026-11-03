import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
// 仓库级浏览器回归（tests/react.*.tsx）以本配置为测试服务，需要 JSX 转换；React 示例本身在 examples/react 构建。
import react from '@vitejs/plugin-react'

// examples/vue 只承载组件示例页与完整交互示例长页；四栏目示例应用在 examples/tauri/ui，散装原生页面在 examples/others。
const appRoot = decodeURIComponent(new URL('.', import.meta.url).pathname).replace(/^\/(\w:)/, '$1')
const repoRoot = decodeURIComponent(new URL('../..', import.meta.url).pathname).replace(/^\/(\w:)/, '$1')
const othersRoot = repoRoot + 'examples/others/'
const shellRoot = repoRoot + 'examples/tauri/ui/src/'
const nativeComponentsRoot = decodeURIComponent(new URL('../../../../tauri/plugins/tauri-plugin-native-components', import.meta.url).pathname).replace(/^\/(\w:)/, '$1')

// others/ 下的页面按「双击、直接引用 ../../lib」编写，开发服务以本目录为根时换成绝对地址。
const standalonePages = ['native.html', 'card.html', 'components.html']
// 本项目没有引入 @types/node，按文件读取器的最小签名声明，配置里不额外增加类型依赖。
let readTextFile: ((path: string, encoding: 'utf8') => string) | undefined
async function readStandalonePage(name: string, publicBase: string) {
  if (!readTextFile) {
    // 非字面量模块名让类型检查跳过 node 内置模块解析。
    const builtin = 'node:' + 'fs'
    readTextFile = (await import(builtin)).readFileSync
  }
  return readTextFile!(othersRoot + name, 'utf8')
    .replaceAll('../../lib/', '/lib/')
    .replaceAll('../vue/public/', publicBase)
    .replaceAll('../vue/', publicBase)
    .replaceAll('./src/commons/native-theme.ts', publicBase + 'src/commons/native-theme.ts')
}

export default defineConfig(({ mode }) => {
  // 浏览器测试以仓库为根目录，散装页面那时位于 /examples/vue 旁边，保留真实相对地址即可。
  const publicBase = mode === 'test' ? '/examples/vue/' : '/'
  return {
    root: mode === 'test' ? repoRoot : appRoot,
    clearScreen: false,
    publicDir: appRoot + 'public',
    resolve: {
      alias: [
        { find: '/packages', replacement: repoRoot + 'packages' },
        { find: '/lib', replacement: repoRoot + 'lib' },
        // 示例应用壳（四栏目、Tabbar、详情与指南页）在 examples/tauri/ui，路由表继续引用同一份组件。
        { find: '@shell', replacement: shellRoot },
        // 浏览器回归与开发服务都从本目录启动示例应用入口，别名要能回指本项目的组件示例页。
        { find: '@demo', replacement: appRoot + 'src/' },
        // 浏览器测试以仓库为根目录，真实 HTML 入口仍需加载示例的绝对模块地址。
        ...(mode === 'test' ? [
          { find: '/src', replacement: appRoot + 'src' },
          // 测试入口位于仓库根目录，和示例及插件共用同一个路由实例。
          { find: /^vue-router$/, replacement: appRoot + 'node_modules/vue-router/dist/vue-router.mjs' },
        ] : []),
        // 本地插件直接读取源码，新增或更名组件后不再命中 Bun 安装副本的旧出口。
        { find: 'tauri-plugin-native-components', replacement: nativeComponentsRoot },
        // 使用库自带的常用语言集合，避免代码示例加载全部语法。
        { find: /^highlight\.js$/, replacement: 'highlight.js/lib/common' },
      ],
      dedupe: ['vue', 'vue-router', 'react', 'react-dom'],
    },
    // 本地插件直接分发 Vue 源码，避免开发预构建缓存旧组件出口；
    // 插件自己的 @tauri-apps/api 位于仓库外，显式预构建，避免首次进入详情时才优化并整页刷新。
    optimizeDeps: { exclude: ['tauri-plugin-native-components'], include: ['@tauri-apps/api/core'] },
    server: {
      fs: { allow: [repoRoot, nativeComponentsRoot] },
      // Rust 编译与生成文件交给 Tauri 守护，避免监听大量构建产物（也避开 Windows 文件占用报错）。
      watch: { ignored: ['**/tauri/**', '**/dist/**'] },
      // Android 页面使用 Tauri 虚拟域名，热更新连接直接走 USB 转发的开发地址。
      hmr: mode === 'test' ? undefined : { host: loadEnv(mode, repoRoot, 'TAURI_').TAURI_DEV_HOST || '127.0.0.1', clientPort: 5178 },
    },
    build: {
      outDir: appRoot + 'dist',
      emptyOutDir: true,
      rolldownOptions: {
        // native-page.html 在 examples/others，构建时由 scripts/copy-native.mjs 复制并指向同一份主入口脚本。
        input: { main: appRoot + 'index.html', nativeTheme: appRoot + 'src/commons/native-theme.ts' },
        output: { entryFileNames: chunk => chunk.name === 'nativeTheme' ? 'native-theme.js' : 'assets/[name]-[hash].js' },
      },
    },
    plugins: [
      vue(),
      react({ include: /\.[jt]sx$/ }),
      {
        name: 'my-ui-standalone-pages',
        configureServer(server) {
          // 散装页面仍在 /native.html 等原地址上访问，开发时直接读取 examples/others 的真实文件。
          server.middlewares.use((request, response, next) => {
            const pathname = new URL((request as { url?: string }).url ?? '/', 'http://127.0.0.1').pathname.slice(1)
            if (!standalonePages.includes(pathname)) return next()
            void readStandalonePage(pathname, publicBase).then(html => {
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
