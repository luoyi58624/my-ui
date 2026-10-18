<script setup lang="ts">
import { CellGroup, Icon, ListRow, type Option } from '../../vue'

defineProps<{
  /** 示例列表的选中值，数据由调用页面维护。 */
  modelValue: string | string[]
  /** 示例选择方式。 */
  mode: 'single' | 'multiple'
  /** 示例选择框位置，完全由此内容组件决定。 */
  position: 'leading' | 'trailing'
  /** 可选择的内容。 */
  options: Option[]
  /** 分组的可访问名称。 */
  label: string
}>()
defineEmits<{
  /** 把列表的新值同步到调用页面。 */
  'update:modelValue': [value: string | string[]]
  /** 返回被激活的项目，单选示例据此立即关闭。 */
  select: [item: Option]
}>()
</script>

<template>
  <CellGroup class="selection-panel" :model-value="modelValue" :mode="mode" :options="options" :label="label" @update:model-value="$emit('update:modelValue', $event)" @select="$emit('select', $event)">
    <template #item="{ item, selected, row }">
      <ListRow v-bind="row" class="selection-row" :class="{ selected }" :title="item.label" :description="item.description">
        <template v-if="position === 'leading'" #leading><span class="choice-mark" :class="[mode, { checked: selected }]" aria-hidden="true"><Icon v-if="mode === 'multiple' && selected" name="check" /></span></template>
        <template #trailing><span v-if="position === 'trailing'" class="choice-mark" :class="[mode, { checked: selected }]" aria-hidden="true"><Icon v-if="mode === 'multiple' && selected" name="check" /></span></template>
      </ListRow>
    </template>
  </CellGroup>
</template>

<style scoped>
.selection-panel { --list-border: 0; --list-radius: 0; }
.selection-row.selected { color: var(--primary); }
.selection-row :deep(.my-leading-content) { width: 22px; height: 22px; background: transparent; color: inherit; border-radius: 0; }
.choice-mark { display: inline-grid; place-items: center; flex-shrink: 0; width: 22px; height: 22px; border: 1.5px solid var(--text-secondary); border-radius: 6px; background: transparent; color: var(--primary); }
.choice-mark.single { border-radius: 50%; }
.choice-mark.checked { border-color: var(--primary); }
.choice-mark.single.checked { border-width: 6px; }
.choice-mark.multiple.checked { background: var(--primary); color: var(--primary-text); }
.choice-mark svg { width: 16px; height: 16px; stroke-width: 2.2; }
</style>
