<script setup lang="ts">
import { useNative } from '../adapter'
import type { IconName } from './icons'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 输入框的双向绑定文本。 */
  modelValue: string
  /** 输入框标签。 */
  label: string
  /** 原生控件标识，不传时自动生成。 */
  id?: string
  /** 常用文本类型，password 默认始终隐藏。 */
  type?: 'text' | 'search' | 'email' | 'password' | 'tel' | 'url'
  /** 在密码框右侧显示显隐按钮，默认不显示。 */
  passwordToggle?: boolean
  /** 占位提示。 */
  placeholder?: string
  /** 前置图标，也可以使用 prefix 插槽。 */
  icon?: IconName
  /** 显示清空按钮。 */
  clearable?: boolean
  /** 最大输入长度。 */
  maxlength?: number
  /** 禁止聚焦、编辑和密码显隐操作。 */
  disabled?: boolean
  /** 保持可聚焦与复制，但禁止编辑和清空。 */
  readonly?: boolean
  /** 原生必填约束与可见标记。 */
  required?: boolean
  /** 校验错误，自动关联到原生控件。 */
  error?: string
  /** 没有错误时显示的说明。 */
  hint?: string
  /** 原生自动填充用途。 */
  autocomplete?: string
}>(), { placeholder: '', type: 'text', autocomplete: 'off' })
const emit = defineEmits<{
  /** 同步输入和清空后的文本。 */
  'update:modelValue': [value: string]
}>()
const bridge = useNative('Input', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
