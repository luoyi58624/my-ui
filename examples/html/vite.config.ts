import { defineConfig } from 'vite'

/**
 * 纯静态示例站：不需要打包，也不改任何源码。
 * 这个配置只让 `vite dev` 把 examples/html 作为站点根目录，
 * 方便在本地起服务预览；仍可直接双击 HTML 文件打开。
 */
// 组件库的样式与脚本放在仓库根 lib/，页面按「双击、直接引用 ../../lib」编写。
// 开发服务以本目录为根时，/lib/* 会落到 examples/html/lib 而命中 404，
// 所以显式把 /lib 映射回仓库根并放行该目录（与本仓库其他示例的写法一致）。
const repoRoot = decodeURIComponent(new URL('../..', import.meta.url).pathname).replace(
  /^\/(\w:)/,
  '$1'
)

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: [{ find: '/lib', replacement: repoRoot + 'lib' }]
  },
  server: {
    host: '127.0.0.1',
    port: 5180,
    strictPort: true,
    fs: { allow: [repoRoot] }
    // 不设置 open：起服务时自动拉起用户浏览器会打断正在做别的事情。
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
