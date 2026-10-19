import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

// 原样提供可编辑的 CSS/JS 与离线页面，原生入口无需 Vue 或构建工具。
const output = new URL('../dist/', import.meta.url)
mkdirSync(new URL('lib/', output), { recursive: true })
for (const file of ['my-ui.css', 'my-ui.js', 'my-ui.d.ts']) {
  copyFileSync(new URL('../packages/core/' + file, import.meta.url), new URL('lib/' + file, output))
}
const html = readFileSync(new URL('../example/native.html', import.meta.url), 'utf8')
  .replaceAll('../packages/core/', './lib/')
  .replaceAll('./public/', './')
writeFileSync(new URL('native.html', output), html)
