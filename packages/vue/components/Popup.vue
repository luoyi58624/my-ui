<script setup lang="ts">
import { useNative } from '../adapter'
import { installPopupContext } from '../popup'

defineOptions({ inheritAttrs: false })
const props = defineProps<{}>()
const emit = defineEmits<{}>()
installPopupContext()
const bridge = useNative('Popup', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
