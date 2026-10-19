<script setup lang="ts">
import { useNative } from '../adapter'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 改为行内竖向分割线，高度可通过 --divider-height 覆写。 */
  vertical?: boolean
  /** 带文字时的对齐位置。 */
  align?: 'start' | 'center' | 'end'
  /** 使用虚线，保留与实线一致的边框厚度。 */
  dashed?: boolean
}>(), { align: 'center' })
const emit = defineEmits<{}>()
const bridge = useNative('Divider', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
