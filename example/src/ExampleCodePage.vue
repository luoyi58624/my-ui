<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Page, type PageHandle } from 'tauri-plugin-native-components/vue'
import DemoAppBar from './components/DemoAppBar.vue'
import ExampleCode from './components/ExampleCode.vue'
import { demoExamples } from './demo/catalog'
import { exampleCode } from './commons/code/examples'
import { closePage } from './commons/navigation'
import { useNativeBarsSuspended } from './commons/native-components'

const route = useRoute(), page = ref<PageHandle>(), error = ref('')
const suspended = useNativeBarsSuspended()
const id = computed(() => String(route.params.id ?? ''))
const example = computed(() => demoExamples.find(item => item.id === id.value))
function back() { void closePage(example.value?.path ?? (example.value ? '/example/' + id.value : '/home')).catch(reason => { error.value = String(reason) }) }
watch(id, async () => { await nextTick(); page.value?.scrollTo({ top: 0 }) })
</script>

<template>
  <Page ref="page" class="code-page" :suspended="suspended">
    <template #navbar><DemoAppBar :title="example?.title ?? '示例代码'" back back-label="返回示例" @back="back" /></template>
    <main class="code-page-content">
      <ExampleCode v-if="exampleCode(id).length" :id="id" open />
      <p v-else>没有找到这个示例的代码，请返回组件目录。</p>
      <p v-if="error" role="alert">{{ error }}</p>
    </main>
  </Page>
</template>

<style scoped>
.code-page { height: 100dvh; }
.code-page-content { width: min(100%, 1120px); box-sizing: border-box; margin: auto; padding: 24px 20px 40px; }
.code-page-content :deep(.example-code) { margin-top: 0; }
@media (max-width: 600px) { .code-page-content { padding: 20px 12px 32px; } }
</style>
