<script setup lang="ts">
import { useNative } from '../adapter'
import type { Option } from './types'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  /** 当前菜单选项，保留原有单选调用方式。 */
  modelValue: string
  /** 菜单名称。 */
  label: string
  /** 菜单选项。 */
  options: Option[]
}>()
const emit = defineEmits<{
  /** 在窗口收起后同步新选项。 */
  'update:modelValue': [value: string]
}>()
const bridge = useNative('Popover', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
