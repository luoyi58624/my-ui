<script setup lang="ts">
import { onBeforeUnmount, provide, ref } from 'vue'
import { Popup, Toast } from '@my-ui/vue'
import { notifyKey } from './commons/notify'

const toast = ref<InstanceType<typeof Toast>>()
provide(notifyKey, (message) => toast.value?.show(message))
document.documentElement.classList.add('my-demo-app')
onBeforeUnmount(() => document.documentElement.classList.remove('my-demo-app'))
</script>

<template>
  <slot />
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
/* 详情页与组件长页共用的布局类，随共享根壳加载，示例应用与单页展示共用同一份。 */
.demo-scroll { flex: 1; min-height: 0; overflow: auto; overscroll-behavior-y: contain; }
.demo-main {
  height: 100%;
  position: relative;
  min-width: 0;
  min-height: 0;
}
.demo-page {
  position: absolute;
  inset: 0;
  overflow: auto;
  overscroll-behavior-y: contain;
  padding: 24px max(20px, env(safe-area-inset-right)) 32px max(20px, env(safe-area-inset-left));
  scrollbar-gutter: stable;
}
.demo-page-inner {
  --card-radius: 18px;
  --card-padding: 24px;
  --card-header-gap: 20px;
  width: 100%;
  margin: auto;
}
.demo-detail {
  background: var(--card-background);
  padding-top: 32px;
}
.demo-page-inner > :first-child {
  margin-top: 0;
}
.demo-page-inner .my-sample-id[data-my-card] {
  flex: none;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--fill);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.06em;
}
@media (max-width: 760px) {
  .demo-page {
    padding: 20px max(14px, env(safe-area-inset-right)) 24px max(14px, env(safe-area-inset-left));
  }
}
@media (max-width: 600px) {
  .demo-page-inner {
    --card-radius: 16px;
    --card-padding: 20px;
  }
}

.demo-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.demo-view > .demo-tabs,
.demo-view > .demo-main {
  flex: 1;
  height: auto;
  min-height: 0;
}
.demo-view > .demo-top {
  flex: none;
}
</style>
