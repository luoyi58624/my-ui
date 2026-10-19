<script setup lang="ts">
import { useNative } from '../adapter'
import type { FloatingAnchor, FloatingPlacement } from './floatingTypes'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 控制窗口显示，首次挂载也执行进入动画。 */
  modelValue: boolean
  /** 触发元素或实际按压位置。 */
  anchor?: FloatingAnchor
  /** 首选展示方向，空间不足时自动翻转。 */
  placement?: FloatingPlacement
  /** 使用触发元素宽度，仍受视口边界限制。 */
  matchWidth?: boolean
  /** 默认完整展开，slide 轻微位移，fade 仅淡入淡出。 */
  motion?: 'expand' | 'slide' | 'fade'
}>(), { placement: 'bottom-start', motion: 'expand' })
const emit = defineEmits<{
  /** 触发位置不可见或失效时收起窗口。 */
  'update:modelValue': [value: boolean]
  /** 完成首轮定位，可安全聚焦窗口内容。 */
  positioned: []
  /** 离场动画结束，可恢复与窗口共享的触发行。 */
  'after-leave': []
}>()
const bridge = useNative('Floating', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
