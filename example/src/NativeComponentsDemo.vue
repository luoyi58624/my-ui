<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button, Icon, type IconName } from '@my-ui/vue'
import { AppBar, BottomNavigation, Page, Tabs, type NavigationAction, type NavigationItem } from 'tauri-plugin-native-components/vue'
import { closePage } from './navigation'
import { useNativeBarsSuspended } from './native-components'

const props = defineProps<{ kind: 'app-bar' | 'bottom-navigation' | 'tabs' }>()
const suspended = useNativeBarsSuspended()
const centered = ref(true), subtitle = ref(true), selected = ref('daily'), tab = ref('daily'), message = ref('')
const counts = ref<Record<string, number>>({ daily: 0, saved: 0, profile: 0 })
const title = computed(() => ({ 'app-bar': '顶部导航', 'bottom-navigation': '底部导航', tabs: '页面切换' })[props.kind])
const items: NavigationItem[] = [
  { value: 'daily', label: '动态', icon: 'home' },
  { value: 'saved', label: '收藏', icon: 'grid', badge: 2 },
  { value: 'profile', label: '我的', icon: 'user' },
]
const actions: NavigationAction[] = [{ value: 'action', label: '页面操作', icon: 'sliders' }]
const current = computed(() => items.find(item => item.value === (props.kind === 'tabs' ? tab.value : selected.value))!)
const currentIcon = computed(() => current.value.icon as IconName)
const nativeItems = computed(() => items.map((item, index) => ({ ...item, nativeView: 'demo', nativeProps: {
  title: item.label, badge: `PAGE ${String(index + 1).padStart(2, '0')}`, count: counts.value[item.value],
  description: '切换标签，回来后计数会保留。', homeLabel: '返回原生目录',
} })))

function back() { void closePage('/native').catch(error => { message.value = String(error) }) }
function tabAction(event: { tab: string; value: string }) {
  if (event.value === 'increment') counts.value[event.tab]++
  else if (event.value === 'home') back()
}
</script>

<template>
  <Page class="native-component-demo" :suspended="suspended" :data-component-demo="kind">
    <template #navbar>
      <AppBar :title="title" :subtitle="kind === 'app-bar' && subtitle ? '标题、返回与操作' : undefined" back back-label="返回原生组件"
        :center="kind !== 'app-bar' || centered" :actions="kind === 'app-bar' ? actions : []" @back="back" @action="message = '已点击页面操作'" @error="message = String($event)" />
    </template>
    <div class="native-component-stage">
      <Tabs v-if="kind === 'tabs'" v-model="tab" class="native-component-tabs" :items="nativeItems" :suspended="suspended" label="示例页面" @action="tabAction" @error="message = String($event)">
        <div class="native-component-content">
          <span class="native-component-symbol"><Icon :name="currentIcon" /></span>
          <h1>{{ current.label }}</h1><p>切换标签，回来后计数会保留。</p>
          <Button variant="outline" @click="counts[tab]++">点一下 · {{ counts[tab] }}</Button>
          <Button variant="text" @click="back">返回原生目录</Button>
        </div>
      </Tabs>
      <template v-else>
        <div class="native-component-content">
          <span class="native-component-symbol"><Icon :name="kind === 'app-bar' ? 'arrow-right' : currentIcon" /></span>
          <h1>{{ kind === 'app-bar' ? '每个操作，各就其位' : current.label }}</h1>
          <p>{{ kind === 'app-bar' ? '试试返回、页面操作和标题对齐。' : '选择底部标签，查看选中状态与角标。' }}</p>
          <template v-if="kind === 'app-bar'">
            <Button variant="outline" @click="centered = !centered">{{ centered ? '标题靠左' : '标题居中' }}</Button>
            <Button variant="text" @click="subtitle = !subtitle">{{ subtitle ? '隐藏副标题' : '显示副标题' }}</Button>
          </template>
          <Button v-else variant="outline" @click="counts[selected]++">点一下 · {{ counts[selected] }}</Button>
        </div>
        <BottomNavigation v-if="kind === 'bottom-navigation'" v-model="selected" :items="items" :suspended="suspended" label="示例底部导航" @error="message = String($event)" />
      </template>
      <p v-if="message" class="native-component-message" role="status">{{ message }}</p>
    </div>
  </Page>
</template>

<style scoped>
.native-component-demo { height: 100dvh; }
.native-component-stage { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.native-component-tabs { flex: 1; min-height: 0; }
.native-component-tabs :deep(.nc-tabs-navigation) { padding: 0; }
.native-component-content { display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; gap: 12px; box-sizing: border-box; height: 100%; min-height: 0; overflow: auto; padding: 24px; text-align: center; }
.native-component-symbol { display: grid; place-items: center; width: 64px; height: 64px; flex: none; border-radius: 20px; margin-bottom: 8px; background: var(--fill); color: var(--primary); }
.native-component-symbol svg { width: 28px; height: 28px; }
.native-component-content h1 { margin: 0; font-size: 24px; font-weight: var(--font-weight-title, 700); }
.native-component-content p { margin: 0 0 12px; color: var(--text-secondary); font-size: 14px; line-height: 1.8; }
.native-component-message { margin: 0; padding: 10px 16px; background: var(--card-background); color: var(--primary); font-size: 13px; text-align: center; }
</style>
