<script setup lang="ts">
import { useNative } from '../adapter'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
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
}>(), { delayTouchDown: 0, delayTouchUp: 100 })
const emit = defineEmits<{
  /** 导航行被激活时的原生点击事件。 */
  click: [event: MouseEvent]
  /** 同步开关模式的新状态。 */
  'update:modelValue': [value: boolean]
}>()
const bridge = useNative('ListRow', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
