<script setup lang="ts">
import { ref } from 'vue'
import { AppBar } from '@my-ui/vue'
import ThemeSettings from './ThemeSettings.vue'

withDefaults(defineProps<{
  /** 当前页面标题。 */
  title: string
  /** 标题的辅助说明。 */
  subtitle?: string
  /** 显示返回按钮。 */
  back?: boolean
  /** 返回按钮的辅助名称。 */
  backLabel?: string
  /** 标题是否居中。 */
  center?: boolean
  /** 显示主题设置入口。 */
  settings?: boolean
}>(), { back: false, backLabel: '返回', center: true, settings: false })
const emit = defineEmits<{
  /** 将返回操作交给当前页面。 */
  back: []
}>()
const root = ref<HTMLElement>()
/** 返回目录时恢复标题焦点。 */
defineExpose({ focus: () => root.value?.querySelector<HTMLElement>('[data-demo-title]')?.focus({ preventScroll: true }) })
</script>

<template>
  <header ref="root" class="demo-header">
    <AppBar :title="title" :subtitle="subtitle" :back="back" :back-label="backLabel" :center="center" @back="emit('back')">
      <span data-demo-title tabindex="-1">{{ title }}</span>
      <template v-if="settings" #actions><ThemeSettings /></template>
    </AppBar>
  </header>
</template>

<style scoped>
.demo-header { flex: none; width: 100%; border-bottom: 1px solid var(--border); background: var(--card-background); }
.demo-header :deep(.my-app-bar) { width: min(100%, 1160px); margin-inline: auto; border: 0; }
[data-demo-title]:focus { outline: none; }
</style>
