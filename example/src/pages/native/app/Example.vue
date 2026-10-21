<script setup lang="ts">
import { ref } from 'vue'
import { App, Tabbar, type AppTab, type NavigationItem } from 'tauri-plugin-native-components/vue'
import TabPage from './TabPage.vue'
import { pages } from './pages'

const active = ref('home')
const tabs: AppTab[] = [
  { value: 'home', component: TabPage, props: { title: '首页' } },
  { value: 'profile', component: TabPage, props: { title: '我的' } }
]
const items: NavigationItem[] = [
  { value: 'home', label: '首页', icon: 'home' },
  { value: 'profile', label: '我的', icon: 'user' }
]
</script>

<template>
  <App v-model="active" :tabs="tabs" :pages="pages">
    <template #tabbar="{ value, select }">
      <Tabbar :model-value="value" :items="items" @update:model-value="select" />
    </template>
  </App>
</template>
