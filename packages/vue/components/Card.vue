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
  delayTouchActive?: number
}>(), { delayTouchActive: 0 })
const emit = defineEmits<{
  /** 整张交互卡片被点击或键盘激活，内部控件独立操作。 */
  activate: [event: MouseEvent | KeyboardEvent]
}>()
const bridge = useNative('Card', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
