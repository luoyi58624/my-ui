<script setup lang="ts">
import { useNative } from '../adapter'
import type { Option } from './types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 当前页签值，失效时显示首个可用页签。 */
  modelValue: string
  /** 页签选项，value 必须唯一。 */
  options: Option[]
  /** 页签分组的辅助名称。 */
  label: string
  /** 单指横向滑动切换内容，默认开启；竖向滚动与输入操作不受影响。 */
  swipeable?: boolean
}>(), { swipeable: true })
const emit = defineEmits<{
  /** 同步点击、键盘或滑动选择的新页签。 */
  'update:modelValue': [value: string]
}>()
const bridge = useNative('Tabs', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
