<script setup lang="ts">
import { useNative } from '../adapter'


defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 单次轻提示的持续时间，单位毫秒。 */
  duration?: number
}>(), { duration: 2600 })
const emit = defineEmits<{}>()
const bridge = useNative('Toast', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
