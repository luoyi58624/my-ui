<script setup lang="ts">
import { useNative } from '../adapter'
import type { Option } from './types'
import type { ListMode } from '../types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 分组标题。 */
  title?: string
  /** 分组补充说明。 */
  description?: string
  /** 普通、单选、多选三种模式，默认 normal。 */
  mode?: ListMode
  /** 选择模式绑定字符串或字符串数组，普通模式无需绑定。 */
  modelValue?: string | string[]
  /** 数据列表；省略时继续使用默认插槽组合列表行。 */
  options?: Option[]
  /** 没有可见标题时提供分组的可访问名称。 */
  label?: string
  /** 禁止整组选择。 */
  disabled?: boolean
}>(), { mode: 'normal' })
const emit = defineEmits<{
  /** 同步单选值或多选数组。 */
  'update:modelValue': [value: string | string[]]
  /** 用户激活可用条目后返回选项，普通模式也可用。 */
  select: [item: Option]
}>()
const bridge = useNative('CellGroup', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
