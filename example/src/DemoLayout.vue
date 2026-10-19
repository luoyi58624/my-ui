<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, type ComponentPublicInstance } from 'vue'
import { AppBar, Navigation, type Option } from '@my-ui/vue'
import ThemeSettings from './demo/ThemeSettings.vue'

const pages: (Option & { title: string; anchor: string })[] = [
  { value: 'components', label: '基础', title: '基础组件', icon: 'grid', anchor: 'actions' },
  { value: 'forms', label: '表单', title: '输入与选择', icon: 'sliders', anchor: 'controls' },
  { value: 'feedback', label: '反馈', title: '反馈与交互', icon: 'message', anchor: 'feedback' },
  { value: 'examples', label: '示例', title: '完整示例', icon: 'layer', anchor: 'scenarios' },
]
const active = ref('components')
const current = computed(() => pages.find(page => page.value === active.value)!)
const elements = new Map<string, HTMLElement>(), positions = new Map<string, number>()
let navigationVersion = 0

function setPageElement(value: string, element: Element | ComponentPublicInstance | null) {
  if (element instanceof HTMLElement) elements.set(value, element)
  else elements.delete(value)
}

async function selectPage(value: string, target?: HTMLElement, reset = false) {
  if (value !== active.value) {
    const previous = elements.get(active.value)
    if (previous?.offsetHeight) positions.set(active.value, previous.scrollTop)
  }
  active.value = value
  const version = ++navigationVersion
  await nextTick()
  if (version !== navigationVersion) return
  const page = elements.get(value)
  if (!page) return
  // 页面自己滚动，导航栏与系统安全区始终留在原位。
  const top = target
    ? target.getBoundingClientRect().top - page.getBoundingClientRect().top + page.scrollTop - 20
    : reset ? 0 : positions.get(value) ?? 0
  page.scrollTo({ top: Math.max(0, top), behavior: 'instant' })
}

function navigate(value: string) {
  const page = pages.find(page => page.value === value)
  if (!page) return
  const reset = active.value === value
  // 底部分类属于同一级，不向 Activity 的 WebView 返回历史叠加记录。
  history.replaceState(history.state, '', '#' + page.anchor)
  void selectPage(value, undefined, reset)
}

function followHash() {
  let anchor = ''
  try { anchor = decodeURIComponent(location.hash.slice(1)) } catch { /* 非法片段回到默认页。 */ }
  const target = document.getElementById(anchor)
  const value = target?.closest<HTMLElement>('[data-demo-page]')?.dataset.demoPage
    ?? pages.find(page => page.value === anchor || page.anchor === anchor)?.value
    ?? 'components'
  const page = pages.find(page => page.value === value)!
  void selectPage(value, target && anchor !== page.anchor ? target : undefined, true)
}

onMounted(() => {
  document.documentElement.classList.add('my-demo-app')
  window.addEventListener('hashchange', followHash)
  window.addEventListener('popstate', followHash)
  followHash()
})
onBeforeUnmount(() => {
  navigationVersion++
  document.documentElement.classList.remove('my-demo-app')
  window.removeEventListener('hashchange', followHash)
  window.removeEventListener('popstate', followHash)
})
</script>

<template>
  <div class="demo-app">
    <div class="demo-top">
      <AppBar :title="current.title" class="demo-app-bar">
        <template #leading><span class="demo-brand"><img src="/favicon.svg" alt="" width="28" height="28" /><strong>my-ui</strong></span></template>
        <h1 class="demo-title">{{ current.title }}</h1>
        <template #actions><ThemeSettings /></template>
      </AppBar>
    </div>
    <main class="demo-main" :aria-label="current.title">
      <section v-for="page in pages" v-show="active === page.value" :key="page.value"
        :ref="element => setPageElement(page.value, element)" class="demo-page"
        :data-demo-page="page.value" :aria-label="page.title"
        :inert="active !== page.value" :aria-hidden="active !== page.value ? true : undefined">
        <div class="demo-page-inner"><slot :name="page.value" /></div>
      </section>
    </main>
    <div class="demo-bottom"><Navigation class="demo-navigation" :model-value="active" :options="pages" label="示例分类" @update:model-value="navigate" /></div>
  </div>
</template>

<style scoped>
:global(html.my-demo-app), :global(html.my-demo-app body) { height: 100%; overflow: hidden; padding: 0; scrollbar-gutter: auto; }
.demo-app { display: grid; grid-template-rows: calc(57px + env(safe-area-inset-top)) minmax(0, 1fr) calc(65px + env(safe-area-inset-bottom)); height: 100dvh; background: var(--background); }
.demo-top { padding-top: env(safe-area-inset-top); border-bottom: 1px solid var(--border); background: var(--card-background); z-index: 40; }
.demo-top :deep(.my-app-bar) { height: 56px; min-height: 56px; width: min(100%, 1160px); margin: auto; padding: 6px max(12px, env(safe-area-inset-left)) 6px max(12px, env(safe-area-inset-right)); border: 0; }
.demo-brand { display: flex; align-items: center; gap: 8px; white-space: nowrap; }
.demo-brand img { display: block; border-radius: 8px; }
.demo-brand strong { font-size: 14px; font-weight: var(--font-weight-title, 700); }
.demo-title { margin: 0; font: inherit; font-weight: var(--font-weight-subtitle, 600); }
.demo-main { position: relative; min-width: 0; min-height: 0; }
.demo-page { position: absolute; inset: 0; overflow: auto; overscroll-behavior-y: contain; padding: 24px max(20px, env(safe-area-inset-right)) 32px max(20px, env(safe-area-inset-left)); scrollbar-gutter: stable; }
.demo-page-inner { width: min(100%, 1120px); margin: auto; }
.demo-bottom { padding: 0 env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left); border-top: 1px solid var(--border); background: var(--card-background); z-index: 40; }
.demo-bottom :deep(.my-navigation) { width: min(100%, 680px); height: 64px; min-height: 64px; margin: auto; padding: 5px 8px; border: 0; border-radius: 0; background: transparent; }
.demo-bottom :deep(button) { gap: 4px; min-height: 48px; }
@media (max-width: 760px) { .demo-page { padding: 20px max(14px, env(safe-area-inset-right)) 24px max(14px, env(safe-area-inset-left)); } }
@media (max-width: 360px) { .demo-brand { gap: 5px; } .demo-brand strong { font-size: 12px; } .demo-brand img { width: 24px; height: 24px; } }
</style>
