<script setup lang="ts">
import { Button } from '@my-ui/vue'
import { isAndroidNative } from 'tauri-plugin-native-components/router'
import DemoExample from '../../../components/DemoExample.vue'
import { openPage } from '../../../commons/navigation'

const native = isAndroidNative()
const preview = new URL(location.href)
preview.hash = '/native/app-demo'
</script>

<template>
  <DemoExample
    name="app-basic"
    source="pages/native/app/index.vue"
    title="基础用法"
    description="tabs 配置页面，tabbar 插槽提供底栏，pages 配置独立页面。"
  >
    <div v-if="native" class="app-native-preview">
      <Button @click="openPage('/native/app-demo')">打开 App 示例</Button>
    </div>
    <iframe
      v-else
      :src="preview.href"
      title="App 容器交互预览"
      class="app-live-preview"
      loading="lazy"
    />
    <p class="app-preview-note">
      pages 同时注册到 Vue Router；页面内用 useApp().push() 打开独立页，用 back()
      返回。顶部导航由页面自身提供。
    </p>
  </DemoExample>
</template>

<style scoped>
.app-live-preview {
  box-sizing: border-box;
  display: block;
  width: min(100%, 390px);
  height: 320px;
  margin: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--background);
}
.app-native-preview {
  padding: 24px;
  text-align: center;
}
.app-preview-note {
  margin: 20px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.8;
}
</style>
