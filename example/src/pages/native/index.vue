<script setup lang="ts">
import DemoCatalog from '../../components/DemoCatalog.vue'
import { nativeDemoGroups } from '../catalog'

defineProps<{
  /** 当前栏目是否可见，用于恢复目录焦点。 */
  active: boolean
}>()
</script>

<template>
  <DemoCatalog title="原生组件" :groups="nativeDemoGroups" :active="active" />
</template>
