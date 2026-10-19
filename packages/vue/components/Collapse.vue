<script setup lang="ts" generic="T extends string | string[]">
import { useNative } from '../adapter'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  /** 字符串为手风琴，数组允许多项展开；空字符串或空数组全部收起。 */
  modelValue: T
  /** 禁止整组标题交互，不主动改变展开状态。 */
  disabled?: boolean
  /** 可选的分组辅助名称。 */
  label?: string
}>()
const emit = defineEmits<{ /** 同步展开值，保留字符串或数组类型。 */ 'update:modelValue': [value: T] }>()
const bridge = useNative('Collapse', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
