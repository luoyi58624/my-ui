<script setup lang="ts">
import { computed, ref } from 'vue'
import { AppBar } from 'tauri-plugin-native-components/vue'
import type { NavigationAction } from 'tauri-plugin-native-components'
import ThemeSettings from './demo/ThemeSettings.vue'
import { useNativeBarsSuspended } from './native-components'

const props = withDefaults(
  defineProps<{
    /** 当前页面标题。 */
    title: string
    /** 原生导航示例展示的辅助标题。 */
    subtitle?: string
    /** 显示返回按钮。 */
    back?: boolean
    /** 返回按钮的辅助名称。 */
    backLabel?: string
    /** 标题默认居中，导航组件示例可切换对齐方式。 */
    center?: boolean
    /** 页面本身需要的导航操作。 */
    actions?: NavigationAction[]
    /** 仅首页启用主题和设置入口，子页默认不重复显示。 */
    settings?: boolean
  }>(),
  { back: false, backLabel: '返回', center: true, actions: () => [], settings: false }
)
const emit = defineEmits<{
  /** 返回由所在页面处理。 */
  back: []
  /** 将页面导航操作交给所在示例。 */
  action: [value: string]
  /** 将原生导航创建失败交给所在示例展示。 */
  error: [reason: unknown]
}>()
const themeSettings = ref<InstanceType<typeof ThemeSettings>>()
const bar = ref<InstanceType<typeof AppBar>>()
const actions = computed(() =>
  props.settings ? (themeSettings.value?.actions ?? []) : props.actions
)
const suspended = useNativeBarsSuspended()
function onAction(value: string) {
  if (props.settings) themeSettings.value?.handleAction(value)
  else emit('action', value)
}
/** Web 返回组件目录时恢复标题焦点。 */
defineExpose({ focus: () => bar.value?.focus() })
</script>

<template>
  <div class="demo-native-header">
    <AppBar
      ref="bar"
      :title="title"
      :subtitle="subtitle"
      :back="back"
      :back-label="backLabel"
      :center="center"
      :actions="actions"
      :suspended="suspended"
      @back="emit('back')"
      @action="onAction"
      @error="emit('error', $event)"
    />
    <ThemeSettings v-if="props.settings" ref="themeSettings" :controls="false" />
  </div>
</template>

<style scoped>
.demo-native-header {
  flex: none;
  width: 100%;
  border-bottom: 1px solid var(--border);
  background: var(--card-background);
}
.demo-native-header :deep(.nc-app-bar) {
  width: min(100%, 1160px);
  height: 56px;
  margin-inline: auto;
  border: 0;
}
</style>
