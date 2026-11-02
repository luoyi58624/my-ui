import type { PickerValue } from '../../lib/my-ui'
import { createComponent, type NativeExposed } from './adapter'
import type * as Types from './types'

/** AppBar 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const AppBar = createComponent<Types.AppBarProps, Types.AppBarEmits>('AppBar', {
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  back: { type: Boolean, default: false },
  backLabel: { type: String, default: '返回' },
  center: { type: Boolean, default: true },
  sticky: { type: Boolean, default: false },
}, ["back"])

/** Avatar 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Avatar = createComponent<Types.AvatarProps, Types.AvatarEmits>('Avatar', {
  src: String,
  alt: { type: String, default: '' },
  text: String,
  size: { type: [Number, String], default: 40 },
  shape: { type: String, default: 'circle' },
}, ["load", "error"])

/** Badge 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Badge = createComponent<Types.BadgeProps, Types.BadgeEmits>('Badge', {
  value: [Number, String],
  max: { type: Number, default: 99 },
  dot: { type: Boolean, default: false },
  showZero: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
  label: String,
}, [])

/** Button 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Button = createComponent<Types.ButtonProps, Types.ButtonEmits>('Button', {
  variant: { type: String, default: 'primary' },
  icon: String,
  disabled: Boolean,
  loading: Boolean,
  selected: { type: Boolean, default: undefined },
  delayTouchDown: { type: Number, default: 0 },
  delayTouchUp: { type: Number, default: 100 },
  type: { type: String, default: 'button' },
}, ["click"])

/** Calendar 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Calendar = createComponent<Types.CalendarProps<string | readonly string[] | null>, Types.CalendarEmits<string | readonly string[] | null>>('Calendar', {
  modelValue: null,
  range: { type: Boolean, default: false },
  month: String,
  min: String,
  max: String,
  disabledDate: Function,
  firstDayOfWeek: { type: Number, default: 1 },
  label: { type: String, default: '日历' },
  disabled: { type: Boolean, default: false },
}, ["update:modelValue", "select", "month-change"]) as unknown as <T extends string | readonly string[] | null = string | string[] | null>(props: Types.ComponentProps<Types.CalendarProps<T>, Types.CalendarEmits<T>>) => Types.ComponentVNode<Types.CalendarProps<T>, Types.CalendarEmits<T>>

/** Card 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Card = createComponent<Types.CardProps, Types.CardEmits>('Card', {
  title: String,
  description: String,
  sample: String,
  interactive: Boolean,
  delayTouchDown: { type: Number, default: 0 },
  delayTouchUp: { type: Number, default: 100 },
}, ["activate"])

/** CellGroup 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const CellGroup = createComponent<Types.CellGroupProps, Types.CellGroupEmits>('CellGroup', {
  title: String,
  description: String,
  mode: { type: String, default: 'normal' },
  modelValue: [String, Array],
  options: Array,
  label: String,
  disabled: Boolean,
}, ["update:modelValue", "select"])

/** Checkbox 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Checkbox = createComponent<Types.CheckboxProps, Types.CheckboxEmits>('Checkbox', {
  modelValue: Boolean,
  value: String,
  label: String,
  description: String,
  indeterminate: Boolean,
  disabled: Boolean,
  name: String,
}, ["update:modelValue", "update:indeterminate"])

/** CheckboxGroup 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const CheckboxGroup = createComponent<Types.CheckboxGroupProps, Types.CheckboxGroupEmits>('CheckboxGroup', {
  modelValue: { type: Array, required: true },
  label: { type: String, required: true },
  options: Array,
  disabled: Boolean,
  inline: Boolean,
  name: String,
}, ["update:modelValue"])

/** Choices 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Choices = createComponent<Types.ChoicesProps, Types.ChoicesEmits>('Choices', {
  modelValue: { type: [String, Array], required: true },
  label: { type: String, required: true },
  options: { type: Array, required: true },
  type: { type: String, default: 'radio' },
  list: Boolean,
  disabled: Boolean,
}, ["update:modelValue"])

/** Collapse 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Collapse = createComponent<Types.CollapseProps<string | string[]>, Types.CollapseEmits<string | string[]>>('Collapse', {
  modelValue: { type: null, required: true },
  disabled: Boolean,
  label: String,
}, ["update:modelValue"]) as unknown as <T extends string | string[]>(props: Types.ComponentProps<Types.CollapseProps<T>, Types.CollapseEmits<T>>) => Types.ComponentVNode<Types.CollapseProps<T>, Types.CollapseEmits<T>>

/** CollapseItem 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const CollapseItem = createComponent<Types.CollapseItemProps, Types.CollapseItemEmits>('CollapseItem', {
  value: { type: String, required: true },
  title: String,
  disabled: Boolean,
}, [])

/** Combobox 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Combobox = createComponent<Types.ComboboxProps, Types.ComboboxEmits>('Combobox', {
  modelValue: { type: String, required: true },
  options: { type: Array, required: true },
  label: { type: String, required: true },
  id: String,
  name: String,
  placeholder: { type: String, default: '搜索或选择…' },
  clearable: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  filter: { type: [Boolean, Function], default: undefined },
  emptyText: { type: String, default: '没有匹配的选项' },
  required: Boolean,
  error: String,
  hint: String,
}, ["update:modelValue", "search", "select"])

/** DatePicker 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const DatePicker = createComponent<Types.DatePickerProps, Types.DatePickerEmits>('DatePicker', {
  modelValue: [String, null],
  min: String,
  max: String,
  label: { type: String, default: '选择日期' },
  disabled: { type: Boolean, default: false },
}, ["update:modelValue"])

/** Dialog 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Dialog = createComponent<Types.DialogProps, Types.DialogEmits>('Dialog', {
  modelValue: { type: Boolean, required: true },
  title: { type: String, required: true },
  description: String,
  icon: { type: [String, Boolean], default: 'shield' },
  cancelText: { type: [String, Boolean], default: '取消' },
  confirmText: { type: String, default: '确认保存' },
  center: { type: Boolean, default: true },
  danger: Boolean,
  closeOnBackdrop: { type: Boolean, default: true },
  closeOnEscape: { type: Boolean, default: true },
}, ["update:modelValue", "confirm", "cancel", "after-leave"])

/** Divider 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Divider = createComponent<Types.DividerProps, Types.DividerEmits>('Divider', {
  vertical: Boolean,
  align: { type: String, default: 'center' },
  dashed: Boolean,
}, [])

/** Drawer 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Drawer = createComponent<Types.DrawerProps, Types.DrawerEmits>('Drawer', {
  modelValue: { type: Boolean, required: true },
  title: { type: String, required: true },
  placement: { type: String, default: 'right' },
  swipeable: { type: Boolean, default: true },
  closeOnBackdrop: { type: Boolean, default: true },
  closeOnEscape: { type: Boolean, default: true },
}, ["update:modelValue", "close", "after-leave"])

/** Empty 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Empty = createComponent<Types.EmptyProps, Types.EmptyEmits>('Empty', {
  state: { type: String, default: 'empty' },
  title: String,
  description: String,
  icon: String,
}, [])

/** Floating 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Floating = createComponent<Types.FloatingProps, Types.FloatingEmits>('Floating', {
  modelValue: { type: Boolean, required: true },
  anchor: null,
  placement: { type: null, default: 'bottom-start' },
  matchWidth: Boolean,
  motion: { type: String, default: 'expand' },
}, ["update:modelValue", "positioned", "after-leave"])

/** Form 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Form = createComponent<Types.FormProps, Types.FormEmits>('Form', {
  layout: { type: String, default: 'vertical' },
}, [])

/** FormField 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const FormField = createComponent<Types.FormFieldProps, Types.FormFieldEmits>('FormField', {
  label: { type: String, required: true },
  id: String,
  required: Boolean,
  error: String,
  hint: String,
  group: Boolean,
}, [])

/** Icon 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Icon = createComponent<Types.IconProps, Types.IconEmits>('Icon', {
  name: { type: String, required: true },
}, [])

/** Image 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Image = createComponent<Types.ImageProps, Types.ImageEmits, NativeExposed, Types.ImageSlots>('Image', {
  src: String,
  alt: { type: String, default: '' },
  width: [Number, String],
  height: [Number, String],
  ratio: [Number, String],
  fit: { type: String, default: 'cover' },
  loading: { type: String, default: 'lazy' },
}, ["load", "error"])

/** ImagePreview 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const ImagePreview = createComponent<Types.ImagePreviewProps, Types.ImagePreviewEmits>('ImagePreview', {
  modelValue: { type: Boolean, required: true },
  images: { type: Array, required: true },
  startIndex: { type: Number, default: 0 },
  title: { type: String, default: '图片预览' },
  maxZoom: { type: Number, default: 4 },
  closeOnEscape: { type: Boolean, default: true },
}, ["update:modelValue", "index-change", "close", "after-leave"])

/** Input 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Input = createComponent<Types.InputProps, Types.InputEmits>('Input', {
  modelValue: { type: String, required: true },
  label: { type: String, required: true },
  id: String,
  type: { type: String, default: 'text' },
  passwordToggle: Boolean,
  placeholder: { type: String, default: '' },
  icon: String,
  clearable: Boolean,
  maxlength: Number,
  disabled: Boolean,
  readonly: Boolean,
  required: Boolean,
  error: String,
  hint: String,
  autocomplete: { type: String, default: 'off' },
}, ["update:modelValue"])

/** ListRow 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const ListRow = createComponent<Types.ListRowProps, Types.ListRowEmits>('ListRow', {
  title: { type: String, required: true },
  description: String,
  value: String,
  toggle: Boolean,
  modelValue: Boolean,
  disabled: Boolean,
  delayTouchDown: { type: Number, default: 0 },
  delayTouchUp: { type: Number, default: 100 },
}, ["click", "update:modelValue"])

/** Loading 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Loading = createComponent<Types.LoadingProps, Types.LoadingEmits>('Loading', {
  size: { type: String, default: 'medium' },
  label: { type: String, default: '加载中' },
}, [])

/** Menu 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Menu = createComponent<Types.MenuProps, Types.MenuEmits>('Menu', {
  options: { type: Array, required: true },
  label: { type: String, default: '菜单' },
  modelValue: [String, Array],
  mode: { type: String, default: 'normal' },
  open: { type: Boolean, default: undefined },
  trigger: { type: String, default: 'click' },
  anchor: { type: String, default: 'pointer' },
  placement: { type: null, default: 'bottom-start' },
  matchWidth: Boolean,
  motion: String,
  disabled: Boolean,
  closeOnSelect: { type: Boolean, default: undefined },
  hoverDelay: { type: Number, default: 200 },
}, ["update:modelValue", "update:open", "select"])

/** Navigation 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Navigation = createComponent<Types.NavigationProps, Types.NavigationEmits>('Navigation', {
  modelValue: { type: String, required: true },
  options: { type: Array, required: true },
  label: String,
}, ["update:modelValue"])

/** Notice 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Notice = createComponent<Types.NoticeProps, Types.NoticeEmits>('Notice', {
  modelValue: { type: Boolean, default: true },
  type: { type: String, default: 'info' },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  closable: { type: Boolean, default: false },
  icon: { type: [String, Boolean], default: undefined },
}, ["update:modelValue", "close"])

/** Picker 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Picker = createComponent<Types.PickerProps<PickerValue | readonly PickerValue[]>, Types.PickerEmits<PickerValue | readonly PickerValue[]>>('Picker', {
  modelValue: null,
  options: { type: Array, default: () => [] },
  columns: Array,
  label: { type: String, default: '选择' },
  columnLabels: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
}, ["update:modelValue"]) as unknown as <T extends PickerValue | readonly PickerValue[] = PickerValue | PickerValue[]>(props: Types.ComponentProps<Types.PickerProps<T>, Types.PickerEmits<T>>) => Types.ComponentVNode<Types.PickerProps<T>, Types.PickerEmits<T>>

/** Popover 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Popover = createComponent<Types.PopoverProps, Types.PopoverEmits>('Popover', {
  modelValue: { type: String, required: true },
  label: { type: String, required: true },
  options: { type: Array, required: true },
}, ["update:modelValue"])

/** Popup 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Popup = createComponent<Types.PopupProps, Types.PopupEmits>('Popup', {}, [])

/** Progress 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Progress = createComponent<Types.ProgressProps, Types.ProgressEmits>('Progress', {
  value: Number,
  buffer: Number,
  max: { type: Number, default: 100 },
  type: { type: String, default: 'line' },
  status: { type: String, default: 'normal' },
  label: { type: String, default: '进度' },
  showText: { type: Boolean, default: true },
}, [])

/** PullRefresh 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const PullRefresh = createComponent<Types.PullRefreshProps, Types.PullRefreshEmits, Pick<NativeExposed, 'refresh'>>('PullRefresh', {
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: '下拉刷新' },
}, ["update:modelValue", "refresh"])

/** Radio 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Radio = createComponent<Types.RadioProps, Types.RadioEmits>('Radio', {
  modelValue: String,
  value: { type: String, required: true },
  label: String,
  description: String,
  disabled: Boolean,
  name: String,
}, ["update:modelValue"])

/** RadioGroup 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const RadioGroup = createComponent<Types.RadioGroupProps, Types.RadioGroupEmits>('RadioGroup', {
  modelValue: { type: String, required: true },
  label: { type: String, required: true },
  options: Array,
  disabled: Boolean,
  inline: Boolean,
  name: String,
}, ["update:modelValue"])

/** Segmented 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Segmented = createComponent<Types.SegmentedProps, Types.SegmentedEmits>('Segmented', {
  modelValue: { type: String, required: true },
  options: { type: Array, required: true },
  label: { type: String, required: true },
}, ["update:modelValue"])

/** Select 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Select = createComponent<Types.SelectProps, Types.SelectEmits>('Select', {
  modelValue: { type: String, required: true },
  label: { type: String, required: true },
  options: { type: Array, required: true },
  disabled: Boolean,
}, ["update:modelValue"])

/** Sheet 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Sheet = createComponent<Types.SheetProps, Types.SheetEmits>('Sheet', {
  modelValue: { type: Boolean, required: true },
  title: { type: String, required: true },
  actions: { type: Array, default: () => [] },
  cancelText: { type: [String, Boolean], default: '取消' },
  confirmText: String,
  danger: Boolean,
  swipeable: { type: Boolean, default: true },
  closeOnBackdrop: { type: Boolean, default: true },
  closeOnEscape: { type: Boolean, default: true },
}, ["update:modelValue", "select", "cancel", "confirm", "after-leave"])

/** Skeleton 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Skeleton = createComponent<Types.SkeletonProps, Types.SkeletonEmits>('Skeleton', {
  loading: { type: Boolean, default: true },
  rows: { type: Number, default: 3 },
  avatar: Boolean,
  label: { type: String, default: '内容加载中' },
}, [])

/** Slider 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Slider = createComponent<Types.SliderProps<number | number[]>, Types.SliderEmits<number | number[]>>('Slider', {
  modelValue: { type: null, required: true },
  buffer: Number,
  label: { type: String, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: [Number, null], default: 1 },
  marks: { type: [Boolean, Array], default: false },
  valueLabelDisplay: { type: String, default: 'auto' },
  valueLabelFormat: Function,
  getAriaValueText: Function,
  disabled: Boolean,
  unit: { type: String, default: '%' },
  startLabel: { type: String, default: '柔和' },
  endLabel: { type: String, default: '鲜明' },
}, ["update:modelValue"]) as unknown as <T extends number | number[]>(props: Types.ComponentProps<Types.SliderProps<T>, Types.SliderEmits<T>>) => Types.ComponentVNode<Types.SliderProps<T>, Types.SliderEmits<T>>

/** Stepper 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Stepper = createComponent<Types.StepperProps, Types.StepperEmits>('Stepper', {
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 99 },
  step: { type: Number, default: 1 },
  label: { type: String, default: '数量' },
}, ["update:modelValue"])

/** Steps 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Steps = createComponent<Types.StepsProps, Types.StepsEmits>('Steps', {
  modelValue: { type: Number, default: 0 },
  options: { type: Array, default: () => [] },
  status: { type: String, default: 'process' },
  label: { type: String, default: '步骤' },
  vertical: { type: Boolean, default: false },
  interactive: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
}, ["update:modelValue"])

/** Switch 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Switch = createComponent<Types.SwitchProps, Types.SwitchEmits>('Switch', {
  modelValue: { type: Boolean, required: true },
  label: { type: String, required: true },
  disabled: Boolean,
}, ["update:modelValue"])

/** Tabbar 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Tabbar = createComponent<Types.TabbarProps, Types.TabbarEmits>('Tabbar', {
  modelValue: { type: String, required: true },
  options: { type: Array, required: true },
  label: { type: String, default: '主导航' },
}, ["update:modelValue"])

/** Tabs 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Tabs = createComponent<Types.TabsProps, Types.TabsEmits>('Tabs', {
  modelValue: { type: String, required: true },
  options: { type: Array, required: true },
  label: { type: String, required: true },
  swipeable: { type: Boolean, default: true },
}, ["update:modelValue"])

/** Tag 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Tag = createComponent<Types.TagProps, Types.TagEmits>('Tag', {
  modelValue: { type: Boolean, default: undefined },
  tone: { type: String, default: 'blue' },
  disabled: Boolean,
}, ["update:modelValue", "click"])

/** TagGroup 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const TagGroup = createComponent<Types.TagGroupProps<string | string[]>, Types.TagGroupEmits<string | string[]>>('TagGroup', {
  modelValue: { type: null, required: true },
  options: { type: Array, required: true },
  label: { type: String, required: true },
  disabled: Boolean,
}, ["update:modelValue"]) as unknown as <T extends string | string[]>(props: Types.ComponentProps<Types.TagGroupProps<T>, Types.TagGroupEmits<T>>) => Types.ComponentVNode<Types.TagGroupProps<T>, Types.TagGroupEmits<T>>

/** Textarea 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Textarea = createComponent<Types.TextareaProps, Types.TextareaEmits>('Textarea', {
  modelValue: { type: String, required: true },
  label: { type: String, required: true },
  id: String,
  placeholder: { type: String, default: '' },
  rows: { type: Number, default: 3 },
  maxlength: Number,
  disabled: Boolean,
  readonly: Boolean,
  required: Boolean,
  error: String,
  hint: String,
}, ["update:modelValue"])

/** TimePicker 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const TimePicker = createComponent<Types.TimePickerProps, Types.TimePickerEmits>('TimePicker', {
  modelValue: [String, null],
  min: String,
  max: String,
  minuteStep: { type: Number, default: 1 },
  secondStep: { type: Number, default: 1 },
  showSeconds: { type: Boolean, default: false },
  label: { type: String, default: '选择时间' },
  disabled: { type: Boolean, default: false },
}, ["update:modelValue"])

/** Toast 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Toast = createComponent<Types.ToastProps, Types.ToastEmits>('Toast', {
  duration: { type: Number, default: 2600 },
}, [])

/** Tooltip 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Tooltip = createComponent<Types.TooltipProps, Types.TooltipEmits>('Tooltip', {
  content: { type: String, default: '' },
  placement: { type: null, default: 'top' },
  arrow: { type: Boolean, default: true },
  delay: { type: Number, default: 200 },
  hideDelay: { type: Number, default: 100 },
  longPressDelay: { type: Number, default: 500 },
  copyable: { type: Boolean, default: false },
  disabled: Boolean,
  modelValue: { type: Boolean, default: undefined },
}, ["update:modelValue"])

/** Upload 的 Vue 薄封装，结构与交互由原生核心维护。 */
export const Upload = createComponent<Types.UploadProps, Types.UploadEmits>('Upload', {
  modelValue: { type: Array, default: () => [] },
  label: { type: String, default: '上传文件' },
  accept: { type: String, default: '' },
  multiple: { type: Boolean, default: false },
  maxCount: Number,
  maxSize: Number,
  drag: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  autoUpload: { type: Boolean, default: true },
  request: Function,
  hint: { type: String, default: '' },
}, ["update:modelValue", "reject", "success", "error", "cancel", "remove"])
