<script setup lang="ts">
import { computed, inject, nextTick, onActivated, onDeactivated, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Button, CellGroup, Icon, ListRow, type IconName } from '@my-ui/vue'
import { Tabs, useApp, type NavigationItem } from 'tauri-plugin-native-components/vue'
import DemoAppBar from './DemoAppBar.vue'
import { openPage } from '../commons/navigation'
import { useNativeBarsSuspended } from '../commons/native-components'
import { demoGroups, nativeDemoGroups, type DemoExample } from '../demo/catalog'
import { demoLayoutKey, type DemoTab } from './layoutContext'
import { useDemoScroll } from './useDemoScroll'
import ProfileHome from '../demo/ProfileHome.vue'

const props = defineProps<{
  /** 当前栏目的展示及原生页面配置。 */
  page: DemoTab
}>()
const app = useApp(), route = useRoute(), layout = inject(demoLayoutKey)!
const { scroller, remember } = useDemoScroll()
const activated = ref(true), count = ref(0)
const active = computed(() => activated.value && !!route.meta.tab && app.value.value === props.page.value)
const suspended = useNativeBarsSuspended()
const items = computed<NavigationItem[]>(() => [{
  ...props.page,
  ...(props.page.value === 'profile' ? { nativeView: 'profile' } : props.page.demo ? {
    nativeView: 'demo', nativeProps: { title: props.page.title, demo: props.page.demo, count: count.value },
  } : {}),
}])
let entry: HTMLElement | undefined
function open(item: DemoExample) {
  entry = scroller.value?.querySelector<HTMLElement>('[data-demo-link="' + item.id + '"]') ?? undefined
  void openPage(item.path ?? '/example/' + item.id, { title: item.title }).catch(layout.report)
}
function action(event: { value: string }) {
  if (event.value === 'home') app.select('home')
  else if (event.value === 'increment') count.value++
}
watch(active, shown => {
  if (shown && entry) void nextTick(() => entry?.focus({ preventScroll: true }))
})
onActivated(() => { activated.value = true })
onDeactivated(() => { activated.value = false })
</script>

<template>
  <div class="demo-view" :inert="!active" :aria-hidden="!active || undefined">
    <DemoAppBar page :title="page.title" :settings="page.value === 'home'" class="demo-app-bar demo-top" />
    <Tabs class="demo-tabs" :model-value="page.value" :items="items" :navigation-visible="false" :suspended="suspended" @action="action">
      <section ref="scroller" class="demo-page" :data-demo-page="page.value" :aria-label="page.title" :inert="!active" :aria-hidden="!active || undefined" @scroll.passive="remember">
        <div v-if="page.value === 'home' || page.value === 'native'" class="demo-catalog">
          <div class="demo-intro"><h2>{{ page.value === 'native' ? '原生组件' : '组件目录' }}</h2></div>
          <div class="demo-catalog-groups">
            <section v-for="group in page.value === 'native' ? nativeDemoGroups : demoGroups" :key="group.title" class="demo-catalog-group" :aria-label="group.title">
              <h3>{{ group.title }} <span>{{ group.items.length }}</span></h3>
              <CellGroup :label="group.title">
                <ListRow v-for="item in group.items" :key="item.id" :data-demo-link="item.id" :data-showcase-entry="item.id === 'showcase' ? '' : undefined" :title="item.title" @click="open(item)">
                  <template #leading><span class="demo-catalog-icon"><Icon :name="item.icon" /></span></template>
                </ListRow>
              </CellGroup>
            </section>
          </div>
        </div>
        <ProfileHome v-else-if="page.value === 'profile'" @home="app.select('home')" />
        <div v-else class="demo-placeholder">
          <span class="demo-placeholder-icon"><Icon :name="page.icon as IconName" /></span>
          <span class="demo-placeholder-label">DEMO {{ page.demo }}</span>
          <h2>{{ page.title }}</h2><p>这是预留的 Demo 页面。</p>
          <Button variant="outline" @click="count++">点一下 · {{ count }}</Button>
          <Button variant="outline" @click="app.select('home')">浏览组件</Button>
        </div>
      </section>
    </Tabs>
  </div>
</template>
