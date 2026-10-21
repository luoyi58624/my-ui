<script setup lang="ts">
import { ref } from 'vue'
import DemoExample from '../../../components/DemoExample.vue'
import { Navigation, type Option } from '@my-ui/vue'

// #region navigation
const navigation = ref('home')
const navOptions: Option[] = [
  { value: 'home', label: '首页', icon: 'home' },
  { value: 'discover', label: '发现', icon: 'grid' },
  { value: 'messages', label: '消息', icon: 'message' },
  { value: 'profile', label: '我的', icon: 'user' }
]
// #endregion
</script>

<template>
  <DemoExample
    name="navigation"
    source="pages/home/navigation/index.vue"
    title="底部导航"
    description="图标与文字配合选中状态，支持点击与键盘切换。"
  >
    <Navigation v-model="navigation" :options="navOptions" />
  </DemoExample>
</template>

<style scoped></style>
