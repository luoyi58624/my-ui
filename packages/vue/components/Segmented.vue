<script setup lang="ts">
import { useNative } from '../adapter'
import type { Option } from './types'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  /** 当前选中值。 */
  modelValue: string
  /** 分段选项，可使用任意数量的选项。 */
  options: Option[]
  /** 分段控件的分组名称。 */
  label: string
}>()
const emit = defineEmits<{
  /** 同步新选项值。 */
  'update:modelValue': [value: string]
}>()
const bridge = useNative('Segmented', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
