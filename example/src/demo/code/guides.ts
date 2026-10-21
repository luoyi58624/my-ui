import type { CodeFile } from './types'
import { appBarCode, bottomNavigationCode, pageCode, tabsCode } from './native'

/** 示例内的两份入门指南。 */
export type GuideKind = 'quick-start' | 'native'

interface GuideSection {
  id: string
  title: string
  paragraphs: string[]
  files?: CodeFile[]
  link?: { label: string; path: string }
}
interface Guide {
  title: string
  subtitle: string
  sections: GuideSection[]
}
function file(name: string, language: CodeFile['language'], source: CodeFile['source']): CodeFile {
  return { name, language, source }
}

/** 指南代码与组件示例共用展示、折叠及复制功能。 */
export const guides: Record<GuideKind, Guide> = {
  'quick-start': {
    title: '快速开始',
    subtitle: '从引入源码到完成第一个交互，了解 my-ui 的基础用法。',
    sections: [
      {
        id: 'setup',
        title: '01 · 引入 my-ui',
        paragraphs: [
          'my-ui 以可复制、可修改的源码提供，目前不发布 npm 包。在已有的 Vue 3 + Vite 项目中，把 packages/core 和 packages/vue 一起复制到 src/my-ui，保留两个目录的相邻关系。',
          '直接导入需要的组件即可，不需要 app.use 全局注册。Vue 入口会自动引入公共 CSS 和交互代码。当前仓库的示例使用 workspace 名称 @my-ui/vue；复制到自己的项目后，改成对应的本地路径。'
        ],
        files: [
          file(
            '目录结构',
            'text',
            `src/
  my-ui/
    core/       ← 完整复制 packages/core
    vue/        ← 完整复制 packages/vue
  App.vue
  main.ts`
          ),
          file(
            'main.ts',
            'typescript',
            `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`
          )
        ]
      },
      {
        id: 'first-component',
        title: '02 · 第一个交互',
        paragraphs: [
          '在 App.vue 中直接使用 Button、Input 和 Card。用 ref 保存状态，v-model 同步输入，@click 响应操作；组件内容放入默认插槽。'
        ],
        files: [
          file(
            'App.vue',
            'vue',
            `<script setup lang="ts">
import { ref } from 'vue'
import { Button, Card, Input } from './my-ui/vue'

const name = ref('小蓝')
const greeting = ref('')
function greet() {
  greeting.value = '你好，' + (name.value.trim() || '新朋友')
}
</script>

<template>
  <main class="welcome">
    <Card title="开始使用 my-ui" description="组件可以直接组合">
      <Input v-model="name" label="你的名字" clearable />
      <Button @click="greet">打个招呼</Button>
      <p role="status">{{ greeting }}</p>
    </Card>
  </main>
</template>

<style scoped>
.welcome {
  max-width: 560px;
  margin: 40px auto;
  padding: 20px;
}
</style>`
          )
        ],
        link: { label: '查看 Button 示例与代码', path: '/example/button' }
      },
      {
        id: 'bindings',
        title: '03 · 属性、双向绑定与插槽',
        paragraphs: [
          '属性控制组件外观和行为，v-model 保存组件的值，事件用于处理业务操作。选项通常使用 value 与 label，带图标时增加 icon。',
          '命名插槽用于替换局部内容，例如 Input 的 hint。开关值用布尔值，输入框用字符串，数量用数字；单选和多选按各组件的示例传入字符串或数组。'
        ],
        files: [
          file(
            'Preferences.vue',
            'vue',
            `<script setup lang="ts">
import { ref } from 'vue'
import { Input, Select, Switch, type Option } from './my-ui/vue'

const nickname = ref('小蓝')
const city = ref('hangzhou')
const notifications = ref(true)
const cities: Option[] = [
  { value: 'hangzhou', label: '杭州' },
  { value: 'shanghai', label: '上海' }
]
</script>

<template>
  <Input v-model="nickname" label="昵称" :maxlength="24">
    <template #hint
      ><span>已输入 {{ nickname.length }} / 24 个字符</span></template
    >
  </Input>
  <Select v-model="city" label="所在城市" :options="cities" />
  <Switch v-model="notifications" label="消息提醒" />
</template>`
          )
        ]
      },
      {
        id: 'popup',
        title: '04 · 提示与弹窗',
        paragraphs: [
          'Toast 通过组件引用显示轻提示。popup API 用于确认弹窗、抽屉和底部面板；使用这些 API 时，在应用根组件挂载一次 Popup。当前展示应用已经挂载，不需要在每个示例里重复添加。'
        ],
        files: [
          file(
            'App.vue',
            'vue',
            `<script setup lang="ts">
import { ref } from 'vue'
import { Button, Popup, Toast, popup } from './my-ui/vue'

const toast = ref<InstanceType<typeof Toast>>()
async function save() {
  const accepted = await popup.showAlert({
    title: '保存更改？',
    message: '确认后更新你的设置。',
    confirmText: '保存'
  })
  if (accepted) toast.value?.show('已保存')
}
</script>

<template>
  <Button @click="save">保存设置</Button>
  <Toast ref="toast" />
  <Popup />
</template>`
          )
        ],
        link: { label: '查看弹窗与面板示例', path: '/example/feedback' }
      },
      {
        id: 'styles',
        title: '05 · 明暗模式与样式',
        paragraphs: [
          '组件提供默认的浅色和深色样式，通过 html 上的 data-theme 选择。使用 CSS 变量调整品牌颜色，使用 class 和 style 调整业务布局；当前示例的主题编辑器属于展示应用，不是组件的必装依赖。'
        ],
        files: [
          file(
            'theme.ts',
            'typescript',
            `// 可在应用启动时根据用户偏好设置。
document.documentElement.dataset.theme = 'dark'

// 切回浅色。
// document.documentElement.dataset.theme = 'light'`
          ),
          file(
            'app.css',
            'css',
            `/* 在引入 my-ui 后加载自己的样式。 */
html[data-theme='light'] {
  --primary: #365cce;
}
html[data-theme='dark'] {
  --primary: #abc5ff;
}

.settings-page {
  max-width: 720px;
  margin: auto;
  padding: 24px;
}`
          )
        ]
      },
      {
        id: 'html',
        title: '06 · 直接在 HTML 中使用',
        paragraphs: [
          '不使用 Vue 时，复制 core 中的 my-ui.css 与 my-ui.js，直接引入。首屏 data-my 声明会自动初始化；动态插入内容后调用 MyUI.init(container)。命令式挂载返回实例，可用 update 更新、destroy 清理。'
        ],
        files: [
          file(
            'index.html',
            'html',
            `<!doctype html>
<html lang="zh-CN" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>my-ui 入门</title>
    <link rel="stylesheet" href="./my-ui.css" />
    <script src="./my-ui.js" defer></script>
  </head>
  <body>
    <button class="my-button" type="button">保存</button>
    <input data-my="Switch" data-options='{"value":true,"label":"自动保存"}' />
    <div id="city"></div>
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        const city = MyUI.mount('#city', 'Select', {
          label: '所在城市',
          value: 'hangzhou',
          options: [
            { value: 'hangzhou', label: '杭州' },
            { value: 'shanghai', label: '上海' }
          ],
          onChange(value) {
            console.log('选择城市：', value)
          }
        })
        city.update({ value: 'shanghai' })
        // 移除页面时调用 city.destroy()。
      })
    </script>
  </body>
</html>`
          )
        ],
        link: { label: '打开 HTML 示例', path: '/html' }
      }
    ]
  },
  native: {
    title: '集成原生',
    subtitle: '用 Vue 属性、事件与插槽接入系统导航控件和下拉刷新。',
    sections: [
      {
        id: 'platform',
        title: '01 · 组件与平台',
        paragraphs: [
          '基础 my-ui 组件运行在 WebView 内。tauri-plugin-native-components 额外提供 AppBar、BottomNavigation、Tabs 和 Page，适合系统导航、页面容器与下拉刷新等需要原生体验的部分。组件命名不添加 Native 前缀。',
          'Android 使用原生导航控件和 SwipeRefreshLayout。浏览器、Windows、macOS、Linux 以及 iOS 使用 Web 回退，目前没有 iOS 原生 UI。浏览器中可以验证属性、事件、布局和 Web 刷新交互，Android 系统控件的实际效果需要设备环境。',
          'my-ui 与插件都导出了 AppBar、Tabs，按需求选择导入来源。下面的代码均从 tauri-plugin-native-components/vue 导入原生封装组件。'
        ],
        link: { label: '浏览全部原生组件示例', path: '/native' }
      },
      {
        id: 'install',
        title: '02 · 安装与注册插件',
        paragraphs: [
          '将插件源码放在项目旁边，通过本地 file 依赖安装。下面是需要合并进现有文件的配置片段；路径分别相对于 package.json 和 src-tauri/Cargo.toml。修改依赖后，在项目中运行 bun install。',
          '只使用组件时注册 init() 即可。当前插件基于 Tauri 2.12，Android 控件要求 API 24+，宿主 Activity 使用 Material 主题，例如 Theme.Material3.DayNight.NoActionBar。Android 配置变更后需重新构建应用。'
        ],
        files: [
          file(
            'package.json',
            'json',
            `{
  "dependencies": {
    "tauri-plugin-native-components": "file:../tauri-plugin-native-components"
  }
}`
          ),
          file(
            'src-tauri/Cargo.toml',
            'toml',
            `[dependencies]
tauri-plugin-native-components = { path = "../node_modules/tauri-plugin-native-components" }`
          ),
          file(
            'src-tauri/src/lib.rs',
            'rust',
            `#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_native_components::init())
        .run(tauri::generate_context!())
        .expect("启动应用失败");
}`
          ),
          file(
            'src-tauri/capabilities/mobile.json',
            'json',
            `{
  "$schema": "../gen/schemas/mobile-schema.json",
  "identifier": "mobile",
  "platforms": ["android"],
  "windows": ["main", "native-page-*"],
  "permissions": ["native-components:default"]
}`
          ),
          file(
            'res/values/themes.xml',
            'html',
            `<!-- 修改 Android 宿主原有主题的 parent，保留实际主题名与其他设置。 -->
<resources>
  <style name="Theme.my_app" parent="Theme.Material3.DayNight.NoActionBar" />
</resources>
<!-- AndroidManifest.xml 的 application android:theme 应指向这个主题。 -->`
          )
        ]
      },
      {
        id: 'page',
        title: '03 · Page、导航栏与下拉刷新',
        paragraphs: [
          '先引入插件样式。Page 的 navbar、navigation 插槽分别放顶部 AppBar 和底部 BottomNavigation，默认插槽放正文。Android 使用原生导航与中间原 WebView 的三段布局；其他平台使用 Web 模拟相同结构。页面必须有确定高度，例如 100dvh。',
          '设置 refreshable，绑定 v-model:refreshing，在 @refresh 中请求数据，并在 finally 中把 refreshing 设为 false。Android 支持不松手从正文滚动接到下拉刷新，向上推回刷新器后继续滚动正文，松手超过阈值才刷新。按钮可调用组件引用的 refresh()，共用同一套刷新流程。直接设置 refreshing=true 只显示指示器，不触发业务请求。'
        ],
        files: [file('PageExample.vue', 'vue', pageCode)],
        link: { label: '体验 Page 与下拉刷新', path: '/page-refresh' }
      },
      {
        id: 'navigation',
        title: '04 · AppBar、BottomNavigation 与 Tabs',
        paragraphs: [
          'AppBar 的 actions 使用结构化数据，@action 接收 value；@back 交给业务处理。BottomNavigation 用 v-model 管理当前项，items 支持 2～5 项，每项的 value 应唯一。',
          'Tabs 将底栏与页面容器组合起来，默认插槽收到当前 value。下面展示 Vue 内容的用法；如需真正的 Android Tab 页面，为选项设置 nativeView，并在宿主注册 NativeTabViews 页面工厂。Vue 模板不会自动转换成 Android View。'
        ],
        files: [
          file('AppBarExample.vue', 'vue', appBarCode),
          file('BottomNavigationExample.vue', 'vue', bottomNavigationCode),
          file('TabsExample.vue', 'vue', tabsCode)
        ],
        link: { label: '打开 Tabs 示例', path: '/native/tabs' }
      },
      {
        id: 'overlay',
        title: '05 · 与 Web 弹窗配合',
        paragraphs: [
          'Page 的原生导航位于 WebView 的实际边界之外，Dialog、Drawer、Menu 等 Web 弹层只覆盖中间正文，Vue 插槽和状态保持原样。无需订阅弹层状态来切换导航版本；遮罩出现时顶部操作、返回按钮和底部导航继续可交互，原生导航实例保持不变。内容区内额外放置的原生控件仍会按 DOM 的 inert 状态暂停。'
        ],
        files: [
          file(
            'App.vue',
            'vue',
            `<script setup lang="ts">
import { Button, Popup, popup } from '@my-ui/vue'
import { AppBar, Page } from 'tauri-plugin-native-components/vue'
import 'tauri-plugin-native-components/style.css'

function showDialog() {
  void popup.showAlert({ title: '提示', message: '弹窗只覆盖正文，页面导航保持原生实例。' })
}
</script>

<template>
  <Page style="height: 100dvh">
    <template #navbar><AppBar title="设置" /></template>
    <Button @click="showDialog">打开弹窗</Button>
  </Page>
  <Popup />
</template>`
          )
        ]
      },
      {
        id: 'native-router',
        title: '06 · 可选：使用原生页面导航',
        paragraphs: [
          '只使用上面的导航控件和 Page 时不需要新 Activity。需要 Android push 打开独立系统页面时，将 Vue Router 交给 createNativeRouter；浏览器与桌面仍在当前窗口内跳转。路由名称、页面组件由业务项目定义。',
          'Android 页面导航要求 API 32+，Rust 端改用 Builder 并指定 NativePageActivity。宿主需要注册子 Activity：MainActivity 使用 singleTop，子页使用默认 standard、exported=false，两个 Activity 的 configChanges 保持一致。',
          '子页主题继承宿主主题并设置 windowDisablePreview=true，AppActivity 为独立子页启用 waitForPage。Activity 立即开始系统转场，Page 只暂隐正在交接的 WebView 正文，等导航隐藏与正文首帧确认后显示；未使用 Page 的自定义内容在挂载后调用 /router 的 readyPage()。',
          '下面提供当前示例的宿主文件作为接入参考。迁移时替换 dev.myui.example 包名、主题名及业务 Tab 注册。AppActivity 的生命周期转发顺序应保留。每个 Activity 有独立 Vue 实例，共享数据需要另外接入存储或状态同步。'
        ],
        files: [
          file(
            'navigation.ts',
            'typescript',
            `import { createNativeRouter } from 'tauri-plugin-native-components/router'
import { router } from './router'

// router.ts 导出项目的 Vue Router，并注册 /detail 路由。
export const navigation = createNativeRouter(router)

// 在点击事件中调用：
// await navigation.push('/detail', { title: '详情' })
// await navigation.back('/home')`
          ),
          file(
            'Rust 插件注册',
            'rust',
            `.plugin(
    tauri_plugin_native_components::Builder::new()
        .activity_name("NativePageActivity")
        .build()
)`
          ),
          file('AppActivity.kt', 'kotlin', () =>
            import('../../../src-tauri/gen/android/app/src/main/java/dev/myui/example/AppActivity.kt?raw').then(
              (m) => m.default
            )
          ),
          file('MainActivity.kt', 'kotlin', () =>
            import('../../../src-tauri/gen/android/app/src/main/java/dev/myui/example/MainActivity.kt?raw').then(
              (m) => m.default
            )
          ),
          file('NativePageActivity.kt', 'kotlin', () =>
            import('../../../src-tauri/gen/android/app/src/main/java/dev/myui/example/NativePageActivity.kt?raw').then(
              (m) => m.default
            )
          ),
          file('AndroidManifest.xml', 'html', () =>
            import('../../../src-tauri/gen/android/app/src/main/AndroidManifest.xml?raw').then(
              (m) => m.default
            )
          ),
          file('themes.xml', 'html', () =>
            import('../../../src-tauri/gen/android/app/src/main/res/values/themes.xml?raw').then(
              (m) => m.default
            )
          ),
          file('DemoNativeTab.kt', 'kotlin', () =>
            import('../../../src-tauri/gen/android/app/src/main/java/dev/myui/example/DemoNativeTab.kt?raw').then(
              (m) => m.default
            )
          )
        ],
        link: { label: '查看原生页面与共享状态示例', path: '/example/native-navigation' }
      },
      {
        id: 'next',
        title: '07 · 按需使用系统能力',
        paragraphs: [
          '普通表单、卡片、列表和弹窗继续使用 my-ui。需要文件选择、文件系统、系统通知等能力时，优先查找 Tauri 已有插件，再决定是否增加新的原生封装。',
          '每个组件示例都有可折叠、可复制的用法代码。原生全屏示例可从原生组件目录进入，浏览器中会自动展示 Web 回退。'
        ],
        link: { label: '返回原生组件目录', path: '/native' }
      }
    ]
  }
}
