<script setup lang="ts">
import { useNative } from '../adapter'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 控制抽屉展开状态。 */
  modelValue: boolean
  /** 抽屉标题。 */
  title: string
  /** 抽屉出现方向，默认从右侧展开。 */
  placement?: 'left' | 'right' | 'top' | 'bottom'
  /** 允许单指沿展开方向滑动关闭，默认开启。 */
  swipeable?: boolean
  /** 是否允许点击遮罩关闭。 */
  closeOnBackdrop?: boolean
  /** 是否允许按 Escape 关闭。 */
  closeOnEscape?: boolean
}>(), { placement: 'right', swipeable: true, closeOnBackdrop: true, closeOnEscape: true })
const emit = defineEmits<{
  /** 同步抽屉展开状态。 */
  'update:modelValue': [value: boolean]
  /** 关闭按钮、遮罩、Escape 或滑动触发关闭。 */
  close: []
  /** 离场动画结束。 */
  'after-leave': []
}>()
const bridge = useNative('Drawer', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
