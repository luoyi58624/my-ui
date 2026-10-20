<script setup lang="ts">
import { computed, ref } from 'vue'
import { AppBar } from 'tauri-plugin-native-components/vue'
import ThemeSettings from './demo/ThemeSettings.vue'
import { useNativeBarsSuspended } from './native-components'
import { openPage } from './navigation'
import { codeAction } from './demo/code/examples'

const props = withDefaults(defineProps<{
  /** 当前页面标题。 */
  title: string
  /** 显示返回按钮。 */
  back?: boolean
  /** 返回按钮的辅助名称。 */
  backLabel?: string
  /** 需要显示代码入口的示例标识。 */
  codeId?: string
}>(), { back: false, backLabel: '返回' })
const emit = defineEmits<{ back: [] }>()
const settings = ref<InstanceType<typeof ThemeSettings>>()
const bar = ref<InstanceType<typeof AppBar>>()
const actions = computed(() => [...(props.codeId ? [codeAction] : []), ...(settings.value?.actions ?? [])])
const suspended = useNativeBarsSuspended()
function onAction(value: string) {
  if (value === 'code' && props.codeId) void openPage('/code/' + props.codeId).catch(console.error)
  else settings.value?.handleAction(value)
}
/** Web 返回组件目录时恢复标题焦点。 */
defineExpose({ focus: () => bar.value?.focus() })
</script>

<template>
  <div class="demo-native-header">
    <AppBar ref="bar" :title="title" :back="back" :back-label="backLabel" :actions="actions" :suspended="suspended" @back="emit('back')" @action="onAction" @error="console.error" />
    <ThemeSettings ref="settings" :controls="false" />
  </div>
</template>
