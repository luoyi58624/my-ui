<script setup lang="ts">
import { onBeforeUnmount, provide, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Popup, Toast } from '@my-ui/vue'
import 'tauri-plugin-native-components/style.css'
import { nativeBarsSuspendedKey } from './commons/native-components'
import { notifyKey } from './commons/notify'
import NativeAppRoot from './pages/native/app/Root.vue'

const suspended = ref(false)
provide(nativeBarsSuspendedKey, suspended)
const toast = ref<InstanceType<typeof Toast>>()
provide(notifyKey, (message) => toast.value?.show(message))

const route = useRoute()
watch(
  () => route.name,
  (name) => {
    document.documentElement.classList.toggle('my-native-page', name === 'shared-state')
    document.documentElement.classList.toggle('my-demo-app', name !== 'shared-state')
  },
  { immediate: true }
)
onBeforeUnmount(() => {
  document.documentElement.classList.remove('my-native-page', 'my-demo-app')
})
</script>

<template>
  <NativeAppRoot />
  <Popup />
  <Toast ref="toast" />
</template>

<style>
/* 独立打开指南或代码页时也使用同一个全屏应用容器。 */
html.my-demo-app,
html.my-demo-app body {
  height: 100%;
  overflow: hidden;
  padding: 0;
  scrollbar-gutter: auto;
}
#app :is(.nc-bar, .nc-page) {
  font-family: inherit;
}
/* 导航栏保持操作字重，页面正文使用正文的字重。 */
#app :is(.nc-tabs-web, .nc-page-scroll) {
  font-weight: var(--font-weight, 400);
}
</style>
