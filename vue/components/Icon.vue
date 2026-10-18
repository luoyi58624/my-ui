<script setup lang="ts">
import { useNative } from '../adapter'
import type { IconName } from './icons'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  /** 使用原稿中的线性图标。 */
  name: IconName
}>()
const emit = defineEmits<{}>()
const bridge = useNative('Icon', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
