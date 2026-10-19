<script setup lang="ts">
import { ref } from 'vue'
import { Button, Card, Icon, Input } from '@my-ui/vue'
import { canOpenNativePage, openNativePage } from '../native-page'

const emit = defineEmits<{ notify: [message: string] }>()
const available = canOpenNativePage()
const opening = ref(false)
const note = ref('返回以后，这里的内容还在')
const count = ref(0)

async function open() {
  if (opening.value) return
  opening.value = true
  try { await openNativePage() }
  catch (error) { emit('notify', error instanceof Error ? error.message : String(error)) }
  finally { opening.value = false }
}
</script>

<template>
  <Card id="native-navigation" title="原生页面跳转" description="打开新页面，再用系统手势返回" sample="NATIVE PAGE">
    <Input v-model="note" label="上一页的备注" clearable />
    <div class="native-navigation-actions">
      <Button variant="outline" @click="count++">上一页计数 {{ count }}</Button>
      <Button :disabled="!available" :loading="opening" @click="open">打开原生页面 <Icon name="arrow-right" /></Button>
    </div>
    <p class="native-navigation-note">{{ available ? '先修改备注或计数，再进入新页面。返回时，内容和滚动位置会留在这里。' : '请在 Android App 中体验；此示例使用系统页面返回与转场。' }}</p>
  </Card>
</template>

<style scoped>
#native-navigation { margin-bottom: 24px; scroll-margin-top: 140px; }
.native-navigation-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 20px; }
.native-navigation-actions :deep(svg) { width: 16px; height: 16px; }
.native-navigation-note { margin: 16px 0 0; color: var(--text-secondary); font-size: 13px; line-height: 1.8; }
</style>
