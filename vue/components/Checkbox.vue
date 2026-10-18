<script setup lang="ts">
import { useNative } from '../adapter'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
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
}>()
const emit = defineEmits<{
  /** 独立使用时同步布尔值。 */
  'update:modelValue': [value: boolean]
  /** 用户选择后清除半选状态。 */
  'update:indeterminate': [value: boolean]
}>()
const bridge = useNative('Checkbox', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
