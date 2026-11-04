<script setup lang="ts">
import { ref } from 'vue'
import DemoExample from '../../../components/DemoExample.vue'
import { TagGroup, Tag, type Option } from '@my-ui/vue'

// #region tag-single
const direction = ref('灵感')
// #endregion
// #region tag-toggle
const selectedTag = ref(false)
// #endregion
// #region tag-multiple
const multiDirections = ref<string[]>(['灵感'])
// #endregion
// #region tag-options
const directions: Option[] = [
  { value: '灵感', label: '灵感' },
  { value: '云端', label: '云端' },
  { value: '发现', label: '发现' },
  { value: '音乐', label: '音乐' }
]
// #endregion
</script>

<template>
  <div class="tag-showcase">
    <DemoExample
      name="tag-tones"
      source="pages/home/tag/index.vue"
      title="状态标签"
      description="用 tone 表达不同状态，展示型标签不参与选择。"
    >
      <div class="display-tags" aria-label="展示型标签示例">
        <Tag>推荐</Tag>
        <Tag tone="green">已完成</Tag>
        <Tag tone="orange">处理中</Tag>
        <Tag tone="red">需留意</Tag>
        <Tag tone="gray">草稿</Tag>
      </div>
    </DemoExample>
    <DemoExample
      name="tag-single"
      source="pages/home/tag/index.vue"
      setup="tag-options tag-single"
      title="单选标签组"
      description="v-model 使用字符串值，同一组内仅保留一个选择。"
    >
      <TagGroup v-model="direction" :options="directions" label="探索方向" />
      <p class="control-foot">当前偏好：{{ direction }}</p>
    </DemoExample>
    <DemoExample
      name="tag-multiple"
      source="pages/home/tag/index.vue"
      setup="tag-options tag-multiple"
      title="多选标签组"
      description="v-model 使用数组值即可多选，选项可单独禁用。"
    >
      <TagGroup
        v-model="multiDirections"
        :options="[...directions, { value: '未开放', label: '未开放', disabled: true }]"
        label="多选方向"
      />
      <p class="control-foot">已选：{{ multiDirections.join('、') || '暂无' }}</p>
    </DemoExample>
    <DemoExample
      name="tag-toggle"
      source="pages/home/tag/index.vue"
      setup="tag-toggle"
      title="独立选择标签"
      description="独立 Tag 使用布尔值管理选中状态。"
    >
      <div class="display-tags">
        <Tag v-model="selectedTag">稍后阅读</Tag>
        <Tag :model-value="false" disabled>暂不可选</Tag>
      </div>
      <p class="control-foot">{{ selectedTag ? '已加入稍后阅读' : '未选择稍后阅读' }}</p>
    </DemoExample>
  </div>
</template>

<style scoped>
.tag-showcase {
  display: grid;
  grid-template-columns: var(--showcase-sample-columns, minmax(0, 1fr));
  gap: 18px;
}

.display-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.control-foot {
  background: var(--fill);
  border-radius: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 16px;
  padding: 13px;
}

.control-foot strong {
  font-weight: var(--font-weight-subtitle, 600);
  color: var(--primary);
}
</style>
