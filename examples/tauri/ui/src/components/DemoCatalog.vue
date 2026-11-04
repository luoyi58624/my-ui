<script setup lang="ts">
import { inject, nextTick, ref, watch } from 'vue'
import { CellGroup, Icon, ListRow } from '@my-ui/vue'
import { demoNavigationKey } from '@demo/commons/navigation'
import type { DemoExample } from '@demo/pages/catalog'
import { demoLayoutKey } from '@demo/components/layoutContext'

const props = defineProps<{
  /** 目录标题。 */
  title: string
  /** 按用途分组的页面入口。 */
  groups: { title: string; items: DemoExample[] }[]
  /** 返回目录时恢复刚刚打开的入口焦点。 */
  active: boolean
}>()
const { openPage } = inject(demoNavigationKey)!
const layout = inject(demoLayoutKey)!
const root = ref<HTMLElement>()
let entry: HTMLElement | undefined

function open(item: DemoExample) {
  entry = root.value?.querySelector<HTMLElement>('[data-demo-link="' + item.id + '"]') ?? undefined
  void openPage(item.path ?? '/example/' + item.id, { title: item.title }).catch(layout.report)
}
watch(
  () => props.active,
  (shown) => {
    if (shown && entry) void nextTick(() => entry?.focus({ preventScroll: true }))
  }
)
</script>

<template>
  <div ref="root" class="demo-catalog">
    <div class="demo-intro">
      <h2>{{ title }}</h2>
    </div>
    <div class="demo-catalog-groups">
      <section
        v-for="group in groups"
        :key="group.title"
        class="demo-catalog-group"
        :aria-label="group.title"
      >
        <h3>
          {{ group.title }} <span>{{ group.items.length }}</span>
        </h3>
        <CellGroup :label="group.title">
          <ListRow
            v-for="item in group.items"
            :key="item.id"
            :data-demo-link="item.id"
            :data-showcase-entry="item.id === 'showcase' ? '' : undefined"
            :title="item.title"
            @click="open(item)"
          >
            <template #leading
              ><span class="demo-catalog-icon"><Icon :name="item.icon" /></span
            ></template>
          </ListRow>
        </CellGroup>
      </section>
    </div>
  </div>
</template>
