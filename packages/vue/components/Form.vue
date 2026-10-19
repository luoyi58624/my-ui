<script setup lang="ts">
import { useNative } from '../adapter'
import type { FormLayout } from './formContext'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 垂直、标签在左的水平布局，或自动换行的行内布局。 */
  layout?: FormLayout
}>(), { layout: 'vertical' })
const emit = defineEmits<{}>()
const bridge = useNative('Form', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
