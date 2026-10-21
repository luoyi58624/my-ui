<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { Page, type NavigationAction, type PageHandle } from 'tauri-plugin-native-components/vue'
import DemoAppBar from '../../../components/DemoAppBar.vue'
import { Button, popup } from '@my-ui/vue'
import { closePage, isAndroidNative } from '../../../commons/navigation'
import { useNativeBarsSuspended } from '../../../commons/native-components'

const page = ref<PageHandle>(),
  refreshing = ref(false),
  count = ref(0),
  error = ref('')
const updated = ref('下拉获取最新动态'),
  suspended = useNativeBarsSuspended()
const entries = ref(
  Array.from({ length: 18 }, (_, index) => ({
    id: index,
    title: ['把想法记下来', '留一点时间给自己', '发现生活里的新鲜事'][index % 3],
    time: `${index + 1} 小时前`
  }))
)
const actions: NavigationAction[] = [
  {
    value: 'refresh',
    label: '刷新',
    icon: {
      paths: [
        'M20 7v5h-5',
        'M4 17v-5h5',
        'M6.1 7a7 7 0 0 1 11.6-2L20 8',
        'M4 16l2.3 3A7 7 0 0 0 17.9 17'
      ]
    }
  }
]
const continuousRefresh = isAndroidNative()
let timer: ReturnType<typeof setTimeout> | undefined

function refresh() {
  error.value = ''
  // 本地示例模拟请求耗时，实际业务在 finally 中结束 refreshing。
  timer = setTimeout(() => {
    count.value++
    entries.value = [
      { id: -count.value, title: `新的灵感已送达 · ${count.value}`, time: '刚刚' },
      ...entries.value
    ].slice(0, 24)
    updated.value = `已更新 ${count.value} 次 · ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`
    refreshing.value = false
  }, 1200)
}
function back() {
  void closePage('/native').catch((reason) => {
    error.value = String(reason)
  })
}
function onAction() {
  page.value?.refresh()
}
function openDialog() {
  void popup.showAlert({
    title: '稍作停留',
    message: '关闭后可以继续下拉刷新，列表位置会保留。',
    confirmText: '继续浏览'
  })
}
onBeforeUnmount(() => {
  clearTimeout(timer)
})
</script>

<template>
  <Page
    ref="page"
    class="refresh-demo"
    refreshable
    v-model:refreshing="refreshing"
    :suspended="suspended"
    @refresh="refresh"
    @error="error = String($event)"
  >
    <template #navbar
      ><DemoAppBar
        title="最新动态"
        back
        :actions="actions"
        @back="back"
        @action="onAction"
        @error="error = String($event)"
    /></template>
    <div class="refresh-demo-content">
      <div class="refresh-demo-intro">
        <span>保持好奇</span>
        <h1>今天，也有新发现</h1>
        <p>{{ updated }}</p>
      </div>
      <div class="refresh-demo-actions">
        <Button variant="outline" :disabled="refreshing" @click="page?.refresh()">{{
          refreshing ? '正在更新…' : '刷新动态'
        }}</Button
        ><Button variant="text" @click="openDialog">打开弹窗</Button>
      </div>
      <p v-if="error" class="refresh-demo-error" role="alert">{{ error }}</p>
      <div class="refresh-demo-list">
        <article v-for="(entry, index) in entries" :key="entry.id" class="refresh-demo-item">
          <span class="refresh-demo-number">{{ String(index + 1).padStart(2, '0') }}</span>
          <div>
            <h2>{{ entry.title }}</h2>
            <p>{{ entry.time }}</p>
          </div>
          <span class="refresh-demo-dot" />
        </article>
      </div>
      <p class="refresh-demo-hint">
        {{
          continuousRefresh
            ? '滚到顶部继续下拉，向上推回后继续浏览'
            : '回到列表顶部，下拉查看新动态'
        }}
      </p>
    </div>
  </Page>
</template>

<style scoped>
.refresh-demo {
  height: 100dvh;
}
.refresh-demo-content {
  width: min(100%, 760px);
  box-sizing: border-box;
  margin: auto;
  padding: 28px 20px;
}
.refresh-demo-intro > span {
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--primary);
}
.refresh-demo-intro h1 {
  margin: 10px 0;
  font-size: 26px;
  font-weight: var(--font-weight-title, 700);
}
.refresh-demo-intro p,
.refresh-demo-hint {
  color: var(--text-secondary);
  font-size: 13px;
}
.refresh-demo-actions {
  display: flex;
  gap: 8px;
  margin: 24px 0;
}
.refresh-demo-list {
  overflow: hidden;
  border-radius: 20px;
  background: var(--card-background);
}
.refresh-demo-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}
.refresh-demo-item + .refresh-demo-item {
  border-top: 1px solid var(--border);
}
.refresh-demo-number {
  color: var(--primary);
  font-size: 15px;
  font-variant-numeric: tabular-nums;
}
.refresh-demo-item h2 {
  font-size: 15px;
  font-weight: var(--font-weight-subtitle, 600);
  margin: 0 0 6px;
}
.refresh-demo-item p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}
.refresh-demo-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary);
  margin-left: auto;
  opacity: 0.4;
}
.refresh-demo-hint {
  text-align: center;
  margin-top: 24px;
}
.refresh-demo-error {
  color: var(--danger);
  font-size: 13px;
}
</style>
