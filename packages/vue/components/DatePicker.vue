<script setup lang="ts">
import { useNative } from '../adapter'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 日期字符串 YYYY-MM-DD；空值显示今天但不主动写回。 */
  modelValue?: string | null
  /** 最早可选日期，默认 1900-01-01。 */
  min?: string
  /** 最晚可选日期，默认 2100-12-31。 */
  max?: string
  /** 整组日期滚轮的辅助名称。 */
  label?: string
  /** 禁止拖动、滚轮与键盘调整。 */
  disabled?: boolean
}>(), { label: '选择日期', disabled: false })
const emit = defineEmits<{
  /** 年月日改变时同步合法日期，自动修正月底与上下限。 */
  'update:modelValue': [value: string]
}>()
const bridge = useNative('DatePicker', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
