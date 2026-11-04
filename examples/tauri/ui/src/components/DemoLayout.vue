<script setup lang="ts">
import { computed, inject, provide, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { Tabbar } from '@my-ui/vue'
import { demoNavigationKey } from '@demo/commons/navigation'
import { notifyKey } from '@demo/commons/notify'
import DemoTabPage from './DemoTabPage.vue'
import { demoLayoutKey, type DemoTab } from '@demo/components/layoutContext'

const { navigation } = inject(demoNavigationKey)!
const notify = inject(notifyKey)!
const items: DemoTab[] = [
  { value: 'home', label: '首页', title: '组件示例', icon: 'home' },
  { value: 'native', label: '应用', title: '应用与平台', icon: 'grid' },
  { value: 'messages', label: '消息', title: '消息', icon: 'message', demo: 2 },
  { value: 'settings', label: '设置', title: '设置', icon: 'sliders' }
]
const route = useRoute()
const active = ref('home')
const visited = ref<string[]>([])
const isTab = computed(() => typeof route.meta.tab === 'string')
function report(reason: unknown) {
  notify(reason instanceof Error ? reason.message : String(reason))
}
function select(value: string) {
  if (value !== active.value || !isTab.value) void navigation.replace('/' + value).catch(report)
}
provide(demoLayoutKey, { report })
watch(() => route.meta.tab, (tab) => {
  if (typeof tab !== 'string' || !items.some(item => item.value === tab)) return
  active.value = tab
  // 首次访问才创建，之后只切可见性，输入、滚动和局部状态自然保留。
  if (!visited.value.includes(tab)) visited.value.push(tab)
}, { immediate: true })
</script>

<template>
  <div class="demo-app">
    <div v-show="isTab" class="demo-tab-pages" :inert="!isTab" :aria-hidden="!isTab || undefined">
      <template v-for="item in items" :key="item.value">
        <DemoTabPage v-if="visited.includes(item.value)" v-show="active === item.value" :page="item" :active="isTab && active === item.value" />
      </template>
    </div>
    <div v-show="!isTab" class="demo-route-pages">
      <RouterView v-slot="{ Component, route: current }">
        <KeepAlive :max="12"><component :is="Component" v-if="Component && !isTab" :key="current.path" /></KeepAlive>
      </RouterView>
    </div>
    <Tabbar v-show="isTab" data-demo-tabbar :model-value="active" :options="items" label="主要栏目" @update:model-value="select" />
  </div>
</template>

<style>
.demo-app {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  min-height: 0;
  padding-top: env(safe-area-inset-top);
  box-sizing: border-box;
  background: var(--background);
}
.demo-tab-pages, .demo-route-pages { flex: 1; min-height: 0; overflow: hidden; }
.demo-app > [data-demo-tabbar] { flex: none; }
.demo-tabs {
  height: 100%;
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
</style>
