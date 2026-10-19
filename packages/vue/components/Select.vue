<script setup lang="ts">
import { useNative } from '../adapter'
import type { Option } from './types'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  /** 当前选择的选项值。 */
  modelValue: string
  /** 可见标签与辅助名称。 */
  label: string
  /** 下拉选项。 */
  options: Option[]
  /** 禁止打开下拉。 */
  disabled?: boolean
}>()
const emit = defineEmits<{
  /** 同步新的选项值。 */
  'update:modelValue': [value: string]
}>()
const bridge = useNative('Select', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
