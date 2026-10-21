<script setup lang="ts">
import { Button } from '@my-ui/vue'
import { useApp } from 'tauri-plugin-native-components/vue'

defineProps<{
  /** 当前 Tab 的页面标题。 */
  title: string
}>()
const app = useApp()
</script>

<template>
  <main>
    <h2>{{ title }}</h2>
    <Button @click="app.push({ name: 'app-detail' })">打开独立页面</Button>
  </main>
</template>

<style scoped>
main {
  padding: 24px;
}
h2 {
  margin: 0 0 20px;
  font-size: 20px;
}
</style>
