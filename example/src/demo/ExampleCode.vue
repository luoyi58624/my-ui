<script setup lang="ts">
import { computed, ref } from 'vue'
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
    <div class="example-code-heading">
      <h2>代码示例</h2>
      <div><button type="button" @click="navigate('/guide/quick-start')">快速开始</button><button type="button" @click="navigate('/guide/native')">集成原生</button></div>
    </div>
    <p>包含导入、状态与模板；当前仓库使用 @my-ui/vue，复制源码后请替换为自己的导入路径。</p>
    <CodeFiles :key="id" :files="files" :open="open" />
    <p v-if="error" role="alert">{{ error }}</p>
  </section>
</template>

<style scoped>
.example-code { min-width: 0; margin-top: 32px; }
.example-code-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.example-code-heading h2 { margin: 0; font-size: 18px; font-weight: var(--font-weight-subtitle, 600); }
.example-code-heading > div { display: flex; gap: 12px; }
.example-code-heading button { appearance: none; border: 0; padding: 8px 0; background: none; color: var(--primary); font: inherit; font-size: 12px; cursor: pointer; }
.example-code-heading button:focus-visible { outline: 2px solid var(--primary); outline-offset: 4px; }
.example-code > p { margin: 10px 0 16px; color: var(--text-secondary); font-size: 13px; line-height: 1.8; overflow-wrap: anywhere; }
</style>
