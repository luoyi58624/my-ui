<script setup lang="ts">
import { ref, inject } from 'vue'
import DemoExample from '../../../components/DemoExample.vue'
import { CellGroup, Choices, ListRow, Popover, type Option } from '@my-ui/vue'
import { notifyKey } from '../../../commons/notify'

// #region toast
const notify = inject(notifyKey)!
// #endregion
// #region list-choices
const readerTheme = ref<string | string[]>('system')
const readerOptions: Option[] = [
  { value: 'system', label: '跟随系统', description: '自动匹配系统设置' },
  { value: 'light', label: '浅色模式', description: '明亮柔和的显示效果' },
  { value: 'dark', label: '深色模式', description: '适合夜间使用' }
]
const syncContent = ref<string | string[]>(['documents', 'images'])
const syncOptions: Option[] = [
  { value: 'documents', label: '同步文档', description: '多设备持续更新' },
  { value: 'images', label: '同步图片', description: '保留珍贵的视觉记录' },
  { value: 'favorites', label: '同步收藏', description: '随时找回喜欢的内容' }
]
// #endregion
// #region list-navigation
const autoUpdate = ref(true)
const sort = ref('最近更新')
const sortOptions: Option[] = ['最近更新', '最近创建', '名称排序'].map((value) => ({
  value,
  label: value
}))
// #endregion
</script>

<template>
  <div class="list-grid" aria-label="列表示例">
    <DemoExample
      name="list-choices"
      source="pages/home/list/index.vue"
      class="list-panel"
      title="选择列表"
      description="Choices 的 list 模式将单选与复选以整行选项呈现。"
    >
      <div class="list-group">
        <div class="list-section-name">单选列表</div>
        <Choices v-model="readerTheme" list label="阅读偏好" :options="readerOptions" />
      </div>
      <div class="list-group">
        <div class="list-section-name">复选列表</div>
        <Choices
          v-model="syncContent"
          type="checkbox"
          list
          label="同步内容"
          :options="syncOptions"
        />
      </div>
    </DemoExample>
    <DemoExample
      name="list-navigation"
      source="pages/home/list/index.vue"
      setup="toast list-navigation"
      class="list-panel"
      title="导航与设置列表"
      description="ListRow 支持描述、尾部值、开关和浮层触发器，CellGroup 统一组织分组。"
    >
      <CellGroup title="设置与操作">
        <ListRow
          title="个人资料"
          description="查看与编辑账号信息"
          @click="notify('个人资料页面（原型示例）')"
        />
        <ListRow
          title="隐私与安全"
          description="权限、账号保护"
          @click="notify('隐私设置页面（原型示例）')"
        />
        <ListRow
          title="内存"
          description="查看内存的使用情况、当前运行的应用与最近的资源占用统计。"
          @click="notify('内存页面（原型示例）')"
        />
        <ListRow
          title="WebView 实现"
          value="Android System WebView"
          @click="notify('WebView 设置（原型示例）')"
        />
        <ListRow v-model="autoUpdate" toggle title="自动更新" description="在后台保持内容最新" />
        <Popover v-model="sort" label="排序方式" :options="sortOptions">
          <template #default="{ toggle, open, controls }">
            <ListRow
              title="排序方式"
              description="选择内容的排列顺序"
              :value="sort"
              aria-haspopup="listbox"
              :aria-expanded="open"
              :aria-controls="controls"
              @click="toggle"
            />
          </template>
        </Popover>
      </CellGroup>
    </DemoExample>
  </div>
</template>

<style scoped>
.list-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  margin-top: 22px;
}

.list-panel {
  --card-padding: 28px 29px 24px;
  --card-header-gap: 14px;
}

.list-section-name {
  font-size: 13px;
  font-weight: var(--font-weight-subtitle, 600);
  color: var(--text-secondary);
  padding: 6px 1px 8px;
}

.list-group + .list-group {
  margin-top: 20px;
  padding-top: 17px;
  border-top: 1px solid var(--border);
}

@media (max-width: 760px) {
  .list-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 16px;
  }
}
@media (max-width: 1100px) {
  .list-panel {
    --card-padding: 29px 28px 24px;
  }
}

@media (max-width: 760px) {
  .list-panel {
    --card-padding: 24px 22px 24px;
  }
}
</style>
