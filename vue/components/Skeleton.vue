<script setup lang="ts">
import { useNative } from '../adapter'


defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 为 true 时显示占位，为 false 时显示默认内容。 */
  loading?: boolean
  /** 占位正文行数，限制在 1 至 10 行。 */
  rows?: number
  /** 显示头像占位。 */
  avatar?: boolean
  /** 加载时的辅助说明。 */
  label?: string
}>(), { loading: true, rows: 3, label: '内容加载中' })
const emit = defineEmits<{}>()
const bridge = useNative('Skeleton', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
