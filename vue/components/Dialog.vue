<script setup lang="ts">
import { useNative } from '../adapter'
import type { IconName } from './icons'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 控制弹窗的显示状态。 */
  modelValue: boolean
  /** 弹窗标题。 */
  title: string
  /** 正文，默认按文本显示，也可使用默认插槽。 */
  description?: string
  /** 标题上方的图标。 */
  icon?: IconName | false
  /** 取消按钮文案。 */
  cancelText?: string | false
  /** 确认按钮文案。 */
  confirmText?: string
  /** true 居中展示，false 在底部保留外边距展示。 */
  center?: boolean
  /** 使用危险色强调确认操作。 */
  danger?: boolean
  /** 是否允许点击背景关闭。 */
  closeOnBackdrop?: boolean
  /** 是否允许按 Escape 关闭。 */
  closeOnEscape?: boolean
}>(), { icon: 'shield', cancelText: '取消', confirmText: '确认保存', center: true, closeOnBackdrop: true, closeOnEscape: true })
const emit = defineEmits<{
  /** 同步弹窗的显示状态。 */
  'update:modelValue': [value: boolean]
  /** 用户确认操作。 */
  confirm: []
  /** 用户取消或关闭操作。 */
  cancel: []
  /** 离场动画结束。 */
  'after-leave': []
}>()
const bridge = useNative('Dialog', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
