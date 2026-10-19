<script setup lang="ts">
import { useNative } from '../adapter'
import type { Option } from './types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 单选传字符串，复选传字符串数组。 */
  modelValue: string | string[]
  /** 分组名称，外部 aria-labelledby 存在时不重复显示。 */
  label: string
  /** 可选择的项目。 */
  options: Option[]
  /** 单选或复选模式。 */
  type?: 'radio' | 'checkbox'
  /** 使用带说明的整行列表样式。 */
  list?: boolean
  /** 禁止整组交互。 */
  disabled?: boolean
}>(), { type: 'radio' })
const emit = defineEmits<{
  /** 同步单选值或复选数组。 */
  'update:modelValue': [value: string | string[]]
}>()
const bridge = useNative('Choices', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
