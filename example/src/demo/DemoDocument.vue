<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import { documentKey, type DocumentExample } from './document'

const props = defineProps<{
  /** 组件目录的唯一标识。 */
  id: string
  /** 文档标题。 */
  title: string
  /** 组件能力与使用场景。 */
  description: string
}>()
const root = ref<HTMLElement>()
const examples = ref<DocumentExample[]>([])
const current = ref('')
let scroller: HTMLElement | null = null,
  frame = 0
function update() {
  frame = 0
  if (!scroller || scroller.inert) return
  const top = scroller.getBoundingClientRect().top + 90
  current.value =
    [...examples.value]
      .reverse()
      .find((example) => example.element.getBoundingClientRect().top <= top)?.name ??
    examples.value[0]?.name ??
    ''
}
function schedule() {
  if (!frame) frame = requestAnimationFrame(update)
}
provide(documentKey, {
  id: props.id,
  register(example) {
    examples.value.push(example)
    void nextTick(schedule)
    return () => {
      examples.value = examples.value.filter((item) => item.name !== example.name)
    }
  }
})
function locate(example: DocumentExample) {
  current.value = example.name
  example.element.scrollIntoView({ block: 'start', behavior: 'instant' })
  example.element.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
}
onMounted(() => {
  scroller = root.value?.closest<HTMLElement>('.demo-page') ?? null
  scroller?.addEventListener('scroll', schedule, { passive: true })
  update()
})
onBeforeUnmount(() => {
  scroller?.removeEventListener('scroll', schedule)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <div ref="root" class="demo-document">
    <header class="doc-intro">
      <p class="doc-breadcrumb">
        组件文档
        <span>/</span>
        {{ title.split(' ')[0] }}
      </p>
      <h1>{{ title }}</h1>
      <p class="doc-description">{{ description }}</p>
    </header>
    <div class="doc-layout">
      <article class="doc-content" :aria-label="title + '用法示例'"><slot /></article>
      <aside class="doc-outline" aria-label="本页目录">
        <nav>
          <h2>本页目录</h2>
          <a
            v-for="example in examples"
            :key="example.name"
            :href="'#example-' + id + '-' + example.name"
            :aria-current="current === example.name ? 'location' : undefined"
            @click.prevent="locate(example)"
          >
            {{ example.title }}
          </a>
        </nav>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.demo-document {
  --card-radius: 10px;
  --card-padding: 24px;
  min-width: 0;
  padding: 12px 0 28px;
}
.doc-intro {
  margin-bottom: 44px;
}
.doc-breadcrumb {
  display: flex;
  gap: 10px;
  margin: 0 0 18px;
  color: var(--text-secondary);
  font-size: 12px;
}
.doc-breadcrumb span {
  color: var(--border);
}
.doc-intro h1 {
  margin: 0;
  color: var(--text);
  font-size: 32px;
  font-weight: var(--font-weight-title, 700);
  line-height: 1.4;
  letter-spacing: -0.7px;
}
.doc-description {
  max-width: 720px;
  margin: 14px 0 0;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.9;
}
.doc-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 172px;
  align-items: start;
  gap: 48px;
}
.doc-content {
  min-width: 0;
}
.doc-content :deep(.doc-example + .doc-example) {
  margin-top: 36px;
}
.doc-content
  :deep(
    :is(
      .list-grid,
      .feedback-grid,
      .primitives-grid,
      .selection-showcase,
      .popup-showcase,
      .menu-showcase,
      .notice-steps-showcase,
      .scene-grid,
      .date-time-showcase,
      .card-showcase
    )
  ) {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 36px;
  margin: 0;
}
.doc-content
  :deep(
    :is(
        .list-grid,
        .feedback-grid,
        .primitives-grid,
        .selection-showcase,
        .popup-showcase,
        .menu-showcase,
        .notice-steps-showcase,
        .scene-grid,
        .date-time-showcase,
        .card-showcase
      )
      > .doc-example
  ) {
  margin: 0;
}
.doc-content :deep(.doc-example .my-card) {
  box-shadow: none;
}
.doc-content
  :deep(
    :is(
      .button-showcase,
      .tag-showcase,
      .field-group,
      .combobox-examples,
      .picker-examples,
      .slider-examples,
      .upload-examples,
      .image-showcase
    )
  ) {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 36px;
}
.doc-content
  :deep(
    :is(
        .button-showcase,
        .tag-showcase,
        .field-group,
        .combobox-examples,
        .picker-examples,
        .slider-examples,
        .upload-examples,
        .image-showcase
      )
      > .doc-example
  ) {
  margin: 0;
}
.doc-content :deep(.doc-example.feedback-panel) {
  display: block;
  min-height: 0;
}
.doc-content :deep(.picker-showcase) {
  display: grid;
  gap: 36px;
}
.doc-content :deep(.picker-area) {
  margin-top: 0;
  padding-top: 0;
  border-top: 0;
}
.doc-outline {
  position: sticky;
  top: 24px;
  min-width: 0;
}
.doc-outline nav {
  padding-left: 16px;
  border-left: 1px solid var(--border);
}
.doc-outline h2 {
  margin: 0 0 12px;
  color: var(--text);
  font-size: 12px;
  font-weight: var(--font-weight-subtitle, 600);
}
.doc-outline a {
  display: block;
  padding: 7px 0;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.7;
  text-decoration: none;
}
.doc-outline a:hover,
.doc-outline a[aria-current] {
  color: var(--primary);
}
.doc-outline a[aria-current] {
  position: relative;
}
.doc-outline a[aria-current]::before {
  position: absolute;
  inset: 8px auto 8px -17px;
  width: 2px;
  background: var(--primary);
  content: '';
}
.doc-outline a:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}
@media (max-width: 1000px) {
  .doc-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }
  .doc-outline {
    display: none;
  }
}
@media (max-width: 600px) {
  .demo-document {
    padding-top: 2px;
  }
  .doc-intro {
    margin-bottom: 32px;
  }
  .doc-intro h1 {
    font-size: 27px;
  }
  .doc-description {
    font-size: 14px;
  }
  .doc-breadcrumb {
    margin-bottom: 14px;
  }
}
:global(html.my-mobile-native .demo-document) {
  padding-right: 0;
}
</style>
