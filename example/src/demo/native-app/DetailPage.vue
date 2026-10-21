<script setup lang="ts">
import { ref } from 'vue'
import { Button, Card, Input } from '@my-ui/vue'
import { AppBar, useApp } from 'tauri-plugin-native-components/vue'

defineProps<{
  /** Vue Router 通过 props: true 传入的记录编号。 */
  id: string
}>()
const app = useApp()
const note = ref(''), error = ref('')
async function back() {
  try { await app.back() }
  catch (reason) { error.value = String(reason) }
}
</script>

<template>
  <AppBar class="app-detail-toolbar" title="记录详情" back back-label="返回 App" @back="back" />
  <main class="app-detail-page" data-app-detail>
    <span class="app-detail-kicker">A MOMENT TO REMEMBER</span>
    <h1>第 {{ id }} 份记录</h1>
    <p>这是独立页面，底部导航会暂时隐藏。返回后，刚才的栏目和草稿继续保留。</p>
    <Card title="补充一点细节" description="独立页面也有自己的输入状态。">
      <Input v-model="note" label="记录补充" placeholder="这一刻，你想记住什么？" clearable />
      <Button class="app-detail-back" @click="back">返回刚才的位置</Button>
      <p v-if="error" role="alert">{{ error }}</p>
    </Card>
  </main>
</template>

<style scoped>
.app-detail-toolbar { position: sticky; top: 0; z-index: 1; }
.app-detail-page { box-sizing: border-box; width: min(100%, 680px); margin: auto; padding: 38px 20px; }
.app-detail-kicker { color: var(--primary); font-size: 11px; letter-spacing: 2px; }
.app-detail-page h1 { margin: 14px 0 12px; font-size: 29px; line-height: 1.4; font-weight: var(--font-weight-title, 700); }
.app-detail-page > p { margin: 0 0 30px; color: var(--text-secondary); font-size: 14px; line-height: 1.9; }
.app-detail-back { margin-top: 20px; }
</style>
