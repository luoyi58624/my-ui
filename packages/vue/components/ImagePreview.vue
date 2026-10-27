<script setup lang="ts">
import { useNative } from '../adapter'
import type { ImagePreviewItem } from '../../core/my-ui'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 控制全屏图片预览的显示状态。 */
  modelValue: boolean
  /** 图片地址或带替代文字的图片列表，空列表显示可关闭的空状态。 */
  images: readonly (string | ImagePreviewItem)[]
  /** 从零开始的图片位置；打开时采用此值，打开中更新会切换图片。 */
  startIndex?: number
  /** 预览窗口的标题和辅助名称。 */
  title?: string
  /** 最大放大倍数，最小为 1。 */
  maxZoom?: number
  /** 是否允许 Escape 和系统返回关闭预览。 */
  closeOnEscape?: boolean
}>(), { startIndex: 0, title: '图片预览', maxZoom: 4, closeOnEscape: true })
const emit = defineEmits<{
  /** 同步预览窗口的显示状态。 */
  'update:modelValue': [value: boolean]
  /** 当前图片改变后返回从零开始的位置。 */
  'index-change': [index: number]
  /** 用户请求关闭预览。 */
  close: []
  /** 预览的离场动画结束。 */
  'after-leave': []
}>()
const bridge = useNative('ImagePreview', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
