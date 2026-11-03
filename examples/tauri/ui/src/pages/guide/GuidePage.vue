<script setup lang="ts">
import { computed, nextTick, onActivated, onBeforeUnmount, onMounted, ref } from 'vue'
import { Button } from '@my-ui/vue'
import DemoAppBar from '@demo/components/DemoAppBar.vue'
import CodeFiles from '@demo/components/CodeFiles.vue'
import DocumentOutline from '@demo/components/DocumentOutline.vue'
import { guides, type GuideKind } from '@demo/commons/code/guides'
import { closePage, openPage } from '@demo/commons/navigation'
import { usePageReady } from '@demo/commons/page-ready'

usePageReady()

const props = defineProps<{
  /** 当前展示基础用法或平台接入指南。 */
  kind: GuideKind
}>()
const guide = computed(() => guides[props.kind])
const outlineItems = computed(() =>
  guide.value.sections.map((section) => ({
    id: section.id,
    title: section.title,
    href: '#guide-' + props.kind + '-' + section.id
  }))
)
const currentSection = ref(guide.value.sections[0]?.id ?? '')
const page = ref<HTMLElement>(),
  error = ref('')
let scroller: HTMLElement | null = null,
  frame = 0
function syncOutline() {
  frame = 0
  if (!scroller?.isConnected) return
  if (
    scroller.scrollTop > 0 &&
    scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2
  ) {
    currentSection.value = guide.value.sections.at(-1)?.id ?? ''
    return
  }
  const top = scroller.getBoundingClientRect().top + 48
  currentSection.value =
    [...guide.value.sections].reverse().find((section) => {
      const target = scroller!.querySelector('#guide-' + props.kind + '-' + section.id)
      return target && target.getBoundingClientRect().top <= top
    })?.id ??
    guide.value.sections[0]?.id ??
    ''
}
function scheduleOutline() {
  if (!frame) frame = requestAnimationFrame(syncOutline)
}
onMounted(() => {
  scroller = page.value ?? null
  scroller?.addEventListener('scroll', scheduleOutline, { passive: true })
  syncOutline()
})
onActivated(() => {
  void nextTick(scheduleOutline)
})
onBeforeUnmount(() => {
  scroller?.removeEventListener('scroll', scheduleOutline)
  cancelAnimationFrame(frame)
})
function navigate(path: string) {
  void openPage(path).catch((reason) => {
    error.value = String(reason)
  })
}
function back() {
  void closePage('/home').catch((reason) => {
    error.value = String(reason)
  })
}
function jumpTo(id: string) {
  currentSection.value = id
  const target = page.value?.querySelector(`#guide-${props.kind}-${id}`)
  target?.scrollIntoView({ block: 'start', behavior: 'instant' })
  target?.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
}
</script>

<template>
  <div class="guide-page demo-view">
    <DemoAppBar :title="guide.title" back back-label="返回组件目录" @back="back"
    /><div ref="page" class="demo-scroll">
    <main class="guide-content" :data-guide="kind">
      <div class="guide-body">
        <header class="guide-intro">
          <span class="guide-eyebrow">MY-UI · 使用指南</span>
          <h1>{{ guide.title }}</h1>
          <p>{{ guide.subtitle }}</p>
        </header>
        <section
          v-for="section in guide.sections"
          :id="`guide-${kind}-${section.id}`"
          :key="section.id"
          class="guide-section"
        >
          <h2 tabindex="-1">{{ section.title }}</h2>
          <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
          <CodeFiles v-if="section.files" :files="section.files" open />
          <Button
            v-if="section.link"
            class="guide-example-link"
            variant="text"
            @click="navigate(section.link.path)"
            >{{ section.link.label }} →</Button
          >
        </section>
        <p v-if="error" class="guide-error" role="alert">{{ error }}</p>
        <footer class="guide-footer">
          <span>{{
            kind === 'quick-start' ? '了解应用布局与平台接入？' : '继续了解基础组件的用法'
          }}</span>
          <Button
            variant="outline"
            @click="navigate(kind === 'quick-start' ? '/guide/native' : '/guide/quick-start')"
            >{{ kind === 'quick-start' ? '应用与平台' : '快速开始' }}</Button
          >
        </footer>
      </div>
      <DocumentOutline :items="outlineItems" :value="currentSection" @select="jumpTo" />
    </main>
    </div>
  </div>
</template>

<style scoped>
.guide-page {
  height: 100%;
}
.guide-content {
  --doc-outline-width: 192px;
  width: 100%;
  box-sizing: border-box;
  padding: 40px 20px 56px;
}
.guide-body {
  width: min(800px, calc(100% - var(--doc-outline-width) - 64px));
  box-sizing: border-box;
  margin-inline: clamp(
      0px,
      calc((100% - 800px) / 2),
      calc(100% - 800px - var(--doc-outline-width) - 64px)
    )
    auto;
}
.guide-eyebrow {
  color: var(--primary);
  font-size: 12px;
  letter-spacing: 1.6px;
}
.guide-intro h1 {
  margin: 14px 0 12px;
  font-size: 34px;
  font-weight: var(--font-weight-title, 700);
  letter-spacing: -0.7px;
}
.guide-intro p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.8;
}
.guide-section {
  min-width: 0;
  margin-top: 36px;
  scroll-margin-top: 24px;
}
.guide-section + .guide-section {
  padding-top: 32px;
  border-top: 1px solid var(--border);
}
.guide-section h2 {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: var(--font-weight-subtitle, 600);
}
.guide-section > p {
  margin: 12px 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.9;
  overflow-wrap: anywhere;
}
.guide-section :deep(.demo-code-files) {
  margin-top: 20px;
}
.guide-example-link {
  margin-top: 12px;
}
.guide-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 14px;
}
.guide-error {
  color: var(--danger);
}
@media (max-width: 1024px) {
  .guide-body {
    width: min(100%, 800px);
    margin-inline: auto;
  }
}
@media (max-width: 600px) {
  .guide-content {
    padding: 28px 16px 40px;
  }
  .guide-intro h1 {
    font-size: 28px;
  }
  .guide-section h2 {
    font-size: 18px;
  }
}
:global(html.my-mobile-native .guide-body) {
  width: min(100%, 800px);
  margin-inline: auto;
}
:global(html.my-mobile-native .guide-content) {
  padding: 28px 16px 40px;
}
</style>
