<script setup lang="ts">
import { useNative } from '../adapter'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  /** 表单项的可见标签；竖排标题只提供辅助名称，不通过点击激活控件。 */
  label: string
  /** 控件标识，不传时自动生成并关联标签。 */
  id?: string
  /** 必填标记，同时通过插槽传给原生控件。 */
  required?: boolean
  /** 校验错误，优先于补充说明显示。 */
  error?: string
  /** 没有错误时的补充说明。 */
  hint?: string
  /** 为单选、多选等控件分组提供标签，不生成指向单一输入的 label。 */
  group?: boolean
}>()
const emit = defineEmits<{}>()
const bridge = useNative('FormField', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
