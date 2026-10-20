<script setup lang="ts">
import { ref } from 'vue'
import DemoAppBar from './DemoAppBar.vue'
import { closePage } from './navigation'

const error = ref('')
const source = new URL('native.html', document.baseURI).href
function back() {
  void closePage().catch((reason) => {
    error.value = String(reason)
  })
}
</script>

<template>
  <div class="html-page">
    <DemoAppBar title="原生 HTML 示例" back @back="back" @error="error = String($event)" />
    <p v-if="error" role="alert">{{ error }}</p>
    <iframe :src="source" title="直接使用 CSS 与 JavaScript 的组件示例" @my:back.prevent="back" />
  </div>
</template>

<style scoped>
.html-page {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--background);
}
.html-page iframe {
  flex: 1;
  min-height: 0;
  width: 100%;
  border: 0;
}
</style>
