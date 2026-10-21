<script setup lang="ts">
import { useNative } from '../adapter'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 加载状态；刷新完成或失败后由使用方恢复为 false。 */
  modelValue?: boolean
  /** 禁止发起新刷新，正在执行的业务请求不受影响。 */
  disabled?: boolean
  /** 滚动区域的辅助名称与下拉时的提示文字。 */
  label?: string
}>(), { modelValue: false, disabled: false, label: '下拉刷新' })
const emit = defineEmits<{
  /** 有效释放或调用 refresh() 时先同步 true。 */
  'update:modelValue': [value: boolean]
  /** 通知使用方执行刷新，加载中不会重复触发。 */
  refresh: []
}>()
const bridge = useNative('PullRefresh', props, emit)

defineExpose({ refresh: bridge.exposed.refresh })
</script>

<template><component :is="bridge.render" /></template>
