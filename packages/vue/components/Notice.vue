<script setup lang="ts">
import { useNative } from '../adapter'
import type { IconName } from './icons'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 是否展示，默认显示；关闭后可通过 v-model 重新展开。 */
  modelValue?: boolean
  /** 通知的语义状态。 */
  type?: 'info' | 'success' | 'warning' | 'error'
  /** 可选的短标题。 */
  title?: string
  /** 通知正文，默认插槽可替换。 */
  message?: string
  /** 显示右侧关闭按钮。 */
  closable?: boolean
  /** 自定义图标，false 隐藏，省略时按状态选择。 */
  icon?: IconName | false
}>(), { modelValue: true, type: 'info', title: '', message: '', closable: false, icon: undefined })
const emit = defineEmits<{
  /** 点击关闭后同步显示状态。 */
  'update:modelValue': [value: boolean]
  /** 点击关闭按钮时触发。 */
  close: [event: MouseEvent]
}>()
const bridge = useNative('Notice', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
