import { copyFileSync, mkdirSync } from 'node:fs'

// 原样提供可编辑的 CSS/JS 与离线页面，原生入口无需 Vue 或构建工具。
mkdirSync('dist/lib', { recursive: true })
for (const file of ['my-ui.css', 'my-ui.js']) copyFileSync('lib/' + file, 'dist/lib/' + file)
copyFileSync('native.html', 'dist/native.html')
