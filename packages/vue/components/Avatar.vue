<script setup lang="ts">
import { useNative } from '../adapter'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 图片地址；为空或加载失败时展示文字或默认插槽。 */
  src?: string
  /** 头像的辅助名称，同时作为自动缩写的来源。 */
  alt?: string
  /** 明确指定回退文字，优先于 alt 的自动缩写。 */
  text?: string
  /** 尺寸为像素数或 CSS 长度。 */
  size?: number | string
  /** 圆形或圆角方形。 */
  shape?: 'circle' | 'square'
}>(), { alt: '', size: 40, shape: 'circle' })
const emit = defineEmits<{
  /** 当前图片加载完成。 */
  load: [event: Event]
  /** 当前图片加载失败并切换到回退内容。 */
  error: [event: Event]
}>()
const bridge = useNative('Avatar', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
