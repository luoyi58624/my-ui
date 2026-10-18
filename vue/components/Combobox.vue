<script setup lang="ts">
import { useNative } from '../adapter'
import type { Option } from './types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 选项值；输入的搜索词不会直接写入选中值，空字符串表示未选择。 */
  modelValue: string
  /** 共用的平级选项，value 应唯一且非空。 */
  options: Option[]
  /** 可见标签与辅助名称。 */
  label: string
  /** 原生输入标识，不传时自动生成。 */
  id?: string
  /** 原生表单提交选项值，而不是显示文字。 */
  name?: string
  /** 未选择时的输入提示。 */
  placeholder?: string
  /** 显示清空按钮。 */
  clearable?: boolean
  /** 禁止输入、清空和展开。 */
  disabled?: boolean
  /** 显示搜索等待态，等待中不能选择旧结果。 */
  loading?: boolean
  /** 默认搜索名称、说明和值；false 交由外部筛选，也可传入自定义判断。 */
  filter?: false | ((query: string, option: Option) => boolean)
  /** 没有结果时的提示文字。 */
  emptyText?: string
  /** 必填约束与可见标记。 */
  required?: boolean
  /** 复用 FormField 的错误显示与辅助关联。 */
  error?: string
  /** 输入说明。 */
  hint?: string
}>(), { placeholder: '搜索或选择…', clearable: false, disabled: false, loading: false, filter: undefined, emptyText: '没有匹配的选项' })
const emit = defineEmits<{
  /** 选择或清空后的值；不提交尚未选择的搜索词。 */
  'update:modelValue': [value: string]
  /** 输入搜索词，配合 filter=false 和 loading 对接异步结果。 */
  search: [query: string]
  /** 窗口开始关闭后返回用户选择的完整选项。 */
  select: [option: Option]
}>()
const bridge = useNative('Combobox', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
