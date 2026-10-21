import type { CodeFile } from './types'

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
    title: '应用与平台',
    subtitle: '界面与滚动由 Web 完成，Android 继续提供原生多页面导航。',
    sections: [
      { id: 'layout', title: '01 · 组合应用布局', paragraphs: [
        '使用普通纵向 flex 布局：AppBar 放在顶部，内容区 flex: 1、min-height: 0、overflow: auto，Tabbar 放在底部。组件不创建原生 View，也不接管应用路由。',
        '同一窗口内，主栏目首次访问后用 v-show 保留；Web 路由详情用有数量上限的 KeepAlive 保存临时状态。Android 打开详情时可使用独立 Activity 与 WebView。'
      ], link: { label: '体验 AppBar 和 Tabbar', path: '/example/tabbar' } },
      { id: 'routing', title: '02 · 保留原生多页面导航', paragraphs: [
        '切换主栏目使用 replace，避免累积返回记录。openPage 通过 createNativeRouter 进入详情：Android 使用独立 Activity 与 WebView；浏览器和桌面使用 Vue Router。closePage 返回原窗口或上一条 Web 路由。',
        '保留页面跳转、原生返回和页面就绪链路。每个页面内部使用 Web AppBar、Tabbar 与滚动内容，不再创建原生 UI 控件。'
      ], files: [file('commons/navigation.ts', 'typescript', () => import('../navigation.ts?raw').then(m => m.default))] },
      { id: 'refresh', title: '03 · 列表下拉刷新', paragraphs: [
        'PullRefresh 提供独立的滚动区域，用 v-model 表达刷新状态，@refresh 发起请求。请求完成或失败都在 finally 中将刷新状态设为 false。'
      ], link: { label: '体验 Web 下拉刷新', path: '/example/pull-refresh' } },
      { id: 'platform', title: '04 · 保留需要的系统能力', paragraphs: [
        'Android 宿主处理系统安全区域、键盘避让和返回按钮；返回先关闭最上层弹窗，再返回 Web 路由或关闭当前 Activity。主题同步系统栏外观，字重继续读取 Android 系统设置。',
        '浏览器与桌面继续使用同一套 Web 页面。原生 HTML 也可直接使用 core 中的 CSS 和 JavaScript。'
      ], link: { label: '打开纯 HTML 示例', path: '/html' } },
      { id: 'state', title: '05 · 跨页状态与持久化', paragraphs: [
        '保留跨窗口 Pinia 状态同步和本地持久化。Android 的多个 WebView 能共享备注与计数，重新启动后也可恢复。'
      ], link: { label: '体验跨页状态', path: '/example/native-navigation' } }
    ]
  }
}
