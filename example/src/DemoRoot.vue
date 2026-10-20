<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { Popup } from '@my-ui/vue'

const route = useRoute()
watch(() => route.name, name => {
  document.documentElement.classList.toggle('my-native-page', name === 'shared-state')
  document.documentElement.classList.toggle('my-demo-app', name !== 'shared-state')
}, { immediate: true })
onBeforeUnmount(() => document.documentElement.classList.remove('my-native-page', 'my-demo-app'))
</script>

<template>
  <RouterView v-slot="{ Component }"><KeepAlive><component :is="Component" /></KeepAlive></RouterView>
  <Popup />
</template>
