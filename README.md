# my-ui

可以直接复制、本地修改的组件源码。原生 HTML 与 Vue 共用同一套样式、交互、定位与动画；不发布 npm 包。组件只提供 CSS 默认明暗样式，展示页的配色预设和主题编辑器独立于组件库。

```text
packages/
  core/                 @my-ui/core：原生组件，无框架依赖，无需编译
    my-ui.css           所有组件样式，按组件分节
    my-ui.js            所有 DOM 交互、定位与动画
    my-ui.d.ts          原生 API 类型
  vue/                  @my-ui/vue：Vue 3 薄封装与可选 Pinia 共享状态
    index.ts            51 个组件的公共入口
    adapter.ts          props、v-model、事件、插槽和生命周期适配
    components/         组件封装及类型，无组件样式
example/                @my-ui/example：展示与使用示例
  src/                  Vue 示例页面、演示业务和示例专用 theme/
  public/               示例静态资源
  index.html            Vue 入口
  native.html           不加载 Vue 的原生 HTML 示例
  card.html             直接引用公共 CSS/JS 的原生卡片示例
  vite.config.ts        示例的开发与构建配置
  src-tauri/            桌面应用壳，直接加载同一个示例
    src/                Rust 启动入口
    tauri.conf.json     窗口、开发地址与前端产物路径
    capabilities/       原生能力权限
    icons/              共用品牌图标的桌面版本
tests/                  正式测试与浏览器回归页面
scripts/                构建辅助脚本
reference/              原始设计参考
package.json            Bun workspace 与统一命令
bun.lock                唯一依赖锁文件
```

仓库只划分原生核心、Vue 封装、示例三个私有 workspace，由 Bun 统一安装与关联。示例通过 `@my-ui/vue` 直接使用本地源码，修改组件后实时更新；所有包均为 `private`，无需发布 npm。

## 普通 HTML

复制 `packages/core/my-ui.css` 与 `packages/core/my-ui.js`，直接引用。可离线运行，不需要 Vue、包管理器或构建工具。项目中的 `example/native.html` 是完整示例，`example/card.html` 单独展示交互卡片，两者与 Vue 示例共用核心，没有第二套按压逻辑。构建后 `dist/card.html` 引用旁边的 `lib/my-ui.css`、`lib/my-ui.js`，可以直接打开。

```html
<link rel="stylesheet" href="./my-ui.css">
<script src="./my-ui.js" defer></script>

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

复制 `packages/core/` 和 `packages/vue/` 到自己的 `my-ui/` 目录，保留 `core/`、`vue/` 的同级关系。Vue 只需使用已有的 Vue 3 依赖；入口自动引入公共 CSS 与原生 JS，无需再次添加 script。在本仓库的示例中，直接从 `@my-ui/vue` 导入。

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

公共组件：Icon、Avatar、Image、Badge、Button、Tag、TagGroup、Input、Textarea、Form、FormField、Radio、RadioGroup、Checkbox、CheckboxGroup、Choices、Switch、Select、Combobox、Segmented、Slider、Picker、DatePicker、TimePicker、Calendar、Upload、AppBar、Notice、Steps、Progress、Tabs、Navigation、Stepper、CellGroup、ListRow、Collapse、CollapseItem、Card、Tooltip、Divider、Loading、Skeleton、Empty、Floating、Menu、Popover、Dialog、Sheet、Drawer、Popup、Toast。

## 按压反馈与交互卡片

按压核心提供 `delayTouchDown`、`delayTouchUp`，单位毫秒，两个核心默认值均为 `0`。Button、交互型 Card、ListRow 按下默认立即响应（`delayTouchDown: 0`）。`delayTouchUp` 是从指针按下起算的最短反馈时间，组件默认 `100`：按下到抬起仅 20ms 时补足剩余 80ms，达到或超过 100ms 时抬起立即恢复；它只是轻触兜底，不是抬起后再等 100ms。鼠标、手写笔和键盘不使用触摸延迟，业务点击保持原时序。

手指在按下等待期间提前抬起，不会补播反馈；移动、滚动、取消、失焦、禁用或卸载都会立即撤销等待与保留状态。正常抬起后丢失隐式指针捕获，不会提前打断保留时间；再次按下会取消旧计时器。

```vue
<Card interactive title="清理存储" @activate="openStorage">
  <Icon name="inbox" />
  <h3>清理存储</h3>
  <p>36.8 GB / 128 GB</p>
</Card>
<ListRow title="应用管理" @click="openApps" />
<Button :delay-touch-up="0" @click="save">保存</Button>
```

Card 的 `interactive` 默认关闭；开启后整张卡片缩小并平滑改变背景色，按下与恢复均使用 `150ms ease-out`，支持 Enter 与空格。内部按钮、链接和输入控件独立操作。`--card-press-scale` 默认 `.96`，大卡片示例使用 `.985`；`--card-press-background` 可覆盖按压背景，未设置时自动根据 CSS 明暗配色混合。

原生接口使用同名属性：`MyUI.create('Card', { interactive: true, delayTouchDown: 0, delayTouchUp: 100 })`。声明式组件通过 `data-options` 配置；普通 `<button class="my-button" data-delay-touch-down="0" data-delay-touch-up="100">保存</button>` 也支持反馈配置。需要滚动观察窗口时可单独设置 `delayTouchDown: 50`。

## Upload 文件上传

```vue
<Upload v-model="files" multiple drag accept="image/*,.pdf" :max-count="3"
  :max-size="5 * 1024 * 1024" :request="upload" hint="图片或 PDF，每个最多 5 MB" />
```

`files` 是 `UploadFile[]`，使用唯一 `id` 与展示名称 `name`；记录可含原生 `file`、`size`（字节）、`type`（MIME）、已有图片 `url`。组件通过新数组同步值，不直接修改传入记录。状态为 `ready` / `uploading` / `success` / `error` / `canceled`，进度为 `percentage`（0—100），失败说明在 `error`，请求结果在 `response`。已有文件可不传 `file`，省略状态时视为成功；含原始文件时省略状态视为待上传。

没有 `request` 时只选择和管理文件，不会假装上传成功。传入 `request(file, { signal, onProgress })` 后默认自动上传：Promise 兑现表示成功、拒绝表示失败。应用自行决定服务器、请求方式与返回结果，支持用 Fetch、XHR 或已有上传服务实现；取消时组件中止 `signal`，请求函数应响应信号并清理资源。

```ts
import type { UploadRequest } from './my-ui/vue'
const upload: UploadRequest = async (file, { signal }) => {
  const body = new FormData()
  body.append('file', file)
  const response = await fetch('/api/files', { method: 'POST', body, signal })
  if (!response.ok) throw new Error('上传失败，请重试')
  return response.json()
}
```

`accept` 支持 `.pdf`、`image/png`、`image/*` 等逗号分隔规则；类型、单文件大小、重复文件、剩余数量均在加入前校验，一次选择可接收其中的合法文件，并通过 `reject` 返回其余文件的原因。默认单选且最多一个文件，启用 `multiple` 后默认不限数量，`maxCount` 可进一步限制。相同名称、大小和修改时间的原始文件视为重复；移除后可重新选择。

`autoUpload=false` 时用 ref 的 `submit()` 批量启动待上传、已取消或失败的文件；`retry(id)` 重试一个文件，`abort(id?)` 取消指定或全部进行中的上传，`remove(id)` 移除，`choose()` 打开文件窗口（须由用户操作触发），`addFiles(files)` 接受 FileList / File 数组。原生通过 `instance.exposed` 调用相同方法。`success` / `error` / `cancel` / `remove` 返回文件记录；`reject` 返回 `{ file, reason, message }[]`。

移除、外部删除或替换原始文件、卸载都会终止旧任务，忽略迟到的结果和进度；图片对象地址也同时释放。`disabled` 禁止用户操作，已开始的请求继续运行。改变 `request` 只影响后续请求。示例的上传服务仅模拟进度，不发送文件。

## AppBar / Notice / Steps

```vue
<AppBar title="我的收藏" subtitle="12 个灵感" back sticky @back="goBack">
  <template #actions><Button variant="bare" icon="search" aria-label="搜索" /></template>
</AppBar>
<Notice v-model="visible" type="warning" title="空间不足" message="清理一些文件后继续。" closable />
<Steps v-model="step" :options="[{ label: '填写资料' }, { label: '确认内容' }, { label: '完成' }]" />
```

AppBar 默认标题居中，会根据左右内容的实际宽度预留对称空间；`center=false` 改为左对齐，长标题省略。`leading` 插槽优先于默认返回按钮，默认插槽替换标题，`actions` 放右侧操作。`back` 只发送事件，不调用浏览器历史；`sticky` 在当前滚动容器顶部吸附。CSS 变量为 `--app-bar-height`（默认 60px）和 `--app-bar-top`。

Notice 的 `type` 为 `info` / `success` / `warning` / `error`，支持 `title`、`message`，默认插槽替换正文，`actions` 添加操作。`icon=false` 可隐藏图标，或传入内置图标名；`closable` 开启关闭按钮并同步布尔值，200ms 淡出收起，关闭时立即退出辅助树与键盘焦点。更新绑定值可重新展开，错误通知使用 alert，其余使用 status。CSS 变量 `--notice-radius` 默认 12px。

Steps 的 `options` 使用 `{ label, description?, icon?, disabled? }`，`value` / `v-model` 是从零开始的当前索引，等于总数表示全部完成；`status="error"` 将当前步骤标为失败，`vertical` 使用纵向布局。默认只展示进度；开启 `interactive` 后允许点击与方向键切换，Home / End 到首尾，跳过禁用项，整组只有一个 Tab 入口；`disabled` 禁止所有操作。CSS 变量 `--step-size` 默认 32px。

四个组件的原生入口同样为 `MyUI.create('Upload', props)`、`MyUI.mount('#host', 'Upload', props)` 或 `data-my`；Upload / Notice / Steps 的双向值使用 `value` 与 `onChange`，AppBar 的返回使用 `onBack`。完整原生写法见 `example/native.html`，Vue 示例分别在 `example/src/pages/home/upload/index.vue`、`example/src/pages/home/app-bar/index.vue`、`example/src/pages/home/notice-steps/index.vue`。

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

## Slider 刻度与拖动

`marks` 为 `true` 时按 `step` 绘制刻度，也可传入 `{ value, label? }` 数组；`step: null` 将可选值限定在这些刻度上。

拖动时圆块、光圈、提示位置和进度连续跟随指针，数值预览按相邻刻度的中点切换：低于 50% 选上一档，达到 50% 选下一档，松开后圆块吸附到当前档位。触屏按下不改值，只有有效抬起才提交绑定值和回调；纵向滚动、取消、失焦、多指或拖动期间的外部更新会撤销旧预览。鼠标与键盘继续实时更新。范围滑块采用相同规则，端点交叉后自动切换上下限，返回新的有序 `[最小值, 最大值]`，焦点跟随当前端点切换。

## Picker 滚轮选择

```vue
<Picker v-model="drink" :options="drinks" label="选择饮品" />
<Picker v-model="time" :columns="[hours, minutes]" :column-labels="['小时', '分钟']" />
<Picker v-model="area" :options="regions" :column-labels="['省份', '城市', '区县']" />
```

选项为 `{ value: string | number, label: string, disabled?: boolean, children?: PickerOption[] }`。`options` 提供单列或 `children` 级联，`columns` 提供独立多列并优先于 `options`。单列绑定单值，多列与级联绑定数组；父列改变后保留仍有效的子列值，否则选择首个可用项。空列用 `null` 占位，外部传入的失效值只做显示回退，不在初始化时触发更新。

拖动实时跟手，中间项改变时更新绑定值，松手后惯性滚动并吸附，越界时回弹。鼠标滚轮、上下方向键、Home/End、PageUp/PageDown 与文字前缀搜索均可选值，左右方向键切换列，Tab 正常进出。禁用项自动跳过；每列采用有名称的 Listbox 与 `aria-activedescendant`，键盘行为参考 [WAI Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)。系统减少动态效果时保留跟手，松手直接吸附。

原生用法为 `MyUI.mount('#picker', 'Picker', { value, options, onChange(value) {} })`，或使用 `data-my="Picker"`。Vue 可通过 ref 的 `focus()` 聚焦首个可用列。CSS 变量为 `--picker-item-height`（默认 44px）、`--picker-height`（默认 220px）和 `--picker-radius`；颜色沿用现有主题变量。

Picker 可直接嵌入页面，也可放入 Sheet。面板中使用一份临时值，确认后写回，取消时丢弃；示例见 `example/src/pages/home/picker/index.vue`。

## DatePicker / TimePicker / Calendar

```vue
<DatePicker v-model="date" min="2025-01-01" max="2030-12-31" />
<TimePicker v-model="time" min="09:00" max="18:30" :minute-step="15" />
<TimePicker v-model="preciseTime" show-seconds :second-step="5" />
<Calendar v-model="date" />
<Calendar v-model="dates" range :disabled-date="date => date.endsWith('-13')" />
```

日期只使用 `YYYY-MM-DD` 字符串，时间使用 `HH:mm`，`showSeconds` 后使用 `HH:mm:ss`。组件不解析 UTC 日期字符串，不会因时区改变选中的那一天。三个组件均支持 `label`、`disabled`、`min`、`max` 和 ref 的 `focus()`。

DatePicker 默认范围为 `1900-01-01`—`2100-12-31`。改变年月时保留仍有效的日期，否则修正到月底或边界，正确处理大小月与闰年。空值显示今天，失效值显示合法回退值，初始化和属性变化都不主动写回；用户操作才同步值。

TimePicker 默认全天可选，`minuteStep`、`secondStep` 默认为 1，接受 1—60 的整数；步长从零开始。上下限包含端点，但只有符合步长的时刻才可选；`min > max` 或时段内没有符合步长的时刻时显示空列。跨午夜时段应按两段业务规则处理。

两个选择器是内联滚轮，复用 Picker 的跟手、惯性、滚轮和键盘行为，也可放进 Sheet；示例使用草稿值，在确认后保存，取消保留原值。

Calendar 默认单日，`range` 模式用数组表示：未选 `[]`、只选开始日 `[开始]`、选完 `[开始, 结束]`，自动按日期排序，支持同日范围；完整范围后再次点击开始新范围。`disabledDate(date)` 返回 true 禁用日期，范围不能跨过禁用日期，跨越时从本次点击重新开始。`select` 在单日或完整范围选定后触发，`month-change` 在用户切换月份时返回 `YYYY-MM`；`month` 可设置展示月份，`firstDayOfWeek` 默认为 1（周一），0 表示周日。Calendar 的上下限默认覆盖公历 0001—9999 年。

Calendar 的日期网格只有一个 Tab 入口：左右、上下方向键移动 1 / 7 天，Home / End 到周首尾，Page Up / Down 到上 / 下月，Shift 加 Page Up / Down 切换年份，Enter / 空格选择。禁用日期可以被键盘浏览但不能选中，月份导航不改变选值；“今天”只跳转和聚焦。

```js
const calendar = MyUI.mount('#calendar', 'Calendar', {
  value: [], range: true, min: '2026-01-01', max: '2027-12-31',
  onChange(dates) { console.log(dates); },
  onSelect(dates) { console.log('范围已选定', dates); },
});
MyUI.mount('#date', 'DatePicker', { value: '2026-10-19' });
MyUI.mount('#time', 'TimePicker', { value: '09:30', minuteStep: 15 });
```

原生声明式入口同样支持 `data-my="Calendar"` / `DatePicker` / `TimePicker` 和 JSON `data-options`。DatePicker / TimePicker 沿用 Picker 的 CSS 变量；Calendar 提供 `--calendar-width`（默认 360px）和 `--calendar-day-size`（默认 36px），颜色只沿用 CSS 主题变量。示例见 `example/src/pages/home/date-time-picker/index.vue` 与 `example/native.html`。

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

组件类名统一为 `my-` 前缀，例如 `.my-button`、`.my-input-box`、`.my-list-row`。所有组件规则只在 `packages/core/my-ui.css` 中维护，组件内部选择器带有隔离标记，避免影响宿主页面。变量保留简短的语义名，按需覆盖即可。

```css
/* 单个输入框也可直接通过 style 覆写这些变量。 */
.my-input {
  --input-radius: 10px;
  --input-background: transparent;
  --input-border: 1.5px solid var(--border);
}
.my-slider { --slider-thumb-size: 22px; }
```

`my-ui.js` 按 DOM 基础、输入与选择、列表、浮层、菜单、滑块和触摸手势分节。修改公共行为只改这一个文件，Vue 与 HTML 同时生效。

明暗样式通过 `document.documentElement.dataset.theme = 'dark'` 切换，浅色使用 `'light'`。颜色、阴影、字重和背景模糊都可直接覆写 CSS 变量，组件 JS 不会应用配色或覆盖这些值。

展示页的 14 组主色、3 组层级风格、系统外观监听与主题编辑逻辑位于 `example/src/commons/theme/index.js`，由 `example/src/components/ThemeSettings.vue` 使用；它们不属于 `MyUI` 或 Vue 组件入口。用户只复制 `packages/core/` 和 `packages/vue/` 时，不会带入这套示例配置。

## Vue 全局共享状态

状态封装在 `packages/vue/state/`，独立入口为 `@my-ui/vue/state`，普通组件入口不依赖 Pinia。需要此功能时安装 `pinia`，在应用挂载前安装插件，再给需要同步的 store 添加 `shared: true`。页面仍然正常使用 `v-model`、actions、`$patch()` 和 `$reset()`。

```ts
import { createPinia, defineStore } from 'pinia'
import { createSharedStatePlugin } from '@my-ui/vue/state'

const pinia = createPinia().use(createSharedStatePlugin())
app.use(pinia)

export const usePreferences = defineStore('preferences', {
  state: () => ({ name: '小蓝', notifications: true }),
  shared: true,
})
```

普通网页默认保存到 `localStorage`，通过存储事件同步共享同一存储区的同源页面；同一页面内的多个 Pinia 实例也能收到通知。新页面先恢复缓存，页面重新获得焦点或返回前台时补齐遗漏的更新。默认值不会在新页面初始化时覆盖已有缓存；恢复期间发生的本地编辑优先保留。

只有部分字段需要共用时，使用 `shared: { pick: ['name'] }`；还可设置 `key` 自定义存储名称。字段需要是普通 JSON 数据，日期请转成字符串，函数、DOM、Map、循环引用等不进入缓存。未开启 `shared` 的 store 没有订阅或存储开销。

Tauri 应用安装官方 `@tauri-apps/plugin-store` 与同版本 Rust 插件，注册原生插件并给相关窗口添加 `store:default` 权限，再切换适配器：

```ts
import { createTauriStateStorage } from '@my-ui/vue/state/tauri'

const storage = createTauriStateStorage('settings.json')
const pinia = createPinia().use(createSharedStatePlugin({ storage }))
app.use(pinia)
```

多个 Activity 的 WebView 通过应用原生资源表复用同一个 Store，业务代码继续写 TS。状态变更立即进入原生存储并通知其他页面，文件写入默认合并 100ms；需要确认落盘或打开新 Activity 前可 `await store.$shared?.flush()`。`store.$shared?.ready` 等待首次恢复，`refresh()` 重新读取缓存，`error` 提供可响应的错误信息；失败会保留内存编辑，`flush()` 可以重试。配置 `onError(error, storeId)` 可统一展示或记录异常。

非 Pinia 代码也能通过同一适配器修改缓存并通知页面：

```ts
import { sharedStateKey } from '@my-ui/vue/state'

await storage.setItem(sharedStateKey('preferences', 'name'), JSON.stringify('新的昵称'))
await storage.flush?.()
```

通过适配器删除字段会恢复其初始值。直接调用浏览器原始 `localStorage.setItem()` 只通知其他页面，本页需要 `refresh()`；直接编辑 Tauri 的磁盘 JSON 文件需要额外文件监听并重新加载。存储键可用插件配置的 `prefix` 隔离，调用 `sharedStateKey()` 时传入相同前缀。

同步以顶层字段为单位，修改不同字段互不覆盖；嵌套对象或数组整体替换。同一字段同时写入时以存储中最后成功写入的值为准，不提供跨页面事务或原子递增。Pinia 与存储之间的同步是异步的，页面销毁会释放订阅与前台监听。

## 本地展示与验证

首页的“完整交互示例”入口打开 `#/showcase`，按需加载整页展示。`example/src/components/ShowcaseLayout.vue` 保留头图、分类导航和连续布局，通过 `example/src/pages/home/index.ts` 与 `example/src/pages/native/index.ts` 的文档注册表复用独立示例；返回目录保留滚动与入口焦点，离开整页时暂停播放和模拟上传。目录在桌面与手机上统一使用移动端单列布局。

```powershell
bun install
bun run dev
bun run build
```

开发地址默认 `http://127.0.0.1:5178/`，纯 HTML 入口为 `/native.html`。示例采用顶部导航与“首页、原生、消息、我的”四个底部 Tab。首页按用途展示普通组件；“原生”集中展示 App、AppBar、Tabbar、Tabs、Page 下拉刷新和原生页面与共享状态；消息保留 Demo 占位页，我的展示个人中心。Web 和桌面 App 使用 Vue Router 在当前窗口导航，Android 的每个列表入口创建独立 Activity。返回保留所属目录的滚动与入口焦点，底部同级切换不增加返回历史，旧 `#/discover` 链接进入原生目录。

`example/src/router.ts` 定义 Vue Router，`example/src/App.vue` 提供统一弹层和提示宿主，`example/src/pages/native/app/Root.vue` 使用 KeepAlive 保留页面；`example/src/components/DemoLayout.vue` 负责应用容器和栏目导航。`example/src/pages/catalog.ts` 维护目录数据，各文档按目录标识放在 `pages/home/` 或 `pages/native/` 下，通过文档注册表加载；四个栏目的内容也分别位于对应页面目录。公共逻辑集中在 `example/src/commons/`，其中 `navigation.ts` 接入 `tauri-plugin-native-components/router`，`notify.ts` 提供页面共用的提示入口；组件库不依赖 Tauri。Android 子页地址为 `index.html?pageWindow=1#/example/组件标识`；旧的 `#combobox`、`#slider-options` 等链接仍可直接定位。原生 Activity 与共享状态示例位于“原生”目录的“页面与共享”分组。CSS 保存后即时更新；修改 JS 核心会完整刷新示例，避免旧实例残留。构建结果同时提供 Vue 页面、原生页面和原样的 CSS/JS。

主题偏好由 `example/src/commons/state/theme.ts` 的共享 Pinia store 管理，明暗模式、配色和字重均跨窗口持久化同步；任意窗口修改后，其他窗口与新窗口都会应用。旧的 `my-ui:theme` 设置继续作为迁移来源和首帧快照。`example/src/commons/native-appearance.ts` 同步实际明暗主题到 Android 系统栏文字/图标及桌面窗口装饰，主页面和子页面使用相同逻辑。纯 HTML 在 App 内通过独立的 `native-theme.js` 接入同一存储，不加载 Vue；普通离线 HTML 仍只依赖组件 CSS/JS。

页面头部的普通脚本 `public/theme-init.js` 在样式和主模块加载前恢复模式与已解析的主题变量；新原生窗口同时继承父页的背景和实际模式。Android 的 Activity、WebView 和网页使用一致的加载背景，避免新页先亮后暗。

Android 同步应用级夜间配置；选择“跟随系统”时解除应用覆盖，页面通过系统媒体查询更新明暗主题，系统栏同步实际配色。Activity 已声明处理 `uiMode`，切换时保留当前页面和状态。系统返回动画沿用平台默认行为。

Android 的预测性返回会先让上页进入 `onStart` 并可见，手势提交后才调用 `onResume`。如果 WebView 一直等到 `onResume` 才解除暂停，静置后的侧滑预览可能只显示背景；普通原生 Activity + WebView 在本机也能复现。插件的 `NativeWindow` 在 `onStart` 恢复 WebView，在 `onStop` 暂停；宿主 `AppActivity` 只转发回调，补齐取消返回时可能出现的 `Start → Stop` 路径；Wry 原有的 `onPause/onResume` 调用继续保留。不使用截图覆盖、定时刷新或页面重载。

该时序已通过 OPPO PLJ110（Android 17 / System WebView 151.0.7922.199）的原生对照验证，不代表所有厂商和 WebView 版本均已验证。后台绘制资源的具体回收阈值尚未确认，不能将约 20 秒视为平台保证。此前的 `BackPreview` 截图方案已移除，避免截图遮挡实时页面。[Android 生命周期说明](https://developer.android.com/guide/components/activities/activity-lifecycle)；[相似问题报告（不是本项目根因的证明）](https://github.com/react-native-webview/react-native-webview/issues/3427)。

`tests/demo-layout.browser.html` 使用真实示例入口检查全部目录跳转、详情返回与前进、滚动和输入保留、旧链接、弹层返回、键盘、320px 窄屏与桌面布局。

`bun run check` 检查 Vue 封装、示例和原生 JavaScript 核心；`bun run check:core` 可单独检查核心。核心通过 JSDoc 和 `checkJs` 检查，仍然可以直接复制使用，无需编译。`bun run preview` 在 4178 端口预览 `dist/`。构建后的 `dist/native.html` 与 `dist/lib/` 可直接离线使用，`dist/lib/` 同时保留原生类型声明。

浏览器回归使用 Node.js、Playwright 和本机 Chrome，自动启动并关闭独立测试服务，必须指定模块，不默认运行全量：

```powershell
bun run test:state
bun run test:browser update-efficiency native-core identity-combobox floating
bun run test:browser menu-cascade --viewport=390x844
bun run test:browser demo-layout
```

需要其他浏览器时设置 `BROWSER_EXECUTABLE_PATH`，或先执行 `bunx playwright install chromium` 后设置 `$env:BROWSER_CHANNEL = 'chromium'`。`--reduced-motion` 可检查减少动态效果的环境。失败会返回非零退出码和具体断言；`update-efficiency` 覆盖事件隔离、局部更新、监听复用与浮层失效条件，共享状态测试同时检查批量编码和迟到读取竞态。

## PC 桌面应用

桌面示例使用 Tauri 2，原生工程放在 `example/src-tauri/`，继续属于现有示例 workspace。前端由 `example/src/main.ts` 启动 `example/src/App.vue`，再通过路由加载 `example/src/pages/`，共用 `@my-ui/vue`、原生 CSS/JS 和示例主题。

```powershell
bun install
bun run dev:desktop
```

这条命令复用或启动当前项目的 Vite 示例并打开桌面窗口，组件与示例修改继续热更新。已经运行 `bun run dev` 时也可直接启动，复用的服务继续由原会话管理。

```powershell
bun run build:desktop
```

构建时先在仓库根目录执行现有类型检查与 Web 构建，再把 `dist/` 嵌入桌面应用；Windows 可执行文件为 `example/src-tauri/target/release/my-ui-example.exe`，运行时无需开发服务器。此命令生成直接运行的程序；需要安装包时可在示例目录执行 `bun run tauri build`。

桌面配置保留系统标题栏，窗口可调整大小，默认 1280×860，最小 760×560，工作区不足时自动限制初始大小以适配系统缩放。关闭 Tauri 的原生文件拖放接管，让已有 Upload 的 HTML 拖放继续工作。Rust 编译产物与自动生成的权限类型已排除 Git，`Cargo.lock` 与 `bun.lock` 提交以固定依赖。

本机开发需要 Rust 与对应系统的编译环境，Windows 使用 MSVC 和 WebView2；详见 [Tauri 官方环境要求](https://v2.tauri.app/start/prerequisites/)。

## Android 真机

Android 端复用同一个 Tauri 2 壳与同一份 Vue 示例，原生工程由 `tauri android init` 生成在 `example/src-tauri/gen/android/`。前端打包后嵌入 APK，安装后不依赖开发服务器，拔掉数据线也能离线打开。

前置环境：Rust 的 `aarch64-linux-android` target、JDK 17、Android SDK（platform 与 build-tools）与 NDK，`ANDROID_HOME` 或 `ANDROID_SDK_ROOT` 指向本机 SDK。手机开启开发者选项与 USB 调试（OPPO/小米/vivo 等还需允许「USB 安装」），`adb devices` 能看到 `device` 状态即可。

```powershell
bun run dev:android      # 自动复用或启动 Vite，通过 USB 编译、安装并启动手机应用
```

开发命令默认连接 `127.0.0.1:5178`，由 Tauri 自动设置 USB 端口转发，无需手动运行 `adb reverse`。已运行的服务必须确认属于当前项目才会复用；启动失败不会关闭已有服务。未设置 `NDK_HOME` 时自动选择 SDK 中最新的稳定 NDK，显式设置时保留原值；额外设备参数与 `--host` 仍可传入。

开发 APK 组装成功后、实际安装前会结束目标手机上的旧示例进程，避免系统在更新时恢复旧首页、开发工具又同时启动首页。独立 APK 使用下方 `install:android` 执行同样的处理；构建 APK 不操作设备。多设备时请用 `ANDROID_SERIAL` 明确目标，脚本不会猜测或关闭另一台设备的应用。

构建 APK 前需显式指定本机 NDK：

```powershell
$env:NDK_HOME='D:\app\AndroidStudio\Android\SDK\ndk\28.2.13676358'
bun run build:android    # 构建自包含 arm64 优化 APK
bun run install:android ./example/src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk
```

`build:android` 实际执行 `tauri android build --apk --target aarch64`，产物为 `example/src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk`。`install:android` 在安装前关闭目标应用，覆盖安装并保留应用数据，成功后只通过桌面入口启动一次；追加 `--no-launch` 可只安装。直接覆盖运行中的 APK 后立即手动启动，会与这台手机的系统更新自动恢复发生竞争，导致首页被重建、应用退出。本地示例的 release 构建使用调试证书，便于和开发包相互覆盖安装；正式分发需要配置自己的签名。调试原生桥接时，可在 `example/` 下执行 `bun run tauri android build --apk --debug --target aarch64`。

`node tests/android-install.device.mjs <debug-apk>` 实际覆盖安装前台、后台和子页中的应用，每次只启动一次，持续检查首次启动进程、首页和底栏，并保留日志与截图。不能用重新打开应用后的成功结果替代安装首启验证。

**系统字重插件**：`tauri-plugin-android-system-font-weight` 源码已独立到 `D:/project/tauri/plugins/tauri-plugin-android-system-font-weight/`，由 `example/package.json` 的本地 `file:` 依赖安装，Cargo 引用 `example/node_modules/tauri-plugin-android-system-font-weight` 中的同一份源码。尚未创建或发布 GitHub 仓库；将来可将 package.json 中的来源替换为实际 `github:OWNER/REPOSITORY#COMMIT`，Cargo 路径保持不变。插件自己的说明包含接入方式。

插件移植自 `android_system_font_weight`，此次迁移保持采集和探针算法不变。Rust 只注册桥接，Kotlin 在后台线程采集、解析，前端启动只调用一次 `getWght`，`getRawData` 留作诊断。OPPO 系采用通过校验的探针，其他厂商的支持边界与原插件相同，不把 `fontWeightAdjustment` 或厂商滑杆编码当作绝对字重。

`example/src/commons/font-weight.ts` 管理缓存及系统跟随：启动与返回前台时自动同步，只有实际修改滑块数值才进入手动模式，点「恢复字重」重新采集。异步结果不会覆盖较新的手动设置；读取失败保留当前值，不伪装成成功读取到 400。主题设置统一应用 `settings.fontWeight`，正文、操作文字、次标题和标题保留原有层级。Tauri 权限使用 `[default]` 集合，仅向 Android 首页与原生示例子页授权；编译缓存、Tauri API 副本与自动生成的权限文件均不提交。

**移动端适配**（只写在示例层，组件库保持中立）：`example/src/mobile.ts` 按 UA 加 `my-mobile-native` 类并拦截长按选中与系统 callout（输入框、可复制文本除外）；`mobile.css` 处理 edge-to-edge 下的状态栏与手势条安全区；viewport 使用 `viewport-fit=cover`。字重统一走主题系统的 `settings.fontWeight`，不另设一套变量。

**统一页面跳转**：导航已并入 `D:/project/tauri/plugins/tauri-plugin-native-components/`，前端通过 `tauri-plugin-native-components/router` 使用，Rust 只注册一个 `native-components` 插件。Bun 通过本地 `file:` 依赖安装，Cargo 引用 `example/node_modules/tauri-plugin-native-components`；将来可换成实际 GitHub 来源，目前没有发布。Web、桌面端使用传入的 Vue Router，Android `push` 创建宿主的 `NativePageActivity`；暂不实现 iOS 原生导航。

```ts
import { navigation } from './navigation'

await navigation.push('/example/button', { title: 'Button 按钮' })
await navigation.replace('/home') // 在当前容器替换路由，不增加返回记录。
await navigation.back('/home')
```

`navigation.ts` 保留示例内部的 `openPage`、`closePage` 薄包装，默认回退到 `/home`。共享状态页使用 `/shared-state`，纯 HTML 示例在 `/html` 中承载并保留返回入口，离线的 `native.html` 依旧能单独打开。插件合并同一目标进行中的原生创建请求，失败可重试；仅接受应用内地址。Android 导航要求 API 32 以上，命令为 `plugin:native-components|push`、`plugin:native-components|back`，仅向 Android 的 `main` 与 `native-page-*` 授权，首页不能被返回命令误关。

Android 首页使用 `singleTop`，子页保持 `standard`。此前首页的 `singleTask` 会在点击桌面图标重新进入时销毁其上方子页，导致回到首页；现已通过真机的“进入子页 → Home → 启动器重新打开 → 返回”检查，恢复时保留同一个子 Activity 实例。系统栏、弹层返回与既有 WebView 生命周期处理统一由插件的 `NativeWindow` 管理。宿主 `AppActivity.kt` 仅转发生成的 TauriActivity 回调；`NativePageActivity.kt` 只声明子页 WebView 的所有权。

页面圆角和转场使用 Android 系统默认行为。插件不再读取设备圆角裁剪 DecorView，也不为圆角修改窗口像素格式。

**跨页共享状态**：「原生 → 原生页面与共享状态」可以修改备注和计数，再打开另一页。两页通过 Pinia 共享插件同步，「从本地更新」演示绕过 Pinia 修改存储后通知页面。重新打开或重启应用会恢复已保存的数据。每个原生子页都有独立的 WebView、Vue 实例和普通局部状态，只有显式共享的数据跨页同步。

返回命令通过当前子页的 JNI 句柄调用 `Activity.finish()`，不依赖 Android 上不会结束 Activity 的窗口 `close()`；系统返回继续使用原生返回栈，销毁时显式释放子页 WebView。两个 WebView 的 TS 模块、Vue 状态和全局变量仍各有一份，跨页数据通过共享存储同步；本次打开时间和滚动位置各自保留。

## 浏览器回归

浏览器回归使用 `bun run dev:test`，在 `http://127.0.0.1:5179/tests/文件名.browser.html` 打开对应页面。测试服务以仓库为根目录，示例服务以 `example/` 为根目录，互不混入构建产物。纯函数测试通过 `bun test ./tests/文件名.test.mjs` 按模块运行。

两个示例入口都禁用移动端页面缩放，并保留单指滚动。自己的页面需要相同策略时，在 `html` 添加 `my-no-zoom`，并沿用示例的 viewport 配置；仅引入组件不会自动限制宿主页面缩放。按钮统一禁用文本选中，输入与正文复制不受影响。

`tests/date-time.browser.html` 检查日期时间联动、跟手、日历范围、禁用日期、键盘、面板草稿、原生与 Vue 同步、样式和卸载；`tests/date-time.test.mjs` 检查闰年、边界、时分秒步长、网格与范围规则。

`tests/picker.browser.html` 检查滚轮跟手、惯性、级联、键盘、禁用态、面板草稿和卸载；`tests/picker-value.test.mjs` 检查多列选值与吸附规则。`tests/image.browser.html` 检查图片加载、缓存、懒加载、切换地址、失败重试、属性、插槽与销毁；`tests/native-core.browser.html` 覆盖原生与 Vue 的值同步、布局尺寸、SVG 显隐、明暗主题、插槽、焦点及弹层生命周期；`tests/input-affixes.browser.html` 检查输入框图标对齐、完整点击区域和显隐操作。其余浏览器回归保留原交互场景。纯函数测试使用 Bun 运行，按改动范围选择测试文件运行。

`tests/upload-structure.browser.html` 定向检查上传状态与取消、移除、重试、对象地址释放、原生与 Vue 同步、顶栏居中、通知焦点和过渡、步骤键盘与语义。`tests/upload-structure.test.mjs` 检查文件校验与步骤状态；级联菜单标题图标的连续显示由 `tests/menu-cascade.browser.html` 的触屏标题用例覆盖。

`bun test ./tests/shared-state.test.ts ./tests/shared-state-tauri.test.ts` 使用真实 Pinia 与官方 Tauri JS 绑定检查恢复、双向同步、异步竞态、不同字段并发、失败重试和销毁；`tests/shared-state.browser.html` 使用两个独立文档检查实际输入与按钮、浏览器存储事件、刷新恢复和后台补同步。测试只清理自己随机生成的存储键。

Android 示例的系统返回优先交给当前 WebView 的最上层弹层：级联菜单逐级返回，退出动画期间继续拦截，全部关闭后恢复原生 Activity 返回。可在原生子页的“弹层优先返回”卡片体验菜单、嵌套确认与抽屉；首页的所有弹层同样生效。输入法可见时保持系统先收起键盘的行为。

这个壳使用原生 Activity 栈导航，首页没有弹层时不接管系统返回，子页也由系统处理返回与预测动画。`gen/android/native-back.gradle.kts` 只在本工程编译输入中移除 Tauri 2.12.4 `AppPlugin` 的常驻网页返回回调，不修改 Cargo 缓存；窗口外观与退出命令保持完整。升级 Tauri 后如果原实现改变，构建会要求重新核对补丁。不要在本壳使用 `onBackButtonPress` 另行注册全局网页返回处理。

保持手机解锁、竖屏与手势导航，运行 `dev:android` 后可执行 `node tests/android-back.device.mjs --record`，定向检查首页回桌面、取消手势、弹层关闭及释放、子页返回；截图与可选录屏保存在系统临时目录。回归会重启当前示例，不清除应用数据。

宿主可通过 `MyUI.layers.dismissTop()` 请求返回，通过 `MyUI.layers.subscribe(active => {})` 立即订阅是否存在弹层并取得取消订阅方法。接口不依赖 Tauri；安卓桥接只放在 example 中。禁用 `closeOnEscape` 的弹窗也会消费系统返回，等待业务操作关闭；滑块常驻数值提示不占用返回。

`bun test ./tests/overlay-back.test.ts ./tests/navigation.test.ts` 检查原生桥接、跨平台导航、连续点击、错误重试与网页回退；`cargo test --lib navigation::tests` 检查原生目标地址和窗口边界。`tests/navigation.browser.html` 使用真实 Vue 页面和模拟宿主命令检查跳转接入，`tests/demo-layout.browser.html` 检查普通网页导航，`tests/overlay-back.browser.html` 检查真实弹层交互；浏览器模拟宿主不代替原生设备验证。

`bun test ./tests/theme-state.test.ts ./tests/theme-startup.test.mjs ./tests/theme.test.mjs` 检查主题跨实例同步、持久化、旧配置、模块加载前的主题恢复与原生外观桥接；`tests/theme-sync.browser.html` 使用多个真实示例页面检查主题切换与新页面继承。

## 目录维护

项目目录名为 `my-ui`。Git 保留组件源码、示例、正式测试、原始设计参考和构建配置；依赖、构建结果、编辑器设置及本地工具配置均由 `.gitignore` 排除。

临时截图、验证脚本和发布用的仓库副本放在系统临时目录中，用完清理，不在项目内积累 `qa` 或嵌套 Git 仓库。`node_modules` 是可重新安装的本地依赖，`dist` 是构建产物，均不提交。

### 原生导航组件

独立源码位于 `D:/project/tauri/plugins/tauri-plugin-native-components/`，目录、前端包和 Rust crate 均使用 `tauri-plugin-` 前缀，命令及权限仍使用短标识 `native-components`。示例通过 Bun 本地依赖安装完整源码，尚未创建或发布 GitHub 仓库。

从 `tauri-plugin-native-components/vue` 引入 `AppBar`、`BottomNavigation`、`Tabs`，同时引入 `tauri-plugin-native-components/style.css`。组件按职责命名，通过 Vue 属性、事件和插槽封装平台能力。Android 使用 MaterialToolbar 和 BottomNavigationView，保留官方水波纹；Web 和其他桌面/移动平台显示 Vue 对应内容。CSS 提供尺寸和颜色，插件不生成示例主题。

`Tabs` 同时管理底栏和各 Tab 的原生页面，`nativeView` 指向宿主注册的 Android 页面工厂。首页和原生目录使用当前 Tauri WebView，消息使用 `DemoNativeTab.kt`，我的使用 `NativeProfileTab.kt` 中的 Android 个人中心；原生目录里的 Tabs 示例同样展示原生页面切换与计数保留。组件详情页由同一个插件新建 Activity，各 Tab 不额外打开 Activity 或 WebView。Web/桌面的对应内容保留在 Vue 插槽中，三个独立组件示例按路由名称缓存，互不混用状态。

「我的 → 个人资料」通过普通 Android Intent 打开 `NativeProfileActivity`：使用 AppCompatActivity、MaterialToolbar、原生输入框与开关，页面完全由 Android View 绘制，不创建 Tauri 窗口或 WebView。保存昵称、签名与展示偏好后，个人中心通过 SharedPreferences 监听立即更新；系统返回取消未提交内容，输入草稿在 Activity 重建后保留。页面继承来源主题并处理系统栏、输入法安全区，返回交给系统，不注册常驻拦截。Web/桌面展示个人中心预览，并说明资料编辑需要在 Android 应用内体验。

原生资料页的定向设备测试为 `:app:connectedArm64DebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=dev.myui.example.NativeProfileActivityTest`，覆盖真实输入、空昵称校验、保存、开关、重建和取消，运行结束恢复原有资料。

`DemoAppBar.vue` 将结构化标题、返回和主题操作接入原生导航头。放在 Page 的 navbar 插槽时，Android 使用原生页面壳管理导航，Web 弹层出现时保留同一导航实例；正文与弹层始终留在原 WebView 中。原生组件绑定发起调用的窗口，不借用 Tauri 的全局 Activity。

`Page` 提供 navbar、navigation 和默认正文插槽。Android 将 AppBar、原 WebView、BottomNavigation 按上中下分配真实空间，Web 弹层自然限制在中间视口；其他平台及原生失败时使用 Web 模拟。Android 的网页模态遮罩只禁用正文背景，顶部操作、返回按钮和底部导航继续可交互，并保留原生导航实例。安全区和输入法由原生宿主处理，键盘出现时隐藏底栏。

使用 `refreshable`、`v-model:refreshing`、`@refresh` 启用下拉刷新，业务在请求结束后将 refreshing 设为 false。Android 使用原生 SwipeRefreshLayout；Web 和原生接入失败时使用 Web 刷新。`suspended` 只暂停内容区原生控件和刷新，不卸载页面导航。

「原生 → Page 页面与下拉刷新」打开独立的 `#/page-refresh` 动态列表：Android 支持同一次拖动滚到顶部后继续拉出刷新器，向上推回刷新器后继续滚正文，松手超过阈值才刷新。也支持导航栏刷新按钮、刷新完成后更新列表，以及弹窗期间暂停刷新。`Page` 的 `refresh()`、`scrollTo(options)`、`scrollElement` 可用于业务操作；返回原生目录后保留浏览位置。当前默认插槽承载 Web 内容，自有滚动容器和 iframe 不自动接管。目录与返回行为的定向检查为 `bun run test:browser native-catalog demo-layout navigation`。

安装 Android 调试包后，`node tests/android-refresh.device.mjs [--record]` 定向检查连续到顶、回推接力、反向拖动、多次交接及弹窗恢复后的快速拖动。手机需保持解锁、竖屏；回归只重启示例，不清除应用数据，截图、触摸记录和可选录屏保存在系统临时目录。

Android 子页立即开始系统转场，只暂隐尚在交接的 WebView 正文。等 Page 的原生导航接管、网页导航隐藏、视口更新与 WebView 绘制确认后显示稳定正文；原生 HTML 页还会等待 iframe 加载。`node tests/android-page-entry.device.mjs [--record]` 检查普通页、复杂页、重复进入及 iframe，并故意延迟原生确认，验证正文准备不阻塞入场、不会暴露重复导航，返回和切换 Tab 后保留底栏。测试只重启示例，报告和可选录屏写入系统临时目录。
