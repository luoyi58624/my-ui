<script setup lang="ts">
import { ref } from 'vue'
import { AppBar, Button, Card, CellGroup, Icon, Input, ListRow, Stepper } from '@my-ui/vue'
import ThemeSettings from './demo/ThemeSettings.vue'
import { canOpenNativePage, closeNativePage } from './native-page'

const available = canOpenNativePage()
const note = ref('这是新页面里的内容')
const count = ref(0)
const error = ref('')
const openedAt = new Date().toLocaleTimeString('zh-CN', { hour12: false })

async function back() {
  try { await closeNativePage() }
  catch (reason) { error.value = reason instanceof Error ? reason.message : String(reason) }
}
</script>

<template>
  <div class="native-page">
    <AppBar title="原生新页面" back sticky @back="back">
      <template #actions><ThemeSettings /></template>
    </AppBar>
    <main class="native-page-content">
      <div class="native-page-intro"><span class="native-page-symbol"><Icon name="layer" /></span><h1>来到另一页</h1><p>从屏幕边缘向内滑动，试试系统的返回效果。</p></div>
      <Card title="当前页的内容" description="每次进入，都会打开一个新的页面">
        <Input v-model="note" label="当前页备注" clearable />
        <div class="native-page-counter"><span>当前页计数</span><Stepper v-model="count" label="当前页计数" /></div>
        <div class="native-page-meta"><span>本次打开</span><span>{{ openedAt }}</span></div>
        <Button :disabled="!available" @click="back">返回上一页</Button>
        <p v-if="error" class="native-page-error" role="alert">{{ error }}</p>
        <a v-if="!available" href="./index.html">回到示例首页</a>
      </Card>
      <Card title="继续向下看看" description="这一页也可以独立滚动">
        <CellGroup><ListRow v-for="(title, index) in ['随手记录的想法', '周末的小计划', '收藏的好风景', '想完成的一件事', '给未来的自己', '今天的好心情', '留一点空白', '慢慢来，也很好']" :key="title" :title="title" :description="'第 ' + (index + 1) + ' 条记录'" :icon="index % 2 ? 'heart' : 'spark'" /></CellGroup>
      </Card>
      <p class="native-page-footnote">返回后，上一页的备注、计数和位置会保留。</p>
    </main>
  </div>
</template>

<style scoped>
:global(html.my-native-page) { scroll-padding-top: calc(56px + env(safe-area-inset-top)); }
:global(html.my-native-page body), :global(html.my-mobile-native.my-native-page body) { padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom); }
.native-page { min-height: calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom)); background: var(--background); }
.native-page :deep(.my-app-bar) { top: env(safe-area-inset-top); z-index: 20; background: var(--background); }
.native-page-content { display: grid; gap: 22px; max-width: 640px; margin: auto; padding: 26px 18px 32px; }
.native-page-intro { padding: 8px 4px 12px; }
.native-page-symbol { display: grid; place-items: center; width: 48px; height: 48px; margin-bottom: 20px; border-radius: 15px; background: var(--fill); color: var(--primary); }
.native-page-symbol :deep(svg) { width: 25px; height: 25px; }
.native-page-intro h1 { margin: 0 0 12px; font-size: 28px; line-height: 1.4; font-weight: var(--font-weight-title, 700); }
.native-page-intro p, .native-page-footnote { margin: 0; color: var(--text-secondary); font-size: 14px; line-height: 1.8; }
.native-page-counter, .native-page-meta { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin: 22px 0; font-size: 14px; }
.native-page-meta { color: var(--text-secondary); font-size: 13px; }
.native-page-error { color: var(--danger); font-size: 13px; line-height: 1.7; }
.native-page-footnote { padding: 0 4px; text-align: center; font-size: 12px; }
</style>
