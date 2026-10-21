<script setup lang="ts">
import { CellGroup, Icon, ListRow, type Option } from '@my-ui/vue'

defineProps<{
  /** 示例的分享动作列表。 */
  options: Option[]
}>()
defineEmits<{
  /** 选择动作后由 API 内容构建器关闭面板。 */
  select: [item: Option]
}>()
</script>

<template>
  <CellGroup class="share-panel" :options="options" label="分享操作" @select="$emit('select', $event)">
    <template #item="{ item, row }"><ListRow v-bind="row" :title="item.label"><template v-if="item.icon" #leading><Icon :name="item.icon" /></template></ListRow></template>
  </CellGroup>
</template>

<style scoped>
.share-panel { --list-border: 0; --list-radius: 0; }
.share-panel :deep(.my-leading-content) { width: 20px; height: 20px; background: transparent; border-radius: 0; }
</style>
