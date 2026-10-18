# my-ui

可以直接复制、本地修改的组件源码。原生 HTML 与 Vue 共用同一套样式、交互、定位与动画；不发布 npm 包。组件只提供 CSS 默认明暗样式，展示页的配色预设和主题编辑器独立于组件库。

```text
lib/
  my-ui.css           所有组件样式，按组件分节
  my-ui.js            原生 DOM 交互核心，无框架依赖，无需编译
  my-ui.d.ts          原生 API 类型
vue/
  index.ts            Vue 组件入口
  adapter.ts          props、v-model、事件、插槽和生命周期适配
  popup.ts            Vue 内容渲染适配
  components/         43 个组件的类型与薄封装，无组件样式
src/                  Vue 示例页面与演示业务
  theme/              示例专用的配色预设、主题编辑与类型
native.html           不加载 Vue、可直接打开的 HTML 示例
```

## 普通 HTML

复制 `lib/my-ui.css` 与 `lib/my-ui.js`，直接引用。可离线运行，不需要 Vue、npm 或构建工具。项目中的 `native.html` 就是完整示例。

```html
<link rel="stylesheet" href="./lib/my-ui.css">
<script src="./lib/my-ui.js" defer></script>

<button class="my-button" type="button">保存</button>
<input data-my="Switch" data-options='{"value":true,"label":"自动保存"}'>
<div id="city"></div>

<script>
  document.addEventListener('DOMContentLoaded', () => {
    const city = MyUI.mount('#city', 'Combobox', {
      label: '目的地',
      value: 'hangzhou',
      options: [
        { value: 'hangzhou', label: '杭州' },
        { value: 'shanghai', label: '上海' },
      ],
      onChange(value) { console.log(value); },
    });
    city.update({ value: 'shanghai' });
    // 页面移除时：city.destroy();
  });
</script>
```

- `MyUI.create(name, props, options)` 创建组件，返回实例；将 `instance.element` 插入页面即可。
- `MyUI.mount(elementOrSelector, name, props, options)` 使用现有宿主，保留其中的默认内容；重复调用更新同一实例。
- `MyUI.init(container)` 增强动态插入的 `data-my` 声明及普通 `.my-button` 按钮。首屏自动执行一次。
- `instance.update(props)` 保留实例更新属性；`destroy()` 清理监听、动画与浮层。
- 原生双向值用 `value`、`onChange(value)`。也可监听 `my:change`，结果在 `event.detail` 中。
- 插槽放在 `options.slots`，支持节点、文本、组件实例或返回这些内容的函数。文本不会当 HTML 解析。
- 原生独立 Radio 使用 `optionValue` 表示本项、`value` 表示当前选项；组内推荐直接提供 `options`。独立 Checkbox 的 `value` 为布尔值，组内标识使用 `optionValue`。

## Vue

复制 `lib/` 和 `vue/` 到自己的源码目录。Vue 只需使用已有的 Vue 3 依赖；入口自动引入公共 CSS 与原生 JS，无需再次添加 script。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button, Input, Menu } from './my-ui/vue'

const name = ref('小蓝同学')
const actions = [
  { value: 'open', label: '打开' },
  { value: 'move', label: '移动到', children: [
    { value: 'daily', label: '日常' },
    { value: 'saved', label: '收藏' },
  ] },
]
</script>

<template>
  <Input v-model="name" label="名称" clearable />
  <Menu :options="actions" @select="item => console.log(item)">
    <template #default="{ trigger }"><Button v-bind="trigger">操作</Button></template>
  </Menu>
</template>
```

保留原来的 Vue 组件名、v-model、事件、具名插槽与作用域插槽。适配层使用实际原生元素作为根节点，组件之间通过 DOM 上下文共享布局与分组状态。

公共组件：Icon、Avatar、Image、Badge、Button、Tag、TagGroup、Input、Textarea、Form、FormField、Radio、RadioGroup、Checkbox、CheckboxGroup、Choices、Switch、Select、Combobox、Segmented、Slider、Progress、Tabs、Navigation、Stepper、CellGroup、ListRow、Collapse、CollapseItem、Card、Tooltip、Divider、Loading、Skeleton、Empty、Floating、Menu、Popover、Dialog、Sheet、Drawer、Popup、Toast。

## Image 图片

```vue
<Image src="/images/lake.svg" alt="山间湖泊与一叶小舟" :ratio="16 / 9" fit="cover" />
<Image :src="photo" alt="封面" :width="240" :height="160" loading="eager">
  <template #placeholder="{ state }">{{ state === 'empty' ? '暂无内容' : '正在加载' }}</template>
  <template #error="{ retry }"><Button variant="text" @click="retry">重试</Button></template>
</Image>
```

原生入口为 `MyUI.mount('#photo', 'Image', { src, alt, ratio: '16 / 9' })`，也支持 `data-my="Image"`。默认使用浏览器原生 `loading="lazy"`；首屏重点图片可设为 `eager`。指定宽高或 `ratio` 可预留空间，省略比例时加载后采用原图比例。

`fit` 支持 `cover`、`contain`、`fill`、`none`、`scale-down`。CSS 仅暴露 `--image-radius`、`--image-background`、`--image-position` 三个外观变量。`srcset`、`sizes`、`crossorigin`、`referrerpolicy` 等原生属性会传给实际 `img`，`class` 和 `style` 作用于容器。

`load` / `error` 返回当前图片的原生事件。失败内容默认提供重试按钮，错误插槽可通过 `retry()` 重载当前地址，Vue 组件 ref 和原生实例的 `exposed.retry()` 也可调用。重试不追加缓存参数，旧请求事件及销毁后的事件不会触发回调。`alt=""` 表示装饰图。

## API 弹层

```js
const confirmed = await MyUI.popup.showAlert({
  title: '保存修改？', message: '这次更改会保留在当前页面。', confirmText: '保存',
  // center: true, // 默认在底部，四周保留 16px 外边距
});

const panel = MyUI.popup.showSheet({
  title: '选择目的地',
  content: ({ close }) => MyUI.create('CellGroup', {
    mode: 'single', value: 'hangzhou',
    options: [{ value: 'hangzhou', label: '杭州' }, { value: 'shanghai', label: '上海' }],
    onSelect(item) { close(item.value); },
  }),
});
const selected = await panel.closed;
```

Vue 从 `./my-ui/vue` 导入 `popup`，`content` 返回 `h()` 构建的 Vue 内容。需要应用的 provide/inject 上下文时在根部放一个 `<Popup />`；原生 API 无需宿主。`showDrawer` 复用同样的内容与结果接口，支持四个方向。`closeAll()` 可在原生应用卸载时释放所有 API 窗口。

## 改样式、主题和交互

组件类名统一为 `my-` 前缀，例如 `.my-button`、`.my-input-box`、`.my-list-row`。所有组件规则只在 `lib/my-ui.css` 中维护，组件内部选择器带有隔离标记，避免影响宿主页面。变量保留简短的语义名，按需覆盖即可。

```css
/* 单个输入框也可直接通过 style 覆写这些变量。 */
.my-input {
  --input-radius: 10px;
  --input-background: transparent;
  --input-border: 1.5px solid var(--border);
}
.my-slider { --slider-thumb-size: 22px; }
```

`my-ui.js` 按主题、DOM 基础、输入与选择、列表、浮层、菜单、滑块和触摸手势分节。修改公共行为只改这一个文件，Vue 与 HTML 同时生效。

明暗样式通过 `document.documentElement.dataset.theme = 'dark'` 切换，浅色使用 `'light'`。颜色、阴影、字重和背景模糊都可直接覆写 CSS 变量，组件 JS 不会应用配色或覆盖这些值。

展示页的 14 组主色、3 组层级风格、系统外观监听与主题编辑逻辑位于 `src/theme/index.js`，由 `src/demo/ThemeSettings.vue` 使用；它们不属于 `MyUI` 或 Vue 组件入口。用户只复制 `lib/` 和 `vue/` 时，不会带入这套示例配置。

## 本地展示与验证

```powershell
npm install
npm run dev
npm run build
```

开发地址默认 `http://127.0.0.1:5178/`，原生入口为 `/native.html`。CSS 保存后即时更新；修改 JS 核心会完整刷新示例，避免旧实例残留。构建结果同时提供 Vue 页面、原生页面和原样的 CSS/JS。

两个示例入口都禁用移动端页面缩放，并保留单指滚动。自己的页面需要相同策略时，在 `html` 添加 `my-no-zoom`，并沿用示例的 viewport 配置；仅引入组件不会自动限制宿主页面缩放。按钮统一禁用文本选中，输入与正文复制不受影响。

`tests/image.browser.html` 检查图片加载、缓存、懒加载、切换地址、失败重试、属性、插槽与销毁；`tests/native-core.browser.html` 覆盖原生与 Vue 的值同步、布局尺寸、SVG 显隐、明暗主题、插槽、焦点及弹层生命周期；`tests/input-affixes.browser.html` 检查输入框图标对齐、完整点击区域和显隐操作。其余浏览器回归保留原交互场景。纯函数测试继续使用 Node 内置测试器，按改动范围选择测试文件运行。

## 目录维护

项目目录名为 `my-ui`。Git 保留组件源码、示例、正式测试、原始设计参考和构建配置；依赖、构建结果、编辑器设置及本地工具配置均由 `.gitignore` 排除。

临时截图、验证脚本和发布用的仓库副本放在系统临时目录中，用完清理，不在项目内积累 `qa` 或嵌套 Git 仓库。`node_modules` 是可重新安装的本地依赖，`dist` 是构建产物，均不提交。
