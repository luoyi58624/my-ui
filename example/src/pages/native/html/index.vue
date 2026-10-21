<script setup lang="ts">
import { ref } from 'vue'
import { Page } from 'tauri-plugin-native-components/vue'
import DemoAppBar from '../../../components/DemoAppBar.vue'
import { closePage } from '../../../commons/navigation'

const error = ref('')
const loaded = ref(false)
const source = new URL('native.html', document.baseURI).href
function back() {
  void closePage().catch((reason) => {
    error.value = String(reason)
  })
}
</script>

<template>
  <Page class="html-page" :active="loaded">
    <template #navbar
      ><DemoAppBar title="原生 HTML 示例" back @back="back" @error="error = String($event)"
    /></template>
    <p v-if="error" role="alert">{{ error }}</p>
    <iframe
      :src="source"
      title="直接使用 CSS 与 JavaScript 的组件示例"
      @load="loaded = true"
      @my:back.prevent="back"
    />
  </Page>
</template>

<style scoped>
.html-page {
  display: flex;
  flex-direction: column;
  height: 100dvh;
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
