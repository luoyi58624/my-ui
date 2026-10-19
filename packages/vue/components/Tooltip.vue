<script setup lang="ts">
import { useNative } from '../adapter'
import type { FloatingPlacement } from './floatingTypes'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
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
}>(), { content: '', placement: 'top', arrow: true, delay: 200, hideDelay: 100, longPressDelay: 500, copyable: false, modelValue: undefined })
const emit = defineEmits<{
  /** 显示、关闭或失效时同步提示状态。 */
  'update:modelValue': [value: boolean]
}>()
const bridge = useNative('Tooltip', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
