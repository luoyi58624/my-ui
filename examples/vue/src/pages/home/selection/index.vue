<script setup lang="ts">
import { ref } from 'vue'
import DemoExample from '../../../components/DemoExample.vue'
import { Choices, Stepper, type Option } from '@my-ui/vue'

// #region choices-radio
const plan = ref<string | string[]>('standard')
const plans: Option[] = [
  { value: 'standard', label: '标准体验' },
  { value: 'advanced', label: '进阶体验' },
  { value: 'professional', label: '专业体验' }
]
// #endregion
// #region choices-checkbox
const features = ref<string | string[]>(['cloud'])
const featureOptions: Option[] = [
  { value: 'cloud', label: '云端同步' },
  { value: 'updates', label: '自动更新' },
  { value: 'notifications', label: '消息提醒' }
]
// #endregion
// #region stepper
const quantity = ref(1)
// #endregion
</script>

<template>
  <div class="field-group">
    <DemoExample
      name="choices-radio"
      source="pages/home/selection/index.vue"
      setup="choices-radio"
      title="单选选项"
      description="字符串值表示单选，options 定义选项文案与值。"
    >
      <Choices v-model="plan" label="单选" :options="plans" />
    </DemoExample>
    <DemoExample
      name="choices-checkbox"
      source="pages/home/selection/index.vue"
      setup="choices-checkbox"
      title="复选选项"
      description="type 设置为 checkbox，使用数组保存多个选项值。"
    >
      <Choices v-model="features" type="checkbox" label="复选" :options="featureOptions" />
    </DemoExample>
    <DemoExample
      name="stepper"
      source="pages/home/selection/index.vue"
      title="数字步进器"
      description="通过加减按钮与输入框调整数量，v-model 始终同步当前值。"
    >
      <div class="choice-bottom">
        <span>添加到我的收藏</span>
        <Stepper v-model="quantity" />
      </div>
    </DemoExample>
  </div>
</template>

<style scoped>
.field-group {
  display: grid;
  gap: 16px;
}

.choice-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border-top: 1px solid var(--border);
  padding-top: 19px;
  margin-top: 18px;
}

.choice-bottom span {
  font-size: 14px;
  color: var(--text-secondary);
}

@media (max-width: 400px) {
  .choice-bottom {
    flex-wrap: wrap;
  }
}
</style>
