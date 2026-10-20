<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { Card } from '@my-ui/vue'
import CodeFiles from './CodeFiles.vue'
import { documentKey } from './document'
import { previewFiles } from './code/source'
import type { CodeFile } from './code/types'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  /** 当前源文件内唯一的示例名称，同时定位展示代码。 */
  name: string
  /** 实际承载预览的 Vue 文件名。 */
  source: string
  /** 示例标题。 */
  title: string
  /** 说明本例展示的能力与关键操作。 */
  description?: string
  /** 共享完整展示页使用的组件分类。 */
  sample?: string
  /** 当前示例使用的状态区名称，以空格分隔。 */
  setup?: string
  /** 本例需要一起阅读的辅助文件。 */
  related?: readonly CodeFile[]
  /** 完整展示页保留原有容器，不额外套卡片。 */
  bare?: boolean
}>()
const document = inject(documentKey, undefined)
const codeOpen = document?.defaultCodeOpen(props.name) ?? false
const root = ref<HTMLElement>()
const heading = computed(() => 'example-' + document?.id + '-' + props.name)
const files = computed(() => previewFiles(props.source, props.name, props.setup, props.related))
let unregister: (() => void) | undefined
onMounted(() => {
  if (document && root.value)
    unregister = document.register({ name: props.name, title: props.title, element: root.value })
})
onBeforeUnmount(() => unregister?.())
</script>

<template>
  <section
    v-if="document"
    ref="root"
    v-bind="$attrs"
    class="doc-example"
    :data-example="name"
    :aria-labelledby="heading"
  >
    <header class="doc-example-heading">
      <h2 :id="heading" tabindex="-1">
        {{ title }}
        <a
          :href="'#' + heading"
          aria-label="定位到此示例"
          @click.prevent="root?.scrollIntoView({ block: 'start' })"
        >
          #
        </a>
      </h2>
      <p v-if="description">{{ description }}</p>
    </header>
    <div class="doc-example-frame">
      <div class="doc-example-preview"><slot /></div>
      <CodeFiles :files="files" :open="codeOpen" title="示例代码" />
    </div>
  </section>
  <div v-else-if="bare" v-bind="$attrs">
    <header class="doc-example-heading">
      <h2>{{ title }}</h2>
      <p v-if="description">{{ description }}</p>
    </header>
    <slot />
  </div>
  <Card v-else v-bind="$attrs" :title="title" :description="description" :sample="sample">
    <slot />
  </Card>
</template>

<style scoped>
.doc-example {
  min-width: 0;
  scroll-margin-top: 24px;
}
.doc-example-heading {
  margin-bottom: 18px;
}
.doc-example-heading h2 {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0;
  color: var(--text);
  font-size: 20px;
  font-weight: var(--font-weight-subtitle, 600);
  line-height: 1.5;
  letter-spacing: -0.3px;
}
.doc-example-heading h2 a {
  color: var(--primary);
  font-size: 16px;
  font-weight: 400;
  opacity: 0;
  text-decoration: none;
}
.doc-example-heading:hover h2 a,
.doc-example-heading h2 a:focus-visible {
  opacity: 1;
}
.doc-example-heading p {
  margin: 8px 0 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.85;
}
.doc-example-frame {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card-background);
}
.doc-example-preview {
  min-width: 0;
  padding: 32px;
}
.doc-example-frame > :deep(.demo-code-files) {
  border: 0;
  border-top: 1px solid var(--border);
  border-radius: 0;
}
.doc-example-frame > :deep(.demo-code-files summary) {
  min-height: 44px;
  padding: 8px 16px;
  background: color-mix(in srgb, var(--fill) 45%, var(--card-background));
  font-size: 12px;
}
.doc-example-frame > :deep(.demo-code-files summary:hover) {
  background: var(--fill);
}
@media (max-width: 600px) {
  .doc-example-preview {
    padding: 22px 18px;
  }
  .doc-example-heading {
    margin-bottom: 14px;
  }
  .doc-example-heading h2 {
    font-size: 18px;
  }
  .doc-example-heading p {
    font-size: 13px;
  }
}
</style>
