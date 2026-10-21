<script setup lang="ts">
import { ref } from 'vue'
import { Button, Card, Input, Icon } from '@my-ui/vue'
import { useApp } from 'tauri-plugin-native-components/vue'

defineProps<{
  /** 当前栏目标题。 */
  title: string
  /** 当前栏目的用途说明。 */
  description: string
}>()
const app = useApp()
const count = ref(0), draft = ref(''), error = ref('')
async function openDetail() {
  try { await app.push({ name: 'app-detail', params: { id: String(count.value + 1) }, query: { from: app.value.value } }) }
  catch (reason) { error.value = String(reason) }
}
</script>

<template>
  <main class="app-tab-page">
    <header class="app-tab-intro">
      <span class="app-tab-kicker">YOUR LITTLE SPACE</span>
      <h1>{{ title }}，慢慢记录</h1>
      <p>{{ description }}</p>
    </header>
    <Card title="留一份草稿" description="输入内容、增加计数，再切换到其他栏目。">
      <Input v-model="draft" label="当前栏目的草稿" placeholder="写下一个小想法…" clearable />
      <div class="app-tab-actions">
        <Button variant="outline" @click="count++">记录次数 · {{ count }}</Button>
        <Button @click="openDetail">打开记录详情 <Icon name="arrow-right" /></Button>
      </div>
      <p v-if="error" role="alert">{{ error }}</p>
    </Card>
    <section class="app-tab-notes" aria-label="随手记">
      <h2>给日常留一点空白</h2>
      <article v-for="(note, index) in ['窗边的光线刚刚好', '完成一件拖延的小事', '收藏一个喜欢的想法', '为周末留出一点时间', '写下今天的小进展', '慢慢走，也会到达', '把喜欢的事情再做一次', '下次回来，继续这里的记录']" :key="note">
        <span>{{ String(index + 1).padStart(2, '0') }}</span><div><h3>{{ note }}</h3><p>每个栏目独立保留内容和滚动位置。</p></div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.app-tab-page { box-sizing: border-box; width: min(100%, 680px); margin: auto; padding: 26px 20px 32px; }
.app-tab-intro { padding: 8px 0 26px; }
.app-tab-kicker { color: var(--primary); font-size: 11px; letter-spacing: 2px; font-weight: var(--font-weight-action, 600); }
.app-tab-intro h1 { margin: 12px 0 10px; font-size: 27px; font-weight: var(--font-weight-title, 700); line-height: 1.45; letter-spacing: -.6px; }
.app-tab-intro p, .app-tab-notes p { margin: 0; color: var(--text-secondary); font-size: 13px; line-height: 1.85; }
.app-tab-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
.app-tab-actions :deep(svg) { width: 16px; height: 16px; }
.app-tab-notes { margin-top: 32px; }
.app-tab-notes h2 { margin: 0 0 12px; font-size: 16px; font-weight: var(--font-weight-subtitle, 600); }
.app-tab-notes article { display: flex; gap: 16px; padding: 18px 0; border-bottom: 1px solid var(--border); }
.app-tab-notes article > span { padding-top: 3px; color: var(--primary); font-size: 11px; font-variant-numeric: tabular-nums; }
.app-tab-notes h3 { margin: 0 0 5px; font-size: 14px; font-weight: var(--font-weight-action, 600); }
@media (max-width: 360px) { .app-tab-page { padding-inline: 16px; } .app-tab-intro h1 { font-size: 24px; } }
</style>
