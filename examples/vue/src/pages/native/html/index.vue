<script setup lang="ts">
import { ref } from 'vue'
import DemoAppBar from '../../../components/DemoAppBar.vue'
import { closePage } from '../../../commons/navigation'
import { usePageReady } from '../../../commons/page-ready'

const pageReady = usePageReady(false)

const error = ref('')
// 散装原生页面在 examples/others，开发服务和产物都由站点根目录的 /native.html 提供。
const source = new URL(import.meta.env.BASE_URL + 'native.html', location.origin).href
function back() {
  void closePage().catch((reason) => {
    error.value = String(reason)
  })
}
</script>

<template>
  <div class="html-page demo-view">
    <DemoAppBar title="原生 HTML 示例" back @back="back"
    />
    <p v-if="error" role="alert">{{ error }}</p>
    <iframe
      :src="source"
      title="直接使用 CSS 与 JavaScript 的组件示例"
      @load="pageReady"
      @my:back.prevent="back"
    />
  </div>
</template>

<style scoped>
.html-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--background);
}
.html-page iframe {
  flex: 1;
  min-height: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
