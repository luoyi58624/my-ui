<script setup lang="ts">
import { ref } from 'vue'
import { App, BottomNavigation } from 'tauri-plugin-native-components/vue'
import 'tauri-plugin-native-components/style.css'
import { tabs, tabbarItems } from './tabs'
import { pages } from './pages'

const active = ref('home')
const error = ref('')
function report(reason: unknown) { error.value = reason instanceof Error ? reason.message : String(reason) }
</script>

<template>
  <App v-model="active" :tabs="tabs" :pages="pages" data-app-example @error="report">
    <template #tabbar="{ value, select }">
      <BottomNavigation :model-value="value" :items="tabbarItems" @update:model-value="select" />
    </template>
  </App>
  <p v-if="error" class="app-example-error" role="alert">{{ error }}</p>
</template>

<style scoped>
.app-example-error { position: fixed; z-index: 10; inset: auto 16px 84px; margin: 0; padding: 12px 16px; border-radius: 10px; color: var(--danger); background: var(--card-background); font-size: 13px; }
</style>
