<script setup lang="ts">
import { provide, ref, useSlots, watch } from 'vue'
import { useRoute } from 'vue-router'
import { App, Tabbar, type AppTab } from 'tauri-plugin-native-components/vue'
import { navigation } from '../commons/navigation'
import DemoTabPage from './DemoTabPage.vue'
import { demoPages } from '../demo/routes'
import { demoLayoutKey, type DemoTab } from './layoutContext'

const emit = defineEmits<{
  /** 将主 Demo 的导航失败交给统一提示。 */
  navigationError: [message: string]
}>()
const items: DemoTab[] = [
  { value: 'home', label: '首页', title: '组件示例', icon: 'home' },
  { value: 'native', label: '原生', title: '原生组件', icon: 'grid' },
  { value: 'messages', label: '消息', title: '消息', icon: 'message', demo: 2 },
  { value: 'profile', label: '我的', title: '我的', icon: 'user' },
]
const tabs: AppTab[] = items.map(page => ({ value: page.value, component: DemoTabPage, props: { page } }))
const active = ref('home'), route = useRoute()
function report(reason: unknown) { emit('navigationError', reason instanceof Error ? reason.message : String(reason)) }
function select(value: string) {
  active.value = value
  void navigation.replace('/' + value).catch(report)
}
provide(demoLayoutKey, { content: useSlots(), report })
watch(() => route.meta.tab, () => {
  if (!route.meta.tab) return
  const value = String(route.meta.tab)
  active.value = items.some(item => item.value === value) ? value : 'home'
}, { immediate: true })
</script>

<template>
  <App class="demo-app" :model-value="active" :tabs="tabs" :pages="demoPages" @update:model-value="select">
    <template #tabbar="{ value, select }">
      <Tabbar :model-value="value" :items="items" @update:model-value="select" />
    </template>
  </App>
</template>

<style>

.demo-app {
  height: 100dvh;
  background: var(--background);
}
.demo-tabs {
  height: 100%;
}
.demo-main {
  height: 100%;
  position: relative;
  min-width: 0;
  min-height: 0;
}
.demo-page {
  position: absolute;
  inset: 0;
  overflow: auto;
  overscroll-behavior-y: contain;
  padding: 24px max(20px, env(safe-area-inset-right)) 32px max(20px, env(safe-area-inset-left));
  scrollbar-gutter: stable;
}
.demo-page-inner {
  --card-radius: 18px;
  --card-padding: 24px;
  --card-header-gap: 20px;
  width: 100%;
  margin: auto;
}
.demo-detail {
  background: var(--card-background);
  padding-top: 32px;
}
.demo-page-inner > :first-child {
  margin-top: 0;
}
.demo-page-inner .my-sample-id[data-my-card] {
  flex: none;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--fill);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.06em;
}
.demo-catalog {
  max-width: 480px;
  margin: auto;
}
.demo-intro {
  margin: 4px 2px 28px;
}
.demo-intro h2 {
  margin: 0;
  font-size: 23px;
  line-height: 1.4;
  font-weight: var(--font-weight-title, 700);
}
.demo-catalog-groups {
  display: grid;
  gap: 28px;
}
.demo-catalog-group {
  min-width: 0;
}
.demo-catalog-group h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 2px 10px;
  font-size: 14px;
  color: var(--text);
  font-weight: var(--font-weight-subtitle, 600);
}
.demo-catalog-group h3 span {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: var(--font-weight, 400);
  font-variant-numeric: tabular-nums;
}
.demo-catalog-group .my-group-body {
  background: var(--card-background);
  border: 0;
  border-radius: 18px;
  box-shadow: var(--shadow);
}
.demo-catalog-group .my-list-row {
  min-height: 60px;
  --list-padding-inline: 18px;
  --list-padding-block: 12px;
}
.demo-catalog-group .my-trailing-icon {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
}
.demo-catalog-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  color: var(--primary);
  background: var(--fill);
}
.demo-catalog-icon svg {
  width: 19px;
  height: 19px;
}
.demo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  text-align: center;
  padding: 24px;
}
.demo-placeholder-icon {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 24px;
  color: var(--primary);
  background: var(--fill);
  margin-bottom: 24px;
}
.demo-placeholder-icon svg {
  width: 30px;
  height: 30px;
}
.demo-placeholder-label {
  color: var(--text-secondary);
  font-size: 11px;
  letter-spacing: 2px;
}
.demo-placeholder h2 {
  margin: 10px 0;
  font-size: 24px;
}
.demo-placeholder > .my-button {
  margin-top: 10px;
}
.demo-placeholder p {
  margin: 0 0 28px;
  color: var(--text-secondary);
  font-size: 14px;
}
@media (max-width: 760px) {
  .demo-page {
    padding: 20px max(14px, env(safe-area-inset-right)) 24px max(14px, env(safe-area-inset-left));
  }
}
@media (max-width: 600px) {
  .demo-page-inner {
    --card-radius: 16px;
    --card-padding: 20px;
  }
}

.demo-view { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.demo-view > .demo-tabs, .demo-view > .demo-main { flex: 1; height: auto; min-height: 0; }
.demo-view > .demo-top { flex: none; }

</style>
