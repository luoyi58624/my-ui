<script setup lang="ts">
import { useNative } from '../adapter'
import type { IconName } from './icons'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 按钮的视觉层级。 */
  variant?: 'primary' | 'outline' | 'text' | 'icon' | 'bare' | 'link' | 'round'
  /** 左侧图标，图标按钮需通过 aria-label 提供名称。 */
  icon?: IconName
  /** 禁止点击。 */
  disabled?: boolean
  /** 显示加载状态并阻止重复激活，保留按钮尺寸与键盘焦点。 */
  loading?: boolean
  /** 表示收藏等可切换按钮的选中状态。 */
  selected?: boolean
  /** 原生按钮类型，默认避免触发表单提交。 */
  type?: 'button' | 'submit' | 'reset'
}>(), { variant: 'primary', type: 'button', selected: undefined })
const emit = defineEmits<{
  /** 可用状态下触发原生点击事件。 */
  click: [event: MouseEvent]
}>()
const bridge = useNative('Button', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
