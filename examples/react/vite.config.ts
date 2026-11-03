import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// examples/react 独立构建：入口 index.html 加载 react.tsx，复用仓库根 lib/ 的样式与核心。
const appRoot = decodeURIComponent(new URL('.', import.meta.url).pathname).replace(/^\/(\w:)/, '$1')
const repoRoot = decodeURIComponent(new URL('../..', import.meta.url).pathname).replace(/^\/(\w:)/, '$1')

export default defineConfig({
  root: appRoot,
  clearScreen: false,
  // 站点没有独立静态资源目录，图标等由渲染内容自带。
  publicDir: false,
  resolve: {
    alias: [
      // 直接读封装源码，避免命中 Bun 安装副本的旧出口。
      { find: '@my-ui/react', replacement: repoRoot + 'packages/react/index.ts' },
      { find: '/packages', replacement: repoRoot + 'packages' },
      { find: '/lib', replacement: repoRoot + 'lib' },
    ],
    dedupe: ['react', 'react-dom'],
  },
  server: {
    host: '127.0.0.1',
    port: 5181,
    strictPort: true,
    // 样式与核心在仓库根部的 lib/，开发服务需要能读到仓库根。
    fs: { allow: [repoRoot] },
  },
  build: {
    outDir: appRoot + 'dist',
    emptyOutDir: true,
    rolldownOptions: { input: { main: appRoot + 'index.html' } },
  },
  plugins: [react()],
})
