<script setup lang="ts">
import { computed, inject, onActivated, onBeforeUnmount, onDeactivated, ref } from 'vue'
import { useRoute } from 'vue-router'
import DemoAppBar from './DemoAppBar.vue'
import { closePage, isChildPage } from '../commons/navigation'
import { demoExamples } from '../pages/catalog'
import { demoDescriptions } from '../pages/descriptions'
import { demoLayoutKey } from './layoutContext'
import { useDemoScroll } from './useDemoScroll'
import DemoDocument from './DemoDocument.vue'
import { homeDocs } from '../pages/home'
import { nativeDocs } from '../pages/native'

const props = defineProps<{
  /** 当前独立文档的目录标识。 */
  id: string
}>()
const layout = inject(demoLayoutKey)!,
  route = useRoute()
const item = demoExamples.find((item) => item.id === props.id)!
const title = ref<InstanceType<typeof DemoAppBar>>()
const active = ref(true),
  visible = ref(!document.hidden)
const content = computed(() => homeDocs[props.id] ?? nativeDocs[props.id])
const updateVisibility = () => {
  visible.value = !document.hidden
}
let first = true
const { scroller, remember } = useDemoScroll(() => {
  title.value?.focus()
  locateAnchor()
})
function locateAnchor() {
  if (!first || !active.value) return
  const anchor = route.path.replace(/^\//, '')
  if (item.anchors?.includes(anchor)) {
    const target = scroller.value?.querySelector<HTMLElement>('[id="' + anchor + '"]')
    // 异步文档挂载后再定位，首次直达旧链接也能滚动到对应示例。
    if (!target || !scroller.value) return
    scroller.value.scrollTop =
      target.getBoundingClientRect().top -
      scroller.value.getBoundingClientRect().top +
      scroller.value.scrollTop -
      20
    remember()
  }
  first = false
}
function back() {
  void closePage('/' + item.catalog).catch(layout.report)
}
onActivated(() => {
  active.value = true
})
onDeactivated(() => {
  active.value = false
})
document.addEventListener('visibilitychange', updateVisibility)
onBeforeUnmount(() => document.removeEventListener('visibilitychange', updateVisibility))
</script>

<template>
  <div class="demo-view" :inert="!active" :aria-hidden="!active || undefined">
    <DemoAppBar
      ref="title"
      page
      :title="item.title"
      back
      :back-label="
        isChildPage() ? '返回上一页' : item.catalog === 'native' ? '返回原生组件' : '返回组件列表'
      "
      class="demo-app-bar demo-top"
      @back="back"
    />
    <div class="demo-main">
      <section
        ref="scroller"
        class="demo-page demo-detail"
        :data-demo-page="'example/' + id"
        :aria-label="item.title"
        :inert="!active"
        :aria-hidden="!active || undefined"
        @scroll.passive="remember"
      >
        <div class="demo-page-inner">
          <DemoDocument
            :id="id"
            :title="item.title"
            :description="demoDescriptions[id] ?? '查看组件的交互示例与对应代码。'"
            ><component
              :is="content"
              v-bind="id === 'primitives' ? { active: active && visible } : {}"
              @vue:mounted="locateAnchor"
          /></DemoDocument>
        </div>
      </section>
    </div>
  </div>
</template>
