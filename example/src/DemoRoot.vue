<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { Popup } from '@my-ui/vue'
import 'tauri-plugin-native-components/style.css'
import { nativeBarsSuspendedKey } from './native-components'

const suspended = ref(false)
provide(nativeBarsSuspendedKey, suspended)
let stopLayers: (() => void) | undefined
onMounted(() => { stopLayers = MyUI.layers.subscribe(value => { suspended.value = value }) })

const route = useRoute()
watch(() => route.name, name => {
  document.documentElement.classList.toggle('my-native-page', name === 'shared-state')
  document.documentElement.classList.toggle('my-demo-app', name !== 'shared-state')
}, { immediate: true })
onBeforeUnmount(() => { stopLayers?.(); document.documentElement.classList.remove('my-native-page', 'my-demo-app') })
</script>

<template>
  <RouterView v-slot="{ Component, route: pageRoute }"><KeepAlive><component :is="Component" :key="pageRoute.name" /></KeepAlive></RouterView>
  <Popup />
</template>
