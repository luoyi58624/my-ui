<script setup lang="ts">
import DemoCatalog from '../../components/DemoCatalog.vue'
import { demoGroups } from '../catalog'

defineProps<{
  /** 当前栏目是否可见，用于恢复目录焦点。 */
  active: boolean
}>()
</script>

<template>
  <DemoCatalog title="组件目录" :groups="demoGroups" :active="active" />
</template>
