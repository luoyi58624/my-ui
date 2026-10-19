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
  components/         47 个组件的类型与薄封装，无组件样式
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

公共组件：Icon、Avatar、Image、Badge、Button、Tag、TagGroup、Input、Textarea、Form、FormField、Radio、RadioGroup、Checkbox、CheckboxGroup、Choices、Switch、Select、Combobox、Segmented、Slider、Picker、DatePicker、TimePicker、Calendar、Progress、Tabs、Navigation、Stepper、CellGroup、ListRow、Collapse、CollapseItem、Card、Tooltip、Divider、Loading、Skeleton、Empty、Floating、Menu、Popover、Dialog、Sheet、Drawer、Popup、Toast。

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

Picker 可直接嵌入页面，也可放入 Sheet。面板中使用一份临时值，确认后写回，取消时丢弃；示例见 `src/demo/PickerShowcase.vue`。

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

原生声明式入口同样支持 `data-my="Calendar"` / `DatePicker` / `TimePicker` 和 JSON `data-options`。DatePicker / TimePicker 沿用 Picker 的 CSS 变量；Calendar 提供 `--calendar-width`（默认 360px）和 `--calendar-day-size`（默认 36px），颜色只沿用 CSS 主题变量。示例见 `src/demo/DateTimeShowcase.vue` 与 `native.html`。

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

`tests/date-time.browser.html` 检查日期时间联动、跟手、日历范围、禁用日期、键盘、面板草稿、原生与 Vue 同步、样式和卸载；`tests/date-time.test.mjs` 检查闰年、边界、时分秒步长、网格与范围规则。

`tests/picker.browser.html` 检查滚轮跟手、惯性、级联、键盘、禁用态、面板草稿和卸载；`tests/picker-value.test.mjs` 检查多列选值与吸附规则。`tests/image.browser.html` 检查图片加载、缓存、懒加载、切换地址、失败重试、属性、插槽与销毁；`tests/native-core.browser.html` 覆盖原生与 Vue 的值同步、布局尺寸、SVG 显隐、明暗主题、插槽、焦点及弹层生命周期；`tests/input-affixes.browser.html` 检查输入框图标对齐、完整点击区域和显隐操作。其余浏览器回归保留原交互场景。纯函数测试继续使用 Node 内置测试器，按改动范围选择测试文件运行。

## 目录维护

项目目录名为 `my-ui`。Git 保留组件源码、示例、正式测试、原始设计参考和构建配置；依赖、构建结果、编辑器设置及本地工具配置均由 `.gitignore` 排除。

临时截图、验证脚本和发布用的仓库副本放在系统临时目录中，用完清理，不在项目内积累 `qa` 或嵌套 Git 仓库。`node_modules` 是可重新安装的本地依赖，`dist` 是构建产物，均不提交。
