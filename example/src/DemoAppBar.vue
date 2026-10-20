<script setup lang="ts">
import { computed, ref } from 'vue'
import { AppBar } from 'tauri-plugin-native-components/vue'
import ThemeSettings from './demo/ThemeSettings.vue'
import { useNativeBarsSuspended } from './native-components'

withDefaults(defineProps<{ title: string; back?: boolean; backLabel?: string }>(), { back: false, backLabel: '返回' })
const emit = defineEmits<{ back: [] }>()
const settings = ref<InstanceType<typeof ThemeSettings>>()
const bar = ref<InstanceType<typeof AppBar>>()
const actions = computed(() => settings.value?.actions ?? [])
const suspended = useNativeBarsSuspended()
/** Web 返回组件目录时恢复标题焦点。 */
defineExpose({ focus: () => bar.value?.focus() })
</script>

<template>
  <div class="demo-native-header">
    <AppBar ref="bar" :title="title" :back="back" :back-label="backLabel" :actions="actions" :suspended="suspended" @back="emit('back')" @action="settings?.handleAction($event)" @error="console.error" />
    <ThemeSettings ref="settings" :controls="false" />
  </div>
</template>
