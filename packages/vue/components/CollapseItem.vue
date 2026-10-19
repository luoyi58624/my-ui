<script setup lang="ts">
import { useNative } from '../adapter'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  /** 在所属 Collapse 内唯一且非空的条目标识。 */
  value: string
  /** 标题文字，也可以使用 title 插槽。 */
  title?: string
  /** 禁止此标题切换和键盘导航，不主动收起内容。 */
  disabled?: boolean
}>()
const emit = defineEmits<{}>()
const bridge = useNative('CollapseItem', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
