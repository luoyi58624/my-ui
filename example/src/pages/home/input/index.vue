<script setup lang="ts">
import { ref } from 'vue'
import DemoExample from '../../../components/DemoExample.vue'
import { Icon, Input, Select, type Option } from '@my-ui/vue'

// #region input-search
const search = ref('')
// #endregion
// #region input-hint
const nickname = ref('小蓝同学')
// #endregion
// #region select
const category = ref('视觉灵感')
const categories: Option[] = ['视觉灵感', '效率优先', '轻度探索'].map((value) => ({
  value,
  label: value
}))
// #endregion
</script>

<template>
  <section id="controls">
    <div class="field-group">
      <DemoExample
        name="input-search"
        source="pages/home/input/index.vue"
        setup="input-search"
        title="搜索输入"
        description="通过 icon 添加前置图标，clearable 提供一键清空。"
      >
        <Input
          v-model="search"
          label="搜索"
          icon="search"
          clearable
          placeholder="寻找你感兴趣的内容…"
        />
      </DemoExample>
      <DemoExample
        name="input-hint"
        source="pages/home/input/index.vue"
        setup="input-hint"
        title="辅助信息"
        description="hint 插槽补充输入提示，maxlength 限制最大长度。"
      >
        <Input v-model="nickname" label="昵称" :maxlength="24">
          <template #hint>
            <span>为自己取个喜欢的名字</span>
            <span :class="{ valid: nickname.trim() }">
              <Icon v-if="nickname.trim()" name="check" />
              {{ nickname.trim() ? '已填写' : '待填写' }}
            </span>
          </template>
        </Input>
      </DemoExample>
      <DemoExample
        name="select"
        source="pages/home/input/index.vue"
        setup="select"
        title="下拉选择"
        description="Select 通过 options 提供选项，v-model 同步当前值。"
      >
        <Select v-model="category" label="内容分类" :options="categories">
          <template #hint>
            <span>已选择：{{ category }}</span>
            <span>下拉展开简洁柔和</span>
          </template>
        </Select>
      </DemoExample>
    </div>
  </section>
</template>

<style scoped>
.field-group {
  display: grid;
  gap: 16px;
}
</style>
