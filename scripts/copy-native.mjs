import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

// 原样提供可编辑的 CSS/JS 与离线页面，原生入口无需 Vue 或构建工具。
// 产物写入 examples/vue/dist：Web 部署、桌面壳和 Android 共用同一份前端目录。
const output = new URL('../examples/vue/dist/', import.meta.url)
mkdirSync(new URL('lib/', output), { recursive: true })
for (const file of ['my-ui.css', 'my-ui.js', 'my-ui.d.ts']) {
  copyFileSync(new URL('../lib/' + file, import.meta.url), new URL('lib/' + file, output))
}
// native-page.html 是 Vue 应用在原生子页里的入口：它和 index.html 共用主入口，脚本与样式以构建产物为准。
const indexHtml = readFileSync(new URL('index.html', output), 'utf8')
const entryAssets = [...indexHtml.matchAll(/<(?:script|link)\b[^>]*(?:type="module"|rel="modulepreload"|rel="stylesheet")[^>]*>(?:<\/script>)?/g)]
  .map(tag => tag[0]).join('\n    ')
if (!entryAssets) throw new Error('示例构建产物缺少主入口脚本，请先构建 examples/vue')
// examples/others 的页面是可直接双击的散装示例，落到产物同一层时把 ../vue 与 ../../lib 改回同级。
for (const page of ['native.html', 'card.html', 'components.html', 'native-page.html']) {
  const html = readFileSync(new URL('../examples/others/' + page, import.meta.url), 'utf8')
    .replaceAll('../../lib/', './lib/')
    .replaceAll('../vue/public/', './')
    .replaceAll('../vue/', './')
    .replaceAll('./src/commons/native-theme.ts', './native-theme.js')
    .replace('<script type="module" src="/src/main.ts"></script>', entryAssets)
  writeFileSync(new URL(page, output), html)
}
