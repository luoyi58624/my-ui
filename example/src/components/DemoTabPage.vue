<script setup lang="ts">
import { computed, onActivated, onDeactivated, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Tabs, useApp, type NavigationItem } from 'tauri-plugin-native-components/vue'
import DemoAppBar from './DemoAppBar.vue'
import { useNativeBarsSuspended } from '../commons/native-components'
import type { DemoTab } from './layoutContext'
import { useDemoScroll } from './useDemoScroll'
import HomePage from '../pages/home/index.vue'
import NativePage from '../pages/native/index.vue'
import MessagesPage from '../pages/messages/index.vue'
import SettingsPage from '../pages/settings/index.vue'
import { settingsAccount, settingsGroups } from '../pages/settings/data'

const props = defineProps<{
  /** 当前栏目的展示及原生页面配置。 */
  page: DemoTab
}>()
const tabPages = {
  home: HomePage,
  native: NativePage,
  messages: MessagesPage,
  settings: SettingsPage
}
const app = useApp(),
  route = useRoute()
const { scroller, remember } = useDemoScroll()
const activated = ref(true),
  count = ref(0)
const active = computed(
  () => activated.value && !!route.meta.tab && app.value.value === props.page.value
)
const suspended = useNativeBarsSuspended()
const items = computed<NavigationItem[]>(() => [
  {
    ...props.page,
    ...(props.page.value === 'settings'
      ? { nativeView: 'settings', nativeProps: { account: settingsAccount, groups: settingsGroups } }
      : props.page.demo
        ? {
            nativeView: 'demo',
            nativeProps: { title: props.page.title, demo: props.page.demo, count: count.value }
          }
        : {})
  }
])
const content = computed(() => tabPages[props.page.value as keyof typeof tabPages])
const contentProps = computed(() => {
  if (props.page.value === 'home' || props.page.value === 'native') return { active: active.value }
  const onHome = () => app.select('home')
  return props.page.value === 'settings'
    ? {}
    : { page: props.page, count: count.value, onHome, onIncrement: () => count.value++ }
})
function action(event: { value: string }) {
  if (event.value === 'home') app.select('home')
  else if (event.value === 'increment') count.value++
}
onActivated(() => {
  activated.value = true
})
onDeactivated(() => {
  activated.value = false
})
</script>

<template>
  <div class="demo-view" :inert="!active" :aria-hidden="!active || undefined">
    <DemoAppBar
      v-if="page.value !== 'settings'"
      page
      :title="page.title"
      :settings="page.value === 'home'"
      class="demo-app-bar demo-top"
    />
    <Tabs
      class="demo-tabs"
      :model-value="page.value"
      :items="items"
      :navigation-visible="false"
      :suspended="suspended"
      @action="action"
    >
      <section
        ref="scroller"
        class="demo-page"
        :class="{ 'demo-settings-page': page.value === 'settings' }"
        :data-demo-page="page.value"
        :aria-label="page.title"
        :inert="!active"
        :aria-hidden="!active || undefined"
        @scroll.passive="remember"
      >
        <component :is="content" v-bind="contentProps" />
      </section>
    </Tabs>
  </div>
</template>

<style scoped>
.demo-page.demo-settings-page { padding: 0; }
</style>
