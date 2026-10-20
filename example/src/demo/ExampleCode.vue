<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@my-ui/vue'
import { openPage } from '../navigation'
import { exampleCode } from './code/examples'
import CodeFiles from './CodeFiles.vue'

const props = defineProps<{
  /** 组件目录中的示例标识。 */
  id: string
  /** 独立代码页默认展开。 */
  open?: boolean
}>()
const files = computed(() => exampleCode(props.id))
const error = ref('')
function navigate(path: string) { void openPage(path).catch(reason => { error.value = String(reason) }) }
</script>

<template>
  <section v-if="files.length" class="example-code" aria-label="示例用法代码">
    <CodeFiles :key="id" :files="files" :open="open" title="代码示例" />
    <footer class="example-code-footer">
      <p>示例使用 <code>@my-ui/vue</code>，接入时可替换为本地路径。</p>
      <nav aria-label="使用指南">
        <button type="button" @click="navigate('/guide/quick-start')">快速开始<Icon name="arrow-right" /></button>
        <button type="button" @click="navigate('/guide/native')">集成原生<Icon name="arrow-right" /></button>
      </nav>
    </footer>
    <p v-if="error" class="example-code-error" role="alert">{{ error }}</p>
  </section>
</template>

<style scoped>
.example-code { min-width: 0; margin-top: 24px; font-family: var(--font); }
.example-code-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px 20px; padding: 12px 2px 0; color: var(--text-secondary); }
.example-code-footer p { margin: 0; font-size: 12px; font-weight: 400; line-height: 1.8; }
.example-code-footer code { font: inherit; color: var(--text); }
.example-code-footer nav { display: flex; align-items: center; gap: 4px; }
.example-code-footer button { display: inline-flex; align-items: center; gap: 5px; appearance: none; min-height: 32px; border: 0; border-radius: 6px; padding: 5px 8px; background: none; color: var(--text-secondary); font: 400 12px/20px var(--font); cursor: pointer; }
.example-code-footer button:hover { background: var(--hover); color: var(--primary); }
.example-code-footer button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.example-code-footer :deep(svg) { width: 14px; height: 14px; }
.example-code-error { color: var(--danger); font-size: 13px; line-height: 1.7; }
@media (pointer: coarse) { .example-code-footer button { min-height: 44px; } }
</style>
