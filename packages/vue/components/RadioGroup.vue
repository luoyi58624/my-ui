<script setup lang="ts">
import { useNative } from '../adapter'
import type { Option } from './types'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  /** 当前选项值。 */
  modelValue: string
  /** 可见的分组名称，外部 aria-labelledby 存在时不重复显示。 */
  label: string
  /** 简单场景直接传选项，默认插槽可自由组合 Radio。 */
  options?: Option[]
  /** 禁止整组交互。 */
  disabled?: boolean
  /** 水平排列，空间不足时自动换行。 */
  inline?: boolean
  /** 原生表单名称，不传时生成独立名称。 */
  name?: string
}>()
const emit = defineEmits<{ /** 同步选中的字符串值。 */ 'update:modelValue': [value: string] }>()
const bridge = useNative('RadioGroup', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
