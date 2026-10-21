<script setup lang="ts">
import DemoExample from '../components/DemoExample.vue'
import { h, ref } from 'vue'
import {
  Button,
  Card,
  CellGroup,
  Icon,
  ListRow,
  Tabs,
  popup,
  type Option,
  type PopupContext
} from '@my-ui/vue'

const emit = defineEmits<{
  /** 把示例操作交给页面的统一提示。 */
  notify: [message: string]
}>()
const page = ref('overview')
const pages: Option[] = [
  { value: 'overview', label: '概览' },
  { value: 'files', label: '文件' },
  { value: 'activity', label: '动态' }
]
const content = {
  overview: {
    title: '把日常，整理得更轻松',
    description: '在内容区域左右滑动，下一页会跟随手指进入。',
    icon: 'grid' as const,
    items: ['今天的灵感', '最近的收藏']
  },
  files: {
    title: '内容都在手边',
    description: '缓慢拖动再松手，试试切页与回弹的距离感。',
    icon: 'inbox' as const,
    items: ['设计规范', '旅行计划']
  },
  activity: {
    title: '每一步都有回应',
    description: '竖向仍可滚动页面，按钮也可以正常点击。',
    icon: 'clock' as const,
    items: ['小蓝更新了文档', '团队完成了同步']
  }
}
function panelContent(context: PopupContext<string>) {
  return h('div', [
    h(
      'p',
      { class: 'touch-panel-note' },
      '从标题区域拖动关闭。正文可以正常滚动，到达边缘后再向外拖动。'
    ),
    h(CellGroup, { label: '工作区内容' }, () =>
      Array.from({ length: 14 }, (_, index) =>
        h(ListRow, {
          title: `灵感记录 ${String(index + 1).padStart(2, '0')}`,
          description: '保留值得回看的日常片段',
          onClick: () => context.close(`灵感记录 ${index + 1}`)
        })
      )
    )
  ])
}
async function openDrawer() {
  const panel = popup.showDrawer<string>({
    title: '我的工作空间',
    content: panelContent,
    style: { '--drawer-padding': '16px 0', '--list-padding-inline': '24px' }
  })
  const result = await panel.closed
  if (result) emit('notify', '已打开：' + result)
}
async function openSheet() {
  const panel = popup.showSheet<string>({
    title: '最近的灵感',
    content: panelContent,
    cancelText: '关闭'
  })
  const result = await panel.closed
  if (result) emit('notify', '已打开：' + result)
}
</script>

<template>
  <DemoExample
    name="touch"
    source="TouchShowcase.vue"
    id="touch-gestures"
    class="touch-showcase"
    title="跟手滑动"
    description="左右切页，向外收起；轻拖回弹，快滑关闭。"
  >
    <Tabs v-model="page" :options="pages" label="触摸切页示例">
      <template #default="{ value }">
        <div class="touch-page">
          <span class="touch-page-icon">
            <Icon :name="content[value as keyof typeof content].icon" />
          </span>
          <div>
            <h4>{{ content[value as keyof typeof content].title }}</h4>
            <p>{{ content[value as keyof typeof content].description }}</p>
          </div>
          <CellGroup>
            <ListRow
              v-for="item in content[value as keyof typeof content].items"
              :key="item"
              :title="item"
              @click="emit('notify', '已打开：' + item)"
            />
          </CellGroup>
        </div>
      </template>
    </Tabs>
    <div class="touch-actions">
      <Button variant="outline" @click="openDrawer">
        滑动抽屉
        <Icon name="arrow-right" />
      </Button>
      <Button variant="outline" @click="openSheet">下拉面板</Button>
      <span>使用单指触摸体验</span>
    </div>
  </DemoExample>
</template>

<style scoped>
.touch-showcase {
  margin-top: 20px;
  scroll-margin-top: 120px;
}
.touch-page {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 16px;
  min-height: 232px;
  padding: 22px;
  background: var(--background);
  border-radius: 18px;
}
.touch-page-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 13px;
  background: var(--card-background);
  color: var(--primary);
}
.touch-page-icon svg {
  width: 22px;
  height: 22px;
}
.touch-page h4 {
  margin: 0 0 7px;
  font-size: 16px;
  font-weight: var(--font-weight-subtitle, 600);
}
.touch-page p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.8;
}
.touch-page > :last-child {
  grid-column: 1 / -1;
}
.touch-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 22px;
}
.touch-actions > span {
  color: var(--text-secondary);
  font-size: 12px;
}
.touch-actions svg {
  width: 16px;
  height: 16px;
}
:global(.touch-panel-note) {
  margin: 0;
  padding: 0 24px 18px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.8;
}
@media (max-width: 600px) {
  .touch-page {
    padding: 18px 14px;
    gap: 12px;
  }
  .touch-page h4 {
    font-size: 15px;
  }
  .touch-actions > span {
    width: 100%;
  }
}
</style>
