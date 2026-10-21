<script setup lang="ts">
import { ref } from 'vue'
import { App, BottomNavigation } from 'tauri-plugin-native-components/vue'
import { tabs, tabbarItems } from './tabs'
import { pages } from './pages'

const active = ref('home')
</script>

<template>
  <App v-model="active" :tabs="tabs" :pages="pages">
    <template #tabbar="{ value, select }">
      <BottomNavigation :model-value="value" :items="tabbarItems" @update:model-value="select" />
    </template>
  </App>
</template>
