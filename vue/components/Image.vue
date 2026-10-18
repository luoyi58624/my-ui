<script setup lang="ts">
import { useNative } from '../adapter'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 图片地址；为空时展示占位，不发出请求。 */
  src?: string
  /** 图片替代文字；装饰图片保留空字符串。 */
  alt?: string
  /** 容器宽度，数字及数字字符串为像素，也接受 CSS 长度。 */
  width?: number | string
  /** 容器高度，数字及数字字符串为像素，也接受 CSS 长度。 */
  height?: number | string
  /** 预留宽高比，如 16 / 9 或 '16 / 9'；省略时加载后使用原图比例。 */
  ratio?: number | string
  /** 图片在容器内的裁剪方式。 */
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  /** 使用浏览器原生懒加载；首屏重点图片可设为 eager。 */
  loading?: 'lazy' | 'eager'
}>(), { alt: '', fit: 'cover', loading: 'lazy' })
const emit = defineEmits<{
  /** 当前图片成功加载，事件 target 为实际 img。 */
  load: [event: Event]
  /** 当前图片加载失败，旧地址的迟到事件不会触发。 */
  error: [event: Event]
}>()
defineSlots<{
  /** 空地址或加载中展示，state 区分这两种状态。 */
  placeholder?(context: { src: string; state: 'empty' | 'loading' }): any
  /** 失败内容，可调用 retry 重新加载当前地址。 */
  error?(context: { src: string; retry: () => void }): any
}>()
const bridge = useNative('Image', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
