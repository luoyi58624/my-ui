<script setup lang="ts">
import { useNative } from '../adapter'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 时间字符串 HH:mm；显示秒时使用 HH:mm:ss。 */
  modelValue?: string | null
  /** 最早可选时间，默认 00:00:00。 */
  min?: string
  /** 最晚可选时间，默认 23:59:59。 */
  max?: string
  /** 分钟间隔，1—60 的整数，从零开始，默认 1。 */
  minuteStep?: number
  /** 秒间隔，1—60 的整数，从零开始，默认 1。 */
  secondStep?: number
  /** 展示第三列秒数，默认关闭。 */
  showSeconds?: boolean
  /** 整组时间滚轮的辅助名称。 */
  label?: string
  /** 禁止拖动、滚轮与键盘调整。 */
  disabled?: boolean
}>(), { label: '选择时间', minuteStep: 1, secondStep: 1, showSeconds: false, disabled: false })
const emit = defineEmits<{
  /** 时分秒改变时同步合法时间。 */
  'update:modelValue': [value: string]
}>()
const bridge = useNative('TimePicker', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
