<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import DemoAppBar from '../../components/DemoAppBar.vue'
import ExampleCode from '../../components/ExampleCode.vue'
import { demoExamples } from '../catalog'
import { exampleCode } from '../../commons/code/examples'
import { closePage } from '../../commons/navigation'
import { usePageReady } from '../../commons/page-ready'

usePageReady()

const props = defineProps<{
  /** 当前示例的稳定路由标识。 */
  id: string
}>()
const page = ref<HTMLElement>(),
  error = ref('')
const id = computed(() => props.id)
const example = computed(() => demoExamples.find((item) => item.id === id.value))
function back() {
  void closePage(example.value?.path ?? (example.value ? '/example/' + id.value : '/home')).catch(
    (reason) => {
      error.value = String(reason)
    }
  )
}
watch(id, async () => {
  await nextTick()
  page.value?.scrollTo({ top: 0 })
})
</script>

<template>
  <div class="code-page demo-view">
    <DemoAppBar :title="example?.title ?? '示例代码'" back back-label="返回示例" @back="back"
    /><div ref="page" class="demo-scroll">
    <main class="code-page-content">
      <ExampleCode v-if="exampleCode(id).length" :id="id" open />
      <p v-else>没有找到这个示例的代码，请返回组件目录。</p>
      <p v-if="error" role="alert">{{ error }}</p>
    </main>
    </div>
  </div>
</template>

<style scoped>
.code-page {
  height: 100%;
}
.code-page-content {
  width: min(100%, 1120px);
  box-sizing: border-box;
  margin: auto;
  padding: 24px 20px 40px;
}
.code-page-content :deep(.example-code) {
  margin-top: 0;
}
@media (max-width: 600px) {
  .code-page-content {
    padding: 20px 12px 32px;
  }
}
</style>
