<script setup lang="ts">
import { useNative } from '../adapter'
import type { StepOption } from './types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 当前步骤索引，从零开始；等于总数时表示全部完成。 */
  modelValue?: number
  /** 步骤的文字、说明、图标和禁用状态。 */
  options?: readonly StepOption[]
  /** 当前步骤的进行或失败状态。 */
  status?: 'process' | 'error'
  /** 步骤列表的辅助名称。 */
  label?: string
  /** 使用纵向布局。 */
  vertical?: boolean
  /** 允许点击或键盘切换，默认仅展示进度。 */
  interactive?: boolean
  /** 禁止交互模式下的所有步骤操作。 */
  disabled?: boolean
}>(), { modelValue: 0, options: () => [], status: 'process', label: '步骤', vertical: false, interactive: false, disabled: false })
const emit = defineEmits<{
  /** 交互模式下，点击或键盘切换当前步骤。 */
  'update:modelValue': [value: number]
}>()
const bridge = useNative('Steps', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
