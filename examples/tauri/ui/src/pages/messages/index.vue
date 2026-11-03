<script setup lang="ts">
import { Button, Icon, type IconName } from '@my-ui/vue'
import type { DemoTab } from '@demo/components/layoutContext'

defineProps<{
  /** 当前栏目的展示配置。 */
  page: DemoTab
  /** 切换栏目时保留的点击次数。 */
  count: number
}>()
const emit = defineEmits<{
  /** 切回首页浏览组件。 */
  home: []
  /** 将点击同步到栏目持有的共享计数。 */
  increment: []
}>()
</script>

<template>
  <div class="demo-placeholder">
    <span class="demo-placeholder-icon"><Icon :name="page.icon as IconName" /></span>
    <span class="demo-placeholder-label">DEMO {{ page.demo }}</span>
    <h2>{{ page.title }}</h2>
    <p>这是预留的 Demo 页面。</p>
    <Button variant="outline" @click="emit('increment')">点一下 · {{ count }}</Button>
    <Button variant="outline" @click="emit('home')">浏览组件</Button>
  </div>
</template>
