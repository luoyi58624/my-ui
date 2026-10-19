<script setup lang="ts">
import { useNative } from '../adapter'
import type { IconName } from './icons'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 空内容或加载错误状态。 */
  state?: 'empty' | 'error'
  /** 状态标题，不传时按状态生成。 */
  title?: string
  /** 补充说明。 */
  description?: string
  /** 自定义状态图标。 */
  icon?: IconName
}>(), { state: 'empty' })
const emit = defineEmits<{}>()
const bridge = useNative('Empty', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
