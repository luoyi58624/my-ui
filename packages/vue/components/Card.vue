<script setup lang="ts">
import { useNative } from '../adapter'


defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
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
}>(), { delayTouchDown: 0, delayTouchUp: 100 })
const emit = defineEmits<{
  /** 整张交互卡片被点击或键盘激活，内部控件独立操作。 */
  activate: [event: MouseEvent | KeyboardEvent]
}>()
const bridge = useNative('Card', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
