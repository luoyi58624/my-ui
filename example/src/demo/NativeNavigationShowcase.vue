<script setup lang="ts">
import { ref } from 'vue'
import { Button, Card, Icon, Input } from '@my-ui/vue'
import { canOpenNativePage, openNativePage } from '../native-page'
import { updateDemoCache, useSharedDemoStore } from '../stores/shared'

const emit = defineEmits<{ notify: [message: string] }>()
const available = canOpenNativePage()
const opening = ref(false)
const shared = useSharedDemoStore()

async function open() {
  if (!available) {
    window.open(new URL('/native-page.html', location.href), '_blank', 'noopener')
    return
  }
  if (opening.value) return
  opening.value = true
  try { await shared.$shared?.flush(); await openNativePage() }
  catch (error) { emit('notify', error instanceof Error ? error.message : String(error)) }
  finally { opening.value = false }
}

async function updateCache() {
  try { await updateDemoCache() }
  catch (error) { emit('notify', error instanceof Error ? error.message : String(error)) }
}
</script>

<template>
  <Card id="native-navigation" title="跨页共享状态" description="两页共用备注和计数，重新打开也能恢复" sample="SHARED STATE">
    <Input v-model="shared.note" label="共享备注" clearable />
    <div class="native-navigation-actions">
      <Button variant="outline" @click="shared.count++">共享计数 {{ shared.count }}</Button>
      <Button :loading="opening" @click="open">{{ available ? '打开原生页面' : '打开另一页' }} <Icon name="arrow-right" /></Button>
      <Button variant="text" @click="updateCache">从本地更新</Button>
      <Button variant="text" @click="shared.$reset()">重置数据</Button>
    </div>
    <p class="native-navigation-note">{{ available ? '在新页面修改后返回，这里也会更新。系统返回保留首页的滚动位置。' : '打开另一标签页，试试两边修改；刷新页面后，已保存的内容仍在。' }}</p>
    <p v-if="shared.$shared?.error" class="native-navigation-error" role="alert">本地同步失败：{{ shared.$shared.error.message }}</p>
  </Card>
</template>

<style scoped>
#native-navigation { margin-bottom: 24px; scroll-margin-top: 140px; }
.native-navigation-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 20px; }
.native-navigation-actions :deep(svg) { width: 16px; height: 16px; }
.native-navigation-note { margin: 16px 0 0; color: var(--text-secondary); font-size: 13px; line-height: 1.8; }
.native-navigation-error { color: var(--danger); font-size: 13px; line-height: 1.8; }
</style>
