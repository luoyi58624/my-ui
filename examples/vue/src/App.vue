<script setup lang="ts">
import { onBeforeUnmount, provide, ref } from 'vue'
import { RouterView } from 'vue-router'
import { Popup, Toast } from '@my-ui/vue'
import { notifyKey } from './commons/notify'

const toast = ref<InstanceType<typeof Toast>>()
provide(notifyKey, (message) => toast.value?.show(message))
document.documentElement.classList.add('my-demo-app')
onBeforeUnmount(() => document.documentElement.classList.remove('my-demo-app'))
</script>

<template>
  <RouterView />
  <Popup />
  <Toast ref="toast" />
</template>

<style>
html.my-demo-app, html.my-demo-app body, html.my-demo-app #app {
  height: 100%;
  overflow: hidden;
  padding: 0;
  scrollbar-gutter: auto;
}
</style>
