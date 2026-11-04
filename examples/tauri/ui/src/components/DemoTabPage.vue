<script setup lang="ts">
import { computed, ref, inject } from 'vue'
import DemoAppBar from '@demo/components/DemoAppBar.vue'
import type { DemoTab } from '@demo/components/layoutContext'
import { demoNavigationKey } from '@demo/commons/navigation'
import { usePageReady } from '@demo/commons/page-ready'
import HomePage from '../pages/home/index.vue'
import ApplicationPage from '../pages/native/index.vue'
import MessagesPage from '../pages/messages/index.vue'
import SettingsPage from '../pages/settings/index.vue'

const { navigation } = inject(demoNavigationKey)!
const props = defineProps<{
  /** 当前栏目的展示配置。 */
  page: DemoTab
  /** 当前栏目是否可见。 */
  active: boolean
}>()
const tabPages = { home: HomePage, native: ApplicationPage, messages: MessagesPage, settings: SettingsPage }
const count = ref(0)
usePageReady()
const content = computed(() => tabPages[props.page.value as keyof typeof tabPages])
const contentProps = computed(() => {
  if (props.page.value === 'home' || props.page.value === 'native') return { active: props.active }
  return props.page.value === 'settings' ? {} : {
    page: props.page, count: count.value,
    onHome: () => navigation.replace('/home'), onIncrement: () => count.value++
  }
})
</script>

<template>
  <div class="demo-view" :inert="!active" :aria-hidden="!active || undefined">
    <DemoAppBar v-if="page.value !== 'settings'" :title="page.title" :settings="page.value === 'home'" class="demo-app-bar demo-top" />
    <div class="demo-main">
      <section class="demo-page" :class="{ 'demo-settings-page': page.value === 'settings' }" :data-demo-page="page.value" :aria-label="page.title" :inert="!active" :aria-hidden="!active || undefined">
        <component :is="content" v-bind="contentProps" />
      </section>
    </div>
  </div>
</template>

<style scoped>
.demo-page.demo-settings-page { padding: 0; }
</style>
