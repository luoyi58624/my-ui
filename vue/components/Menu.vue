<script setup lang="ts">
import { useNative } from '../adapter'
import type { FloatingPlacement } from './floatingTypes'
import type { MenuOption } from './types'
import type { ListMode } from '../types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
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
}>(), { label: '菜单', mode: 'normal', trigger: 'click', anchor: 'pointer', placement: 'bottom-start', open: undefined, closeOnSelect: undefined, hoverDelay: 200 })
const emit = defineEmits<{
  /** 同步单选值或多选数组。 */
  'update:modelValue': [value: string | string[]]
  /** 同步展开状态，可使用 v-model:open。 */
  'update:open': [value: boolean]
  /** 默认在关闭交互后返回选项，整组同时淡出；多选保持展开。 */
  select: [item: MenuOption]
}>()
const bridge = useNative('Menu', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
