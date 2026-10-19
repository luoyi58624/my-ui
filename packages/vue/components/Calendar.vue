<script setup lang="ts" generic="T extends string | readonly string[] | null = string | string[] | null">
import { useNative } from '../adapter'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 单日使用 YYYY-MM-DD；范围依次返回 [开始]、[开始, 结束]。 */
  modelValue?: T
  /** 开启范围选择，默认单日。 */
  range?: boolean
  /** 当前展示月份 YYYY-MM，未设置时跟随所选日期或今天。 */
  month?: string
  /** 最早可选日期，包含当天。 */
  min?: string
  /** 最晚可选日期，包含当天。 */
  max?: string
  /** 返回 true 禁用指定日期；入参为 YYYY-MM-DD，范围不能跨过禁用日期。 */
  disabledDate?: (date: string) => boolean
  /** 每周起始日，0 为周日、1 为周一，默认 1。 */
  firstDayOfWeek?: number
  /** 日历的辅助名称。 */
  label?: string
  /** 禁止选择与月份导航。 */
  disabled?: boolean
}>(), { range: false, firstDayOfWeek: 1, label: '日历', disabled: false })
const emit = defineEmits<{
  /** 单日选择或范围端点改变时更新值。 */
  'update:modelValue': [value: T]
  /** 完成单日选择或范围的两个端点后触发。 */
  select: [value: T]
  /** 用户切换展示月份时触发，格式为 YYYY-MM。 */
  'month-change': [value: string]
}>()
const bridge = useNative('Calendar', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
