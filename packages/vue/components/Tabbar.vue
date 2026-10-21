<script setup lang="ts">
import { useNative } from '../adapter'
import type { Option } from './types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 当前选中的栏目，路由与页面缓存由应用管理。 */
  modelValue: string
  /** 底部栏目，支持文字、图标和禁用状态。 */
  options: Option[]
  /** 底部导航区域的辅助名称。 */
  label?: string
}>(), { label: '主导航' })
const emit = defineEmits<{
  /** 用户点击或用方向键切换后同步栏目。 */
  'update:modelValue': [value: string]
}>()
const bridge = useNative('Tabbar', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
