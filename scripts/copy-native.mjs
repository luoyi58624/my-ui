import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

// 原样提供可编辑的 CSS/JS 与离线页面，原生入口无需 Vue 或构建工具。
// 组件示例页产物写入 examples/vue/dist：Web 部署与离线页面共用这一份目录。
const demoOutput = new URL('../examples/vue/dist/', import.meta.url)
mkdirSync(new URL('lib/', demoOutput), { recursive: true })
for (const file of ['my-ui.css', 'my-ui.js', 'my-ui.d.ts']) {
  copyFileSync(new URL('../lib/' + file, import.meta.url), new URL('lib/' + file, demoOutput))
}
// examples/others 的页面是可直接双击的散装示例，落到产物同一层时把 ../vue 与 ../../lib 改回同级。
for (const page of ['native.html', 'card.html', 'components.html']) {
  const html = readFileSync(new URL('../examples/others/' + page, import.meta.url), 'utf8')
    .replaceAll('../../lib/', './lib/')
    .replaceAll('../vue/public/', './')
    .replaceAll('../vue/', './')
    .replaceAll('./src/commons/native-theme.ts', './native-theme.js')
  writeFileSync(new URL(page, demoOutput), html)
}
// native-page.html 是示例应用在原生子页里的入口：它和 examples/tauri/ui 的 index.html 共用主入口脚本。
const appOutput = new URL('../examples/tauri/ui/dist/', import.meta.url)
const appIndexHtml = readFileSync(new URL('index.html', appOutput), 'utf8')
const appEntryAssets = [...appIndexHtml.matchAll(/<(?:script|link)\b[^>]*(?:type="module"|rel="modulepreload"|rel="stylesheet")[^>]*>(?:<\/script>)?/g)]
  .map(tag => tag[0]).join('\n    ')
if (!appEntryAssets) throw new Error('示例应用构建产物缺少主入口脚本，请先构建 examples/tauri/ui')
const nativePage = readFileSync(new URL('../examples/others/native-page.html', import.meta.url), 'utf8')
  .replaceAll('../vue/public/', './')
  .replaceAll('../vue/', './')
  .replace('<script type="module" src="/src/main.ts"></script>', appEntryAssets)
writeFileSync(new URL('native-page.html', appOutput), nativePage)
