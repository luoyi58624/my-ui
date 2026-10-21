<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { App, AppBar, BottomNavigation } from 'tauri-plugin-native-components/vue'
import { createNativeRouter } from 'tauri-plugin-native-components/router'
import 'tauri-plugin-native-components/style.css'
import { tabs, tabbarItems } from './tabs'
import { pages } from './pages'

const active = ref('home')
const error = ref('')
const navigation = createNativeRouter(useRouter())
function report(reason: unknown) { error.value = reason instanceof Error ? reason.message : String(reason) }
function exit() { void navigation.back('/example/native-app').catch(report) }
</script>

<template>
  <App v-model="active" :tabs="tabs" :pages="pages" data-app-example @error="report">
    <template #navbar="{ value, page, back }">
      <AppBar
        :title="page ? String(page.meta?.title ?? '详情') : tabbarItems.find(item => item.value === value)!.label"
        back :back-label="page ? '返回 App' : '返回文档'"
        @back="page ? void back().catch(report) : exit()"
      />
    </template>
    <template #tabbar="{ value, select }">
      <BottomNavigation :model-value="value" :items="tabbarItems" @update:model-value="select" />
    </template>
  </App>
  <p v-if="error" class="app-example-error" role="alert">{{ error }}</p>
</template>

<style scoped>
.app-example-error { position: fixed; z-index: 10; inset: auto 16px 84px; margin: 0; padding: 12px 16px; border-radius: 10px; color: var(--danger); background: var(--card-background); font-size: 13px; }
</style>
