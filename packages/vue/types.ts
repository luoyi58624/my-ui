import type { ComponentOptionsMixin, DefineComponent, EmitFn, EmitsToProps, PublicProps, SlotsType, VNode } from 'vue'
import type { NativeExposed } from './adapter'
import type {
  IconName, Option, MenuOption, StepOption, FieldControl, FloatingAnchor,
  FloatingPlacement, PickerValue, PickerOption, SliderMark, FormLayout,
  ListMode, UploadFile, UploadRequest, UploadRejection, ImagePreviewItem,
} from '../../lib/my-ui'

/** 公共数据类型与原生核心一致，Vue 封装不再重复维护。 */
export type {
  IconName, Option, MenuOption, StepOption, FieldControl, FloatingAnchor,
  FloatingPlacement, PointerAnchor, PickerValue, PickerOption, SliderMark,
  FormLayout, ListMode, UploadFile, UploadStatus, UploadRequest,
  UploadRequestContext, UploadRejection, ImagePreviewItem,
} from '../../lib/my-ui'

type EventOptions<E extends { [K in keyof E]: any[] }> = { [K in keyof E]: (...args: E[K]) => void }
type DefaultSlots = Record<string, (scope: Record<string, any>) => any>

/** 组件属性与事件回调类型，供泛型组件保留 v-model 的值推导。 */
export type ComponentProps<P, E extends { [K in keyof E]: any[] }> = P & NoInfer<EmitsToProps<EventOptions<E>>> & PublicProps

/** 泛型渲染组件保留模板上下文，避免事件提取时丢失已经推导出的值类型。 */
export type ComponentVNode<P, E extends { [K in keyof E]: any[] }> = VNode & {
  __ctx?: { props: ComponentProps<P, E>; emit: EmitFn<EventOptions<E>>; slots: DefaultSlots; expose(exposed: NativeExposed): void }
}

/** 标准 Vue 组件类型，同时保留属性、事件、插槽和现有 ref 方法。 */
export type NativeComponent<P, E extends { [K in keyof E]: any[] } = {}, H = NativeExposed, S extends Record<string, any> = DefaultSlots> = DefineComponent<
  P, H, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin,
  EventOptions<E>, string, PublicProps, P & EmitsToProps<EventOptions<E>>, {}, SlotsType<S>
>

/** AppBar 的 Vue 属性，保留原有组件用法。 */
export type AppBarProps = {
  /** 顶栏标题，默认插槽可替换标题内容。 */
  title?: string
  /** 标题下方的辅助说明。 */
  subtitle?: string
  /** 显示返回按钮；leading 插槽优先。 */
  back?: boolean
  /** 返回按钮的辅助名称。 */
  backLabel?: string
  /** 标题保持几何居中，关闭后跟随左侧布局。 */
  center?: boolean
  /** 在当前滚动容器顶部吸附，偏移可用 CSS 变量设置。 */
  sticky?: boolean
}

/** AppBar 的组件事件，v-model 直接接收新的绑定值。 */
export type AppBarEmits = {
  /** 点击返回按钮，仅发送事件，页面导航由应用决定。 */
  back: [event: MouseEvent]
}

/** Avatar 的 Vue 属性，保留原有组件用法。 */
export type AvatarProps = {
  /** 图片地址；为空或加载失败时展示文字或默认插槽。 */
  src?: string
  /** 头像的辅助名称，同时作为自动缩写的来源。 */
  alt?: string
  /** 明确指定回退文字，优先于 alt 的自动缩写。 */
  text?: string
  /** 尺寸为像素数或 CSS 长度。 */
  size?: number | string
  /** 圆形或圆角方形。 */
  shape?: 'circle' | 'square'
}

/** Avatar 的组件事件，v-model 直接接收新的绑定值。 */
export type AvatarEmits = {
  /** 当前图片加载完成。 */
  load: [event: Event]
  /** 当前图片加载失败并切换到回退内容。 */
  error: [event: Event]
}

/** Badge 的 Vue 属性，保留原有组件用法。 */
export type BadgeProps = {
  /** 显示数字或短文字；无默认插槽时独立展示。 */
  value?: number | string
  /** 数字超过上限后显示 max+，默认 99。 */
  max?: number
  /** 使用小圆点，不需要传 value。 */
  dot?: boolean
  /** 数字为零时仍显示，默认隐藏。 */
  showZero?: boolean
  /** 隐藏提示，保持默认插槽中的内容。 */
  hidden?: boolean
  /** 自定义辅助名称，例如“12 条未读消息”。 */
  label?: string
}

/** Badge 的组件事件，v-model 直接接收新的绑定值。 */
export type BadgeEmits = {}

/** Button 的 Vue 属性，保留原有组件用法。 */
export type ButtonProps = {
  /** 按钮的视觉层级。 */
  variant?: 'primary' | 'outline' | 'text' | 'icon' | 'bare' | 'link' | 'round'
  /** 左侧图标，图标按钮需通过 aria-label 提供名称。 */
  icon?: IconName
  /** 禁止点击。 */
  disabled?: boolean
  /** 显示加载状态并阻止重复激活，保留按钮尺寸与键盘焦点。 */
  loading?: boolean
  /** 表示收藏等可切换按钮的选中状态。 */
  selected?: boolean
  /** 触摸按压激活前的等待毫秒数，默认 0；鼠标与键盘不延迟。 */
  delayTouchDown?: number
  /** 从触摸按下起算的最短反馈毫秒数，默认 100；抬起时只补剩余时间，不延迟点击。 */
  delayTouchUp?: number
  /** 原生按钮类型，默认避免触发表单提交。 */
  type?: 'button' | 'submit' | 'reset'
}

/** Button 的组件事件，v-model 直接接收新的绑定值。 */
export type ButtonEmits = {
  /** 可用状态下触发原生点击事件。 */
  click: [event: MouseEvent]
}

/** Calendar 的 Vue 属性，保留原有组件用法。 */
export type CalendarProps<T extends string | readonly string[] | null = string | string[] | null> = {
  /** 单日使用 YYYY-MM-DD；范围依次返回 [开始]、[开始, 结束]。 */
  modelValue?: T
  /** 开启范围选择，默认单日。 */
  range?: boolean
  /** 当前展示月份 YYYY-MM，未设置时跟随所选日期或今天。 */
  month?: string
  /** 最早可选日期，包含当天。 */
  min?: string
  /** 最晚可选日期，包含当天。 */
  max?: string
  /** 返回 true 禁用指定日期；入参为 YYYY-MM-DD，范围不能跨过禁用日期。 */
  disabledDate?: (date: string) => boolean
  /** 每周起始日，0 为周日、1 为周一，默认 1。 */
  firstDayOfWeek?: number
  /** 日历的辅助名称。 */
  label?: string
  /** 禁止选择与月份导航。 */
  disabled?: boolean
}

/** Calendar 的组件事件，v-model 直接接收新的绑定值。 */
export type CalendarEmits<T extends string | readonly string[] | null = string | string[] | null> = {
  /** 单日选择或范围端点改变时更新值。 */
  'update:modelValue': [value: T]
  /** 完成单日选择或范围的两个端点后触发。 */
  select: [value: T]
  /** 用户切换展示月份时触发，格式为 YYYY-MM。 */
  'month-change': [value: string]
}

/** Card 的 Vue 属性，保留原有组件用法。 */
export type CardProps = {
  /** 卡片标题。 */
  title?: string
  /** 标题下的补充说明。 */
  description?: string
  /** 右上角的示例编号。 */
  sample?: string
  /** 将整张卡片作为操作按钮，并支持 Enter 与空格。 */
  interactive?: boolean
  /** 触摸按压激活前的等待毫秒数，默认 0；鼠标与键盘不延迟。 */
  delayTouchDown?: number
  /** 从触摸按下起算的最短反馈毫秒数，默认 100；抬起时只补剩余时间，不延迟点击。 */
  delayTouchUp?: number
}

/** Card 的组件事件，v-model 直接接收新的绑定值。 */
export type CardEmits = {
  /** 整张交互卡片被点击或键盘激活，内部控件独立操作。 */
  activate: [event: MouseEvent | KeyboardEvent]
}

/** CellGroup 的 Vue 属性，保留原有组件用法。 */
export type CellGroupProps = {
  /** 分组标题。 */
  title?: string
  /** 分组补充说明。 */
  description?: string
  /** 普通、单选、多选三种模式，默认 normal。 */
  mode?: ListMode
  /** 选择模式绑定字符串或字符串数组，普通模式无需绑定。 */
  modelValue?: string | string[]
  /** 数据列表；省略时继续使用默认插槽组合列表行。 */
  options?: Option[]
  /** 没有可见标题时提供分组的可访问名称。 */
  label?: string
  /** 禁止整组选择。 */
  disabled?: boolean
}

/** CellGroup 的组件事件，v-model 直接接收新的绑定值。 */
export type CellGroupEmits = {
  /** 同步单选值或多选数组。 */
  'update:modelValue': [value: string | string[]]
  /** 用户激活可用条目后返回选项，普通模式也可用。 */
  select: [item: Option]
}

/** Checkbox 的 Vue 属性，保留原有组件用法。 */
export type CheckboxProps = {
  /** 独立使用绑定布尔值，组内由 CheckboxGroup 管理。 */
  modelValue?: boolean
  /** 组内的唯一值；独立使用可作为原生表单提交值。 */
  value?: string
  /** 可见文字，也可以使用默认插槽。 */
  label?: string
  /** 标签下方的补充说明。 */
  description?: string
  /** 半选状态，可配合 v-model:indeterminate 在操作后清除。 */
  indeterminate?: boolean
  /** 禁止选择，整组禁用时同样生效。 */
  disabled?: boolean
  /** 原生表单名称，组内使用组的名称。 */
  name?: string
}

/** Checkbox 的组件事件，v-model 直接接收新的绑定值。 */
export type CheckboxEmits = {
  /** 独立使用时同步布尔值。 */
  'update:modelValue': [value: boolean]
  /** 用户选择后清除半选状态。 */
  'update:indeterminate': [value: boolean]
}

/** CheckboxGroup 的 Vue 属性，保留原有组件用法。 */
export type CheckboxGroupProps = {
  /** 当前选中的字符串数组。 */
  modelValue: string[]
  /** 可见的分组名称，外部 aria-labelledby 存在时不重复显示。 */
  label: string
  /** 简单场景直接传选项，默认插槽可自由组合 Checkbox。 */
  options?: Option[]
  /** 禁止整组交互。 */
  disabled?: boolean
  /** 水平排列，空间不足时自动换行。 */
  inline?: boolean
  /** 原生表单名称，不传时生成独立名称。 */
  name?: string
}

/** CheckboxGroup 的组件事件，v-model 直接接收新的绑定值。 */
export type CheckboxGroupEmits = { /** 同步新数组，不修改传入数组。 */ 'update:modelValue': [value: string[]] }

/** Choices 的 Vue 属性，保留原有组件用法。 */
export type ChoicesProps = {
  /** 单选传字符串，复选传字符串数组。 */
  modelValue: string | string[]
  /** 分组名称，外部 aria-labelledby 存在时不重复显示。 */
  label: string
  /** 可选择的项目。 */
  options: Option[]
  /** 单选或复选模式。 */
  type?: 'radio' | 'checkbox'
  /** 使用带说明的整行列表样式。 */
  list?: boolean
  /** 禁止整组交互。 */
  disabled?: boolean
}

/** Choices 的组件事件，v-model 直接接收新的绑定值。 */
export type ChoicesEmits = {
  /** 同步单选值或复选数组。 */
  'update:modelValue': [value: string | string[]]
}

/** Collapse 的 Vue 属性，保留原有组件用法。 */
export type CollapseProps<T extends string | string[]> = {
  /** 字符串为手风琴，数组允许多项展开；空字符串或空数组全部收起。 */
  modelValue: T
  /** 禁止整组标题交互，不主动改变展开状态。 */
  disabled?: boolean
  /** 可选的分组辅助名称。 */
  label?: string
}

/** Collapse 的组件事件，v-model 直接接收新的绑定值。 */
export type CollapseEmits<T extends string | string[]> = { /** 同步展开值，保留字符串或数组类型。 */ 'update:modelValue': [value: T] }

/** CollapseItem 的 Vue 属性，保留原有组件用法。 */
export type CollapseItemProps = {
  /** 在所属 Collapse 内唯一且非空的条目标识。 */
  value: string
  /** 标题文字，也可以使用 title 插槽。 */
  title?: string
  /** 禁止此标题切换和键盘导航，不主动收起内容。 */
  disabled?: boolean
}

/** CollapseItem 的组件事件，v-model 直接接收新的绑定值。 */
export type CollapseItemEmits = {}

/** Combobox 的 Vue 属性，保留原有组件用法。 */
export type ComboboxProps = {
  /** 选项值；输入的搜索词不会直接写入选中值，空字符串表示未选择。 */
  modelValue: string
  /** 共用的平级选项，value 应唯一且非空。 */
  options: Option[]
  /** 可见标签与辅助名称。 */
  label: string
  /** 原生输入标识，不传时自动生成。 */
  id?: string
  /** 原生表单提交选项值，而不是显示文字。 */
  name?: string
  /** 未选择时的输入提示。 */
  placeholder?: string
  /** 显示清空按钮。 */
  clearable?: boolean
  /** 禁止输入、清空和展开。 */
  disabled?: boolean
  /** 显示搜索等待态，等待中不能选择旧结果。 */
  loading?: boolean
  /** 默认搜索名称、说明和值；false 交由外部筛选，也可传入自定义判断。 */
  filter?: false | ((query: string, option: Option) => boolean)
  /** 没有结果时的提示文字。 */
  emptyText?: string
  /** 必填约束与可见标记。 */
  required?: boolean
  /** 复用 FormField 的错误显示与辅助关联。 */
  error?: string
  /** 输入说明。 */
  hint?: string
}

/** Combobox 的组件事件，v-model 直接接收新的绑定值。 */
export type ComboboxEmits = {
  /** 选择或清空后的值；不提交尚未选择的搜索词。 */
  'update:modelValue': [value: string]
  /** 输入搜索词，配合 filter=false 和 loading 对接异步结果。 */
  search: [query: string]
  /** 窗口开始关闭后返回用户选择的完整选项。 */
  select: [option: Option]
}

/** DatePicker 的 Vue 属性，保留原有组件用法。 */
export type DatePickerProps = {
  /** 日期字符串 YYYY-MM-DD；空值显示今天但不主动写回。 */
  modelValue?: string | null
  /** 最早可选日期，默认 1900-01-01。 */
  min?: string
  /** 最晚可选日期，默认 2100-12-31。 */
  max?: string
  /** 整组日期滚轮的辅助名称。 */
  label?: string
  /** 禁止拖动、滚轮与键盘调整。 */
  disabled?: boolean
}

/** DatePicker 的组件事件，v-model 直接接收新的绑定值。 */
export type DatePickerEmits = {
  /** 年月日改变时同步合法日期，自动修正月底与上下限。 */
  'update:modelValue': [value: string]
}

/** Dialog 的 Vue 属性，保留原有组件用法。 */
export type DialogProps = {
  /** 控制弹窗的显示状态。 */
  modelValue: boolean
  /** 弹窗标题。 */
  title: string
  /** 正文，默认按文本显示，也可使用默认插槽。 */
  description?: string
  /** 标题上方的图标。 */
  icon?: IconName | false
  /** 取消按钮文案。 */
  cancelText?: string | false
  /** 确认按钮文案。 */
  confirmText?: string
  /** true 居中展示，false 在底部保留外边距展示。 */
  center?: boolean
  /** 使用危险色强调确认操作。 */
  danger?: boolean
  /** 是否允许点击背景关闭。 */
  closeOnBackdrop?: boolean
  /** 是否允许按 Escape 关闭。 */
  closeOnEscape?: boolean
}

/** Dialog 的组件事件，v-model 直接接收新的绑定值。 */
export type DialogEmits = {
  /** 同步弹窗的显示状态。 */
  'update:modelValue': [value: boolean]
  /** 用户确认操作。 */
  confirm: []
  /** 用户取消或关闭操作。 */
  cancel: []
  /** 离场动画结束。 */
  'after-leave': []
}

/** Divider 的 Vue 属性，保留原有组件用法。 */
export type DividerProps = {
  /** 改为行内竖向分割线，高度可通过 --divider-height 覆写。 */
  vertical?: boolean
  /** 带文字时的对齐位置。 */
  align?: 'start' | 'center' | 'end'
  /** 使用虚线，保留与实线一致的边框厚度。 */
  dashed?: boolean
}

/** Divider 的组件事件，v-model 直接接收新的绑定值。 */
export type DividerEmits = {}

/** Drawer 的 Vue 属性，保留原有组件用法。 */
export type DrawerProps = {
  /** 控制抽屉展开状态。 */
  modelValue: boolean
  /** 抽屉标题。 */
  title: string
  /** 抽屉出现方向，默认从右侧展开。 */
  placement?: 'left' | 'right' | 'top' | 'bottom'
  /** 允许单指沿展开方向滑动关闭，默认开启。 */
  swipeable?: boolean
  /** 是否允许点击遮罩关闭。 */
  closeOnBackdrop?: boolean
  /** 是否允许按 Escape 关闭。 */
  closeOnEscape?: boolean
}

/** Drawer 的组件事件，v-model 直接接收新的绑定值。 */
export type DrawerEmits = {
  /** 同步抽屉展开状态。 */
  'update:modelValue': [value: boolean]
  /** 关闭按钮、遮罩、Escape 或滑动触发关闭。 */
  close: []
  /** 离场动画结束。 */
  'after-leave': []
}

/** Empty 的 Vue 属性，保留原有组件用法。 */
export type EmptyProps = {
  /** 空内容或加载错误状态。 */
  state?: 'empty' | 'error'
  /** 状态标题，不传时按状态生成。 */
  title?: string
  /** 补充说明。 */
  description?: string
  /** 自定义状态图标。 */
  icon?: IconName
}

/** Empty 的组件事件，v-model 直接接收新的绑定值。 */
export type EmptyEmits = {}

/** Floating 的 Vue 属性，保留原有组件用法。 */
export type FloatingProps = {
  /** 控制窗口显示，首次挂载也执行进入动画。 */
  modelValue: boolean
  /** 触发元素或实际按压位置。 */
  anchor?: FloatingAnchor
  /** 首选展示方向，空间不足时自动翻转。 */
  placement?: FloatingPlacement
  /** 使用触发元素宽度，仍受视口边界限制。 */
  matchWidth?: boolean
  /** 默认完整展开，slide 轻微位移，fade 仅淡入淡出。 */
  motion?: 'expand' | 'slide' | 'fade'
}

/** Floating 的组件事件，v-model 直接接收新的绑定值。 */
export type FloatingEmits = {
  /** 触发位置不可见或失效时收起窗口。 */
  'update:modelValue': [value: boolean]
  /** 完成首轮定位，可安全聚焦窗口内容。 */
  positioned: []
  /** 离场动画结束，可恢复与窗口共享的触发行。 */
  'after-leave': []
}

/** Form 的 Vue 属性，保留原有组件用法。 */
export type FormProps = {
  /** 垂直、标签在左的水平布局，或自动换行的行内布局。 */
  layout?: FormLayout
}

/** Form 的组件事件，v-model 直接接收新的绑定值。 */
export type FormEmits = {}

/** FormField 的 Vue 属性，保留原有组件用法。 */
export type FormFieldProps = {
  /** 表单项的可见标签；竖排标题只提供辅助名称，不通过点击激活控件。 */
  label: string
  /** 控件标识，不传时自动生成并关联标签。 */
  id?: string
  /** 必填标记，同时通过插槽传给原生控件。 */
  required?: boolean
  /** 校验错误，优先于补充说明显示。 */
  error?: string
  /** 没有错误时的补充说明。 */
  hint?: string
  /** 为单选、多选等控件分组提供标签，不生成指向单一输入的 label。 */
  group?: boolean
}

/** FormField 的组件事件，v-model 直接接收新的绑定值。 */
export type FormFieldEmits = {}

/** Icon 的 Vue 属性，保留原有组件用法。 */
export type IconProps = {
  /** 使用原稿中的线性图标。 */
  name: IconName
}

/** Icon 的组件事件，v-model 直接接收新的绑定值。 */
export type IconEmits = {}

/** Image 的 Vue 属性，保留原有组件用法。 */
export type ImageProps = {
  /** 图片地址；为空时展示占位，不发出请求。 */
  src?: string
  /** 图片替代文字；装饰图片保留空字符串。 */
  alt?: string
  /** 容器宽度，数字及数字字符串为像素，也接受 CSS 长度。 */
  width?: number | string
  /** 容器高度，数字及数字字符串为像素，也接受 CSS 长度。 */
  height?: number | string
  /** 预留宽高比，如 16 / 9 或 '16 / 9'；省略时加载后使用原图比例。 */
  ratio?: number | string
  /** 图片在容器内的裁剪方式。 */
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  /** 使用浏览器原生懒加载；首屏重点图片可设为 eager。 */
  loading?: 'lazy' | 'eager'
}

/** Image 的组件事件，v-model 直接接收新的绑定值。 */
export type ImageEmits = {
  /** 当前图片成功加载，事件 target 为实际 img。 */
  load: [event: Event]
  /** 当前图片加载失败，旧地址的迟到事件不会触发。 */
  error: [event: Event]
}

/** Image 的命名插槽与作用域信息。 */
export type ImageSlots = {
  /** 空地址或加载中展示，state 区分这两种状态。 */
  placeholder?(context: { src: string; state: 'empty' | 'loading' }): any
  /** 失败内容，可调用 retry 重新加载当前地址。 */
  error?(context: { src: string; retry: () => void }): any
}

/** ImagePreview 的 Vue 属性，保留原有组件用法。 */
export type ImagePreviewProps = {
  /** 控制全屏图片预览的显示状态。 */
  modelValue: boolean
  /** 图片地址或带替代文字的图片列表，空列表显示可关闭的空状态。 */
  images: readonly (string | ImagePreviewItem)[]
  /** 从零开始的图片位置；打开时采用此值，打开中更新会切换图片。 */
  startIndex?: number
  /** 预览窗口的标题和辅助名称。 */
  title?: string
  /** 最大放大倍数，最小为 1。 */
  maxZoom?: number
  /** 是否允许 Escape 和系统返回关闭预览。 */
  closeOnEscape?: boolean
}

/** ImagePreview 的组件事件，v-model 直接接收新的绑定值。 */
export type ImagePreviewEmits = {
  /** 同步预览窗口的显示状态。 */
  'update:modelValue': [value: boolean]
  /** 当前图片改变后返回从零开始的位置。 */
  'index-change': [index: number]
  /** 用户请求关闭预览。 */
  close: []
  /** 预览的离场动画结束。 */
  'after-leave': []
}

/** Input 的 Vue 属性，保留原有组件用法。 */
export type InputProps = {
  /** 输入框的双向绑定文本。 */
  modelValue: string
  /** 输入框标签。 */
  label: string
  /** 原生控件标识，不传时自动生成。 */
  id?: string
  /** 常用文本类型，password 默认始终隐藏。 */
  type?: 'text' | 'search' | 'email' | 'password' | 'tel' | 'url'
  /** 在密码框右侧显示显隐按钮，默认不显示。 */
  passwordToggle?: boolean
  /** 占位提示。 */
  placeholder?: string
  /** 前置图标，也可以使用 prefix 插槽。 */
  icon?: IconName
  /** 显示清空按钮。 */
  clearable?: boolean
  /** 最大输入长度。 */
  maxlength?: number
  /** 禁止聚焦、编辑和密码显隐操作。 */
  disabled?: boolean
  /** 保持可聚焦与复制，但禁止编辑和清空。 */
  readonly?: boolean
  /** 原生必填约束与可见标记。 */
  required?: boolean
  /** 校验错误，自动关联到原生控件。 */
  error?: string
  /** 没有错误时显示的说明。 */
  hint?: string
  /** 原生自动填充用途。 */
  autocomplete?: string
}

/** Input 的组件事件，v-model 直接接收新的绑定值。 */
export type InputEmits = {
  /** 同步输入和清空后的文本。 */
  'update:modelValue': [value: string]
}

/** ListRow 的 Vue 属性，保留原有组件用法。 */
export type ListRowProps = {
  /** 行标题，使用 15px、500 字重。 */
  title: string
  /** 二级说明，使用 14px、400 字重并按内容换行。 */
  description?: string
  /** 右侧的当前设置值，长内容自动换行。 */
  value?: string
  /** 使用整行可点击的开关样式。 */
  toggle?: boolean
  /** 开关模式下的选中状态。 */
  modelValue?: boolean
  /** 禁止当前操作。 */
  disabled?: boolean
  /** 触摸按压激活前的等待毫秒数，默认 0；鼠标与键盘不延迟。 */
  delayTouchDown?: number
  /** 从触摸按下起算的最短反馈毫秒数，默认 100；只补剩余时间，滚动和取消立即撤销。 */
  delayTouchUp?: number
}

/** ListRow 的组件事件，v-model 直接接收新的绑定值。 */
export type ListRowEmits = {
  /** 导航行被激活时的原生点击事件。 */
  click: [event: MouseEvent]
  /** 同步开关模式的新状态。 */
  'update:modelValue': [value: boolean]
}

/** Loading 的 Vue 属性，保留原有组件用法。 */
export type LoadingProps = {
  /** 加载图标尺寸，嵌入按钮时使用 small。 */
  size?: 'small' | 'medium' | 'large'
  /** 没有可见文字时的辅助名称。 */
  label?: string
}

/** Loading 的组件事件，v-model 直接接收新的绑定值。 */
export type LoadingEmits = {}

/** Menu 的 Vue 属性，保留原有组件用法。 */
export type MenuProps = {
  /** 菜单选项；添加 children 即可创建子菜单，只有叶子项触发选择。 */
  options: MenuOption[]
  /** 可访问名称。 */
  label?: string
  /** 单选值或多选数组，普通动作菜单无需绑定。 */
  modelValue?: string | string[]
  /** 普通动作、单选、多选，默认 normal。 */
  mode?: ListMode
  /** 可选的受控展开状态；省略时由组件管理。 */
  open?: boolean
  /** 点击、右键有效抬起触发，触屏长按即触发；移动不超过 20px，支持 Shift + F10。 */
  trigger?: 'click' | 'contextmenu'
  /** 默认从实际按压点展开，element 改为跟随触发元素。 */
  anchor?: 'pointer' | 'element'
  /** 首选方向，自动适配视口边界。 */
  placement?: FloatingPlacement
  /** 使用触发元素宽度，例如输入框下拉菜单。 */
  matchWidth?: boolean
  /** 默认完整展开；slide 用于输入框下拉。 */
  motion?: 'expand' | 'slide'
  /** 禁止打开菜单。 */
  disabled?: boolean
  /** 默认普通和单选激活即关闭，多选保持展开。 */
  closeOnSelect?: boolean
  /** 仅控制子菜单的鼠标悬停展开延迟，默认 200ms；收起与点击不延迟。 */
  hoverDelay?: number
}

/** Menu 的组件事件，v-model 直接接收新的绑定值。 */
export type MenuEmits = {
  /** 同步单选值或多选数组。 */
  'update:modelValue': [value: string | string[]]
  /** 同步展开状态，可使用 v-model:open。 */
  'update:open': [value: boolean]
  /** 默认在关闭交互后返回选项，整组同时淡出；多选保持展开。 */
  select: [item: MenuOption]
}

/** Navigation 的 Vue 属性，保留原有组件用法。 */
export type NavigationProps = {
  /** 当前选中的导航项。 */
  modelValue: string
  /** 导航选项与图标。 */
  options: Option[]
  /** 导航区域的辅助名称。 */
  label?: string
}

/** Navigation 的组件事件，v-model 直接接收新的绑定值。 */
export type NavigationEmits = {
  /** 同步点击后的导航项。 */
  'update:modelValue': [value: string]
}

/** Notice 的 Vue 属性，保留原有组件用法。 */
export type NoticeProps = {
  /** 是否展示，默认显示；关闭后可通过 v-model 重新展开。 */
  modelValue?: boolean
  /** 通知的语义状态。 */
  type?: 'info' | 'success' | 'warning' | 'error'
  /** 可选的短标题。 */
  title?: string
  /** 通知正文，默认插槽可替换。 */
  message?: string
  /** 显示右侧关闭按钮。 */
  closable?: boolean
  /** 自定义图标，false 隐藏，省略时按状态选择。 */
  icon?: IconName | false
}

/** Notice 的组件事件，v-model 直接接收新的绑定值。 */
export type NoticeEmits = {
  /** 点击关闭后同步显示状态。 */
  'update:modelValue': [value: boolean]
  /** 点击关闭按钮时触发。 */
  close: [event: MouseEvent]
}

/** Picker 的 Vue 属性，保留原有组件用法。 */
export type PickerProps<T extends PickerValue | readonly PickerValue[] = PickerValue | PickerValue[]> = {
  /** 单列用单值，多列和级联用数组；空列用 null 占位。 */
  modelValue?: T
  /** 单列或带 children 的级联选项。 */
  options?: readonly PickerOption[]
  /** 独立多列选项，设置后优先于 options。 */
  columns?: readonly (readonly PickerOption[])[]
  /** 整组滚轮的辅助名称。 */
  label?: string
  /** 每列的可见标题，也作为该列的辅助名称。 */
  columnLabels?: readonly string[]
  /** 禁止所有列的拖动、滚轮与键盘调整。 */
  disabled?: boolean
}

/** Picker 的组件事件，v-model 直接接收新的绑定值。 */
export type PickerEmits<T extends PickerValue | readonly PickerValue[] = PickerValue | PickerValue[]> = {
  /** 中间选项改变时同步值，父列改变时一并修正失效的子列。 */
  'update:modelValue': [value: T]
}

/** Popover 的 Vue 属性，保留原有组件用法。 */
export type PopoverProps = {
  /** 当前菜单选项，保留原有单选调用方式。 */
  modelValue: string
  /** 菜单名称。 */
  label: string
  /** 菜单选项。 */
  options: Option[]
}

/** Popover 的组件事件，v-model 直接接收新的绑定值。 */
export type PopoverEmits = {
  /** 在窗口收起后同步新选项。 */
  'update:modelValue': [value: string]
}

/** Popup 的 Vue 属性，保留原有组件用法。 */
export type PopupProps = {}

/** Popup 的组件事件，v-model 直接接收新的绑定值。 */
export type PopupEmits = {}

/** Progress 的 Vue 属性，保留原有组件用法。 */
export type ProgressProps = {
  /** 当前完成量；省略或非有限数值时展示不确定进度。 */
  value?: number
  /** 已缓冲量，与 value 使用相同单位；省略时不显示缓冲层。 */
  buffer?: number
  /** 总量，非正数或非有限值回退为 100。 */
  max?: number
  /** 条形或环形外观，两者使用相同的数值与状态接口。 */
  type?: 'line' | 'circle'
  /** 状态复用主题已有的主色、成功、警告与错误色。 */
  status?: 'normal' | 'success' | 'warning' | 'error'
  /** 进度的可访问名称；可用 aria-labelledby 关联外部标题。 */
  label?: string
  /** 是否显示百分比、状态图标或自定义文字。 */
  showText?: boolean
}

/** Progress 的组件事件，v-model 直接接收新的绑定值。 */
export type ProgressEmits = {}

/** PullRefresh 的 Vue 属性，保留原有组件用法。 */
export type PullRefreshProps = {
  /** 加载状态；刷新完成或失败后由使用方恢复为 false。 */
  modelValue?: boolean
  /** 禁止发起新刷新，正在执行的业务请求不受影响。 */
  disabled?: boolean
  /** 滚动区域的辅助名称与下拉时的提示文字。 */
  label?: string
}

/** PullRefresh 的组件事件，v-model 直接接收新的绑定值。 */
export type PullRefreshEmits = {
  /** 有效释放或调用 refresh() 时先同步 true。 */
  'update:modelValue': [value: boolean]
  /** 通知使用方执行刷新，加载中不会重复触发。 */
  refresh: []
}

/** Radio 的 Vue 属性，保留原有组件用法。 */
export type RadioProps = {
  /** 独立使用时绑定当前选项的字符串值，组内由 RadioGroup 管理。 */
  modelValue?: string
  /** 本项的唯一值。 */
  value: string
  /** 可见文字，也可以使用默认插槽。 */
  label?: string
  /** 标签下方的补充说明。 */
  description?: string
  /** 禁止选择，整组禁用时同样生效。 */
  disabled?: boolean
  /** 原生名称；独立的同一组 Radio 应使用相同名称。 */
  name?: string
}

/** Radio 的组件事件，v-model 直接接收新的绑定值。 */
export type RadioEmits = {
  /** 独立使用时同步选中的字符串值。 */
  'update:modelValue': [value: string]
}

/** RadioGroup 的 Vue 属性，保留原有组件用法。 */
export type RadioGroupProps = {
  /** 当前选项值。 */
  modelValue: string
  /** 可见的分组名称，外部 aria-labelledby 存在时不重复显示。 */
  label: string
  /** 简单场景直接传选项，默认插槽可自由组合 Radio。 */
  options?: Option[]
  /** 禁止整组交互。 */
  disabled?: boolean
  /** 水平排列，空间不足时自动换行。 */
  inline?: boolean
  /** 原生表单名称，不传时生成独立名称。 */
  name?: string
}

/** RadioGroup 的组件事件，v-model 直接接收新的绑定值。 */
export type RadioGroupEmits = { /** 同步选中的字符串值。 */ 'update:modelValue': [value: string] }

/** Segmented 的 Vue 属性，保留原有组件用法。 */
export type SegmentedProps = {
  /** 当前选中值。 */
  modelValue: string
  /** 分段选项，可使用任意数量的选项。 */
  options: Option[]
  /** 分段控件的分组名称。 */
  label: string
}

/** Segmented 的组件事件，v-model 直接接收新的绑定值。 */
export type SegmentedEmits = {
  /** 同步新选项值。 */
  'update:modelValue': [value: string]
}

/** Select 的 Vue 属性，保留原有组件用法。 */
export type SelectProps = {
  /** 当前选择的选项值。 */
  modelValue: string
  /** 可见标签与辅助名称。 */
  label: string
  /** 下拉选项。 */
  options: Option[]
  /** 禁止打开下拉。 */
  disabled?: boolean
}

/** Select 的组件事件，v-model 直接接收新的绑定值。 */
export type SelectEmits = {
  /** 同步新的选项值。 */
  'update:modelValue': [value: string]
}

/** Sheet 的 Vue 属性，保留原有组件用法。 */
export type SheetProps = {
  /** 底部面板是否展开。 */
  modelValue: boolean
  /** 面板标题。 */
  title: string
  /** 保留简单操作单用法，自定义内容优先使用默认插槽。 */
  actions?: Option[]
  /** 取消文案，false 隐藏取消按钮。 */
  cancelText?: string | false
  /** 需要两项操作时传入确认文案。 */
  confirmText?: string
  /** 使用危险色强调确认按钮。 */
  danger?: boolean
  /** 允许单指下拉关闭，正文滚动时优先保留滚动，默认开启。 */
  swipeable?: boolean
  /** 是否允许点击遮罩关闭。 */
  closeOnBackdrop?: boolean
  /** 是否允许按 Escape 关闭。 */
  closeOnEscape?: boolean
}

/** Sheet 的组件事件，v-model 直接接收新的绑定值。 */
export type SheetEmits = {
  /** 同步面板展开状态。 */
  'update:modelValue': [value: boolean]
  /** 返回所选的简单操作项。 */
  select: [action: Option]
  /** 用户取消或关闭面板。 */
  cancel: []
  /** 用户确认面板操作。 */
  confirm: []
  /** 离场动画结束。 */
  'after-leave': []
}

/** Skeleton 的 Vue 属性，保留原有组件用法。 */
export type SkeletonProps = {
  /** 为 true 时显示占位，为 false 时显示默认内容。 */
  loading?: boolean
  /** 占位正文行数，限制在 1 至 10 行。 */
  rows?: number
  /** 显示头像占位。 */
  avatar?: boolean
  /** 加载时的辅助说明。 */
  label?: string
}

/** Skeleton 的组件事件，v-model 直接接收新的绑定值。 */
export type SkeletonEmits = {}

/** Slider 的 Vue 属性，保留原有组件用法。 */
export type SliderProps<T extends number | number[]> = {
  /** 数值表示单滑块，数组表示范围；交叉时切换上下限，返回新的有序数组。 */
  modelValue: T
  /** 已缓冲到的数值，范围与 min/max 相同；省略时不显示缓冲层。 */
  buffer?: number
  /** 滑块的可见标签。 */
  label: string
  /** 最小允许值。 */
  min?: number
  /** 最大允许值。 */
  max?: number
  /** 取值步长，null 限定为 marks；触屏拖动预览、抬起提交，数值按中点吸附。 */
  step?: number | null
  /** true 按 step 绘制刻度，数组指定刻度位置和可选文字。 */
  marks?: boolean | readonly SliderMark[]
  /** auto 悬停、拖动和键盘聚焦时显示，on 常显，off 关闭。 */
  valueLabelDisplay?: 'auto' | 'on' | 'off'
  /** 自定义数值提示和标题中的数值文案，默认追加 unit。 */
  valueLabelFormat?: (value: number, index: number) => string
  /** 自定义屏幕阅读器读取的数值文案，默认与数值提示相同。 */
  getAriaValueText?: (value: number, index: number) => string
  /** 禁止拖动与键盘调整。 */
  disabled?: boolean
  /** 显示数值时追加的单位。 */
  unit?: string
  /** 左端提示。 */
  startLabel?: string
  /** 右端提示。 */
  endLabel?: string
}

/** Slider 的组件事件，v-model 直接接收新的绑定值。 */
export type SliderEmits<T extends number | number[]> = {
  /** 同步数值；触屏仅在有效抬起时提交，鼠标与键盘实时提交。 */
  'update:modelValue': [value: T]
}

/** Stepper 的 Vue 属性，保留原有组件用法。 */
export type StepperProps = {
  /** 当前数量。 */
  modelValue: number
  /** 最小数量。 */
  min?: number
  /** 最大数量。 */
  max?: number
  /** 增减步长。 */
  step?: number
  /** 辅助名称。 */
  label?: string
}

/** Stepper 的组件事件，v-model 直接接收新的绑定值。 */
export type StepperEmits = {
  /** 提交有效、已限制范围的数值。 */
  'update:modelValue': [value: number]
}

/** Steps 的 Vue 属性，保留原有组件用法。 */
export type StepsProps = {
  /** 当前步骤索引，从零开始；等于总数时表示全部完成。 */
  modelValue?: number
  /** 步骤的文字、说明、图标和禁用状态。 */
  options?: readonly StepOption[]
  /** 当前步骤的进行或失败状态。 */
  status?: 'process' | 'error'
  /** 步骤列表的辅助名称。 */
  label?: string
  /** 使用纵向布局。 */
  vertical?: boolean
  /** 允许点击或键盘切换，默认仅展示进度。 */
  interactive?: boolean
  /** 禁止交互模式下的所有步骤操作。 */
  disabled?: boolean
}

/** Steps 的组件事件，v-model 直接接收新的绑定值。 */
export type StepsEmits = {
  /** 交互模式下，点击或键盘切换当前步骤。 */
  'update:modelValue': [value: number]
}

/** Switch 的 Vue 属性，保留原有组件用法。 */
export type SwitchProps = {
  /** 开关的选中状态。 */
  modelValue: boolean
  /** 无可见标签时的辅助名称。 */
  label: string
  /** 禁止切换。 */
  disabled?: boolean
}

/** Switch 的组件事件，v-model 直接接收新的绑定值。 */
export type SwitchEmits = {
  /** 同步切换后的状态。 */
  'update:modelValue': [value: boolean]
}

/** Tabbar 的 Vue 属性，保留原有组件用法。 */
export type TabbarProps = {
  /** 当前选中的栏目，路由与页面缓存由应用管理。 */
  modelValue: string
  /** 底部栏目，支持文字、图标和禁用状态。 */
  options: Option[]
  /** 底部导航区域的辅助名称。 */
  label?: string
}

/** Tabbar 的组件事件，v-model 直接接收新的绑定值。 */
export type TabbarEmits = {
  /** 用户点击或用方向键切换后同步栏目。 */
  'update:modelValue': [value: string]
}

/** Tabs 的 Vue 属性，保留原有组件用法。 */
export type TabsProps = {
  /** 当前页签值，失效时显示首个可用页签。 */
  modelValue: string
  /** 页签选项，value 必须唯一。 */
  options: Option[]
  /** 页签分组的辅助名称。 */
  label: string
  /** 单指横向滑动切换内容，默认开启；竖向滚动与输入操作不受影响。 */
  swipeable?: boolean
}

/** Tabs 的组件事件，v-model 直接接收新的绑定值。 */
export type TabsEmits = {
  /** 同步点击、键盘或滑动选择的新页签。 */
  'update:modelValue': [value: string]
}

/** Tag 的 Vue 属性，保留原有组件用法。 */
export type TagProps = {
  /** 传入布尔值即可选中或取消；不传时作为展示标签。 */
  modelValue?: boolean
  /** 展示标签的颜色，选择状态统一使用主题色。 */
  tone?: 'blue' | 'green' | 'orange' | 'red' | 'gray'
  /** 禁止点击和切换。 */
  disabled?: boolean
}

/** Tag 的组件事件，v-model 直接接收新的绑定值。 */
export type TagEmits = {
  /** 同步单个标签的选中状态。 */
  'update:modelValue': [value: boolean]
  /** 可用状态下触发原生点击事件。 */
  click: [event: MouseEvent]
}

/** TagGroup 的 Vue 属性，保留原有组件用法。 */
export type TagGroupProps<T extends string | string[]> = {
  /** 字符串表示单选，字符串数组表示多选，无需额外模式属性。 */
  modelValue: T
  /** 标签项目，value 唯一，支持单项禁用。 */
  options: Option[]
  /** 标签组的辅助名称。 */
  label: string
  /** 禁止整组交互。 */
  disabled?: boolean
}

/** TagGroup 的组件事件，v-model 直接接收新的绑定值。 */
export type TagGroupEmits<T extends string | string[]> = {
  /** 同步单选值或多选数组，保持绑定值类型。 */
  'update:modelValue': [value: T]
}

/** Textarea 的 Vue 属性，保留原有组件用法。 */
export type TextareaProps = {
  /** 多行输入的文本值。 */
  modelValue: string
  /** 可见标签。 */
  label: string
  /** 原生控件标识，不传时自动生成。 */
  id?: string
  /** 输入占位说明。 */
  placeholder?: string
  /** 初始行数，限制在 1 至 12 行。 */
  rows?: number
  /** 原生输入长度上限，同时显示计数。 */
  maxlength?: number
  /** 禁止聚焦与编辑。 */
  disabled?: boolean
  /** 允许聚焦和复制，禁止编辑。 */
  readonly?: boolean
  /** 原生必填约束与可见标记。 */
  required?: boolean
  /** 校验错误。 */
  error?: string
  /** 没有错误时的补充说明。 */
  hint?: string
}

/** Textarea 的组件事件，v-model 直接接收新的绑定值。 */
export type TextareaEmits = {
  /** 同步新的文本值。 */
  'update:modelValue': [value: string]
}

/** TimePicker 的 Vue 属性，保留原有组件用法。 */
export type TimePickerProps = {
  /** 时间字符串 HH:mm；显示秒时使用 HH:mm:ss。 */
  modelValue?: string | null
  /** 最早可选时间，默认 00:00:00。 */
  min?: string
  /** 最晚可选时间，默认 23:59:59。 */
  max?: string
  /** 分钟间隔，1—60 的整数，从零开始，默认 1。 */
  minuteStep?: number
  /** 秒间隔，1—60 的整数，从零开始，默认 1。 */
  secondStep?: number
  /** 展示第三列秒数，默认关闭。 */
  showSeconds?: boolean
  /** 整组时间滚轮的辅助名称。 */
  label?: string
  /** 禁止拖动、滚轮与键盘调整。 */
  disabled?: boolean
}

/** TimePicker 的组件事件，v-model 直接接收新的绑定值。 */
export type TimePickerEmits = {
  /** 时分秒改变时同步合法时间。 */
  'update:modelValue': [value: string]
}

/** Toast 的 Vue 属性，保留原有组件用法。 */
export type ToastProps = {
  /** 单次轻提示的持续时间，单位毫秒。 */
  duration?: number
}

/** Toast 的组件事件，v-model 直接接收新的绑定值。 */
export type ToastEmits = {}

/** Tooltip 的 Vue 属性，保留原有组件用法。 */
export type TooltipProps = {
  /** 纯文字说明；需要排版时使用 content 插槽，不放置可交互内容。 */
  content?: string
  /** 首选方向，空间不足时沿用 Floating 的翻转与边界避让。 */
  placement?: FloatingPlacement
  /** 显示朝向触发元素的小箭头，跟随实际展示方向。 */
  arrow?: boolean
  /** 鼠标悬停显示的延迟毫秒数，不受窗口尺寸影响。 */
  delay?: number
  /** 鼠标离开触发器和提示后的隐藏延迟毫秒数。 */
  hideDelay?: number
  /** 触屏持续按压的触发时间，移动、滚动或多指操作会取消。 */
  longPressDelay?: number
  /** 允许移入提示选择、复制文字；默认不接收指针交互。 */
  copyable?: boolean
  /** 禁用提示，不改变内部按钮等触发元素的状态。 */
  disabled?: boolean
  /** 可选的受控显示状态，省略时由组件管理。 */
  modelValue?: boolean
}

/** Tooltip 的组件事件，v-model 直接接收新的绑定值。 */
export type TooltipEmits = {
  /** 显示、关闭或失效时同步提示状态。 */
  'update:modelValue': [value: boolean]
}

/** Upload 的 Vue 属性，保留原有组件用法。 */
export type UploadProps = {
  /** 文件列表，组件通过新数组同步状态，不修改传入记录。 */
  modelValue?: readonly UploadFile[]
  /** 整个文件区域的辅助名称。 */
  label?: string
  /** 扩展名、MIME 或 MIME 通配符，以逗号分隔。 */
  accept?: string
  /** 允许多个文件，默认只保留一个文件。 */
  multiple?: boolean
  /** 最大文件数量，多选时默认不限制，单选最多一个。 */
  maxCount?: number
  /** 单文件最大字节数，默认不限制。 */
  maxSize?: number
  /** 使用可点击、可拖入文件的面板。 */
  drag?: boolean
  /** 禁止添加和列表操作，已开始的上传继续运行。 */
  disabled?: boolean
  /** 提供 request 后自动上传；关闭后通过 ref.submit() 启动。 */
  autoUpload?: boolean
  /** 应用自己的上传函数，接收文件、取消信号和进度回调。 */
  request?: UploadRequest
  /** 展示在按钮旁或拖放区域中的说明。 */
  hint?: string
}

/** Upload 的组件事件，v-model 直接接收新的绑定值。 */
export type UploadEmits = {
  /** 添加、移除和上传状态改变时同步整个文件列表。 */
  'update:modelValue': [files: UploadFile[]]
  /** 一次选择中的所有拒绝记录。 */
  reject: [files: UploadRejection[]]
  /** 上传请求成功，返回结果保存在文件的 response 字段。 */
  success: [file: UploadFile]
  /** 上传请求失败，原因保存在文件的 error 字段。 */
  error: [file: UploadFile]
  /** 用户取消请求但保留文件。 */
  cancel: [file: UploadFile]
  /** 用户移除文件，请求同时中止。 */
  remove: [file: UploadFile]
}
