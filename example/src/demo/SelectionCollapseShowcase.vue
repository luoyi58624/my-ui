<script setup lang="ts">
import DemoExample from './DemoExample.vue'
import { computed, ref, useId } from 'vue'
import {
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  Collapse,
  CollapseItem,
  Divider,
  Input,
  Radio,
  RadioGroup,
  type Option
} from '@my-ui/vue'

// #region radio
const deliveryName = 'delivery-' + useId()
const delivery = ref('door')
// #endregion
// #region checkbox
const autosave = ref(true),
  notifications = ref(false)
// #endregion
// #region radio-group
const layout = ref('comfortable')
const layouts: Option[] = [
  { value: 'compact', label: '紧凑' },
  { value: 'comfortable', label: '舒适' },
  { value: 'wide', label: '宽松' }
]
// #endregion
// #region checkbox-group
const sync = ref(['documents', 'images'])
const syncOptions: Option[] = [
  { value: 'documents', label: '文档' },
  { value: 'images', label: '图片' },
  { value: 'favorites', label: '收藏' },
  { value: 'archive', label: '归档', disabled: true }
]
const all = computed(() =>
  syncOptions.filter((item) => !item.disabled).every((item) => sync.value.includes(item.value))
)
const partial = computed(() => !all.value && sync.value.length > 0)
function selectAll(value: boolean) {
  sync.value = value ? syncOptions.filter((item) => !item.disabled).map((item) => item.value) : []
}
// #endregion
// #region collapse
const expanded = ref<string[]>(['collection']),
  accordion = ref('privacy'),
  note = ref('周末整理灵感'),
  backgroundSync = ref(true)
function reset() {
  expanded.value = ['collection']
  accordion.value = 'privacy'
  note.value = '周末整理灵感'
  backgroundSync.value = true
}
// #endregion
</script>

<template>
  <div id="selection-collapse" class="selection-showcase">
    <DemoExample
      name="radio"
      source="SelectionCollapseShowcase.vue"
      title="独立单选框"
      description="同一组 Radio 共用 name 与 v-model，disabled 禁用单个选项。"
    >
      <div class="standalone standalone-radios">
        <Radio v-model="delivery" :name="deliveryName" value="door">送货上门</Radio>
        <Radio v-model="delivery" :name="deliveryName" value="pickup">到店自取</Radio>
        <Radio v-model="delivery" :name="deliveryName" value="express" disabled>加急配送</Radio>
      </div>
      <p class="selection-note">当前选择：{{ delivery === 'door' ? '送货上门' : '到店自取' }}</p>
    </DemoExample>
    <DemoExample
      name="checkbox"
      source="SelectionCollapseShowcase.vue"
      title="独立复选框"
      description="每个 Checkbox 使用独立布尔值，description 补充说明。"
    >
      <div class="standalone">
        <Checkbox v-model="autosave" description="编辑内容会在本页保留">自动保存草稿</Checkbox>
        <Checkbox v-model="notifications">接收内容更新</Checkbox>
        <Checkbox disabled>订阅专属提醒</Checkbox>
      </div>
    </DemoExample>
    <DemoExample
      name="radio-group"
      source="SelectionCollapseShowcase.vue"
      title="单选组"
      description="RadioGroup 通过 options 定义选项，inline 控制水平排列。"
    >
      <RadioGroup v-model="layout" label="内容布局" :options="layouts" inline />
    </DemoExample>
    <DemoExample
      name="checkbox-group"
      source="SelectionCollapseShowcase.vue"
      title="复选组与半选"
      description="通过数组管理复选值，indeterminate 表达全选控件的半选状态。"
    >
      <Checkbox :model-value="all" :indeterminate="partial" @update:model-value="selectAll">
        全选可同步内容
      </Checkbox>
      <CheckboxGroup v-model="sync" label="同步内容" :options="syncOptions" inline />
      <p class="selection-note">
        已选 {{ sync.length }} 项 · {{ partial ? '半选状态' : all ? '已全选' : '尚未选择' }}
      </p>
    </DemoExample>
    <DemoExample
      name="collapse"
      source="SelectionCollapseShowcase.vue"
      class="collapse-card"
      title="折叠面板"
      description="数组值允许多项展开，字符串值形成手风琴；收起后保留内部输入状态。"
    >
      <div class="collapse-examples">
        <div>
          <div class="example-label">多项展开</div>
          <Collapse v-model="expanded" label="灵感工作区">
            <CollapseItem value="collection" title="灵感收集">
              <p>随手记录值得保留的想法，收起后仍会保留填写的内容。</p>
              <Input v-model="note" label="收集备注" placeholder="写下下一步计划" />
            </CollapseItem>
            <CollapseItem value="sync" title="同步偏好">
              <Checkbox v-model="backgroundSync" description="离开当前页面前，请确认内容已经保存">
                允许后台同步
              </Checkbox>
            </CollapseItem>
            <CollapseItem value="archive" title="归档策略 · 暂未开放" disabled>
              <p>稍后开放更多归档方式。</p>
            </CollapseItem>
          </Collapse>
        </div>
        <div>
          <div class="example-label">手风琴 · 一次展开一项</div>
          <Collapse v-model="accordion" label="使用说明">
            <CollapseItem value="privacy" title="隐私与内容安全">
              <p>示例数据只在当前页面内保存。你可以自由尝试各项控件，重载后恢复初始内容。</p>
            </CollapseItem>
            <CollapseItem value="keyboard" title="键盘操作">
              <p>
                Tab
                按顺序进入标题与已展开的内容；Enter、空格切换展开状态。上下方向键切换标题，Home、End
                跳到首尾。
              </p>
            </CollapseItem>
            <CollapseItem value="custom" title="自定义标题">
              <template #title="{ open }">
                <span class="custom-title">
                  查看面板状态
                  <span>{{ open ? '已展开' : '已收起' }}</span>
                </span>
              </template>
              <p>标题插槽可以补充状态，面板的布局与焦点行为保持统一。</p>
            </CollapseItem>
          </Collapse>
        </div>
      </div>
      <div class="collapse-footer">
        <p class="selection-note">收起保留内部状态，支持连续切换和系统减少动态效果设置。</p>
        <Button variant="text" @click="reset">重置折叠示例</Button>
      </div>
    </DemoExample>
  </div>
</template>

<style scoped>
.selection-showcase {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
  margin-top: 22px;
  scroll-margin-top: 120px;
}
.example-label {
  margin-bottom: 12px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: var(--font-weight-subtitle, 600);
  line-height: 20px;
}
.standalone {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}
.standalone-radios {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 4px 12px;
}
.selection-note {
  margin: 14px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.7;
}
.collapse-card {
  grid-column: 1 / -1;
}
.collapse-examples {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
}
.collapse-examples > div {
  min-width: 0;
}
.collapse-examples :deep(.my-collapse-content > p) {
  margin: 0 0 14px;
}
.collapse-examples :deep(.my-collapse-content > p:last-child) {
  margin-bottom: 0;
}
.custom-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.custom-title > span {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: var(--font-weight, 400);
}
.collapse-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}
.collapse-footer .selection-note {
  margin: 0;
}
@media (max-width: 760px) {
  .selection-showcase {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 16px;
  }
  .collapse-examples {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
