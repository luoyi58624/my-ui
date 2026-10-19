<script setup lang="ts">
import { useNative } from '../adapter'
import type { Option } from './types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 底部面板是否展开。 */
  modelValue: boolean
  /** 面板标题。 */
  title: string
  /** 保留简单操作单用法，自定义内容优先使用默认插槽。 */
  actions?: Option[]
  /** 取消文案，false 隐藏取消按钮。 */
  cancelText?: string | false
  /** 需要两项操作时传入确认文案。 */
  confirmText?: string
  /** 使用危险色强调确认按钮。 */
  danger?: boolean
  /** 允许单指下拉关闭，正文滚动时优先保留滚动，默认开启。 */
  swipeable?: boolean
  /** 是否允许点击遮罩关闭。 */
  closeOnBackdrop?: boolean
  /** 是否允许按 Escape 关闭。 */
  closeOnEscape?: boolean
}>(), { actions: () => [], cancelText: '取消', swipeable: true, closeOnBackdrop: true, closeOnEscape: true })
const emit = defineEmits<{
  /** 同步面板展开状态。 */
  'update:modelValue': [value: boolean]
  /** 返回所选的简单操作项。 */
  select: [action: Option]
  /** 用户取消或关闭面板。 */
  cancel: []
  /** 用户确认面板操作。 */
  confirm: []
  /** 离场动画结束。 */
  'after-leave': []
}>()
const bridge = useNative('Sheet', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
