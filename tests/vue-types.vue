<script setup lang="ts">
import { ref } from 'vue'
import { Button, Calendar, Checkbox, Collapse, CollapseItem, Image, Input, Menu, Picker, Slider, Switch, TagGroup, Toast } from '../packages/vue'

// 真实模板消费端验证组件从 .vue 迁移到 TypeScript 后的泛型、事件和 ref 提示。
const text = ref('小蓝'), enabled = ref(false), mixed = ref(true)
const scalar = ref(30), range = ref([20, 60]), tags = ref(['a']), expanded = ref('a')
const day = ref<string | null>(null), choice = ref<number | null>(1), open = ref(false)
const input = ref<InstanceType<typeof Input>>(), toast = ref<InstanceType<typeof Toast>>()
const options = [{ value: 'a', label: '甲' }]
function save() { input.value?.focus(); toast.value?.show(text.value) }
function numberValue(value: number) { value.toFixed(); scalar.value = value }
function rangeValue(value: number[]) { range.value = value.map(Number) }
function dateValue(value: string | null) { day.value = value }
function pickerValue(value: number | null) { choice.value = value }
</script>

<template>
  <Input ref="input" v-model="text" label="姓名" clearable />
  <Switch v-model="enabled" label="通知" />
  <Checkbox v-model="enabled" v-model:indeterminate="mixed" label="复选" />
  <Slider :model-value="scalar" label="数值" @update:model-value="numberValue" />
  <Slider :model-value="range" label="范围" @update:model-value="rangeValue" />
  <Calendar :model-value="day" @update:model-value="dateValue" />
  <Picker :model-value="choice" :options="[{ value: 1, label: '一' }]" @update:model-value="pickerValue" />
  <TagGroup v-model="tags" :options="options" label="标签" />
  <Collapse v-model="expanded"><CollapseItem value="a" title="标题">内容</CollapseItem></Collapse>
  <Menu v-model:open="open" :options="options" @select="item => item.value.toUpperCase()"><Button>菜单</Button></Menu>
  <Image src="" v-slot:placeholder="{ state }">{{ state.toUpperCase() }}</Image>
  <Button @click="event => { event.preventDefault(); save() }">保存</Button>
  <Toast ref="toast" />
  <!-- @vue-expect-error 开关绑定值必须为布尔值。 -->
  <Switch model-value="错误值" label="错误开关" />
  <!-- @vue-expect-error 输入事件返回文本，不能作为 DOM 事件使用。 -->
  <Input model-value="" label="错误回调" @update:model-value="value => value.preventDefault()" />
  <!-- @vue-expect-error 范围滑块不能绑定单值回调。 -->
  <Slider :model-value="range" label="错误范围" @update:model-value="numberValue" />
</template>
