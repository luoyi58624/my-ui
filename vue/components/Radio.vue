<script setup lang="ts">
import { useNative } from '../adapter'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
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
}>()
const emit = defineEmits<{
  /** 独立使用时同步选中的字符串值。 */
  'update:modelValue': [value: string]
}>()
const bridge = useNative('Radio', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
