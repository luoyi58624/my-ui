<script setup lang="ts" generic="T extends PickerValue | readonly PickerValue[] = PickerValue | PickerValue[]">
import { useNative } from '../adapter'
import type { PickerOption, PickerValue } from './pickerTypes'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 单列用单值，多列和级联用数组；空列用 null 占位。 */
  modelValue?: T
  /** 单列或带 children 的级联选项。 */
  options?: readonly PickerOption[]
  /** 独立多列选项，设置后优先于 options。 */
  columns?: readonly (readonly PickerOption[])[]
  /** 整组滚轮的辅助名称。 */
  label?: string
  /** 每列的可见标题，也作为该列的辅助名称。 */
  columnLabels?: readonly string[]
  /** 禁止所有列的拖动、滚轮与键盘调整。 */
  disabled?: boolean
}>(), { options: () => [], label: '选择', columnLabels: () => [], disabled: false })
const emit = defineEmits<{
  /** 中间选项改变时同步值，父列改变时一并修正失效的子列。 */
  'update:modelValue': [value: T]
}>()
const bridge = useNative('Picker', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
