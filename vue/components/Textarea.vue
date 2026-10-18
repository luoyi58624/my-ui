<script setup lang="ts">
import { useNative } from '../adapter'


defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 多行输入的文本值。 */
  modelValue: string
  /** 可见标签。 */
  label: string
  /** 原生控件标识，不传时自动生成。 */
  id?: string
  /** 输入占位说明。 */
  placeholder?: string
  /** 初始行数，限制在 1 至 12 行。 */
  rows?: number
  /** 原生输入长度上限，同时显示计数。 */
  maxlength?: number
  /** 禁止聚焦与编辑。 */
  disabled?: boolean
  /** 允许聚焦和复制，禁止编辑。 */
  readonly?: boolean
  /** 原生必填约束与可见标记。 */
  required?: boolean
  /** 校验错误。 */
  error?: string
  /** 没有错误时的补充说明。 */
  hint?: string
}>(), { placeholder: '', rows: 3 })
const emit = defineEmits<{
  /** 同步新的文本值。 */
  'update:modelValue': [value: string]
}>()
const bridge = useNative('Textarea', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
