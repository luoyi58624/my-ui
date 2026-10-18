<script setup lang="ts">
import { useNative } from '../adapter'


defineOptions({ inheritAttrs: false })
const props = defineProps<{
  /** 开关的选中状态。 */
  modelValue: boolean
  /** 无可见标签时的辅助名称。 */
  label: string
  /** 禁止切换。 */
  disabled?: boolean
}>()
const emit = defineEmits<{
  /** 同步切换后的状态。 */
  'update:modelValue': [value: boolean]
}>()
const bridge = useNative('Switch', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
