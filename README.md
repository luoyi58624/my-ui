# my-ui

可以直接复制、本地修改的组件源码。原生 HTML 与 Vue 共用同一套样式、交互、定位与动画；不发布 npm 包。组件只提供 CSS 默认明暗样式，展示页的配色预设和主题编辑器独立于组件库。

```text
packages/
  core/                 @my-ui/core：原生组件，无框架依赖，无需编译
    my-ui.css           所有组件样式，按组件分节
    my-ui.js            所有 DOM 交互、定位与动画
    my-ui.d.ts          原生 API 类型
  vue/                  @my-ui/vue：Vue 3 薄封装
    index.ts            51 个组件的公共入口
    adapter.ts          props、v-model、事件、插槽和生命周期适配
    components/         组件封装及类型，无组件样式
example/                @my-ui/example：展示与使用示例
  src/                  Vue 示例页面、演示业务和示例专用 theme/
  public/               示例静态资源
  index.html            Vue 入口
  native.html           不加载 Vue 的原生 HTML 示例
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

复制 `packages/core/my-ui.css` 与 `packages/core/my-ui.js`，直接引用。可离线运行，不需要 Vue、包管理器或构建工具。项目中的 `example/native.html` 就是完整示例。

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

四个组件的原生入口同样为 `MyUI.create('Upload', props)`、`MyUI.mount('#host', 'Upload', props)` 或 `data-my`；Upload / Notice / Steps 的双向值使用 `value` 与 `onChange`，AppBar 的返回使用 `onBack`。完整原生写法见 `example/native.html`，Vue 示例在 `example/src/demo/UploadShowcase.vue`、`AppBarShowcase.vue`、`NoticeStepsShowcase.vue`。

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

拖动时圆块、光圈、提示位置和进度连续跟随指针，绑定值实时按相邻刻度的中点切换：低于 50% 选上一档，达到 50% 选下一档，松开后圆块吸附到当前档位。范围滑块采用相同规则，端点交叉后自动切换上下限，返回新的有序 `[最小值, 最大值]`；键盘仍按步长或指定刻度移动，交叉时焦点跟随当前端点切换。

## Picker 滚轮选择

```vue
<Picker v-model="drink" :options="drinks" label="选择饮品" />
<Picker v-model="time" :columns="[hours, minutes]" :column-labels="['小时', '分钟']" />
<Picker v-model="area" :options="regions" :column-labels="['省份', '城市', '区县']" />
```

选项为 `{ value: string | number, label: string, disabled?: boolean, children?: PickerOption[] }`。`options` 提供单列或 `children` 级联，`columns` 提供独立多列并优先于 `options`。单列绑定单值，多列与级联绑定数组；父列改变后保留仍有效的子列值，否则选择首个可用项。空列用 `null` 占位，外部传入的失效值只做显示回退，不在初始化时触发更新。

拖动实时跟手，中间项改变时更新绑定值，松手后惯性滚动并吸附，越界时回弹。鼠标滚轮、上下方向键、Home/End、PageUp/PageDown 与文字前缀搜索均可选值，左右方向键切换列，Tab 正常进出。禁用项自动跳过；每列采用有名称的 Listbox 与 `aria-activedescendant`，键盘行为参考 [WAI Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)。系统减少动态效果时保留跟手，松手直接吸附。

原生用法为 `MyUI.mount('#picker', 'Picker', { value, options, onChange(value) {} })`，或使用 `data-my="Picker"`。Vue 可通过 ref 的 `focus()` 聚焦首个可用列。CSS 变量为 `--picker-item-height`（默认 44px）、`--picker-height`（默认 220px）和 `--picker-radius`；颜色沿用现有主题变量。

Picker 可直接嵌入页面，也可放入 Sheet。面板中使用一份临时值，确认后写回，取消时丢弃；示例见 `example/src/demo/PickerShowcase.vue`。

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

原生声明式入口同样支持 `data-my="Calendar"` / `DatePicker` / `TimePicker` 和 JSON `data-options`。DatePicker / TimePicker 沿用 Picker 的 CSS 变量；Calendar 提供 `--calendar-width`（默认 360px）和 `--calendar-day-size`（默认 36px），颜色只沿用 CSS 主题变量。示例见 `example/src/demo/DateTimeShowcase.vue` 与 `example/native.html`。

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

展示页的 14 组主色、3 组层级风格、系统外观监听与主题编辑逻辑位于 `example/src/theme/index.js`，由 `example/src/demo/ThemeSettings.vue` 使用；它们不属于 `MyUI` 或 Vue 组件入口。用户只复制 `packages/core/` 和 `packages/vue/` 时，不会带入这套示例配置。

## 本地展示与验证

```powershell
bun install
bun run dev
bun run build
```

开发地址默认 `http://127.0.0.1:5178/`，原生入口为 `/native.html`。CSS 保存后即时更新；修改 JS 核心会完整刷新示例，避免旧实例残留。构建结果同时提供 Vue 页面、原生页面和原样的 CSS/JS。

`bun run check` 检查 Vue 封装和示例类型；`bun run preview` 在 4178 端口预览 `dist/`。构建后的 `dist/native.html` 与 `dist/lib/` 可直接离线使用，`dist/lib/` 同时保留原生类型声明。

## PC 桌面应用

桌面示例使用 Tauri 2，原生工程放在 `example/src-tauri/`，继续属于现有示例 workspace。前端仍是 `example/src/main.ts` → `App.vue` → `demo/`，共用 `@my-ui/vue`、原生 CSS/JS 和示例主题。

```powershell
bun install
bun run dev:desktop
```

这条命令自动启动现有 Vite 示例并打开桌面窗口，组件与示例修改继续热更新。5178 端口由它管理，运行前先结束单独启动的 `bun run dev`。

```powershell
bun run build:desktop
```

构建时先在仓库根目录执行现有类型检查与 Web 构建，再把 `dist/` 嵌入桌面应用；Windows 可执行文件为 `example/src-tauri/target/release/my-ui-example.exe`，运行时无需开发服务器。此命令生成直接运行的程序；需要安装包时可在示例目录执行 `bun run tauri build`。

桌面配置保留系统标题栏，窗口可调整大小，默认 1280×860，最小 760×560，工作区不足时自动限制初始大小以适配系统缩放。关闭 Tauri 的原生文件拖放接管，让已有 Upload 的 HTML 拖放继续工作。Rust 编译产物与自动生成的权限类型已排除 Git，`Cargo.lock` 与 `bun.lock` 提交以固定依赖。

本机开发需要 Rust 与对应系统的编译环境，Windows 使用 MSVC 和 WebView2；详见 [Tauri 官方环境要求](https://v2.tauri.app/start/prerequisites/)。

## Android 真机

Android 端复用同一个 Tauri 2 壳与同一份 Vue 示例，原生工程由 `tauri android init` 生成在 `example/src-tauri/gen/android/`。前端打包后嵌入 APK，安装后不依赖开发服务器，拔掉数据线也能离线打开。

前置环境：Rust 的 `aarch64-linux-android` target、JDK 17、Android SDK（platform 与 build-tools）与 NDK，构建前指定 `NDK_HOME` 指向本机 NDK 目录。手机开启开发者选项与 USB 调试（OPPO/小米/vivo 等还需允许「USB 安装」），`adb devices` 能看到 `device` 状态即可。

```powershell
$env:NDK_HOME='D:\app\AndroidStudio\Android\SDK\ndk\28.2.13676358'
bun run dev:android      # 真机热更开发：自动起 Vite、交叉编译、adb reverse 并安装启动
bun run build:android    # 构建自包含 arm64 优化 APK
```

`build:android` 实际执行 `tauri android build --apk --target aarch64`，产物为 `example/src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk`，用 `adb install -r <apk>` 安装。本地示例的 release 构建使用调试证书，便于和开发包相互覆盖安装；正式分发需要配置自己的签名。调试原生桥接时，可在 `example/` 下执行 `bun run tauri android build --apk --debug --target aarch64`。

**系统字重插件**：`example/src-tauri/plugins/tauri-plugin-system-font-weight/` 移植自 `android_system_font_weight`，采集和探针算法保持一致。Rust 只注册桥接，Kotlin 在后台线程采集、解析，前端启动只调用一次 `getWght`，`getRawData` 留作诊断。OPPO 系采用通过校验的探针，其他厂商的支持边界与原插件相同，不把 `fontWeightAdjustment` 或厂商滑杆编码当作绝对字重。

`example/src/font-weight.ts` 管理缓存及系统跟随：启动与返回前台时自动同步，只有实际修改滑块数值才进入手动模式，点「恢复字重」重新采集。异步结果不会覆盖较新的手动设置；读取失败保留当前值，不伪装成成功读取到 400。主题设置统一应用 `settings.fontWeight`，正文、操作文字、次标题和标题保留原有层级。Tauri 权限使用 `[default]` 集合，仅向 Android 首页与原生示例子页授权；编译缓存、Tauri API 副本与自动生成的权限文件均不提交。

**移动端适配**（只写在示例层，组件库保持中立）：`example/src/mobile.ts` 按 UA 加 `my-mobile-native` 类并拦截长按选中与系统 callout（输入框、可复制文本除外）；`mobile.css` 处理 edge-to-edge 下的状态栏与手势条安全区；viewport 使用 `viewport-fit=cover`。字重统一走主题系统的 `settings.fontWeight`，不另设一套变量。

**原生页面跳转**：在 Android App 的「状态反馈 → 原生页面跳转」中修改备注或计数，再点「打开原生页面」。新页由独立的 `NativePageActivity` 承载；系统返回手势或页内返回按钮关闭新页，恢复首页原有的内容和滚动位置。当前示例使用 Tauri 内置多窗口能力，需要 Android 12L（API 32）或更高版本，具体系统转场跟随设备与 ROM。

这部分放在示例工程内，无需新增插件包：`example/src-tauri/src/native_page.rs` 通过 Tauri 的 `WebviewWindowBuilder` 创建 Activity，固定加载 `native-page.html`；`example/src/native-page.ts` 提供打开和返回的薄入口，`NativePage.vue` 复用原有组件、主题和系统字重。子页按 `native-page-*` 精确授权，首页不能被子页的关闭命令误关。未启用网页路由，也没有用 CSS 模拟页面进退动画。

返回命令通过当前子页的 JNI 句柄调用 `Activity.finish()`，不依赖 Android 上不会结束 Activity 的窗口 `close()`；系统返回继续使用原生返回栈，销毁时显式释放子页 WebView。首页保留只是因为它没有销毁：两个 WebView 的 TS 模块、Vue 状态和全局变量仍各有一份。跨页共享业务数据需要消息同步或原生状态桥接，不会因为导入同一个 TS 文件自动共用内存。

## 浏览器回归

浏览器回归使用 `bun run dev:test`，在 `http://127.0.0.1:5179/tests/文件名.browser.html` 打开对应页面。测试服务以仓库为根目录，示例服务以 `example/` 为根目录，互不混入构建产物。纯函数测试通过 `bun test ./tests/文件名.test.mjs` 按模块运行。

两个示例入口都禁用移动端页面缩放，并保留单指滚动。自己的页面需要相同策略时，在 `html` 添加 `my-no-zoom`，并沿用示例的 viewport 配置；仅引入组件不会自动限制宿主页面缩放。按钮统一禁用文本选中，输入与正文复制不受影响。

`tests/date-time.browser.html` 检查日期时间联动、跟手、日历范围、禁用日期、键盘、面板草稿、原生与 Vue 同步、样式和卸载；`tests/date-time.test.mjs` 检查闰年、边界、时分秒步长、网格与范围规则。

`tests/picker.browser.html` 检查滚轮跟手、惯性、级联、键盘、禁用态、面板草稿和卸载；`tests/picker-value.test.mjs` 检查多列选值与吸附规则。`tests/image.browser.html` 检查图片加载、缓存、懒加载、切换地址、失败重试、属性、插槽与销毁；`tests/native-core.browser.html` 覆盖原生与 Vue 的值同步、布局尺寸、SVG 显隐、明暗主题、插槽、焦点及弹层生命周期；`tests/input-affixes.browser.html` 检查输入框图标对齐、完整点击区域和显隐操作。其余浏览器回归保留原交互场景。纯函数测试使用 Bun 运行，按改动范围选择测试文件运行。

`tests/upload-structure.browser.html` 定向检查上传状态与取消、移除、重试、对象地址释放、原生与 Vue 同步、顶栏居中、通知焦点和过渡、步骤键盘与语义。`tests/upload-structure.test.mjs` 检查文件校验与步骤状态；级联菜单标题图标的连续显示由 `tests/menu-cascade.browser.html` 的触屏标题用例覆盖。

## 目录维护

项目目录名为 `my-ui`。Git 保留组件源码、示例、正式测试、原始设计参考和构建配置；依赖、构建结果、编辑器设置及本地工具配置均由 `.gitignore` 排除。

临时截图、验证脚本和发布用的仓库副本放在系统临时目录中，用完清理，不在项目内积累 `qa` 或嵌套 Git 仓库。`node_modules` 是可重新安装的本地依赖，`dist` 是构建产物，均不提交。
