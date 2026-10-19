<script setup lang="ts" generic="T extends number | number[]">
import { useNative } from '../adapter'
import type { SliderMark } from './sliderTypes'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** 数值表示单滑块，数组表示范围；交叉时切换上下限，返回新的有序数组。 */
  modelValue: T
  /** 已缓冲到的数值，范围与 min/max 相同；省略时不显示缓冲层。 */
  buffer?: number
  /** 滑块的可见标签。 */
  label: string
  /** 最小允许值。 */
  min?: number
  /** 最大允许值。 */
  max?: number
  /** 取值步长，null 限定为 marks；触屏拖动预览、抬起提交，数值按中点吸附。 */
  step?: number | null
  /** true 按 step 绘制刻度，数组指定刻度位置和可选文字。 */
  marks?: boolean | readonly SliderMark[]
  /** auto 悬停、拖动和键盘聚焦时显示，on 常显，off 关闭。 */
  valueLabelDisplay?: 'auto' | 'on' | 'off'
  /** 自定义数值提示和标题中的数值文案，默认追加 unit。 */
  valueLabelFormat?: (value: number, index: number) => string
  /** 自定义屏幕阅读器读取的数值文案，默认与数值提示相同。 */
  getAriaValueText?: (value: number, index: number) => string
  /** 禁止拖动与键盘调整。 */
  disabled?: boolean
  /** 显示数值时追加的单位。 */
  unit?: string
  /** 左端提示。 */
  startLabel?: string
  /** 右端提示。 */
  endLabel?: string
}>(), { min: 0, max: 100, step: 1, marks: false, valueLabelDisplay: 'auto', unit: '%', startLabel: '柔和', endLabel: '鲜明' })
const emit = defineEmits<{
  /** 同步数值；触屏仅在有效抬起时提交，鼠标与键盘实时提交。 */
  'update:modelValue': [value: T]
}>()
const bridge = useNative('Slider', props, emit)
defineExpose(bridge.exposed)
</script>

<template><component :is="bridge.render" /></template>
