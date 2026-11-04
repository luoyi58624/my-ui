<script setup lang="ts">
import DemoExample from '../../../components/DemoExample.vue'
import { demoNavigationKey } from '../../../commons/navigation'
import { Icon } from '@my-ui/vue'
import { inject } from 'vue'
import { notifyKey } from '../../../commons/notify'

// #region toast
const notify = inject(notifyKey)!
const navigation = inject(demoNavigationKey, null)
// #endregion
// #region native-html
function openHtmlExample(event: MouseEvent) {
  if (!navigation) return
  event.preventDefault()
  void navigation.openPage('/html', { title: '原生 HTML 示例' }).catch((error) =>
    notify(error instanceof Error ? error.message : String(error))
  )
}
// #endregion
</script>

<template>
  <DemoExample
    name="native-html"
    source="pages/home/native-html/index.vue"
    setup="toast native-html"
    class="native-example"
    title="原生 HTML 示例"
    description="在独立页面体验直接使用 CSS 与 JavaScript 的组件。"
  >
    <a class="native-example-link" href="./native.html" @click="openHtmlExample">
      打开原生 HTML 示例
      <Icon name="arrow-right" />
    </a>
  </DemoExample>
</template>

<style scoped>
.native-example {
  margin-top: 24px;
}
.native-example-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  color: var(--primary);
  font-weight: var(--font-weight-action, 500);
}
.native-example-link svg {
  width: 18px;
  height: 18px;
}
.native-example-link:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 4px;
  border-radius: 6px;
}
</style>
