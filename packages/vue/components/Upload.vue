<script setup lang="ts">
import { useNative } from '../adapter'
import type { UploadFile, UploadRequest, UploadRejection } from '../../core/my-ui'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 文件列表，组件通过新数组同步状态，不修改传入记录。 */
  modelValue?: readonly UploadFile[]
  /** 整个文件区域的辅助名称。 */
  label?: string
  /** 扩展名、MIME 或 MIME 通配符，以逗号分隔。 */
  accept?: string
  /** 允许多个文件，默认只保留一个文件。 */
  multiple?: boolean
  /** 最大文件数量，多选时默认不限制，单选最多一个。 */
  maxCount?: number
  /** 单文件最大字节数，默认不限制。 */
  maxSize?: number
  /** 使用可点击、可拖入文件的面板。 */
  drag?: boolean
  /** 禁止添加和列表操作，已开始的上传继续运行。 */
  disabled?: boolean
  /** 提供 request 后自动上传；关闭后通过 ref.submit() 启动。 */
  autoUpload?: boolean
  /** 应用自己的上传函数，接收文件、取消信号和进度回调。 */
  request?: UploadRequest
  /** 展示在按钮旁或拖放区域中的说明。 */
  hint?: string
}>(), { modelValue: () => [], label: '上传文件', accept: '', multiple: false, drag: false, disabled: false, autoUpload: true, hint: '' })
const emit = defineEmits<{
  /** 添加、移除和上传状态改变时同步整个文件列表。 */
  'update:modelValue': [files: UploadFile[]]
  /** 一次选择中的所有拒绝记录。 */
  reject: [files: UploadRejection[]]
  /** 上传请求成功，返回结果保存在文件的 response 字段。 */
  success: [file: UploadFile]
  /** 上传请求失败，原因保存在文件的 error 字段。 */
  error: [file: UploadFile]
  /** 用户取消请求但保留文件。 */
  cancel: [file: UploadFile]
  /** 用户移除文件，请求同时中止。 */
  remove: [file: UploadFile]
}>()
const bridge = useNative('Upload', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
