/** Page 的完整用法，模拟请求可以替换为业务接口。 */
export const pageCode = `<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@my-ui/vue'
import { AppBar, Page, type PageHandle } from 'tauri-plugin-native-components/vue'
import 'tauri-plugin-native-components/style.css'

const page = ref<PageHandle>()
const refreshing = ref(false)
const message = ref('下拉刷新，或点击按钮')

async function reload() {
  try {
    // 用实际请求替换这段模拟等待。
    await new Promise((resolve) => setTimeout(resolve, 800))
    message.value = '更新于 ' + new Date().toLocaleTimeString()
  } finally {
    // 成功和失败都要结束刷新；不要再次手动调用 reload。
    refreshing.value = false
  }
}
</script>

<template>
  <Page
    ref="page"
    style="height: 100dvh"
    refreshable
    v-model:refreshing="refreshing"
    @refresh="reload"
  >
    <template #navbar><AppBar title="最新动态" /></template>
    <main style="padding: 24px">
      <p>{{ message }}</p>
      <Button :disabled="refreshing" @click="page?.refresh()">刷新动态</Button>
    </main>
  </Page>
</template>`

/** 原生导航栏通过结构化操作项与事件连接业务。 */
export const appBarCode = `<script setup lang="ts">
import { ref } from 'vue'
import { AppBar, Page, type NavigationAction } from 'tauri-plugin-native-components/vue'
import 'tauri-plugin-native-components/style.css'

const message = ref('')
const actions: NavigationAction[] = [{ value: 'settings', label: '设置', icon: 'sliders' }]
function onAction(value: string) {
  message.value = '点击了：' + value
}
function goBack() {
  window.history.back()
}
</script>

<template>
  <Page style="height: 100dvh">
    <template #navbar>
      <AppBar
        title="我的收藏"
        subtitle="12 个灵感"
        back
        :actions="actions"
        @back="goBack"
        @action="onAction"
      />
    </template>
    <p>{{ message }}</p>
  </Page>
</template>`

/** Tabbar 只管理底栏，内容由业务切换。 */
export const tabbarCode = `<script setup lang="ts">
import { ref } from 'vue'
import { Tabbar, type NavigationItem } from 'tauri-plugin-native-components/vue'

const active = ref('home')
const items: NavigationItem[] = [
  { value: 'home', label: '首页', icon: 'home' },
  { value: 'profile', label: '我的', icon: 'user' },
]
</script>

<template>
  <Tabbar v-model="active" :items="items" />
</template>`

/** Tabs 默认承载 Vue 内容，nativeView 需要 Android 宿主注册页面工厂。 */
export const tabsCode = `<script setup lang="ts">
import { ref } from 'vue'
import { Tabs, type NavigationItem } from 'tauri-plugin-native-components/vue'
import 'tauri-plugin-native-components/style.css'

const selected = ref('home')
const count = ref(0)
const items: NavigationItem[] = [
  { value: 'home', label: '首页', icon: 'home' },
  { value: 'profile', label: '我的', icon: 'user' }
]
</script>

<template>
  <Tabs v-model="selected" :items="items" style="height: 100dvh">
    <template #default="{ value }">
      <main v-show="value === 'home'" style="padding: 24px">
        <button @click="count++">点击 {{ count }} 次</button>
      </main>
      <main v-show="value === 'profile'" style="padding: 24px">个人中心</main>
    </template>
  </Tabs>
</template>`
