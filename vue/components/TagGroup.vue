<script setup lang="ts" generic="T extends string | string[]">
import { useNative } from '../adapter'
import type { Option } from './types'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  /** 字符串表示单选，字符串数组表示多选，无需额外模式属性。 */
  modelValue: T
  /** 标签项目，value 唯一，支持单项禁用。 */
  options: Option[]
  /** 标签组的辅助名称。 */
  label: string
  /** 禁止整组交互。 */
  disabled?: boolean
}>()
const emit = defineEmits<{
  /** 同步单选值或多选数组，保持绑定值类型。 */
  'update:modelValue': [value: T]
}>()
const bridge = useNative('TagGroup', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
