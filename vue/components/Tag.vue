<script setup lang="ts">
import { useNative } from '../adapter'


defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 传入布尔值即可选中或取消；不传时作为展示标签。 */
  modelValue?: boolean
  /** 展示标签的颜色，选择状态统一使用主题色。 */
  tone?: 'blue' | 'green' | 'orange' | 'red' | 'gray'
  /** 禁止点击和切换。 */
  disabled?: boolean
}>(), { tone: 'blue', modelValue: undefined })
const emit = defineEmits<{
  /** 同步单个标签的选中状态。 */
  'update:modelValue': [value: boolean]
  /** 可用状态下触发原生点击事件。 */
  click: [event: MouseEvent]
}>()
const bridge = useNative('Tag', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
