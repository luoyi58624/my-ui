<script setup lang="ts">
import { inject } from 'vue'
import { useRoute } from 'vue-router'
import DemoAppBar from '@demo/components/DemoAppBar.vue'
import ShowcaseLayout from '@demo/components/ShowcaseLayout.vue'
import { demoNavigationKey } from '@demo/commons/navigation'
import { notifyKey } from '@demo/commons/notify'
import { usePageReady } from '@demo/commons/page-ready'

const route = useRoute()
const { closePage } = inject(demoNavigationKey)!
const notify = inject(notifyKey)!
usePageReady()

function back() {
  void closePage('/home').catch(error => {
    notify(error instanceof Error ? error.message : String(error))
  })
}
</script>

<template>
  <ShowcaseLayout :section="route.hash.slice(1)">
    <template #header>
      <DemoAppBar title="完整交互示例" back back-label="返回组件目录" @back="back" />
    </template>
  </ShowcaseLayout>
</template>
