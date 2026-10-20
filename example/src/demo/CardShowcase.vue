<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button, Card, Icon, type IconName } from '@my-ui/vue'

const emit = defineEmits<{
  /** 只展示操作结果，不执行真实的清理或设备管理。 */
  notify: [message: string]
}>()
const delayed = ref(false)
const delayTouchActive = computed(() => delayed.value ? 50 : 0)
const shortcuts: { title: string; description: string; icon: IconName }[] = [
  { title: '清理存储', description: '36.8 GB / 128 GB', icon: 'inbox' },
  { title: '安全检查', description: '设备状态良好', icon: 'shield' },
  { title: '运行状态', description: '让日常使用更轻快', icon: 'spark' },
  { title: '应用管理', description: '查看全部应用', icon: 'grid' },
]
</script>

<template>
  <section id="surfaces" class="card-showcase" aria-label="交互卡片示例">
    <section class="card-section" aria-labelledby="card-grid-title">
      <header class="card-section-heading">
        <div><h2 id="card-grid-title">快捷卡片</h2><p>按住回应，移开取消。</p></div>
        <Button variant="text" :aria-pressed="delayed" class="card-delay-toggle" @click="delayed = !delayed">
          {{ delayed ? '触摸延迟 50ms' : '立即响应' }}
        </Button>
      </header>
      <div class="card-grid" aria-label="快捷功能">
        <Card v-for="item in shortcuts" :key="item.title" class="shortcut-card" :title="item.title"
          interactive :delay-touch-active="delayTouchActive" @activate="emit('notify', item.title + '（交互示例）')">
          <Icon class="shortcut-icon" :name="item.icon" />
          <div class="shortcut-copy"><h3>{{ item.title }}</h3><p>{{ item.description }}</p></div>
        </Card>
      </div>
    </section>

    <section class="card-section" aria-labelledby="card-list-title">
      <header class="card-section-heading"><div><h2 id="card-list-title">内容卡片</h2><p>留出空间，承载更多内容。</p></div></header>
      <div class="large-card-list" aria-label="大卡片列表">
        <Card class="large-card cloud-card" title="云端同步" interactive :delay-touch-active="delayTouchActive"
          @activate="emit('notify', '已打开云端同步示例')">
          <div class="large-card-top"><span class="large-card-icon"><Icon name="cloud" /></span><span class="card-status"><i></i>同步正常</span></div>
          <div class="large-card-copy"><span class="card-eyebrow">随时随地，保持连接</span><h3>重要的内容，<br />始终在你身边。</h3><p>照片、文档与收藏，在每一台设备上保持同步。</p></div>
          <div class="large-card-bottom"><span>最近同步于 2 分钟前</span><Icon name="arrow-right" /></div>
        </Card>
        <Card class="large-card photo-card" title="周末，去湖边走走" interactive :delay-touch-active="delayTouchActive"
          @activate="emit('notify', '已打开周末旅行示例')">
          <img class="card-cover" src="/images/lake.svg" alt="平静的湖面与远山" loading="lazy" draggable="false" />
          <div class="photo-card-content">
            <div class="large-card-copy"><span class="card-eyebrow">周末灵感</span><h3>去湖边走走</h3><p>放慢一点，把时间留给风景。</p></div>
            <div class="large-card-bottom"><span>一份轻松出发的小计划</span><Icon name="arrow-right" /></div>
          </div>
        </Card>
      </div>
    </section>
  </section>
</template>

<style scoped>
.card-showcase { display: grid; gap: 30px; }
.card-section { min-width: 0; }
.card-section-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0 3px 14px; }
.card-section-heading h2 { margin: 0; font-size: 18px; font-weight: var(--font-weight-subtitle, 600); }
.card-section-heading p { margin: 6px 0 0; color: var(--text-secondary); font-size: 13px; line-height: 1.5; }
.card-delay-toggle { flex-shrink: 0; min-height: 36px; font-size: 12px; }
.card-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.shortcut-card { --card-radius: 22px; --card-padding: 17px 16px; display: flex; flex-direction: column; align-items: flex-start; justify-content: space-between; min-height: 138px; border: 0; box-shadow: none; }
.shortcut-icon { width: 26px; height: 26px; color: var(--text); }
.shortcut-copy { min-width: 0; padding-top: 24px; }
.shortcut-copy h3 { margin: 0; font-size: 17px; font-weight: var(--font-weight-subtitle, 600); line-height: 1.4; }
.shortcut-copy p { margin: 5px 0 0; color: var(--text-secondary); font-size: 12px; line-height: 1.5; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.large-card-list { display: grid; gap: 16px; }
/* 大卡片使用较小的收缩幅度，保持与快捷卡片相近的边缘位移。 */
.large-card { --card-press-scale: .97; --card-radius: 24px; --card-padding: 24px; overflow: hidden; border: 0; box-shadow: none; }
.cloud-card { display: flex; flex-direction: column; gap: 24px; min-height: 270px; }
.large-card-top, .large-card-bottom { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.large-card-icon { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 14px; background: var(--fill); color: var(--primary); }
.large-card-icon svg { width: 24px; height: 24px; }
.card-status { display: inline-flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 12px; }
.card-status i { width: 6px; height: 6px; border-radius: 50%; background: var(--success); }
.card-eyebrow { color: var(--text-secondary); font-size: 12px; }
.large-card-copy h3 { margin: 10px 0; color: var(--text); font-size: 26px; line-height: 1.4; letter-spacing: -.5px; font-weight: var(--font-weight-title, 700); }
.large-card-copy p { margin: 0; color: var(--text-secondary); font-size: 13px; line-height: 1.7; }
.large-card-bottom { margin-top: auto; color: var(--text-secondary); font-size: 12px; }
.large-card-bottom svg { width: 18px; height: 18px; color: var(--text); }
.photo-card { --card-padding: 0; }
.card-cover { display: block; width: 100%; aspect-ratio: 16 / 7; max-height: 300px; object-fit: cover; pointer-events: none; }
.photo-card-content { display: grid; gap: 24px; padding: 24px; }
.photo-card .large-card-copy h3 { font-size: 23px; }
@media (min-width: 900px) { .card-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; } .shortcut-card { min-height: 160px; --card-padding: 22px; } .cloud-card { min-height: 300px; } }
@media (max-width: 360px) { .card-section-heading { gap: 5px; margin-inline: 0; } .card-section-heading h2 { font-size: 17px; } .card-section-heading p { font-size: 12px; } .card-delay-toggle { padding-inline: 5px; font-size: 11px; } .shortcut-card { --card-padding: 16px 14px; } .shortcut-copy h3 { font-size: 16px; } .shortcut-copy p { font-size: 11px; } }
</style>
