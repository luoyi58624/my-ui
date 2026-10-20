<script setup lang="ts">
import { computed, nextTick, onActivated, onDeactivated, onBeforeUnmount, ref, watch, type ComponentPublicInstance } from 'vue'
import { useRoute } from 'vue-router'
import { Button, CellGroup, Icon, ListRow } from '@my-ui/vue'
import { Tabs, type NavigationItem } from 'tauri-plugin-native-components/vue'
import DemoAppBar from './DemoAppBar.vue'
import ExampleCode from './demo/ExampleCode.vue'
import { useNativeBarsSuspended } from './native-components'
import { demoExamples, demoGroups, nativeDemoGroups } from './demo/catalog'
import { closePage, isChildPage, navigation, openPage } from './navigation'

const emit = defineEmits<{
  /** 跳转或关闭失败时交给应用展示错误。 */
  navigationError: [message: string]
}>()

const pages: (NavigationItem & { title: string; demo?: number; icon: 'home' | 'grid' | 'message' | 'user' })[] = [
  { value: 'home', label: '首页', title: '组件示例', icon: 'home' },
  { value: 'native', label: '原生', title: '原生组件', icon: 'grid' },
  { value: 'messages', label: '消息', title: '消息', icon: 'message', demo: 2 },
  { value: 'profile', label: '我的', title: '我的', icon: 'user', demo: 3 },
]
const counts = ref<Record<string, number>>({ messages: 0, profile: 0 })
const nativePages = computed(() => pages.map(page => ({ ...page, ...(page.demo ? { nativeView: 'demo', nativeProps: { title: page.title, demo: page.demo, count: counts.value[page.value] } } : {}) })))
const active = ref('home'), visited = ref(new Set<string>())
const example = computed(() => demoExamples.find(item => active.value === 'example/' + item.id))
const title = computed(() => example.value?.title ?? pages.find(page => page.value === active.value)?.title ?? '组件示例')
const openedExamples = computed(() => demoExamples.filter(item => visited.value.has(item.id)))
const titleElement = ref<InstanceType<typeof DemoAppBar>>()
const suspended = useNativeBarsSuspended()
const elements = new Map<string, HTMLElement>(), positions = new Map<string, number>()
const route = useRoute()
const activated = ref(true), visible = ref(!document.hidden)
const updateVisibility = () => { visible.value = !document.hidden }
document.addEventListener('visibilitychange', updateVisibility)
onActivated(() => { activated.value = true })
onDeactivated(() => { activated.value = false })
let navigationVersion = 0, returning = false, lastEntry: string | undefined

function setPageElement(value: string, element: Element | ComponentPublicInstance | null) {
  if (element instanceof HTMLElement) elements.set(value, element)
  else elements.delete(value)
}

async function selectPage(value: string, reset = false, anchor?: string) {
  const previousExample = example.value
  if (value !== active.value) {
    const previous = elements.get(active.value)
    if (previous?.offsetHeight) positions.set(active.value, previous.scrollTop)
  }
  const id = value.startsWith('example/') ? value.slice(8) : undefined
  if (id) visited.value.add(id)
  active.value = value
  const version = ++navigationVersion
  await nextTick()
  if (version !== navigationVersion) return
  const page = elements.get(value)
  if (!page) return
  const target = anchor ? document.getElementById(anchor) : undefined
  const top = target && page.contains(target)
    ? target.getBoundingClientRect().top - page.getBoundingClientRect().top + page.scrollTop - 20
    : reset ? 0 : positions.get(value) ?? 0
  page.scrollTo({ top: Math.max(0, top), behavior: 'instant' })
  const entry = previousExample ?? demoExamples.find(item => item.id === lastEntry)
  if (entry?.catalog === value) {
    page.querySelector<HTMLElement>('[data-demo-link="' + entry.id + '"]')?.focus({ preventScroll: true })
    lastEntry = undefined
  } else if (id) titleElement.value?.focus()
}

function navigate(value: string) {
  if (!pages.some(page => page.value === value)) return
  // 底部同级切换留在当前主页面，只有组件入口调用跨页导航。
  if (active.value === value) void selectPage(value, true)
  void navigation.replace('/' + value).catch(reportError)
}

function tabAction(event: { tab: string; value: string }) {
  if (event.value === 'home') navigate('home')
  else if (event.value === 'increment') counts.value[event.tab] = (counts.value[event.tab] ?? 0) + 1
}

function openExample(id: string) {
  const item = demoExamples.find(item => item.id === id)
  if (!item) return
  const page = elements.get(active.value)
  if (page?.offsetHeight) positions.set(active.value, page.scrollTop)
  lastEntry = id
  void openPage(item.path ?? '/example/' + id, { title: item.title }).catch(reportError)
}

function reportError(error: unknown) {
  returning = false
  emit('navigationError', error instanceof Error ? error.message : String(error))
}

function goBack() {
  if (returning) return
  returning = true
  void closePage('/' + (example.value?.catalog ?? 'home')).catch(reportError)
}

function followRoute() {
  if (route.name !== 'demo') {
    const previous = elements.get(active.value)
    if (previous?.offsetHeight) positions.set(active.value, previous.scrollTop)
    return
  }
  returning = false
  let anchor = ''
  try { anchor = decodeURIComponent(route.path.replace(/^\//, '')) } catch { /* 非法片段回到首页。 */ }
  const item = demoExamples.find(item => anchor === 'example/' + item.id || anchor === item.id || item.anchors?.includes(anchor))
  if (item?.path) { void navigation.replace(item.path).catch(reportError); return }
  const value = item ? 'example/' + item.id : anchor === 'discover' ? 'native' : pages.find(page => page.value === anchor)?.value ?? 'home'
  void selectPage(value, false, item && !anchor.startsWith('example/') ? anchor : undefined)
}

watch(() => route.fullPath, followRoute, { immediate: true })
onBeforeUnmount(() => {
  navigationVersion++
  document.removeEventListener('visibilitychange', updateVisibility)
})
</script>

<template>
  <div class="demo-app" :class="{ 'demo-app-detail': example }">
    <div class="demo-top">
      <DemoAppBar ref="titleElement" :title="title" :back="!!example" :code-id="example?.id" :back-label="isChildPage() ? '返回上一页' : example?.catalog === 'native' ? '返回原生组件' : '返回组件列表'" class="demo-app-bar" @back="goBack" />
    </div>
    <Tabs class="demo-tabs" :model-value="active" :items="nativePages" :navigation-visible="!example" :suspended="suspended" @select="navigate" @action="tabAction" @error="console.error">
    <main class="demo-main" :aria-label="title">
      <section v-for="page in pages" v-show="active === page.value" :key="page.value"
        :ref="element => setPageElement(page.value, element)" class="demo-page"
        :data-demo-page="page.value" :aria-label="page.title"
        :inert="active !== page.value" :aria-hidden="active !== page.value ? true : undefined">
        <div v-if="page.value === 'home' || page.value === 'native'" class="demo-catalog">
          <div class="demo-intro"><h2>{{ page.value === 'native' ? '原生组件' : '组件目录' }}</h2><p>{{ page.value === 'native' ? '体验导航、页面切换与下拉刷新。' : '选择组件，查看交互效果与用法代码。' }}</p></div>
          <div class="demo-catalog-groups">
            <section v-for="group in page.value === 'native' ? nativeDemoGroups : demoGroups" :key="group.title" class="demo-catalog-group" :aria-label="group.title">
              <h3>{{ group.title }}<span>{{ group.items.length }}</span></h3>
              <CellGroup :label="group.title">
                <ListRow v-for="item in group.items" :key="item.id" :data-demo-link="item.id"
                  :title="item.title" :description="item.description" @click="openExample(item.id)">
                  <template #leading><span class="demo-catalog-icon"><Icon :name="item.icon" /></span></template>
                </ListRow>
              </CellGroup>
            </section>
          </div>
        </div>
        <div v-else class="demo-placeholder">
          <span class="demo-placeholder-icon"><Icon :name="page.icon!" /></span>
          <span class="demo-placeholder-label">DEMO {{ page.demo }}</span>
          <h2>{{ page.title }}</h2><p>这是预留的 Demo 页面。</p>
          <Button variant="outline" @click="counts[page.value]++">点一下 · {{ counts[page.value] }}</Button>
          <Button variant="outline" @click="navigate('home')">浏览组件</Button>
        </div>
      </section>
      <section v-for="item in openedExamples" v-show="example?.id === item.id" :key="item.id"
        :ref="element => setPageElement('example/' + item.id, element)" class="demo-page demo-detail"
        :data-demo-page="'example/' + item.id" :aria-label="item.title"
        :inert="example?.id !== item.id" :aria-hidden="example?.id !== item.id ? true : undefined">
        <div class="demo-page-inner">
          <slot :name="item.id" :active="activated && visible && route.name === 'demo' && example?.id === item.id" />
          <ExampleCode :id="item.id" />
        </div>
      </section>
    </main>
    </Tabs>
  </div>
</template>

<style scoped>
.demo-app { display: grid; grid-template-rows: calc(57px + env(safe-area-inset-top)) minmax(0, 1fr); height: 100dvh; background: var(--background); }
.demo-top { padding-top: env(safe-area-inset-top); border-bottom: 1px solid var(--border); background: var(--card-background); z-index: 40; }
.demo-top :deep(.nc-app-bar) { height: 56px; width: min(100%, 1160px); margin: auto; border: 0; }
.demo-main { height: 100%; position: relative; min-width: 0; min-height: 0; }
.demo-page { position: absolute; inset: 0; overflow: auto; overscroll-behavior-y: contain; padding: 24px max(20px, env(safe-area-inset-right)) 32px max(20px, env(safe-area-inset-left)); scrollbar-gutter: stable; }
.demo-page-inner { --card-radius: 18px; --card-padding: 24px; --card-header-gap: 20px; width: min(100%, 1120px); margin: auto; }
.demo-page-inner > :deep(:first-child) { margin-top: 0; }
.demo-page-inner :deep(.my-sample-id[data-my-card]) { flex: none; padding: 4px 8px; border-radius: 6px; background: var(--fill); color: var(--text-secondary); font: 500 10px/16px var(--font); letter-spacing: .06em; }
.demo-catalog { max-width: 960px; margin: auto; }
.demo-intro { margin: 0 4px 28px; }
.demo-intro h2 { margin: 0 0 8px; font-size: 26px; font-weight: var(--font-weight-title, 700); }
.demo-intro p { margin: 0; color: var(--text-secondary); font-size: 14px; line-height: 1.6; }
.demo-catalog-groups { display: grid; gap: 28px; }
.demo-catalog-group { min-width: 0; }
.demo-catalog-group h3 { display: flex; align-items: center; gap: 8px; margin: 0 6px 10px; font-size: 13px; color: var(--text-secondary); font-weight: var(--font-weight-subtitle, 600); }
.demo-catalog-group h3 span { font-size: 11px; opacity: .7; font-variant-numeric: tabular-nums; }
.demo-catalog-group :deep(.my-group-body) { background: var(--card-background); border: 0; border-radius: 22px; box-shadow: var(--shadow); }
.demo-catalog-group :deep(.my-list-row) { min-height: 76px; --list-padding-inline: 16px; }
.demo-catalog-icon { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; color: var(--primary); background: var(--fill); }
.demo-catalog-icon svg { width: 19px; height: 19px; }
.demo-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100%; text-align: center; padding: 24px; }
.demo-placeholder-icon { display: grid; place-items: center; width: 72px; height: 72px; border-radius: 24px; color: var(--primary); background: var(--fill); margin-bottom: 24px; }
.demo-placeholder-icon svg { width: 30px; height: 30px; }
.demo-placeholder-label { color: var(--text-secondary); font-size: 11px; letter-spacing: 2px; }
.demo-placeholder h2 { margin: 10px 0; font-size: 24px; }
.demo-placeholder > .my-button { margin-top: 10px; }
.demo-placeholder p { margin: 0 0 28px; color: var(--text-secondary); font-size: 14px; }
@media (min-width: 900px) { .demo-catalog-groups { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; } }
@media (max-width: 760px) { .demo-page { padding: 20px max(14px, env(safe-area-inset-right)) 24px max(14px, env(safe-area-inset-left)); } }
@media (max-width: 600px) { .demo-page-inner { --card-radius: 16px; --card-padding: 20px; } }
</style>
