<script setup lang="ts">
import { useNative } from '../adapter'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 当前完成量；省略或非有限数值时展示不确定进度。 */
  value?: number
  /** 已缓冲量，与 value 使用相同单位；省略时不显示缓冲层。 */
  buffer?: number
  /** 总量，非正数或非有限值回退为 100。 */
  max?: number
  /** 条形或环形外观，两者使用相同的数值与状态接口。 */
  type?: 'line' | 'circle'
  /** 状态复用主题已有的主色、成功、警告与错误色。 */
  status?: 'normal' | 'success' | 'warning' | 'error'
  /** 进度的可访问名称；可用 aria-labelledby 关联外部标题。 */
  label?: string
  /** 是否显示百分比、状态图标或自定义文字。 */
  showText?: boolean
}>(), { max: 100, type: 'line', status: 'normal', label: '进度', showText: true })
const emit = defineEmits<{}>()
const bridge = useNative('Progress', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
