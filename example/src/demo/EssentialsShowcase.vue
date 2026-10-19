<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { Button, Card, CellGroup, Empty, Icon, Input, ListRow, Loading, Skeleton, Tabs, Tag, type Option, type IconName } from '@my-ui/vue'
import ProfileFormExample from './ProfileFormExample.vue'

const emit = defineEmits<{
  /** 将场景反馈交给展示页的统一提示。 */
  notify: [message: string]
}>()
const root = ref<HTMLElement>()

const feedLoading = ref(false)
const feedError = ref(false)
const refreshed = ref(0)
const reloadButton = ref<InstanceType<typeof Button>>()
let feedTimer: ReturnType<typeof setTimeout> | undefined
const records: { title: string; description: string; value: string; icon: IconName }[] = [
  { title: '午后灵感', description: '给日常留一点新鲜感', value: '3 条笔记', icon: 'spark' },
  { title: '城市散步', description: '收集沿途的好风景', value: '12 张图片', icon: 'image' },
  { title: '旅行计划', description: '把下一次出发安排好', value: '待整理', icon: 'briefcase' },
]
function reloadFeed() {
  if (feedLoading.value) return
  clearTimeout(feedTimer)
  // 重试按钮会被占位内容替换，将焦点留在始终存在的工具栏按钮上。
  reloadButton.value?.$el?.focus({ preventScroll: true })
  feedLoading.value = true
  feedError.value = false
  feedTimer = setTimeout(() => { feedLoading.value = false; refreshed.value++ }, 850)
}
function showFeedError() {
  if (!feedLoading.value) feedError.value = true
}

const tab = ref('recent')
const tabs: Option[] = [
  { value: 'recent', label: '最近' }, { value: 'favorites', label: '收藏' },
  { value: 'archive', label: '归档', disabled: true }, { value: 'preferences', label: '偏好' },
]
const favorite = ref(false)
const updates = ref(true)
const compact = ref(false)
async function addFavorite() {
  favorite.value = true
  await nextTick()
  if (document.activeElement === document.body) root.value?.querySelector<HTMLElement>('[role="tabpanel"]:not([hidden]) button')?.focus({ preventScroll: true })
}
async function clearFavorite() {
  favorite.value = false
  await nextTick()
  root.value?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus({ preventScroll: true })
}
const demoPassword = ref('blue-demo-2026')
const outlined = ref('清晰的边界')
const borderless = ref('自由的外观')
const amount = ref('120')
onBeforeUnmount(() => clearTimeout(feedTimer))
</script>

<template>
  <section id="scenarios" ref="root" class="essentials-section">
    <div class="section-heading"><div><span class="section-number">05 / 完整示例</span><h2>让每个状态，都有回应</h2></div><p>从填写资料到浏览内容，把常用组件连成完整体验。</p></div>
    <div class="scene-grid">
      <ProfileFormExample @notify="emit('notify', $event)" />

      <Card title="内容加载" description="等待、失败与恢复，都有明确反馈" sample="LOADING / EMPTY">
        <div class="feed-toolbar"><Button ref="reloadButton" variant="outline" :loading="feedLoading" @click="reloadFeed">重新加载</Button><Button variant="text" :disabled="feedLoading" @click="showFeedError">查看失败状态</Button></div>
        <div class="feed-body">
          <div v-if="feedLoading" class="load-readout"><Loading size="small">正在加载最近的内容</Loading></div>
          <Skeleton :loading="feedLoading" :rows="4" avatar label="最近内容加载中">
            <Empty v-if="feedError" state="error" description="再试一次，继续查看最近的内容"><Button @click="reloadFeed">重试加载</Button></Empty>
            <CellGroup v-else title="最近更新"><ListRow v-for="item in records" :key="item.title" :title="item.title" :description="item.description" :value="item.value" @click="emit('notify', '已打开：' + item.title)"><template #leading><Icon :name="item.icon" /></template></ListRow></CellGroup>
          </Skeleton>
        </div>
        <p class="feed-foot" role="status">{{ feedLoading ? '请稍等，内容马上回来' : feedError ? '重试后可以恢复内容' : refreshed ? '内容已更新 · 第 ' + refreshed + ' 次' : '有内容，也为等待和失败留好位置' }}</p>
      </Card>

      <Card title="分组与内容切换" description="一个区域，呈现不同的内容与偏好" sample="TABS / CELL GROUP">
        <Tabs v-model="tab" :options="tabs" label="内容视图">
          <template #default="{ value }">
            <div class="tab-content">
              <CellGroup v-if="value === 'recent'" title="最近浏览"><ListRow v-for="item in records.slice(0, 2)" :key="item.title" :title="item.title" :description="item.description" @click="emit('notify', '继续浏览：' + item.title)"><template #leading><Icon :name="item.icon" /></template></ListRow></CellGroup>
              <template v-else-if="value === 'favorites'">
                <Empty v-if="!favorite" title="还没有收藏" description="留下一条喜欢的内容，下次更容易找到。" icon="heart"><Button variant="outline" @click="addFavorite">添加一条收藏</Button></Empty>
                <template v-else><CellGroup title="我的收藏"><ListRow title="午后灵感" description="已经为你留在这里" @click="emit('notify', '查看收藏：午后灵感')"><template #leading><Icon name="heart" /></template><template #trailing><Tag tone="green">已收藏</Tag></template></ListRow></CellGroup><Button class="clear-favorite" variant="text" @click="clearFavorite">清空示例收藏</Button></template>
              </template>
              <CellGroup v-else title="浏览偏好"><ListRow v-model="updates" toggle title="接收更新" description="不错过新内容"><template #leading><Icon name="bell" /></template></ListRow><ListRow v-model="compact" toggle title="紧凑显示" description="在同一屏里看到更多"><template #leading><Icon name="layer" /></template></ListRow></CellGroup>
            </div>
          </template>
        </Tabs>
      </Card>

      <Card title="输入状态" description="可编辑、只读与禁用，各有清楚的边界" sample="INPUT STATES">
        <form class="input-states" @submit.prevent>
          <Input model-value="CL-001024" label="账号编号" readonly clearable autocomplete="username" hint="可以聚焦与复制，不能修改" />
          <Input v-model="demoPassword" label="安全输入" type="password" password-toggle autocomplete="new-password" clearable />
          <Input model-value="hidden-demo" label="密码默认隐藏" type="password" autocomplete="new-password" hint="点击输入区域只聚焦，显隐按钮按需开启" />
          <Input model-value="由团队统一管理" label="管理设置" disabled hint="当前不可操作" />
          <Input v-model="outlined" class="outlined-input" label="描边输入" icon="user" clearable />
          <Input v-model="borderless" class="borderless-input" label="无边框输入" clearable />
          <Input v-model="amount" label="金额" inputmode="decimal"><template #suffix><span>元</span></template></Input>
        </form>
      </Card>
    </div>
  </section>
</template>

<style scoped>
.essentials-section { margin: 62px 0 60px; }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 26px; }
.section-number { color: var(--primary); font-size: 12px; font-weight: var(--font-weight-subtitle, 600); }
h2 { margin: 12px 0 0; font-size: 29px; line-height: 1.35; font-weight: var(--font-weight-title, 700); letter-spacing: -.7px; }
.section-heading p { margin: 0 0 4px; color: var(--text-secondary); font-size: 13px; line-height: 1.7; }
.scene-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; }
.input-states { display: grid; gap: 20px; min-width: 0; }
.feed-toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
.feed-body { min-height: 278px; padding-top: 25px; }
.load-readout { margin: 2px 0 18px; color: var(--primary); }
.feed-foot { margin: 16px 0 0; color: var(--text-secondary); font-size: 13px; line-height: 1.6; }
.tab-content { min-height: 218px; }
.clear-favorite { margin-top: 16px; }
.outlined-input { --input-background: var(--card-background); --input-border-color: var(--border); --input-radius: 8px; }
.borderless-input { --input-border: none; --input-background: var(--fill); --input-radius: 6px; }
@media (max-width:760px) { .essentials-section { margin-top: 44px; } .section-heading { display: block; margin-bottom: 22px; } h2 { font-size: 25px; } .section-heading p { margin-top: 12px; } .scene-grid { grid-template-columns: 1fr; gap: 16px; } }
</style>
