<script setup lang="ts">
import { useNative } from '../adapter'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 加载图标尺寸，嵌入按钮时使用 small。 */
  size?: 'small' | 'medium' | 'large'
  /** 没有可见文字时的辅助名称。 */
  label?: string
}>(), { size: 'medium', label: '加载中' })
const emit = defineEmits<{}>()
const bridge = useNative('Loading', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
