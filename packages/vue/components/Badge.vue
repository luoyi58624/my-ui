<script setup lang="ts">
import { useNative } from '../adapter'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 显示数字或短文字；无默认插槽时独立展示。 */
  value?: number | string
  /** 数字超过上限后显示 max+，默认 99。 */
  max?: number
  /** 使用小圆点，不需要传 value。 */
  dot?: boolean
  /** 数字为零时仍显示，默认隐藏。 */
  showZero?: boolean
  /** 隐藏提示，保持默认插槽中的内容。 */
  hidden?: boolean
  /** 自定义辅助名称，例如“12 条未读消息”。 */
  label?: string
}>(), { max: 99, dot: false, showZero: false, hidden: false })
const emit = defineEmits<{}>()
const bridge = useNative('Badge', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
