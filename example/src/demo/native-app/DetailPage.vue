<script setup lang="ts">
import { Button } from '@my-ui/vue'
import { useApp } from 'tauri-plugin-native-components/vue'

const app = useApp()
</script>

<template>
  <main>
    <h2>独立页面</h2>
    <Button @click="app.back()">返回</Button>
  </main>
</template>

<style scoped>
main { padding: 24px; }
h2 { margin: 0 0 20px; font-size: 20px; }
</style>
