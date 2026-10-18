<script setup lang="ts">
import { useNative } from '../adapter'


defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 当前数量。 */
  modelValue: number
  /** 最小数量。 */
  min?: number
  /** 最大数量。 */
  max?: number
  /** 增减步长。 */
  step?: number
  /** 辅助名称。 */
  label?: string
}>(), { min: 0, max: 99, step: 1, label: '数量' })
const emit = defineEmits<{
  /** 提交有效、已限制范围的数值。 */
  'update:modelValue': [value: number]
}>()
const bridge = useNative('Stepper', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
