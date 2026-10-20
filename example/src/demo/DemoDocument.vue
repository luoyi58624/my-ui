<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import { documentKey, type DocumentExample } from './document'
import DocumentOutline from './DocumentOutline.vue'

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
const outlineItems = computed(() =>
  examples.value.map((example) => ({
    id: example.name,
    title: example.title,
    href: '#example-' + props.id + '-' + example.name
  }))
)
let firstExample: string | undefined
let scroller: HTMLElement | null = null,
  frame = 0
function update() {
  frame = 0
  if (!scroller || scroller.inert) return
  if (
    scroller.scrollTop > 0 &&
    scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2
  ) {
    current.value = examples.value.at(-1)?.name ?? ''
    return
  }
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
  defaultCodeOpen(name) {
    firstExample ??= name
    return firstExample === name
  },
  register(example) {
    examples.value.push(example)
    void nextTick(schedule)
    return () => {
      examples.value = examples.value.filter((item) => item.name !== example.name)
    }
  }
})
function locate(name: string) {
  const example = examples.value.find((item) => item.name === name)
  if (!example) return
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
      <DocumentOutline :items="outlineItems" :value="current" @select="locate" />
    </div>
  </div>
</template>

<style scoped>
.demo-document {
  --card-radius: 10px;
  --card-padding: 24px;
  --doc-outline-width: 192px;
  width: min(800px, calc(100% - var(--doc-outline-width) - 64px));
  box-sizing: border-box;
  margin-inline: clamp(
      0px,
      calc((100% - 800px) / 2),
      calc(100% - 800px - var(--doc-outline-width) - 64px)
    )
    auto;
  min-width: 0;
  /* 宽屏正文独立居中，空间不足时为固定在屏幕右侧的目录让出位置。 */
  padding: 12px 0 28px;
}
.doc-intro,
.doc-layout {
  width: 100%;
  max-width: 800px;
  margin-inline: auto;
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
  display: block;
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
@media (max-width: 1024px) {
  .demo-document {
    width: min(100%, 800px);
    margin-inline: auto;
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
  width: min(100%, 800px);
  margin-inline: auto;
}
</style>
