<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@my-ui/vue'
import { openPage } from '../commons/navigation'
import { exampleCode } from '../commons/code/examples'
import CodeFiles from './CodeFiles.vue'
import { previewGroups, type PreviewCodeGroup } from '../commons/code/source'

const props = defineProps<{
  /** 组件目录中的示例标识。 */
  id: string
  /** 独立代码页默认展开。 */
  open?: boolean
}>()
const files = computed(() => exampleCode(props.id))
const groups = ref<PreviewCodeGroup[]>([]),
  loading = ref(false)
const loadError = ref('')
let version = 0
watch(
  () => props.id,
  async (id) => {
    const request = ++version
    groups.value = []
    loading.value = true
    loadError.value = ''
    try {
      const result = await previewGroups(id)
      if (request === version) groups.value = result
    } catch {
      if (request === version) loadError.value = '示例目录读取失败，请重新打开代码页。'
    } finally {
      if (request === version) loading.value = false
    }
  },
  { immediate: true }
)
const error = ref('')
function navigate(path: string) {
  void openPage(path).catch((reason) => {
    error.value = String(reason)
  })
}
</script>

<template>
  <section v-if="files.length" class="example-code" aria-label="示例用法代码">
    <p v-if="loading" role="status">正在读取示例目录…</p>
    <p v-else-if="loadError" role="alert">{{ loadError }}</p>
    <template v-else-if="groups.length">
      <section
        v-for="group in groups"
        :key="group.name"
        class="example-code-section"
        :data-code-example="group.name"
      >
        <h2>{{ group.title }}</h2>
        <p>{{ group.description }}</p>
        <CodeFiles :files="group.files" :open="open" title="示例代码" />
      </section>
    </template>
    <CodeFiles v-else :key="id" :files="files" :open="open" title="示例代码" />
    <footer class="example-code-footer">
      <p>
        示例使用
        <code>@my-ui/vue</code>
        ，接入时可替换为本地路径。
      </p>
      <nav aria-label="使用指南">
        <button type="button" @click="navigate('/guide/quick-start')">
          快速开始
          <Icon name="arrow-right" />
        </button>
        <button type="button" @click="navigate('/guide/native')">
          应用与平台
          <Icon name="arrow-right" />
        </button>
      </nav>
    </footer>
    <p v-if="error" class="example-code-error" role="alert">{{ error }}</p>
  </section>
</template>

<style scoped>
.example-code {
  min-width: 0;
  margin-top: 24px;
}
.example-code-section + .example-code-section {
  margin-top: 36px;
}
.example-code-section h2 {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: var(--font-weight-subtitle, 600);
}
.example-code-section > p {
  margin: 0 0 18px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.8;
}
.example-code-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px 20px;
  padding: 12px 2px 0;
  color: var(--text-secondary);
}
.example-code-footer p {
  margin: 0;
  font-size: 12px;
  line-height: 1.8;
}
.example-code-footer code {
  font: inherit;
  color: var(--text);
}
.example-code-footer nav {
  display: flex;
  align-items: center;
  gap: 4px;
}
.example-code-footer button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  appearance: none;
  min-height: 32px;
  border: 0;
  border-radius: 6px;
  padding: 5px 8px;
  background: none;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: inherit;
  line-height: 20px;
  cursor: pointer;
}
.example-code-footer button:hover {
  background: var(--hover);
  color: var(--primary);
}
.example-code-footer button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
.example-code-footer :deep(svg) {
  width: 14px;
  height: 14px;
}
.example-code-error {
  color: var(--danger);
  font-size: 13px;
  line-height: 1.7;
}
@media (pointer: coarse) {
  .example-code-footer button {
    min-height: 44px;
  }
}
</style>
