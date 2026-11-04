import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

// 原样提供可编辑的 CSS/JS 与离线页面，原生入口无需 Vue 或构建工具。
const target = process.argv[2]
if (target !== 'vue' && target !== 'tauri') throw new Error('请指定 vue 或 tauri 示例产物')
const output = new URL(target === 'vue' ? '../examples/vue/dist/' : '../examples/tauri/ui/dist/', import.meta.url)
mkdirSync(new URL('lib/', output), { recursive: true })
for (const file of ['my-ui.css', 'my-ui.js', 'my-ui.d.ts']) {
  copyFileSync(new URL('../lib/' + file, import.meta.url), new URL('lib/' + file, output))
}
// examples/others 的页面是可直接双击的散装示例，落到产物同一层时把 ../vue 与 ../../lib 改回同级。
for (const page of ['native.html', 'card.html', 'components.html']) {
  const html = readFileSync(new URL('../examples/others/' + page, import.meta.url), 'utf8')
    .replaceAll('../../lib/', './lib/')
    .replaceAll('../vue/public/', './')
    .replaceAll('../vue/', './')
    .replaceAll('./src/commons/native-theme.ts', './native-theme.js')
  writeFileSync(new URL(page, output), html)
}

if (target === 'vue') process.exit(0)
// native-page.html 是示例应用在原生子页里的入口：它和 examples/tauri/ui 的 index.html 共用主入口脚本。
const appIndexHtml = readFileSync(new URL('index.html', output), 'utf8')
const appEntryAssets = [...appIndexHtml.matchAll(/<(?:script|link)\b[^>]*(?:type="module"|rel="modulepreload"|rel="stylesheet")[^>]*>(?:<\/script>)?/g)]
  .map(tag => tag[0]).join('\n    ')
if (!appEntryAssets) throw new Error('示例应用构建产物缺少主入口脚本，请先构建 examples/tauri/ui')
const nativePage = readFileSync(new URL('../examples/others/native-page.html', import.meta.url), 'utf8')
  .replaceAll('../vue/public/', './')
  .replaceAll('../vue/', './')
  .replace('<script type="module" src="/src/main.ts"></script>', appEntryAssets)
writeFileSync(new URL('native-page.html', output), nativePage)
