<script setup lang="ts">
import { useNative } from '../adapter'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 顶栏标题，默认插槽可替换标题内容。 */
  title?: string
  /** 标题下方的辅助说明。 */
  subtitle?: string
  /** 显示返回按钮；leading 插槽优先。 */
  back?: boolean
  /** 返回按钮的辅助名称。 */
  backLabel?: string
  /** 标题保持几何居中，关闭后跟随左侧布局。 */
  center?: boolean
  /** 在当前滚动容器顶部吸附，偏移可用 CSS 变量设置。 */
  sticky?: boolean
}>(), { title: '', subtitle: '', back: false, backLabel: '返回', center: true, sticky: false })
const emit = defineEmits<{
  /** 点击返回按钮，仅发送事件，页面导航由应用决定。 */
  back: [event: MouseEvent]
}>()
const bridge = useNative('AppBar', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
