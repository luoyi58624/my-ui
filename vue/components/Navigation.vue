<script setup lang="ts">
import { useNative } from '../adapter'
import type { Option } from './types'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  /** 当前选中的导航项。 */
  modelValue: string
  /** 导航选项与图标。 */
  options: Option[]
  /** 导航区域的辅助名称。 */
  label?: string
}>()
const emit = defineEmits<{
  /** 同步点击后的导航项。 */
  'update:modelValue': [value: string]
}>()
const bridge = useNative('Navigation', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
